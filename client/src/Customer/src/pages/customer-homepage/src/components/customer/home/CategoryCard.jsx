import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CategoryCard.module.css";

export default function CategoryCard({ category }) {
  const navigate = useNavigate();
  const Icon = category.icon;

  const handleClick = () => navigate(`/services?type=${category.value}`);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={handleClick}
      aria-label={`Browse ${category.label}`}
    >
      <span className={styles.iconWrap} style={{ background: category.bg }}>
        <Icon size={28} strokeWidth={1.8} />
      </span>
      <span className={styles.label}>{category.label}</span>
      <span className={styles.hint}>Explore →</span>
    </button>
  );
}
