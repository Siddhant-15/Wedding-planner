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
} from "lucide-react";
import styles from "../styles/VenueSpecsCard.module.css";

const formatHallType = (type) => {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

function PolicyBadge({ policy }) {
  const configs = {
    allowed: {
      icon: CheckCircle2,
      text: "Allowed",
      className: styles.allowed,
    },
    not_allowed: {
      icon: XCircle,
      text: "Not Allowed",
      className: styles.notAllowed,
    },
    in_house_only: {
      icon: Shield,
      text: "In-house Only",
      className: styles.inHouse,
    },
  };

  const config = configs[policy] || configs.allowed;
  const Icon = config.icon;

  return (
    <div className={`${styles.policyBadge} ${config.className}`}>
      <Icon className={styles.policyIcon} />
      <span>{config.text}</span>
    </div>
  );
}

export default function VenueSpecsCard({ venue }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Home className={styles.titleIcon} />
        Venue Specifications
      </h3>

      {/* Specs Grid */}
      <div className={styles.grid}>
        <div className={styles.spec}>
          <Users className={styles.specIcon} />
          <p className={styles.specValue}>
            {venue.capacity_min} - {venue.capacity_max}
          </p>
          <p className={styles.specLabel}>Guest Capacity</p>
        </div>

        <div className={styles.spec}>
          <Home className={styles.specIcon} />
          <p className={styles.specSmallValue}>
  {venue.hall_type ? formatHallType(venue.hall_type) : "-"}
</p>
          <p className={styles.specLabel}>Hall Type</p>
        </div>

        <div className={styles.spec}>
          <Maximize2 className={styles.specIcon} />
          <p className={styles.specValue}>
  {typeof venue.square_feet === "number"
    ? venue.square_feet.toLocaleString()
    : "-"}
</p>
          <p className={styles.specLabel}>Sq. Feet</p>
        </div>

        <div className={styles.spec}>
          <Car className={styles.specIcon} />
          <p className={styles.specValue}>{venue.parking_capacity}</p>
          <p className={styles.specLabel}>Parking Spots</p>
        </div>

        <div className={`${styles.spec} ${styles.fullWidth}`}>
          <p className={styles.specSmallValue}>
  {venue.indoor_outdoor ? venue.indoor_outdoor.replace(/_/g, " / ") : "-"}
</p>
          <p className={styles.specLabel}>Setup Type</p>
        </div>
      </div>

      {/* Policies */}
      <h4 className={styles.policyTitle}>Venue Policies</h4>

      <div className={styles.policies}>
        <div className={styles.policyItem}>
          <Palette className={styles.policyLabelIcon} />
          <span>Decoration:</span>
          <PolicyBadge policy={venue.decoration_policy} />
        </div>

        <div className={styles.policyItem}>
          <UtensilsCrossed className={styles.policyLabelIcon} />
          <span>Catering:</span>
          <PolicyBadge policy={venue.catering_policy} />
        </div>

        <div className={styles.policyItem}>
          <Wine className={styles.policyLabelIcon} />
          <span>Alcohol:</span>
          <PolicyBadge policy={venue.alcohol_policy} />
        </div>
      </div>
    </div>
  );
}
