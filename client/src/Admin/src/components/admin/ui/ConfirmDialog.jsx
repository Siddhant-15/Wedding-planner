import Modal from "./Modal";
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({ open, title, message, confirmText="Confirm", cancelText="Cancel", tone="danger", onConfirm, onClose }) {
  return (
    <Modal
      open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className={styles.cancel} onClick={onClose}>{cancelText}</button>
          <button className={`${styles.confirm} ${styles[tone]}`} onClick={onConfirm}>{confirmText}</button>
        </>
      }
    >
      <p className={styles.msg}>{message}</p>
    </Modal>
  );
}
