import React, { useState, useEffect } from "react";
import { X, Upload, Trash2, MapPin, DollarSign, Users, Sparkles } from "lucide-react";
import { supabase } from "../utils/supabaseClient.js"
import { showSuccess, showError } from '../utils/toast.js';
import { v4 as uuidv4 } from "uuid";
import styles from '../styles/ServiceForm.module.css';

const ServiceFormModal  = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    country: initialData?.country || "",
    state: initialData?.state || "",
    city: initialData?.city || "",
    venue: initialData?.venue || "",
    capacity: initialData?.capacity || "",
    amenities: initialData?.amenities || [],
    images: initialData?.images || [], // can be URLs or File objects
    ...initialData,
  });

  const [currentAmenity, setCurrentAmenity] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const serviceTypes = [
    "Wedding Venue",
    "DJ",
    "Event Management",
    "Catering",
    "Photography"
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        amenities: initialData.amenities || [],
        images: [],
      });
    } else {
      setFormData({
        name: "",
        type: "",
        description: "",
        price: "",
        country: "India",
        state: "",
        city: "",
        venue: "",
        capacity: "",
        amenities: [],
        images: [],
      });
    }
    setImagePreviewUrls([]);
  }, [initialData, isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (currentAmenity.trim() && !formData.amenities.includes(currentAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, currentAmenity.trim()],
      }));
      setCurrentAmenity("");
    }
  };

  const removeAmenity = (amenityToRemove) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenityToRemove),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      let imageUrls = [];

      for (let img of formData.images) {
        if (img instanceof File) {
          // generate unique path
          const filePath = `services/${uuidv4()}-${img.name}`;

          // upload to supabase
          const { error } = await supabase.storage
            .from("service-images")
            .upload(filePath, img);

          if (error) throw error;

          // get public url
          const { data: publicData } = supabase.storage
            .from("service-images")
            .getPublicUrl(filePath);

          imageUrls.push(publicData.publicUrl);
        } else {
          // already a URL
          imageUrls.push(img);
        }
      }

      // prepare payload (replace images with URLs)
      const payload = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        images: imageUrls,
        // user_id: "b7b7c8b0-e987-4fc9-b076-0fb881b4fdde",
      };

      await onSubmit(payload); // parent will call backend API
      showSuccess(
        'Service Created!',
        `${formData.name} has been added successfully 🎉`
      );

    } catch (err) {
      console.error("Image upload failed:", err.message);
      showError(
        err.message || "Something went wrong",
        `Failed to create ${formData.name}. Please try again.`
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalWrapper} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.modal}>
          {/* Header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Service Name */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Service Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Royal Wedding Palace"
                className={styles.input}
                required
              />
            </div>

            {/* Service Type */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Service Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className={styles.input}
                required
              >
                <option value="">Select service type</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
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

            {/* Price */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <DollarSign className={styles.inlineIcon} />
                Price *
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="e.g., ₹2,50,000 or ₹1,200/plate"
                className={styles.input}
                required
              />
            </div>

            {/* Location */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <MapPin className={styles.inlineIcon} />
                Location Details
              </h3>
              <div className={styles.grid}>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Country"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  className={styles.input}
                  required
                />
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                  placeholder="Venue/Area"
                  className={styles.input}
                />
              </div>
            </div>

            {/* Venue Capacity */}
            {formData.type === "Wedding Venue" && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <Users className={styles.inlineIcon} />
                  Venue Capacity
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  placeholder="e.g., 200-500 guests"
                  className={styles.input}
                />
              </div>
            )}

            {/* Amenities */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Amenities & Features</h3>
              <div className={styles.amenityInputRow}>
                <input
                  type="text"
                  value={currentAmenity}
                  onChange={(e) => setCurrentAmenity(e.target.value)}
                  placeholder="Add amenity/feature"
                  className={styles.input}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                />
                <button type="button" onClick={addAmenity} className={styles.addBtn}>
                  Add
                </button>
              </div>
              <div className={styles.amenitiesList}>
                {formData.amenities.map((amenity) => (
                  <span key={amenity} className={styles.amenityBadge}>
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(amenity)} className={styles.removeAmenity}>
                      <X className={styles.removeIcon} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <Upload className={styles.inlineIcon} />
                Service Images
              </h3>
              <div className={styles.uploadBox}>
                <Upload className={styles.uploadIcon} />
                <p>Drag and drop images here, or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className={styles.hiddenInput}
                  id="imageUpload"
                />
                <button type="button" onClick={() => document.getElementById("imageUpload").click()} className={styles.chooseBtn}>
                  Choose Images
                </button>
              </div>
              {imagePreviewUrls.length > 0 && (
                <div className={styles.previewGrid}>
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className={styles.previewItem}>
                      <img src={url} alt={`Preview ${index + 1}`} className={styles.previewImg} />
                      <button type="button" onClick={() => removeImage(index)} className={styles.removeImageBtn}>
                        <Trash2 className={styles.removeIcon} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button type="submit" disabled={uploading} className={styles.submitBtn}>
                {uploading ? "Processing..." : initialData ? "Update Service" : "Create Service"}
              </button>
              <button type="button" onClick={onClose} disabled={uploading} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;