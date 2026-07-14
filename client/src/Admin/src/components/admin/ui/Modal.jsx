import { useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({
  isOpen,
  open,           // Support both isOpen and open for flexibility
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  const isModalOpen = isOpen !== undefined ? isOpen : open;

  useEffect(() => {
    if (!isModalOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={`${styles.dialog} ${styles[size] || ""}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}