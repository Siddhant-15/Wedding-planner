import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import WishlistGrid from "../../../components/customer/wishlist/WishlistGrid";
import WishlistModal from "../../../components/customer/wishlist/WishlistModal";
import ConfirmDialog from "../../../components/customer/wishlist/ConfirmDialog";
import RenameDialog from "../../../components/customer/wishlist/RenameDialog";
import { showToast } from "../../../components/customer/wishlist/toast";
import styles from "./WishlistsPage.module.css";

const WishlistsPage = () => {
  const navigate = useNavigate();
  const { wishlists, loading, error, createWishlist, renameWishlist, deleteWishlist, refresh } = useWishlist();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleShare = (w) => {
    const url = `${window.location.origin}/wishlist/${w.id}`;
    if (navigator.share) {
      navigator.share({ title: w.name, url }).catch(() => { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast({ message: "Link copied to clipboard" });
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Wishlists</h1>
          <p className={styles.subtitle}>
            Organize, compare and plan your perfect event in collections.
          </p>
        </div>
        <button className={styles.createBtn} onClick={() => setCreateOpen(true)}>
          <span>+</span> New wishlist
        </button>
      </header>

      {error && (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button onClick={refresh}>Retry</button>
        </div>
      )}

      <WishlistGrid
        wishlists={wishlists}
        loading={loading}
        onOpen={(w) => navigate(`/customer/wishlist/${w.id}`)}
        onRename={(w) => setRenameTarget(w)}
        onDelete={(w) => setDeleteTarget(w)}
        onShare={handleShare}
        emptyMessage="Start your planning journey"
        emptyAction={
          <button className={styles.createBtn} onClick={() => setCreateOpen(true)}>
            <span>+</span> Create your first wishlist
          </button>
        }
      />

      {createOpen && (
        <WishlistModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onCreated={async (payload) => {
            const w = await createWishlist(payload);
            setCreateOpen(false);
            showToast({ message: `Created “${w.name}”` });
          }}
        />
      )}

      <RenameDialog
        open={!!renameTarget}
        initialName={renameTarget?.name || ""}
        onCancel={() => setRenameTarget(null)}
        onSave={async (name) => {
          await renameWishlist(renameTarget.id, name);
          setRenameTarget(null);
          showToast({ message: "Renamed" });
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete “${deleteTarget?.name}”?`}
        message="This will permanently remove the list and all its saved items."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteWishlist(deleteTarget.id);
          setDeleteTarget(null);
          showToast({ message: "Wishlist deleted" });
        }}
      />
    </div>
  );
};

export default WishlistsPage;
