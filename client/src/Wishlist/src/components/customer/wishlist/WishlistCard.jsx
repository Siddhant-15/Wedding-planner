import React, { useRef, useState, useEffect, useMemo } from "react";
import styles from "../../../styles/WishlistCard.module.css";
import { useWishlist } from "../../../context/WishlistContext";

const formatRelative = (iso) => {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const WishlistCard = ({ wishlist, onOpen, onRename, onDelete, onShare }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ get global items
  const { items } = useWishlist();

  // ✅ derive count (memoized)
  const itemCount = useMemo(() => {
    return items.filter(i => String(i.wishlist_id) === String(wishlist.id)).length;
  }, [items, wishlist.id]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <article className={styles.card} onClick={() => onOpen?.(wishlist)}>
      <div
        className={styles.cover}
        style={{
          backgroundImage: wishlist.cover_image
            ? `url(${wishlist.cover_image})`
            : "none",
        }}
      >
        {!wishlist.cover_image && (
          <div className={styles.coverEmpty}>
            <svg viewBox="0 0 24 24" width="44" height="44">
              <path
                d="M12 21s-7.5-4.6-10-9.2C.4 8.6 2 5 5.5 5c2 0 3.5 1.1 4.5 2.6C11 6.1 12.5 5 14.5 5 18 5 19.6 8.6 22 11.8 19.5 16.4 12 21 12 21z"
                fill="currentColor"
              />
            </svg>
            <span>No items yet</span>
          </div>
        )}

        {wishlist.is_public && (
          <span className={styles.badge}>Public</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.name} title={wishlist.name}>
            {wishlist.name}
          </h3>

          <div
            className={styles.menuWrap}
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.menuBtn}
              aria-label="More actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              ⋯
            </button>

            {menuOpen && (
              <div className={styles.menu}>
                <button onClick={() => { setMenuOpen(false); onRename?.(wishlist); }}>
                  Rename
                </button>
                <button onClick={() => { setMenuOpen(false); onShare?.(wishlist); }}>
                  Share
                </button>
                <button
                  className={styles.menuDanger}
                  onClick={() => { setMenuOpen(false); onDelete?.(wishlist); }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.meta}>
          {/* ✅ REAL-TIME COUNT */}
          <span>
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>

          <span className={styles.dot}>•</span>

          <span>
            Updated {formatRelative(wishlist.updated_at)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;