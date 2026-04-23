import React from "react";
import { Camera, Video, Image, Clock, Users, BookOpen, Plane } from "lucide-react";
import styles from "../styles/PhotographySpecsCard.module.css";
import { titleCase } from "../../../utils/format";

const Pill = ({ children }) => <span className={styles.pill}>{children}</span>;

export default function PhotographySpecsCard({ photography }) {
  if (!photography) return null;
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Camera size={22} className={styles.titleIcon} />
        Photography Specifications
      </h3>

      <div className={styles.grid}>
        <div className={styles.specItem}>
          <Clock size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>{photography.coverage_hours || "-"} hrs</p>
            <p className={styles.specLabel}>Coverage</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <Users size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>{photography.team_size || "-"}</p>
            <p className={styles.specLabel}>Team size</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <Image size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>{photography.photo_delivery_count || "-"}</p>
            <p className={styles.specLabel}>Edited photos</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <Video size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>
              {photography.videography_available
                ? `${Math.round((photography.video_delivery_duration_minutes || 0))} min`
                : "—"}
            </p>
            <p className={styles.specLabel}>Video delivery</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <BookOpen size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>
              {photography.album_included ? `${photography.album_pages || 40} pg` : "—"}
            </p>
            <p className={styles.specLabel}>Photo album</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <Plane size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>{photography.drone_shoot_available ? "Yes" : "No"}</p>
            <p className={styles.specLabel}>Drone shoot</p>
          </div>
        </div>
      </div>

      {!!photography.photography_types?.length && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Photography types</h4>
          <div className={styles.pills}>
            {photography.photography_types.map((t) => <Pill key={t}>{titleCase(t)}</Pill>)}
          </div>
        </div>
      )}

      {!!photography.editing_styles?.length && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Editing styles</h4>
          <div className={styles.pills}>
            {photography.editing_styles.map((t) => <Pill key={t}>{titleCase(t)}</Pill>)}
          </div>
        </div>
      )}

      {photography.overtime_rate_per_hour && (
        <p className={styles.note}>Overtime ₹{photography.overtime_rate_per_hour}/hr</p>
      )}
    </div>
  );
}
