import React from "react";
import { Info } from "lucide-react";
import styles from "../styles/GenericSpecsCard.module.css";
import { titleCase } from "../../../utils/format";

const isPrimitive = (v) => v == null || ["string", "number", "boolean"].includes(typeof v);

export default function GenericSpecsCard({ title, data, icon: Icon = Info }) {
  if (!data) return null;
  const entries = Object.entries(data).filter(
    ([k]) => !["id", "service_id", "created_at", "updated_at", "is_active"].includes(k)
  );
  if (!entries.length) return null;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Icon size={22} className={styles.titleIcon} /> {title}
      </h3>
      <dl className={styles.list}>
        {entries.map(([key, value]) => {
          let display;
          if (isPrimitive(value)) {
            display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "-");
          } else if (Array.isArray(value)) {
            if (!value.length) return null;
            display = value.map((v) => (isPrimitive(v) ? titleCase(String(v)) : JSON.stringify(v))).join(", ");
          } else {
            return null;
          }
          return (
            <div key={key} className={styles.row}>
              <dt className={styles.key}>{titleCase(key)}</dt>
              <dd className={styles.val}>{display}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
