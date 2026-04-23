import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2, MapPin, Star, ImageOff } from "lucide-react";
import styles from '../../styles/VendorServiceCard.module.css'

const CATEGORY_LABELS = {
  venue: "Venue",
  catering: "Catering",
  dj: "DJ",
  photography: "Photography",
  event_management: "Event Mgmt",
  makeup_artist: "Makeup",
};

export default function VendorServiceCard({ service, onView, onEdit, onDelete }) {
  const [idx, setIdx] = useState(0);
  const images = service.media || [];
  const next = (e) => { e.stopPropagation(); setIdx((p) => (p + 1) % images.length); };
  const prev = (e) => { e.stopPropagation(); setIdx((p) => (p - 1 + images.length) % images.length); };

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {images.length > 0 ? (
          <>
            <img src={images[idx]} alt={service.service_name} className={styles.image} />
            {images.length > 1 && (
              <>
                <button onClick={prev} className={`${styles.navBtn} ${styles.navLeft}`} aria-label="Previous">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={next} className={`${styles.navBtn} ${styles.navRight}`} aria-label="Next">
                  <ChevronRight size={16} />
                </button>
                <div className={styles.dots}>
                  {images.map((_, i) => (
                    <span key={i} className={`${styles.dot} ${i === idx ? styles.dotActive : ""}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className={styles.placeholder}><ImageOff size={36} /></div>
        )}
        <span className={`${styles.badge} ${service.is_active ? styles.badgeActive : styles.badgeInactive}`}>
          {service.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.tag}>{CATEGORY_LABELS[service.service_type] || service.service_type}</span>
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
                  <p className={styles.priceValue}>{service.pricing.photoVideo}</p>
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
              <span className={styles.priceMain}>{service.pricing.price}</span>
              {service.pricing.label && (
                <span className={styles.priceUnit}>/ {service.pricing.label}</span>
              )}
            </div>
          )}
        </div>

        {service.amenities?.length > 0 && (
          <div className={styles.amenities}>
            {service.amenities.slice(0, 3).map((a) => (
              <span key={a} className={styles.chip}>{a}</span>
            ))}
            {service.amenities.length > 3 && (
              <span className={styles.more}>+{service.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btn} onClick={onView}><Eye size={14} /> View</button>
          <button className={styles.btn} onClick={onEdit}><Pencil size={14} /> Edit</button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete} aria-label="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
