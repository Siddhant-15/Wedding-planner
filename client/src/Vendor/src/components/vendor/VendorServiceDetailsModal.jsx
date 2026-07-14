import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag,
  ChefHat,
  Package,
  ImageOff,
  CheckCircle2,
  Camera,
  Music,
  Brush
} from "lucide-react";
import styles from "../../styles/VendorServiceDetailsModal.module.css";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "—";

/* ---------------- PRICING ---------------- */
const getPricing = (v) => {
  const p = v.pricing || {};

  // Per plate (catering/venue)
  if (p.veg_price != null || p.non_veg_price != null) {
    return {
      type: "per_plate",
      veg: p.veg_price,
      nonVeg: p.non_veg_price,
      mode: p.pricing_mode,
    };
  }

  // Base / package / DJ / makeup / photography
  if (p.base_price != null) {
    return {
      type: "base",
      price: p.base_price,
    };
  }

  return { type: "none" };
};

/* ---------------- SECTION ---------------- */
function Section({ title, icon, children }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>{icon}</span>
        {title}
      </h3>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export default function VendorServiceDetailsModal({
  open,
  onClose,
  service,
}) {
  const [idx, setIdx] = useState(0);

  /* ESC + body lock */
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !service) return null;

  const images = service.media?.map((m) => m.media_url) || [];

  const next = () => setIdx((p) => (p + 1) % images.length);
  const prev = () => setIdx((p) => (p - 1 + images.length) % images.length);

  const fullAddress = [
    service.add_line1,
    service.add_line2,
    service.area,
    service.city,
    service.state,
    service.country,
    service.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  /* ---------------- VENUE ---------------- */
  const renderVenue = () => {
    const v = service.venue;
    if (!v) return null;

    return (
      <Section title="Venue Details" icon={<MapPin size={14} />}>
        <div className={styles.grid2}>
          <p><strong>Type:</strong> {v.venue_type}</p>
          <p><strong>Nature:</strong> {v.venue_nature}</p>
          <p>
            <strong>Capacity:</strong> {v.min_capacity} -{" "}
            {v.max_capacity || "∞"}
          </p>
          <p><strong>Parking:</strong> {v.parking_capacity}</p>
          <p><strong>Area:</strong> {v.square_feet} sqft</p>
        </div>

        {v.venue_policies && (
          <div className={styles.policyBox}>
            <p><strong>Policies:</strong></p>
            <p>🍸 Alcohol: {v.venue_policies.alcohol_policy}</p>
            <p>🍽 Catering: {v.venue_policies.catering_policy}</p>
            <p>🎨 Decoration: {v.venue_policies.decoration_policy}</p>

            {v.venue_policies.other_policies?.map((p, i) => (
              <p key={i}>
                • {p.title}: {p.description}
              </p>
            ))}
          </div>
        )}
      </Section>
    );
  };

  /* ---------------- CATERING ---------------- */
  const renderCatering = () => {
    const c = service.catering;
    if (!c) return null;

    return (
      <Section title="Catering Details" icon={<ChefHat size={14} />}>
        <div className={styles.grid2}>
          <p><strong>Cuisines:</strong> {c.cuisine_types?.join(", ")}</p>
          <p><strong>Style:</strong> {c.service_styles?.join(", ")}</p>
          <p>
            <strong>Orders:</strong> {c.min_order} - {c.max_order}
          </p>
          <p><strong>GST:</strong> {c.gst_percentage}%</p>
        </div>

        <div className={styles.tagList}>
          {c.special_diets_supported?.map((d) => (
            <span key={d} className={styles.tagChip}>
              {d}
            </span>
          ))}
        </div>
      </Section>
    );
  };

  /* ---------------- PHOTOGRAPHY ---------------- */
  const renderPhotography = () => {
    const p = service.photography;
    if (!p) return null;

    return (
      <Section title="Photography Details" icon={<Camera size={14} />}>
        <div className={styles.grid2}>
          <p><strong>Types:</strong> {p.photography_types?.join(", ")}</p>
          <p><strong>Team Size:</strong> {p.team_size}</p>
          <p><strong>Coverage:</strong> {p.coverage_hours} hrs</p>
          <p><strong>Photos:</strong> {p.photo_delivery_count}</p>
          <p>
            <strong>Album:</strong>{" "}
            {p.album_included ? `Yes (${p.album_pages} pages)` : "No"}
          </p>
          <p>
            <strong>Drone:</strong>{" "}
            {p.drone_shoot_available ? "Yes" : "No"}
          </p>
          <p>
            <strong>Editing:</strong> {p.editing_styles?.join(", ")}
          </p>
        </div>
      </Section>
    );
  };

  /* ---------------- DJ ---------------- */
  const renderDJ = () => {
    const d = service.dj;
    if (!d) return null;

    return (
      <Section title="DJ Details" icon={<Music size={14} />}>
        <div className={styles.grid2}>
          <p><strong>Genres:</strong> {d.genres_supported?.join(", ")}</p>
          <p><strong>Languages:</strong> {d.languages_supported?.join(", ")}</p>
          <p><strong>Event Types:</strong> {d.event_types_supported?.join(", ")}</p>
          <p><strong>Duration:</strong> {d.performance_duration_hours} hrs</p>
          <p><strong>Outdoor:</strong> {d.outdoor_supported ? "Yes" : "No"}</p>
          <p><strong>Late Night:</strong> {d.late_night_allowed ? "Allowed" : "No"}</p>
          <p><strong>MC Available:</strong> {d.mc_host_available ? "Yes" : "No"}</p>
        </div>

        <div className={styles.tagList}>
          {d.equipments_provided?.map((e) => (
            <span key={e} className={styles.tagChip}>{e}</span>
          ))}
        </div>
      </Section>
    );
  };

  /* ---------------- MAKEUP ARTIST ---------------- */
  const renderMakeupArtist = () => {
    const m = service.makeup_artist;
    if (!m) return null;

    return (
      <Section title="Makeup Artist Details" icon={<Brush size={14} />}>
        <div className={styles.grid2}>
          <p><strong>Makeup Types:</strong> {m.makeup_types?.join(", ")}</p>
          <p><strong>Specialization:</strong> {m.specialization?.join(", ")}</p>
          <p><strong>Brands Used:</strong> {m.brands_used?.join(", ")}</p>
          <p><strong>Team Size:</strong> {m.team_size}</p>
          <p><strong>Duration:</strong> {m.service_duration_minutes} mins</p>
          <p><strong>Home Service:</strong> {m.travel_to_client ? "Yes" : "No"}</p>
          <p><strong>Trial Available:</strong> {m.trial_available ? "Yes" : "No"}</p>
          <p><strong>Hair Styling:</strong> {m.hairstyling_included ? "Included" : "No"}</p>
          <p><strong>Draping:</strong> {m.draping_included ? "Included" : "No"}</p>
        </div>
      </Section>
    );
  };

  /* ---------------- EVENT MANAGEMENT ---------------- */
  const renderEventManagement = () => {
    const e = service.event_management;
    if (!e) return null;

    return (
      <Section title="Event Management Details" icon={<Package size={14} />}>
        <div className={styles.grid2}>
          <p><strong>Event Types:</strong> {e.event_types_supported?.join(", ")}</p>
          <p><strong>Services:</strong> {e.services_offered?.join(", ")}</p>
          <p><strong>Themes:</strong> {e.themes_supported?.join(", ")}</p>
          <p><strong>Team Size:</strong> {e.team_size}</p>
          <p><strong>On-site Managers:</strong> {e.on_site_managers}</p>
          <p><strong>Experience:</strong> {e.experience_years} years</p>
        </div>

        <div className={styles.policyBox}>
          <p><strong>Includes:</strong></p>
          <p>🎨 Decoration: {e.decoration_included ? "Yes" : "No"}</p>
          <p>🍽 Catering Management: {e.catering_management ? "Yes" : "No"}</p>
          <p>🎭 Entertainment: {e.entertainment_management ? "Yes" : "No"}</p>
        </div>
      </Section>
    );
  };

  /* ---------------- ROUTER ---------------- */
  const renderServiceSection = () => {
    switch (service.service_type) {
      case "venue":
        return renderVenue();
      case "catering":
        return renderCatering();
      case "photography":
        return renderPhotography();
      case "dj":
        return renderDJ();
      case "makeup_artist":
        return renderMakeupArtist();
      case "event_management":
        return renderEventManagement();
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* CLOSE */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        {/* IMAGES */}
        <div className={styles.imageSide}>
          {images.length > 0 ? (
            <>
              <img
                src={images[idx]}
                alt={service.service_name}
                className={styles.image}
              />

              {images.length > 1 && (
                <>
                  <button onClick={prev} className={styles.imgNavLeft}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={next} className={styles.imgNavRight}>
                    <ChevronRight size={18} />
                  </button>
                  <div className={styles.imgCount}>
                    {idx + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.imgPlaceholder}>
              <ImageOff size={48} />
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className={styles.detailsSide}>
          <header className={styles.header}>
            <h2 className={styles.title}>{service.service_name}</h2>

            <div className={styles.badges}>
              <span
                className={`${styles.badge} ${service.is_active
                  ? styles.badgeActive
                  : styles.badgeInactive
                  }`}
              >
                {service.is_active ? "Active" : "Inactive"}
              </span>

              {service.is_verified && (
                <span className={`${styles.badge} ${styles.badgeVerified}`}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
          </header>

          {service.description && (
            <p className={styles.desc}>{service.description}</p>
          )}

          {/* META */}
          <div className={styles.metaBox}>
            <div>
              <p className={styles.metaLabel}>Created</p>
              <p className={styles.metaValue}>
                {fmtDate(service.created_at)}
              </p>
            </div>
            <div>
              <p className={styles.metaLabel}>Updated</p>
              <p className={styles.metaValue}>
                {fmtDate(service.updated_at)}
              </p>
            </div>
          </div>

          {/* BASIC INFO */}
          <Section title="Basic Information" icon={<Tag size={14} />}>
            <p>
              <strong>Type:</strong> {service.service_type}
            </p>

            {fullAddress && (
              <p className={styles.flexLine}>
                <MapPin size={13} />
                {fullAddress}
              </p>
            )}

            {service.metadata?.tags?.length > 0 && (
              <div className={styles.tagList}>
                {service.metadata.tags.map((t) => (
                  <span key={t} className={styles.tagChip}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* SERVICE SPECIFIC */}
          {renderServiceSection()}

          {/* VARIANTS */}
          {service.variants?.length > 0 && (
            <Section title="Pricing & Packages" icon={<Package size={14} />}>
              <div className={styles.packages}>
                {service.variants.map((v) => {
                  const pricing = getPricing(v);

                  return (
                    <div key={v.id} className={styles.package}>
                      <div className={styles.packageHead}>
                        <h4 className={styles.packageTitle}>
                          {v.variant_name}
                        </h4>

                        {pricing.type === "base" && pricing.price != null && (
                          <p className={styles.priceBase}>
                            ₹{pricing.price.toLocaleString("en-IN")}
                            <span className={styles.priceUnit}> / package</span>
                          </p>
                        )}
                        {pricing.type === "per_plate" && (
                          <>
                            {pricing.veg != null && (
                              <p className={styles.priceVeg}>
                                Veg ₹{pricing.veg.toLocaleString("en-IN")} / plate
                              </p>
                            )}

                            {pricing.nonVeg != null && (
                              <p className={styles.priceNonVeg}>
                                Non-Veg ₹{pricing.nonVeg.toLocaleString("en-IN")} / plate
                              </p>
                            )}

                            {/* {pricing.mode && (
                              <span className={styles.priceUnit}>
                                ({pricing.mode})
                              </span>
                            )} */}
                          </>
                        )}
                      </div>

                      {v.inclusions?.length > 0 && (
                        <ul className={styles.inclusions}>
                          {v.inclusions.map((inc) => (
                            <li key={inc}>{inc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* AMENITIES */}
          {service.metadata?.amenities?.length > 0 && (
            <Section title="Amenities" icon={<Tag size={14} />}>
              <div className={styles.tagList}>
                {service.metadata.amenities.map((a) => (
                  <span key={a} className={styles.tagChip}>
                    {a}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}