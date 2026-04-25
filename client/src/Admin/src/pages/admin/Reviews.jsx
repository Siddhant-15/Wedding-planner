import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { formatDate } from "../../utils/format";
import styles from "./Reviews.module.css";

const TABS = ["all", "pending", "approved", "flagged"];

export default function Reviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    setLoading(true); setError("");
    try { setItems(await adminApi.getReviews()); }
    catch (e) { setError(e.message || "Failed to load reviews."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => tab === "all" ? items : items.filter((r) => r.status === tab), [items, tab]);

  const setStatus = async (r, status) => {
    try { await adminApi.updateReview(r.id, { status }); setItems((arr) => arr.map((x) => x.id === r.id ? { ...x, status } : x)); }
    catch (e) { alert(e.message); }
  };
  const remove = async () => {
    try { await adminApi.deleteReview(confirmDel.id); setItems((arr) => arr.filter((x) => x.id !== confirmDel.id)); }
    catch (e) { alert(e.message); }
    finally { setConfirmDel(null); }
  };
  const markImage = (r) => alert(`Image flagged inappropriate for review ${r.id}.`);

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
            onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <Empty title="No reviews here" /> : (
        <div className={styles.list}>
          {filtered.map((r) => (
            <article key={r.id} className={styles.review}>
              <div className={styles.head}>
                <div className={styles.user}>
                  <div className={styles.avatar}>{r.customer[0]}</div>
                  <div>
                    <div className={styles.name}>{r.customer}</div>
                    <div className={styles.sub}>on <strong>{r.service}</strong> • {formatDate(r.createdAt)}</div>
                  </div>
                </div>
                <div className={styles.headRight}>
                  <div className={styles.stars} aria-label={`${r.rating} stars`}>
                    {"★".repeat(r.rating)}<span className={styles.starsDim}>{"★".repeat(5 - r.rating)}</span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <p className={styles.text}>{r.text}</p>
              {r.images?.length > 0 && (
                <div className={styles.images}>
                  {r.images.map((src, i) => (
                    <div key={i} className={styles.imgItem}>
                      <img src={src} alt="" loading="lazy" />
                      <button className={styles.imgFlag} onClick={() => markImage(r)} title="Mark inappropriate">🚫</button>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.actions}>
                {r.status !== "approved" && <button className={`${styles.btn} ${styles.success}`} onClick={() => setStatus(r, "approved")}>✅ Approve</button>}
                {r.status !== "flagged" && <button className={`${styles.btn} ${styles.warn}`} onClick={() => setStatus(r, "flagged")}>🚩 Flag</button>}
                {r.status === "pending" && <button className={`${styles.btn} ${styles.danger}`} onClick={() => setStatus(r, "rejected")}>❌ Reject</button>}
                <button className={`${styles.btn} ${styles.danger}`} onClick={() => setConfirmDel(r)}>🗑 Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete review?"
        message="This will permanently remove the review. This action cannot be undone."
        tone="danger"
        confirmText="Delete"
        onClose={() => setConfirmDel(null)}
        onConfirm={remove}
      />
    </div>
  );
}
