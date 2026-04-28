import React from "react";
import { Send, Eye, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import styles from "./LeadStatus.module.css";

const STEPS = [
  { id: "sent", label: "Request sent", hint: "Your details were delivered", Icon: Send },
  { id: "seen", label: "Seen by vendor", hint: "Vendor opened your request", Icon: Eye },
  { id: "responded", label: "Vendor responded", hint: "Reply waiting in inbox", Icon: MessageCircle },
];

const ORDER = { sent: 0, seen: 1, responded: 2 };

export default function LeadStatus({
  status = "sent",
  fallback = false,
  vendorName = "the vendor",
}) {
  const activeIdx = ORDER[status] ?? 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h3 className={styles.title}>Request status</h3>
          <span className={styles.badge}>
            <span className={styles.dot} /> Live
          </span>
        </header>

        <ol className={styles.steps}>
          {STEPS.map((step, idx) => {
            const state =
              idx < activeIdx ? "done" : idx === activeIdx ? "active" : "todo";
            const Icon = step.Icon;
            return (
              <li key={step.id} className={`${styles.step} ${styles[state]}`}>
                <span className={styles.iconWrap}>
                  {state === "active" ? (
                    <Loader2 size={16} className={styles.spin} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>
                <div className={styles.stepText}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  <span className={styles.stepHint}>{step.hint}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <span className={styles.connector} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {fallback && (
        <div className={styles.fallback} role="status" aria-live="polite">
          <span className={styles.fallbackIcon}>
            <AlertCircle size={18} />
          </span>
          <div>
            <strong className={styles.fallbackTitle}>
              Still waiting on {vendorName}
            </strong>
            <p className={styles.fallbackText}>
              We’re connecting you with more vendors that match your event.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
