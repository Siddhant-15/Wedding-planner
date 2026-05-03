import React, { useMemo, useState, useCallback } from "react";
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
import {
  mockNotifications,
  NOTIFICATION_TYPES,
  timeAgo,
  isToday,
} from "../data/notificationsMock";
import styles from "./Notifications.module.css";

const ICONS = {
  Sparkles,
  MessageSquare,
  Bell,
  AlertTriangle,
  Star,
};

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState(mockNotifications);
  const [filter, setFilter] = useState("all"); // all | unread

  const filtered = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.isRead) : items),
    [items, filter]
  );

  const today = useMemo(() => filtered.filter((n) => isToday(n.createdAt)), [filtered]);
  const earlier = useMemo(() => filtered.filter((n) => !isToday(n.createdAt)), [filtered]);
  const unreadCount = items.filter((n) => !n.isRead).length;

  const markRead = useCallback((id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const onClickItem = useCallback(
    (n) => {
      markRead(n.id);
      if (n.link) navigate(n.link);
    },
    [markRead, navigate]
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Notifications</h1>
            <p className={styles.subtitle}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${filter === "all" ? styles.tabActive : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`${styles.tab} ${filter === "unread" ? styles.tabActive : ""}`}
                onClick={() => setFilter("unread")}
              >
                Unread {unreadCount > 0 && <span className={styles.tabBadge}>{unreadCount}</span>}
              </button>
            </div>

            <button
              className={styles.markAll}
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <Check size={14} />
              Mark all read
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Inbox size={32} />
            </div>
            <h3>No notifications yet</h3>
            <p>You'll see updates about your bookings and messages here.</p>
          </div>
        )}

        {today.length > 0 && (
          <Section title="Today">
            {today.map((n) => (
              <NotificationCard key={n.id} n={n} onClick={() => onClickItem(n)} />
            ))}
          </Section>
        )}

        {earlier.length > 0 && (
          <Section title="Earlier">
            {earlier.map((n) => (
              <NotificationCard key={n.id} n={n} onClick={() => onClickItem(n)} />
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.cards}>{children}</div>
    </section>
  );
}

function NotificationCard({ n, onClick }) {
  const meta = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.reminder;
  const Icon = ICONS[meta.icon] || Bell;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.card} ${!n.isRead ? styles.cardUnread : ""}`}
    >
      <span className={`${styles.cardIcon} ${styles[`tone_${meta.color}`]}`}>
        <Icon size={18} />
      </span>

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <h4 className={styles.cardTitle}>{n.title}</h4>
          <span className={styles.cardTime}>{timeAgo(n.createdAt)}</span>
        </div>
        <p className={styles.cardMsg}>{n.message}</p>
        <span className={styles.cardTag}>{meta.label}</span>
      </div>

      {!n.isRead && <span className={styles.unreadDot} aria-hidden="true" />}
    </button>
  );
}
