import React, { useRef, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import FieldLabel from '../../Common/FieldLabel';
import TagInput from './TagInput';
import { getFieldDescription } from '../../../constants/fieldDescriptions';
import formStyles from "../../../styles/FormStep.module.css";
import styles from "../../../styles/StepAmenitiesImages.module.css";

const StepAmenitiesImages = ({ formData, updateField }) => {
  const inputRef = useRef(null);
  const t = (k) => getFieldDescription(k, formData.category);

  const images = formData.images || [];

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles = files.filter(f => supportedTypes.includes(f.type));

    if (validFiles.length < files.length) {
      alert("Some files were rejected. Please use JPG, PNG, WEBP, or GIF formats only.");
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    updateField("images", [...images, ...newImages]);

    e.target.value = "";
  };

  const removeImage = (idx) => {
    const updated = [...images];

    // cleanup memory leak
    if (updated[idx]?.preview) {
      URL.revokeObjectURL(updated[idx].preview);
    }

    updated.splice(idx, 1);
    updateField("images", updated);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img?.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  return (
    <div className={formStyles.step}>
      <div className={formStyles.field}>
        <FieldLabel tooltip={t('amenities')}>Amenities</FieldLabel>
        <TagInput
          values={formData.amenities}
          onChange={(v) => updateField('amenities', v)}
          placeholder="e.g., Parking, AC, WiFi"
        />
      </div>

      <div className={formStyles.section}>
        <FieldLabel tooltip={t('images')}>
          <ImageIcon size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Images
        </FieldLabel>

        <div className={styles.dropzone}>
          <Upload size={28} className={styles.dropIcon} />
          <p>Drag & drop images, or browse</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif"
            multiple
            onChange={handleFiles}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className={formStyles.btn}
            onClick={() => inputRef.current?.click()}
          >
            Choose Images
          </button>
        </div>

        {/* ✅ PREVIEW GRID */}
        {images.length > 0 && (
          <div className={styles.grid}>
            {images.map((img, i) => {
              const previewUrl = typeof img === 'string' ? img : img.preview;
              const uniqueKey = typeof img === 'string' ? `${img}-${i}` : img.id || i;

              return (
                <div key={uniqueKey} className={styles.thumb}>
                  <img src={previewUrl} alt={`Upload ${i + 1}`} />

                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeImage(i)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepAmenitiesImages;