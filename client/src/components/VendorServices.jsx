// src/components/services/VendorServices.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Edit3, MapPin, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmModal from './Modals/ConfirmModal';
import ServiceFormModal from './Modals/ServiceFormModal/ServiceFormModal';
import VendorServiceDetailsModal from './Modals/ServiceDetailsModal';
import styles from '../styles/VendorDashboard.module.css';
import { serviceService } from '../utils/api/services/service.service';

const VendorServices = ({
  isServiceModalOpen,
  setIsServiceModalOpen,
  editingService,
  setEditingService,
  onStatsChange,
}) => {
  const [services, setServices] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (onStatsChange) {
      onStatsChange({
        totalServices: services.length,
        activeServices: services.filter((s) => s.is_active).length,
        totalBookings: services.reduce((sum, s) => sum + (s.bookings || 0), 0),
      });
    }
  }, [services]);

  const fetchServices = async () => {
    try {
      const { data } = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const handleCreateService = async (formDataToSend) => {
    try {
      const { data: newService } = await serviceService.create(formDataToSend);
      setServices((prev) => [...prev, newService]);
      setIsServiceModalOpen(false);
    } catch (error) {
      console.error('Failed to create service:', error);
    }
  };

  const handleUpdateService = async (serviceData, serviceId) => {
    try {
      const { data: updatedService } = await serviceService.update(
        serviceId || editingService?.id,
        serviceData,
      );
      setServices((prev) => prev.map((s) => (s.id === editingService?.id ? updatedService : s)));
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  const handleViewService = (service) => {
    setSelectedService(service);
    setDetailsModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await serviceService.delete(serviceToDelete.id);
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
    } catch (err) {
      console.error('Failed to delete service:', err);
    } finally {
      setConfirmOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleNext = (e, serviceId) => {
    e.stopPropagation();
    setImageIndexes((prev) => {
      const current = prev[serviceId] || 0;
      const service = services.find((s) => s.id === serviceId);
      const imagesArr = service.media?.map((m) => m.media_url) || service.images || [];
      const next = (current + 1) % imagesArr.length;
      return { ...prev, [serviceId]: next };
    });
  };

  const handlePrev = (e, serviceId) => {
    e.stopPropagation();
    setImageIndexes((prev) => {
      const current = prev[serviceId] || 0;
      const service = services.find((s) => s.id === serviceId);
      const imagesArr = service.media?.map((m) => m.media_url) || service.images || [];
      const prevIndex = (current - 1 + imagesArr.length) % imagesArr.length;
      return { ...prev, [serviceId]: prevIndex };
    });
  };

  const handleModalClose = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const formatCategory = (type) => {
    const map = {
      venue: 'Wedding Venue',
      catering: 'Catering',
      dj: 'DJ',
      photography: 'Photography',
      event_management: 'Event Management',
      makeup_artist: 'Makeup Artist',
    };
    return map[type] || type?.charAt(0).toUpperCase() + type?.slice(1) || 'Service';
  };

  const getPricingDisplay = (service) => {
    const variant = service.variants?.[0];
    if (!variant) return { price: 'Price on request', label: '' };

    // 🎯 PHOTOGRAPHY
    if (service.service_type === 'photography') {
      const base = variant.pricing?.base_price;
      const withVideo = variant.pricing?.price_with_video;

      if (!base && !withVideo) {
        return { isPhotography: false, price: 'Price on request' };
      }

      return {
        isPhotography: true,
        photo: base ? `₹${base.toLocaleString('en-IN')}` : null,
        photoVideo: withVideo ? `₹${withVideo.toLocaleString('en-IN')}` : null,
      };
    }

    if (service.service_type === 'venue') {
      const veg = variant.pricing?.veg_price;
      const nonVeg = variant.pricing?.non_veg_price;
      const rental = variant.pricing?.rental_price;

      const hasPlate = veg != null || nonVeg != null;
      const hasRental = rental != null;

      return {
        isVenue: true,
        veg: veg != null ? `₹${veg.toLocaleString('en-IN')}` : null,
        nonVeg: nonVeg != null ? `₹${nonVeg.toLocaleString('en-IN')}` : null,
        rental: rental != null ? `₹${rental.toLocaleString('en-IN')}` : null,
        hasPlate,
        hasRental,
      };
    }

    // 🍽️ CATERING
    if (service.service_type === 'catering' || service.service_type === 'caterer') {
      const veg = variant.pricing?.veg_price;
      const nonVeg = variant.pricing?.non_veg_price;

      return {
        isCatering: true,
        veg: veg ? `₹${veg.toLocaleString('en-IN')}` : '—',
        nonVeg: nonVeg ? `₹${nonVeg.toLocaleString('en-IN')}` : '—',
        label: 'per head',
      };
    }

    // 💰 DEFAULT
    const basePrice = variant.pricing?.base_price || variant.pricing?.veg_price;

    return {
      isCatering: false,
      isPhotography: false,
      isVenue: false,
      price: basePrice ? `₹${basePrice.toLocaleString('en-IN')}` : 'Price on request',
      label: variant.pricing_type
        ? variant.pricing_type.replace('_', ' ').toLowerCase()
        : '',
    };
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Your Services</h1>
          <p className={styles.subtitle}>
            Manage and showcase your wedding services with elegance
          </p>
        </div>
        <button className={styles.addButton} onClick={() => setIsServiceModalOpen(true)}>
          <Plus size={18} />
          Add New Service
        </button>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service) => {
          const pricing = getPricingDisplay(service);
          const images = service.media?.map((m) => m.media_url) || service.images || [];
          const activeIdx = imageIndexes[service.id] || 0;
          const amenities = service.metadata?.amenities || [];

          return (
            <article
              key={service.id}
              className={styles.serviceCard}
              onClick={() => handleViewService(service)}
            >
              <div className={styles.imageWrapper}>
                {images.length > 0 ? (
                  <div className={styles.slider}>
                    <div
                      className={styles.sliderInner}
                      style={{ transform: `translateX(-${activeIdx * 100}%)` }}
                    >
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${service.service_name} ${idx + 1}`}
                          className={styles.sliderImg}
                          loading="lazy"
                        />
                      ))}
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          className={`${styles.navBtn} ${styles.prevBtn}`}
                          onClick={(e) => handlePrev(e, service.id)}
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          className={`${styles.navBtn} ${styles.nextBtn}`}
                          onClick={(e) => handleNext(e, service.id)}
                          aria-label="Next image"
                        >
                          <ChevronRight size={18} />
                        </button>

                        <div className={styles.sliderDots}>
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              className={`${styles.dot} ${idx === activeIdx ? styles.activeDot : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageIndexes((prev) => ({ ...prev, [service.id]: idx }));
                              }}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={styles.noImage}>
                    <Sparkles size={32} />
                    <span>No images</span>
                  </div>
                )}

                <span className={`${styles.status} ${service.is_active ? styles.active : styles.inactive}`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>

                {/* <button
                  className={styles.favoriteBtn}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Save"
                  tabIndex={-1}
                >
                  <Heart size={16} />
                </button> */}
              </div>

              <div className={styles.serviceContent}>
                <div className={styles.serviceHeader}>
                  <span className={styles.type}>{formatCategory(service.service_type)}</span>
                  <span className={styles.rating}>⭐ {service.rating || 'New'}</span>
                </div>

                <h3 className={styles.serviceTitle}>{service.service_name}</h3>

                <p className={styles.serviceLocation}>
                  <MapPin size={14} className={styles.inlineIcon} />
                  {service.city}
                  {service.state ? `, ${service.state}` : ''}
                </p>

                <div className={styles.pricingSection}>
                  {pricing.isVenue ? (
                    <div className={styles.venuePricing}>
                      <div className={styles.priceRow}>

                        {/* PER PLATE */}
                        {pricing.hasPlate && (
                          <div className={styles.platePricing}>
                            {pricing.veg && (
                              <div>
                                <span className={styles.priceLabel}>Veg</span>
                                <span className={`${styles.priceValue} ${styles.vegPrice}`}>
                                  {pricing.veg}
                                </span>
                                <span className={styles.perHead}>/plate</span>
                              </div>
                            )}

                            {pricing.nonVeg && (
                              <div>
                                <span className={styles.priceLabel}>Non-Veg</span>
                                <span className={`${styles.priceValue} ${styles.nonVegPrice}`}>
                                  {pricing.nonVeg}
                                </span>
                                <span className={styles.perHead}>/plate</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* RENTAL */}
                        {pricing.hasRental && (
                          <div className={styles.rentalPricing}>
                            <span className={styles.priceLabel}>Rental</span>
                            <span className={styles.priceValue}>{pricing.rental}</span>
                            <span className={styles.perHead}>/day</span>
                          </div>
                        )}

                      </div>
                    </div>
                  ) : pricing.isPhotography ? (
                    <div className={styles.photographyPricing}>
                      <div className={styles.priceRow}>
                        {pricing.photo && (
                          <div>
                            <span className={styles.priceLabel}>📸 Photos</span>
                            <span className={styles.priceValue}>{pricing.photo}</span>
                          </div>
                        )}

                        {pricing.photoVideo && (
                          <div>
                            <span className={styles.priceLabel}>🎥 Photo + Video</span>
                            <span className={styles.priceValue}>{pricing.photoVideo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : pricing.isCatering ? (
                    <div className={styles.cateringPricing}>
                      <div className={styles.priceRow}>
                        <div>
                          <span className={styles.priceLabel}>Veg</span>
                          <span className={`${styles.priceValue} ${styles.vegPrice}`}>
                            {pricing.veg}
                          </span>
                          <span className={styles.perHead}>/head</span>
                        </div>
                        <div>
                          <span className={styles.priceLabel}>Non-Veg</span>
                          <span className={`${styles.priceValue} ${styles.nonVegPrice}`}>
                            {pricing.nonVeg}
                          </span>
                          <span className={styles.perHead}>/head</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.regularPricingWrap}>
                      <span className={styles.regularPricing}>{pricing.price}</span>
                      {pricing.label && (
                        <span className={styles.priceUnit}>/ {pricing.label}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewService(service);
                    }}
                  >
                    <Eye size={14} /> View
                  </button>

                  <button
                    className={styles.editBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditService(service);
                    }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteService(service);
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Sparkles size={40} />
          </div>
          <h3 className={styles.emptyTitle}>No services yet</h3>
          <p className={styles.emptyText}>Create your first service to start receiving bookings</p>
          <button className={styles.addButton} onClick={() => setIsServiceModalOpen(true)}>
            <Plus size={18} />
            Add Your First Service
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete service?"
        message={`Are you sure you want to delete "${serviceToDelete?.service_name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={handleModalClose}
        onCreate={handleCreateService}
        onUpdate={handleUpdateService}
        editingService={editingService}
      />

      <VendorServiceDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        service={selectedService}
      />
    </div>
  );
};

export default VendorServices;
