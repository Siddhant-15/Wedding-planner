import React, { useState } from "react";
import { useWishlist } from "../../../context/WishlistContext";
import WishlistModal from "./WishlistModal";
import { showToast } from "./toast";
import styles from "../../../styles/WishlistButton.module.css";

/**
 * Heart button for service cards.
 * Props:
 *  - service: { id, name, image, location, price, vendor_name, service_type }
 *  - size: "sm" | "md" | "lg"
 *  - variant: "floating" | "inline"
 */
const WishlistButton = ({ service, size = "md", variant = "floating" }) => {
  const {
    wishlists,
    isSaved,
    getItemForService,
    addItem,
    removeItem,
    restoreItem,
    alreadyExists,
    suggestNameForService,
  } = useWishlist();

  const [open, setOpen] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const saved = isSaved(service.id);

  const triggerBounce = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 350);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerBounce();

    if (saved) {
      const item = getItemForService(service.id);
      try {
        const removed = await removeItem(item.id);
        showToast({
          message: "Removed from wishlist",
          actionLabel: "Undo",
          onAction: () => restoreItem(removed),
        });
      } catch {
        showToast({ message: "Couldn't remove. Try again.", type: "error" });
      }
      return;
    }

    // Not saved yet — branch on wishlist count
    if (wishlists.length === 0) {
      setOpen("create-first");
      return;
    }
    if (wishlists.length === 1) {
      try {
        if (alreadyExists(service.id, wishlists[0].id)) {
          showToast({ message: "Already in this wishlist" });
          return;
        }
        await addItem({
          wishlist_id: wishlists[0].id,
          service,
        });
        showToast({
          message: `Saved to ${wishlists[0].name} ✅`,
          actionLabel: "View",
          onAction: () => (window.location.href = `/wishlist/${wishlists[0].id}`),
        });
      } catch (err) {
        console.error("Failed to add item to wishlist", err);
        showToast({ message: "Couldn't save. Try again.", type: "error" });
      }
      return;
    }
    setOpen("pick");
  };

  return (
    <>
      <button
        type="button"
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        onClick={handleClick}
        className={[
          styles.btn,
          styles[size],
          styles[variant],
          saved ? styles.saved : "",
          bouncing ? styles.bounce : "",
        ].join(" ")}
      >
        <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
          <path
            d="M12 21s-7.5-4.6-10-9.2C.4 8.6 2 5 5.5 5c2 0 3.5 1.1 4.5 2.6C11 6.1 12.5 5 14.5 5 18 5 19.6 8.6 22 11.8 19.5 16.4 12 21 12 21z"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <WishlistModal
          mode={open}
          service={service}
          suggestedName={suggestNameForService(service)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default WishlistButton;
