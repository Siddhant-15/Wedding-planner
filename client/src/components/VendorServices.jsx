import React, { useState, useEffect } from 'react';
import { serviceAPI } from '../services/api';
import { Plus, Eye, Trash2, Edit3, Calendar } from 'lucide-react';
import ConfirmModal from './Modals/ConfirmModal';
import ServiceFormModal from '@/components/ServiceForm';
import styles from '../styles/VendorDashboard.module.css'
import VendorServiceDetailsModal from './Modals/ServiceDetailsModal';

const VendorServices = ({ isServiceModalOpen, setIsServiceModalOpen,editingService,setEditingService,onStatsChange }) => {
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
                activeServices: services.filter(s => s.status === 'active').length,
                totalBookings: services.reduce((sum, s) => sum + (s.bookings || 0), 0),
                monthlyRevenue: `₹${services.reduce((sum, s) => sum + (s.revenue || 0), 0).toLocaleString()}`
            });
        }
    }, [services]);

    const fetchServices = async () => {
        try {
            const { data } = await serviceAPI.getAll();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services:", error);
        }
    };

    const handleCreateService = async (formDataToSend) => {
        try {
            // serviceAPI.create handles POST /services/create
            const { data: newService } = await serviceAPI.create(formDataToSend);

            setServices((prev) => [...prev, newService]);
            setIsServiceModalOpen(false);
        } catch (error) {
            console.error("Failed to create service:", error);
        }
    };

    const handleUpdateService = async (serviceData) => {
        try {
            // serviceAPI.update handles PUT /services/update/:id
            const { data: updatedService } = await serviceAPI.update(editingService.id, serviceData);

            setServices((prev) =>
                prev.map((s) => (s.id === editingService.id ? updatedService : s))
            );
            setIsServiceModalOpen(false);
            setEditingService(null);
        } catch (error) {
            console.error("Failed to update service:", error);
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
            // 🔑 Only call backend API, it will handle Supabase cleanup
            await serviceAPI.delete(serviceToDelete.id);

            // update local state
            setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
        } catch (err) {
            console.error("Failed to delete service:", err);
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
        <div>
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
                                <button className={styles.viewBtn} onClick={() => handleViewService(service)}>
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
            <VendorServiceDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                service={selectedService}
            />

        </div>
    )
}

export default VendorServices;
