import React from "react";
import {
  Clock,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import styles from "../styles/VendorCard.module.css";

export default function VendorCard({ vendor }) {
  if (!vendor) return null;

  const businessName =
    vendor.business_name || "Vendor";

  const experience =
    vendor.experience || 2;

  const location = [
    vendor.city,
    vendor.state,
    vendor.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.vendorInfo}>
          <div className={styles.avatar}>
            {vendor.avatar ? (
              <img
                src={vendor.avatar}
                alt={businessName}
                className={styles.avatarImage}
              />
            ) : (
              <Building2
                size={28}
                className={styles.avatarIcon}
              />
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <h3 className={styles.vendorName}>
                {businessName}
              </h3>

              <div className={styles.verified}>
                <ShieldCheck size={13} />
                Verified
              </div>
            </div>

            {location && (
              <div className={styles.locationRow}>
                <MapPin size={14} />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className={styles.descriptionWrap}>
        <p className={styles.description}>
          {vendor.description ||
            "Professional event service provider focused on delivering seamless and memorable experiences."}
        </p>
      </div>

      {/* HIGHLIGHTS */}
      <div className={styles.highlights}>
        <div className={styles.highlightCard}>
          <div className={styles.highlightIcon}>
            <Sparkles size={16} />
          </div>

          <div>
            <div className={styles.highlightValue}>
              {experience}+
            </div>

            <div className={styles.highlightLabel}>
              Years Experience
            </div>
          </div>
        </div>

        <div className={styles.highlightCard}>
          <div
            className={`${styles.highlightIcon} ${styles.successIcon}`}
          >
            <Clock size={16} />
          </div>

          <div>
            <div className={styles.highlightValue}>
              Fast Response
            </div>

            <div className={styles.highlightLabel}>
              Replies within hours
            </div>
          </div>
        </div>
      </div>

      {/* TRUST BADGES */}
      {/* <div className={styles.badges}>
        <div className={styles.badge}>
          Verified Professional
        </div>

        <div className={styles.badge}>
          Trusted Service
        </div>

        <div className={styles.badge}>
          Premium Experience
        </div>
      </div> */}
    </div>
  );
}