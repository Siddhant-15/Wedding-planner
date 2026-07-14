import styles from "./StatusBadge.module.css";

const TONES = {
  pending: "warning", needs_revision: "warning", open: "warning",
  active: "success", approved: "success", confirmed: "success", verified: "success", resolved: "success",
  rejected: "danger", cancelled: "danger", suspended: "danger", banned: "danger", flagged: "danger",
  draft: "neutral", inactive: "neutral",
};

export default function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const tone = TONES[key] || "neutral";
  const label = key.replace(/_/g, " ");
  return <span className={`${styles.badge} ${styles[tone]}`}>{label || "—"}</span>;
}
