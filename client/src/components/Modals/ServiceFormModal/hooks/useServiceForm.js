// src/components/services/ServiceFormModal/hooks/useServiceForm.js

import { useState, useEffect, useRef } from 'react';
import { initialFormData } from '../formDataInitialState';
import { validateStep } from '../utils/validation';
import { showSuccess, showError } from '../../../../utils/toast';

export const useServiceForm = (isOpen, initialData, onSubmitCallback, onClose) => {
    // Always keep a ref to the latest callback so handleSubmit never captures
    // a stale closure, even when the parent re-creates the function on re-render.
    const callbackRef = useRef(onSubmitCallback);
    useEffect(() => { callbackRef.current = onSubmitCallback; }, [onSubmitCallback]);

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(initialFormData);

    // Input states for dynamic lists
    const [newTag, setNewTag] = useState("");
    const [newAmenity, setNewAmenity] = useState("");
    const [newGenre, setNewGenre] = useState("");
    const [newEquipment, setNewEquipment] = useState("");
    const [newListItem, setNewListItem] = useState("");

    // Catering specific lists
    const [newCuisine, setNewCuisine] = useState("");
    const [newSpecialDiet, setNewSpecialDiet] = useState("");

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Reset / populate form when modal opens or initialData changes
    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        if (initialData) {
            const photo = initialData.photography || {};

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

                // Variants — support regular / veg-nonveg / photo+video
                variants: initialData.variants?.length
                    ? initialData.variants.map(v => {
                        const pricing = v.pricing || {};

                        return {
                            variant_name: v.variant_name || "Basic Package",

                            pricing_type: v.pricing_type || "BASE_PRICE",
                            pricing_mode: pricing.pricing_mode || "",

                            // Default
                            price: pricing.base_price?.toString() || "",
                            price_with_video: pricing.price_with_video?.toString() || "",

                            // Catering / Venue
                            veg_price: pricing.veg_price?.toString() || "",
                            non_veg_price: pricing.non_veg_price?.toString() || "",
                            is_veg_only: pricing.non_veg_price ? false : true,

                            // Venue rental
                            rental_price: pricing.rental_price?.toString() || "",

                            is_default: v.is_default ?? true,

                            inclusions: Array.isArray(v.inclusions)
                                ? v.inclusions.join(", ")
                                : (v.inclusions || "")
                        };
                    })
                    : initialFormData.variants,

                // Venue
                capacity_min: initialData.venue?.min_capacity?.toString() || "",
                capacity_max: initialData.venue?.max_capacity?.toString() || "",
                hall_type: initialData.venue?.venue_type || "",
                indoor_outdoor: initialData.venue?.venue_nature || "",
                square_feet: initialData.venue?.square_feet?.toString() || "",
                parking_capacity: initialData.venue?.parking_capacity?.toString() || "",
                venue_policies: initialData.venue?.venue_policies || initialFormData.venue_policies,

                // Catering
                cuisine_types: initialData.catering?.cuisine_types || [],
                special_diets_supported: initialData.catering?.special_diets_supported || [],
                min_order: initialData.catering?.min_order || "",
                max_order: initialData.catering?.max_order || "",
                service_styles_multi: initialData.catering?.service_styles || [],
                staff_included: initialData.catering?.staff_included ?? false,
                crockery_cutlery_included: initialData.catering?.crockery_cutlery_included ?? false,
                tasting_available: initialData.catering?.tasting_available ?? false,

                // DJ
                genres_supported: initialData.dj?.genres_supported || [],
                duration_hours: initialData.dj?.duration_hours || "",
                equipment: initialData.dj?.equipment || [],
                lighting_included: initialData.dj?.lighting_included ?? false,
                mc_host_available: initialData.dj?.mc_host_available ?? false,
                setup_time_required: initialData.dj?.setup_time_required || "",

                // Photography
                photography_types: photo.photography_types || [],
                editing_styles: photo.editing_styles || [],

                videography_available: photo.videography_available ?? false,
                drone_shoot_available: photo.drone_shoot_available ?? false,

                photo_delivery_count: photo.photo_delivery_count?.toString() || "",
                video_delivery_duration_minutes: photo.video_delivery_duration_minutes?.toString() || "",
                edited_photos_included: photo.edited_photos_included ?? true,
                raw_photos_provided: photo.raw_photos_provided ?? false,
                album_included: photo.album_included ?? false,
                album_pages: photo.album_pages?.toString() || "",

                coverage_hours: photo.coverage_hours?.toString() || "",
                overtime_rate_per_hour: photo.overtime_rate_per_hour?.toString() || "",

                team_size: photo.team_size?.toString() || "",
                second_shooter_included: photo.second_shooter_included ?? false,
                experience_years: photo.experience_years?.toString() || "",

                travel_cost_per_km: photo.travel_cost_per_km?.toString() || "",
                base_city: photo.base_city || "",

                // Event Management
                event_types: initialData.event_management?.event_types || [],
                // team_size / experience_years already set above; event_management overrides if category matches
                ...(initialData.service_type === "event_management" && {
                    team_size: initialData.event_management?.team_size?.toString() || "",
                    experience_years: initialData.event_management?.experience_years?.toString() || "",
                }),

                // Makeup Artist
                makeup_types: initialData.makeup_artist?.makeup_types || [],
                specialization: initialData.makeup_artist?.specialization || "",
                brands_used: initialData.makeup_artist?.brands_used || [],
                premium_products_used: initialData.makeup_artist?.premium_products_used ?? true,
                service_duration_minutes: initialData.makeup_artist?.service_duration_minutes || "",
                travel_to_client: initialData.makeup_artist?.travel_to_client ?? true,
                ...(initialData.service_type === "makeup_artist" && {
                    travel_cost_per_km: initialData.makeup_artist?.travel_cost_per_km?.toString() || "",
                    base_city: initialData.makeup_artist?.base_city || "",
                }),
                hairstyling_included: initialData.makeup_artist?.hairstyling_included ?? true,
                draping_included: initialData.makeup_artist?.draping_included ?? false,
                trial_available: initialData.makeup_artist?.trial_available ?? false,
            };

            setFormData(populatedData);
            const mediaUrls = initialData.media?.map(m => m.media_url) || initialData.images || [];
            setExistingImages(mediaUrls);
            setPreviewUrls(mediaUrls);
        } else {
            setFormData(initialFormData);
            setExistingImages([]);
            setNewImages([]);
            setPreviewUrls([]);
            setNewTag("");
            setNewAmenity("");
            setNewGenre("");
            setNewEquipment("");
            setNewListItem("");
            setNewCuisine("");
            setNewSpecialDiet("");
        }

        setCurrentStep(0);
    }, [isOpen, initialData]);

    // ====================== Handlers ======================

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            if (field === "is_default" && value === true) {
                newVariants.forEach(v => (v.is_default = false));
            }
            newVariants[index][field] = value;
            return { ...prev, variants: newVariants };
        });
    };

    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    variant_name: "New Package",

                    pricing_type: "BASE_PRICE",
                    pricing_mode: "",

                    price: "",
                    price_with_video: "",

                    veg_price: "",
                    non_veg_price: "",
                    is_veg_only: false,

                    rental_price: "",

                    is_default: false,
                    inclusions: ""
                }
            ]
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
        if (!validateStep(currentStep, formData)) return;

        // Only actually submit on the final step
        if (currentStep !== 4) {
            setCurrentStep(prev => prev + 1);
            return;
        }

        if (typeof callbackRef.current !== "function") {
            console.error("[useServiceForm] onSubmitCallback is not a function:", callbackRef.current);
            showError("Configuration error", "Submit handler is missing.");
            return;
        }

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
                variants: formData.variants.map(v => {
                    const variantPayload = {
                        variant_name: v.variant_name,
                        pricing_type: v.pricing_type,
                        currency: "INR",
                        is_default: v.is_default,
                        inclusions: v.inclusions
                            ? v.inclusions.split(",").map(i => i.trim()).filter(Boolean)
                            : []
                    };

                    // 🥗 CATERING
                    if (formData.category === "catering") {
                        variantPayload.pricing = {
                            veg_price: parseFloat(v.veg_price) || 0,
                            ...(!v.is_veg_only && {
                                non_veg_price: parseFloat(v.non_veg_price) || 0
                            })
                        };
                    }

                    // 🏛️ VENUE
                    else if (formData.category === "venue") {
                        variantPayload.pricing = {
                            pricing_mode: v.pricing_mode || null,

                            ...((v.pricing_mode === "per_plate" || v.pricing_mode === "both") && {
                                veg_price: parseFloat(v.veg_price) || 0,
                                ...(!v.is_veg_only && {
                                    non_veg_price: parseFloat(v.non_veg_price) || 0
                                })
                            }),

                            ...((v.pricing_mode === "rental" || v.pricing_mode === "both") && {
                                rental_price: parseFloat(v.rental_price) || 0
                            })
                        };
                    }

                    // 📸 PHOTOGRAPHY
                    else if (formData.category === "photography") {
                        variantPayload.pricing = {
                            base_price: parseFloat(v.price) || 0,
                            ...(formData.videography_available && {
                                price_with_video: parseFloat(v.price_with_video) || 0
                            })
                        };
                    }

                    // 🎧 DEFAULT
                    else {
                        variantPayload.pricing = {
                            base_price: parseFloat(v.price) || 0
                        };
                    }

                    return variantPayload;
                })
            };

            // ================= VENUE =================
            if (formData.category === "venue") {
                payload.venue = {
                    min_capacity: parseInt(formData.capacity_min) || 0,
                    max_capacity: parseInt(formData.capacity_max) || 0,
                    venue_type: formData.hall_type || "",
                    venue_nature: formData.indoor_outdoor || "",
                    square_feet: parseFloat(formData.square_feet) || 0,
                    parking_capacity: parseInt(formData.parking_capacity) || 0,
                    venue_policies: formData.venue_policies || {}
                };
            }

            // ================= CATERING =================
            if (formData.category === "catering") {
                payload.catering = {
                    cuisine_types: formData.cuisine_types || [],
                    special_diets_supported: formData.special_diets_supported || [],
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
                    editing_styles: formData.editing_styles || [],

                    videography_available: !!formData.videography_available,
                    drone_shoot_available: !!formData.drone_shoot_available,

                    photo_delivery_count: parseInt(formData.photo_delivery_count) || null,
                    video_delivery_duration_minutes: formData.videography_available
                        ? parseInt(formData.video_delivery_duration_minutes) || null
                        : null,
                    edited_photos_included: !!formData.edited_photos_included,
                    raw_photos_provided: !!formData.raw_photos_provided,
                    album_included: !!formData.album_included,
                    album_pages: formData.album_included
                        ? parseInt(formData.album_pages) || null
                        : null,

                    coverage_hours: parseFloat(formData.coverage_hours) || null,
                    overtime_rate_per_hour: parseFloat(formData.overtime_rate_per_hour) || null,

                    team_size: parseInt(formData.team_size) || 1,
                    second_shooter_included: !!formData.second_shooter_included,

                    travel_cost_per_km: formData.travel_cost_per_km
                        ? parseFloat(formData.travel_cost_per_km)
                        : null,
                    base_city: formData.base_city || null,

                    experience_years: parseInt(formData.experience_years) || 0,
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
            newImages.forEach(file => formDataToSend.append("images", file));
            if (initialData) {
                formDataToSend.append("existing_images", JSON.stringify(existingImages));
            }

            await callbackRef.current(formDataToSend, initialData ? initialData.id : null);

            showSuccess(
                initialData ? "Service Updated Successfully!" : "Service Created Successfully!",
                `${formData.title} has been ${initialData ? "updated" : "added"} 🎉`
            );

            onClose();

        } catch (err) {
            showError("Failed to save service", err.response?.data?.detail || err.message);
        } finally {
            setUploading(false);
        }
    };

    return {
        currentStep,
        setCurrentStep,
        formData,
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
        isSubmitting: uploading,   // alias — modal destructures both names
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