// src/components/services/ServiceFormModal/hooks/useServiceForm.js

import { useState, useEffect } from 'react';
import { initialFormData } from '../formDataInitialState';
import { validateStep } from '../utils/validation';
import { showSuccess, showError } from '../../../../utils/toast';

export const useServiceForm = (isOpen, initialData, onSubmitCallback, onClose) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(initialFormData);

    // Input states for dynamic lists
    const [newTag, setNewTag] = useState("");
    const [newAmenity, setNewAmenity] = useState("");
    const [newGenre, setNewGenre] = useState("");
    const [newEquipment, setNewEquipment] = useState("");
    const [newListItem, setNewListItem] = useState("");     // Used for makeup_types & brands_used

    // Separate states for Catering fields
    const [newCuisine, setNewCuisine] = useState("");
    const [newSpecialDiet, setNewSpecialDiet] = useState("");

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        if (initialData) {
            const populatedData = {
                ...initialFormData,

                title: initialData.service_name || "",
                description: initialData.description || "",
                category: initialData.service_type || "",

                address_line1: initialData.add_line1 || "",
                address_line2: initialData.add_line2 || "",
                area: initialData.area || "",
                city: initialData.city || "",
                state: initialData.state || "",
                country: initialData.country || "India",
                pincode: initialData.pincode || "",

                geo_point: {
                    lat: initialData.latitude ?? "",
                    lon: initialData.longitude ?? ""
                },

                tags: initialData.metadata?.tags || [],
                amenities: initialData.metadata?.amenities || [],

                variants: initialData.variants?.length
                    ? initialData.variants
                    : initialFormData.variants,

                // ================= VENUE =================
                capacity_min: initialData.venue?.capacity_min || "",
                capacity_max: initialData.venue?.capacity_max || "",
                hall_type: initialData.venue?.hall_type || "",
                indoor_outdoor: initialData.venue?.indoor_outdoor || "",
                square_feet: initialData.venue?.square_feet || "",
                parking_capacity: initialData.venue?.parking_capacity || "",
                venue_policies: initialData.venue ? {
                    decoration_policy: initialData.venue.decoration_policy || "",
                    catering_policy: initialData.venue.catering_policy || "",
                    alcohol_policy: initialData.venue.alcohol_policy || "",
                    other_policies: initialData.venue.other_policies || [],
                } : {
                    decoration_policy: "",
                    catering_policy: "",
                    alcohol_policy: "",
                    other_policies: []
                },

                // ================= CATERING =================
                cuisine_types: initialData.catering?.cuisine_types || [],
                special_diets_supported: initialData.catering?.special_diets_supported || [],
                service_styles_multi: initialData.catering?.service_styles || [],
                veg_price_per_head: initialData.catering?.veg_price_per_head || "",
                nonveg_price_per_head: initialData.catering?.non_veg_price_per_head || "",
                min_order: initialData.catering?.min_order || "",
                max_order: initialData.catering?.max_order || "",
                staff_included: initialData.catering?.staff_included ?? false,
                crockery_cutlery_included: initialData.catering?.crockery_cutlery_included ?? false,
                tasting_available: initialData.catering?.tasting_available ?? false,

                // ================= DJ =================
                genres_supported: initialData.dj?.genres_supported || [],
                duration_hours: initialData.dj?.duration_hours || "",
                equipment: initialData.dj?.equipment || [],
                lighting_included: initialData.dj?.lighting_included ?? false,
                mc_host_available: initialData.dj?.mc_host_available ?? false,
                setup_time_required: initialData.dj?.setup_time_required || "",

                // ================= PHOTOGRAPHY =================
                photography_types: initialData.photography?.photography_types || [],
                hours_covered: initialData.photography?.hours_covered || "",
                videography_included: initialData.photography?.videography_included ?? false,
                drone_available: initialData.photography?.drone_available ?? false,
                album_included: initialData.photography?.album_included ?? false,

                // ================= EVENT MANAGEMENT =================
                event_types: initialData.event_management?.event_types || [],
                team_size: initialData.event_management?.team_size || "",
                experience_years: initialData.event_management?.experience_years || "",

                // ================= MAKEUP ARTIST =================
                makeup_types: initialData.makeup_artist?.makeup_types || [],
                specialization: initialData.makeup_artist?.specialization || "",
                brands_used: initialData.makeup_artist?.brands_used || [],
                premium_products_used: initialData.makeup_artist?.premium_products_used ?? true,
                team_size: initialData.makeup_artist?.team_size || "",
                service_duration_minutes: initialData.makeup_artist?.service_duration_minutes || "",
                travel_to_client: initialData.makeup_artist?.travel_to_client ?? true,
                travel_cost_per_km: initialData.makeup_artist?.travel_cost_per_km || "",
                base_city: initialData.makeup_artist?.base_city || "",
                hairstyling_included: initialData.makeup_artist?.hairstyling_included ?? true,
                draping_included: initialData.makeup_artist?.draping_included ?? false,
                trial_available: initialData.makeup_artist?.trial_available ?? false,
            };

            setFormData(populatedData);

            const mediaUrls = initialData.media?.map(m => m.media_url) ||
                initialData.images || [];
            setExistingImages(mediaUrls);
            setPreviewUrls(mediaUrls);
        } else {
            // Reset for new service
            setFormData(initialFormData);
            setExistingImages([]);
            setNewImages([]);
            setPreviewUrls([]);
            setNewCuisine("");
            setNewSpecialDiet("");
            setNewListItem("");
        }

        setCurrentStep(0);
    }, [isOpen, initialData]);

    // ==================== Handlers ====================

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            if (Array.isArray(value)) {
                return { ...prev, [field]: value };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            if (field === 'is_default' && value === true) {
                newVariants.forEach(v => v.is_default = false);
            }
            newVariants[index][field] = value;
            return { ...prev, variants: newVariants };
        });
    };

    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, {
                variant_name: "New Package",
                pricing_type: "BASE_PRICE",
                price: "",
                is_default: false,
                inclusions: ""
            }]
        }));
    };

    const handleRemoveVariant = (index) => {
        if (formData.variants.length > 1) {
            setFormData(prev => {
                const newVariants = prev.variants.filter((_, i) => i !== index);
                if (prev.variants[index].is_default && newVariants.length > 0) {
                    newVariants[0].is_default = true;
                }
                return { ...prev, variants: newVariants };
            });
        } else {
            showError("You must have at least one package.", "Validation Error");
        }
    };

    const handleGeoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            geo_point: {
                ...prev.geo_point,
                [field]: value === "" ? "" : parseFloat(value)
            }
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const handleRemoveImage = (index) => {
        if (index < existingImages.length) {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        } else {
            const newIdx = index - existingImages.length;
            setNewImages(prev => prev.filter((_, i) => i !== newIdx));
        }
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        if (validateStep(currentStep, formData)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploading) return;
        if (currentStep !== 4) return;
        if (!validateStep(4, formData)) return;

        setUploading(true);

        try {
            const payload = {
                service_name: formData.title,
                service_type: formData.category,
                description: formData.description || "",
                add_line1: formData.address_line1 || null,
                add_line2: formData.address_line2 || null,
                area: formData.area || null,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pincode: formData.pincode,
                latitude: formData.geo_point.lat !== "" ? parseFloat(formData.geo_point.lat) : null,
                longitude: formData.geo_point.lon !== "" ? parseFloat(formData.geo_point.lon) : null,
                metadata: {
                    tags: formData.tags || [],
                    amenities: formData.amenities || []
                },
                variants: formData.variants.map(v => ({
                    variant_name: v.variant_name,
                    pricing_type: v.pricing_type,
                    currency: "INR",
                    pricing: { base_price: parseFloat(v.price) || 0 },
                    is_default: v.is_default,
                    inclusions: v.inclusions
                        ? v.inclusions.split(",").map(i => i.trim()).filter(Boolean)
                        : []
                }))
            };

            // ================= VENUE =================
            if (formData.category === "venue") {
                payload.venue = {
                    capacity_min: parseInt(formData.capacity_min) || 0,
                    capacity_max: parseInt(formData.capacity_max) || 0,
                    hall_type: formData.hall_type || "",
                    indoor_outdoor: formData.indoor_outdoor || "",
                    square_feet: parseFloat(formData.square_feet) || 0,
                    parking_capacity: parseInt(formData.parking_capacity) || 0,
                    venue_policies: {
                        decoration_policy: formData.venue_policies?.decoration_policy || "",
                        catering_policy: formData.venue_policies?.catering_policy || "",
                        alcohol_policy: formData.venue_policies?.alcohol_policy || "",
                        other_policies: formData.venue_policies?.other_policies || []
                    }
                };
            }

            // ================= CATERING =================
            if (formData.category === "catering") {
                payload.catering = {
                    cuisine_types: formData.cuisine_types || [],
                    special_diets_supported: formData.special_diets_supported || [],
                    veg_price_per_head: parseFloat(formData.veg_price_per_head) || 0,
                    non_veg_price_per_head: parseFloat(formData.nonveg_price_per_head) || 0,
                    min_order: parseInt(formData.min_order) || 1,
                    max_order: parseInt(formData.max_order) || null,
                    service_styles: formData.service_styles_multi || [],
                    staff_included: !!formData.staff_included,
                    crockery_cutlery_included: !!formData.crockery_cutlery_included,
                    tasting_available: !!formData.tasting_available,
                };
            }

            // ================= DJ =================
            if (formData.category === "dj") {
                payload.dj = {
                    genres_supported: formData.genres_supported || [],
                    duration_hours: parseFloat(formData.duration_hours) || 0,
                    equipment: formData.equipment || [],
                    lighting_included: !!formData.lighting_included,
                    mc_host_available: !!formData.mc_host_available,
                    setup_time_required: parseFloat(formData.setup_time_required) || 0,
                };
            }

            // ================= PHOTOGRAPHY =================
            if (formData.category === "photography") {
                payload.photography = {
                    photography_types: formData.photography_types || [],
                    hours_covered: parseFloat(formData.hours_covered) || 0,
                    videography_included: !!formData.videography_included,
                    drone_available: !!formData.drone_available,
                    album_included: !!formData.album_included,
                };
            }

            // ================= EVENT MANAGEMENT =================
            if (formData.category === "event_management") {
                payload.event_management = {
                    event_types: formData.event_types || [],
                    team_size: parseInt(formData.team_size) || 0,
                    experience_years: parseInt(formData.experience_years) || 0,
                };
            }

            // ================= MAKEUP ARTIST =================
            if (formData.category === "makeup_artist") {
                payload.makeup_artist = {
                    makeup_types: formData.makeup_types || [],
                    specialization: formData.specialization || null,
                    brands_used: formData.brands_used || [],
                    premium_products_used: !!formData.premium_products_used,
                    team_size: parseInt(formData.team_size) || 1,
                    service_duration_minutes: parseInt(formData.service_duration_minutes) || null,
                    travel_to_client: !!formData.travel_to_client,
                    travel_cost_per_km: formData.travel_cost_per_km
                        ? parseFloat(formData.travel_cost_per_km)
                        : null,
                    base_city: formData.base_city || null,
                    hairstyling_included: !!formData.hairstyling_included,
                    draping_included: !!formData.draping_included,
                    trial_available: !!formData.trial_available,
                };
            }

            const formDataToSend = new FormData();
            formDataToSend.append("data", JSON.stringify(payload));

            newImages.forEach(file => {
                formDataToSend.append("images", file);
            });

            if (initialData) {
                formDataToSend.append(
                    "existing_images",
                    JSON.stringify(existingImages)
                );
            }

            await onSubmitCallback(
                formDataToSend,
                initialData ? initialData.id : null
            );

            await new Promise(res => setTimeout(res, 500));

            showSuccess(
                initialData ? "Service Updated!" : "Service Created!",
                `${formData.title} has been ${initialData ? "updated" : "added"} successfully 🎉`
            );

            onClose();

        } catch (err) {
            showError(
                "Failed to save service",
                err.response?.data?.detail || err.message
            );
        } finally {
            setUploading(false);
        }
    };

    return {
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        newTag, setNewTag,
        newAmenity, setNewAmenity,
        newGenre, setNewGenre,
        newEquipment, setNewEquipment,
        newListItem, setNewListItem,
        newCuisine, setNewCuisine,
        newSpecialDiet, setNewSpecialDiet,
        existingImages,
        newImages,
        previewUrls,
        uploading,
        handleInputChange,
        handleVariantChange,
        handleAddVariant,
        handleRemoveVariant,
        handleGeoChange,
        handleImageChange,
        handleRemoveImage,
        handleNext,
        handleSubmit,
    };
};