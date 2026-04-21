// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from "../utils/api/services/wishlist.service";
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);        // Always start as empty array
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);        // Important: reset when not logged in
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await wishlistService.getAll();
      // Safeguard: ensure we always get an array
      const wishlistItems = Array.isArray(response?.data) ? response.data : [];
      setItems(wishlistItems);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      if (isAuthenticated) {
        showError('Failed to load wishlist');
      }
      setItems([]);   // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (serviceId) => {
    if (!isAuthenticated) return;

    try {
      await wishlistService.add(serviceId);
      await fetchWishlist();   // Refresh list after mutation
      showSuccess('Added to wishlist');
    } catch (err) {
      console.error(err);
      showError('Could not add to wishlist');
    }
  };

  const removeFromWishlist = async (serviceId) => {
    if (!isAuthenticated) return;

    try {
      await wishlistService.remove(serviceId);
      await fetchWishlist();
      showSuccess('Removed from wishlist');
    } catch (err) {
      console.error(err);
      showError('Could not remove from wishlist');
    }
  };

  // ✅ Safely check if item is in wishlist
  const isInWishlist = (serviceId) => {
    if (!serviceId || !Array.isArray(items)) return false;
    return items.some((item) => item?.service?.id === serviceId);
  };

  const value = {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};