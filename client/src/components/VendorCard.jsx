import React from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Building2,
  Globe,
  User,
} from "lucide-react";
import styles from "../styles/VendorCard.module.css";

export default function VendorCard({ vendor }) {
  if (!vendor) return null;

  const businessName = vendor.business_name || "Vendor";
  const phone = vendor.phone || vendor.contact_person;
  const email = vendor.email;
  const experience = vendor.experience;
  const location = [vendor.city, vendor.state, vendor.country]
    .filter(Boolean)
    .join(", ");

  const handleCall = () => {
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    if (phone) {
      const message = encodeURIComponent(
        "Hi, I'm interested in your services. Can we discuss further?"
      );
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    }
  };

  const handleEmail = () => {
    if (email) {
      const subject = encodeURIComponent("Inquiry regarding your services");
      window.location.href = `mailto:${email}?subject=${subject}`;
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.vendorInfo}>
          <div className={styles.avatar}>
            {vendor.avatar ? (
              <img src={vendor.avatar} alt={businessName} className={styles.avatarImage} />
            ) : (
              <Building2 size={32} className={styles.avatarIcon} />
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <h3 className={styles.vendorName}>{businessName}</h3>
              {/* You can add verified badge later when API supports it */}
            </div>
            {location && <p className={styles.location}>{location}</p>}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className={styles.description}>
        {vendor.description ||
          "Experienced service provider offering premium venue and event solutions with attention to detail."}
      </p>

      {/* Stats */}
      <div className={styles.stats}>
        {experience !== null && experience !== undefined && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{experience}+</span>
            <span className={styles.statLabel}>Years Experience</span>
          </div>
        )}

        <div className={styles.responseTime}>
          <Clock size={18} />
          <span>Typically replies within a few hours</span>
        </div>
      </div>

      {/* Contact Actions */}
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={handleCall}
          disabled={!phone}
          title="Call"
        >
          <Phone size={20} />
          <span>Call</span>
        </button>

        <button
          className={styles.actionBtn}
          onClick={handleWhatsApp}
          disabled={!phone}
          title="WhatsApp"
        >
          <MessageCircle size={20} />
          <span>WhatsApp</span>
        </button>

        <button
          className={styles.actionBtn}
          onClick={handleEmail}
          disabled={!email}
          title="Email"
        >
          <Mail size={20} />
          <span>Email</span>
        </button>

        {vendor.website && (
          <button
            className={styles.actionBtn}
            onClick={() => window.open(vendor.website, "_blank")}
            title="Website"
          >
            <Globe size={20} />
            <span>Website</span>
          </button>
        )}
      </div>
    </div>
  );
}