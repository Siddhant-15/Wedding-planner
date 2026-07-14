import React, { useEffect, useState, useMemo } from "react";
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
    removeItem,
    restoreItem,
    moveItem,
    updateItem,
    renameWishlist,
    deleteWishlist,
  } = useWishlist();

  const [listMeta, setListMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all|high|medium|low
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);

  const contextItems = items;
  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.priority === filter);
  }, [items, filter]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await wishlistService.getDetail(id);

      setWishlist(data);
      setListMeta({
        id: data.id,
        name: data.name,
        description: data.description,
        is_public: data.is_public,
      });

      // 🔥 IMPORTANT: normalize items from API
      setItems(
        (data.items || []).map((item) => {
          const pricing = item.service?.pricing;

          return {
            ...item,
            service: item.service
              ? {
                id: item.service.id,
                name: item.service.name,
                service_type: item.service.service_type,
                image: item.service.image,
                location: item.service.location,
                pricing: pricing ?? null,
                priceLabel: formatPrice(pricing), // ✅ single source of truth
              }
              : null,
          };
        })
      );
    } catch (e) {
      setError(e.message || "Wishlist not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

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
      setItems((prev) => prev.filter((i) => i.id !== item.id)); // instant UI update

      const removed = await removeItem(item.id);

      showToast({
        message: "Removed",
        actionLabel: "Undo",
        onAction: async () => {
          await restoreItem(removed);
          load(); // refresh from API
        },
      });
    } catch {
      showToast({ message: "Couldn't remove", type: "error" });
      load(); // rollback
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

  const handlePriority = async (item, newPriority) => {
    const oldPriority = item.priority;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, priority: newPriority } : i
      )
    );

    try {
      await updateItem(item.id, { priority: newPriority });
    } catch {
      showToast({ message: "Update failed", type: "error" });

      // rollback
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, priority: oldPriority } : i
        )
      );
    }
  };

  const handleNote = async (item, note) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, note } : i
      )
    );

    try {
      await updateItem(item.id, { note });
      showToast({ message: note ? "Note saved" : "Note cleared" });
    } catch {
      showToast({ message: "Update failed", type: "error" });

      // rollback
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, note: item.note } : i
        )
      );
    }
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

  if (error || !listMeta) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>Couldn't load this wishlist</h2>
          <p>{error || "The list might have been removed."}</p>
          <button onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/customer/wishlist");
            }
          }}>Back to my wishlists</button>
        </div>
      </div>
    );
  }


  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/customer/wishlist");
        }
      }}>← All wishlists</button>

      <header className={styles.header}>
        <div className={styles.headLeft}>
          <h1 className={styles.title}>{listMeta?.name}</h1>
          {listMeta?.description && <p className={styles.desc}>{listMeta?.description}</p>}
          <div className={styles.metaRow}>
            <span>{contextItems.length || 0} item{contextItems.length === 1 ? "" : "s"}</span>
            {listMeta?.is_public && <span className={styles.badge}>Public</span>}
          </div>
        </div>
        <div className={styles.headActions}>
          <button className={styles.btnGhost} onClick={() => setRenameOpen(true)}>Rename</button>
          <button className={styles.btnDanger} onClick={() => setDeleteOpen(true)}>Delete</button>
        </div>
      </header>

      {contextItems.length > 0 && (
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
          {contextItems.length === 0 ? (
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
          {filteredItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={{
                ...item,
                service: item.service,
              }}
              otherWishlists={otherWishlists}
              onView={(s) => navigate(`/customer/services/${s.service_type}/${s.id}`)}
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
        initialName={listMeta?.name}
        onCancel={() => setRenameOpen(false)}
        onSave={async (name) => {
          await renameWishlist(listMeta.id, name);

          setListMeta((prev) => ({
            ...prev,
            name,
          }));
          setRenameOpen(false);
          showToast({ message: "Renamed" });
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete “${listMeta?.name}”?`}
        message="This will permanently remove the list and all its saved items."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteWishlist(listMeta.id);
          showToast({ message: "Wishlist deleted" });
          navigate("/customer/wishlist");
        }}
      />
    </div>
  );
};

export default WishlistDetailPage;
