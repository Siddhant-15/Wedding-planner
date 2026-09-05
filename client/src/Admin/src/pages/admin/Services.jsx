import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../../../utils/api/services/adminService";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Modal from "../../components/admin/ui/Modal";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatINR, formatDate, titleCase } from "../../utils/format";
import ServiceReviewModal from "./Services/ServiceReviewModal";
import styles from "./Services.module.css";

// Matches actual ServiceVersion/Service statuses the backend supports.
// "flagged" was never a real backend status -- removed.
const TABS = [
  { key: "under_review", label: "Pending Review" },
  { key: "published", label: "Published" },
  { key: "needs_revision", label: "Needs Revision" },
  { key: "rejected", label: "Rejected" },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("under_review");
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [reviewServiceId, setReviewServiceId] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getServices();
      setServices(response.items || []);
    } catch (e) {
      setError(e.message || "Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleView = async (id) => {
    if (!id) return;
    setViewLoading(true);
    setView(null);
    try {
      const fullService = await adminService.getServiceById(id);
      setView(fullService);
    } catch (e) {
      console.error("View error:", e);
      alert(e.message || "Failed to load service details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenHistory = async (id) => {
    setHistoryLoading(true);
    setHistoryModal({ serviceId: id, data: null });
    try {
      const data = await adminService.getReviewHistory(id);
      setHistoryModal({ serviceId: id, data });
    } catch (e) {
      alert(e.message || "Failed to load review history.");
      setHistoryModal(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const counts = useMemo(() => {
    const c = {};
    TABS.forEach((t) => (c[t.key] = 0));
    services.forEach((s) => {
      const status = s.version_status || s.status || s.service_status;
      if (c[status] != null) c[status]++;
    });
    return c;
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const status = s.version_status || s.status || s.service_status;
      if (status !== tab) return false;
      if (q) {
        const t = q.toLowerCase();
        return (
          (s.name || s.service_name || "").toLowerCase().includes(t) ||
          (s.vendor || s.vendor_name || "").toLowerCase().includes(t) ||
          (s.city || "").toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [services, tab, q]);

  const isUpdateToLive = (s) => Boolean(s.current_live_version_id) && s.is_new_service !== true;

  const handleReviewFinalized = (result) => {
    setServices((arr) =>
      arr.map((s) =>
        (s.id || s.service_id) === result.service_id
          ? { ...s, status: result.service_status, service_status: result.service_status, version_status: result.version_status }
          : s
      )
    );
    setReviewServiceId(null);
  };

  const renderMedia = (media) => {
    if (!media) return null;
    return media.map((m, i) => {
      const url = m.media_url;
      const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
      const isInstagram = url.includes("instagram.com");
      return (
        <div key={i} className={styles.mediaItem}>
          {m.media_type === "image" && !isInstagram ? (
            <img src={url} alt={`Media ${i}`} className={styles.detailImg} />
          ) : isYouTube ? (
            <div className={styles.videoEmbed}>
              <iframe
                width="100%"
                height="360"
                src={url.replace("watch?v=", "embed/").split("&")[0]}
                title="YouTube video"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ) : isInstagram ? (
            <div className={styles.videoEmbed}>
              <iframe
                width="100%"
                height="500"
                src={`https://www.instagram.com/reel/${url.split("/reel/")[1]?.split("/")[0] || ""}/embed`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className={styles.videoPlaceholder}>
              📹 Video:{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </div>
          )}
          {m.is_cover && <span className={styles.coverBadge}>Cover</span>}
        </div>
      );
    });
  };

  if (loading) return <Loader />;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className={styles.tabCount}>{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, vendor or city..." />
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <Empty message="No services found in this category." />
        ) : (
          filtered.map((s) => {
            const id = s.id || s.service_id;
            const status = s.version_status || s.status || s.service_status;
            return (
              <div key={id} className={styles.card}>
                <div className={styles.imgBox}>
                  {s.images?.[0] || s.media?.[0]?.media_url ? (
                    <img src={s.images?.[0] || s.media?.[0]?.media_url} alt={s.name || s.service_name} />
                  ) : (
                    <div className={styles.imgPlaceholder}>{titleCase(s.category || s.service_type || "Service")}</div>
                  )}
                  <div className={styles.statusOnImg}>
                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.category}>{titleCase(s.category || s.service_type)}</div>
                  <h3 className={styles.cardTitle}>{s.name || s.service_name}</h3>
                  <div className={styles.meta}>
                    🏢 {s.vendor || s.vendor_name} <br />
                    📍 {s.city}
                    <br />
                    {isUpdateToLive(s) ? "Update to Live Service" : "New Service"}
                  </div>

                  <div className={styles.priceRow}>
                    {/* <strong>{formatINR(s.price)}</strong> */}
                    <span className={styles.dateText}>Submitted {formatDate(s.createdAt || s.created_at)}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <button className={styles.btn} onClick={() => handleView(id)}>
                      View
                    </button>

                    {status === "under_review" ? (
                      <button className={`${styles.btn} ${styles.success}`} onClick={() => setReviewServiceId(id)}>
                        Review
                      </button>
                    ) : (
                      <button className={styles.btn} onClick={() => handleOpenHistory(id)}>
                        Review History
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VIEW MODAL — read-only detail view, no approve/reject actions here.
          Structured review only happens through ServiceReviewModal. */}
      <Modal
        isOpen={!!view || viewLoading}
        onClose={() => {
          setView(null);
          setViewLoading(false);
        }}
        title="Service Details"
        size="lg"
      >
        {viewLoading ? (
          <Loader />
        ) : view ? (
          <div className={styles.detail}>
            {view.media && view.media.length > 0 && <div className={styles.mediaGallery}>{renderMedia(view.media)}</div>}

            <div className={styles.detailHead}>
              <div>
                <div className={styles.category}>{titleCase(view.service_type || view.category)}</div>
                <h2 className={styles.detailTitle}>{view.service_name || view.name}</h2>
              </div>
              <StatusBadge status={view.version_status || view.service_status || view.status} />
            </div>

            <div className={styles.detailPrice}>{formatINR(view.price || view.variants?.[0]?.pricing?.veg_price)}</div>

            <p className={styles.desc}>{view.description}</p>

            <div className={styles.infoSection}>
              <strong>📍 Address</strong>
              <br />
              {view.add_line1}, {view.add_line2 || ""}
              <br />
              {view.area}, {view.city}, {view.state} - {view.pincode}
            </div>

            <div className={styles.infoSection}>
              <strong>Vendor Information</strong>
              <br />
              <strong>Name:</strong> {view.vendor_name}
              <br />
              <strong>Email:</strong> {view.vendor_email}
              <br />
              <strong>Phone:</strong> {view.vendor_phone}
            </div>

            {view.variants?.length > 0 && (
              <div className={styles.infoSection}>
                <h4>Variants & Pricing</h4>
                {view.variants.map((v) => (
                  <div key={v.id} className={styles.variantCard}>
                    <strong>{v.variant_name}</strong>
                    {v.description && <p>{v.description}</p>}
                    <div style={{ marginTop: "8px" }}>
                      {v.pricing?.veg_price && (
                        <>
                          Veg: <strong>{formatINR(v.pricing.veg_price)}</strong>{" "}
                        </>
                      )}
                      {v.pricing?.non_veg_price && (
                        <>
                          | Non-Veg: <strong>{formatINR(v.pricing.non_veg_price)}</strong>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(view.rejection_reason || view.rejectionReason) && (
              <div className={styles.reasonBox}>
                <strong>Latest reviewer note:</strong> {view.rejection_reason || view.rejectionReason}
              </div>
            )}

            <div className={styles.detailActions}>
              {(view.version_status || view.status) === "under_review" ? (
                <button
                  className={`${styles.btn} ${styles.success}`}
                  onClick={() => {
                    setView(null);
                    setReviewServiceId(view.id || view.service_id);
                  }}
                >
                  Review
                </button>
              ) : (
                <button
                  className={styles.btn}
                  onClick={() => handleOpenHistory(view.id || view.service_id)}
                >
                  Review History
                </button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* STRUCTURED REVIEW WORKSPACE */}
      <ServiceReviewModal
        serviceId={reviewServiceId}
        isOpen={!!reviewServiceId}
        onClose={() => setReviewServiceId(null)}
        onFinalized={handleReviewFinalized}
      />

      {/* REVIEW HISTORY */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)} title="Review History" size="lg">
        {historyLoading || !historyModal?.data ? (
          <Loader />
        ) : (
          <div className={styles.detail}>
            {historyModal.data.versions.length === 0 ? (
              <Empty message="No review history yet for this service." />
            ) : (
              historyModal.data.versions.map((v) => (
                <div key={v.version_id} className={styles.infoSection}>
                  <strong>
                    Version {v.version_number ?? v.version_id} — {titleCase(v.version_status)}
                  </strong>
                  <div className={styles.dateText}>
                    {v.reviewed_at ? `Reviewed ${formatDate(v.reviewed_at)}` : "Not yet reviewed"}
                    {v.reviewed_by_name ? ` by ${v.reviewed_by_name}` : ""}
                  </div>
                  {v.final_comment && (
                    <div className={styles.reasonBox} style={{ marginTop: 8 }}>
                      {v.final_comment}
                    </div>
                  )}
                  <ul className={styles.policiesList}>
                    {v.sections.map((s) => (
                      <li key={s.section}>
                        <strong>{titleCase(s.section.replace(/_/g, " "))}:</strong> {titleCase(s.status.replace(/_/g, " "))}
                        {s.comment ? ` — ${s.comment}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
