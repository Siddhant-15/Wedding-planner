import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Modal from "../../components/admin/ui/Modal";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatINR, formatDate, titleCase } from "../../utils/format";
import styles from "./Services.module.css";

const TABS = [
  { key: "pending", label: "Pending Approval" },
  { key: "active", label: "Active" },
  { key: "rejected", label: "Rejected" },
  { key: "flagged", label: "Flagged" },
  { key: "needs_revision", label: "Needs Revision" },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);

  const [actionModal, setActionModal] = useState(null); // {type, service}
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { setServices(await adminApi.getServices()); }
    catch (e) { setError(e.message || "Failed to load services."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = {}; TABS.forEach((t) => c[t.key] = 0);
    services.forEach((s) => { if (c[s.status] != null) c[s.status]++; });
    return c;
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (s.status !== tab) return false;
      if (q) {
        const t = q.toLowerCase();
        return s.name.toLowerCase().includes(t) || s.vendor.toLowerCase().includes(t) || s.city.toLowerCase().includes(t);
      }
      return true;
    });
  }, [services, tab, q]);

  const updateLocal = (id, patch) =>
    setServices((arr) => arr.map((s) => s.id === id ? { ...s, ...patch } : s));

  const onApprove = async (s) => {
    try { await adminApi.updateService(s.id, { status: "active" }); updateLocal(s.id, { status: "active" }); }
    catch (e) { alert(e.message); }
  };
  const onDisable = async (s) => {
    try { await adminApi.updateService(s.id, { status: "rejected" }); updateLocal(s.id, { status: "rejected" }); }
    catch (e) { alert(e.message); }
  };

  const submitReason = async () => {
    if (!actionModal) return;
    if (!reason.trim()) { alert("Please provide a reason."); return; }
    setSubmitting(true);
    try {
      const status = actionModal.type === "reject" ? "rejected" : "needs_revision";
      await adminApi.updateService(actionModal.service.id, { status, rejectionReason: reason.trim() });
      updateLocal(actionModal.service.id, { status, rejectionReason: reason.trim() });
      setActionModal(null); setReason(""); setView(null);
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => setTab(t.key)}>
            {t.label}
            <span className={styles.tabCount}>{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <SearchInput value={q} onChange={setQ} placeholder="Search services, vendors, cities…" />
      </div>

      {filtered.length === 0 ? (
        <Empty title="No services in this tab" text="Once vendors submit listings here, you’ll see them here." />
      ) : (
        <div className={styles.grid}>
          {filtered.map((s) => (
            <article key={s.id} className={styles.card}>
              <div className={styles.imgBox}>
                {s.images?.[0]
                  ? <img src={s.images[0]} alt={s.name} loading="lazy" />
                  : <div className={styles.imgPlaceholder}>{titleCase(s.category)}</div>}
                <div className={styles.statusOnImg}><StatusBadge status={s.status} /></div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.category}>{titleCase(s.category)}</div>
                <h3 className={styles.cardTitle}>{s.name}</h3>
                <div className={styles.meta}>
                  <span>🏢 {s.vendor}</span>
                  <span>📍 {s.city}</span>
                </div>
                <div className={styles.priceRow}>
                  <strong>{formatINR(s.price)}</strong>
                  <span className={styles.dateText}>Submitted {formatDate(s.createdAt)}</span>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.btn} onClick={() => setView(s)}>View</button>
                  {s.status !== "active" && <button className={`${styles.btn} ${styles.success}`} onClick={() => onApprove(s)}>Approve</button>}
                  {s.status !== "rejected" && <button className={`${styles.btn} ${styles.danger}`} onClick={() => { setActionModal({ type: "reject", service: s }); setReason(""); }}>Reject</button>}
                  <button className={`${styles.btn} ${styles.warn}`} onClick={() => { setActionModal({ type: "revise", service: s }); setReason(""); }}>Request changes</button>
                  {s.status === "active" && <button className={styles.btn} onClick={() => onDisable(s)}>Disable</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!view} onClose={() => setView(null)} title="Service Details" size="lg">
        {view && (
          <div className={styles.detail}>
            {view.images?.[0] && <img className={styles.detailImg} src={view.images[0]} alt={view.name} />}
            <div className={styles.detailHead}>
              <div>
                <div className={styles.category}>{titleCase(view.category)}</div>
                <h2 className={styles.detailTitle}>{view.name}</h2>
                <div className={styles.meta} style={{ marginTop: 6 }}>
                  <span>🏢 {view.vendor}</span><span>📍 {view.city}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className={styles.detailPrice}>{formatINR(view.price)}</div>
                <StatusBadge status={view.status} />
              </div>
            </div>
            <p className={styles.desc}>{view.description}</p>
            {view.tags?.length > 0 && (
              <div className={styles.tags}>
                {view.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            )}
            {view.rejectionReason && (
              <div className={styles.reasonBox}>
                <strong>Reason:</strong> {view.rejectionReason}
              </div>
            )}
            <div className={styles.detailActions}>
              {view.status !== "active" && <button className={`${styles.btn} ${styles.success}`} onClick={async () => { await onApprove(view); setView(null); }}>Approve</button>}
              {view.status !== "rejected" && <button className={`${styles.btn} ${styles.danger}`} onClick={() => { setActionModal({ type: "reject", service: view }); setReason(""); }}>Reject</button>}
              <button className={`${styles.btn} ${styles.warn}`} onClick={() => { setActionModal({ type: "revise", service: view }); setReason(""); }}>Request changes</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!actionModal} onClose={() => setActionModal(null)}
        title={actionModal?.type === "reject" ? "Reject service" : "Request changes"}
        size="sm"
        footer={
          <>
            <button className={styles.btnGhost} onClick={() => setActionModal(null)} disabled={submitting}>Cancel</button>
            <button className={`${styles.btn} ${actionModal?.type === "reject" ? styles.danger : styles.warn}`} onClick={submitReason} disabled={submitting}>
              {submitting ? "Saving…" : (actionModal?.type === "reject" ? "Reject" : "Send")}
            </button>
          </>
        }
      >
        <p style={{ marginTop: 0, color: "var(--text-muted)" }}>
          Provide a clear reason. The vendor will see this message.
        </p>
        <textarea
          className={styles.textarea}
          placeholder={actionModal?.type === "reject" ? "e.g. Incomplete information, low-quality images…" : "e.g. Please add more photos and update pricing."}
          value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
        />
      </Modal>
    </div>
  );
}
