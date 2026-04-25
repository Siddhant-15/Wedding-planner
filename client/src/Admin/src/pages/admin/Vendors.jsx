import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Table from "../../components/admin/ui/Table";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import Modal from "../../components/admin/ui/Modal";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatDate } from "../../utils/format";
import styles from "./Vendors.module.css";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState(null);
  const [confirm, setConfirm] = useState(null); // {action, vendor}

  const load = async () => {
    setLoading(true); setError("");
    try { setVendors(await adminApi.getVendors()); }
    catch (e) { setError(e.message || "Failed to load vendors."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (q) {
        const t = q.toLowerCase();
        return v.name.toLowerCase().includes(t) || v.email.toLowerCase().includes(t) || v.city.toLowerCase().includes(t);
      }
      return true;
    });
  }, [vendors, q, statusFilter]);

  const performAction = async () => {
    if (!confirm) return;
    const { action, vendor } = confirm;
    const map = { verify: "verified", suspend: "suspended", reactivate: "verified" };
    try {
      await adminApi.updateVendor(vendor.id, { status: map[action] });
      setVendors((arr) => arr.map((x) => x.id === vendor.id ? { ...x, status: map[action] } : x));
    } catch (e) { alert(e.message); }
    finally { setConfirm(null); }
  };

  const columns = [
    { key: "name", label: "Vendor", render: (r) => (
      <div className={styles.vendorCell}>
        <div className={styles.avatar}>{r.name[0]}</div>
        <div>
          <div className={styles.name}>{r.name}</div>
          <div className={styles.sub}>{r.email}</div>
        </div>
      </div>
    )},
    { key: "city", label: "City" },
    { key: "services", label: "Services", render: (r) => <strong>{r.services}</strong> },
    { key: "joinedAt", label: "Joined", render: (r) => formatDate(r.joinedAt) },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className={styles.actions}>
        <button className={styles.btn} onClick={() => setView(r)}>View</button>
        {r.status === "pending" && <button className={`${styles.btn} ${styles.success}`} onClick={() => setConfirm({ action: "verify", vendor: r })}>Verify</button>}
        {r.status === "verified" && <button className={`${styles.btn} ${styles.danger}`} onClick={() => setConfirm({ action: "suspend", vendor: r })}>Suspend</button>}
        {r.status === "suspended" && <button className={`${styles.btn} ${styles.success}`} onClick={() => setConfirm({ action: "reactivate", vendor: r })}>Reactivate</button>}
      </div>
    )},
  ];

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, email, city…" />
        <div className={styles.filters}>
          {["all", "pending", "verified", "suspended"].map((s) => (
            <button key={s}
              className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={filtered} emptyText="No vendors match your filters." />

      <Modal open={!!view} onClose={() => setView(null)} title="Vendor Details" size="md">
        {view && (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <div className={styles.avatarLg}>{view.name[0]}</div>
              <div>
                <div className={styles.dName}>{view.name}</div>
                <div className={styles.dSub}>{view.email} • {view.phone}</div>
                <div style={{ marginTop: 6 }}><StatusBadge status={view.status} /></div>
              </div>
            </div>
            <dl className={styles.dl}>
              <div><dt>City</dt><dd>{view.city}</dd></div>
              <div><dt>Services</dt><dd>{view.services}</dd></div>
              <div><dt>Joined</dt><dd>{formatDate(view.joinedAt)}</dd></div>
              <div><dt>Vendor ID</dt><dd>{view.id}</dd></div>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "suspend" ? "Suspend vendor?" : confirm?.action === "verify" ? "Verify vendor?" : "Reactivate vendor?"}
        message={
          confirm?.action === "suspend"
            ? `Suspending "${confirm?.vendor?.name}" will hide all their listings.`
            : `This will mark "${confirm?.vendor?.name}" as ${confirm?.action === "verify" ? "verified" : "active"}.`
        }
        tone={confirm?.action === "suspend" ? "danger" : "success"}
        confirmText={confirm?.action === "suspend" ? "Suspend" : "Confirm"}
        onClose={() => setConfirm(null)}
        onConfirm={performAction}
      />
    </div>
  );
}
