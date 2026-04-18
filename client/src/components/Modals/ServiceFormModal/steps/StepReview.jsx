// src/components/services/ServiceFormModal/steps/StepReview.jsx

import React from 'react';
import { Edit2 } from 'lucide-react';
import {
    serviceTypes,
    pricingTypes,
    hallTypes,
    indoorOutdoorOptions,
    policyOptions,
    alcoholOptions,
    serviceStyles,
    packageModals
} from '../formConstants';
import styles from '../../../../styles/ServiceForm.module.css';

const StepReview = ({ formData, setCurrentStep, previewUrls }) => {
    const handleEdit = (step) => {
        setCurrentStep(step);
    };

    return (
        <div className={styles.stepContent}>
            {/* Basic Info */}
            <div className={styles.reviewSection}>
                <div className={styles.sectionHeader}>
                    <h3>Basic Info</h3>
                    <button className={styles.editBtn} onClick={() => handleEdit(0)}>
                        <Edit2 size={16} /> Edit
                    </button>
                </div>
                <p><strong>Title:</strong> {formData.title || "N/A"}</p>
                <p><strong>Description:</strong> {formData.description || "N/A"}</p>
                <p><strong>Tags:</strong> {formData.tags.join(", ") || "None"}</p>
                <p><strong>Location:</strong> {formData.address_line1} {formData.address_line2}, {formData.area}, {formData.city}, {formData.state} - {formData.pincode}</p>
            </div>

            {/* Pricing */}
            <div className={styles.reviewSection}>
                <div className={styles.sectionHeader}>
                    <h3>Packages & Pricing</h3>
                    <button className={styles.editBtn} onClick={() => handleEdit(1)}>
                        <Edit2 size={16} /> Edit
                    </button>
                </div>
                <p><strong>Category:</strong> {serviceTypes.find(t => t.value === formData.category)?.label || "N/A"}</p>
                <div className={styles.reviewVariants}>
                    {formData.variants.map((v, i) => (
                        <div key={i} className={styles.reviewVariantCard}>
                            <h4>{v.variant_name} {v.is_default && "(Default)"}</h4>
                            <p>Type: {pricingTypes.find(t => t.value === v.pricing_type)?.label || v.pricing_type}</p>
                            <p>Price: ₹{v.price}</p>
                            <p>Inclusions: {v.inclusions || "None"}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Specific Details */}
            <div className={styles.reviewSection}>
                <div className={styles.sectionHeader}>
                    <h3>Specific Details</h3>
                    <button className={styles.editBtn} onClick={() => handleEdit(2)}>
                        <Edit2 size={16} /> Edit
                    </button>
                </div>
                {/* You can expand this with category-specific review similar to your original renderSpecificReview */}
                <p>Check specific details in previous step for full preview.</p>
            </div>

            {/* Amenities & Images */}
            <div className={styles.reviewSection}>
                <div className={styles.sectionHeader}>
                    <h3>Amenities & Images</h3>
                    <button className={styles.editBtn} onClick={() => handleEdit(3)}>
                        <Edit2 size={16} /> Edit
                    </button>
                </div>
                <p><strong>Amenities:</strong> {formData.amenities.join(", ") || "None"}</p>
                <p><strong>Images:</strong> {previewUrls?.length || 0} uploaded</p>
            </div>
        </div>
    );
};

export default StepReview;