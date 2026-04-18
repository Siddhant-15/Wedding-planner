// src/components/services/ServiceFormModal/validation.js

import { showError } from '../../../../utils/toast';

export const validateStep = (step, formData) => {
    switch (step) {
        case 0:
            if (!formData.title || !formData.description || !formData.city || !formData.state || !formData.pincode) {
                showError("Please fill all required fields in Basic Info", "Validation Error");
                return false;
            }
            if (formData.title.length < 3 || formData.title.length > 255) {
                showError("Title must be between 3 and 255 characters", "Validation Error");
                return false;
            }
            return true;

        case 1:
            if (!formData.category) {
                showError("Please select a category", "Validation Error");
                return false;
            }
            if (formData.variants.length === 0) {
                showError("At least one package is required", "Validation Error");
                return false;
            }
            for (const v of formData.variants) {
                if (!v.variant_name || !v.pricing_type || v.price === "") {
                    showError(`Please fill all fields in package: ${v.variant_name || "Unnamed"}`, "Validation Error");
                    return false;
                }
                if (v.price < 0) {
                    showError(`Price must be non-negative`, "Validation Error");
                    return false;
                }
            }
            return true;

        case 4:
            return validateStep(0, formData) && validateStep(1, formData);

        default:
            return true;
    }
};