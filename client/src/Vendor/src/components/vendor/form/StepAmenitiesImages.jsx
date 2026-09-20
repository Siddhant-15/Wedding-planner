import React, {
  useRef,
  useEffect,
  useState,
} from "react";

import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Link2,
  Youtube,
  Video,
  Instagram,
  Globe,
  Plus,
  Star,
} from "lucide-react";

import FieldLabel from "../../Common/FieldLabel";
import TagInput from "./TagInput";

import { getFieldDescription } from "../../../constants/fieldDescriptions";

import formStyles from "../../../styles/FormStep.module.css";
import styles from "../../../styles/StepAmenitiesImages.module.css";

const MAX_IMAGES = 5;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const FieldError = ({ error, id }) =>
  error ? (
    <p
      id={id}
      className={formStyles.error}
      role="alert"
    >
      {error}
    </p>
  ) : null;

const StepAmenitiesImages = ({
  formData,
  updateField,
  errors = {},
}) => {
  const inputRef = useRef(null);

  const [localError, setLocalError] =
    useState("");

  const [mediaType, setMediaType] =
    useState("youtube");

  const [mediaUrl, setMediaUrl] =
    useState("");

  const t = (k) =>
    getFieldDescription(
      k,
      formData.category
    );

  const images = formData.images || [];

  const mediaLinks =
    formData.media_links || [];

  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);

      return [
        "http:",
        "https:",
      ].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  /**
   * Normalize an image so every image has:
   * - id
   * - file (for newly uploaded images)
   * - preview
   * - is_cover
   *
   * Existing backend images can still be strings.
   */
  const normalizeImage = (
    image,
    index,
    shouldBeCover = false
  ) => {
    if (typeof image === "string") {
      return {
        id: crypto.randomUUID(),
        url: image,
        preview: image,
        is_cover: shouldBeCover,
      };
    }

    return {
      ...image,
      is_cover:
        typeof image.is_cover ===
          "boolean"
          ? image.is_cover
          : shouldBeCover,
    };
  };

  const handleFiles = (e) => {
    setLocalError("");

    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const remainingSlots =
      MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setLocalError(
        `Maximum ${MAX_IMAGES} images allowed.`
      );

      e.target.value = "";
      return;
    }

    const filesToProcess =
      files.slice(0, remainingSlots);

    const validationErrors = [];

    if (
      files.length > remainingSlots
    ) {
      validationErrors.push(
        `Only ${remainingSlots} image(s) allowed.`
      );
    }

    const validFiles = [];

    filesToProcess.forEach(
      (file) => {
        // MIME validation
        if (
          !SUPPORTED_TYPES.includes(
            file.type
          )
        ) {
          validationErrors.push(
            `${file.name}: Unsupported format. Please use JPG, PNG, or WebP.`
          );

          return;
        }

        // File size validation
        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          validationErrors.push(
            `${file.name}: File size exceeds 5MB.`
          );

          return;
        }

        // Duplicate prevention
        const alreadyExists =
          images.some(
            (img) =>
              img.file?.name ===
              file.name &&
              img.file?.size ===
              file.size &&
              img.file
                ?.lastModified ===
              file.lastModified
          );

        if (alreadyExists) {
          validationErrors.push(
            `${file.name}: Duplicate image.`
          );

          return;
        }

        validFiles.push({
          id: crypto.randomUUID(),
          file,
          preview:
            URL.createObjectURL(
              file
            ),

          // If there are no existing images,
          // the first uploaded image becomes cover.
          is_cover:
            images.length === 0 &&
            validFiles.length === 0,
        });
      }
    );

    if (validationErrors.length) {
      setLocalError(
        validationErrors.join(" ")
      );
    }

    if (validFiles.length) {
      const existingImages =
        images.map(
          (image, index) =>
            normalizeImage(
              image,
              index
            )
        );

      const hasCover =
        existingImages.some(
          (image) =>
            image.is_cover === true
        );

      const newImages =
        [...existingImages];

      validFiles.forEach(
        (image) => {
          // If no cover exists, first new image becomes cover.
          if (!hasCover && !newImages.some(
            (img) =>
              img.is_cover === true
          )) {
            image.is_cover = true;
          }

          newImages.push(image);
        }
      );

      updateField(
        "images",
        newImages
      );
    }

    e.target.value = "";
  };

  /**
   * Remove image.
   *
   * If the removed image was the cover,
   * automatically make the first remaining
   * image the new cover.
   */
  const removeImage = (idx) => {
    const updated = [...images];

    const imageToRemove =
      updated[idx];

    if (
      typeof imageToRemove !==
      "string" &&
      imageToRemove?.preview &&
      imageToRemove?.file
    ) {
      URL.revokeObjectURL(
        imageToRemove.preview
      );
    }

    updated.splice(idx, 1);

    const normalized =
      updated.map(
        (image, index) =>
          normalizeImage(
            image,
            index
          )
      );

    // Ensure there is always a cover
    // if at least one image remains.
    if (
      normalized.length > 0 &&
      !normalized.some(
        (image) =>
          image.is_cover === true
      )
    ) {
      normalized[0].is_cover = true;
    }

    updateField(
      "images",
      normalized
    );
  };

  /**
   * Set one image as cover.
   * All other images automatically become non-cover.
   */
  const coverCount = images.filter(
    (img) =>
      typeof img !== "string" &&
      img?.is_cover === true
  ).length;

  const toggleCoverImage = (index) => {
    const updated = images.map(
      (image, imageIndex) => {
        const normalized = normalizeImage(
          image,
          imageIndex
        );

        if (imageIndex !== index) {
          return normalized;
        }

        const currentlyCover =
          normalized.is_cover === true;

        // Don't allow removing the final cover.
        if (
          currentlyCover &&
          coverCount === 1
        ) {
          setLocalError(
            "At least one cover image is required."
          );
          return normalized;
        }

        // Maximum 5 covers.
        if (
          !currentlyCover &&
          coverCount >= MAX_IMAGES
        ) {
          setLocalError(
            `Maximum ${MAX_IMAGES} cover images allowed.`
          );
          return normalized;
        }

        return {
          ...normalized,
          is_cover: !currentlyCover,
        };
      }
    );

    setLocalError("");
    updateField("images", updated);
  };

  const handleAddMediaLink = () => {
    setLocalError("");

    const trimmedUrl =
      mediaUrl.trim();

    if (!trimmedUrl) {
      return;
    }

    if (
      trimmedUrl.length > 2000
    ) {
      setLocalError(
        "URL is too long."
      );

      return;
    }

    if (
      !isValidUrl(trimmedUrl)
    ) {
      setLocalError(
        "Please enter a valid URL."
      );

      return;
    }

    const newLink = {
      id: crypto.randomUUID(),
      type: mediaType,
      url: trimmedUrl,
    };

    updateField(
      "media_links",
      [
        ...mediaLinks,
        newLink,
      ]
    );

    setMediaUrl("");
  };

  const removeMediaLink = (
    id
  ) => {
    updateField(
      "media_links",
      mediaLinks.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const getMediaIcon = (
    type
  ) => {
    switch (type) {
      case "youtube":
        return (
          <Youtube size={16} />
        );

      case "video":
        return (
          <Video size={16} />
        );

      case "instagram":
        return (
          <Instagram
            size={16}
          />
        );

      case "image":
        return (
          <ImageIcon
            size={16}
          />
        );

      default:
        return (
          <Globe size={16} />
        );
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (
          typeof img !== "string" &&
          img?.preview &&
          img?.file
        ) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
    // Cleanup only when this component unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={formStyles.step}
    >
      {/* AMENITIES */}
      <div
        className={
          formStyles.field
        }
      >
        <FieldLabel
          tooltip={t(
            "amenities"
          )}
        >
          Amenities
        </FieldLabel>

        <TagInput
          values={
            formData.amenities
          }
          onChange={(v) =>
            updateField(
              "amenities",
              v
            )
          }
          placeholder="e.g., Parking, AC, WiFi"
        />
      </div>

      {/* IMAGE UPLOAD */}
      <div
        className={
          formStyles.section
        }
      >
        <FieldLabel
          tooltip={t("images")}
          required
        >
          <ImageIcon
            size={14}
            style={{
              marginRight: 4,
              verticalAlign:
                "-2px",
            }}
          />

          Images
        </FieldLabel>

        <div className={styles.imageMeta}>
          <p className={styles.helper}>
            Upload up to {MAX_IMAGES} images. Select the
            images you want to use as cover images.
          </p>

          <div className={styles.imageCounters}>
            <span>
              {images.length}/{MAX_IMAGES} images
            </span>

            <span>
              {coverCount}/{MAX_IMAGES} cover images
            </span>
          </div>
        </div>

        <div
          className={`${styles.dropzone} ${errors.images
            ? formStyles.inputError
            : ""
            }`}
          aria-invalid={
            errors.images
              ? "true"
              : undefined
          }
          aria-describedby={
            errors.images
              ? "images-error"
              : undefined
          }
        >
          <Upload
            size={28}
            className={
              styles.dropIcon
            }
          />

          <p>
            Drag & drop images,
            or browse
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={
              handleFiles
            }
            hidden
          />

          <button
            type="button"
            className={
              formStyles.btn
            }
            disabled={
              images.length >=
              MAX_IMAGES
            }
            onClick={() =>
              inputRef.current?.click()
            }
          >
            {images.length >=
              MAX_IMAGES
              ? "Upload Limit Reached"
              : "Choose Images"}
          </button>
        </div>

        {/* REQUIRED IMAGE ERROR */}
        <FieldError
          error={errors.images}
          id="images-error"
        />

        {/* LOCAL UPLOAD ERROR */}
        {localError && (
          <p
            className={
              formStyles.error
            }
            role="alert"
          >
            {localError}
          </p>
        )}

        {/* IMAGE GRID */}
        {images.length > 0 && (
          <div
            className={
              styles.grid
            }
          >
            {images.map(
              (img, i) => {
                const previewUrl =
                  typeof img ===
                    "string"
                    ? img
                    : img.preview ||
                    img.url;

                const uniqueKey =
                  typeof img ===
                    "string"
                    ? `${img}-${i}`
                    : img.id ||
                    i;

                const isCover =
                  typeof img !==
                  "string" &&
                  img.is_cover ===
                  true;

                return (
                  <div
                    key={
                      uniqueKey
                    }
                    className={
                      styles.thumb
                    }
                  >
                    <img
                      loading="lazy"
                      src={
                        previewUrl
                      }
                      alt={`Upload ${i + 1
                        }`}
                    />

                    {/* COVER BADGE */}
                    {isCover && (
                      <span
                        className={
                          styles.coverBadge
                        }
                      >
                        <Star
                          size={11}
                          fill="currentColor"
                        />
                        Cover
                      </span>
                    )}

                    {/* REMOVE */}
                    <button
                      type="button"
                      aria-label="Remove image"
                      className={
                        styles.remove
                      }
                      onClick={() =>
                        removeImage(
                          i
                        )
                      }
                    >
                      <Trash2
                        size={
                          14
                        }
                      />
                    </button>

                    {/* COVER CHECKBOX */}
                    <label className={styles.coverCheckbox}>
                      <input
                        type="checkbox"
                        checked={isCover}
                        disabled={
                          !isCover &&
                          coverCount >= MAX_IMAGES
                        }
                        onChange={() =>
                          toggleCoverImage(i)
                        }
                      />

                      <Star
                        size={12}
                        fill={
                          isCover
                            ? "currentColor"
                            : "none"
                        }
                      />

                      <span>Cover image</span>
                    </label>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* COVER VALIDATION */}
        {images.length > 0 &&
          !images.some(
            (img) =>
              typeof img !==
              "string" &&
              img.is_cover ===
              true
          ) && (
            <p
              className={
                formStyles.error
              }
              role="alert"
            >
              At least one image
              must be selected as
              the cover image.
            </p>
          )}
      </div>

      {/* EXTERNAL MEDIA */}
      <div
        className={
          formStyles.section
        }
      >
        <div
          className={
            styles.mediaHeader
          }
        >
          <FieldLabel>
            <Link2
              size={14}
              style={{
                marginRight: 4,
                verticalAlign:
                  "-2px",
              }}
            />

            External Media
            Links
          </FieldLabel>

          <p
            className={
              styles.mediaHelper
            }
          >
            Add YouTube,
            Instagram, video, or
            portfolio links
          </p>
        </div>

        {/* INPUT BAR */}
        <div
          className={
            styles.mediaBar
          }
        >
          <select
            value={
              mediaType
            }
            onChange={(e) =>
              setMediaType(
                e.target.value
              )
            }
            className={
              styles.mediaSelect
            }
          >
            <option value="youtube">
              YouTube
            </option>

            <option value="video">
              Video
            </option>

            <option value="image">
              Image
            </option>

            <option value="instagram">
              Instagram
            </option>

            <option value="other">
              Other
            </option>
          </select>

          <input
            type="url"
            value={mediaUrl}
            onChange={(e) =>
              setMediaUrl(
                e.target.value
              )
            }
            placeholder="https://example.com"
            className={
              styles.mediaInput
            }
          />

          <button
            type="button"
            className={
              styles.mediaAddBtn
            }
            onClick={
              handleAddMediaLink
            }
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>

        <FieldError
          error={
            errors.media_links
          }
          id="media-links-error"
        />

        {/* LINK LIST */}
        {mediaLinks.length > 0 && (
          <div
            className={
              styles.mediaGrid
            }
          >
            {mediaLinks.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className={
                    styles.mediaCard
                  }
                >
                  <div
                    className={
                      styles.mediaCardLeft
                    }
                  >
                    <div
                      className={
                        styles.mediaIcon
                      }
                    >
                      {getMediaIcon(
                        item.type
                      )}
                    </div>

                    <div
                      className={
                        styles.mediaInfo
                      }
                    >
                      <span
                        className={
                          styles.mediaType
                        }
                      >
                        {
                          item.type
                        }
                      </span>

                      <a
                        href={
                          item.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          styles.mediaUrl
                        }
                      >
                        {
                          item.url
                        }
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Remove media link"
                    className={
                      styles.mediaRemoveBtn
                    }
                    onClick={() =>
                      removeMediaLink(
                        item.id
                      )
                    }
                  >
                    <Trash2
                      size={
                        15
                      }
                    />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepAmenitiesImages;
