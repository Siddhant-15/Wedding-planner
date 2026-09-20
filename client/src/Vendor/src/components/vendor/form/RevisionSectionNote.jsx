// src/components/vendor/form/RevisionSectionNote.jsx
import { AlertTriangle } from "lucide-react";
import styles from "../../../styles/RevisionSectionNote.module.css";

const SECTION_LABELS = {
  basic_information: "Basic information",
  location: "Location",
  media: "Photos & videos",
  pricing_variants: "Pricing & packages",
  service_details: "Service details",
  policies_metadata: "Policies & metadata",
};

const formatSection = (section) =>
  SECTION_LABELS[section] ||
  String(section || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * notes: array of { section, comment } for the CURRENT step only
 */
export default function RevisionSectionNote({ notes }) {
  if (!notes?.length) return null;

  return (
    <div className={styles.wrap} role="status">
      <div className={styles.head}>
        <span className={styles.icon}>
          <AlertTriangle size={14} />
        </span>
        <div>
          <strong className={styles.title}>Admin requested changes here</strong>
          <p className={styles.sub}>
            Update this section as noted, then continue.
          </p>
        </div>
      </div>

      <ul className={styles.list}>
        {notes.map((item, i) => (
          <li key={`${item.section}-${i}`} className={styles.item}>
            <span className={styles.section}>{formatSection(item.section)}</span>
            {item.comment ? (
              <p className={styles.comment}>{item.comment}</p>
            ) : (
              <p className={styles.muted}>
                No specific note — review this section carefully.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}