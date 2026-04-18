// import React, { useState, useEffect } from "react";
// import { X, Upload, Trash2, MapPin, DollarSign, Tag, Image as ImageIcon, Edit2, Sparkles } from "lucide-react";
// import { showSuccess, showError } from '../utils/toast.js';
// import styles from '../styles/ServiceForm.module.css';

// const serviceTypes = [
//   { value: "venue", label: "Wedding Venue" },
//   { value: "dj", label: "DJ" },
//   { value: "event_management", label: "Event Management" },
//   { value: "catering", label: "Catering" },
//   { value: "photography", label: "Photography" },
//   { value: "makeup", label: "Makeup Artist" },
// ];

// const pricingTypes = [
//   { value: "per_day", label: "Per Day" },
//   { value: "per_hour", label: "Per Hour" },
//   { value: "per_head", label: "Per Head" },
//   { value: "package", label: "Package" },
// ];

// const hallTypes = [
//   { value: "banquet", label: "Banquet" },
//   { value: "lawn", label: "Lawn" },
//   { value: "farmhouse", label: "Farmhouse" },
//   { value: "resort", label: "Resort" },
// ];

// const indoorOutdoorOptions = [
//   { value: "indoor", label: "Indoor" },
//   { value: "outdoor", label: "Outdoor" },
//   { value: "both", label: "Both" },
// ];

// const policyOptions = [
//   { value: "allowed", label: "Allowed" },
//   { value: "in-house-only", label: "In-House Only" },
// ];

// const alcoholOptions = [
//   { value: "allowed", label: "Allowed" },
//   { value: "not-allowed", label: "Not Allowed" },
// ];

// const serviceStyles = [
//   { value: "buffet", label: "Buffet" },
//   { value: "plated", label: "Plated" },
//   { value: "live_counter", label: "Live Counter" },
// ];

// const packageModals = [
//   { value: "package_based", label: "Package Based" },
//   { value: "hourly", label: "Hourly" },
//   { value: "fixed", label: "Fixed" },
// ];

// const steps = ["Basic Info", "Service Type & Pricing", "Specific Details", "Amenities & Images", "Review & Publish"];

// const ServiceFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
//   console.log("Initial Data", initialData)
//   const [currentStep, setCurrentStep] = useState(0);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     tags: [],
//     address_line1: "",
//     address_line2: "",
//     area: "",
//     city: "",
//     state: "",
//     country: "India",
//     pincode: "",
//     geo_point: { lat: "", lon: "" },
//     category: "",
//     variants: [
//       {
//         variant_name: "Basic Package",
//         pricing_type: "BASE_PRICE",
//         price: "",
//         is_default: true,
//         inclusions: ""
//       }
//     ],
//     amenities: [],
//     capacity_min: "",
//     capacity_max: "",
//     hall_type: "",
//     indoor_outdoor: "",
//     square_feet: "",
//     parking_capacity: "",
//     decoration_policy: "",
//     catering_policy: "",
//     alcohol_policy: "",
//     cuisine_types: [],
//     veg_price_per_head: "",
//     nonveg_price_per_head: "",
//     min_order: "",
//     max_order: "",
//     service_style: "",
//     staff_included: false,
//     crockery_cutlery_included: false,
//     tasting_available: false,
//     genres_supported: [],
//     duration_hours: "",
//     equipment: [],
//     lighting_included: false,
//     mc_host_available: false,
//     setup_time_required: "",
//     package_type: [],
//     hours_covered: "",
//     photos_delivered: "",
//     edited_photos_count: "",
//     delivery_time_days: "",
//     videography_included: false,
//     drone_available: false,
//     album_included: false,
//     event_types: [],
//     team_size: "",
//     includes: [],
//     package_modal: "",
//     vendor_network_size: "",
//     experience_years: "",
//     min_budget: "",
//     max_budget: "",
//     languages_supported: [],
//     editing_styles: [],
//     makeup_types: [],
//     brands_used: [],
//     travel_to_client: true,
//     hairstyling_included: true,
//     service_styles_multi: [],
//     special_diets_supported: [],
//   });
//   const [newTag, setNewTag] = useState("");
//   const [newAmenity, setNewAmenity] = useState("");
//   const [newGenre, setNewGenre] = useState("");
//   const [newEquipment, setNewEquipment] = useState("");
//   const [newListItem, setNewListItem] = useState("");
//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//       if (initialData) {
//         setFormData({
//           title: initialData.service_name || "",
//           description: initialData.description || "",
//           tags: initialData.metadata?.tags || initialData.tags || [],
//           address_line1: initialData.add_line1 || initialData.address_line1 || "",
//           address_line2: initialData.add_line2 || initialData.address_line2 || "",
//           area: initialData.area || "",
//           city: initialData.city || "",
//           state: initialData.state || "",
//           country: initialData.country || "India",
//           pincode: initialData.pincode || "",
//           geo_point: {
//             lat: initialData.latitude ?? initialData.geo_point?.lat ?? "",
//             lon: initialData.longitude ?? initialData.geo_point?.lon ?? ""
//           },
//           category: initialData.service_type === "photographer" ? "photography" : (initialData.service_type || initialData.category || ""),
//           variants: initialData.variants && initialData.variants.length > 0 ? initialData.variants.map(v => ({
//             id: v.id || null,
//             variant_name: v.variant_name || "Basic Package",
//             pricing_type: v.pricing_type || "BASE_PRICE",
//             price: v.pricing?.base_price ?? v.pricing?.price ?? "",
//             is_default: !!v.is_default,
//             inclusions: Array.isArray(v.inclusions) ? v.inclusions.join(", ") : (v.inclusions || "")
//           })) : [{
//             variant_name: "Basic Package",
//             pricing_type: "BASE_PRICE",
//             price: initialData.base_price || "",
//             is_default: true,
//             inclusions: ""
//           }],
//           amenities: initialData.venue?.amenities || initialData.metadata?.amenities || [],
//           capacity_min: initialData.venue?.min_capacity || "",
//           capacity_max: initialData.venue?.max_capacity || "",
//           hall_type: initialData.venue?.venue_type || "",
//           indoor_outdoor: initialData.venue?.venue_nature || "",
//           square_feet: initialData.venue?.square_feet || "",
//           parking_capacity: initialData.venue?.parking_capacity || "",
//           decoration_policy: initialData.venue?.venue_rules?.find(r => r.startsWith("Decoration:"))?.split(": ")[1] || "",
//           catering_policy: initialData.venue?.catering_options?.policy || "",
//           alcohol_policy: initialData.venue?.venue_rules?.find(r => r.startsWith("Alcohol:"))?.split(": ")[1] || "",

//           experience_years: initialData.metadata?.experience_years || initialData.dj?.experience_years || initialData.photography?.experience_years || initialData.event_management?.experience_years || initialData.makeup_artist?.experience_years || "",
//           min_budget: initialData.event_management?.min_budget || initialData.metadata?.min_budget || "",
//           max_budget: initialData.event_management?.max_budget || initialData.metadata?.max_budget || "",
//           languages_supported: initialData.dj?.languages_supported || [],
//           editing_styles: initialData.photography?.editing_styles || [],
//           makeup_types: initialData.makeup_artist?.makeup_types || [],
//           brands_used: initialData.makeup_artist?.brands_used || [],
//           travel_to_client: initialData.makeup_artist?.travel_to_client ?? true,
//           hairstyling_included: initialData.makeup_artist?.hairstyling_included ?? true,
//           service_styles_multi: initialData.catering?.service_styles || initialData.metadata?.service_styles || [],
//           special_diets_supported: initialData.catering?.special_diets_supported || [],
//           veg_price_per_head: initialData.catering?.veg_price_per_head || "",
//           nonveg_price_per_head: initialData.catering?.non_veg_price_per_head || "",
//           min_order: initialData.catering?.min_order || initialData.metadata?.min_order || "",
//           max_order: initialData.catering?.max_order || initialData.metadata?.max_order || "",
//           staff_included: initialData.catering?.staff_included ?? initialData.metadata?.staff_included ?? false,
//           crockery_cutlery_included: initialData.catering?.crockery_cutlery_included ?? initialData.metadata?.crockery_cutlery_included ?? false,
//           tasting_available: initialData.catering?.tasting_available ?? initialData.metadata?.tasting_available ?? false,
//           genres_supported: initialData.dj?.genres_supported || initialData.metadata?.genres_supported || [],
//           duration_hours: initialData.dj?.performance_duration_hours || initialData.metadata?.duration_hours || "",
//           equipment: initialData.dj?.equipments_provided || initialData.metadata?.equipment || [],
//           lighting_included: initialData.dj?.lighting_included ?? initialData.metadata?.lighting_included ?? false,
//           mc_host_available: initialData.dj?.mc_host_available ?? initialData.metadata?.mc_host_available ?? false,
//           setup_time_required: initialData.dj?.setup_time_minutes ? initialData.dj.setup_time_minutes / 60 : (initialData.metadata?.setup_time_required || ""),
//           package_type: initialData.photography?.photography_types || initialData.metadata?.package_type || [],
//           hours_covered: initialData.photography?.coverage_hours || initialData.metadata?.hours_covered || "",
//           videography_included: initialData.photography?.videography_available ?? initialData.metadata?.videography_included ?? false,
//           drone_available: initialData.photography?.drone_shoot_available ?? initialData.metadata?.drone_available ?? false,
//           album_included: initialData.photography?.album_included ?? initialData.metadata?.album_included ?? false,
//           event_types: initialData.event_management?.event_types_supported || initialData.metadata?.event_types || [],
//           team_size: initialData.event_management?.team_size || initialData.photography?.team_size || initialData.makeup_artist?.team_size || initialData.metadata?.team_size || "",
//           includes: initialData.event_management?.services_offered || initialData.metadata?.includes || [],

//         });
//         const mediaUrls = initialData.media ? initialData.media.map(m => m.media_url) : (initialData.images || []);
//         setExistingImages(mediaUrls);
//         setPreviewUrls(mediaUrls);
//         setCurrentStep(0);
//       } else {
//         resetForm();
//       }
//     } else {
//       document.body.style.overflow = "";
//     }
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isOpen, initialData]);

//   const resetForm = () => {
//     setFormData({
//       title: "",
//       description: "",
//       tags: [],
//       address_line1: "",
//       address_line2: "",
//       area: "",
//       city: "",
//       state: "",
//       country: "India",
//       pincode: "",
//       geo_point: { lat: "", lon: "" },
//       category: "",
//       variants: [
//         {
//           variant_name: "Basic Package",
//           pricing_type: "BASE_PRICE",
//           price: "",
//           is_default: true,
//           inclusions: ""
//         }
//       ],
//       amenities: [],
//       capacity_min: "",
//       capacity_max: "",
//       hall_type: "",
//       indoor_outdoor: "",
//       square_feet: "",
//       parking_capacity: "",
//       decoration_policy: "",
//       catering_policy: "",
//       alcohol_policy: "",
//       cuisine_types: [],
//       veg_price_per_head: "",
//       nonveg_price_per_head: "",
//       min_order: "",
//       max_order: "",
//       service_style: "",
//       staff_included: false,
//       crockery_cutlery_included: false,
//       tasting_available: false,
//       genres_supported: [],
//       duration_hours: "",
//       equipment: [],
//       lighting_included: false,
//       mc_host_available: false,
//       setup_time_required: "",
//       package_type: [],
//       hours_covered: "",
//       photos_delivered: "",
//       edited_photos_count: "",
//       delivery_time_days: "",
//       videography_included: false,
//       drone_available: false,
//       album_included: false,
//       event_types: [],
//       team_size: "",
//       includes: [],
//       package_modal: "",
//       vendor_network_size: "",
//       experience_years: "",
//       min_budget: "",
//       max_budget: "",
//       languages_supported: [],
//       editing_styles: [],
//       makeup_types: [],
//       brands_used: [],
//       travel_to_client: true,
//       hairstyling_included: true,
//       service_styles_multi: [],
//       special_diets_supported: [],
//     });
//     setExistingImages([]);
//     setNewImages([]);
//     setPreviewUrls([]);
//     setCurrentStep(0);
//   };

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleVariantChange = (index, field, value) => {
//     setFormData(prev => {
//       const newVariants = [...prev.variants];
//       if (field === 'is_default' && value === true) {
//         newVariants.forEach(v => v.is_default = false);
//       }
//       newVariants[index][field] = value;
//       return { ...prev, variants: newVariants };
//     });
//   };

//   const handleAddVariant = () => {
//     setFormData(prev => ({
//       ...prev,
//       variants: [...prev.variants, {
//         variant_name: "New Package",
//         pricing_type: "BASE_PRICE",
//         price: "",
//         is_default: false,
//         inclusions: ""
//       }]
//     }));
//   };

//   const handleDuplicateVariant = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       variants: [...prev.variants, {
//         ...prev.variants[index],
//         variant_name: prev.variants[index].variant_name + " (Copy)",
//         is_default: false
//       }]
//     }));
//   };

//   const handleRemoveVariant = (index) => {
//     if (formData.variants.length > 1) {
//       setFormData(prev => {
//         const newVariants = prev.variants.filter((_, i) => i !== index);
//         if (prev.variants[index].is_default && newVariants.length > 0) {
//           newVariants[0].is_default = true;
//         }
//         return { ...prev, variants: newVariants };
//       });
//     } else {
//       showError("You must have at least one package.", "Validation Error");
//     }
//   };

//   const handleGeoChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       geo_point: {
//         ...prev.geo_point,
//         [field]: value === "" ? "" : parseFloat(value),
//       },
//     }));
//   };

//   const handleAddListItem = (field, value, setValue) => {
//     if (value.trim() && !formData[field].includes(value.trim())) {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: [...prev[field], value.trim()],
//       }));
//       setValue(""); // Clear input
//     }
//   };

//   const handleRemoveListItem = (field, item) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: prev[field].filter((i) => i !== item),
//     }));
//   };

//   const handleAddTag = () => {
//     if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
//       setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
//       setNewTag("");
//     }
//   };

//   const handleRemoveTag = (tag) => {
//     setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
//   };

//   const handleAddAmenity = () => {
//     if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
//       setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, newAmenity.trim()] }));
//       setNewAmenity("");
//     }
//   };

//   const handleRemoveAmenity = (amenity) => {
//     setFormData((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a !== amenity) }));
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setNewImages((prev) => [...prev, ...files]);
//     const newPreviews = files.map((file) => URL.createObjectURL(file));
//     setPreviewUrls((prev) => [...prev, ...newPreviews]);
//   };

//   const handleRemoveImage = (index) => {
//     if (index < existingImages.length) {
//       setExistingImages((prev) => prev.filter((_, i) => i !== index));
//     } else {
//       const newIndex = index - existingImages.length;
//       setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
//     }
//     setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
//   };

//   const validateStep = (step) => {
//     switch (step) {
//       case 0:
//         if (!formData.title || !formData.description || !formData.city || !formData.state || !formData.country || !formData.pincode) {
//           showError("Please fill all required fields in Basic Info", "Validation Error");
//           return false;
//         }
//         if (formData.geo_point.lat !== "" && (formData.geo_point.lat < -90 || formData.geo_point.lat > 90)) {
//           showError("Latitude must be between -90 and 90", "Validation Error");
//           return false;
//         }
//         if (formData.geo_point.lon !== "" && (formData.geo_point.lon < -180 || formData.geo_point.lon > 180)) {
//           showError("Longitude must be between -180 and 180", "Validation Error");
//           return false;
//         }
//         if (formData.title.length < 3 || formData.title.length > 255) {
//           showError("Title must be between 3 and 255 characters", "Validation Error");
//           return false;
//         }
//         return true;
//       case 1:
//         if (!formData.category) {
//           showError("Please select a category", "Validation Error");
//           return false;
//         }
//         if (formData.variants.length === 0) {
//           showError("At least one package is required", "Validation Error");
//           return false;
//         }
//         for (let i = 0; i < formData.variants.length; i++) {
//           const v = formData.variants[i];
//           if (!v.variant_name || !v.pricing_type || v.price === "") {
//             showError(`Please fill all required fields in package: ${v.variant_name || "Unnamed"}`, "Validation Error");
//             return false;
//           }
//           if (v.price < 0) {
//             showError(`Price must be non-negative for package: ${v.variant_name}`, "Validation Error");
//             return false;
//           }
//         }
//         return true;
//       case 2:
//         return true; // Specific details are optional
//       case 3:
//         return true; // Amenities and images are optional
//       case 4:
//         if (!formData.title || !formData.description || !formData.city || !formData.state || !formData.country || !formData.pincode) {
//           showError("Please fill all required fields in Basic Info", "Validation Error");
//           return false;
//         }
//         if (!formData.category || formData.variants.length === 0) {
//           showError("Please select a category and add at least one package", "Validation Error");
//           return false;
//         }
//         if (formData.geo_point.lat !== "" && (formData.geo_point.lat < -90 || formData.geo_point.lat > 90)) {
//           showError("Latitude must be between -90 and 90", "Validation Error");
//           return false;
//         }
//         if (formData.geo_point.lon !== "" && (formData.geo_point.lon < -180 || formData.geo_point.lon > 180)) {
//           showError("Longitude must be between -180 and 180", "Validation Error");
//           return false;
//         }
//         if (formData.title.length < 3 || formData.title.length > 255) {
//           showError("Title must be between 3 and 255 characters", "Validation Error");
//           return false;
//         }
//         for (let i = 0; i < formData.variants.length; i++) {
//           const v = formData.variants[i];
//           if (!v.variant_name || !v.pricing_type || v.price === "") {
//             showError(`Please fill all required fields in package: ${v.variant_name || "Unnamed"}`, "Validation Error");
//             return false;
//           }
//           if (v.price < 0) {
//             showError(`Price must be non-negative for package: ${v.variant_name}`, "Validation Error");
//             return false;
//           }
//         }
//         return true;
//       default:
//         return true;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (currentStep !== 4) {
//       return; // Prevent submission unless in review step
//     }
//     if (!validateStep(currentStep)) return;

//     try {
//       setUploading(true);
//       const formDataToSend = new FormData();

//       const payload = {
//         service_name: formData.title,
//         service_type: formData.category,
//         description: formData.description || "",
//         add_line1: formData.address_line1 || null,
//         add_line2: formData.address_line2 || null,
//         area: formData.area || null,
//         city: formData.city,
//         state: formData.state,
//         country: formData.country,
//         pincode: formData.pincode,
//         latitude: formData.geo_point.lat !== "" ? parseFloat(formData.geo_point.lat) : null,
//         longitude: formData.geo_point.lon !== "" ? parseFloat(formData.geo_point.lon) : null,
//         metadata: {
//           tags: formData.tags || [],
//           amenities: formData.amenities || []
//         },
//         variants: formData.variants.map(v => ({
//           variant_name: v.variant_name,
//           pricing_type: v.pricing_type,
//           currency: "INR",
//           pricing: { base_price: parseFloat(v.price) || 0 },
//           is_default: v.is_default,
//           inclusions: v.inclusions ? v.inclusions.split(",").map(i => i.trim()).filter(Boolean) : [],
//           metadata: {}
//         }))
//       };


//       if (formData.category === "venue") {
//         payload.venue = {
//           venue_type: formData.hall_type || "banquet",
//           venue_nature: formData.indoor_outdoor || "indoor",
//           min_capacity: parseInt(formData.capacity_min) || 10,
//           max_capacity: parseInt(formData.capacity_max) || 1000,
//           square_feet: parseFloat(formData.square_feet) || 1000.55,
//           parking_capacity: parseInt(formData.parking_capacity) || 0,
//           catering_options: { policy: formData.catering_policy || "allowed" },
//           amenities: formData.amenities || [],
//           venue_rules: [
//             ...(formData.decoration_policy ? [`Decoration: ${formData.decoration_policy}`] : []),
//             ...(formData.alcohol_policy ? [`Alcohol: ${formData.alcohol_policy}`] : [])
//           ]
//         };
//       } else if (formData.category === "catering") {
//         payload.catering = {
//           cuisine_types: formData.cuisine_types || [],
//           meal_types: [],
//           veg_price_per_head: parseFloat(formData.veg_price_per_head) || 0,
//           non_veg_price_per_head: parseFloat(formData.nonveg_price_per_head) || 0,
//           min_order: parseInt(formData.min_order) || 1,
//           max_order: parseInt(formData.max_order) || null,
//           service_styles: formData.service_styles_multi || [],
//           staff_included: formData.staff_included,
//           crockery_cutlery_included: formData.crockery_cutlery_included,
//           tasting_available: formData.tasting_available,
//           customizable_menu: true,
//           special_diets_supported: formData.special_diets_supported || []
//         };
//       } else if (formData.category === "dj") {
//         payload.dj = {
//           genres_supported: formData.genres_supported || [],
//           min_budget: initialData.event_management?.min_budget || initialData.metadata?.min_budget || "",
//           max_budget: initialData.event_management?.max_budget || initialData.metadata?.max_budget || "",
//           languages_supported: formData.languages_supported || [],
//           performance_duration_hours: parseFloat(formData.duration_hours) || 4,
//           equipments_provided: formData.equipment || [],
//           sound_system_included: true,
//           lighting_included: formData.lighting_included,
//           mc_host_available: formData.mc_host_available,
//           setup_time_minutes: parseInt(formData.setup_time_required) * 60 || 120,
//           outdoor_supported: true,
//           experience_years: parseInt(formData.experience_years) || 0
//         };
//       } else if (formData.category === "photography") {
//         payload.photography = {
//           photography_types: formData.package_type || [],
//           videography_available: formData.videography_included,
//           drone_shoot_available: formData.drone_available,
//           coverage_hours: parseFloat(formData.hours_covered) || null,
//           album_included: formData.album_included,
//           edited_photos_included: true,
//           raw_photos_provided: false,
//           team_size: parseInt(formData.team_size) || 1,
//           editing_styles: formData.editing_styles || [],
//           experience_years: parseInt(formData.experience_years) || 0
//         };

//       } else if (formData.category === "event_management") {
//         payload.event_management = {
//           event_types_supported: formData.event_types || [],
//           services_offered: formData.includes || [],
//           team_size: parseInt(formData.team_size) || null,
//           min_budget: parseFloat(formData.min_budget) || null,
//           max_budget: parseFloat(formData.max_budget) || null,
//           experience_years: parseInt(formData.experience_years) || 0
//         };
//       } else if (formData.category === "makeup") {
//         payload.makeup_artist = {
//           makeup_types: formData.makeup_types || [],
//           brands_used: formData.brands_used || [],
//           team_size: parseInt(formData.team_size) || 1,
//           hairstyling_included: formData.hairstyling_included,
//           travel_to_client: formData.travel_to_client,
//           experience_years: parseInt(formData.experience_years) || 0
//         };
//       }


//       formDataToSend.append("data", JSON.stringify(payload));

//       // Append images
//       newImages.forEach((file) => formDataToSend.append("images", file));

//       // If editing, append existing_images
//       if (initialData) {
//         formDataToSend.append("existing_images", JSON.stringify(existingImages));
//       }

//       // Call onSubmit
//       await onSubmit(formDataToSend, initialData ? initialData.id : null);

//       showSuccess(
//         initialData ? "Service Updated!" : "Service Created!",
//         `${formData.title} has been ${initialData ? "updated" : "added"} successfully 🎉`
//       );

//       onClose(); // Close only after successful submission
//     } catch (err) {
//       console.error("Service operation failed:", err);
//       const errorMessage = err.response?.data?.detail || err.message || "Something went wrong";
//       showError(
//         "Failed to process service",
//         typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleNext = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep((prev) => prev + 1);
//     }
//   };

//   const handleBack = () => {
//     setCurrentStep((prev) => prev - 1);
//   };

//   const handleEditStep = (step) => {
//     setCurrentStep(step);
//   };

//   const renderStepper = () => (
//     <div className={styles.stepper}>
//       {steps.map((step, index) => (
//         <div
//           key={index}
//           className={`${styles.step} ${index === currentStep ? styles.activeStep : ""} ${index < currentStep ? styles.completedStep : ""}`}
//           onClick={() => index <= currentStep && handleEditStep(index)} // Allow editing current or previous steps
//         >
//           <span>{index + 1}</span>
//           <p>{step}</p>
//         </div>
//       ))}
//     </div>
//   );

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 0:
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Service Title *</label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => handleInputChange("title", e.target.value)}
//                 placeholder="e.g., Royal Wedding Palace"
//                 className={styles.input}
//                 required
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Description *</label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => handleInputChange("description", e.target.value)}
//                 placeholder="Describe your service in detail..."
//                 rows={4}
//                 className={styles.textarea}
//                 required
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>
//                 <Tag className={styles.inlineIcon} /> Tags
//               </label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newTag}
//                   onChange={(e) => setNewTag(e.target.value)}
//                   placeholder="Add tag"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
//                 />
//                 <button type="button" onClick={handleAddTag} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.tags.map((tag) => (
//                   <span key={tag} className={styles.badge}>
//                     {tag}
//                     <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className={styles.section}>
//               <h3 className={styles.sectionTitle}>
//                 <MapPin className={styles.inlineIcon} /> Location Details
//               </h3>
//               <div className={styles.grid}>
//                 <input
//                   type="text"
//                   value={formData.address_line1}
//                   onChange={(e) => handleInputChange("address_line1", e.target.value)}
//                   placeholder="Address Line 1"
//                   className={styles.input}
//                 />
//                 <input
//                   type="text"
//                   value={formData.address_line2}
//                   onChange={(e) => handleInputChange("address_line2", e.target.value)}
//                   placeholder="Address Line 2"
//                   className={styles.input}
//                 />
//                 <input
//                   type="text"
//                   value={formData.area}
//                   onChange={(e) => handleInputChange("area", e.target.value)}
//                   placeholder="Area"
//                   className={styles.input}
//                 />
//                 <input
//                   type="text"
//                   value={formData.city}
//                   onChange={(e) => handleInputChange("city", e.target.value)}
//                   placeholder="City *"
//                   className={styles.input}
//                   required
//                 />
//                 <input
//                   type="text"
//                   value={formData.state}
//                   onChange={(e) => handleInputChange("state", e.target.value)}
//                   placeholder="State *"
//                   className={styles.input}
//                   required
//                 />
//                 <input
//                   type="text"
//                   value={formData.country}
//                   onChange={(e) => handleInputChange("country", e.target.value)}
//                   placeholder="Country *"
//                   className={styles.input}
//                   required
//                 />
//                 <input
//                   type="text"
//                   value={formData.pincode}
//                   onChange={(e) => handleInputChange("pincode", e.target.value)}
//                   placeholder="Pincode *"
//                   className={styles.input}
//                   required
//                 />
//               </div>
//               <div className={styles.geoGroup}>
//                 <input
//                   type="number"
//                   value={formData.geo_point.lat}
//                   onChange={(e) => handleGeoChange("lat", e.target.value)}
//                   placeholder="Latitude (-90 to 90)"
//                   className={styles.input}
//                   min="-90"
//                   max="90"
//                   step="any"
//                 />
//                 <input
//                   type="number"
//                   value={formData.geo_point.lon}
//                   onChange={(e) => handleGeoChange("lon", e.target.value)}
//                   placeholder="Longitude (-180 to 180)"
//                   className={styles.input}
//                   min="-180"
//                   max="180"
//                   step="any"
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Service Category *</label>
//               <select
//                 value={formData.category}
//                 onChange={(e) => handleInputChange("category", e.target.value)}
//                 className={styles.input}
//                 required
//                 disabled={!!initialData}
//               >
//                 <option value="">Select category</option>
//                 {serviceTypes.map((type) => (
//                   <option key={type.value} value={type.value}>
//                     {type.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className={styles.variantsHeader}>
//               <h3 className={styles.sectionTitle}>Packages / Pricing</h3>
//               <button type="button" onClick={handleAddVariant} className={styles.addBtn}>+ Add Package</button>
//             </div>

//             <div className={styles.variantsGrid}>
//               {formData.variants.map((variant, index) => (
//                 <div key={index} className={`${styles.variantCard} ${variant.is_default ? styles.defaultCard : ""}`}>
//                   <div className={styles.variantCardHeader}>
//                     <h4>{variant.variant_name || "Unnamed Package"}</h4>
//                     <div className={styles.variantActions}>
//                       {variant.is_default && <span className={styles.defaultBadge}>Default</span>}
//                       <button type="button" onClick={() => handleVariantChange(index, "is_default", true)} className={styles.actionBtn}>Set Default</button>
//                       <button type="button" onClick={() => handleDuplicateVariant(index)} className={styles.actionBtn}>Copy</button>
//                       <button type="button" onClick={() => handleRemoveVariant(index)} className={styles.removeIconBtn}><Trash2 size={16} /></button>
//                     </div>
//                   </div>

//                   <div className={styles.fieldGroup}>
//                     <label className={styles.label}>Package Name *</label>
//                     <input
//                       type="text"
//                       value={variant.variant_name}
//                       onChange={(e) => handleVariantChange(index, "variant_name", e.target.value)}
//                       placeholder="e.g., Premium Package"
//                       className={styles.input}
//                       required
//                     />
//                   </div>

//                   <div className={styles.variantPriceRow}>
//                     <div className={styles.fieldGroup}>
//                       <label className={styles.label}>Pricing Type *</label>
//                       <select
//                         value={variant.pricing_type}
//                         onChange={(e) => handleVariantChange(index, "pricing_type", e.target.value)}
//                         className={styles.input}
//                         required
//                       >
//                         <option value="">Select pricing type</option>
//                         {pricingTypes.map((type) => (
//                           <option key={type.value} value={type.value}>{type.label}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className={styles.fieldGroup}>
//                       <label className={styles.label}>Price *</label>
//                       <div className={styles.inputWithIcon}>
//                         <DollarSign size={16} className={styles.inputIcon} />
//                         <input
//                           type="number"
//                           value={variant.price}
//                           onChange={(e) => handleVariantChange(index, "price", e.target.value)}
//                           placeholder="e.g., 5000"
//                           className={styles.input}
//                           required
//                           min="0"
//                           step="any"
//                           style={{ paddingLeft: "32px" }}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className={styles.fieldGroup}>
//                     <label className={styles.label}>Features / Inclusions (comma separated)</label>
//                     <input
//                       type="text"
//                       value={variant.inclusions}
//                       onChange={(e) => handleVariantChange(index, "inclusions", e.target.value)}
//                       placeholder="e.g., 5 Hours Coverage, Edited Photos, Drone"
//                       className={styles.input}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       case 2:
//         if (!formData.category) {
//           return <p>Please select a category in the previous step.</p>;
//         }
//         return renderSpecificDetails();
//       case 3:
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Amenities</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newAmenity}
//                   onChange={(e) => setNewAmenity(e.target.value)}
//                   placeholder="Add amenity"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
//                 />
//                 <button type="button" onClick={handleAddAmenity} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.amenities.map((amenity) => (
//                   <span key={amenity} className={styles.badge}>
//                     {amenity}
//                     <button type="button" onClick={() => handleRemoveAmenity(amenity)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className={styles.section}>
//               <h3 className={styles.sectionTitle}>
//                 <ImageIcon className={styles.inlineIcon} /> Images
//               </h3>
//               <div className={styles.uploadBox}>
//                 <Upload className={styles.uploadIcon} />
//                 <p>Drag and drop images here, or click to browse</p>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   onChange={handleImageChange}
//                   className={styles.hiddenInput}
//                   id="imageUpload"
//                 />
//                 <button type="button" onClick={() => document.getElementById("imageUpload").click()} className={styles.chooseBtn}>
//                   Choose Images
//                 </button>
//               </div>
//               {previewUrls.length > 0 && (
//                 <div className={styles.previewGrid}>
//                   {previewUrls.map((url, index) => (
//                     <div key={index} className={styles.previewItem}>
//                       <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImg} />
//                       <button type="button" onClick={() => handleRemoveImage(index)} className={styles.removeImageBtn}>
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         );
//       case 4:
//         return renderReview();
//       default:
//         return null;
//     }
//   };

//   const renderSpecificDetails = () => {
//     const category = formData.category;
//     switch (category) {
//       case "venue":
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Minimum Capacity</label>
//               <input
//                 type="number"
//                 value={formData.capacity_min}
//                 onChange={(e) => handleInputChange("capacity_min", e.target.value)}
//                 placeholder="e.g., 100"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Maximum Capacity</label>
//               <input
//                 type="number"
//                 value={formData.capacity_max}
//                 onChange={(e) => handleInputChange("capacity_max", e.target.value)}
//                 placeholder="e.g., 500"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Hall Type</label>
//               <select
//                 value={formData.hall_type}
//                 onChange={(e) => handleInputChange("hall_type", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select hall type</option>
//                 {hallTypes.map((type) => (
//                   <option key={type.value} value={type.value}>
//                     {type.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Indoor/Outdoor</label>
//               <select
//                 value={formData.indoor_outdoor}
//                 onChange={(e) => handleInputChange("indoor_outdoor", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select</option>
//                 {indoorOutdoorOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Square Feet</label>
//               <input
//                 type="number"
//                 value={formData.square_feet}
//                 onChange={(e) => handleInputChange("square_feet", e.target.value)}
//                 placeholder="e.g., 2000"
//                 className={styles.input}
//                 min="0"
//                 step="any"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Parking Capacity</label>
//               <input
//                 type="number"
//                 value={formData.parking_capacity}
//                 onChange={(e) => handleInputChange("parking_capacity", e.target.value)}
//                 placeholder="e.g., 50"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Decoration Policy</label>
//               <select
//                 value={formData.decoration_policy}
//                 onChange={(e) => handleInputChange("decoration_policy", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select</option>
//                 {policyOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Catering Policy</label>
//               <select
//                 value={formData.catering_policy}
//                 onChange={(e) => handleInputChange("catering_policy", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select</option>
//                 {policyOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Alcohol Policy</label>
//               <select
//                 value={formData.alcohol_policy}
//                 onChange={(e) => handleInputChange("alcohol_policy", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select</option>
//                 {alcoholOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         );
//       case "catering":
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Cuisine Types</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newListItem}
//                   onChange={(e) => setNewListItem(e.target.value)}
//                   placeholder="Add cuisine type"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("cuisine_types"))}
//                 />
//                 <button type="button" onClick={() => handleAddListItem("cuisine_types")} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.cuisine_types.map((item) => (
//                   <span key={item} className={styles.badge}>
//                     {item}
//                     <button type="button" onClick={() => handleRemoveListItem("cuisine_types", item)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Veg Price per Head</label>
//               <input
//                 type="number"
//                 value={formData.veg_price_per_head}
//                 onChange={(e) => handleInputChange("veg_price_per_head", e.target.value)}
//                 placeholder="e.g., 500"
//                 className={styles.input}
//                 min="0"
//                 step="any"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Non-Veg Price per Head</label>
//               <input
//                 type="number"
//                 value={formData.nonveg_price_per_head}
//                 onChange={(e) => handleInputChange("nonveg_price_per_head", e.target.value)}
//                 placeholder="e.g., 700"
//                 className={styles.input}
//                 min="0"
//                 step="any"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Minimum Order</label>
//               <input
//                 type="number"
//                 value={formData.min_order}
//                 onChange={(e) => handleInputChange("min_order", e.target.value)}
//                 placeholder="e.g., 50"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Maximum Order</label>
//               <input
//                 type="number"
//                 value={formData.max_order}
//                 onChange={(e) => handleInputChange("max_order", e.target.value)}
//                 placeholder="e.g., 500"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Service Style</label>
//               <select
//                 value={formData.service_style}
//                 onChange={(e) => handleInputChange("service_style", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select</option>
//                 {serviceStyles.map((style) => (
//                   <option key={style.value} value={style.value}>
//                     {style.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.checkboxGroup}>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.staff_included}
//                   onChange={(e) => handleInputChange("staff_included", e.target.checked)}
//                 />
//                 Staff Included
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.crockery_cutlery_included}
//                   onChange={(e) => handleInputChange("crockery_cutlery_included", e.target.checked)}
//                 />
//                 Crockery & Cutlery Included
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.tasting_available}
//                   onChange={(e) => handleInputChange("tasting_available", e.target.checked)}
//                 />
//                 Tasting Available
//               </label>
//             </div>
//           </div>
//         );
//       case "dj":
//         return (
//           <div className={styles.stepContent}>
//             {/* GENRES */}
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Genres Supported</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newGenre}
//                   onChange={(e) => setNewGenre(e.target.value)}
//                   placeholder="Add genre"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("genres_supported", newGenre, setNewGenre))}
//                 />
//                 <button type="button" onClick={() => handleAddListItem("genres_supported", newGenre, setNewGenre)} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.genres_supported.map((item) => (
//                   <span key={item} className={styles.badge}>
//                     {item}
//                     <button type="button" onClick={() => handleRemoveListItem("genres_supported", item)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* DURATION */}
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Duration Hours</label>
//               <input
//                 type="number"
//                 value={formData.duration_hours}
//                 onChange={(e) => handleInputChange("duration_hours", e.target.value)}
//                 placeholder="e.g., 4"
//                 className={styles.input}
//                 min="0"
//                 step="any"
//               />
//             </div>

//             {/* EQUIPMENT */}
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Equipment</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newEquipment}
//                   onChange={(e) => setNewEquipment(e.target.value)}
//                   placeholder="Add equipment"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("equipment", newEquipment, setNewEquipment))}
//                 />
//                 <button type="button" onClick={() => handleAddListItem("equipment", newEquipment, setNewEquipment)} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.equipment.map((item) => (
//                   <span key={item} className={styles.badge}>
//                     {item}
//                     <button type="button" onClick={() => handleRemoveListItem("equipment", item)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* CHECKBOXES */}
//             <div className={styles.checkboxGroup}>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.lighting_included}
//                   onChange={(e) => handleInputChange("lighting_included", e.target.checked)}
//                 />
//                 Lighting Included
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.mc_host_available}
//                   onChange={(e) => handleInputChange("mc_host_available", e.target.checked)}
//                 />
//                 MC/Host Available
//               </label>
//             </div>

//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Setup Time Required (hours)</label>
//               <input
//                 type="number"
//                 value={formData.setup_time_required}
//                 onChange={(e) => handleInputChange("setup_time_required", e.target.value)}
//                 placeholder="e.g., 2"
//                 className={styles.input}
//                 min="0"
//                 step="any"
//               />
//             </div>
//           </div>
//         );
//       case "photography":
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Package Type</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newListItem}
//                   onChange={(e) => setNewListItem(e.target.value)}
//                   placeholder="Add package type"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("package_type"))}
//                 />
//                 <button type="button" onClick={() => handleAddListItem("package_type")} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.package_type.map((item) => (
//                   <span key={item} className={styles.badge}>
//                     {item}
//                     <button type="button" onClick={() => handleRemoveListItem("package_type", item)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Hours Covered</label>
//               <input
//                 type="number"
//                 value={formData.hours_covered}
//                 onChange={(e) => handleInputChange("hours_covered", e.target.value)}
//                 placeholder="e.g., 8"
//                 className={styles.input}
//                 min="0"
//                 step="any"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Photos Delivered</label>
//               <input
//                 type="number"
//                 value={formData.photos_delivered}
//                 onChange={(e) => handleInputChange("photos_delivered", e.target.value)}
//                 placeholder="e.g., 500"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Edited Photos Count</label>
//               <input
//                 type="number"
//                 value={formData.edited_photos_count}
//                 onChange={(e) => handleInputChange("edited_photos_count", e.target.value)}
//                 placeholder="e.g., 100"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Delivery Time (days)</label>
//               <input
//                 type="number"
//                 value={formData.delivery_time_days}
//                 onChange={(e) => handleInputChange("delivery_time_days", e.target.value)}
//                 placeholder="e.g., 30"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.checkboxGroup}>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.videography_included}
//                   onChange={(e) => handleInputChange("videography_included", e.target.checked)}
//                 />
//                 Videography Included
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.drone_available}
//                   onChange={(e) => handleInputChange("drone_available", e.target.checked)}
//                 />
//                 Drone Available
//               </label>
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={formData.album_included}
//                   onChange={(e) => handleInputChange("album_included", e.target.checked)}
//                 />
//                 Album Included
//               </label>
//             </div>
//           </div>
//         );
//       case "event_management":
//         return (
//           <div className={styles.stepContent}>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Event Types</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newListItem}
//                   onChange={(e) => setNewListItem(e.target.value)}
//                   placeholder="Add event type"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("event_types"))}
//                 />
//                 <button type="button" onClick={() => handleAddListItem("event_types")} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.event_types.map((item) => (
//                   <span key={item} className={styles.badge}>
//                     {item}
//                     <button type="button" onClick={() => handleRemoveListItem("event_types", item)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Team Size</label>
//               <input
//                 type="number"
//                 value={formData.team_size}
//                 onChange={(e) => handleInputChange("team_size", e.target.value)}
//                 placeholder="e.g., 10"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Includes</label>
//               <div className={styles.listInputRow}>
//                 <input
//                   type="text"
//                   value={newListItem}
//                   onChange={(e) => setNewListItem(e.target.value)}
//                   placeholder="Add included service"
//                   className={styles.input}
//                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("includes"))}
//                 />
//                 <button type="button" onClick={() => handleAddListItem("includes")} className={styles.addBtn}>
//                   Add
//                 </button>
//               </div>
//               <div className={styles.listItems}>
//                 {formData.includes.map((item) => (
//                   <span key={item} className={styles.badge}>
//                     {item}
//                     <button type="button" onClick={() => handleRemoveListItem("includes", item)} className={styles.removeBtn}>
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Package Modal</label>
//               <select
//                 value={formData.package_modal}
//                 onChange={(e) => handleInputChange("package_modal", e.target.value)}
//                 className={styles.input}
//               >
//                 <option value="">Select</option>
//                 {packageModals.map((modal) => (
//                   <option key={modal.value} value={modal.value}>
//                     {modal.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Vendor Network Size</label>
//               <input
//                 type="number"
//                 value={formData.vendor_network_size}
//                 onChange={(e) => handleInputChange("vendor_network_size", e.target.value)}
//                 placeholder="e.g., 50"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//             <div className={styles.fieldGroup}>
//               <label className={styles.label}>Experience (years)</label>
//               <input
//                 type="number"
//                 value={formData.experience_years}
//                 onChange={(e) => handleInputChange("experience_years", e.target.value)}
//                 placeholder="e.g., 5"
//                 className={styles.input}
//                 min="0"
//               />
//             </div>
//           </div>
//         );
//       default:
//         return <p>No specific details for this category.</p>;
//     }
//   };

//   const renderReview = () => (
//     <div className={styles.stepContent}>
//       <div className={styles.reviewSection}>
//         <div className={styles.sectionHeader}>
//           <h3>Basic Info</h3>
//           <button className={styles.editBtn} onClick={() => handleEditStep(0)}>
//             <Edit2 size={16} /> Edit
//           </button>
//         </div>
//         <p>Title: {formData.title}</p>
//         <p>Description: {formData.description}</p>
//         <p>Tags: {formData.tags.join(", ") || "None"}</p>
//         <p>Address: {formData.address_line1} {formData.address_line2}, {formData.area}, {formData.city}, {formData.state}, {formData.country} - {formData.pincode}</p>
//         <p>Geo Point: {formData.geo_point.lat || "N/A"}, {formData.geo_point.lon || "N/A"}</p>
//       </div>
//       <div className={styles.reviewSection}>
//         <div className={styles.sectionHeader}>
//           <h3>Packages & Pricing</h3>
//           <button className={styles.editBtn} onClick={() => handleEditStep(1)}>
//             <Edit2 size={16} /> Edit
//           </button>
//         </div>
//         <p>Category: {serviceTypes.find(t => t.value === formData.category)?.label || "N/A"}</p>
//         <div className={styles.reviewVariants}>
//           {formData.variants.map((v, i) => (
//             <div key={i} className={styles.reviewVariantCard}>
//               <h4>{v.variant_name} {v.is_default && "(Default)"}</h4>
//               <p>Type: {pricingTypes.find(t => t.value === v.pricing_type)?.label || v.pricing_type}</p>
//               <p>Price: ₹{v.price}</p>
//               <p>Features: {v.inclusions}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className={styles.reviewSection}>
//         <div className={styles.sectionHeader}>
//           <h3>Specific Details</h3>
//           <button className={styles.editBtn} onClick={() => handleEditStep(2)}>
//             <Edit2 size={16} /> Edit
//           </button>
//         </div>
//         {renderSpecificReview()}
//       </div>
//       <div className={styles.reviewSection}>
//         <div className={styles.sectionHeader}>
//           <h3>Amenities & Images</h3>
//           <button className={styles.editBtn} onClick={() => handleEditStep(3)}>
//             <Edit2 size={16} /> Edit
//           </button>
//         </div>
//         <p>Amenities: {formData.amenities.join(", ") || "None"}</p>
//         <p>Images: {previewUrls.length} uploaded</p>
//       </div>
//     </div>
//   );

//   const renderSpecificReview = () => {
//     const category = formData.category;
//     switch (category) {
//       case "venue":
//         return (
//           <>
//             <p>Capacity: {formData.capacity_min || "N/A"} - {formData.capacity_max || "N/A"}</p>
//             <p>Hall Type: {hallTypes.find(h => h.value === formData.hall_type)?.label || "N/A"}</p>
//             <p>Indoor/Outdoor: {indoorOutdoorOptions.find(o => o.value === formData.indoor_outdoor)?.label || "N/A"}</p>
//             <p>Square Feet: {formData.square_feet || "N/A"}</p>
//             <p>Parking Capacity: {formData.parking_capacity || "N/A"}</p>
//             <p>Decoration Policy: {policyOptions.find(p => p.value === formData.decoration_policy)?.label || "N/A"}</p>
//             <p>Catering Policy: {policyOptions.find(p => p.value === formData.catering_policy)?.label || "N/A"}</p>
//             <p>Alcohol Policy: {alcoholOptions.find(a => a.value === formData.alcohol_policy)?.label || "N/A"}</p>
//           </>
//         );
//       case "catering":
//         return (
//           <>
//             <p>Cuisine Types: {formData.cuisine_types.join(", ") || "None"}</p>
//             <p>Veg Price per Head: {formData.veg_price_per_head || "N/A"}</p>
//             <p>Non-Veg Price per Head: {formData.nonveg_price_per_head || "N/A"}</p>
//             <p>Minimum Order: {formData.min_order || "N/A"}</p>
//             <p>Maximum Order: {formData.max_order || "N/A"}</p>
//             <p>Service Style: {serviceStyles.find(s => s.value === formData.service_style)?.label || "N/A"}</p>
//             <p>Staff Included: {formData.staff_included ? "Yes" : "No"}</p>
//             <p>Crockery & Cutlery Included: {formData.crockery_cutlery_included ? "Yes" : "No"}</p>
//             <p>Tasting Available: {formData.tasting_available ? "Yes" : "No"}</p>
//           </>
//         );
//       case "dj":
//         return (
//           <>
//             <p>Genres Supported: {formData.genres_supported.join(", ") || "None"}</p>
//             <p>Duration Hours: {formData.duration_hours || "N/A"}</p>
//             <p>Equipment: {formData.equipment.join(", ") || "None"}</p>
//             <p>Lighting Included: {formData.lighting_included ? "Yes" : "No"}</p>
//             <p>MC/Host Available: {formData.mc_host_available ? "Yes" : "No"}</p>
//             <p>Setup Time Required: {formData.setup_time_required || "N/A"} hours</p>
//           </>
//         );
//       case "photography":
//         return (
//           <>
//             <p>Package Type: {formData.package_type.join(", ") || "None"}</p>
//             <p>Hours Covered: {formData.hours_covered || "N/A"}</p>
//             <p>Photos Delivered: {formData.photos_delivered || "N/A"}</p>
//             <p>Edited Photos Count: {formData.edited_photos_count || "N/A"}</p>
//             <p>Delivery Time: {formData.delivery_time_days || "N/A"} days</p>
//             <p>Videography Included: {formData.videography_included ? "Yes" : "No"}</p>
//             <p>Drone Available: {formData.drone_available ? "Yes" : "No"}</p>
//             <p>Album Included: {formData.album_included ? "Yes" : "No"}</p>
//           </>
//         );
//       case "event_management":
//         return (
//           <>
//             <p>Event Types: {formData.event_types.join(", ") || "None"}</p>
//             <p>Team Size: {formData.team_size || "N/A"}</p>
//             <p>Includes: {formData.includes.join(", ") || "None"}</p>
//             <p>Package Modal: {packageModals.find(m => m.value === formData.package_modal)?.label || "N/A"}</p>
//             <p>Vendor Network Size: {formData.vendor_network_size || "N/A"}</p>
//             <p>Experience: {formData.experience_years || "N/A"} years</p>
//           </>
//         );
//       default:
//         return <p>No specific details.</p>;
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modalWrapper}>
//         <div className={styles.modal}>
//           <div className={styles.header}>
//             <div className={styles.headerLeft}>
//               <div className={styles.iconBox}>
//                 <Sparkles className={styles.sparkleIcon} />
//               </div>
//               <div>
//                 <h2 className={styles.title}>
//                   {initialData ? "Edit Service" : "Create New Service"}
//                 </h2>
//                 <p className={styles.subtitle}>
//                   {initialData ? "Update your service details" : "Add a new service to your portfolio"}
//                 </p>
//               </div>
//             </div>
//             <button onClick={onClose} className={styles.closeBtn}>
//               <X className={styles.closeIcon} />
//             </button>
//           </div>
//           {renderStepper()}
//           <form onSubmit={handleSubmit} className={styles.form}>
//             {renderStepContent()}
//             <div className={styles.actions}>
//               {currentStep > 0 && (
//                 <button type="button" onClick={handleBack} className={styles.backBtn}>
//                   Back
//                 </button>
//               )}
//               {currentStep < steps.length - 1 ? (
//                 <button type="button" onClick={handleNext} className={styles.nextBtn}>
//                   Next
//                 </button>
//               ) : (
//                 <button type="submit" disabled={uploading} className={styles.submitBtn}>
//                   {uploading ? "Processing..." : (initialData ? "Update Service" : "Publish Service")}
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServiceFormModal;