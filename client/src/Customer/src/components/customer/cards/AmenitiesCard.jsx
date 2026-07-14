import React from "react";
import {
  CheckCircle2,
  Car,
  Wifi,
  Wind,
  Music,
  Utensils,
  Camera,
  Trees,
  Armchair,
  Shield,
  Sparkles,
  Baby,
  Accessibility,
} from "lucide-react";
import styles from "../styles/AmenitiesCard.module.css";

const amenityIcons = {
  parking: Car,
  wifi: Wifi,
  ac: Wind,
  "air conditioning": Wind,
  dj: Music,
  music: Music,
  catering: Utensils,
  food: Utensils,
  photography: Camera,
  garden: Trees,
  park: Trees,
  lawn: Trees,
  seating: Armchair,
  furniture: Armchair,
  security: Shield,
  decoration: Sparkles,
  decor: Sparkles,
  "kids area": Baby,
  "baby room": Baby,
  accessible: Accessibility,
  wheelchair: Accessibility,
};

const getAmenityIcon = (amenity) => {
  const key = amenity.toLowerCase();
  for (const [keyword, Icon] of Object.entries(amenityIcons)) {
    if (key.includes(keyword)) {
      return Icon;
    }
  }
  return CheckCircle2;
};

const formatAmenity = (amenity) => {
  return amenity
    .replace(/_/g, " ")
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

export default function AmenitiesCard({ amenities }) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className={styles.card}>
      <h3 className={styles.heading}>Amenities & Inclusions</h3>

      <div className={styles.grid}>
        {amenities.map((amenity, index) => {
          const Icon = getAmenityIcon(amenity);

          return (
            <div key={index} className={styles.item}>
              <Icon className={styles.icon} />
              <span className={styles.label}>
                {formatAmenity(amenity)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
