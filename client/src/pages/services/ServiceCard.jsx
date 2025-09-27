import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Star, Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { 
  showSuccess, 
  showError, 
  showInfo 
} from '../../utils/toast'
import styles from "../../styles/ServicePage.module.css";

const ServiceCard = ({ service, showCapacity = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const inWishlist = isInWishlist(service.id);

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === service.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? service.images.length - 1 : prev - 1
    );
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showInfo("Please log in to use wishlist", "Login Required");
      return;
    }

    if (inWishlist) {
      removeFromWishlist(service.id);
      showSuccess(`${service.name} has been removed from your wishlist.`, "Removed from wishlist");
    } else {
      addToWishlist({
        id: service.id,
        name: service.name,
        price: service.price,
        image: service.images[0] || "/placeholder.svg",
        vendorName: service.vendor_name,
        serviceType: service.service_type,
        rating: service.rating,
        city: service.city,
        state: service.state,
      });
      showSuccess(`${service.name} has been added to your wishlist.`, "Added to wishlist");
    }
  };

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showInfo("Please log in to add items to cart", "Login Required");
      return;
    }

    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      image: service.images[0] || "/placeholder.svg",
      vendorName: service.vendor_name,
      serviceType: service.service_type,
    });

    showSuccess(`${service.name} has been added to your cart.`, "Added to cart");
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {service.images && service.images.length > 0 ? (
          <div className={styles.carousel}>
            <img
              src={service.images[currentImageIndex]}
              alt={service.name}
              className={styles.cardImage}
            />
            <button className={styles.prevButton} onClick={handlePrev}>❮</button>
            <button className={styles.nextButton} onClick={handleNext}>❯</button>
            <div className={styles.carouselDots}>
              {service.images.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === currentImageIndex ? styles.active : ""}`}
                  onClick={() => setCurrentImageIndex(i)}
                ></span>
              ))}
            </div>
          </div>
        ) : (
          <img
            src="https://via.placeholder.com/300"
            alt="No image"
            className={styles.cardImage}
          />
        )}
        
        {/* Wishlist (only clickable if logged in) */}
        <button 
          className={`${styles.wishlistButton} ${inWishlist ? styles.active : ''}`}
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        <div className={styles.cardBadge}>
          <Star size={14} fill="currentColor" />
          {service.rating || "N/A"}
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{service.name}</h3>
        <div className={styles.cardLocation}>
          <MapPin size={14} />
          {service.city && service.state
            ? `${service.city}, ${service.state}`
            : "Location not specified"}
        </div>
        {showCapacity && (
          <div className={styles.cardCapacity}>
            <Users size={14} />
            Up to {service.capacity || "N/A"} guests
          </div>
        )}
        <p className={styles.cardPrice}>
          {service.price
            ? `Starting from ₹${(service.price / 100000).toFixed(1)}L`
            : "Price on request"}
        </p>
        <div className={styles.cardActions}>
          <Link to={`/service/${service.id}`} className={styles.cardButton}>
            View Details
          </Link>

          {/* Cart (only clickable if logged in) */}
          <button 
            className={styles.cartButton}
            onClick={handleQuickAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
