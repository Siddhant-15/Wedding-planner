import { useAdminAuth } from "../../../context/AdminAuthContext";
import { initials } from "../../../utils/format";
import styles from "./Topbar.module.css";

export default function Topbar({ onToggleSidebar, onLogout, title }) {
  const { user } = useAdminAuth();
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onToggleSidebar} aria-label="Toggle menu">
          <span/><span/><span/>
        </button>
        <h1 className={styles.title}>{title || "Dashboard"}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>🔍</span>
          <input placeholder="Search vendors, services, bookings…" />
        </div>
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials(user?.name || "Admin")}</div>
          <div className={styles.profileMeta}>
            <div className={styles.name}>{user?.name || "Admin"}</div>
            <div className={styles.role}>Administrator</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
