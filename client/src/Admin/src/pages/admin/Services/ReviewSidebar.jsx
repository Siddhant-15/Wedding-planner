import { REVIEW_SECTIONS, sectionIcon } from "./reviewSections";
import styles from "./ReviewSidebar.module.css";

export default function ReviewSidebar({ sections, activeKey, onSelect, progress }) {
  const statusByKey = Object.fromEntries(sections.map((s) => [s.section, s.status]));

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.list}>
        {REVIEW_SECTIONS.map((s) => {
          const status = statusByKey[s.key] || "pending";
          const isActive = s.key === activeKey;
          return (
            <li key={s.key}>
              <button
                type="button"
                className={`${styles.item} ${isActive ? styles.itemActive : ""} ${styles[status]}`}
                onClick={() => onSelect(s.key)}
              >
                <span className={styles.icon}>{sectionIcon(status)}</span>
                <span className={styles.label}>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {progress && (
        <div className={styles.progress}>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${(progress.reviewed_sections / Math.max(progress.total_sections, 1)) * 100}%`,
              }}
            />
          </div>
          <span className={styles.progressText}>
            {progress.reviewed_sections}/{progress.total_sections} reviewed
            {progress.changes_requested_sections > 0
              ? ` · ${progress.changes_requested_sections} need changes`
              : ""}
          </span>
        </div>
      )}
    </nav>
  );
}
