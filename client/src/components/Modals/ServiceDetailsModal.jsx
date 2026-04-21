import React, { useEffect, useState } from "react";
import {
  X, MapPin, Tag, Users, UtensilsCrossed,
  ChefHat, Sparkles, ChevronLeft, ChevronRight, Calendar,
  Building2, Car, Users2, Ruler, ShieldCheck
} from "lucide-react";
import styles from "../../styles/Modals/VendorServiceDetailsModal.module.css";

const serviceTypes = {
  venue: "Venue",
  dj: "DJ",
  event_management: "Event Management",
  catering: "Catering",
  photography: "Photography",
  makeup_artist: "Makeup Artist",
};

const pricingTypes = {
  per_day: "Per Day",
  per_hour: "Per Hour",
  per_head: "Per Head",
  package: "Package",
};

const VendorServiceDetailsModal = ({ isOpen, onClose, service }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Venue helpers
  console.log(service);


  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [service?.id]);

  if (!isOpen || !service) return null;

  const images = service.media?.map((m) => m.media_url) || [];
  const tags = service.metadata?.tags || [];
  const amenities = service.metadata?.amenities || [];

  const locationText = [
    service.add_line1,
    service.add_line2,
    service.area,
    service.city,
    service.state,
    service.country,
    service.pincode,
  ].filter(Boolean).join(", ");

  const status = service.is_active ? "Active" : "Inactive";
  const isVerified = service.is_verified;

  const venue = service.venue || null;
  const isVenue = service.service_type === "venue" && venue !== null;

  const venuePolicies = venue?.venue_policies || {};
  const otherPolicies = venuePolicies?.other_policies || [];

  const catering = service.catering || {};
  const isCatering = service.service_type === "catering";

  const photography = service.photography || {};
  const isPhotography = service.service_type === "photography";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "—";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Image Section */}
        <div className={styles.imageWrapper}>
          {images.length > 0 ? (
            <>
              <img
                src={images[currentIndex]}
                alt={service.service_name}
                className={styles.sliderImg}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className={styles.prevBtn}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) => (prev + 1) % images.length)
                    }
                    className={styles.nextBtn}
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                  <div className={styles.imageCount}>
                    {currentIndex + 1} / {images.length}
                  </div>
                  <div className={styles.thumbnailStrip}>
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`${styles.thumb} ${idx === currentIndex ? styles.activeThumb : ""}`}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.noImage}>
              <Sparkles size={40} />
              <span>No Images Available</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className={styles.details}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          <div className={styles.detailsHeader}>
            <h2 className={styles.title}>{service.service_name}</h2>

            <div className={styles.topBadges}>
              <span className={`${styles.badge} ${status === "Active" ? styles.active : styles.inactive}`}>
                {status}
              </span>
              <span className={`${styles.badge} ${isVerified ? styles.verified : styles.notVerified}`}>
                {isVerified ? "✓ Verified" : "Not Verified"}
              </span>
            </div>

            {service.description && (
              <p className={styles.description}>{service.description}</p>
            )}
          </div>

          <div className={styles.detailsBody}>
            {/* Basic Information */}
            <section className={styles.section}>
              <h3>
                <Tag size={18} /> Basic Information
              </h3>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Category</span>
                  <span className={styles.infoValue}>
                    {serviceTypes[service.service_type] || service.service_type}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>
                    <MapPin size={14} /> Location
                  </span>
                  <span className={styles.infoValue}>{locationText || "—"}</span>
                </div>
                {tags.length > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Tags</span>
                    <div className={styles.tagList}>
                      {tags.map((t, i) => (
                        <span key={i} className={styles.tagPill}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Venue Details - Safe version */}
            {isVenue && (
              <section className={styles.section}>
                <h3>
                  <Building2 size={18} /> Venue Details
                </h3>
                <div className={styles.infoList}>
                  {venue.venue_type && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Building2 size={14} /> Venue Type
                      </span>
                      <span className={styles.infoValue}>
                        {venue.venue_type.charAt(0).toUpperCase() + venue.venue_type.slice(1)}
                      </span>
                    </div>
                  )}

                  {venue.venue_nature && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <ShieldCheck size={14} /> Nature
                      </span>
                      <span className={styles.infoValue}>
                        {venue.venue_nature.charAt(0).toUpperCase() + venue.venue_nature.slice(1)}
                      </span>
                    </div>
                  )}

                  {(venue.min_capacity != null || venue.max_capacity != null) && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Users2 size={14} /> Capacity
                      </span>
                      <span className={styles.infoValue}>
                        {venue.min_capacity || 0} – {venue.max_capacity || "No Limit"} guests
                      </span>
                    </div>
                  )}

                  {venue.square_feet && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Ruler size={14} /> Area
                      </span>
                      <span className={styles.infoValue}>
                        {parseFloat(venue.square_feet).toLocaleString("en-IN")} sq.ft.
                      </span>
                    </div>
                  )}

                  {venue.parking_capacity != null && venue.parking_capacity > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Car size={14} /> Parking Capacity
                      </span>
                      <span className={styles.infoValue}>
                        {venue.parking_capacity} vehicles
                      </span>
                    </div>
                  )}
                </div>

                {/* Venue Policies */}
                {(venuePolicies.alcohol_policy ||
                  venuePolicies.catering_policy ||
                  venuePolicies.decoration_policy ||
                  otherPolicies.length > 0) && (
                    <div className={styles.venuePolicies}>
                      <h4 className={styles.policyTitle}>
                        <ShieldCheck size={16} /> Venue Policies
                      </h4>

                      <div className={styles.policyGrid}>
                        {venuePolicies.alcohol_policy && (
                          <div className={styles.policyItem}>
                            <span className={styles.policyLabel}>Alcohol</span>
                            <span className={`${styles.policyValue} ${venuePolicies.alcohol_policy === "allowed" ? styles.allowed : styles.notAllowed}`}>
                              {venuePolicies.alcohol_policy === "allowed" ? "✅ Allowed" : "❌ Not Allowed"}
                            </span>
                          </div>
                        )}

                        {venuePolicies.catering_policy && (
                          <div className={styles.policyItem}>
                            <span className={styles.policyLabel}>Catering</span>
                            <span className={styles.policyValue}>
                              {venuePolicies.catering_policy.replace(/-/g, " ")
                                .replace(/\b\w/g, char => char.toUpperCase())}
                            </span>
                          </div>
                        )}

                        {venuePolicies.decoration_policy && (
                          <div className={styles.policyItem}>
                            <span className={styles.policyLabel}>Decoration</span>
                            <span className={`${styles.policyValue} ${venuePolicies.decoration_policy === "allowed" ? styles.allowed : styles.notAllowed}`}>
                              {venuePolicies.decoration_policy === "allowed" ? "✅ Allowed" : "❌ Not Allowed"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Other Policies */}
                      {otherPolicies.length > 0 && (
                        <div className={styles.otherPolicies}>
                          <h5>Additional Policies</h5>
                          <div className={styles.otherPolicyList}>
                            {otherPolicies.map((policy, idx) => (
                              <div key={idx} className={styles.otherPolicyItem}>
                                <strong>{policy.title}:</strong> {policy.description || "—"}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </section>
            )}

            {/* Catering */}
            {isCatering && (
              <section className={styles.section}>
                <h3>
                  <UtensilsCrossed size={18} /> Catering Details
                </h3>
                <div className={styles.infoList}>
                  {catering.cuisine_types?.length > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <ChefHat size={14} /> Cuisines
                      </span>
                      <span className={styles.infoValue}>{catering.cuisine_types.join(", ")}</span>
                    </div>
                  )}
                  {catering.service_styles?.length > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Service Style</span>
                      <span className={styles.infoValue}>{catering.service_styles.join(", ")}</span>
                    </div>
                  )}
                  {catering.special_diets_supported?.length > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Special Diets</span>
                      <span className={styles.infoValue}>{catering.special_diets_supported.join(", ")}</span>
                    </div>
                  )}
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>
                      <Users size={14} /> Order Range
                    </span>
                    <span className={styles.infoValue}>
                      {catering.min_order || "N/A"} – {catering.max_order || "N/A"} guests
                    </span>
                  </div>
                </div>

                <div className={styles.featureChips}>
                  {catering.staff_included && <span className={styles.featureChip}>✓ Staff</span>}
                  {catering.crockery_cutlery_included && <span className={styles.featureChip}>✓ Crockery & Cutlery</span>}
                  {catering.tasting_available && <span className={styles.featureChip}>✓ Tasting Available</span>}
                  {catering.customizable_menu && <span className={styles.featureChip}>✓ Customizable Menu</span>}
                </div>
              </section>
            )}

            {isPhotography && (
              <section className={styles.section}>
                <h3>
                  <Sparkles size={18} /> Photography Details
                </h3>

                <div className={styles.infoList}>

                  {photography.photography_types?.length > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Types</span>
                      <span className={styles.infoValue}>
                        {photography.photography_types.join(", ")}
                      </span>
                    </div>
                  )}

                  {photography.coverage_hours && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Coverage</span>
                      <span className={styles.infoValue}>
                        {photography.coverage_hours} hours
                      </span>
                    </div>
                  )}

                  {photography.team_size && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <Users size={14} /> Team Size
                      </span>
                      <span className={styles.infoValue}>
                        {photography.team_size} members
                      </span>
                    </div>
                  )}

                  {photography.photo_delivery_count && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Photos Delivered</span>
                      <span className={styles.infoValue}>
                        {photography.photo_delivery_count}+ photos
                      </span>
                    </div>
                  )}

                  {photography.video_delivery_duration_minutes && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Video Duration</span>
                      <span className={styles.infoValue}>
                        {photography.video_delivery_duration_minutes} mins
                      </span>
                    </div>
                  )}

                  {photography.album_pages && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Album</span>
                      <span className={styles.infoValue}>
                        {photography.album_pages} pages
                      </span>
                    </div>
                  )}

                  {photography.editing_styles?.length > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Editing Styles</span>
                      <span className={styles.infoValue}>
                        {photography.editing_styles.join(", ")}
                      </span>
                    </div>
                  )}

                  {photography.overtime_rate_per_hour && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Overtime</span>
                      <span className={styles.infoValue}>
                        ₹{Number(photography.overtime_rate_per_hour).toLocaleString("en-IN")} / hour
                      </span>
                    </div>
                  )}

                </div>

                {/* Features */}
                <div className={styles.featureChips}>
                  {photography.videography_available && (
                    <span className={styles.featureChip}>🎥 Videography</span>
                  )}
                  {photography.drone_shoot_available && (
                    <span className={styles.featureChip}>🚁 Drone Shoot</span>
                  )}
                  {photography.edited_photos_included && (
                    <span className={styles.featureChip}>✓ Edited Photos</span>
                  )}
                  {photography.raw_photos_provided && (
                    <span className={styles.featureChip}>✓ Raw Photos</span>
                  )}
                  {photography.album_included && (
                    <span className={styles.featureChip}>✓ Album Included</span>
                  )}
                  {photography.second_shooter_included && (
                    <span className={styles.featureChip}>✓ Second Shooter</span>
                  )}
                </div>
              </section>
            )}



            {service.variants?.length > 0 && (
              <section className={styles.section}>
                <h3>
                  <Tag size={18} /> Pricing & Packages
                </h3>

                {service.variants.map((variant, i) => (
                  <div key={i} className={styles.packageCard}>

                    {/* Header */}
                    <div className={styles.packageHeader}>
                      <h4 className={styles.packageName}>{variant.variant_name}</h4>

                      {/* 🎯 VENUE */}
                      {service.service_type === "venue" ? (
                        <div className={styles.priceContainer}>

                          {/* Rental */}
                          {variant.pricing?.base_price != null && (
                            <span className={styles.price}>
                              ₹{variant.pricing.base_price.toLocaleString("en-IN")}
                              {variant.pricing_type && (
                                <small>
                                  {" "}
                                  / {pricingTypes[variant.pricing_type] || variant.pricing_type}
                                </small>
                              )}
                            </span>
                          )}

                          {/* Per Plate */}
                          {(variant.pricing?.veg_price != null ||
                            variant.pricing?.non_veg_price != null) && (
                              <div className={styles.priceRow}>
                                {variant.pricing?.veg_price != null && (
                                  <span className={styles.vegPrice}>
                                    Veg ₹{variant.pricing.veg_price.toLocaleString("en-IN")}
                                    {variant.pricing_type === "per_head" && <small>/head</small>}
                                  </span>
                                )}

                                {variant.pricing?.non_veg_price != null && (
                                  <span className={styles.nonVegPrice}>
                                    Non-Veg ₹{variant.pricing.non_veg_price.toLocaleString("en-IN")}
                                    {variant.pricing_type === "per_head" && <small>/head</small>}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      ) : service.service_type === "photography" ? (

                        /* 📸 PHOTOGRAPHY */
                        <div className={styles.priceContainer}>
                          {variant.pricing?.base_price != null && (
                            <span className={styles.price}>
                              📸 ₹{variant.pricing.base_price.toLocaleString("en-IN")}
                            </span>
                          )}
                          {variant.pricing?.price_with_video != null && (
                            <span className={styles.price}>
                              🎥 ₹{variant.pricing.price_with_video.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                      ) : service.service_type === "catering" ? (

                        /* 🍽️ CATERING */
                        <div className={styles.priceContainer}>
                          {variant.pricing?.veg_price != null && (
                            <span className={styles.vegPrice}>
                              Veg ₹{variant.pricing.veg_price.toLocaleString("en-IN")}
                              {variant.pricing_type === "per_head" && <small>/head</small>}
                            </span>
                          )}
                          {variant.pricing?.non_veg_price != null && (
                            <span className={styles.nonVegPrice}>
                              Non-Veg ₹{variant.pricing.non_veg_price.toLocaleString("en-IN")}
                              {variant.pricing_type === "per_head" && <small>/head</small>}
                            </span>
                          )}
                        </div>

                      ) : (

                        /* 💰 DEFAULT */
                        <span className={styles.price}>
                          ₹{variant.pricing?.base_price?.toLocaleString("en-IN") || "—"}
                          {variant.pricing_type && (
                            <small>
                              {" "}
                              / {pricingTypes[variant.pricing_type] || variant.pricing_type}
                            </small>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {variant.description && (
                      <p className={styles.packageDesc}>{variant.description}</p>
                    )}

                    {/* Inclusions & Exclusions */}
                    <div className={styles.incExcGrid}>
                      {variant.inclusions?.length > 0 && (
                        <div className={styles.inclusionsSection}>
                          <h5>Inclusions</h5>
                          <ul className={styles.inclusions}>
                            {variant.inclusions.map((inc, idx) => (
                              <li key={idx}>
                                <span className={styles.checkIcon}>✓</span> {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {variant.exclusions?.length > 0 && (
                        <div className={styles.exclusionsSection}>
                          <h5>Exclusions</h5>
                          <ul className={styles.exclusions}>
                            {variant.exclusions.map((exc, idx) => (
                              <li key={idx}>
                                <span className={styles.crossIcon}>✗</span> {exc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </section>
            )}



            {/* Amenities */}
            {amenities.length > 0 && (
              <section className={styles.section}>
                <h3>
                  <Sparkles size={18} /> Amenities
                </h3>
                <div className={styles.amenitiesGrid}>
                  {amenities.map((amenity, i) => (
                    <span key={i} className={styles.amenityCard}>{amenity}</span>
                  ))}
                </div>
              </section>
            )}

            {/* Meta Footer */}
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Calendar size={12} /> Created
                </span>
                <span className={styles.metaValue}>{formatDate(service.created_at)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <Calendar size={12} /> Last Updated
                </span>
                <span className={styles.metaValue}>{formatDate(service.updated_at)}</span>
              </div>
            </div>
          </div>
        </div >
      </div >
    </div>
  );
};

export default VendorServiceDetailsModal;
