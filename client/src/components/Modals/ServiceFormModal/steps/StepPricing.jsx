// src/components/services/ServiceFormModal/steps/StepPricing.jsx

import React from 'react';
import { DollarSign, Trash2 } from 'lucide-react';
import { serviceTypes, pricingTypes } from '../formConstants';
import styles from '../../../../styles/ServiceForm.module.css';

const StepPricing = ({ formData, handleInputChange, handleVariantChange, handleAddVariant, handleRemoveVariant }) => {
    return (
        <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>Service Category *</label>
                <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={styles.input}
                    disabled={!!formData.id} // disable if editing
                >
                    <option value="">Select category</option>
                    {serviceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.variantsHeader}>
                <h3 className={styles.sectionTitle}>Packages / Pricing</h3>
                <button type="button" onClick={handleAddVariant} className={styles.addBtn}>+ Add Package</button>
            </div>

            <div className={styles.variantsGrid}>
                {formData.variants.map((variant, index) => (
                    <div key={index} className={`${styles.variantCard} ${variant.is_default ? styles.defaultCard : ""}`}>
                        <div className={styles.variantCardHeader}>
                            <h4>{variant.variant_name}</h4>
                            <div>
                                {variant.is_default && <span className={styles.defaultBadge}>Default</span>}
                                <button type="button" onClick={() => handleVariantChange(index, "is_default", true)}>Set Default</button>
                                <button type="button" onClick={() => handleRemoveVariant(index)}><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Package Name *</label>
                            <input
                                type="text"
                                value={variant.variant_name}
                                onChange={(e) => handleVariantChange(index, "variant_name", e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.variantPriceRow}>
                            <div className={styles.fieldGroup}>
                                <label>Pricing Type *</label>
                                <select
                                    value={variant.pricing_type}
                                    onChange={(e) => handleVariantChange(index, "pricing_type", e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="">Select</option>
                                    {pricingTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Price *</label>
                                <div className={styles.inputWithIcon}>
                                    <DollarSign size={16} />
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                        className={styles.input}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Inclusions (comma separated)</label>
                            <input
                                type="text"
                                value={variant.inclusions}
                                onChange={(e) => handleVariantChange(index, "inclusions", e.target.value)}
                                placeholder="e.g., 5 Hours, Edited Photos"
                                className={styles.input}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepPricing;