import React, { useState, useEffect } from "react";
import { X, Upload, Trash2, MapPin, DollarSign, Tag, Image as ImageIcon, Edit2, Save, Sparkles } from "lucide-react";
import { showSuccess, showError } from '../utils/toast.js';
import styles from '../styles/ServiceForm.module.css';

const serviceTypes = [
  { value: "venue", label: "Wedding Venue" },
  { value: "dj", label: "DJ" },
  { value: "event_management", label: "Event Management" },
  { value: "catering", label: "Catering" },
  { value: "photographer", label: "Photography" },
];

const pricingTypes = [
  { value: "per_day", label: "Per Day" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_head", label: "Per Head" },
  { value: "package", label: "Package" },
];

const hallTypes = [
  { value: "banquet", label: "Banquet" },
  { value: "lawn", label: "Lawn" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "resort", label: "Resort" },
];

const indoorOutdoorOptions = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "both", label: "Both" },
];

const policyOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "in-house-only", label: "In-House Only" },
];

const alcoholOptions = [
  { value: "allowed", label: "Allowed" },
  { value: "not-allowed", label: "Not Allowed" },
];

const serviceStyles = [
  { value: "buffet", label: "Buffet" },
  { value: "plated", label: "Plated" },
  { value: "live_counter", label: "Live Counter" },
];

const packageModals = [
  { value: "package_based", label: "Package Based" },
  { value: "hourly", label: "Hourly" },
  { value: "fixed", label: "Fixed" },
];

const steps = ["Basic Info", "Service Type & Pricing", "Specific Details", "Amenities & Images", "Review & Publish"];

const ServiceFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
    address_line1: "",
    address_line2: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    geo_point: { lat: "", lon: "" },
    category: "",
    base_price: "",
    pricing_type: "",
    amenities: [],
    capacity_min: "",
    capacity_max: "",
    hall_type: "",
    indoor_outdoor: "",
    square_feet: "",
    parking_capacity: "",
    decoration_policy: "",
    catering_policy: "",
    alcohol_policy: "",
    cuisine_types: [],
    veg_price_per_head: "",
    nonveg_price_per_head: "",
    min_order: "",
    max_order: "",
    service_style: "",
    staff_included: false,
    crockery_cutlery_included: false,
    tasting_available: false,
    genres_supported: [],
    duration_hours: "",
    equipment: [],
    lighting_included: false,
    mc_host_available: false,
    setup_time_required: "",
    package_type: [],
    hours_covered: "",
    photos_delivered: "",
    edited_photos_count: "",
    delivery_time_days: "",
    videography_included: false,
    drone_available: false,
    album_included: false,
    event_types: [],
    team_size: "",
    includes: [],
    package_modal: "",
    vendor_network_size: "",
    experience_years: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [newListItem, setNewListItem] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialData) {
        setFormData({
          ...initialData,
          geo_point: initialData.geo_point || { lat: "", lon: "" },
          tags: initialData.tags || [],
          amenities: initialData.amenities || [],
          cuisine_types: initialData.cuisine_types || [],
          genres_supported: initialData.genres_supported || [],
          equipment: initialData.equipment || [],
          package_type: initialData.package_type || [],
          event_types: initialData.event_types || [],
          includes: initialData.includes || [],
        });
        setExistingImages(initialData.images || []);
        setPreviewUrls(initialData.images || []);
        setCurrentStep(0);
      } else {
        const draft = localStorage.getItem("serviceDraft");
        if (draft) {
          const parsed = JSON.parse(draft);
          setFormData(parsed.formData);
          setCurrentStep(parsed.currentStep);
        } else {
          resetForm();
        }
      }
    } else {
      document.body.style.overflow = "";
      if (!submitted) {
        saveDraft();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, submitted, initialData]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      tags: [],
      address_line1: "",
      address_line2: "",
      area: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      geo_point: { lat: "", lon: "" },
      category: "",
      base_price: "",
      pricing_type: "",
      amenities: [],
      capacity_min: "",
      capacity_max: "",
      hall_type: "",
      indoor_outdoor: "",
      square_feet: "",
      parking_capacity: "",
      decoration_policy: "",
      catering_policy: "",
      alcohol_policy: "",
      cuisine_types: [],
      veg_price_per_head: "",
      nonveg_price_per_head: "",
      min_order: "",
      max_order: "",
      service_style: "",
      staff_included: false,
      crockery_cutlery_included: false,
      tasting_available: false,
      genres_supported: [],
      duration_hours: "",
      equipment: [],
      lighting_included: false,
      mc_host_available: false,
      setup_time_required: "",
      package_type: [],
      hours_covered: "",
      photos_delivered: "",
      edited_photos_count: "",
      delivery_time_days: "",
      videography_included: false,
      drone_available: false,
      album_included: false,
      event_types: [],
      team_size: "",
      includes: [],
      package_modal: "",
      vendor_network_size: "",
      experience_years: "",
    });
    setExistingImages([]);
    setNewImages([]);
    setPreviewUrls([]);
    setCurrentStep(0);
  };

  const saveDraft = () => {
    if (initialData) return; // No draft for edit
    localStorage.setItem(
      "serviceDraft",
      JSON.stringify({
        formData: { ...formData, images: undefined },
        currentStep,
      })
    );
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGeoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      geo_point: {
        ...prev.geo_point,
        [field]: value === "" ? "" : parseFloat(value),
      },
    }));
  };

  const handleAddListItem = (field) => {
    if (newListItem.trim() && !formData[field].includes(newListItem.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], newListItem.trim()],
      }));
      setNewListItem("");
    }
  };

  const handleRemoveListItem = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, newAmenity.trim()] }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a !== amenity) }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.title || !formData.description || !formData.city || !formData.state || !formData.country || !formData.pincode) {
          alert("Please fill all required fields in Basic Info");
          return false;
        }
        if (formData.geo_point.lat !== "" && (formData.geo_point.lat < -90 || formData.geo_point.lat > 90)) {
          alert("Latitude must be between -90 and 90");
          return false;
        }
        if (formData.geo_point.lon !== "" && (formData.geo_point.lon < -180 || formData.geo_point.lon > 180)) {
          alert("Longitude must be between -180 and 180");
          return false;
        }
        if (formData.title.length < 3 || formData.title.length > 255) {
          alert("Title must be between 3 and 255 characters");
          return false;
        }
        return true;
      case 1:
        if (!formData.category || !formData.base_price || !formData.pricing_type) {
          alert("Please fill all required fields in Service Type & Pricing");
          return false;
        }
        if (formData.base_price < 0) {
          alert("Base price must be non-negative");
          return false;
        }
        return true;
      case 2:
        return true; // Specific details are optional
      case 3:
        return true; // Amenities and images are optional
      default:
        return true;
    }
  };

  const isSaveAndExitEnabled = () => {
    return (
      formData.title &&
      formData.description &&
      formData.city &&
      formData.state &&
      formData.country &&
      formData.pincode &&
      formData.category &&
      formData.base_price &&
      formData.pricing_type &&
      formData.title.length >= 3 &&
      formData.title.length <= 255 &&
      formData.base_price >= 0 &&
      (formData.geo_point.lat === "" || (formData.geo_point.lat >= -90 && formData.geo_point.lat <= 90)) &&
      (formData.geo_point.lon === "" || (formData.geo_point.lon >= -180 && formData.geo_point.lon <= 180))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      setUploading(true);
      const formDataToSend = new FormData();

      // Helper function to append optional fields
      const appendOptional = (key, value) => {
        if (value === "" || value === null || value === undefined) {
          formDataToSend.append(key, "");
        } else {
          formDataToSend.append(key, value);
        }
      };

      // Append common fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("tags", JSON.stringify(formData.tags));
      formDataToSend.append("base_price", formData.base_price);
      formDataToSend.append("pricing_type", formData.pricing_type);
      formDataToSend.append("amenities", JSON.stringify(formData.amenities));
      appendOptional("address_line1", formData.address_line1);
      appendOptional("address_line2", formData.address_line2);
      appendOptional("area", formData.area);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("pincode", formData.pincode);
      formDataToSend.append("geo_point", formData.geo_point.lat !== "" && formData.geo_point.lon !== "" ? JSON.stringify(formData.geo_point) : "");

      // Append category
      formDataToSend.append("category", formData.category);

      // Append category-specific fields
      switch (formData.category) {
        case "venue":
          appendOptional("capacity_min", formData.capacity_min);
          appendOptional("capacity_max", formData.capacity_max);
          appendOptional("hall_type", formData.hall_type);
          appendOptional("indoor_outdoor", formData.indoor_outdoor);
          appendOptional("square_feet", formData.square_feet);
          appendOptional("parking_capacity", formData.parking_capacity);
          appendOptional("decoration_policy", formData.decoration_policy);
          appendOptional("catering_policy", formData.catering_policy);
          appendOptional("alcohol_policy", formData.alcohol_policy);
          break;
        case "catering":
          formDataToSend.append("cuisine_types", JSON.stringify(formData.cuisine_types));
          appendOptional("veg_price_per_head", formData.veg_price_per_head);
          appendOptional("nonveg_price_per_head", formData.nonveg_price_per_head);
          appendOptional("min_order", formData.min_order);
          appendOptional("max_order", formData.max_order);
          appendOptional("service_style", formData.service_style);
          formDataToSend.append("staff_included", formData.staff_included);
          formDataToSend.append("crockery_cutlery_included", formData.crockery_cutlery_included);
          formDataToSend.append("tasting_available", formData.tasting_available);
          break;
        case "dj":
          formDataToSend.append("genres_supported", JSON.stringify(formData.genres_supported));
          appendOptional("duration_hours", formData.duration_hours);
          formDataToSend.append("equipment", JSON.stringify(formData.equipment));
          formDataToSend.append("lighting_included", formData.lighting_included);
          formDataToSend.append("mc_host_available", formData.mc_host_available);
          appendOptional("setup_time_required", formData.setup_time_required);
          break;
        case "photographer":
          formDataToSend.append("package_type", JSON.stringify(formData.package_type));
          appendOptional("hours_covered", formData.hours_covered);
          appendOptional("photos_delivered", formData.photos_delivered);
          appendOptional("edited_photos_count", formData.edited_photos_count);
          appendOptional("delivery_time_days", formData.delivery_time_days);
          formDataToSend.append("videography_included", formData.videography_included);
          formDataToSend.append("drone_available", formData.drone_available);
          formDataToSend.append("album_included", formData.album_included);
          break;
        case "event_management":
          formDataToSend.append("event_types", JSON.stringify(formData.event_types));
          appendOptional("team_size", formData.team_size);
          formDataToSend.append("includes", JSON.stringify(formData.includes));
          appendOptional("package_modal", formData.package_modal);
          appendOptional("vendor_network_size", formData.vendor_network_size);
          appendOptional("experience_years", formData.experience_years);
          break;
        default:
          throw new Error("Invalid category");
      }

      // Append images
      newImages.forEach((file) => formDataToSend.append("images", file));

      // If editing, append existing_images
      if (initialData) {
        formDataToSend.append("existing_images", JSON.stringify(existingImages));
      }

      // Call onSubmit
      await onSubmit(formDataToSend, formData.category, initialData ? initialData.id : null);

      showSuccess(
        initialData ? "Service Updated!" : "Service Created!",
        `${formData.title} has been ${initialData ? "updated" : "added"} successfully 🎉`
      );

      setSubmitted(true);
      localStorage.removeItem("serviceDraft");
      onClose();
    } catch (err) {
      console.error("Service operation failed:", err);
      // Enhanced error handling
      const errorMessage = err.response?.data?.detail || err.message || "Something went wrong";
      showError(
        "Failed to process service",
        typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)
      );
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
  };

  const renderStepper = () => (
    <div className={styles.stepper}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.step} ${index === currentStep ? styles.activeStep : ""} ${index < currentStep ? styles.completedStep : ""}`}
          onClick={() => index < currentStep && handleEditStep(index)}
        >
          <span>{index + 1}</span>
          <p>{step}</p>
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
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
                required
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
                required
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
                <button type="button" onClick={handleAddTag} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.tags.map((tag) => (
                  <span key={tag} className={styles.badge}>
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.removeBtn}>
                      <X size={14} />
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
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => handleInputChange("address_line1", e.target.value)}
                  placeholder="Address Line 1"
                  className={styles.input}
                />
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => handleInputChange("address_line2", e.target.value)}
                  placeholder="Address Line 2"
                  className={styles.input}
                />
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  placeholder="Area"
                  className={styles.input}
                />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City *"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State *"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Country *"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="Pincode *"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.geoGroup}>
                <input
                  type="number"
                  value={formData.geo_point.lat}
                  onChange={(e) => handleGeoChange("lat", e.target.value)}
                  placeholder="Latitude (-90 to 90)"
                  className={styles.input}
                  min="-90"
                  max="90"
                  step="any"
                />
                <input
                  type="number"
                  value={formData.geo_point.lon}
                  onChange={(e) => handleGeoChange("lon", e.target.value)}
                  placeholder="Longitude (-180 to 180)"
                  className={styles.input}
                  min="-180"
                  max="180"
                  step="any"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Service Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={styles.input}
                required
              >
                <option value="">Select category</option>
                {serviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <DollarSign className={styles.inlineIcon} /> Base Price *
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => handleInputChange("base_price", e.target.value)}
                placeholder="Enter base price"
                className={styles.input}
                required
                min="0"
                step="any"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Pricing Type *</label>
              <select
                value={formData.pricing_type}
                onChange={(e) => handleInputChange("pricing_type", e.target.value)}
                className={styles.input}
                required
              >
                <option value="">Select pricing type</option>
                {pricingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case 2:
        if (!formData.category) {
          return <p>Please select a category in the previous step.</p>;
        }
        return renderSpecificDetails();
      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Amenities</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add amenity"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
                />
                <button type="button" onClick={handleAddAmenity} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.amenities.map((amenity) => (
                  <span key={amenity} className={styles.badge}>
                    {amenity}
                    <button type="button" onClick={() => handleRemoveAmenity(amenity)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
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
                <button type="button" onClick={() => document.getElementById("imageUpload").click()} className={styles.chooseBtn}>
                  Choose Images
                </button>
              </div>
              {previewUrls.length > 0 && (
                <div className={styles.previewGrid}>
                  {previewUrls.map((url, index) => (
                    <div key={index} className={styles.previewItem}>
                      <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImg} />
                      <button type="button" onClick={() => handleRemoveImage(index)} className={styles.removeImageBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  const renderSpecificDetails = () => {
    const category = formData.category;
    switch (category) {
      case "venue":
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Minimum Capacity</label>
              <input
                type="number"
                value={formData.capacity_min}
                onChange={(e) => handleInputChange("capacity_min", e.target.value)}
                placeholder="e.g., 100"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Maximum Capacity</label>
              <input
                type="number"
                value={formData.capacity_max}
                onChange={(e) => handleInputChange("capacity_max", e.target.value)}
                placeholder="e.g., 500"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Hall Type</label>
              <select
                value={formData.hall_type}
                onChange={(e) => handleInputChange("hall_type", e.target.value)}
                className={styles.input}
              >
                <option value="">Select hall type</option>
                {hallTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Indoor/Outdoor</label>
              <select
                value={formData.indoor_outdoor}
                onChange={(e) => handleInputChange("indoor_outdoor", e.target.value)}
                className={styles.input}
              >
                <option value="">Select</option>
                {indoorOutdoorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Square Feet</label>
              <input
                type="number"
                value={formData.square_feet}
                onChange={(e) => handleInputChange("square_feet", e.target.value)}
                placeholder="e.g., 2000"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Parking Capacity</label>
              <input
                type="number"
                value={formData.parking_capacity}
                onChange={(e) => handleInputChange("parking_capacity", e.target.value)}
                placeholder="e.g., 50"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Decoration Policy</label>
              <select
                value={formData.decoration_policy}
                onChange={(e) => handleInputChange("decoration_policy", e.target.value)}
                className={styles.input}
              >
                <option value="">Select</option>
                {policyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Catering Policy</label>
              <select
                value={formData.catering_policy}
                onChange={(e) => handleInputChange("catering_policy", e.target.value)}
                className={styles.input}
              >
                <option value="">Select</option>
                {policyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Alcohol Policy</label>
              <select
                value={formData.alcohol_policy}
                onChange={(e) => handleInputChange("alcohol_policy", e.target.value)}
                className={styles.input}
              >
                <option value="">Select</option>
                {alcoholOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case "catering":
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Cuisine Types</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="Add cuisine type"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("cuisine_types"))}
                />
                <button type="button" onClick={() => handleAddListItem("cuisine_types")} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.cuisine_types.map((item) => (
                  <span key={item} className={styles.badge}>
                    {item}
                    <button type="button" onClick={() => handleRemoveListItem("cuisine_types", item)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Veg Price per Head</label>
              <input
                type="number"
                value={formData.veg_price_per_head}
                onChange={(e) => handleInputChange("veg_price_per_head", e.target.value)}
                placeholder="e.g., 500"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Non-Veg Price per Head</label>
              <input
                type="number"
                value={formData.nonveg_price_per_head}
                onChange={(e) => handleInputChange("nonveg_price_per_head", e.target.value)}
                placeholder="e.g., 700"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Minimum Order</label>
              <input
                type="number"
                value={formData.min_order}
                onChange={(e) => handleInputChange("min_order", e.target.value)}
                placeholder="e.g., 50"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Maximum Order</label>
              <input
                type="number"
                value={formData.max_order}
                onChange={(e) => handleInputChange("max_order", e.target.value)}
                placeholder="e.g., 500"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Service Style</label>
              <select
                value={formData.service_style}
                onChange={(e) => handleInputChange("service_style", e.target.value)}
                className={styles.input}
              >
                <option value="">Select</option>
                {serviceStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.staff_included}
                  onChange={(e) => handleInputChange("staff_included", e.target.checked)}
                />
                Staff Included
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.crockery_cutlery_included}
                  onChange={(e) => handleInputChange("crockery_cutlery_included", e.target.checked)}
                />
                Crockery & Cutlery Included
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.tasting_available}
                  onChange={(e) => handleInputChange("tasting_available", e.target.checked)}
                />
                Tasting Available
              </label>
            </div>
          </div>
        );
      case "dj":
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Genres Supported</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="Add genre"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("genres_supported"))}
                />
                <button type="button" onClick={() => handleAddListItem("genres_supported")} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.genres_supported.map((item) => (
                  <span key={item} className={styles.badge}>
                    {item}
                    <button type="button" onClick={() => handleRemoveListItem("genres_supported", item)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Duration Hours</label>
              <input
                type="number"
                value={formData.duration_hours}
                onChange={(e) => handleInputChange("duration_hours", e.target.value)}
                placeholder="e.g., 4"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Equipment</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="Add equipment"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("equipment"))}
                />
                <button type="button" onClick={() => handleAddListItem("equipment")} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.equipment.map((item) => (
                  <span key={item} className={styles.badge}>
                    {item}
                    <button type="button" onClick={() => handleRemoveListItem("equipment", item)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.lighting_included}
                  onChange={(e) => handleInputChange("lighting_included", e.target.checked)}
                />
                Lighting Included
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.mc_host_available}
                  onChange={(e) => handleInputChange("mc_host_available", e.target.checked)}
                />
                MC/Host Available
              </label>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Setup Time Required (hours)</label>
              <input
                type="number"
                value={formData.setup_time_required}
                onChange={(e) => handleInputChange("setup_time_required", e.target.value)}
                placeholder="e.g., 2"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>
          </div>
        );
      case "photographer":
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Package Type</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="Add package type"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("package_type"))}
                />
                <button type="button" onClick={() => handleAddListItem("package_type")} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.package_type.map((item) => (
                  <span key={item} className={styles.badge}>
                    {item}
                    <button type="button" onClick={() => handleRemoveListItem("package_type", item)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Hours Covered</label>
              <input
                type="number"
                value={formData.hours_covered}
                onChange={(e) => handleInputChange("hours_covered", e.target.value)}
                placeholder="e.g., 8"
                className={styles.input}
                min="0"
                step="any"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Photos Delivered</label>
              <input
                type="number"
                value={formData.photos_delivered}
                onChange={(e) => handleInputChange("photos_delivered", e.target.value)}
                placeholder="e.g., 500"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Edited Photos Count</label>
              <input
                type="number"
                value={formData.edited_photos_count}
                onChange={(e) => handleInputChange("edited_photos_count", e.target.value)}
                placeholder="e.g., 100"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Delivery Time (days)</label>
              <input
                type="number"
                value={formData.delivery_time_days}
                onChange={(e) => handleInputChange("delivery_time_days", e.target.value)}
                placeholder="e.g., 30"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.videography_included}
                  onChange={(e) => handleInputChange("videography_included", e.target.checked)}
                />
                Videography Included
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.drone_available}
                  onChange={(e) => handleInputChange("drone_available", e.target.checked)}
                />
                Drone Available
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.album_included}
                  onChange={(e) => handleInputChange("album_included", e.target.checked)}
                />
                Album Included
              </label>
            </div>
          </div>
        );
      case "event_management":
        return (
          <div className={styles.stepContent}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Event Types</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="Add event type"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("event_types"))}
                />
                <button type="button" onClick={() => handleAddListItem("event_types")} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.event_types.map((item) => (
                  <span key={item} className={styles.badge}>
                    {item}
                    <button type="button" onClick={() => handleRemoveListItem("event_types", item)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Team Size</label>
              <input
                type="number"
                value={formData.team_size}
                onChange={(e) => handleInputChange("team_size", e.target.value)}
                placeholder="e.g., 10"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Includes</label>
              <div className={styles.listInputRow}>
                <input
                  type="text"
                  value={newListItem}
                  onChange={(e) => setNewListItem(e.target.value)}
                  placeholder="Add included service"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("includes"))}
                />
                <button type="button" onClick={() => handleAddListItem("includes")} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.listItems}>
                {formData.includes.map((item) => (
                  <span key={item} className={styles.badge}>
                    {item}
                    <button type="button" onClick={() => handleRemoveListItem("includes", item)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Package Modal</label>
              <select
                value={formData.package_modal}
                onChange={(e) => handleInputChange("package_modal", e.target.value)}
                className={styles.input}
              >
                <option value="">Select</option>
                {packageModals.map((modal) => (
                  <option key={modal.value} value={modal.value}>
                    {modal.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Vendor Network Size</label>
              <input
                type="number"
                value={formData.vendor_network_size}
                onChange={(e) => handleInputChange("vendor_network_size", e.target.value)}
                placeholder="e.g., 50"
                className={styles.input}
                min="0"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Experience (years)</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange("experience_years", e.target.value)}
                placeholder="e.g., 5"
                className={styles.input}
                min="0"
              />
            </div>
          </div>
        );
      default:
        return <p>No specific details for this category.</p>;
    }
  };

  const renderReview = () => (
    <div className={styles.stepContent}>
      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Basic Info</h3>
          <button className={styles.editBtn} onClick={() => handleEditStep(0)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        <p>Title: {formData.title}</p>
        <p>Description: {formData.description}</p>
        <p>Tags: {formData.tags.join(", ") || "None"}</p>
        <p>Address: {formData.address_line1} {formData.address_line2}, {formData.area}, {formData.city}, {formData.state}, {formData.country} - {formData.pincode}</p>
        <p>Geo Point: {formData.geo_point.lat || "N/A"}, {formData.geo_point.lon || "N/A"}</p>
      </div>
      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Service Type & Pricing</h3>
          <button className={styles.editBtn} onClick={() => handleEditStep(1)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        <p>Category: {serviceTypes.find(t => t.value === formData.category)?.label || "N/A"}</p>
        <p>Base Price: {formData.base_price}</p>
        <p>Pricing Type: {pricingTypes.find(t => t.value === formData.pricing_type)?.label || "N/A"}</p>
      </div>
      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Specific Details</h3>
          <button className={styles.editBtn} onClick={() => handleEditStep(2)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        {renderSpecificReview()}
      </div>
      <div className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h3>Amenities & Images</h3>
          <button className={styles.editBtn} onClick={() => handleEditStep(3)}>
            <Edit2 size={16} /> Edit
          </button>
        </div>
        <p>Amenities: {formData.amenities.join(", ") || "None"}</p>
        <p>Images: {previewUrls.length} uploaded</p>
      </div>
    </div>
  );

  const renderSpecificReview = () => {
    const category = formData.category;
    switch (category) {
      case "venue":
        return (
          <>
            <p>Capacity: {formData.capacity_min || "N/A"} - {formData.capacity_max || "N/A"}</p>
            <p>Hall Type: {hallTypes.find(h => h.value === formData.hall_type)?.label || "N/A"}</p>
            <p>Indoor/Outdoor: {indoorOutdoorOptions.find(o => o.value === formData.indoor_outdoor)?.label || "N/A"}</p>
            <p>Square Feet: {formData.square_feet || "N/A"}</p>
            <p>Parking Capacity: {formData.parking_capacity || "N/A"}</p>
            <p>Decoration Policy: {policyOptions.find(p => p.value === formData.decoration_policy)?.label || "N/A"}</p>
            <p>Catering Policy: {policyOptions.find(p => p.value === formData.catering_policy)?.label || "N/A"}</p>
            <p>Alcohol Policy: {alcoholOptions.find(a => a.value === formData.alcohol_policy)?.label || "N/A"}</p>
          </>
        );
      case "catering":
        return (
          <>
            <p>Cuisine Types: {formData.cuisine_types.join(", ") || "None"}</p>
            <p>Veg Price per Head: {formData.veg_price_per_head || "N/A"}</p>
            <p>Non-Veg Price per Head: {formData.nonveg_price_per_head || "N/A"}</p>
            <p>Minimum Order: {formData.min_order || "N/A"}</p>
            <p>Maximum Order: {formData.max_order || "N/A"}</p>
            <p>Service Style: {serviceStyles.find(s => s.value === formData.service_style)?.label || "N/A"}</p>
            <p>Staff Included: {formData.staff_included ? "Yes" : "No"}</p>
            <p>Crockery & Cutlery Included: {formData.crockery_cutlery_included ? "Yes" : "No"}</p>
            <p>Tasting Available: {formData.tasting_available ? "Yes" : "No"}</p>
          </>
        );
      case "dj":
        return (
          <>
            <p>Genres Supported: {formData.genres_supported.join(", ") || "None"}</p>
            <p>Duration Hours: {formData.duration_hours || "N/A"}</p>
            <p>Equipment: {formData.equipment.join(", ") || "None"}</p>
            <p>Lighting Included: {formData.lighting_included ? "Yes" : "No"}</p>
            <p>MC/Host Available: {formData.mc_host_available ? "Yes" : "No"}</p>
            <p>Setup Time Required: {formData.setup_time_required || "N/A"} hours</p>
          </>
        );
      case "photographer":
        return (
          <>
            <p>Package Type: {formData.package_type.join(", ") || "None"}</p>
            <p>Hours Covered: {formData.hours_covered || "N/A"}</p>
            <p>Photos Delivered: {formData.photos_delivered || "N/A"}</p>
            <p>Edited Photos Count: {formData.edited_photos_count || "N/A"}</p>
            <p>Delivery Time: {formData.delivery_time_days || "N/A"} days</p>
            <p>Videography Included: {formData.videography_included ? "Yes" : "No"}</p>
            <p>Drone Available: {formData.drone_available ? "Yes" : "No"}</p>
            <p>Album Included: {formData.album_included ? "Yes" : "No"}</p>
          </>
        );
      case "event_management":
        return (
          <>
            <p>Event Types: {formData.event_types.join(", ") || "None"}</p>
            <p>Team Size: {formData.team_size || "N/A"}</p>
            <p>Includes: {formData.includes.join(", ") || "None"}</p>
            <p>Package Modal: {packageModals.find(m => m.value === formData.package_modal)?.label || "N/A"}</p>
            <p>Vendor Network Size: {formData.vendor_network_size || "N/A"}</p>
            <p>Experience: {formData.experience_years || "N/A"} years</p>
          </>
        );
      default:
        return <p>No specific details.</p>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalWrapper}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.iconBox}>
                <Sparkles className={styles.sparkleIcon} />
              </div>
              <div>
                <h2 className={styles.title}>
                  {initialData ? "Edit Service" : "Create New Service"}
                </h2>
                <p className={styles.subtitle}>
                  {initialData ? "Update your service details" : "Add a new service to your portfolio"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className={styles.closeBtn}>
              <X className={styles.closeIcon} />
            </button>
          </div>
          {renderStepper()}
          <form onSubmit={(e) => currentStep === steps.length - 1 && handleSubmit(e)} className={styles.form}>
            {renderStepContent()}
            <div className={styles.actions}>
              {currentStep > 0 && (
                <button type="button" onClick={handleBack} className={styles.backBtn}>
                  Back
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={handleNext} className={styles.nextBtn}>
                  Next
                </button>
              ) : (
                <button type="submit" disabled={uploading} className={styles.submitBtn}>
                  {uploading ? "Processing..." : initialData ? "Update Service" : "Create Service"}
                </button>
              )}
              {!initialData && (
                <button
                  type="button"
                  onClick={saveDraft}
                  className={styles.draftBtn}
                  disabled={!isSaveAndExitEnabled()}
                >
                  <Save size={16} /> Save & Exit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;