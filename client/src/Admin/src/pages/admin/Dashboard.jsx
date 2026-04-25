import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Card from "../../components/admin/ui/Card";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import { formatINR, formatDateTime } from "../../utils/format";
import styles from "./Dashboard.module.css";

const STATS = [
  { key: "totalUsers", label: "Total Users", icon: "👥", tone: "brand" },
  { key: "totalVendors", label: "Total Vendors", icon: "🏢", tone: "info" },
  { key: "activeServices", label: "Active Services", icon: "🛠️", tone: "success" },
  { key: "pendingApprovals", label: "Pending Approvals", icon: "⏳", tone: "warning" },
  { key: "bookingsThisMonth", label: "Bookings (This Month)", icon: "📦", tone: "brand" },
  { key: "revenueThisMonth", label: "Revenue (This Month)", icon: "💰", tone: "success", money: true },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [m, a] = await Promise.all([adminApi.getMetrics(), adminApi.getActivity()]);
        if (!alive) return;
        setMetrics(m); setActivity(a);
      } catch (e) { if (alive) setError(e.message || "Failed to load dashboard."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Couldn’t load dashboard" text={error} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.key} className={`${styles.statCard} ${styles[s.tone]}`}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statBody}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue}>
                {s.money ? formatINR(metrics?.[s.key]) : (metrics?.[s.key] ?? 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        <Card title="Recent Activity">
          {activity.length === 0 ? <Empty title="No recent activity" /> : (
            <ul className={styles.activity}>
              {activity.map((a) => (
                <li key={a.id} className={styles.activityItem}>
                  <span className={`${styles.dot} ${styles["dot_" + a.type] || ""}`} />
                  <div>
                    <div className={styles.activityText}>{a.text}</div>
                    <div className={styles.activityTime}>{formatDateTime(a.at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Quick Tips">
          <ul className={styles.tips}>
            <li>Review pending services in <strong>Service Moderation</strong>.</li>
            <li>Verify new vendors to unlock listings.</li>
            <li>Resolve flagged reviews to keep listings clean.</li>
            <li>Track top performers in <strong>Analytics</strong>.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
