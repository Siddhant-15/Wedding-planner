import React from "react";
import { Utensils, Users, Sparkles, CheckCircle2, XCircle, Leaf, Receipt } from "lucide-react";
import styles from "../styles/CateringSpecsCard.module.css";
import { titleCase } from "../../../utils/format";

const Pill = ({ children }) => <span className={styles.pill}>{children}</span>;

export default function CateringSpecsCard({ catering }) {
  if (!catering) return null;
  const yesNo = (b) => (b ? <CheckCircle2 size={16} className={styles.yes} /> : <XCircle size={16} className={styles.no} />);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Utensils size={22} className={styles.titleIcon} />
        Catering Specifications
      </h3>

      <div className={styles.grid}>
        <div className={styles.specItem}>
          <Users size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>
              {catering.min_order ?? "-"} – {catering.max_order ?? "-"}
            </p>
            <p className={styles.specLabel}>Order size (pax)</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <Receipt size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>{catering.gst_percentage ?? "-"}%</p>
            <p className={styles.specLabel}>GST</p>
          </div>
        </div>
        <div className={styles.specItem}>
          <Sparkles size={26} className={styles.specIcon} />
          <div>
            <p className={styles.specValue}>{catering.customizable_menu ? "Yes" : "No"}</p>
            <p className={styles.specLabel}>Customizable menu</p>
          </div>
        </div>
      </div>

      {!!catering.cuisine_types?.length && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Cuisines</h4>
          <div className={styles.pills}>
            {catering.cuisine_types.map((c) => <Pill key={c}>{titleCase(c)}</Pill>)}
          </div>
        </div>
      )}

      {!!catering.service_styles?.length && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Service styles</h4>
          <div className={styles.pills}>
            {catering.service_styles.map((s) => <Pill key={s}>{titleCase(s)}</Pill>)}
          </div>
        </div>
      )}

      {!!catering.special_diets_supported?.length && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <Leaf size={14} className={styles.inlineIcon} /> Dietary support
          </h4>
          <div className={styles.pills}>
            {catering.special_diets_supported.map((s) => <Pill key={s}>{s}</Pill>)}
          </div>
        </div>
      )}

      <div className={styles.includes}>
        <div className={styles.includeRow}><span>Service staff</span> {yesNo(catering.staff_included)}</div>
        <div className={styles.includeRow}><span>Crockery & cutlery</span> {yesNo(catering.crockery_cutlery_included)}</div>
        <div className={styles.includeRow}><span>Tasting available</span> {yesNo(catering.tasting_available)}</div>
        <div className={styles.includeRow}><span>Tax included</span> {yesNo(catering.price_includes_tax)}</div>
      </div>
    </div>
  );
}
