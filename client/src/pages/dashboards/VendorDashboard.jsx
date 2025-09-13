import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ServiceFormModal from '@/components/ServiceForm';
import { Plus, Settings, Eye, Trash2, Edit3, BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import styles from '../../styles/VendorDashboard.module.css'
import { serviceAPI } from '../../services/api';
import { supabase } from "../../utils/supabaseClient"; // make sure you have this
import { v4 as uuidv4 } from "uuid";
import ConfirmModal from '../../components/Modals/ConfirmModal';

const VendorDashboard = () => {
  const [services, setServices] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: '₹0'
  });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    setStats({
      totalServices: services.length,
      activeServices: services.filter(s => s.status === 'active').length,
      totalBookings: services.reduce((sum, s) => sum + (s.bookings || 0), 0),
      monthlyRevenue: `₹${services.reduce((sum, s) => sum + (s.revenue || 0), 0).toLocaleString()}`
    });
  }, [services]);
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await serviceAPI.getAll();
      console.log("Data", data);
      setServices(data);

      // Example: calculate stats
      setStats({
        totalServices: data.length,
        activeServices: data.filter(s => s.status === 'active').length,
        totalBookings: data.reduce((sum, s) => sum + (s.bookings || 0), 0),
        monthlyRevenue: `₹${data.reduce((sum, s) => sum + (s.revenue || 0), 0)}`
      });
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const uploadFilesToSupabase = async (files) => {
    const uploadedUrls = [];

    for (let file of files) {
      const filePath = `services/${uuidv4()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("service-images")
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) uploadedUrls.push(publicData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleCreateService = async (serviceData, files) => {
    try {
      // Step 1: Create service without images
      console.log(serviceData);
      const { data: newService } = await serviceAPI.create(serviceData);

      // Step 2: Upload images to Supabase
      if (files && files.length > 0) {
        const uploaded = await uploadFilesToSupabase(files);

        // Step 3: Update service with image URLs
        const { data: updated } = await serviceAPI.update(newService.id, { images: uploaded });
        newService.images = updated.images;
      }

      setServices(prev => [...prev, newService]);
      setIsServiceModalOpen(false);
    } catch (error) {
      console.error("Failed to create service:", error);
    }
  };

  const handleUpdateService = async (serviceData, files) => {
    try {
      // Step 1: Update basic service fields
      const { data: updatedService } = await serviceAPI.update(editingService.id, serviceData);

      // Step 2: Upload new images if any
      if (files && files.length > 0) {
        const uploaded = await uploadFilesToSupabase(files);

        // Optionally merge with existing images
        const { data: updatedWithImages } = await serviceAPI.update(editingService.id, {
          images: [...(editingService.images || []), ...uploaded]
        });

        updatedService.images = updatedWithImages.images;
      }

      setServices(prev => prev.map(s => s.id === editingService.id ? updatedService : s));
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Failed to update service:", error);
    }
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
      // delete from API
      await serviceAPI.delete(serviceToDelete.id);

      // delete images from supabase if any
      if (serviceToDelete.images?.length > 0) {
        const filePaths = serviceToDelete.images.map((img) => {
          // normalize in case it's object or string
          const url = typeof img === "string" ? img : img.image_url;

          // extract part after bucket name
          const match = url.match(/service-images\/(.+)$/);
          return match ? match[1] : null;
        }).filter(Boolean);

        if (filePaths.length > 0) {
          const { error } = await supabase.storage
            .from("service-images")
            .remove(filePaths);

          if (error) console.error("Supabase delete error:", error);
          else console.log("Deleted from supabase:", filePaths);
        }
      }

      // update state
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setConfirmOpen(false);
      setServiceToDelete(null);
    }
  };



  const handleNext = (serviceId) => {
    setImageIndexes(prev => {
      const current = prev[serviceId] || 0;
      const service = services.find(s => s.id === serviceId);
      const next = (current + 1) % service.images.length;
      return { ...prev, [serviceId]: next };
    });
  };

  const handlePrev = (serviceId) => {
    setImageIndexes(prev => {
      const current = prev[serviceId] || 0;
      const service = services.find(s => s.id === serviceId);
      const prevIndex = (current - 1 + service.images.length) % service.images.length;
      return { ...prev, [serviceId]: prevIndex };
    });
  };

  const handleModalClose = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className={styles.dashboard}>
      <Navbar />
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vendor Dashboard</h1>
          <p className={styles.subtitle}>Manage your services and track your business growth</p>
        </div>
        <button className={styles.addButton} onClick={() => setIsServiceModalOpen(true)}>
          <Plus size={20} className={styles.icon} />
          Add New Service
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Total Services</span>
            <Settings className={styles.iconBrand} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardNumber}>{stats.totalServices}</div>
            <p className={styles.cardTrend}><TrendingUp size={14} /> +2 from last month</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Active Services</span>
            <Eye className={styles.iconGold} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardNumber}>{stats.activeServices}</div>
            <p>{stats.activeServices}/{stats.totalServices} active</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Total Bookings</span>
            <Users className={styles.iconBrand} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardNumber}>{stats.totalBookings}</div>
            <p className={styles.cardTrend}><TrendingUp size={14} /> +12% from last month</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>Monthly Revenue</span>
            <BarChart3 className={styles.iconGold} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardNumber}>{stats.monthlyRevenue}</div>
            <p className={styles.cardTrend}><TrendingUp size={14} /> +20% from last month</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className={styles.servicesGrid}>
        {services.map(service => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.imageWrapper}>
              {service.images && service.images.length > 0 ? (
                <div className={styles.slider}>
                  <button className={styles.prevBtn} onClick={() => handlePrev(service.id)}>‹</button>

                  <div className={styles.sliderInner} style={{ transform: `translateX(-${imageIndexes[service.id] || 0}00%)` }}>
                    {service.images.map((img, index) => (
                      <img key={index} src={img.image_url} alt={service.name} className={styles.sliderImg} />
                    ))}
                  </div>

                  <button className={styles.nextBtn} onClick={() => handleNext(service.id)}>›</button>

                  <div className={styles.sliderDots}>
                    {service.images.map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.dot} ${index === (imageIndexes[service.id] || 0) ? styles.activeDot : ''}`}
                        onClick={() => setImageIndexes(prev => ({ ...prev, [service.id]: index }))}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <img src="/placeholder.svg" alt={service.name} className={styles.sliderImg} />
              )}
              <span className={`${styles.status} ${styles[service.status]}`}>{service.status}</span>
            </div>

            <div className={styles.serviceContent}>
              <div className={styles.serviceHeader}>
                <span className={styles.type}>{service.type}</span>
                <span>⭐ {service.rating || 'New'}</span>
              </div>
              <h3 className={styles.serviceTitle}>{service.name}</h3>
              <p className={styles.serviceLocation}>{service.location}</p>
              <div className={styles.serviceMeta}>
                <span className={styles.price}>{service.price}</span>
                <span>{service.bookings} bookings</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => handleEditService(service)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className={styles.viewBtn}>
                  <Eye size={14} /> View
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
        message={`Are you sure you want to delete ${serviceToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Empty State */}
      {services.length === 0 && (
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
      )}

      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={handleModalClose}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        initialData={editingService}
      />
    </div>
  );
};

export default VendorDashboard;