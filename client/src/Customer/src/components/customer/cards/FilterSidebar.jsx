import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "../styles/FilterSidebar.module.css";
import { titleCase } from "../../../utils/format";

const SERVICE_TYPES = ["venue", "catering", "photography", "dj", "makeup_artist", "event_management"];

export default function FilterSidebar({
  filters,
  onChange,
  cities = [],
  onReset,
  lockServiceType = false, // 👈 NEW PROP
}) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <SlidersHorizontal size={16} /> Filters
        </h3>
        <button onClick={onReset} className={styles.resetBtn}>
          <X size={14} /> Reset
        </button>
      </div>

      {/* 🔍 Search */}
      <div className={styles.section}>
        <label className={styles.label}>Search</label>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search by name, area…"
            className={styles.input}
          />
        </div>
      </div>

      {/* 🏷 Service Type */}
      {!lockServiceType ? (
        <div className={styles.section}>
          <label className={styles.label}>Service type</label>
          <div className={styles.chipRow}>
            <button
              className={`${styles.chip} ${!filters.serviceType ? styles.chipActive : ""}`}
              onClick={() => update({ serviceType: "" })}
            >
              All
            </button>
            {SERVICE_TYPES.map((t) => (
              <button
                key={t}
                className={`${styles.chip} ${filters.serviceType === t ? styles.chipActive : ""}`}
                onClick={() => update({ serviceType: t })}
              >
                {titleCase(t)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // 👇 Show locked value instead
        <div className={styles.section}>
          <label className={styles.label}>Service type</label>
          <div className={styles.lockedValue}>
            {titleCase(filters.serviceType)}
          </div>
        </div>
      )}

      {/* 📍 City */}
      {cities.length > 0 && (
        <div className={styles.section}>
          <label className={styles.label}>City</label>
          <select
            value={filters.city || ""}
            onChange={(e) => update({ city: e.target.value })}
            className={styles.select}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 💰 Price */}
      <div className={styles.section}>
        <label className={styles.label}>Max starting price (₹)</label>
        <input
          type="number"
          min="0"
          step="1000"
          value={filters.maxPrice || ""}
          onChange={(e) => update({ maxPrice: e.target.value })}
          placeholder="No limit"
          className={styles.input}
        />
      </div>

      {/* ✅ Verified */}
      <div className={styles.section}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={!!filters.verifiedOnly}
            onChange={(e) => update({ verifiedOnly: e.target.checked })}
          />
          <span>Verified vendors only</span>
        </label>
      </div>
    </aside>
  );
}