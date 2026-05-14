import React from "react";
import { X, Crown, Check, ShieldCheck, Sparkles } from "lucide-react";
import styles from "../../styles/SubscriptionModal.module.css";
import { subscriptionPlans } from "../../../../wedding-platform/src/data/mockData";

const SubscriptionModal = ({ open, onClose, usage = { used: 3, total: 3 } }) => {
  if (!open) return null;
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close"><X size={20} /></button>
        <div className={styles.header}>
          <div className={styles.crown}><Crown size={26} /></div>
          <h2>Unlock More Customer Leads</h2>
          <p>Upgrade your plan to connect with more customers.</p>
          <div className={styles.usage}>
            <span><Sparkles size={14} /> {usage.used} / {usage.total} free unlocks used today</span>
            <div className={styles.usageBar}>
              <div style={{ width: `${(usage.used / usage.total) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.plans}>
          {subscriptionPlans.map((p) => (
            <div key={p.id} className={`${styles.plan} ${p.recommended ? styles.recommended : ""}`}>
              {p.recommended && <span className={styles.badge}>RECOMMENDED</span>}
              <h3>{p.name}</h3>
              <div className={styles.price}>
                {p.price === 0 ? "Free" : <>₹{p.price}<small>/mo</small></>}
              </div>
              <ul className={styles.features}>
                {p.features.map((f) => (
                  <li key={f}><Check size={14} /> {f}</li>
                ))}
              </ul>
              <button className={p.recommended ? styles.primary : styles.secondary}>{p.cta}</button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <ShieldCheck size={16} /> Secure payment. Cancel anytime.
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
