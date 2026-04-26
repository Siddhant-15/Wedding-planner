import React, { useEffect, useMemo, useState } from "react";
import { useWishlist } from "../../../context/WishlistContext";
import styles from "../../../styles/WishlistModal.module.css";
import { createPortal } from "react-dom";
import { showToast } from "./toast";

/**
 * mode:
 *  - "create-first": user has no wishlists, force-create first one
 *  - "pick": user has multiple wishlists, pick one or create new
 *  - "create": standalone create modal (used from /wishlist page)
 */
const WishlistModal = ({ mode, service, suggestedName, onClose }) => {
  console.log("mode", mode);
  const { wishlists, items, createWishlist, addItem } = useWishlist();
  const [name, setName] = useState(suggestedName || "");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showCreate, setShowCreate] = useState(mode === "create-first" || mode === "create");
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-select wishlist if service is already in one
  useEffect(() => {
    if (mode === "pick" && service) {
      const existing = items.find(
        (i) => (i.service?.id || i.service_id) === service.id
      );

      if (existing) {
        setSelectedId(existing.wishlist_id);
      }
    }
  }, [mode, service, items]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const title = useMemo(() => {
    if (mode === "create-first") return "Create your first wishlist";
    if (mode === "create") return "Create a new wishlist";
    return "Save to wishlist";
  }, [mode]);

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      let targetId = selectedId;

      // 1. Create wishlist
      if (showCreate) {
        console.log("Show Create is : ", showCreate);
        if (!name.trim()) {
          setSubmitting(false);
          return;
        }

        const created = await createWishlist({
          name: name.trim(),
          description,
          is_public: isPublic,
        });

        if (!created?.id) {
          throw new Error("Wishlist creation failed");
        }

        targetId = created.id;
      }

      // 2. Add item
      if (service?.id && targetId) {
        await addItem({
          wishlist_id: targetId,
          service,
        });
      }

      showToast({
        message: "Saved to wishlist ✅",
      });

      onClose?.();

    } catch (err) {
      console.error(err);
      showToast({
        message: "Something went wrong",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        </div>

        {!showCreate && mode === "pick" && (
          <>
            <p className={styles.subtitle}>Pick a list to save this to</p>
            <ul className={styles.list}>
              {wishlists.map((w) => (
                <li key={w.id}>
                  <label className={`${styles.row} ${selectedId === w.id ? styles.rowActive : ""}`}>
                    <span className={styles.cover} style={{ backgroundImage: w.cover_image ? `url(${w.cover_image})` : "none" }}>
                      {!w.cover_image && <span className={styles.coverFallback}>♡</span>}
                    </span>
                    <span className={styles.rowMain}>
                      <span className={styles.rowName}>{w.name}</span>
                      <span className={styles.rowMeta}>{w.item_count || 0} item{(w.item_count || 0) === 1 ? "" : "s"}</span>
                    </span>
                    <input
                      type="radio"
                      name="wishlist"
                      checked={selectedId === w.id}
                      onChange={() => setSelectedId(w.id)}
                      className={styles.radio}
                    />
                  </label>
                </li>
              ))}
            </ul>
            <button className={styles.createNew} onClick={() => setShowCreate(true)}>
              <span aria-hidden>+</span> Create new list
            </button>
          </>
        )}

        {showCreate && (
          <div className={styles.form}>
            <label className={styles.label}>
              Wishlist name
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding Venues"
                autoFocus
                maxLength={60}
              />
            </label>
            {mode === "create" && (
              <>
                <label className={styles.label}>
                  Description <span className={styles.optional}>(optional)</span>
                  <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this list for?"
                    rows={3}
                    maxLength={240}
                  />
                </label>
                <label className={styles.toggleRow}>
                  <span>
                    <strong>{isPublic ? "Public" : "Private"}</strong>
                    <small>{isPublic ? "Anyone with the link can view" : "Only you can see this list"}</small>
                  </span>
                  <button
                    type="button"
                    className={`${styles.toggle} ${isPublic ? styles.toggleOn : ""}`}
                    onClick={() => setIsPublic((v) => !v)}
                    aria-pressed={isPublic}
                  >
                    <span className={styles.toggleDot} />
                  </button>
                </label>
              </>
            )}
            {mode === "pick" && (
              <button className={styles.linkBack} onClick={() => setShowCreate(false)} type="button">
                ← Back to my lists
              </button>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={submitting || (showCreate ? !name.trim() : !selectedId)}
          >
            {submitting ? "Saving…" : showCreate ? "Create & Save" : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WishlistModal;
