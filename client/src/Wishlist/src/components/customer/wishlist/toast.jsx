import React, { useEffect, useState } from "react";
import styles from "../../../styles/Toast.module.css";

// Simple event-bus-based toast (no provider needed).
const listeners = new Set();
let counter = 0;

export const showToast = (toast) => {
  const id = ++counter;
  listeners.forEach((l) => l({ id, type: "success", duration: 4000, ...toast }));
  return id;
};

export const ToastHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, toast.duration);
      }
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className={styles.host} role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type] || ""}`}>
          <span className={styles.msg}>{t.message}</span>
          {t.actionLabel && (
            <button
              className={styles.action}
              onClick={() => { t.onAction?.(); dismiss(t.id); }}
            >
              {t.actionLabel}
            </button>
          )}
          <button className={styles.close} aria-label="Dismiss" onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
};
