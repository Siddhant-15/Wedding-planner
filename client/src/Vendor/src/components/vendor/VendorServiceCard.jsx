import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Star,
  ImageOff,
} from "lucide-react";
import styles from "../../styles/VendorServiceCard.module.css";

const CATEGORY_LABELS = {
  venue: "Venue",
  catering: "Catering",
  dj: "DJ",
  photography: "Photography",
  event_management: "Event Mgmt",
  makeup_artist: "Makeup",
};

const STATUS_LABELS = {
  live: "Live",
  under_review: "Under Review",
  draft: "Draft",
  rejected: "Rejected",
  archived: "Archived",
  needs_revision: "Changes Needed",
  inactive: "Inactive",
  suspended: "Suspended",
};

const STATUS_CLASSES = {
  live: styles.badgeLive,
  under_review: styles.badgeUnderReview,
  draft: styles.badgeDraft,
  rejected: styles.badgeRejected,
  archived: styles.badgeArchived,
  needs_revision: styles.badgeNeedsRevision,
  inactive: styles.badgeInactive,
  suspended: styles.badgeDefault,
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return (
    STATUS_LABELS[status] ||
    status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

export default function VendorServiceCard({
  service,
  onView,
  onEdit,
  onDelete,
}) {
  const [idx, setIdx] = useState(0);

  if (!service) return null;
  console.log("FULL SERVICE:", service);
console.log("SERVICE MEDIA:", service.media);
console.log(
  "MEDIA TYPES:",
  service.media?.map((m) => ({
    id: m.id,
    media_url: m.media_url,
    media_type: m.media_type,
    is_cover: m.is_cover,
  }))
);

  const images = (service.raw?.media || [])
  .filter(
    (media) =>
      media.media_type === "image" &&
      media.is_cover === true
  )
  .sort(
    (a, b) =>
      (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const feedback = service.revision_feedback || [];
  const needsRevision = service.status === "needs_revision";

  const next = (e) => {
    e.stopPropagation();
    setIdx((p) => (p + 1) % images.length);
  };
  const prev = (e) => {
    e.stopPropagation();
    setIdx((p) => (p - 1 + images.length) % images.length);
  };
  const EDITABLE_STATUSES = new Set(["live", "needs_revision", "draft"]);

  const editable = EDITABLE_STATUSES.has((service.status || "").toLowerCase());

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
  {console.log("RENDER IMAGES:", images)}

  {images.length > 0 ? (
    <>
      <img
        src={images[idx]?.media_url}
        alt={service.service_name}
        className={styles.image}
        onLoad={() =>
          console.log(
            "IMAGE LOADED:",
            images[idx]?.media_url
          )
        }
        onError={(e) => {
          console.error(
            "IMAGE FAILED:",
            images[idx]?.media_url,
            e
          );
        }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className={`${styles.navBtn} ${styles.navLeft}`}
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={next}
            className={`${styles.navBtn} ${styles.navRight}`}
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>

          <div className={styles.dots}>
            {images.map((image, i) => (
              <span
                key={image.id}
                className={`${styles.dot} ${
                  i === idx ? styles.dotActive : ""
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  ) : (
    <div className={styles.placeholder}>
      <ImageOff size={36} />
    </div>
  )}
</div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.tag}>
            {CATEGORY_LABELS[service.service_type] || service.service_type}
          </span>
          <span className={styles.rating}>
            <Star size={12} className={styles.starIcon} />
            {service.rating ?? "New"}
          </span>
        </div>

        <div>
          <h3 className={styles.title}>{service.service_name}</h3>
          {(service.city || service.state) && (
            <p className={styles.location}>
              <MapPin size={12} />
              {[service.city, service.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>

        {needsRevision && (
          <button
            type="button"
            className={styles.revisionBanner}
            onClick={onView}
            aria-label="View requested changes"
          >
            <span className={styles.revisionBannerDot} />
            <div className={styles.revisionBannerText}>
              <strong>Changes requested</strong>
              <span>
                {feedback.length
                  ? `${feedback.length} section${feedback.length > 1 ? "s" : ""
                  } need updates — view details`
                  : "Admin has requested updates — view details"}
              </span>
            </div>
          </button>
        )}

        <div className={styles.pricing}>
          {service.pricing?.isCatering ? (
            <div className={styles.pricingCatering}>
              <div>
                <p className={styles.priceLabel}>Veg</p>
                <p className={styles.priceValue}>{service.pricing.veg}</p>
              </div>
              <div>
                <p className={styles.priceLabel}>Non-Veg</p>
                <p className={styles.priceValue}>{service.pricing.nonVeg}</p>
              </div>
              <span className={styles.priceUnit}>per head</span>
            </div>
          ) : service.pricing?.isPhotography ? (
            <div className={styles.pricingSingle}>
              {service.pricing.photo && (
                <div>
                  <p className={styles.priceLabel}>Photo</p>
                  <p className={styles.priceValue}>{service.pricing.photo}</p>
                </div>
              )}
              {service.pricing.photoVideo && (
                <div>
                  <p className={styles.priceLabel}>Photo + Video</p>
                  <p className={styles.priceValue}>
                    {service.pricing.photoVideo}
                  </p>
                </div>
              )}
            </div>
          ) : service.pricing?.isVenue ? (
            <div className={styles.pricingCatering}>
              {service.pricing.veg && (
                <div>
                  <p className={styles.priceLabel}>Veg</p>
                  <p className={styles.priceValue}>{service.pricing.veg}</p>
                </div>
              )}
              {service.pricing.nonVeg && (
                <div>
                  <p className={styles.priceLabel}>Non-Veg</p>
                  <p className={styles.priceValue}>{service.pricing.nonVeg}</p>
                </div>
              )}
              {service.pricing.rental && (
                <div>
                  <p className={styles.priceLabel}>Rental</p>
                  <p className={styles.priceValue}>{service.pricing.rental}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.pricingSingle}>
              <span className={styles.priceMain}>{service.pricing?.price}</span>
              {service.pricing?.label && (
                <span className={styles.priceUnit}>
                  / {service.pricing.label}
                </span>
              )}
            </div>
          )}
        </div>

        {service.amenities?.length > 0 && (
          <div className={styles.amenities}>
            {service.amenities.slice(0, 3).map((a) => (
              <span key={a} className={styles.chip}>
                {a}
              </span>
            ))}
            {service.amenities.length > 3 && (
              <span className={styles.more}>
                +{service.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btn} onClick={onView}>
            <Eye size={14} /> View
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={onEdit}
            disabled={!editable}
            title={
              editable
                ? "Edit service"
                : `Editing is only available when status is Live or Changes Needed (current: ${formatStatus(service.status)})`
            }
            aria-label={editable ? "Edit service" : "Edit unavailable"}
            aria-disabled={!editable}
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}