import React from "react";
import {
  Users,
  Home,
  Maximize2,
  Car,
  Palette,
  UtensilsCrossed,
  Wine,
  CheckCircle2,
  XCircle,
  Shield,
  Music,
  Truck,
} from "lucide-react";
import styles from "../styles/VenueSpecsCard.module.css";

const formatText = (text) => {
  if (!text) return "-";
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

function PolicyBadge({ type, label }) {
  const configs = {
    allowed: { icon: CheckCircle2, text: "Allowed", className: styles.allowed },
    "in-house-only": { icon: Shield, text: "In-house Only", className: styles.inHouse },
    "not-allowed": { icon: XCircle, text: "Not Allowed", className: styles.notAllowed },
  };

  const config = configs[type] || { icon: CheckCircle2, text: label || "Allowed", className: styles.allowed };
  const Icon = config.icon;

  return (
    <div className={`${styles.policyBadge} ${config.className}`}>
      <Icon size={16} />
      <span>{config.text}</span>
    </div>
  );
}

export default function VenueSpecsCard({ venue }) {
  if (!venue) return null;

  const policies = venue.venue_policies || {};
  const otherPolicies = policies.other_policies || [];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Home size={24} className={styles.titleIcon} />
        Venue Specifications
      </h3>

      {/* Specifications Grid - All cards now uniform */}
      <div className={styles.specsGrid}>
        <div className={styles.specItem}>
          <Users size={28} className={styles.specIcon} />
          <div className={styles.specContent}>
            <p className={styles.specValue}>
              {venue.min_capacity} – {venue.max_capacity}
            </p>
            <p className={styles.specLabel}>Guest Capacity</p>
          </div>
        </div>

        <div className={styles.specItem}>
          <Home size={28} className={styles.specIcon} />
          <div className={styles.specContent}>
            <p className={styles.specValue}>{formatText(venue.venue_type)}</p>
            <p className={styles.specLabel}>Venue Type</p>
          </div>
        </div>

        <div className={styles.specItem}>
          <Maximize2 size={28} className={styles.specIcon} />
          <div className={styles.specContent}>
            <p className={styles.specValue}>
              {venue.square_feet ? venue.square_feet.toLocaleString() : "-"}
            </p>
            <p className={styles.specLabel}>Square Feet</p>
          </div>
        </div>

        <div className={styles.specItem}>
          <Car size={28} className={styles.specIcon} />
          <div className={styles.specContent}>
            <p className={styles.specValue}>
              {venue.parking_capacity || "-"}
            </p>
            <p className={styles.specLabel}>Parking Capacity</p>
          </div>
        </div>

        {/* Venue Nature - Now same as other cards (no fullWidth) */}
        <div className={styles.specItem}>
          <Home size={28} className={styles.specIcon} />   {/* You can change icon if you want */}
          <div className={styles.specContent}>
            <p className={styles.specValue}>{formatText(venue.venue_nature)}</p>
            <p className={styles.specLabel}>Venue Nature</p>
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className={styles.policiesSection}>
        <h4 className={styles.sectionTitle}>Venue Policies</h4>

        <div className={styles.policiesGrid}>
          <div className={styles.policyRow}>
            <div className={styles.policyLabel}>
              <Palette size={20} />
              <span>Decoration</span>
            </div>
            <PolicyBadge type={policies.decoration_policy} />
          </div>

          <div className={styles.policyRow}>
            <div className={styles.policyLabel}>
              <UtensilsCrossed size={20} />
              <span>Catering</span>
            </div>
            <PolicyBadge
              type={policies.catering_policy === "in-house-only" ? "in-house-only" : policies.catering_policy}
            />
          </div>

          <div className={styles.policyRow}>
            <div className={styles.policyLabel}>
              <Wine size={20} />
              <span>Alcohol</span>
            </div>
            <PolicyBadge type={policies.alcohol_policy} />
          </div>
        </div>

        {otherPolicies.length > 0 && (
          <div className={styles.otherPolicies}>
            <h5 className={styles.otherTitle}>Additional Policies</h5>
            <ul className={styles.otherPoliciesList}>
              {otherPolicies.map((policy, index) => (
                <li key={index} className={styles.otherPolicyItem}>
                  <div className={styles.policyTitleText}>{policy.title}</div>
                  <div className={styles.policyDesc}>{policy.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}