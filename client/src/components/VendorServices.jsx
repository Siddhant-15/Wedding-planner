import React, { useState, useEffect } from 'react';
import { serviceService } from '../utils/api/services/service.service';
import { Plus, Eye, Trash2, Edit3, Calendar, MapPin } from 'lucide-react';
import ConfirmModal from './Modals/ConfirmModal';
import ServiceFormModal from './Modals/ServiceFormModal/ServiceFormModal'
import VendorServiceDetailsModal from './Modals/ServiceDetailsModal';
import styles from '../styles/VendorDashboard.module.css';

const VendorServices = ({ isServiceModalOpen, setIsServiceModalOpen, editingService, setEditingService, onStatsChange }) => {
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
        activeServices: services.filter(s => s.is_active).length,
        totalBookings: services.reduce((sum, s) => sum + (s.bookings || 0), 0),
        monthlyRevenue: `₹${services.reduce((sum, s) => sum + (s.base_price * (s.bookings || 0)), 0).toLocaleString('en-IN')}`
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
      const { data: updatedService } = await serviceService.update(serviceId || editingService.id, serviceData);
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? updatedService : s))
      );
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

  const handleNext = (serviceId) => {
    setImageIndexes((prev) => {
      const current = prev[serviceId] || 0;
      const service = services.find((s) => s.id === serviceId);
      const imagesArr = service.media ? service.media.map(m => m.media_url) : service.images;
      const next = (current + 1) % imagesArr.length;
      return { ...prev, [serviceId]: next };
    });
  };

  const handlePrev = (serviceId) => {
    setImageIndexes((prev) => {
      const current = prev[serviceId] || 0;
      const service = services.find((s) => s.id === serviceId);
      const imagesArr = service.media ? service.media.map(m => m.media_url) : service.images;
      const prevIndex = (current - 1 + imagesArr.length) % imagesArr.length;
      return { ...prev, [serviceId]: prevIndex };
    });
  };

  const handleModalClose = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const formatCategory = (category) => {
    const categoryMap = {
      venue: 'Wedding Venue',
      catering: 'Catering',
      dj: 'DJ',
      photographer: 'Photography',
      event_management: 'Event Management'
    };
    return categoryMap[category] || category;
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Your Services</h2>
          <p className={styles.subtitle}>Manage your wedding services</p>
        </div>
        <button className={styles.addButton} onClick={() => setIsServiceModalOpen(true)}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.imageWrapper}>
              {(service.media && service.media.length > 0) || (service.images && service.images.length > 0) ? (
                <div className={styles.slider}>
                  <button className={styles.prevBtn} onClick={() => handlePrev(service.id)}>‹</button>
                  <div className={styles.sliderInner} style={{ transform: `translateX(-${(imageIndexes[service.id] || 0) * 100}%)` }}>
                    {(service.media ? service.media.map(m => m.media_url) : service.images).map((img, index) => (
                      <img key={index} src={img} alt={service.service_name || service.title} className={styles.sliderImg} />
                    ))}
                  </div>
                  <button className={styles.nextBtn} onClick={() => handleNext(service.id)}>›</button>
                  <div className={styles.sliderDots}>
                    {(service.media ? service.media.map(m => m.media_url) : service.images).map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.dot} ${index === (imageIndexes[service.id] || 0) ? styles.activeDot : ''}`}
                        onClick={() => setImageIndexes((prev) => ({ ...prev, [service.id]: index }))}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <img src="/placeholder.svg" alt={service.service_name || service.title} className={styles.sliderImg} />
              )}
              <span className={`${styles.status} ${styles[service.is_active ? 'active' : 'inactive']}`}>
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className={styles.serviceContent}>
              <div className={styles.serviceHeader}>
                <span className={styles.type}>{formatCategory(service.service_type || service.category)}</span>
                <span>⭐ {service.rating || 'New'}</span>
              </div>
              <h3 className={styles.serviceTitle}>{service.service_name || service.title}</h3>
              <p className={styles.serviceLocation}>
                <MapPin size={14} className={styles.inlineIcon} /> {service.city}, {service.state}
              </p>
              <div className={styles.serviceMeta}>
                <span className={styles.price}>
                  ₹{(service.variants?.[0]?.pricing?.base_price || 0).toLocaleString('en-IN')}
                  {" "}
                  {(service.variants?.[0]?.pricing_type || "")
                    .replaceAll("_", " ")
                    .toLowerCase()}
                </span>
                <span>{service.bookings || 0} bookings</span>
              </div>
              <div className={styles.amenities}>
                {(service.metadata?.amenities || []).slice(0, 3).map((amenity, index) => (
                  <span key={index} className={styles.amenityBadge}>
                    {amenity}
                  </span>
                ))}
                {(service.metadata?.amenities || []).length > 3 && (
                  <span className={styles.amenityBadge}>
                    +{(service.metadata?.amenities || []).length - 3}
                  </span>
                )}
              </div>
              <div className={styles.actions}>
                <button className={styles.viewBtn} onClick={() => handleViewService(service)}>
                  <Eye size={14} /> View
                </button>
                <button className={styles.editBtn} onClick={() => handleEditService(service)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDeleteService(service)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${serviceToDelete?.title}?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {
        services.length === 0 && (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <h3>No services yet</h3>
            <p>Create your first service to get started</p>
            <div className={styles.addButtonWrapper}>
              <button className={styles.addButton} onClick={() => setIsServiceModalOpen(true)}>
                <Plus size={16} /> Add Your First Service
              </button>
            </div>
          </div>
        )
      }

      < ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={handleModalClose}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        initialData={editingService}
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