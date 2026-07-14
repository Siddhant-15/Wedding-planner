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
} from "lucide-react";

import FieldLabel from "../../Common/FieldLabel";
import TagInput from "./TagInput";

import { getFieldDescription } from "../../../constants/fieldDescriptions";

import formStyles from "../../../styles/FormStep.module.css";
import styles from "../../../styles/StepAmenitiesImages.module.css";

const MAX_IMAGES = 5;

const MAX_FILE_SIZE =
  5 * 1024 * 1024; // 5MB

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const StepAmenitiesImages = ({
  formData,
  updateField,
}) => {
  const inputRef = useRef(null);

  const [error, setError] =
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

  const handleFiles = (e) => {
    setError("");

    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const remainingSlots =
      MAX_IMAGES - images.length;

    const filesToProcess =
      files.slice(0, remainingSlots);

    if (
      files.length > remainingSlots
    ) {
      setError(
        `Only ${remainingSlots} image(s) allowed.`
      );
    }

    const validFiles = [];

    const errors = [];

    filesToProcess.forEach(
      (file) => {
        // MIME validation
        if (
          !SUPPORTED_TYPES.includes(
            file.type
          )
        ) {
          errors.push(
            `${file.name}: Unsupported format.`
          );

          return;
        }

        // File size validation
        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          errors.push(
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
          errors.push(
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
        });
      }
    );

    if (errors.length) {
      setError(errors.join(" "));
    }

    if (validFiles.length) {
      updateField("images", [
        ...images,
        ...validFiles,
      ]);
    }

    e.target.value = "";
  };

  const removeImage = (idx) => {
    const updated = [...images];

    const imageToRemove =
      updated[idx];

    if (
      typeof imageToRemove !==
      "string" &&
      imageToRemove?.preview
    ) {
      URL.revokeObjectURL(
        imageToRemove.preview
      );
    }

    updated.splice(idx, 1);

    updateField("images", updated);
  };

  const handleAddMediaLink = () => {
    setError("");

    const trimmedUrl =
      mediaUrl.trim();

    if (!trimmedUrl) return;

    if (
      trimmedUrl.length > 2000
    ) {
      setError(
        "URL is too long."
      );

      return;
    }

    if (
      !isValidUrl(trimmedUrl)
    ) {
      setError(
        "Please enter a valid URL."
      );

      return;
    }

    const newLink = {
      id: crypto.randomUUID(),
      type: mediaType,
      url: trimmedUrl,
    };

    updateField("media_links", [
      ...mediaLinks,
      newLink,
    ]);

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
          typeof img !==
          "string" &&
          img?.preview
        ) {
          URL.revokeObjectURL(
            img.preview
          );
        }
      });
    };
  }, [images]);

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
          tooltip={t(
            "images"
          )}
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

        <p
          className={
            styles.helper
          }
        >
          {images.length}/
          {MAX_IMAGES} images
          uploaded
        </p>

        <div
          className={
            styles.dropzone
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

        {error && (
          <p
            className={
              styles.error
            }
          >
            {error}
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
                    : img.preview;

                const uniqueKey =
                  typeof img ===
                    "string"
                    ? `${img}-${i}`
                    : img.id ||
                    i;

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
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* EXTERNAL MEDIA */}
      <div className={formStyles.section}>
        <div className={styles.mediaHeader}>
          <FieldLabel>
            <Link2
              size={14}
              style={{
                marginRight: 4,
                verticalAlign: "-2px",
              }}
            />
            External Media Links
          </FieldLabel>

          <p className={styles.mediaHelper}>
            Add YouTube, Instagram, video, or portfolio links
          </p>
        </div>

        {/* INPUT BAR */}
        <div className={styles.mediaBar}>
          <select
            value={mediaType}
            onChange={(e) =>
              setMediaType(e.target.value)
            }
            className={styles.mediaSelect}
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
              setMediaUrl(e.target.value)
            }
            placeholder="https://example.com"
            className={styles.mediaInput}
          />

          <button
            type="button"
            className={styles.mediaAddBtn}
            onClick={handleAddMediaLink}
          >
            <Plus size={15} />
            <span>Add</span>
          </button>
        </div>

        {/* LINK LIST */}
        {mediaLinks.length > 0 && (
          <div className={styles.mediaGrid}>
            {mediaLinks.map((item) => (
              <div
                key={item.id}
                className={styles.mediaCard}
              >
                <div className={styles.mediaCardLeft}>
                  <div className={styles.mediaIcon}>
                    {getMediaIcon(item.type)}
                  </div>

                  <div className={styles.mediaInfo}>
                    <span className={styles.mediaType}>
                      {item.type}
                    </span>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mediaUrl}
                    >
                      {item.url}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Remove media link"
                  className={styles.mediaRemoveBtn}
                  onClick={() =>
                    removeMediaLink(item.id)
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepAmenitiesImages;