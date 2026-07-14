import styles from "./Empty.module.css";
export default function Empty({ title = "Nothing here yet", text, icon = "📭" }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.title}>{title}</div>
      {text && <div className={styles.text}>{text}</div>}
    </div>
  );
}
