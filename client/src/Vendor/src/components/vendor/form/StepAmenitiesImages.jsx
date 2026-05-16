// StepAmenitiesImages.jsx

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

const StepAmenitiesImages = ({
  formData,
  updateField,
}) => {
  const inputRef = useRef(null);

  const t = (k) =>
    getFieldDescription(
      k,
      formData.category
    );

  const images = formData.images || [];

  const mediaLinks =
    formData.media_links || [];

  const [mediaType, setMediaType] =
    useState("youtube");

  const [mediaUrl, setMediaUrl] =
    useState("");

  const handleFiles = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const validFiles = files.filter(
      (f) =>
        supportedTypes.includes(f.type)
    );

    if (
      validFiles.length < files.length
    ) {
      alert(
        "Some files were rejected. Please use JPG, PNG, WEBP, or GIF formats only."
      );
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const newImages = validFiles.map(
      (file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        preview:
          URL.createObjectURL(file),

        media_type: "image",

        is_cover: false,
      })
    );

    updateField("images", [
      ...images,
      ...newImages,
    ]);

    e.target.value = "";
  };

  const removeImage = (idx) => {
    const updated = [...images];

    if (updated[idx]?.preview) {
      URL.revokeObjectURL(
        updated[idx].preview
      );
    }

    updated.splice(idx, 1);

    updateField("images", updated);
  };

  const toggleCover = (idx) => {
    const updated = [...images];

    const currentCoverCount =
      updated.filter(
        (img) => img.is_cover
      ).length;

    if (
      !updated[idx].is_cover &&
      currentCoverCount >= 3
    ) {
      alert(
        "You can select maximum 3 cover images."
      );

      return;
    }

    updated[idx] = {
      ...updated[idx],

      is_cover:
        !updated[idx].is_cover,
    };

    updateField("images", updated);
  };

  const handleAddMediaLink = () => {
    if (!mediaUrl.trim()) return;

    const newLink = {
      id: Date.now(),

      type: mediaType,

      url: mediaUrl.trim(),

      is_cover: false,
    };

    updateField("media_links", [
      ...mediaLinks,
      newLink,
    ]);

    setMediaUrl("");
  };

  const removeMediaLink = (id) => {
    updateField(
      "media_links",
      mediaLinks.filter(
        (item) => item.id !== id
      )
    );
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case "youtube":
        return <Youtube size={16} />;

      case "video":
        return <Video size={16} />;

      case "instagram":
        return (
          <Instagram size={16} />
        );

      case "image":
        return (
          <ImageIcon size={16} />
        );

      default:
        return <Globe size={16} />;
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img?.preview) {
          URL.revokeObjectURL(
            img.preview
          );
        }
      });
    };
  }, []);

  return (
    <div className={formStyles.step}>
      {/* AMENITIES */}
      <div className={formStyles.field}>
        <FieldLabel
          tooltip={t("amenities")}
        >
          Amenities
        </FieldLabel>

        <TagInput
          values={formData.amenities}
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
      <div className={formStyles.section}>
        <FieldLabel
          tooltip={t("images")}
        >
          <ImageIcon
            size={14}
            style={{
              marginRight: 4,
              verticalAlign: "-2px",
            }}
          />

          Images
        </FieldLabel>

        <div className={styles.dropzone}>
          <Upload
            size={30}
            className={styles.dropIcon}
          />

          <p>
            Drag & drop images or browse
            from your device
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif"
            multiple
            onChange={handleFiles}
            style={{
              display: "none",
            }}
          />

          <button
            type="button"
            className={formStyles.btn}
            onClick={() =>
              inputRef.current?.click()
            }
          >
            Choose Images
          </button>
        </div>

        {/* IMAGE GRID */}
        {images.length > 0 && (
          <div className={styles.grid}>
            {images.map((img, i) => {
              const previewUrl =
                typeof img === "string"
                  ? img
                  : img.preview;

              const uniqueKey =
                typeof img === "string"
                  ? `${img}-${i}`
                  : img.id || i;

              return (
                <div
                  key={uniqueKey}
                  className={styles.thumb}
                >
                  <img
                    src={previewUrl}
                    alt={`Upload ${i + 1}`}
                  />

                  {/* COVER CHECKBOX */}
                  <label
                    className={
                      styles.coverCheck
                    }
                  >
                    <input
                      type="checkbox"
                      checked={
                        !!img.is_cover
                      }
                      onChange={() =>
                        toggleCover(i)
                      }
                    />

                    <span>
                      Cover
                    </span>
                  </label>

                  <button
                    type="button"
                    className={
                      styles.remove
                    }
                    onClick={() =>
                      removeImage(i)
                    }
                  >
                    <Trash2
                      size={14}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EXTERNAL MEDIA */}
      <div className={formStyles.section}>
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

        <div
          className={styles.mediaInputs}
        >
          <select
            value={mediaType}
            onChange={(e) =>
              setMediaType(
                e.target.value
              )
            }
            className={styles.select}
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
            placeholder="Paste media URL"
            className={
              styles.linkInput
            }
          />

          <button
            type="button"
            onClick={
              handleAddMediaLink
            }
            className={
              styles.addBtn
            }
          >
            <Plus size={15} />
            Add
          </button>
        </div>

        {mediaLinks.length > 0 && (
          <div
            className={styles.linkList}
          >
            {mediaLinks.map(
              (item) => (
                <div
                  key={item.id}
                  className={
                    styles.linkCard
                  }
                >
                  <div
                    className={
                      styles.linkContent
                    }
                  >
                    <div
                      className={
                        styles.linkType
                      }
                    >
                      {getMediaIcon(
                        item.type
                      )}

                      <span>
                        {item.type}
                      </span>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        styles.linkUrl
                      }
                    >
                      {item.url}
                    </a>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.removeLink
                    }
                    onClick={() =>
                      removeMediaLink(
                        item.id
                      )
                    }
                  >
                    <Trash2
                      size={14}
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