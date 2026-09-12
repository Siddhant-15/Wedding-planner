// ReviewSidebar.jsx
import { REVIEW_SECTIONS, sectionIcon } from "./reviewSections";
import styles from "./ReviewSidebar.module.css";

export default function ReviewSidebar({
  sections,
  activeKey,
  onSelect,
  progress,
}) {
  const statusByKey = Object.fromEntries(
    (sections || []).map((s) => [s.section, s.status])
  );

  const blocked = (sections || []).some((s) => s.status === "changes_requested");
  const reviewed = progress?.reviewed_sections ?? 0;
  const total = progress?.total_sections ?? REVIEW_SECTIONS.length;
  const pct = total ? Math.round((reviewed / total) * 100) : 0;

  return (
    <aside className={styles.sidebar}>
      {/* Progress header */}
      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <span className={styles.progressTitle}>Review Progress</span>
          <span className={styles.progressPct}>{pct}%</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className={styles.progressMeta}>
          <span>
            {reviewed}/{total} reviewed
          </span>
          {progress?.changes_requested_sections > 0 && (
            <span className={styles.needChanges}>
              {progress.changes_requested_sections} need changes
            </span>
          )}
        </div>
      </div>

      {/* Section list (acts as both nav + summary) */}
      <nav className={styles.nav}>
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
                  <span className={styles.iconWrap}>
                    <span className={styles.icon}>{sectionIcon(status)}</span>
                  </span>
                  <span className={styles.label}>{s.label}</span>
                  <span className={`${styles.statusChip} ${styles[status]}`}>
                    {status === "pending" && "Pending"}
                    {status === "approved" && "Approved"}
                    {status === "changes_requested" && "Changes"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {blocked && (
        <div className={styles.blockedNote}>
          At least one section requires changes. This service cannot be approved until resolved.
        </div>
      )}
    </aside>
  );
}