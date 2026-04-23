import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useEscapeKey } from "../hooks/useNavbarBehavior";
import styles from "../styles/SearchBar.module.css";

const SUGGESTIONS = ["Banquet halls in Mumbai", "Wedding photographers", "Bridal makeup", "Catering Delhi", "DJs near me"];

/** Inline search bar (desktop). */
export function InlineSearch({ onSubmit }) {
  const [q, setQ] = useState("");
  return (
    <form
      className={styles.wrap}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(q);
      }}
      role="search"
    >
      <Search size={16} className={styles.icon} />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search venues, vendors, services…"
        className={styles.input}
        aria-label="Search"
      />
    </form>
  );
}

/** Fullscreen search overlay (mobile / triggered). */
export function SearchOverlay({ open, onClose, onSubmit }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEscapeKey(onClose, open);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const submit = (value) => {
    onSubmit?.(value);
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Search">
      <div className={styles.overlayInner}>
        <div className={styles.overlayBar}>
          <form
            style={{ flex: 1 }}
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
          >
            <input
              ref={inputRef}
              className={styles.overlayInput}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search venues, vendors, services…"
            />
          </form>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        <p className={styles.suggestionsTitle}>Popular searches</p>
        <div className={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className={styles.chip} onClick={() => submit(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
