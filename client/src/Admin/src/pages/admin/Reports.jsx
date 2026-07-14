import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminApi";
import Table from "../../components/admin/ui/Table";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import { formatDate, titleCase } from "../../utils/format";
import styles from "./Reports.module.css";

export default function Reports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try { setLoading(true); const data = await adminApi.getReports(); if (alive) setItems(data); }
      catch (e) { if (alive) setError(e.message || "Failed to load reports."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const act = async (r, status) => {
    try { await adminApi.updateReport(r.id, { status }); setItems((arr) => arr.map((x) => x.id === r.id ? { ...x, status } : x)); }
    catch (e) { alert(e.message); }
  };

  const columns = [
    { key: "id", label: "Report ID" },
    { key: "targetType", label: "Type", render: (r) => <span className={styles.pill}>{titleCase(r.targetType)}</span> },
    { key: "targetName", label: "Target" },
    { key: "reason", label: "Reason" },
    { key: "reportedBy", label: "Reported by" },
    { key: "createdAt", label: "Date", render: (r) => formatDate(r.createdAt) },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", label: "Actions", render: (r) => (
      r.status === "open" ? (
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.danger}`} onClick={() => act(r, "resolved")}>Remove content</button>
          <button className={`${styles.btn} ${styles.success}`} onClick={() => act(r, "resolved")}>Resolve</button>
          <button className={styles.btn} onClick={() => act(r, "ignored")}>Ignore</button>
        </div>
      ) : <span className={styles.muted}>—</span>
    )},
  ];

  if (loading) return <Loader />;
  if (error) return <Empty icon="⚠️" title="Failed to load" text={error} />;

  return (
    <div className={styles.wrap}>
      <Table columns={columns} data={items} emptyText="No reports filed." />
    </div>
  );
}
