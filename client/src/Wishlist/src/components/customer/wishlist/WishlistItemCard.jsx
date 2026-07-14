import React, { useEffect, useRef, useState } from "react";
import styles from "../../../styles/WishlistItemCard.module.css";

const PRIORITIES = [
  { value: "high", label: "High", color: "#dc2626" },
  { value: "medium", label: "Medium", color: "#d97706" },
  { value: "low", label: "Low", color: "#16a34a" },
];



const formatPrice = (n) => {
  if (n == null) return null;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  } catch { return `₹${n}`; }
};

const WishlistItemCard = ({
  item,
  otherWishlists = [],
  onView,
  onRemove,
  onMove,
  onUpdateNote,
  onUpdatePriority,
}) => {

  const { service } = item;
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState(item.note || "");
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false); setMoveOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const priority = PRIORITIES.find((p) => p.value === item.priority) || PRIORITIES[1];

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap} onClick={() => onView?.(service)}>
        {service.image ? (
          <img src={service.image} alt={service.name} loading="lazy" />
        ) : (
          <div className={styles.imageFallback}>No image</div>
        )}
        <span className={styles.priority} style={{ background: priority.color }}>
          {priority.label}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.headRow}>
          <h3 className={styles.name} onClick={() => onView?.(service)} title={service.name}>
            {service.name}
          </h3>
          <div className={styles.menuWrap} ref={wrapRef}>
            <button className={styles.menuBtn} aria-label="More" onClick={() => setMenuOpen((v) => !v)}>⋯</button>
            {menuOpen && !moveOpen && (
              <div className={styles.menu} role="menu">
                <button onClick={() => { setMenuOpen(false); setEditingNote(true); }}>
                  {item.note ? "Edit note" : "Add note"}
                </button>
                <div className={styles.menuLabel}>Priority</div>
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    className={item.priority === p.value ? styles.menuActive : ""}
                    onClick={() => { onUpdatePriority?.(item, p.value); setMenuOpen(false); }}
                  >
                    <span className={styles.dot} style={{ background: p.color }} />
                    {p.label}
                  </button>
                ))}
                {otherWishlists.length > 0 && (
                  <button onClick={() => setMoveOpen(true)}>Move to…</button>
                )}
                <div className={styles.divider} />
                <button className={styles.menuDanger} onClick={() => { setMenuOpen(false); onRemove?.(item); }}>
                  Remove
                </button>
              </div>
            )}
            {moveOpen && (
              <div className={styles.menu}>
                <div className={styles.menuLabel}>Move to</div>
                {otherWishlists.map((w) => (
                  <button key={w.id} onClick={() => { onMove?.(item, w.id); setMoveOpen(false); setMenuOpen(false); }}>
                    {w.name}
                  </button>
                ))}
                <div className={styles.divider} />
                <button onClick={() => setMoveOpen(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        {service.vendor_name && <p className={styles.vendor}>by {service.vendor_name}</p>}
        {service.location && (
          <p className={styles.location}>
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {service.location}
          </p>
        )}

        {service.priceLabel && service.priceLabel !== "N/A" && (
          <div className={styles.price}>
            <span className={styles.priceLabel}>Starting from</span>
            <strong>{service.priceLabel}</strong>
          </div>
        )}


        {(item.note || editingNote) && (
          <div className={styles.noteWrap}>
            {editingNote ? (
              <>
                <textarea
                  className={styles.noteInput}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a private note (e.g. 'Check Saturday availability')"
                  rows={2}
                  autoFocus
                  maxLength={200}
                />
                <div className={styles.noteActions}>
                  <button className={styles.btnGhost} onClick={() => { setNote(item.note || ""); setEditingNote(false); }}>Cancel</button>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => { onUpdateNote?.(item, note.trim()); setEditingNote(false); }}
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <p className={styles.note} onClick={() => setEditingNote(true)}>
                <span className={styles.noteIcon}>📝</span>
                {item.note}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default WishlistItemCard;
