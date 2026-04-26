import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import WishlistItemCard from "../../../components/customer/wishlist/WishlistItemCard";
import ConfirmDialog from "../../../components/customer/wishlist/ConfirmDialog";
import RenameDialog from "../../../components/customer/wishlist/RenameDialog";
import { showToast } from "../../../components/customer/wishlist/toast";
import { wishlistService } from "../../../../../utils/api/services/wishlist.service";
import styles from "./WishlistDetailPage.module.css";

const WishlistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    wishlists,
    items: allItems,
    refresh,
    removeItem,
    restoreItem,
    moveItem,
    updateItem,
    renameWishlist,
    deleteWishlist,
  } = useWishlist();

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all|high|medium|low

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await wishlistService.getDetail(id);
      setList(data);
    } catch (e) {
      setError(e.message || "Wishlist not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  // Re-sync when global items cache changes (after add/remove/move)
  useEffect(() => {
    if (!list) return;
    const items =
      filter === "all"
        ? list.items
        : list.items.filter((i) => i.priority === filter);
    setList((prev) => prev && { ...prev, items });
  }, [allItems, id]); // eslint-disable-line

  const otherWishlists = wishlists.filter((w) => w.id !== id);

  const formatPrice = (pricing) => {
    if (!pricing) return "N/A";

    if (pricing.veg_price || pricing.non_veg_price) {
      return `₹${pricing.veg_price ?? "-"} veg | ₹${pricing.non_veg_price ?? "-"} non-veg`;
    }

    if (pricing.rental_price) {
      return `₹${pricing.rental_price}`;
    }

    if (pricing.price) {
      return `₹${pricing.price}`;
    }

    return "N/A";
  };

  const handleRemove = async (item) => {
    try {
      const removed = await removeItem(item.id);
      showToast({
        message: "Removed",
        actionLabel: "Undo",
        onAction: () => restoreItem(removed),
      });
    } catch {
      showToast({ message: "Couldn't remove", type: "error" });
    }
  };

  const handleMove = async (item, targetId) => {
    try {
      await moveItem(item.id, targetId);
      const target = wishlists.find((w) => w.id === targetId);
      showToast({ message: `Moved to ${target?.name || "wishlist"}` });
    } catch {
      showToast({ message: "Couldn't move", type: "error" });
    }
  };

  const handlePriority = async (item, priority) => {
    try { await updateItem(item.id, { priority }); }
    catch { showToast({ message: "Update failed", type: "error" }); }
  };

  const handleNote = async (item, note) => {
    try {
      await updateItem(item.id, { note });
      showToast({ message: note ? "Note saved" : "Note cleared" });
    } catch { showToast({ message: "Update failed", type: "error" }); }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skItem} />)}
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>Couldn't load this wishlist</h2>
          <p>{error || "The list might have been removed."}</p>
          <button onClick={() => navigate("/customer/wishlist")}>Back to my wishlists</button>
        </div>
      </div>
    );
  }

  const items = filter === "all" ? list.items : list.items.filter((i) => i.priority === filter);

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate("/customer/wishlist")}>← All wishlists</button>

      <header className={styles.header}>
        <div className={styles.headLeft}>
          <h1 className={styles.title}>{list.name}</h1>
          {list.description && <p className={styles.desc}>{list.description}</p>}
          <div className={styles.metaRow}>
            <span>{list.items?.length || 0} item{list.items?.length === 1 ? "" : "s"}</span>
            {list.is_public && <span className={styles.badge}>Public</span>}
          </div>
        </div>
        <div className={styles.headActions}>
          <button className={styles.btnGhost} onClick={() => setRenameOpen(true)}>Rename</button>
          <button className={styles.btnDanger} onClick={() => setDeleteOpen(true)}>Delete</button>
        </div>
      </header>

      {list.items?.length > 0 && (
        <div className={styles.filters}>
          {[
            { v: "all", label: "All" },
            { v: "high", label: "High priority" },
            { v: "medium", label: "Medium" },
            { v: "low", label: "Low" },
          ].map((f) => (
            <button
              key={f.v}
              className={`${styles.chip} ${filter === f.v ? styles.chipActive : ""}`}
              onClick={() => setFilter(f.v)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {items?.length === 0 ? (
        <div className={styles.empty}>
          {list.items?.length === 0 ? (
            <>
              <h3>No items saved yet</h3>
              <p>Browse services and tap the heart to add them here.</p>
              <button onClick={() => navigate("/services")}>Explore services</button>
            </>
          ) : (
            <>
              <h3>No items match this filter</h3>
              <p>Try a different priority filter or save more items.</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={{
                ...item,
                service: {
                  ...item.service,
                  priceLabel: formatPrice(item.service.pricing),
                },
              }}
              otherWishlists={otherWishlists}
              onView={(s) => navigate(`/customer/service/${s.id}`)}
              onRemove={handleRemove}
              onMove={handleMove}
              onUpdateNote={handleNote}
              onUpdatePriority={handlePriority}
            />
          ))}
        </div>
      )}

      <RenameDialog
        open={renameOpen}
        initialName={list.name}
        onCancel={() => setRenameOpen(false)}
        onSave={async (name) => {
          await renameWishlist(list.id, name);
          setList((prev) => ({ ...prev, name }));
          setRenameOpen(false);
          showToast({ message: "Renamed" });
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete “${list.name}”?`}
        message="This will permanently remove the list and all its saved items."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteWishlist(list.id);
          showToast({ message: "Wishlist deleted" });
          navigate("/customer/wishlist");
        }}
      />
    </div>
  );
};

export default WishlistDetailPage;
