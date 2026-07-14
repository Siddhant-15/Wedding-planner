import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../../../utils/api/services/adminService";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Modal from "../../components/admin/ui/Modal";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatINR, formatDate, titleCase } from "../../utils/format";
import styles from "./Services.module.css";

const TABS = [
  { key: "under_review", label: "Pending Approval" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "flagged", label: "Flagged" },
  { key: "needs_revision", label: "Needs Revision" },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("draft");
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    if (!id) {
      alert("Service ID not found");
      return;
    }

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

  const counts = useMemo(() => {
    const c = {};
    TABS.forEach((t) => (c[t.key] = 0));
    services.forEach((s) => {
      const status = s.status || s.service_status;
      if (c[status] != null) c[status]++;
    });
    return c;
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const status = s.status || s.service_status;
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

  const updateLocal = (id, patch) => {
    setServices((arr) =>
      arr.map((s) => (s.id === id || s.service_id === id ? { ...s, ...patch } : s))
    );
  };

  const onApprove = async (s) => {
    try {
      await adminService.updateService(s.id || s.service_id, { status: "published" });
      updateLocal(s.id || s.service_id, { status: "published", service_status: "published" });
      if (view) setView((prev) => ({ ...prev, status: "published", service_status: "published" }));
    } catch (e) {
      alert(e.message);
    }
  };

    const submitReason = async () => {
    if (!actionModal) return;
    if (!reason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    setSubmitting(true);
    try {
      const serviceId = actionModal.service.id || actionModal.service.service_id;
      const actionType = actionModal.type === "reject" ? "reject" : "request_changes";

      await adminService.reviewService(serviceId, {
        action: actionType,
        rejection_reason: reason.trim()
      });

      // Update local UI state
      const newStatus = actionType === "reject" ? "rejected" : "needs_revision";

      updateLocal(serviceId, { 
        status: newStatus, 
        service_status: newStatus,
        rejection_reason: reason.trim(),
        rejectionReason: reason.trim()
      });

      if (view && (view.id === serviceId || view.service_id === serviceId)) {
        setView((prev) => ({ 
          ...prev, 
          status: newStatus, 
          service_status: newStatus,
          rejection_reason: reason.trim(),
          rejectionReason: reason.trim()
        }));
      }

      setActionModal(null);
      setReason("");
      alert(`Service ${actionType} successfully!`); // Optional feedback
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to process request.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPolicies = (policies) => {
    if (!policies) return null;
    return (
      <ul className={styles.policiesList}>
        {Object.entries(policies).map(([key, value]) => {
          if (key === "other_policies") {
            return (value || []).map((p, i) => (
              <li key={i}>
                <strong>{p.title}:</strong> {p.description}
              </li>
            ));
          }
          return (
            <li key={key}>
              <strong>{titleCase(key.replace("_policy", ""))}:</strong> {value}
            </li>
          );
        })}
      </ul>
    );
  };

  // Enhanced Media Renderer
  const renderMedia = (media) => {
    if (!media) return null;

    return media.map((m, i) => {
      const url = m.media_url;
      const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
      const isInstagram = url.includes("instagram.com");

      return (
        <div key={i} className={styles.mediaItem}>
          {m.media_type === "image" && !isInstagram ? (
            <img
              src={url}
              alt={`Media ${i}`}
              className={styles.detailImg}
            />
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
                src={`https://www.instagram.com/reel/${url.split('/reel/')[1]?.split('/')[0] || ''}/embed`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            // Fallback for other videos
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
      {/* Tabs & Grid (unchanged) */}
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
        <SearchInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, vendor or city..."
        />
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <Empty message="No services found in this category." />
        ) : (
          filtered.map((s) => {
            const id = s.id || s.service_id;
            return (
              <div key={id} className={styles.card}>
                <div className={styles.imgBox}>
                  {(s.images?.[0] || s.media?.[0]?.media_url) ? (
                    <img
                      src={s.images?.[0] || s.media?.[0]?.media_url}
                      alt={s.name || s.service_name}
                    />
                  ) : (
                    <div className={styles.imgPlaceholder}>
                      {titleCase(s.category || s.service_type || "Service")}
                    </div>
                  )}
                  <div className={styles.statusOnImg}>
                    <StatusBadge status={s.status || s.service_status} />
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.category}>
                    {titleCase(s.category || s.service_type)}
                  </div>
                  <h3 className={styles.cardTitle}>
                    {s.name || s.service_name}
                  </h3>
                  <div className={styles.meta}>
                    🏢 {s.vendor || s.vendor_name} <br />
                    📍 {s.city}
                  </div>

                  <div className={styles.priceRow}>
                    <strong>{formatINR(s.price)}</strong>
                    <span className={styles.dateText}>
                      Submitted {formatDate(s.createdAt || s.created_at)}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button className={styles.btn} onClick={() => handleView(id)}>
                      View
                    </button>

                    {(s.status || s.service_status) !== "published" && (
                      <button
                        className={`${styles.btn} ${styles.success}`}
                        onClick={() => onApprove(s)}
                      >
                        Approve
                      </button>
                    )}

                    {(s.status || s.service_status) !== "rejected" && (
                      <button
                        className={`${styles.btn} ${styles.danger}`}
                        onClick={() => {
                          setActionModal({ type: "reject", service: s });
                          setReason("");
                        }}
                      >
                        Reject
                      </button>
                    )}

                    <button
                      className={`${styles.btn} ${styles.warn}`}
                      onClick={() => {
                        setActionModal({ type: "revise", service: s });
                        setReason("");
                      }}
                    >
                      Request changes
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VIEW MODAL */}
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
            {/* Enhanced Media Gallery */}
            {view.media && view.media.length > 0 && (
              <div className={styles.mediaGallery}>
                {renderMedia(view.media)}
              </div>
            )}

            {/* Rest of the modal remains the same */}
            <div className={styles.detailHead}>
              <div>
                <div className={styles.category}>
                  {titleCase(view.service_type || view.category)}
                </div>
                <h2 className={styles.detailTitle}>
                  {view.service_name || view.name}
                </h2>
              </div>
              <StatusBadge status={view.service_status || view.status} />
            </div>

            <div className={styles.detailPrice}>
              {formatINR(view.price || view.variants?.[0]?.pricing?.veg_price)}
            </div>

            <p className={styles.desc}>{view.description}</p>

            <div className={styles.infoSection}>
              <strong>📍 Address</strong><br />
              {view.add_line1}, {view.add_line2 || ""}<br />
              {view.area}, {view.city}, {view.state} - {view.pincode}
            </div>

            <div className={styles.infoSection}>
              <strong>Vendor Information</strong><br />
              <strong>Name:</strong> {view.vendor_name}<br />
              <strong>Email:</strong> {view.vendor_email}<br />
              <strong>Phone:</strong> {view.vendor_phone}
            </div>

            {view.service_type === "venue" && view.venue && (
              <div className={styles.infoSection}>
                <h4>Venue Details</h4>
                <p><strong>Type:</strong> {view.venue.venue_type}</p>
                <p><strong>Nature:</strong> {view.venue.venue_nature}</p>
                
                {(view.venue.min_capacity || view.venue.max_capacity) && (
                  <p>
                    <strong>Capacity:</strong>{" "}
                    {view.venue.min_capacity || "N/A"} - {view.venue.max_capacity || "N/A"} guests
                  </p>
                )}
                {view.venue.square_feet && <p><strong>Area:</strong> {view.venue.square_feet} sq ft</p>}
                {view.venue.parking_capacity && (
                  <p><strong>Parking:</strong> {view.venue.parking_capacity} vehicles</p>
                )}

                {view.venue.venue_policies && (
                  <div style={{ marginTop: "16px" }}>
                    <strong>Policies:</strong>
                    {renderPolicies(view.venue.venue_policies)}
                  </div>
                )}
              </div>
            )}

            {view.variants?.length > 0 && (
              <div className={styles.infoSection}>
                <h4>Variants & Pricing</h4>
                {view.variants.map((v) => (
                  <div key={v.id} className={styles.variantCard}>
                    <strong>{v.variant_name}</strong>
                    {v.description && <p>{v.description}</p>}

                    <div style={{ marginTop: "8px" }}>
                      {v.pricing?.veg_price && <>Veg: <strong>{formatINR(v.pricing.veg_price)}</strong> </>}
                      {v.pricing?.non_veg_price && <>| Non-Veg: <strong>{formatINR(v.pricing.non_veg_price)}</strong></>}
                      {v.pricing?.rental_price && <>| Rental: <strong>{formatINR(v.pricing.rental_price)}</strong></>}
                    </div>

                    {v.inclusions?.length > 0 && (
                      <div><strong>Inclusions:</strong> {v.inclusions.join(", ")}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {view.metadata && (
              <div className={styles.infoSection}>
                {view.metadata.tags?.length > 0 && (
                  <div className={styles.tags}>
                    <strong>Tags:</strong>{" "}
                    {view.metadata.tags.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
                  </div>
                )}
                {view.metadata.amenities?.length > 0 && (
                  <div>
                    <strong>Amenities:</strong>{" "}
                    {view.metadata.amenities.map((a, i) => <span key={i} className={styles.tag}>{a}</span>)}
                  </div>
                )}
              </div>
            )}

            {(view.rejection_reason || view.rejectionReason) && (
              <div className={styles.reasonBox}>
                <strong>Rejection Reason:</strong> {view.rejection_reason || view.rejectionReason}
              </div>
            )}

            <div className={styles.detailActions}>
              {(view.service_status || view.status) !== "published" && (
                <button className={`${styles.btn} ${styles.success}`} onClick={() => onApprove(view)}>
                  Approve
                </button>
              )}
              {(view.service_status || view.status) !== "rejected" && (
                <button className={`${styles.btn} ${styles.danger}`} onClick={() => setActionModal({ type: "reject", service: view })}>
                  Reject
                </button>
              )}
              <button className={`${styles.btn} ${styles.warn}`} onClick={() => setActionModal({ type: "revise", service: view })}>
                Request changes
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Action Modal - unchanged */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === "reject" ? "Reject Service" : "Request Changes"}
        size="sm"
        footer={
          <>
            <button onClick={() => setActionModal(null)} disabled={submitting}>Cancel</button>
            <button onClick={submitReason} disabled={submitting}>
              {submitting ? "Saving…" : actionModal?.type === "reject" ? "Reject" : "Send"}
            </button>
          </>
        }
      >
        <p>Provide a clear reason. The vendor will see this message.</p>
        <textarea
          className={styles.textarea}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={5}
          placeholder="Write detailed reason here..."
        />
      </Modal>
    </div>
  );
}