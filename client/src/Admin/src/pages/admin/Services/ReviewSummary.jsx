import { REVIEW_SECTIONS } from "./reviewSections";
import styles from "./ReviewSummary.module.css";

export default function ReviewSummary({ sections }) {
  const statusByKey = Object.fromEntries(sections.map((s) => [s.section, s.status]));
  const blocked = sections.some((s) => s.status === "changes_requested");

  return (
    <div className={styles.summary}>
      <h4 className={styles.title}>Review Summary</h4>
      <ul className={styles.list}>
        {REVIEW_SECTIONS.map((s) => {
          const status = statusByKey[s.key] || "pending";
          return (
            <li key={s.key} className={styles.row}>
              <span>{s.label}</span>
              <span className={`${styles.badge} ${styles[status]}`}>
                {status === "pending" && "Not reviewed"}
                {status === "approved" && "Approved"}
                {status === "changes_requested" && "Changes requested"}
              </span>
            </li>
          );
        })}
      </ul>
      {blocked && (
        <p className={styles.blockedNote}>
          At least one section requires changes. This service cannot be approved.
        </p>
      )}
    </div>
  );
}
