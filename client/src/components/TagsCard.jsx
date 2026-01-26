import React from "react";
import { Hash } from "lucide-react";
import styles from "../styles/TagsCard.module.css";

export default function TagsCard({ tags }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Hash className={styles.titleIcon} />
        Popular Tags
      </h3>

      <div className={styles.tagsWrapper}>
        {tags.map((tag, index) => {
          const cleanTag = tag.replace("#", "");

          return (
            <span key={index} className={styles.tag}>
              <Hash className={styles.tagIcon} />
              {cleanTag}
            </span>
          );
        })}
      </div>
    </div>
  );
}
