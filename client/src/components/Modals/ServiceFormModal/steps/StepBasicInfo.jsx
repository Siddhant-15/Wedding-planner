// src/components/services/ServiceFormModal/steps/StepBasicInfo.jsx

import React from 'react';
import { MapPin, Tag } from 'lucide-react';
import styles from '../../../../styles/ServiceForm.module.css';

const StepBasicInfo = ({ formData, handleInputChange, handleGeoChange, newTag, setNewTag }) => {
    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            handleInputChange("tags", [...formData.tags, newTag.trim()]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tag) => {
        handleInputChange("tags", formData.tags.filter(t => t !== tag));
    };

    return (
        <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Service Title *</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Royal Wedding Palace"
                    className={styles.input}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Description *</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your service in detail..."
                    rows={4}
                    className={styles.textarea}
                />
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    <Tag className={styles.inlineIcon} /> Tags
                </label>
                <div className={styles.listInputRow}>
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className={styles.input}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    />
                    <button type="button" onClick={handleAddTag} className={styles.addBtn}>Add</button>
                </div>
                <div className={styles.listItems}>
                    {formData.tags.map((tag) => (
                        <span key={tag} className={styles.badge}>
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.removeBtn}>
                                <span>×</span>
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <MapPin className={styles.inlineIcon} /> Location Details
                </h3>
                <div className={styles.grid}>
                    <input type="text" value={formData.address_line1} onChange={(e) => handleInputChange("address_line1", e.target.value)} placeholder="Address Line 1" className={styles.input} />
                    <input type="text" value={formData.address_line2} onChange={(e) => handleInputChange("address_line2", e.target.value)} placeholder="Address Line 2" className={styles.input} />
                    <input type="text" value={formData.area} onChange={(e) => handleInputChange("area", e.target.value)} placeholder="Area" className={styles.input} />
                    <input type="text" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} placeholder="City *" className={styles.input} required />
                    <input type="text" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} placeholder="State *" className={styles.input} required />
                    <input type="text" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} placeholder="Country *" className={styles.input} />
                    <input type="text" value={formData.pincode} onChange={(e) => handleInputChange("pincode", e.target.value)} placeholder="Pincode *" className={styles.input} required />
                </div>

                <div className={styles.geoGroup}>
                    <input
                        type="number"
                        value={formData.geo_point.lat}
                        onChange={(e) => handleGeoChange("lat", e.target.value)}
                        placeholder="Latitude"
                        className={styles.input}
                    />
                    <input
                        type="number"
                        value={formData.geo_point.lon}
                        onChange={(e) => handleGeoChange("lon", e.target.value)}
                        placeholder="Longitude"
                        className={styles.input}
                    />
                </div>
            </div>
        </div>
    );
};

export default StepBasicInfo;