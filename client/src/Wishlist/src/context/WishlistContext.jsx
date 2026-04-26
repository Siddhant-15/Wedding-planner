import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { wishlistService as wishlistApi, suggestNameForService } from "../../../utils/api/services/wishlist.service";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlists, setWishlists] = useState([]);
  const [items, setItems] = useState([]); // flat global cache
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------
  // INITIAL LOAD (OPTIMIZED)
  // ------------------------
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const lists = await wishlistApi.getAll();

      // flatten items from all wishlists
      const allItems = lists.flatMap((w) =>
        (w.items || []).map((item) => ({
          ...item,
          wishlist_id: w.id,
        }))
      );

      setWishlists(lists);
      setItems(allItems);

    } catch (e) {
      setError(e.message || "Failed to load wishlists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ------------------------
  // HELPERS
  // ------------------------
  const isSaved = useCallback(
    (serviceId) =>
      items.some((i) => String(i.service_id) === String(serviceId)),
    [items]
  );

  const getItemForService = useCallback(
    (serviceId) =>
      items.find((i) => String(i.service_id) === String(serviceId)) || null,
    [items]
  );

  // ------------------------
  // WISHLISTS
  // ------------------------
  const createWishlist = useCallback(async (payload) => {
    const w = await wishlistApi.create(payload);

    setWishlists((prev) => [...prev, w]); // ✅ no refresh

    return w;
  }, []);

  const renameWishlist = useCallback(
    async (id, name) => {
      await wishlistApi.update(id, { name });
      await refresh();
    },
    [refresh]
  );

  const deleteWishlist = useCallback(async (id) => {
    await wishlistApi.remove(id);

    setWishlists((prev) => prev.filter((w) => w.id !== id));
    setItems((prev) => prev.filter((i) => i.wishlist_id !== id));
  }, []);

  // ------------------------
  // ITEMS (OPTIMISTIC UI)
  // ------------------------
  const addItem = useCallback(async ({ wishlist_id, service }) => {
    const tempId = `tmp_${Date.now()}`;

    const temp = {
      id: tempId,
      wishlist_id,
      service_id: service.id,
      service,
      note: "",
      priority: 0,
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [...prev, temp]);

    try {
      const real = await wishlistApi.addItem({
        wishlist_id,
        service_id: service.id,
      });

      const normalized = {
        ...real,
        service,
      };

      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? normalized : i))
      );

      setWishlists((prev) =>
        prev.map((w) =>
          w.id === wishlist_id
            ? {
              ...w,
              item_count: (w.item_count || 0) + 1,
              cover_image: w.cover_image || service.image,
            }
            : w
        )
      );

      return normalized;
    } catch (e) {
      setItems((prev) => prev.filter((i) => i.id !== tempId));
      throw e;
    }
  }, []);

  const alreadyExists = useCallback(
    (serviceId, wishlistId) => {
      return items.some(
        (i) =>
          String(i.service_id) === String(serviceId) &&
          String(i.wishlist_id) === String(wishlistId)
      );
    },
    [items]
  );

  const removeItem = useCallback(async (itemId) => {
    console.log("Item id", itemId);
    let removedItem = null;
    let wishlistId = null;

    // ✅ Optimistic update (safe)
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        removedItem = item;
        wishlistId = item.wishlist_id;
      }
      return prev.filter((i) => i.id !== itemId);
    });

    // ✅ Update wishlist count optimistically
    if (wishlistId) {
      setWishlists((prev) =>
        prev.map((w) =>
          w.id === wishlistId
            ? {
              ...w,
              item_count: Math.max(0, (w.item_count || 1) - 1),
            }
            : w
        )
      );
    }

    try {
      await wishlistApi.removeItem(itemId);
      return removedItem;
    } catch (e) {
      // ❌ Rollback BOTH states
      if (removedItem) {
        setItems((prev) => [...prev, removedItem]);

        setWishlists((prev) =>
          prev.map((w) =>
            w.id === wishlistId
              ? {
                ...w,
                item_count: (w.item_count || 0) + 1,
              }
              : w
          )
        );
      }

      throw e;
    }
  }, []);

  const restoreItem = useCallback(
    async (item) => {
      if (!item) return;

      return addItem({
        wishlist_id: item.wishlist_id,
        service: item.service,
      });
    },
    [addItem]
  );

  const moveItem = useCallback(async (itemId, target_wishlist_id) => {
    const updated = await wishlistApi.moveItem(itemId, target_wishlist_id);

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, wishlist_id: target_wishlist_id } : i
      )
    );

    return updated;
  }, []);

  const updateItem = useCallback(async (itemId, patch) => {
    const updated = await wishlistApi.updateItem(itemId, patch);

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? updated : i))
    );

    return updated;
  }, []);

  // ------------------------
  // CONTEXT VALUE
  // ------------------------
  const value = useMemo(
    () => ({
      wishlists,
      items,
      loading,
      error,

      refresh,

      isSaved,
      getItemForService,

      createWishlist,
      renameWishlist,
      deleteWishlist,

      addItem,
      alreadyExists,
      removeItem,
      restoreItem,
      moveItem,
      updateItem,

      suggestNameForService,
    }),
    [
      wishlists,
      items,
      loading,
      error,
      refresh,
      isSaved,
      getItemForService,
      createWishlist,
      renameWishlist,
      deleteWishlist,
      addItem,
      alreadyExists,
      removeItem,
      restoreItem,
      moveItem,
      updateItem,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
};