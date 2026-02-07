import React from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Building2,
} from "lucide-react";
import styles from "../styles/VendorCard.module.css";

export default function VendorCard({ vendor, isVerified = false }) {
  const handleCall = () => {
    if (vendor.phone) {
      window.location.href = `tel:${vendor.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (vendor.phone) {
      const message = encodeURIComponent(
        "Hi, I'm interested in your services. Can we discuss further?"
      );
      const phone = vendor.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Inquiry about your services");
    window.location.href = `mailto:${vendor.email}?subject=${subject}`;
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.vendorInfo}>
          <div className={styles.avatar}>
            <Building2 className={styles.avatarIcon} />
          </div>
          <div>
            <h3 className={styles.vendorName}>
              {vendor.name}
              {isVerified && (
                <CheckCircle2 className={styles.verifiedIcon} />
              )}
            </h3>
            <p className={styles.location}>
              {vendor.city}, {vendor.state}
            </p>
          </div>
        </div>

        {isVerified && <span className={styles.verifiedBadge}>Verified</span>}
      </div>

      {/* Description */}
      <p className={styles.description}>
        {vendor.description ||
          "Professional wedding services provider with years of experience."}
      </p>

      {/* Stats */}
      <div className={styles.stats}>
        {vendor.experience != null && (
          <div className={styles.experience}>
            <span className={styles.experienceValue}>
              {vendor.experience}+
            </span>
            <span className={styles.experienceText}>Years Experience</span>
          </div>
        )}

        <div className={styles.responseTime}>
          <Clock className={styles.clockIcon} />
          <span>Usually responds within 2 hours</span>
        </div>
      </div>

      {/* Contact Buttons */}
      <div className={styles.actions}>
        <button
          className={styles.callBtn}
          onClick={handleCall}
          disabled={!vendor.phone}
        >
          <Phone className={styles.btnIcon} />
          <span className={styles.btnText}>Call</span>
        </button>

        <button
          className={styles.whatsappBtn}
          onClick={handleWhatsApp}
          disabled={!vendor.phone}
        >
          <MessageCircle className={styles.btnIcon} />
          <span className={styles.btnText}>WhatsApp</span>
        </button>

        <button className={styles.emailBtn} onClick={handleEmail}>
          <Mail className={styles.btnIcon} />
          <span className={styles.btnText}>Email</span>
        </button>
      </div>
    </div>
  );
}
