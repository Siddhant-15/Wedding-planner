import React, { useState } from "react";
import { Tag } from "lucide-react";
import styles from "../ServiceFormModal.module.css";

const StepVariants = ({ onNext, onBack, data }) => {
  const [variants, setVariants] = useState(data?.variants || []);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAddVariant = () => {
    if (!name || !price) return;
    setVariants([...variants, { name, price }]);
    setName("");
    setPrice("");
  };

  const handleNextClick = () => {
    onNext({ variants });
  };

  return (
    <div className={styles.stepForm}>
      {variants.map((v, i) => (
        <div key={i} className={styles.variantCard}>
          <p>{v.name} - ${v.price}</p>
        </div>
      ))}

      <div className={styles.formGroup}>
        <label>Package Name <Tag size={18} /></label>
        <input
          type="text"
          placeholder="Enter package name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Price</label>
        <input
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <button type="button" onClick={handleAddVariant}>Add Package</button>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button className={styles.backBtn} onClick={onBack}>Back</button>
        <button onClick={handleNextClick}>Next</button>
      </div>
    </div>
  );
};

export default StepVariants;
