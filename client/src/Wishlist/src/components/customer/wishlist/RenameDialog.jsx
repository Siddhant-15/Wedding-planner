import React, { useEffect, useState } from "react";
import styles from "../../../styles/ConfirmDialog.module.css";

const RenameDialog = ({ open, initialName = "", onCancel, onSave }) => {
  const [name, setName] = useState(initialName);
  useEffect(() => { setName(initialName); }, [initialName, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Rename wishlist</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          style={{
            width: "100%", padding: "11px 12px", border: "1px solid #e2e8f0",
            borderRadius: "10px", fontSize: "14px", marginBottom: "16px",
            outline: "none", color: "#0f172a", fontFamily: "inherit",
          }}
        />
        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={onCancel}>Cancel</button>
          <button
            className={styles.btnPrimary}
            disabled={!name.trim() || name.trim() === initialName}
            onClick={() => onSave?.(name.trim())}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameDialog;
