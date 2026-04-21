// src/components/services/ServiceFormModal/utils/validation.js

import { showError } from '../../../../utils/toast';

export const validateStep = (step, formData) => {
    switch (step) {
        case 0: // Basic Info
            if (!formData.title || !formData.description || !formData.city || !formData.state || !formData.pincode) {
                showError("Please fill all required fields in Basic Info", "Validation Error");
                return false;
            }
            if (formData.title.length < 3 || formData.title.length > 255) {
                showError("Title must be between 3 and 255 characters", "Validation Error");
                return false;
            }
            return true;

        case 1: // Pricing Step
            if (!formData.category) {
                showError("Please select a service category", "Validation Error");
                return false;
            }

            if (formData.variants.length === 0) {
                showError("At least one pricing package is required", "Validation Error");
                return false;
            }

            const isCatering = formData.category === 'catering';
            const isVenue = formData.category === 'venue';
            const isPhotography = formData.category === 'photography';

            for (const [index, v] of formData.variants.entries()) {
                const packageName = v.variant_name?.trim() || `Package ${index + 1}`;

                if (!v.variant_name?.trim()) {
                    showError(`Package name is required for ${packageName}`, "Validation Error");
                    return false;
                }

                /* =========================
                   CATERING VALIDATION
                ========================= */
                if (isCatering) {
                    if (!v.veg_price) {
                        showError(`Veg Price is required for ${packageName}`, "Validation Error");
                        return false;
                    }

                    if (!v.is_veg_only && !v.non_veg_price) {
                        showError(`Non-Veg Price is required for ${packageName}`, "Validation Error");
                        return false;
                    }

                    const vegPrice = parseFloat(v.veg_price);
                    if (isNaN(vegPrice) || vegPrice < 0) {
                        showError(`Veg Price must be valid for ${packageName}`, "Validation Error");
                        return false;
                    }

                    if (!v.is_veg_only) {
                        const nonVegPrice = parseFloat(v.non_veg_price);
                        if (isNaN(nonVegPrice) || nonVegPrice < 0) {
                            showError(`Non-Veg Price must be valid for ${packageName}`, "Validation Error");
                            return false;
                        }
                    }
                }

                /* =========================
                   VENUE VALIDATION
                ========================= */
                else if (isVenue) {
                    if (!v.pricing_mode) {
                        showError(`Pricing type is required for ${packageName}`, "Validation Error");
                        return false;
                    }

                    // PER PLATE
                    if (v.pricing_mode === "per_plate" || v.pricing_mode === "both") {
                        if (!v.veg_price) {
                            showError(`Veg Price is required for ${packageName}`, "Validation Error");
                            return false;
                        }

                        if (!v.is_veg_only && !v.non_veg_price) {
                            showError(`Non-Veg Price is required for ${packageName}`, "Validation Error");
                            return false;
                        }

                        const vegPrice = parseFloat(v.veg_price);
                        if (isNaN(vegPrice) || vegPrice < 0) {
                            showError(`Veg Price must be valid for ${packageName}`, "Validation Error");
                            return false;
                        }

                        if (!v.is_veg_only) {
                            const nonVegPrice = parseFloat(v.non_veg_price);
                            if (isNaN(nonVegPrice) || nonVegPrice < 0) {
                                showError(`Non-Veg Price must be valid for ${packageName}`, "Validation Error");
                                return false;
                            }
                        }
                    }

                    // RENTAL
                    if (v.pricing_mode === "rental" || v.pricing_mode === "both") {
                        if (!v.rental_price) {
                            showError(`Rental Price is required for ${packageName}`, "Validation Error");
                            return false;
                        }

                        const rental = parseFloat(v.rental_price);
                        if (isNaN(rental) || rental < 0) {
                            showError(`Rental Price must be valid for ${packageName}`, "Validation Error");
                            return false;
                        }
                    }
                }

                /* =========================
                   PHOTOGRAPHY VALIDATION
                ========================= */
                else if (isPhotography) {
                    if (!v.pricing_type) {
                        showError(`Pricing type is required for ${packageName}`, "Validation Error");
                        return false;
                    }

                    if (!v.price) {
                        showError(`Photo price is required for ${packageName}`, "Validation Error");
                        return false;
                    }

                    const price = parseFloat(v.price);
                    if (isNaN(price) || price < 0) {
                        showError(`Price must be valid for ${packageName}`, "Validation Error");
                        return false;
                    }

                    if (formData.videography_available && !v.price_with_video) {
                        showError(`Video price is required for ${packageName}`, "Validation Error");
                        return false;
                    }
                }

                /* =========================
                   DEFAULT VALIDATION
                ========================= */
                else {
                    if (!v.price) {
                        showError(`Price is required for ${packageName}`, "Validation Error");
                        return false;
                    }

                    const price = parseFloat(v.price);
                    if (isNaN(price) || price < 0) {
                        showError(`Price must be valid for ${packageName}`, "Validation Error");
                        return false;
                    }
                }
            }

            return true;

        case 4: // Review Step
            return validateStep(0, formData) && validateStep(1, formData);

        default:
            return true;
    }
};