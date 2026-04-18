// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from "../utils/api/services/wishlist.service";
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch on mount + after any mutation
  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await wishlistService.getAll();
      setItems(data);
    } catch (err) {
      if (isAuthenticated) {
        showError('Failed to load wishlist');
      }
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
      await fetchWishlist();  // refresh
      showSuccess('Added to wishlist');
    } catch {
      showError('Could not add to wishlist');
    }
  };

  const removeFromWishlist = async (serviceId) => {
    if (!isAuthenticated) return;
    try {
      await wishlistService.remove(serviceId);
      await fetchWishlist();
      showSuccess('Removed from wishlist');
    } catch {
      showError('Could not remove from wishlist');
    }
  };

  const isInWishlist = (serviceId) =>
    items.some((item) => item.service.id === serviceId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};