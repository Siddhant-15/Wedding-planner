import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Table from "../../components/admin/ui/Table";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatINR, formatDate } from "../../utils/format";
import styles from "./Bookings.module.css";

const FILTERS = ["all", "pending", "confirmed", "cancelled"];

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try { setLoading(true); const data = await adminApi.getBookings(); if (alive) setItems(data); }
      catch (e) { if (alive) setError(e.message || "Failed to load bookings."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => items.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (q) {
      const t = q.toLowerCase();
      return b.customer.toLowerCase().includes(t) || b.service.toLowerCase().includes(t) || b.id.toLowerCase().includes(t);
    }
    return true;
  }), [items, filter, q]);

  const overrideStatus = async (b, status) => {
    try { await adminApi.updateBooking(b.id, { status }); setItems((arr) => arr.map((x) => x.id === b.id ? { ...x, status } : x)); }
    catch (e) { alert(e.message); }
  };

  const columns = [
    { key: "id", label: "Booking ID", render: (r) => <code className={styles.code}>{r.id}</code> },
    { key: "customer", label: "Customer" },
    { key: "service", label: "Service" },
    { key: "date", label: "Date", render: (r) => formatDate(r.date) },
    { key: "amount", label: "Amount", render: (r) => formatINR(r.amount) },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className={styles.actions}>
        <select className={styles.select} value={r.status} onChange={(e) => overrideStatus(r, e.target.value)}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className={styles.btn} onClick={() => alert(`Dispute UI placeholder for ${r.id}`)}>Resolve dispute</button>
      </div>
    )},
  ];

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <SearchInput value={q} onChange={setQ} placeholder="Search by customer, service, ID…" />
        <div className={styles.tabs}>
          {FILTERS.map((f) => (
            <button key={f}
              className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`}
              onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <Table columns={columns} data={filtered} emptyText="No bookings match your filters." />
    </div>
  );
}
