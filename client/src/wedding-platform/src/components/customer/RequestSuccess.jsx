import React from "react";
import { CheckCircle2, Phone, Clock3, ShieldCheck, Info, ArrowRight, ArrowLeft } from "lucide-react";
import styles from "./RequestSuccess.module.css";

const RequestSuccess = ({ onViewRequest, onBack }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <div className={styles.iconRing}></div>
          <CheckCircle2 size={56} className={styles.icon} />
        </div>
        <h1 className={styles.title}>Request Sent Successfully</h1>
        <p className={styles.subtitle}>Your request has been shared with the vendor.</p>

        <div className={styles.steps}>
          <h3 className={styles.stepsTitle}>What Happens Next</h3>
          <ul className={styles.stepList}>
            <li><span className={styles.stepIcon}><Phone size={18} /></span>
              <div><strong>Vendor may contact you directly</strong>
              <p>Expect a call or message based on your provided details.</p></div></li>
            <li><span className={styles.stepIcon}><Clock3 size={18} /></span>
              <div><strong>Track request updates anytime</strong>
              <p>View the status from "My Requests" in your dashboard.</p></div></li>
            <li><span className={styles.stepIcon}><ShieldCheck size={18} /></span>
              <div><strong>Final booking happens offline</strong>
              <p>Pricing and confirmation are handled directly with the vendor.</p></div></li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button className={styles.primary} onClick={onViewRequest}>
            View My Request <ArrowRight size={16} />
          </button>
          <button className={styles.secondary} onClick={onBack}>
            <ArrowLeft size={16} /> Back To Vendor
          </button>
        </div>

        <div className={styles.info}>
          <Info size={16} />
          <p>This platform helps connect customers with vendors. Final pricing and booking happen directly with the vendor.</p>
        </div>
      </div>
    </div>
  );
};

export default RequestSuccess;
