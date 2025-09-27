import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Star, MapPin } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { showSuccess, showInfo } from "../utils/toast"
import styles from "../styles/Wishlist.module.css"

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      vendorName: item.vendorName,
      serviceType: item.serviceType,
    });

    showSuccess(`${item.name} has been added to your cart.`, "Added to cart");
  };

  const handleRemoveFromWishlist = (id, name) => {
    removeFromWishlist(id);
    showSuccess(`${name} has been removed from your wishlist.`, "Removed from wishlist");
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <Heart size={28} />
            My Wishlist
          </h1>
        </div>

        <div className={styles.empty}>
          <Heart size={64} className={styles.emptyIcon} />
          <h2>Your wishlist is empty</h2>
          <p>Add services you love to keep track of them</p>
          <Link to="/" className={styles.shopButton}>
            Explore Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Heart size={28} />
          My Wishlist ({items.length} items)
        </h1>

        {items.length > 0 && (
          <button
            className={styles.clearAll}
            onClick={() => {
              clearWishlist();
              showInfo("All items have been removed from your wishlist.", "Wishlist cleared");
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Link to={`/service/${item.id}`}>
                <img src={item.image} alt={item.name} className={styles.image} />
              </Link>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                aria-label="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className={styles.content}>
              <Link to={`/service/${item.id}`} className={styles.nameLink}>
                <h3 className={styles.name}>{item.name}</h3>
              </Link>

              <p className={styles.vendor}>by {item.vendorName}</p>

              <div className={styles.meta}>
                {item.rating && (
                  <div className={styles.rating}>
                    <Star size={14} fill="currentColor" />
                    <span>{item.rating}</span>
                  </div>
                )}

                {item.city && item.state && (
                  <div className={styles.location}>
                    <MapPin size={14} />
                    <span>
                      {item.city}, {item.state}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.price}>
                ₹{(item.price / 100000).toFixed(1)}L
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.cartButton}
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                <Link to={`/service/${item.id}`} className={styles.viewButton}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
