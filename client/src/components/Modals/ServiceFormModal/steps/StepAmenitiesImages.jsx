// src/components/services/ServiceFormModal/steps/StepAmenitiesImages.jsx

import React from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { handleAddListItem, handleRemoveListItem } from '../formHelpers';
import styles from '../../../../styles/ServiceForm.module.css';

const StepAmenitiesImages = ({
    formData,
    handleInputChange,
    newAmenity,
    setNewAmenity,
    handleImageChange,
    handleRemoveImage,
    previewUrls
}) => {
    const handleAddAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            handleInputChange("amenities", [...formData.amenities, newAmenity.trim()]); 
            setNewAmenity("");
        }
    };

    const handleRemoveAmenity = (amenity) => {
        handleInputChange("amenities", formData.amenities.filter(a => a !== amenity));
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Amenities</label>
                <div className={styles.listInputRow}>
                    <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add amenity (e.g., Parking, AC, WiFi)"
                        className={styles.input}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
                    />
                    <button type="button" onClick={handleAddAmenity} className={styles.addBtn}>Add</button>
                </div>
                <div className={styles.listItems}>
                    {formData.amenities.map((amenity) => (
                        <span key={amenity} className={styles.badge}>
                            {amenity}
                            <button type="button" onClick={() => handleRemoveAmenity(amenity)} className={styles.removeBtn}>×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <ImageIcon className={styles.inlineIcon} /> Images
                </h3>
                <div className={styles.uploadBox}>
                    <Upload className={styles.uploadIcon} />
                    <p>Drag and drop images here, or click to browse</p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className={styles.hiddenInput}
                        id="imageUpload"
                    />
                    <button
                        type="button"
                        onClick={() => document.getElementById("imageUpload").click()}
                        className={styles.chooseBtn}
                    >
                        Choose Images
                    </button>
                </div>

                {previewUrls.length > 0 && (
                    <div className={styles.previewGrid}>
                        {previewUrls.map((url, index) => (
                            <div key={index} className={styles.previewItem}>
                                <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImg} />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className={styles.removeImageBtn}
                                >
                                    <Trash2 size={16} />
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