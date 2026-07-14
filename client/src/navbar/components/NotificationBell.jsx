import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Star,
} from "lucide-react";

import styles from "./NotificationBell.module.css";
import { useAuth } from "@/context/AuthContext";
import { notificationService } from "../../utils/api/services/notification.service";

const ICONS = {
  Sparkles,
  MessageSquare,
  Bell,
  AlertTriangle,
  Star,
};

export default function NotificationBell({
  basePath = "/customer/notifications",
}) {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const wrapRef = useRef(null);
  const wsRef = useRef(null);

  // ✅ Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll();

      if (!Array.isArray(data)) {
        console.error("Invalid notifications response:", data);
        setNotifications([]);
        setUnread(0);
        return;
      }

      setNotifications(data);
      setUnread(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setNotifications([]);
      setUnread(0);
    }
  }, []);

  // ✅ WebSocket
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(
      `ws://localhost:8000/api/v1/notification/ws?token=${token}`
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setNotifications((prev) => [
        {
          id: Date.now(),
          ...data,
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setUnread((prev) => prev + 1);
    };

    ws.onerror = (err) => console.error("WS error", err);

    return () => ws.close();
  }, [token]);

  // ✅ Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // close dropdown
  useEffect(() => {
    if (!open) return;

    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };

    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ✅ mark as read
  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleItem = useCallback(
    async (n) => {
      if (!n.is_read) {
        await handleMarkRead(n.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, is_read: true } : item
          )
        );

        setUnread((prev) => Math.max(prev - 1, 0));
      }

      setOpen(false);
      navigate(n.link || basePath);
    },
    [navigate, basePath]
  );

  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : [];

  const recent = safeNotifications.slice(0, 5);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className={styles.badge}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <header className={styles.dropHeader}>
            <span>Notifications</span>
            {unread > 0 && <span>{unread} unread</span>}
          </header>

          <ul className={styles.list}>
            {recent.length === 0 && (
              <li className={styles.empty}>No notifications</li>
            )}

            {recent.map((n) => {
              const Icon = ICONS[n.icon] || Bell;

              return (
                <li key={n.id}>
                  <button
                    className={`${styles.item} ${!n.is_read ? styles.unread : ""
                      }`}
                    onClick={() => handleItem(n)}
                  >
                    <span
                      className={`${styles.itemIcon} ${styles[`tone_${n.tone || "brand"}`]
                        }`}
                    >
                      <Icon size={16} />
                    </span>

                    <span className={styles.itemBody}>
                      <span className={styles.itemTitle}>
                        {n.title}
                      </span>

                      <span className={styles.itemMsg}>
                        {n.message}
                      </span>

                      <span className={styles.itemTime}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </span>

                    {!n.is_read && <span className={styles.dot} />}
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