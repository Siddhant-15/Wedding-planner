import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatINR, titleCase } from "../../utils/format";
import styles from "./Featured.module.css";

export default function Featured() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try { setLoading(true); const data = await adminApi.getServices(); if (alive) setServices(data.filter((s) => s.status === "active")); }
      catch (e) { if (alive) setError(e.message || "Failed to load."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const toggle = async (s) => {
    const next = !s.featured;
    try { await adminApi.updateService(s.id, { featured: next }); setServices((arr) => arr.map((x) => x.id === s.id ? { ...x, featured: next } : x)); }
    catch (e) { alert(e.message); }
  };

  const filtered = services.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()));

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <SearchInput value={q} onChange={setQ} placeholder="Search active services…" />
        <div className={styles.summary}>
          <strong>{services.filter((s) => s.featured).length}</strong> featured
        </div>
      </div>

      {filtered.length === 0 ? <Empty title="No active services" /> : (
        <div className={styles.grid}>
          {filtered.map((s) => (
            <div key={s.id} className={`${styles.card} ${s.featured ? styles.cardFeatured : ""}`}>
              {s.images?.[0] && <img src={s.images[0]} alt="" className={styles.img} />}
              <div className={styles.body}>
                <div className={styles.cat}>{titleCase(s.category)}</div>
                <div className={styles.name}>{s.name}</div>
                <div className={styles.meta}>{s.vendor} • {s.city}</div>
                <div className={styles.priceRow}>
                  <strong>{formatINR(s.price)}</strong>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={!!s.featured} onChange={() => toggle(s)} />
                    <span className={styles.slider} />
                    <span className={styles.toggleLabel}>{s.featured ? "Featured" : "Off"}</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
