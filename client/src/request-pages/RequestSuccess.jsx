import React from "react";
import {
  CheckCircle2,
  Clock3,
  Info,
  ArrowRight,
} from "lucide-react";

import styles from "./RequestSuccess.module.css";

const NEXT_STEPS = [
  {
    title: "Vendor will review your request",
    desc: "They may contact you directly if interested.",
  },
  {
    title: "Track updates in My Requests",
    desc: "You can monitor request status anytime.",
  },
  {
    title: "Direct discussion with vendor",
    desc: "Booking and pricing happen directly with them.",
  },
];

export default function RequestSuccess({
  vendorName = "Vendor",
  serviceType = "Service",
  onViewRequest = () => { },
}) {
  return (
    <div className={styles.wrapper}>
      {/* SUCCESS HEADER */}
      <div className={styles.successCard}>
        <div className={styles.iconWrap}>
          <CheckCircle2 size={42} strokeWidth={2} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>
            Request sent successfully
          </h2>

          <p className={styles.subtitle}>
            Your quote request has been shared with{" "}
            <span>{vendorName}</span>.
          </p>

          <div className={styles.meta}>
            <span className={styles.badge}>
              {serviceType}
            </span>

            <span className={styles.response}>
              <Clock3 size={14} />
              Usually responds within 24 hours
            </span>
          </div>
        </div>
      </div>

      {/* NEXT STEPS */}
      <div className={styles.stepsCard}>
        <h3 className={styles.sectionTitle}>
          What happens next
        </h3>

        <div className={styles.steps}>
          {NEXT_STEPS.map((step) => (
            <div
              key={step.title}
              className={styles.step}
            >
              <div className={styles.stepDot} />

              <div>
                <p className={styles.stepTitle}>
                  {step.title}
                </p>

                <p className={styles.stepDesc}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTION */}
      <button
        type="button"
        className={styles.primaryBtn}
        onClick={onViewRequest}
      >
        View My Requests
        <ArrowRight size={16} />
      </button>

      {/* INFO */}
      <div className={styles.infoCard}>
        <Info size={16} />

        <p>
          This is a lead request — final pricing and
          booking happen directly with the vendor.
        </p>
      </div>
    </div>
  );
}