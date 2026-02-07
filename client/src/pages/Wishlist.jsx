// src/pages/Wishlist.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  MapPin,
  AlertCircle,
} from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { showSuccess } from "@/utils/toast";
import styles from "@/styles/Wishlist.module.css";
import Navbar from "@/components/Navbar";

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, loading, removeFromWishlist, addToWishlist } = useWishlist();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/wishlist" } });
    }
  }, [isAuthenticated, navigate]);


  const handleRemove = async (serviceId, serviceName) => {
    try {
      await removeFromWishlist(serviceId);
      showSuccess(`${serviceName} removed from wishlist`);
    } catch (err) {
      // Error already handled in context
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm("Clear all items from your wishlist?")) {
      try {
        // You can add a clearAll method in context if needed
        await Promise.all(items.map(item => removeFromWishlist(item.service.id)));
        showSuccess("Wishlist cleared");
      } catch {}
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loading}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Heart size={28} /> My Wishlist
          </h1>
        </div>

        <div className={styles.empty}>
          <Heart size={80} className={styles.emptyIcon} />
          <h2>Your wishlist is empty</h2>
          <p>Add services you love to keep track of them</p>
          <Link to="/" className={styles.shopButton}>
            Explore Services
          </Link>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Heart size={28} /> My Wishlist ({items.length} items)
        </h1>
        {items.length > 0 && (
          <button className={styles.clearAll} onClick={handleClearWishlist}>
            Clear All
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {items.map((wishlistItem) => {
          const service = wishlistItem.service;
          const serviceId = service.id;
          const serviceName = service.name || service.title;

          return (
            <div key={wishlistItem.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Link to={`/service/${serviceId}`}>
                  <img
                    src={service.images?.[0] || "/placeholder.jpg"}
                    alt={serviceName}
                    className={styles.image}
                  />
                </Link>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(serviceId, serviceName)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.content}>
                <Link to={`/service/${serviceId}`} className={styles.nameLink}>
                  <h3 className={styles.name}>{serviceName}</h3>
                </Link>

                <div className={styles.meta}>
                  {service.rating && (
                    <div className={styles.rating}>
                      <Star size={14} fill="currentColor" />
                      <span>{service.rating}</span>
                    </div>
                  )}
                  {service.city && service.state && (
                    <div className={styles.location}>
                      <MapPin size={14} />
                      <span>{service.city}, {service.state}</span>
                    </div>
                  )}
                </div>

                <div className={styles.price}>
                  {service.price
                    ? `₹${(service.price / 100000).toFixed(1)}L onwards`
                    : "Price on request"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}