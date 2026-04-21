// src/components/services/ServiceFormModal/steps/StepPricing.jsx

import React from 'react';
import { DollarSign, Trash2, Plus, Camera, Video } from 'lucide-react';
import { serviceTypes, pricingTypes } from '../formConstants';
import styles from '../../../../styles/ServiceForm.module.css';

const venuePricingModes = [
    { value: "per_plate", label: "Per Plate (with Catering)" },
    { value: "rental", label: "Rental Only" },
    { value: "both", label: "Rental + Catering" },
];

// Pricing types specific to photography
const photographyPricingTypes = [
    { value: "per_day", label: "Per Day" },
    { value: "package", label: "Package (Fixed)" },
    { value: "half_day", label: "Half Day" },
    { value: "per_hour", label: "Per Hour" },
];

const StepPricing = ({
    formData,
    handleInputChange,
    handleVariantChange,
    handleAddVariant,
    handleRemoveVariant
}) => {
    const isCatering = formData.category === 'catering';
    const isPhotography = formData.category === 'photography';
    const isVenue = formData.category === 'venue';

    const activePricingTypes = isPhotography ? photographyPricingTypes : pricingTypes;

    return (
        <div className={styles.stepContent}>
            {/* Service Category */}
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    Service Category <span className={styles.required}>*</span>
                </label>
                <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className={styles.select}
                    disabled={!!formData.id}
                >
                    <option value="">Select a category</option>
                    {serviceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>


            {/* Packages Section Header */}
            <div className={styles.sectionHeader}>
                <div>
                    <h3 className={styles.sectionTitle}>Pricing Packages</h3>
                    <p className={styles.sectionSubtitle}>
                        Create different packages for your service
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAddVariant}
                    className={styles.addPackageBtn}
                >
                    <Plus size={18} />
                    Add Package
                </button>
            </div>

            {/* Variants */}
            <div className={styles.variantsContainer}>
                {formData.variants.map((variant, index) => (
                    <div
                        key={index}
                        className={`${styles.variantCard} ${variant.is_default ? styles.defaultVariant : ''}`}
                    >
                        {/* Card Header */}
                        <div className={styles.variantHeader}>
                            <div className={styles.variantTitle}>
                                <input
                                    type="text"
                                    value={variant.variant_name}
                                    onChange={(e) =>
                                        handleVariantChange(index, "variant_name", e.target.value)
                                    }
                                    placeholder="Package Name (e.g. Basic, Premium, Wedding)"
                                    className={styles.variantNameInput}
                                />
                                {variant.is_default && (
                                    <span className={styles.defaultBadge}>Default Package</span>
                                )}
                            </div>

                            <div className={styles.variantActions}>
                                {!variant.is_default && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleVariantChange(index, "is_default", true)
                                        }
                                        className={styles.setDefaultBtn}
                                    >
                                        Set as Default
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(index)}
                                    className={styles.removeBtn}
                                    aria-label="Remove package"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Pricing Type */}
                        {!isVenue && (
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Pricing Type <span className={styles.required}>*</span>
                                </label>
                                <select
                                    value={variant.pricing_type}
                                    onChange={(e) =>
                                        handleVariantChange(index, "pricing_type", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    <option value="">Select pricing type</option>
                                    {activePricingTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isVenue && (
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Pricing Type <span className={styles.required}>*</span>
                                </label>
                                <select
                                    value={variant.pricing_mode || ""}
                                    onChange={(e) =>
                                        handleVariantChange(index, "pricing_mode", e.target.value)
                                    }
                                    className={styles.select}
                                >
                                    <option value="">Select pricing type</option>
                                    {venuePricingModes.map((mode) => (
                                        <option key={mode.value} value={mode.value}>
                                            {mode.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(isCatering || isVenue) && (
                            <div className={styles.toggleRow}>
                                <label>Veg Only</label>
                                <input
                                    type="checkbox"
                                    checked={variant.is_veg_only || false}
                                    disabled={isVenue && variant.pricing_mode === "rental"}
                                    onChange={(e) =>
                                        handleVariantChange(index, "is_veg_only", e.target.checked)
                                    }
                                />
                            </div>
                        )}

                        {/* ── Photography: Videography Toggle ── */}
                        {isPhotography && (
                            <div className={styles.photoVideoBanner}>
                                <div className={styles.photoVideoBannerLeft}>
                                    <div className={styles.photoVideoBannerIcons}>
                                        <Camera size={20} />
                                        {formData.videography_available && <Video size={20} />}
                                    </div>
                                    <div>
                                        <p className={styles.photoVideoBannerTitle}>
                                            {formData.videography_available
                                                ? "Photography + Videography"
                                                : "Photography Only"}
                                        </p>
                                        <p className={styles.photoVideoBannerDesc}>
                                            {formData.videography_available
                                                ? "Packages will include separate pricing for photos-only & photos+video"
                                                : "Toggle on to offer videography add-on pricing"}
                                        </p>
                                    </div>
                                </div>
                                <label className={styles.toggleSwitch}>
                                    <input
                                        type="checkbox"
                                        checked={!!formData.videography_available}
                                        onChange={(e) =>
                                            handleInputChange("videography_available", e.target.checked)
                                        }
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>
                        )}

                        {/* Pricing Fields */}
                        {isCatering ? (
                            /* ── Catering Pricing ── */
                            <div className={styles.pricingGrid}>
                                {/* Veg */}
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Veg Price (per plate) *</label>
                                    <input
                                        type="number"
                                        value={variant.veg_price || ""}
                                        onChange={(e) =>
                                            handleVariantChange(index, "veg_price", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Non-Veg */}
                                {!variant.is_veg_only && (
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>Non-Veg Price (per plate) *</label>
                                        <input
                                            type="number"
                                            value={variant.non_veg_price || ""}
                                            onChange={(e) =>
                                                handleVariantChange(index, "non_veg_price", e.target.value)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        ) : isVenue ? (
                            /* ── Venue Pricing ── */
                            <>
                                {/* PER PLATE */}
                                {(variant.pricing_mode === "per_plate" ||
                                    variant.pricing_mode === "both") && (
                                        <div className={styles.pricingGrid}>
                                            <div className={styles.fieldGroup}>
                                                <label className={styles.label}>Veg Price (per plate)</label>
                                                <input
                                                    type="number"
                                                    value={variant.veg_price || ""}
                                                    onChange={(e) =>
                                                        handleVariantChange(index, "veg_price", e.target.value)
                                                    }
                                                />
                                            </div>

                                            {!variant.is_veg_only && (
                                                <div className={styles.fieldGroup}>
                                                    <label className={styles.label}>Non-Veg Price (per plate)</label>
                                                    <input
                                                        type="number"
                                                        value={variant.non_veg_price || ""}
                                                        onChange={(e) =>
                                                            handleVariantChange(index, "non_veg_price", e.target.value)
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                {/* RENTAL */}
                                {(variant.pricing_mode === "rental" ||
                                    variant.pricing_mode === "both") && (
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.label}>Rental Price (per day)</label>
                                            <input
                                                type="number"
                                                value={variant.rental_price || ""}
                                                onChange={(e) =>
                                                    handleVariantChange(index, "rental_price", e.target.value)
                                                }
                                            />
                                        </div>
                                    )}
                            </>
                        ) : isPhotography ? (
                            /* (your existing photography block unchanged) */
                            <div className={styles.photoPricingBlock}>
                                ...
                            </div>
                        ) : (
                            /* Default */
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Price *</label>
                                <input
                                    type="number"
                                    value={variant.price || ""}
                                    onChange={(e) =>
                                        handleVariantChange(index, "price", e.target.value)
                                    }
                                />
                            </div>
                        )}

                        {/* Inclusions */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Inclusions</label>
                            <input
                                type="text"
                                value={variant.inclusions || ""}
                                onChange={(e) =>
                                    handleVariantChange(index, "inclusions", e.target.value)
                                }
                                placeholder={
                                    isPhotography
                                        ? "e.g. 500 edited photos, same-day preview, online gallery..."
                                        : "Buffet setup, Live counters, Waiter service..."
                                }
                                className={styles.input}
                            />
                            <p className={styles.helperText}>
                                Comma separated (e.g. 5 items, Decor, DJ)
                            </p>
                        </div>
                    </div>
                ))}

                {formData.variants.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No packages added yet. Click "Add Package" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepPricing;