import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Star,
  Check,
  Inbox,
} from "lucide-react";
import styles from "./Notifications.module.css";

import { notificationService } from "../../../utils/api/services/notification.service";

const ICONS = {
  new_lead: Sparkles,
  message: MessageSquare,
  alert: AlertTriangle,
  review: Star,
};

export default function Notifications() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unread
  const [loading, setLoading] = useState(true);

  // ✅ FETCH NOTIFICATIONS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await notificationService.getAll();

        // 🔥 normalize backend → frontend
        const mapped = (data || []).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.is_read,
          createdAt: n.created_at,
          data: n.data || {},
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ FILTER LOGIC
  const filtered = useMemo(() => {
    if (filter === "unread") return items.filter((n) => !n.isRead);
    return items;
  }, [items, filter]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  // ✅ MARK SINGLE
  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);

      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark read failed", err);
    }
  }, []);

  // ✅ MARK ALL
  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();

      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all failed", err);
    }
  }, []);

  // ✅ HANDLE CLICK
  const handleClick = useCallback(
    async (n) => {
      if (!n.isRead) {
        await markRead(n.id);
      }

      // 🔥 route logic based on type
      if (n.type === "new_lead") {
        navigate(`/vendor/leads/${n.data?.lead_id}`);
      } else if (n.type === "quote") {
        navigate(`/customer/quotes/${n.data?.quote_id}`);
      } else {
        navigate("/"); // fallback
      }
    },
    [markRead, navigate]
  );

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${filter === "all" ? styles.tabActive : ""
                  }`}
                onClick={() => setFilter("all")}
              >
                All
              </button>

              <button
                className={`${styles.tab} ${filter === "unread" ? styles.tabActive : ""
                  }`}
                onClick={() => setFilter("unread")}
              >
                Unread
                {unreadCount > 0 && (
                  <span className={styles.tabBadge}>{unreadCount}</span>
                )}
              </button>
            </div>

            <button
              className={styles.markAll}
              onClick={markAllRead}
              disabled={!unreadCount}
            >
              <Check size={14} />
              Mark all read
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className={styles.content}>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Inbox size={32} />
            </div>
            <h3>No notifications</h3>
            <p>You’ll see updates here.</p>
          </div>
        )}

        {filtered.map((n) => {
          const Icon = ICONS[n.type] || Bell;

          return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`${styles.card} ${!n.isRead ? styles.cardUnread : ""
                }`}
            >
              <span className={styles.cardIcon}>
                <Icon size={18} />
              </span>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <h4 className={styles.cardTitle}>{n.title}</h4>
                  <span className={styles.cardTime}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className={styles.cardMsg}>{n.message}</p>
              </div>

              {!n.isRead && <span className={styles.unreadDot} />}
            </button>
          );
        })}
      </main>
    </div>
  );
}