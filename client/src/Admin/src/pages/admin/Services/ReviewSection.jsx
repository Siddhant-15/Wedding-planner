// ReviewSection.jsx
import { useEffect, useState, useCallback } from "react";
import { formatINR, titleCase } from "../../../utils/format";
import styles from "./ReviewSection.module.css";

/* ───────────────────────── helpers ───────────────────────── */

const HIDDEN_KEYS = new Set([
  "id",
  "service_version_id",
  "created_at",
  "updated_at",
  "is_active",
  "created_by",
  "updated_by",
  "version_notes",
]);

function formatValue(val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
  if (typeof val === "object") return null; // handled specially
  return String(val);
}

function Field({ label, children }) {
  if (children === null || children === undefined || children === "—") return null;
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

function PillList({ items, empty = "—" }) {
  if (!items?.length) return <span className={styles.muted}>{empty}</span>;
  return (
    <div className={styles.pills}>
      {items.map((t, i) => (
        <span key={i} className={styles.pill}>{t}</span>
      ))}
    </div>
  );
}

function PolicyCard({ title, children }) {
  return (
    <div className={styles.policyCard}>
      <div className={styles.policyTitle}>{title}</div>
      <div className={styles.policyBody}>{children}</div>
    </div>
  );
}

/* ───────────────────────── Media Lightbox ───────────────────────── */

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function isVideoUrl(url = "") {
  return /youtube\.com|youtu\.be|instagram\.com|vimeo\.com|facebook\.com|tiktok\.com/i.test(url);
}

function MediaLightbox({ media, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const item = media[index];
  const ytId = item?.media_type === "video" ? getYouTubeId(item.media_url) : null;

  const go = useCallback(
    (dir) => {
      setIndex((i) => (i + dir + media.length) % media.length);
    },
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
            <button className={`${styles.lbNav} ${styles.lbPrev}`} onClick={() => go(-1)} aria-label="Previous">
              ‹
            </button>
            <button className={`${styles.lbNav} ${styles.lbNext}`} onClick={() => go(1)} aria-label="Next">
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
              <p>External video</p>
              <a href={item.media_url} target="_blank" rel="noopener noreferrer" className={styles.lbLink}>
                Open in new tab →
              </a>
            </div>
          )}
        </div>

        <div className={styles.lbMeta}>
          <span>
            {index + 1} / {media.length}
            {item.is_cover && " · Cover"}
            {item.metadata?.label && ` · ${item.metadata.label}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Section contents ───────────────────────── */

function BasicInfoContent({ v, changeSummary }) {
  return (
    <div className={styles.block}>
      {changeSummary?.basic_information_changed && (
        <div className={styles.changedBadge}>Changed from live version</div>
      )}
      <Field label="Service name">{v.service_name}</Field>
      <Field label="Description">
        <p className={styles.desc}>{v.description || "—"}</p>
      </Field>
    </div>
  );
}

function LocationContent({ v, changeSummary }) {
  const hasCoords = v.latitude && v.longitude;
  return (
    <div className={styles.block}>
      {changeSummary?.location_changed && (
        <div className={styles.changedBadge}>Changed from live version</div>
      )}
      <div className={styles.addressCard}>
        <div className={styles.addressMain}>
          {v.add_line1}
          {v.add_line2 && (
            <>
              <br />
              {v.add_line2}
            </>
          )}
        </div>
        <div className={styles.addressSub}>
          {[v.area, v.city, v.state].filter(Boolean).join(", ")}
          {v.pincode ? ` – ${v.pincode}` : ""}
        </div>
        <div className={styles.addressCountry}>{v.country}</div>
        {hasCoords && (
          <div className={styles.coords}>
            📍 {Number(v.latitude).toFixed(4)}, {Number(v.longitude).toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
}

function MediaContent({ v, changeSummary }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const media = v.media || [];

  if (!media.length) return <p className={styles.empty}>No media on this version.</p>;

  return (
    <div className={styles.block}>
      {changeSummary &&
        (changeSummary.media_added || changeSummary.media_removed || changeSummary.cover_changed) && (
          <div className={styles.changedBadge}>
            {changeSummary.media_added > 0 && `${changeSummary.media_added} added `}
            {changeSummary.media_removed > 0 && `${changeSummary.media_removed} removed `}
            {changeSummary.cover_changed && "· cover changed"}
          </div>
        )}

      <div className={styles.mediaGrid}>
        {media.map((m, i) => {
          const isVideo = m.media_type === "video" || isVideoUrl(m.media_url);
          const ytId = isVideo ? getYouTubeId(m.media_url) : null;
          return (
            <button
              key={m.id || i}
              type="button"
              className={styles.mediaItem}
              onClick={() => setLightboxIndex(i)}
            >
              {m.media_type === "image" ? (
                <img src={m.media_url} alt="" className={styles.mediaImg} loading="lazy" />
              ) : ytId ? (
                <div className={styles.mediaVideo}>
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt=""
                    className={styles.mediaImg}
                  />
                  <span className={styles.playIcon}>▶</span>
                </div>
              ) : (
                <div className={styles.mediaVideo}>
                  <span className={styles.playIcon}>▶</span>
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

      {lightboxIndex !== null && (
        <MediaLightbox
          media={media}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

function PricingContent({ v, changeSummary }) {
  const variants = v.variants || [];
  if (!variants.length) return <p className={styles.empty}>No variants on this version.</p>;

  return (
    <div className={styles.block}>
      {changeSummary &&
        (changeSummary.variants_added ||
          changeSummary.variants_removed ||
          changeSummary.variants_modified) && (
          <div className={styles.changedBadge}>
            {changeSummary.variants_added > 0 && `${changeSummary.variants_added} added `}
            {changeSummary.variants_removed > 0 && `${changeSummary.variants_removed} removed `}
            {changeSummary.variants_modified > 0 && `${changeSummary.variants_modified} modified`}
          </div>
        )}

      <div className={styles.variantGrid}>
        {variants.map((variant) => {
          const p = variant.pricing || {};
          const type = (variant.pricing_type || "").toLowerCase();

          return (
            <div key={variant.id} className={styles.variantCard}>
              <div className={styles.variantHead}>
                <strong>{variant.variant_name}</strong>
                {variant.is_default && <span className={styles.defaultBadge}>Default</span>}
              </div>

              {variant.description && <p className={styles.variantDesc}>{variant.description}</p>}

              <div className={styles.priceRow}>
                {p.veg_price != null && (
                  <div>
                    <span className={styles.priceLabel}>Veg</span>
                    <span className={styles.priceVal}>{formatINR(p.veg_price)}</span>
                  </div>
                )}
                {p.non_veg_price != null && (
                  <div>
                    <span className={styles.priceLabel}>Non-Veg</span>
                    <span className={styles.priceVal}>{formatINR(p.non_veg_price)}</span>
                  </div>
                )}
                {p.base_price != null && (
                  <div>
                    <span className={styles.priceLabel}>
                      {type === "package" ? "Package" : "Base"}
                    </span>
                    <span className={styles.priceVal}>{formatINR(p.base_price)}</span>
                  </div>
                )}
                {p.rental_price != null && (
                  <div>
                    <span className={styles.priceLabel}>Rental</span>
                    <span className={styles.priceVal}>{formatINR(p.rental_price)}</span>
                  </div>
                )}
                {p.pricing_mode && (
                  <div className={styles.modeTag}>{p.pricing_mode.replace(/_/g, " ")}</div>
                )}
              </div>

              {type && (
                <div className={styles.metaLine}>
                  Pricing type: <strong>{type.replace(/_/g, " ")}</strong>
                  {variant.currency && ` · ${variant.currency}`}
                </div>
              )}

              {variant.inclusions?.length > 0 && (
                <div className={styles.inclBlock}>
                  <span className={styles.inclLabel}>Inclusions</span>
                  <PillList items={variant.inclusions} />
                </div>
              )}
              {variant.exclusions?.length > 0 && (
                <div className={styles.inclBlock}>
                  <span className={styles.inclLabel}>Exclusions</span>
                  <PillList items={variant.exclusions} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Type-specific detail renderers ─── */

function VenueDetails({ d }) {
  return (
    <div className={styles.detailGrid}>
      <Field label="Venue type">{d.venue_type}</Field>
      <Field label="Nature">{d.venue_nature}</Field>
      <Field label="Capacity">
        {d.min_capacity != null || d.max_capacity != null
          ? `${d.min_capacity ?? "?"} – ${d.max_capacity ?? "?"} guests`
          : null}
      </Field>
      <Field label="Area">{d.square_feet ? `${d.square_feet.toLocaleString()} sq ft` : null}</Field>
      <Field label="Parking">{d.parking_capacity ? `${d.parking_capacity} vehicles` : null}</Field>

      {d.venue_policies && (
        <div className={styles.policiesSection}>
          <h5 className={styles.subHead}>Venue policies</h5>
          <div className={styles.policyGrid}>
            {d.venue_policies.alcohol_policy && (
              <PolicyCard title="Alcohol">{titleCase(d.venue_policies.alcohol_policy)}</PolicyCard>
            )}
            {d.venue_policies.catering_policy && (
              <PolicyCard title="Catering">{titleCase(d.venue_policies.catering_policy.replace(/-/g, " "))}</PolicyCard>
            )}
            {d.venue_policies.decoration_policy && (
              <PolicyCard title="Decoration">{titleCase(d.venue_policies.decoration_policy)}</PolicyCard>
            )}
            {d.venue_policies.other_policies?.map((p, i) => (
              <PolicyCard key={i} title={p.title}>
                {p.description}
              </PolicyCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CateringDetails({ d }) {
  return (
    <div className={styles.detailGrid}>
      <Field label="Cuisines"><PillList items={d.cuisine_types} /></Field>
      <Field label="Service styles"><PillList items={d.service_styles} /></Field>
      <Field label="Special diets"><PillList items={d.special_diets_supported} /></Field>
      <Field label="Order range">
        {d.min_order != null || d.max_order != null
          ? `${d.min_order ?? "?"} – ${d.max_order ?? "?"} plates`
          : null}
      </Field>
      <Field label="Staff included">{formatValue(d.staff_included)}</Field>
      <Field label="Crockery & cutlery">{formatValue(d.crockery_cutlery_included)}</Field>
      <Field label="Tasting available">{formatValue(d.tasting_available)}</Field>
      <Field label="Customizable menu">{formatValue(d.customizable_menu)}</Field>
      <Field label="GST">{d.gst_percentage ? `${d.gst_percentage}%` : null}</Field>
      <Field label="Price includes tax">{formatValue(d.price_includes_tax)}</Field>
    </div>
  );
}

function PhotographyDetails({ d }) {
  return (
    <div className={styles.detailGrid}>
      <Field label="Types"><PillList items={d.photography_types} /></Field>
      <Field label="Editing styles"><PillList items={d.editing_styles} /></Field>
      <Field label="Coverage">{d.coverage_hours ? `${d.coverage_hours} hours` : null}</Field>
      <Field label="Team size">{d.team_size}</Field>
      <Field label="Second shooter">{formatValue(d.second_shooter_included)}</Field>
      <Field label="Photos delivered">{d.photo_delivery_count}</Field>
      <Field label="Video duration">{d.video_delivery_duration_minutes ? `${d.video_delivery_duration_minutes} min` : null}</Field>
      <Field label="Edited photos">{formatValue(d.edited_photos_included)}</Field>
      <Field label="Raw photos">{formatValue(d.raw_photos_provided)}</Field>
      <Field label="Album">{d.album_included ? `Yes (${d.album_pages || "?"} pages)` : "No"}</Field>
      <Field label="Videography">{formatValue(d.videography_available)}</Field>
      <Field label="Drone">{formatValue(d.drone_shoot_available)}</Field>
      <Field label="Overtime rate">{d.overtime_rate_per_hour ? formatINR(d.overtime_rate_per_hour) + "/hr" : null}</Field>
    </div>
  );
}

function DjDetails({ d }) {
  return (
    <div className={styles.detailGrid}>
      <Field label="Genres"><PillList items={d.genres_supported} /></Field>
      <Field label="Languages"><PillList items={d.languages_supported} /></Field>
      <Field label="Event types"><PillList items={d.event_types_supported} /></Field>
      <Field label="Equipment"><PillList items={d.equipments_provided} /></Field>
      <Field label="Performance duration">{d.performance_duration_hours ? `${d.performance_duration_hours} hrs` : null}</Field>
      <Field label="Sound system">{formatValue(d.sound_system_included)}</Field>
      <Field label="Lighting">{formatValue(d.lighting_included)}</Field>
      <Field label="Smoke machine">{formatValue(d.smoke_machine_included)}</Field>
      <Field label="LED wall">{formatValue(d.led_wall_included)}</Field>
      <Field label="MC / Host">{formatValue(d.mc_host_available)}</Field>
      <Field label="Outdoor supported">{formatValue(d.outdoor_supported)}</Field>
      <Field label="Late night">{formatValue(d.late_night_allowed)}</Field>
      <Field label="Sound license required">{formatValue(d.sound_license_required)}</Field>
      <Field label="Custom playlist">{formatValue(d.custom_playlist_allowed)}</Field>
    </div>
  );
}

function EventManagementDetails({ d }) {
  return (
    <div className={styles.detailGrid}>
      <Field label="Event types"><PillList items={d.event_types_supported} /></Field>
      <Field label="Services offered"><PillList items={d.services_offered} /></Field>
      <Field label="Themes"><PillList items={d.themes_supported} /></Field>
      <Field label="Team size">{d.team_size}</Field>
      <Field label="On-site managers">{d.on_site_managers}</Field>
      <Field label="Decoration">{formatValue(d.decoration_included)}</Field>
      <Field label="Catering management">{formatValue(d.catering_management)}</Field>
      <Field label="Entertainment">{formatValue(d.entertainment_management)}</Field>
      <Field label="Vendor coordination">{formatValue(d.vendor_coordination_included)}</Field>
      <Field label="Guest management">{formatValue(d.guest_management_included)}</Field>
      <Field label="Logistics">{formatValue(d.logistics_management_included)}</Field>
      <Field label="Experience">{d.experience_years ? `${d.experience_years} years` : null}</Field>
    </div>
  );
}

function MakeupDetails({ d }) {
  return (
    <div className={styles.detailGrid}>
      <Field label="Makeup types"><PillList items={d.makeup_types} /></Field>
      <Field label="Specialization"><PillList items={d.specialization} /></Field>
      <Field label="Brands used"><PillList items={d.brands_used} /></Field>
      <Field label="Premium products">{formatValue(d.premium_products_used)}</Field>
      <Field label="Team size">{d.team_size}</Field>
      <Field label="Assistants">{d.assistants_count}</Field>
      <Field label="Service duration">{d.service_duration_minutes ? `${d.service_duration_minutes} min` : null}</Field>
      <Field label="Travel to client">{formatValue(d.travel_to_client)}</Field>
      <Field label="Travel cost">{d.travel_cost_per_km ? `₹${d.travel_cost_per_km}/km` : null}</Field>
      <Field label="Base city">{d.base_city}</Field>
      <Field label="Hairstyling">{formatValue(d.hairstyling_included)}</Field>
      <Field label="Draping">{formatValue(d.draping_included)}</Field>
      <Field label="Nail art">{formatValue(d.nail_art_available)}</Field>
      <Field label="Trial available">{formatValue(d.trial_available)}</Field>
      <Field label="Paid trial">{formatValue(d.paid_trial_available)}</Field>
    </div>
  );
}

const DETAIL_RENDERERS = {
  venue: VenueDetails,
  catering: CateringDetails,
  photography: PhotographyDetails,
  dj: DjDetails,
  event_management: EventManagementDetails,
  makeup_artist: MakeupDetails,
};

function ServiceDetailsContent({ v }) {
  if (!v.detail) return <p className={styles.empty}>No type-specific details on this version.</p>;
  const { type, data } = v.detail;
  const Renderer = DETAIL_RENDERERS[type];

  return (
    <div className={styles.block}>
      <div className={styles.typeBadge}>{titleCase((type || "").replace(/_/g, " "))}</div>
      {Renderer ? (
        <Renderer d={data} />
      ) : (
        <div className={styles.detailGrid}>
          {Object.entries(data || {})
            .filter(([k]) => !HIDDEN_KEYS.has(k))
            .map(([k, val]) => {
              const formatted = formatValue(val);
              if (formatted === null && typeof val === "object") {
                return (
                  <Field key={k} label={titleCase(k.replace(/_/g, " "))}>
                    <pre className={styles.jsonBlock}>{JSON.stringify(val, null, 2)}</pre>
                  </Field>
                );
              }
              return (
                <Field key={k} label={titleCase(k.replace(/_/g, " "))}>
                  {formatted}
                </Field>
              );
            })}
        </div>
      )}
    </div>
  );
}

function PoliciesContent({ v }) {
  const tags = v.metadata?.tags || [];
  const amenities = v.metadata?.amenities || [];
  if (!tags.length && !amenities.length) {
    return <p className={styles.empty}>No tags or amenities on this version.</p>;
  }
  return (
    <div className={styles.block}>
      {tags.length > 0 && (
        <div className={styles.metaGroup}>
          <h5 className={styles.subHead}>Tags</h5>
          <PillList items={tags} />
        </div>
      )}
      {amenities.length > 0 && (
        <div className={styles.metaGroup}>
          <h5 className={styles.subHead}>Amenities</h5>
          <PillList items={amenities} />
        </div>
      )}
    </div>
  );
}

const CONTENT_BY_SECTION = {
  basic_information: BasicInfoContent,
  location: LocationContent,
  media: MediaContent,
  pricing_variants: PricingContent,
  service_details: ServiceDetailsContent,
  policies_metadata: PoliciesContent,
};

/* ───────────────────────── Main section ───────────────────────── */

export default function ReviewSection({
  sectionKey,
  sectionData,
  versionData,
  changeSummary,
  onSave,
}) {
  const [showCommentBox, setShowCommentBox] = useState(sectionData?.status === "changes_requested");
  const [comment, setComment] = useState(sectionData?.comment || "");
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    setComment(sectionData?.comment || "");
    setShowCommentBox(sectionData?.status === "changes_requested");
    setSaveState("idle");
  }, [sectionKey, sectionData?.status, sectionData?.comment]);

  const Content = CONTENT_BY_SECTION[sectionKey];
  const status = sectionData?.status || "pending";

  const save = async (nextStatus, nextComment) => {
    setSaveState("saving");
    try {
      await onSave(sectionKey, { status: nextStatus, comment: nextComment });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const handleLooksGood = () => {
    setShowCommentBox(false);
    save("approved", null);
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{titleCase(sectionKey.replace(/_/g, " "))}</h3>
        <span className={`${styles.statusBadge} ${styles[status]}`}>
          {status === "pending" && "Not reviewed"}
          {status === "approved" && "Approved"}
          {status === "changes_requested" && "Changes requested"}
        </span>
      </div>

      <div className={styles.content}>
        {Content ? <Content v={versionData} changeSummary={changeSummary} /> : null}
      </div>

      {status === "changes_requested" && sectionData?.comment && (
        <div className={styles.reasonBox}>
          <strong>Reviewer comment:</strong> {sectionData.comment}
        </div>
      )}

      <div className={styles.controls}>
        {!showCommentBox ? (
          <>
            <button
              type="button"
              className={`${styles.btn} ${styles.success}`}
              onClick={handleLooksGood}
              disabled={saveState === "saving"}
            >
              {status === "approved" ? "Approved ✓" : "Looks Good"}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.warn}`}
              onClick={() => setShowCommentBox(true)}
              disabled={saveState === "saving"}
            >
              Request Changes
            </button>
          </>
        ) : (
          <div className={styles.commentBox}>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Explain what needs to change in this section…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={styles.commentActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => setShowCommentBox(false)}
                disabled={saveState === "saving"}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.warn}`}
                onClick={() => comment.trim() && save("changes_requested", comment.trim())}
                disabled={saveState === "saving" || !comment.trim()}
              >
                {saveState === "saving" ? "Saving…" : "Submit"}
              </button>
            </div>
          </div>
        )}

        <span className={styles.saveState}>
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && "Failed to save — try again"}
        </span>
      </div>
    </div>
  );
}