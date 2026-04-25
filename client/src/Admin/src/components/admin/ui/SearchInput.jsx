import styles from "./SearchInput.module.css";
export default function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>🔍</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {value && <button className={styles.clear} onClick={() => onChange("")} aria-label="Clear">×</button>}
    </div>
  );
}
