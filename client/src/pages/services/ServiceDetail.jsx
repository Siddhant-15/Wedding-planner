import {useAuth} from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {useWishlist} from "../../context/WishlistContext"
import Navbar from "../../components/Navbar.jsx"
// src/pages/services/ServiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Users, Heart, ShoppingCart, Phone, Mail,
  ChevronLeft, ChevronRight, Home, Send, MessageSquare, Map,
  CheckCircle, XCircle, Wine, Shield, Car
} from "lucide-react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { CustomerServiceAPI } from "@/utils/api";
import { showSuccess, showInfo, showError } from "@/utils/toast";
import styles from "../../styles/ServiceDetail.module.css";

/* ────────────────────── SAFE HELPERS ────────────────────── */
const safe = (v, fb = "Not specified") => (v != null ? String(v) : fb);
const safeJoin = (arr, sep = " • ") => Array.isArray(arr) && arr.length ? arr.join(sep) : "Not specified";
const safeReplace = (s, a, b) => s ? s.replace(a, b) : "Not specified";
const formatPrice = p => p ? `₹${(p / 100000).toFixed(1)}L` : "Price on request";

/* ────────────────────── COMPONENT ────────────────────── */
export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const inWish = isInWishlist(id);

  /* ───── FETCH SERVICE ───── */
  useEffect(() => {
    (async () => {
      try {
        const res = await CustomerServiceAPI.getDetail(id);
        setService(res);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  /* ───── ACTIONS ───── */
  const toggleWish = () => {
    if (!isAuthenticated) return showInfo("Login required", "Wishlist");
    if (inWish) { removeFromWishlist(id); showSuccess("Removed from wishlist"); }
    else {
      addToWishlist({
        id: service.id,
        name: service.name,
        price: service.price,
        image: service.images?.[0],
        vendorName: service.vendor?.name,
        serviceType: service.service_type,
        rating: service.rating,
        city: service.city,
        state: service.state,
      });
      showSuccess("Added to wishlist");
    }
  };

  const addCart = () => {
    if (!isAuthenticated) return showInfo("Login required", "Cart");
    addToCart({
      id: service.id,
      name: service.name,
      price: service.price,
      image: service.images?.[0],
      vendorName: service.vendor?.name,
      serviceType: service.service_type,
    });
    showSuccess("Added to cart");
  };

  const nextImg = () => setImgIdx(i => (i + 1) % (service.images?.length || 1));
  const prevImg = () => setImgIdx(i => (i - 1 + (service.images?.length || 1)) % (service.images?.length || 1));

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return showError("All fields required");
    setSending(true);
    try {
      // Replace with your actual API
      await CustomerServiceAPI.sendEnquiry(id, form);
      showSuccess("Message sent! Vendor will contact you soon.");
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      showError("Failed to send message. Try again.");
    } finally {
      setSending(false);
    }
  };

  /* ───── RENDER ───── */
  if (loading) return <div className={styles.loading}><div className={styles.spinner}></div><p>Loading…</p></div>;
  if (!service) return <div className={styles.notFound}>Service not found</div>;

  const { venue } = service;
  const imgs = service.images || [];
  // const mapCenter = service.lat && service.lng ? { lat: service.lat, lng: service.lng } : null;
  const mapCenter = {lat: 90, lng:90}

  return (
    <div className={styles.container}>
      <Navbar/>
      {/* Back */}
      <Link to="/" className={styles.backBtn}>
        <ArrowLeft size={20} /> Back to Services
      </Link>

      {/* Main Grid */}
      <div className={styles.grid}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          <div className={styles.mainImgWrap}>
            <img src={imgs[imgIdx] || "/placeholder.jpg"} alt={service.name} className={styles.mainImg} />
            {imgs.length > 1 && (
              <>
                <button onClick={prevImg} className={`${styles.navBtn} ${styles.prevBtn}`}><ChevronLeft /></button>
                <button onClick={nextImg} className={`${styles.navBtn} ${styles.nextBtn}`}><ChevronRight /></button>
              </>
            )}
          </div>

          {imgs.length > 1 && (
            <div className={styles.thumbs}>
              {imgs.map((src, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`${styles.thumb} ${i === imgIdx ? styles.activeThumb : ""}`}>
                  <img src={src} alt={`thumb ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            <div className={styles.catBadge}>
              <Home size={14} />
              <span>{safeReplace(service.service_type, /_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            <h1 className={styles.title}>{service.name}</h1>
            <p className={styles.vendor}>by <strong>{service.vendor?.name || "N/A"}</strong></p>
          </div>

          <div className={styles.meta}>
            <div className={styles.rating}>
              <Star size={18} fill="currentColor" />
              <span>{safe(service.rating?.toFixed(1), "N/A")}</span>
              <span className={styles.reviewCount}>({service.review_count || 0} reviews)</span>
            </div>
            <div className={styles.location}>
              <MapPin size={18} /> {service.city}, {service.state}
            </div>
          </div>

          <p className={styles.desc}>{service.description}</p>

          <div className={styles.price}>
            {formatPrice(service.price)}
          </div>

          <div className={styles.actions}>
            <button onClick={toggleWish} className={`${styles.wishBtn} ${inWish ? styles.active : ""}`}>
              <Heart size={20} fill={inWish ? "currentColor" : "none"} />
              {inWish ? "Wishlisted" : "Wishlist"}
            </button>
            <button onClick={addCart} className={styles.cartBtn}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>

          {/* Vendor Card */}
          <div className={styles.vendorCard}>
            <h3>Vendor Details</h3>
            <p><strong>{service.vendor?.name}</strong></p>
            <p className={styles.vendorDesc}>{service.vendor?.description}</p>
            {service.vendor?.experience != null && (
              <p className={styles.exp}><strong>{service.vendor.experience}</strong> years of excellence</p>
            )}
            <div className={styles.contact}>
              {service.vendor?.phone && (
                <a href={`tel:${service.vendor.phone}`} className={styles.contactBtn}>
                  <Phone size={16} /> Call
                </a>
              )}
              {service.vendor?.email && (
                <a href={`mailto:${service.vendor.email}`} className={styles.contactBtn}>
                  <Mail size={16} /> Email
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          <div className={styles.addressCard}>
            <h3><MapPin size={18} className={styles.icon} /> Full Address</h3>
            <p>{service.address_line1}</p>
            {service.address_line2 && <p>{service.address_line2}</p>}
            <p>{service.city}, {service.state} – {service.pincode}</p>
          </div>
        </div>
      </div>

      {/* Venue Specs */}
      {service.service_type === "venue" && venue && (
        <div className={styles.venueCard}>
          <h3><Home className={styles.icon} /> Venue Specifications</h3>
          <div className={styles.specGrid}>
            <div><strong>Capacity</strong><br />{venue.capacity_min} – {venue.capacity_max} guests</div>
            <div><strong>Type</strong><br />{safeReplace(venue.hall_type, /_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
            <div><strong>Indoor/Outdoor</strong><br />{safe(venue.indoor_outdoor)?.charAt(0).toUpperCase() + safe(venue.indoor_outdoor)?.slice(1)}</div>
            <div><strong>Area</strong><br />{safe(venue.square_feet)} sq ft</div>
            <div><strong>Parking</strong><br />{safe(venue.parking_capacity)} cars</div>

            <div>
              <strong>Decoration</strong><br />
              {venue.decoration_policy === "allowed" ? <><CheckCircle className={styles.check} /> Allowed</> :
               venue.decoration_policy === "in_house_only" ? <><Shield className={styles.check} /> In‑house only</> : "N/A"}
            </div>

            <div>
              <strong>Catering</strong><br />
              {venue.catering_policy === "allowed" ? <><CheckCircle className={styles.check} /> Allowed</> :
               venue.catering_policy === "in_house_only" ? <><Shield className={styles.check} /> In‑house only</> : "N/A"}
            </div>

            <div>
              <strong>Alcohol</strong><br />
              {venue.alcohol_policy === "allowed" ? <><Wine className={styles.check} /> Allowed</> :
               venue.alcohol_policy === "not_allowed" ? <><XCircle className={styles.cross} /> Not Allowed</> : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {mapCenter && (
        <div className={styles.mapSection}>
          <h3><Map size={20} className={styles.icon} /> Location on Map</h3>
          <div className={styles.mapContainer}>
            <LoadScript googleMapsApiKey={import.meta.env.REACT_APP_GOOGLE_MAPS_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={15}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      )}

      {/* Get in Touch */}
      <div className={styles.contactFormCard}>
        <h3><MessageSquare className={styles.icon} /> Get in Touch</h3>
        <p className={styles.formSubtitle}>Fill the form below and the vendor will contact you within 24 hours.</p>
        <form onSubmit={sendMessage} className={styles.contactForm}>
          <input
            type="text"
            placeholder="Your Name *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
          <textarea
            placeholder="Your Message *"
            rows={4}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            required
          />
          <button type="submit" disabled={sending} className={styles.sendBtn}>
            {sending ? "Sending..." : <>Send Message <Send size={18} /></>}
          </button>
        </form>
      </div>

      {/* Amenities */}
      {service.amenities?.length > 0 && (
        <div className={styles.amenitiesCard}>
          <h3>Amenities & Inclusions</h3>
          <ul className={styles.amenitiesList}>
            {service.amenities.map((a, i) => (
              <li key={i}><CheckCircle size={16} className={styles.check} /> {a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {service.tags?.length > 0 && (
        <div className={styles.tagsCard}>
          <h3>Popular Tags</h3>
          <div className={styles.tagsRow}>
            {service.tags.map((t, i) => (
              <span key={i} className={styles.tag}># {t.replace("#", "")}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}