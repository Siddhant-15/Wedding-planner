import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  Heart, 
  ShoppingCart,
  Phone,
  Mail
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import styles from "../styles/ServiceDetail.module.css";

// Mock service data - replace with your actual API
const mockService = {
  id: "1",
  name: "Royal Palace Wedding Venue",
  description: "Experience the grandeur of royalty at our magnificent wedding venue. With stunning architecture, lush gardens, and world-class amenities, we provide the perfect backdrop for your special day.",
  longDescription: "Our Royal Palace Wedding Venue is a testament to timeless elegance and sophistication. Spread across 5 acres of beautifully landscaped grounds, the venue features multiple event spaces including a grand ballroom, outdoor pavilion, and intimate ceremony gardens. Every detail has been carefully crafted to ensure your wedding day is nothing short of magical.",
  price: 500000,
  images: [
    "/placeholder.svg",
    "/placeholder.svg", 
    "/placeholder.svg",
    "/placeholder.svg"
  ],
  rating: 4.8,
  reviewCount: 127,
  city: "Mumbai",
  state: "Maharashtra",
  capacity: 500,
  vendor: {
    name: "Luxe Events",
    rating: 4.9,
    experience: "15+ years",
    phone: "+91 98765 43210",
    email: "contact@luxeevents.com",
    description: "Leading wedding planners with over 15 years of experience in creating memorable celebrations."
  },
  service_type: "Wedding Venue",
  amenities: [
    "Air Conditioning",
    "Parking Space",
    "Catering Kitchen",
    "Sound System",
    "Lighting Setup",
    "Bridal Room",
    "Security",
    "Valet Parking"
  ],
  availability: "Available",
  bookingPolicy: "Advance booking required with 25% token amount",
  cancellationPolicy: "Cancellation allowed up to 30 days before event",
  features: [
    "Grand Ballroom (300 guests)",
    "Outdoor Garden (200 guests)", 
    "VIP Lounge",
    "Professional Photography Areas",
    "Dedicated Event Coordinator"
  ]
};

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(mockService);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const inWishlist = isInWishlist(service?.id || "");

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(service.id);
      toast({
        title: "Removed from wishlist",
        description: `${service.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: service.id,
        name: service.name,
        price: service.price,
        image: service.images[0],
        vendorName: service.vendor.name,
        serviceType: service.service_type,
        rating: service.rating,
        city: service.city,
        state: service.state
      });
      toast({
        title: "Added to wishlist",
        description: `${service.name} has been added to your wishlist.`,
      });
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      image: service.images[0],
      vendorName: service.vendor.name,
      serviceType: service.service_type
    });
    
    toast({
      title: "Added to cart",
      description: `${service.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading service details...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Service not found</h2>
          <Link to="/" className={styles.backLink}>Go back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Services
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img 
              src={service.images[currentImageIndex]} 
              alt={service.name}
              className={styles.image}
            />
          </div>
          <div className={styles.thumbnails}>
            {service.images.map((image, index) => (
              <button
                key={index}
                className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                onClick={() => handleImageChange(index)}
              >
                <img src={image} alt={`View ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.mainDetails}>
            <h1 className={styles.title}>{service.name}</h1>
            <p className={styles.vendorName}>by {service.vendor.name}</p>
            
            <div className={styles.ratingLocation}>
              <div className={styles.rating}>
                <Star size={16} fill="currentColor" />
                <span>{service.rating}</span>
                <span className={styles.reviewCount}>({service.reviewCount} reviews)</span>
              </div>
              <div className={styles.location}>
                <MapPin size={16} />
                <span>{service.city}, {service.state}</span>
              </div>
            </div>

            <div className={styles.keyInfo}>
              <div className={styles.infoItem}>
                <Users size={16} />
                <span>Up to {service.capacity} guests</span>
              </div>
              <div className={styles.infoItem}>
                <Clock size={16} />
                <span>{service.availability}</span>
              </div>
            </div>

            <p className={styles.description}>{service.description}</p>

            <div className={styles.price}>
              ₹{(service.price / 100000).toFixed(1)}L
              <span className={styles.priceNote}>Starting price</span>
            </div>

            <div className={styles.actions}>
              <button 
                className={`${styles.wishlistBtn} ${inWishlist ? styles.active : ''}`}
                onClick={handleWishlistToggle}
              >
                <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                {inWishlist ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button 
                className={styles.cartBtn}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          </div>

          <div className={styles.vendorCard}>
            <h3>Vendor Information</h3>
            <div className={styles.vendorInfo}>
              <h4>{service.vendor.name}</h4>
              <div className={styles.vendorRating}>
                <Star size={14} fill="currentColor" />
                <span>{service.vendor.rating}</span>
              </div>
              <p>{service.vendor.experience} experience</p>
              <p className={styles.vendorDesc}>{service.vendor.description}</p>
              
              <div className={styles.vendorContact}>
                <a href={`tel:${service.vendor.phone}`} className={styles.contactBtn}>
                  <Phone size={16} />
                  Call Now
                </a>
                <a href={`mailto:${service.vendor.email}`} className={styles.contactBtn}>
                  <Mail size={16} />
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.additionalInfo}>
        <div className={styles.section}>
          <h3>About This Service</h3>
          <p>{service.longDescription}</p>
        </div>

        <div className={styles.section}>
          <h3>Features & Amenities</h3>
          <div className={styles.grid}>
            <div>
              <h4>Key Features</h4>
              <ul className={styles.featureList}>
                {service.features.map((feature, index) => (
                  <li key={index}>
                    <CheckCircle size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Amenities</h4>
              <ul className={styles.featureList}>
                {service.amenities.map((amenity, index) => (
                  <li key={index}>
                    <CheckCircle size={16} />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Booking & Policies</h3>
          <div className={styles.policies}>
            <div className={styles.policy}>
              <h4>Booking Policy</h4>
              <p>{service.bookingPolicy}</p>
            </div>
            <div className={styles.policy}>
              <h4>Cancellation Policy</h4>
              <p>{service.cancellationPolicy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
