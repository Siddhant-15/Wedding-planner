import React, { useState } from "react";
import { Package, Check, X } from "lucide-react";
import styles from "../styles/VariantsCard.module.css";
import { formatCurrency, titleCase } from "../../../utils/format";

const renderPricing = (v) => {
  const p = v.pricing || {};
  const parts = [];
  if (p.veg_price) parts.push({ label: "Veg", value: formatCurrency(p.veg_price, v.currency) });
  if (p.non_veg_price) parts.push({ label: "Non-veg", value: formatCurrency(p.non_veg_price, v.currency) });
  if (p.rental_price) parts.push({ label: "Rental", value: formatCurrency(p.rental_price, v.currency) });
  if (p.base_price) parts.push({ label: "Base", value: formatCurrency(p.base_price, v.currency) });
  if (p.price_with_video) parts.push({ label: "With video", value: formatCurrency(p.price_with_video, v.currency) });
  if (p.price && !parts.length) parts.push({ label: "Price", value: formatCurrency(p.price, v.currency) });
  return parts;
};

export default function VariantsCard({ variants = [] }) {
  const [active, setActive] = useState(
    Math.max(0, variants.findIndex((v) => v.is_default))
  );
  if (!variants.length) return null;
  const safeActive = Math.min(active, variants.length - 1);
  const current = variants[safeActive];
  const pricing = renderPricing(current);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Package size={22} className={styles.titleIcon} />
        Packages
      </h3>

      <div className={styles.tabs} role="tablist">
        {variants.map((v, i) => (
          <button
            key={v.id || i}
            role="tab"
            aria-selected={i === safeActive}
            className={`${styles.tab} ${i === safeActive ? styles.tabActive : ""}`}
            onClick={() => setActive(i)}
          >
            {v.variant_name || `Package ${i + 1}`}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {!!pricing.length && (
          <div className={styles.priceRow}>
            {pricing.map((p) => (
              <div key={p.label} className={styles.priceBlock}>
                <span className={styles.priceLabel}>{p.label}</span>
                <span className={styles.priceValue}>{p.value}</span>
              </div>
            ))}
            {current.pricing?.pricing_mode && (
              <span className={styles.modeBadge}>{titleCase(current.pricing.pricing_mode)}</span>
            )}
          </div>
        )}

        {current.description && <p className={styles.desc}>{current.description}</p>}

        {!!current.inclusions?.length && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>What's included</h4>
            <ul className={styles.list}>
              {current.inclusions.map((it, i) => (
                <li key={i}><Check size={14} className={styles.iconYes} /> {it}</li>
              ))}
            </ul>
          </div>
        )}

        {!!current.exclusions?.length && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Not included</h4>
            <ul className={styles.list}>
              {current.exclusions.map((it, i) => (
                <li key={i}><X size={14} className={styles.iconNo} /> {it}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
