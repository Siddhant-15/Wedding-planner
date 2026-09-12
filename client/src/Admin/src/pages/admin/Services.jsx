import { useEffect, useMemo, useState, useCallback } from "react";
import { adminService } from "../../../../utils/api/services/adminService";
import Loader from "../../components/admin/ui/Loader";
import Empty from "../../components/admin/ui/Empty";
import StatusBadge from "../../components/admin/ui/StatusBadge";
import Modal from "../../components/admin/ui/Modal";
import SearchInput from "../../components/admin/ui/SearchInput";
import { formatINR, formatDate, titleCase } from "../../utils/format";
import ServiceReviewModal from "./Services/ServiceReviewModal";
import styles from "./Services.module.css";

const TABS = [
  { key: "under_review", label: "Pending Review" },
  { key: "published", label: "Published" },
  { key: "needs_revision", label: "Needs Revision" },
  { key: "rejected", label: "Rejected" },
];

/* ───────────────────── helpers ───────────────────── */

function getYouTubeId(url = "") {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function isVideoUrl(url = "") {
  return /youtube\.com|youtu\.be|instagram\.com|vimeo\.com|tiktok\.com/i.test(url);
}

function PillList({ items }) {
  if (!items?.length) return <span className={styles.muted}>—</span>;
  return (
    <div className={styles.pills}>
      {items.map((t, i) => (
        <span key={i} className={styles.pill}>
          {t}
        </span>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className={styles.field}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Bool({ value }) {
  return value ? <span className={styles.yes}>Yes</span> : <span className={styles.no}>No</span>;
}

/* ───────────────────── Media Lightbox ───────────────────── */

function MediaLightbox({ media, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const item = media[index];
  const ytId = item ? getYouTubeId(item.media_url) : null;

  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + media.length) % media.length),
    [media.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!item) return null;

  return (
    <div className={styles.lightbox} onClick={onClose}>
      <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        <button className={styles.lbClose} onClick={onClose} aria-label="Close">
          ×
        </button>

        {media.length > 1 && (
          <>
            <button
              className={`${styles.lbNav} ${styles.lbPrev}`}
              onClick={() => go(-1)}
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              className={`${styles.lbNav} ${styles.lbNext}`}
              onClick={() => go(1)}
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}

        <div className={styles.lbContent}>
          {item.media_type === "image" ? (
            <img src={item.media_url} alt="" className={styles.lbImg} />
          ) : ytId ? (
            <div className={styles.lbVideoWrap}>
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.lbIframe}
              />
            </div>
          ) : (
            <div className={styles.lbExternal}>
              <p>External video / link</p>
              <a
                href={item.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.lbLink}
              >
                Open in new tab →
              </a>
            </div>
          )}
        </div>

        <div className={styles.lbMeta}>
          {index + 1} / {media.length}
          {item.is_cover && " · Cover"}
          {item.metadata?.label && ` · ${item.metadata.label}`}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Type-specific blocks ───────────────────── */

function VenueBlock({ d }) {
  if (!d) return null;
  return (
    <div className={styles.typeBlock}>
      <h4 className={styles.blockTitle}>Venue details</h4>
      <div className={styles.fieldGrid}>
        <Field label="Type">{d.venue_type}</Field>
        <Field label="Nature">{d.venue_nature}</Field>
        <Field label="Capacity">
          {d.min_capacity != null || d.max_capacity != null
            ? `${d.min_capacity ?? "?"} – ${d.max_capacity ?? "?"} guests`
            : null}
        </Field>
        <Field label="Area">
          {d.square_feet ? `${Number(d.square_feet).toLocaleString()} sq ft` : null}
        </Field>
        <Field label="Parking">
          {d.parking_capacity ? `${d.parking_capacity} vehicles` : null}
        </Field>
      </div>
      {d.venue_policies && (
        <div className={styles.policyGrid}>
          {d.venue_policies.alcohol_policy && (
            <div className={styles.policyCard}>
              <span className={styles.policyLabel}>Alcohol</span>
              <span>{titleCase(d.venue_policies.alcohol_policy)}</span>
            </div>
          )}
          {d.venue_policies.catering_policy && (
            <div className={styles.policyCard}>
              <span className={styles.policyLabel}>Catering</span>
              <span>{titleCase(d.venue_policies.catering_policy.replace(/-/g, " "))}</span>
            </div>
          )}
          {d.venue_policies.decoration_policy && (
            <div className={styles.policyCard}>
              <span className={styles.policyLabel}>Decoration</span>
              <span>{titleCase(d.venue_policies.decoration_policy)}</span>
            </div>
          )}
          {d.venue_policies.other_policies?.map((p, i) => (
            <div key={i} className={styles.policyCard}>
              <span className={styles.policyLabel}>{p.title}</span>
              <span>{p.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CateringBlock({ d }) {
  if (!d) return null;
  return (
    <div className={styles.typeBlock}>
      <h4 className={styles.blockTitle}>Catering details</h4>
      <div className={styles.fieldGrid}>
        <Field label="Cuisines">
          <PillList items={d.cuisine_types} />
        </Field>
        <Field label="Service styles">
          <PillList items={d.service_styles} />
        </Field>
        <Field label="Special diets">
          <PillList items={d.special_diets_supported} />
        </Field>
        <Field label="Order range">
          {d.min_order != null || d.max_order != null
            ? `${d.min_order ?? "?"} – ${d.max_order ?? "?"} plates`
            : null}
        </Field>
        <Field label="Staff included">
          <Bool value={d.staff_included} />
        </Field>
        <Field label="Crockery & cutlery">
          <Bool value={d.crockery_cutlery_included} />
        </Field>
        <Field label="Tasting">
          <Bool value={d.tasting_available} />
        </Field>
        <Field label="Customizable menu">
          <Bool value={d.customizable_menu} />
        </Field>
        <Field label="GST">{d.gst_percentage ? `${d.gst_percentage}%` : null}</Field>
        <Field label="Price includes tax">
          <Bool value={d.price_includes_tax} />
        </Field>
      </div>
    </div>
  );
}

function PhotographyBlock({ d }) {
  if (!d) return null;
  return (
    <div className={styles.typeBlock}>
      <h4 className={styles.blockTitle}>Photography details</h4>
      <div className={styles.fieldGrid}>
        <Field label="Types">
          <PillList items={d.photography_types} />
        </Field>
        <Field label="Editing styles">
          <PillList items={d.editing_styles} />
        </Field>
        <Field label="Coverage">{d.coverage_hours ? `${d.coverage_hours} hrs` : null}</Field>
        <Field label="Team size">{d.team_size}</Field>
        <Field label="Second shooter">
          <Bool value={d.second_shooter_included} />
        </Field>
        <Field label="Photos delivered">{d.photo_delivery_count}</Field>
        <Field label="Video duration">
          {d.video_delivery_duration_minutes
            ? `${d.video_delivery_duration_minutes} min`
            : null}
        </Field>
        <Field label="Edited photos">
          <Bool value={d.edited_photos_included} />
        </Field>
        <Field label="Raw photos">
          <Bool value={d.raw_photos_provided} />
        </Field>
        <Field label="Album">
          {d.album_included ? `Yes (${d.album_pages || "?"} pages)` : "No"}
        </Field>
        <Field label="Videography">
          <Bool value={d.videography_available} />
        </Field>
        <Field label="Drone">
          <Bool value={d.drone_shoot_available} />
        </Field>
        <Field label="Overtime">
          {d.overtime_rate_per_hour
            ? `${formatINR(d.overtime_rate_per_hour)}/hr`
            : null}
        </Field>
      </div>
    </div>
  );
}

function DjBlock({ d }) {
  if (!d) return null;
  return (
    <div className={styles.typeBlock}>
      <h4 className={styles.blockTitle}>DJ details</h4>
      <div className={styles.fieldGrid}>
        <Field label="Genres">
          <PillList items={d.genres_supported} />
        </Field>
        <Field label="Languages">
          <PillList items={d.languages_supported} />
        </Field>
        <Field label="Event types">
          <PillList items={d.event_types_supported} />
        </Field>
        <Field label="Equipment">
          <PillList items={d.equipments_provided} />
        </Field>
        <Field label="Duration">
          {d.performance_duration_hours ? `${d.performance_duration_hours} hrs` : null}
        </Field>
        <Field label="Sound system">
          <Bool value={d.sound_system_included} />
        </Field>
        <Field label="Lighting">
          <Bool value={d.lighting_included} />
        </Field>
        <Field label="Smoke machine">
          <Bool value={d.smoke_machine_included} />
        </Field>
        <Field label="LED wall">
          <Bool value={d.led_wall_included} />
        </Field>
        <Field label="MC / Host">
          <Bool value={d.mc_host_available} />
        </Field>
        <Field label="Outdoor">
          <Bool value={d.outdoor_supported} />
        </Field>
        <Field label="Late night">
          <Bool value={d.late_night_allowed} />
        </Field>
        <Field label="Sound license required">
          <Bool value={d.sound_license_required} />
        </Field>
        <Field label="Custom playlist">
          <Bool value={d.custom_playlist_allowed} />
        </Field>
      </div>
    </div>
  );
}

function EventManagementBlock({ d }) {
  if (!d) return null;
  return (
    <div className={styles.typeBlock}>
      <h4 className={styles.blockTitle}>Event management details</h4>
      <div className={styles.fieldGrid}>
        <Field label="Event types">
          <PillList items={d.event_types_supported} />
        </Field>
        <Field label="Services offered">
          <PillList items={d.services_offered} />
        </Field>
        <Field label="Themes">
          <PillList items={d.themes_supported} />
        </Field>
        <Field label="Team size">{d.team_size}</Field>
        <Field label="On-site managers">{d.on_site_managers}</Field>
        <Field label="Decoration">
          <Bool value={d.decoration_included} />
        </Field>
        <Field label="Catering management">
          <Bool value={d.catering_management} />
        </Field>
        <Field label="Entertainment">
          <Bool value={d.entertainment_management} />
        </Field>
        <Field label="Vendor coordination">
          <Bool value={d.vendor_coordination_included} />
        </Field>
        <Field label="Guest management">
          <Bool value={d.guest_management_included} />
        </Field>
        <Field label="Logistics">
          <Bool value={d.logistics_management_included} />
        </Field>
        <Field label="Experience">
          {d.experience_years ? `${d.experience_years} years` : null}
        </Field>
      </div>
    </div>
  );
}

function MakeupBlock({ d }) {
  if (!d) return null;
  return (
    <div className={styles.typeBlock}>
      <h4 className={styles.blockTitle}>Makeup artist details</h4>
      <div className={styles.fieldGrid}>
        <Field label="Makeup types">
          <PillList items={d.makeup_types} />
        </Field>
        <Field label="Specialization">
          <PillList items={d.specialization} />
        </Field>
        <Field label="Brands">
          <PillList items={d.brands_used} />
        </Field>
        <Field label="Premium products">
          <Bool value={d.premium_products_used} />
        </Field>
        <Field label="Team size">{d.team_size}</Field>
        <Field label="Assistants">{d.assistants_count}</Field>
        <Field label="Duration">
          {d.service_duration_minutes ? `${d.service_duration_minutes} min` : null}
        </Field>
        <Field label="Travel to client">
          <Bool value={d.travel_to_client} />
        </Field>
        <Field label="Travel cost">
          {d.travel_cost_per_km ? `₹${d.travel_cost_per_km}/km` : null}
        </Field>
        <Field label="Base city">{d.base_city}</Field>
        <Field label="Hairstyling">
          <Bool value={d.hairstyling_included} />
        </Field>
        <Field label="Draping">
          <Bool value={d.draping_included} />
        </Field>
        <Field label="Nail art">
          <Bool value={d.nail_art_available} />
        </Field>
        <Field label="Trial">
          <Bool value={d.trial_available} />
        </Field>
        <Field label="Paid trial">
          <Bool value={d.paid_trial_available} />
        </Field>
      </div>
    </div>
  );
}

/* ───────────────────── Main component ───────────────────── */

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
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  const isUpdateToLive = (s) =>
    Boolean(s.current_live_version_id) && s.is_new_service !== true;

  const handleReviewFinalized = (result) => {
    setServices((arr) =>
      arr.map((s) =>
        (s.id || s.service_id) === result.service_id
          ? {
              ...s,
              status: result.service_status,
              service_status: result.service_status,
              version_status: result.version_status,
            }
          : s
      )
    );
    setReviewServiceId(null);
  };

  const openReview = (id) => {
    // close view first so only one modal is open, then open review
    setView(null);
    setViewLoading(false);
    setLightboxIndex(null);
    setReviewServiceId(id);
  };

  const renderMediaGallery = (media = []) => {
    if (!media.length) return null;
    return (
      <div className={styles.mediaGallery}>
        {media.map((m, i) => {
          const isVideo = m.media_type === "video" || isVideoUrl(m.media_url);
          const ytId = isVideo ? getYouTubeId(m.media_url) : null;
          return (
            <button
              key={m.id || i}
              type="button"
              className={styles.mediaThumb}
              onClick={() => setLightboxIndex(i)}
            >
              {m.media_type === "image" ? (
                <img src={m.media_url} alt="" loading="lazy" />
              ) : ytId ? (
                <div className={styles.videoThumb}>
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                  />
                  <span className={styles.playBtn}>▶</span>
                </div>
              ) : (
                <div className={styles.videoThumb}>
                  <span className={styles.playBtn}>▶</span>
                  <span className={styles.videoLabel}>
                    {m.metadata?.label || "Video"}
                  </span>
                </div>
              )}
              {m.is_cover && <span className={styles.coverBadge}>Cover</span>}
            </button>
          );
        })}
      </div>
    );
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
            const status = s.version_status || s.status || s.service_status;
            return (
              <div key={id} className={styles.card}>
                <div className={styles.imgBox}>
                  {s.images?.[0] || s.media?.[0]?.media_url ? (
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
                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.category}>
                    {titleCase(s.category || s.service_type)}
                  </div>
                  <h3 className={styles.cardTitle}>{s.name || s.service_name}</h3>
                  <div className={styles.meta}>
                    🏢 {s.vendor || s.vendor_name}
                    <br />
                    📍 {s.city}
                    <br />
                    {isUpdateToLive(s) ? "Update to Live Service" : "New Service"}
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.dateText}>
                      Submitted {formatDate(s.createdAt || s.created_at)}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button className={styles.btn} onClick={() => handleView(id)}>
                      View
                    </button>
                    {status === "under_review" ? (
                      <button
                        className={`${styles.btn} ${styles.success}`}
                        onClick={() => openReview(id)}
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        className={styles.btn}
                        onClick={() => handleOpenHistory(id)}
                      >
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

      {/* ═══════════════ VIEW MODAL ═══════════════ */}
      <Modal
        isOpen={!!view || viewLoading}
        onClose={() => {
          setView(null);
          setViewLoading(false);
          setLightboxIndex(null);
        }}
        title={
          view
            ? `${view.service_name || "Service"} · ${titleCase(view.service_type || "")}`
            : "Service Details"
        }
        size="full"
      >
        {viewLoading ? (
          <div className={styles.viewLoader}>
            <Loader label="Loading service…" />
          </div>
        ) : view ? (
          <div className={styles.viewLayout}>
            <div className={styles.viewMediaCol}>
              {renderMediaGallery(view.media)}
              {lightboxIndex !== null && view.media?.length > 0 && (
                <MediaLightbox
                  media={view.media}
                  startIndex={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                />
              )}
            </div>

            <div className={styles.viewContentCol}>
              <div className={styles.viewHeader}>
                <div>
                  <div className={styles.category}>
                    {titleCase(view.service_type || view.category)}
                  </div>
                  <h2 className={styles.viewTitle}>
                    {view.service_name || view.name}
                  </h2>
                </div>
                <StatusBadge
                  status={view.version_status || view.service_status || view.status}
                />
              </div>

              {view.description && (
                <p className={styles.viewDesc}>{view.description}</p>
              )}

              {/* Location */}
              <div className={styles.infoCard}>
                <h4 className={styles.blockTitle}>Location</h4>
                <div className={styles.address}>
                  <div className={styles.addressMain}>
                    {view.add_line1}
                    {view.add_line2 && (
                      <>
                        <br />
                        {view.add_line2}
                      </>
                    )}
                  </div>
                  <div className={styles.addressSub}>
                    {[view.area, view.city, view.state].filter(Boolean).join(", ")}
                    {view.pincode ? ` – ${view.pincode}` : ""}
                  </div>
                  <div className={styles.addressCountry}>{view.country}</div>
                  {view.latitude != null && view.longitude != null && (
                    <div className={styles.coords}>
                      📍 {Number(view.latitude).toFixed(4)},{" "}
                      {Number(view.longitude).toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor */}
              <div className={styles.infoCard}>
                <h4 className={styles.blockTitle}>Vendor</h4>
                <div className={styles.fieldGrid}>
                  <Field label="Name">{view.vendor_name}</Field>
                  <Field label="Email">{view.vendor_email}</Field>
                  <Field label="Phone">{view.vendor_phone}</Field>
                </div>
              </div>

              {/* Variants */}
              {view.variants?.length > 0 && (
                <div className={styles.infoCard}>
                  <h4 className={styles.blockTitle}>Variants & Pricing</h4>
                  <div className={styles.variantList}>
                    {view.variants.map((v) => {
                      const p = v.pricing || {};
                      return (
                        <div key={v.id} className={styles.variantCard}>
                          <div className={styles.variantHead}>
                            <strong>{v.variant_name}</strong>
                            {v.is_default && (
                              <span className={styles.defaultBadge}>Default</span>
                            )}
                          </div>
                          {v.description && (
                            <p className={styles.variantDesc}>{v.description}</p>
                          )}
                          <div className={styles.priceRowDetail}>
                            {p.veg_price != null && (
                              <div>
                                <span className={styles.priceLabel}>Veg</span>
                                <span className={styles.priceVal}>
                                  {formatINR(p.veg_price)}
                                </span>
                              </div>
                            )}
                            {p.non_veg_price != null && (
                              <div>
                                <span className={styles.priceLabel}>Non-Veg</span>
                                <span className={styles.priceVal}>
                                  {formatINR(p.non_veg_price)}
                                </span>
                              </div>
                            )}
                            {p.base_price != null && (
                              <div>
                                <span className={styles.priceLabel}>
                                  {String(v.pricing_type || "").toLowerCase() ===
                                  "package"
                                    ? "Package"
                                    : "Base"}
                                </span>
                                <span className={styles.priceVal}>
                                  {formatINR(p.base_price)}
                                </span>
                              </div>
                            )}
                          </div>
                          {v.pricing_type && (
                            <div className={styles.metaLine}>
                              {String(v.pricing_type).replace(/_/g, " ")}
                              {v.currency && ` · ${v.currency}`}
                              {p.pricing_mode &&
                                ` · ${p.pricing_mode.replace(/_/g, " ")}`}
                            </div>
                          )}
                          {v.inclusions?.length > 0 && (
                            <div className={styles.inclBlock}>
                              <span className={styles.inclLabel}>Inclusions</span>
                              <PillList items={v.inclusions} />
                            </div>
                          )}
                          {v.exclusions?.length > 0 && (
                            <div className={styles.inclBlock}>
                              <span className={styles.inclLabel}>Exclusions</span>
                              <PillList items={v.exclusions} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Type-specific */}
              <VenueBlock d={view.venue} />
              <CateringBlock d={view.catering} />
              <PhotographyBlock d={view.photography} />
              <DjBlock d={view.dj} />
              <EventManagementBlock d={view.event_management} />
              <MakeupBlock d={view.makeup_artist} />

              {/* Tags & amenities */}
              {(view.metadata?.tags?.length > 0 ||
                view.metadata?.amenities?.length > 0) && (
                <div className={styles.infoCard}>
                  <h4 className={styles.blockTitle}>Tags & Amenities</h4>
                  {view.metadata?.tags?.length > 0 && (
                    <div className={styles.metaGroup}>
                      <span className={styles.inclLabel}>Tags</span>
                      <PillList items={view.metadata.tags} />
                    </div>
                  )}
                  {view.metadata?.amenities?.length > 0 && (
                    <div className={styles.metaGroup}>
                      <span className={styles.inclLabel}>Amenities</span>
                      <PillList items={view.metadata.amenities} />
                    </div>
                  )}
                </div>
              )}

              {(view.rejection_reason || view.rejectionReason) && (
                <div className={styles.reasonBox}>
                  <strong>Latest reviewer note:</strong>{" "}
                  {view.rejection_reason || view.rejectionReason}
                </div>
              )}

              <div className={styles.viewActions}>
                {(view.version_status || view.status || view.service_status) ===
                "under_review" ? (
                  <button
                    className={`${styles.btn} ${styles.success} ${styles.btnLg}`}
                    onClick={() => openReview(view.id || view.service_id)}
                  >
                    Start Review
                  </button>
                ) : (
                  <button
                    className={`${styles.btn} ${styles.btnLg}`}
                    onClick={() =>
                      handleOpenHistory(view.id || view.service_id)
                    }
                  >
                    Review History
                  </button>
                )}
              </div>
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
      <Modal
        isOpen={!!historyModal}
        onClose={() => setHistoryModal(null)}
        title="Review History"
        size="lg"
      >
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
                    Version {v.version_number ?? v.version_id} —{" "}
                    {titleCase(v.version_status)}
                  </strong>
                  <div className={styles.dateText}>
                    {v.reviewed_at
                      ? `Reviewed ${formatDate(v.reviewed_at)}`
                      : "Not yet reviewed"}
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
                        <strong>
                          {titleCase(s.section.replace(/_/g, " "))}:
                        </strong>{" "}
                        {titleCase(s.status.replace(/_/g, " "))}
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