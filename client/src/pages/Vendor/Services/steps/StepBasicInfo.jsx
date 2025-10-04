import React, { useState } from "react";
import { MapPin, Tag, Image } from "lucide-react";
import styles from "../ServiceFormModal.module.css";

const StepBasicInfo = ({ onNext, data }) => {
  const [title, setTitle] = useState(data?.title || "");
  const [description, setDescription] = useState(data?.description || "");
  const [location, setLocation] = useState(data?.location || "");
  const [tags, setTags] = useState(data?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [images, setImages] = useState(data?.images || []);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...urls]);
  };

  const handleNextClick = () => {
    onNext({ title, description, location, tags, images });
  };

  return (
    <div className={styles.stepForm}>
      <div className={styles.formGroup}>
        <label>Service Title</label>
        <input
          type="text"
          placeholder="Enter service title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Location <MapPin size={18} /></label>
        <input
          type="text"
          placeholder="Enter service location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Description</label>
        <textarea
          rows="4"
          placeholder="Describe your service"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Tags <Tag size={18} /></label>
        <div className={styles.featuresList}>
          {tags.map((tag, i) => (
            <div key={i} className={styles.amenity}>{tag}</div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Add tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button type="button" onClick={handleAddTag}>Add</button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Images <Image size={18} /></label>
        <input type="file" multiple onChange={handleImageUpload} />
        <div className={styles.imagePreview}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="preview" width={80} height={80} />
          ))}
        </div>
      </div>

      <button onClick={handleNextClick}>Next</button>
    </div>
  );
};

export default StepBasicInfo;
