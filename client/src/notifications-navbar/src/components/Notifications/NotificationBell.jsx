import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  mockNotifications,
  NOTIFICATION_TYPES,
  timeAgo,
} from "../../data/notificationsMock";
import styles from "./NotificationBell.module.css";

const ICONS = {
  Sparkles,
  MessageSquare,
  Bell,
  AlertTriangle,
  Star,
};

/**
 * NotificationBell
 * - Bell icon with unread badge
 * - Click → opens dropdown with last 5
 * - "View All" → /notifications
 *
 * Props:
 *   notifications? : optional override list
 *   basePath?      : route prefix for "View All" (default "/notifications")
 */
export default function NotificationBell({
  notifications = mockNotifications,
  basePath = "/notifications",
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const unread = notifications.filter((n) => !n.isRead).length;
  const recent = notifications.slice(0, 5);

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleItem = useCallback(
    (n) => {
      setOpen(false);
      navigate(n.link || basePath);
    },
    [navigate, basePath]
  );

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="menu" className={styles.dropdown}>
          <header className={styles.dropHeader}>
            <span className={styles.dropTitle}>Notifications</span>
            {unread > 0 && (
              <span className={styles.dropMeta}>{unread} unread</span>
            )}
          </header>

          <ul className={styles.list}>
            {recent.length === 0 && (
              <li className={styles.empty}>
                <Bell size={22} />
                <span>No notifications yet</span>
              </li>
            )}

            {recent.map((n) => {
              const meta = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.reminder;
              const Icon = ICONS[meta.icon] || Bell;
              return (
                <li key={n.id}>
                  <button
                    className={`${styles.item} ${!n.isRead ? styles.unread : ""}`}
                    onClick={() => handleItem(n)}
                  >
                    <span
                      className={`${styles.itemIcon} ${styles[`tone_${meta.color}`]}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </span>
                    <span className={styles.itemBody}>
                      <span className={styles.itemTitle}>{n.title}</span>
                      <span className={styles.itemMsg}>{n.message}</span>
                      <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.isRead && <span className={styles.dot} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <footer className={styles.dropFooter}>
            <button
              className={styles.viewAll}
              onClick={() => {
                setOpen(false);
                navigate(basePath);
              }}
            >
              View all
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
