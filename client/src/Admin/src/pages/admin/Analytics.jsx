import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import Card from "../../components/admin/ui/Card";
import styles from "./Analytics.module.css";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try { setLoading(true); const d = await adminApi.getAnalytics(); if (alive) setData(d); }
      catch (e) { if (alive) setError(e.message || "Failed to load analytics."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;
  if (!data) return <Empty />;

  const max = Math.max(...data.bookingsByMonth.map((d) => d.v));

  return (
    <div className={styles.wrap}>
      <Card title="Bookings by month">
        <div className={styles.chart} role="img" aria-label="Monthly bookings chart">
          {data.bookingsByMonth.map((d) => (
            <div key={d.m} className={styles.barCol}>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ height: `${(d.v / max) * 100}%` }}>
                  <span className={styles.barValue}>{d.v}</span>
                </div>
              </div>
              <div className={styles.barLabel}>{d.m}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.row2}>
        <Card title="Top services by bookings">
          <RankList items={data.topServices.map((x) => ({ name: x.name, value: x.bookings }))} />
        </Card>
        <Card title="Top vendors by bookings">
          <RankList items={data.topVendors.map((x) => ({ name: x.name, value: x.bookings }))} />
        </Card>
      </div>
    </div>
  );
}

function RankList({ items }) {
  const max = Math.max(...items.map((i) => i.value));
  return (
    <ul className={styles.rankList}>
      {items.map((i, idx) => (
        <li key={i.name} className={styles.rankItem}>
          <div className={styles.rankHead}>
            <span className={styles.rankNum}>{idx + 1}</span>
            <span className={styles.rankName}>{i.name}</span>
            <span className={styles.rankVal}>{i.value}</span>
          </div>
          <div className={styles.rankTrack}><div className={styles.rankFill} style={{ width: `${(i.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
