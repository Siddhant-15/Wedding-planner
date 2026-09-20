import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import styles from "../styles/VendorServices.module.css";
import VendorServiceCard from "../components/vendor/VendorServiceCard";
import VendorServiceDetailsModal from "../components/vendor/VendorServiceDetailsModal";
import ServiceFormModal from "../components/vendor/ServiceFormModal";
import ConfirmModal from "../components/vendor/ConfirmModal";
import { serviceService } from "../../../utils/api/services/service.service";
import ServiceStats from "../../../components/VendorServiceStats";
import { buildServiceFormData } from "../utils/buildServiceFormData";
import { normalizeService } from "../utils/normalizeService";
import { apiServiceToFormData } from "../utils/apiServiceToFormData";

function ServiceCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />

      <div className={styles.skeletonBody}>
        <div className={styles.skeletonRow}>
          <div className={styles.skeletonTag} />
          <div className={styles.skeletonRating} />
        </div>

        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonLocation} />

        <div className={styles.skeletonPrice} />

        <div className={styles.skeletonChips}>
          <div />
          <div />
          <div />
        </div>

        <div className={styles.skeletonActions}>
          <div />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
}

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: "₹0",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);

      const { data } = await serviceService.getAll();

      const normalized = data
        .map(normalizeService)
        .filter((service) => service.status !== "rejected");

      setServices(normalized);

      return normalized;
    } catch (error) {
      console.error("Failed to fetch services:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStats({
      totalServices: services.length,
      activeServices: services.filter((s) => s.is_active).length,
      totalBookings: services.reduce((sum, s) => sum + (s.bookings || 0), 0),
      monthlyRevenue: "₹0",
    });
  }, [services]);

  const handleView = (s) => {
    setDetail(s.raw);
    setDetailOpen(true);
  };

  const handleEdit = (service) => {
    const status = (service?.status || service?.raw?.status || "").toLowerCase();
    if (status !== "live" && status !== "needs_revision" && status !== "draft") {
      return;
    }
    const formatted = apiServiceToFormData(service.raw);
    setEditing(formatted);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    try {
      await serviceService.delete(deleteId);
      setServices((prev) => prev.filter((s) => s.id !== deleteId));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteId(null);
    }
  };

  /** Submit / resubmit for review — full validation already done in the form */
  const handleSubmit = async (data) => {
    const formData = buildServiceFormData(data, { saveAsDraft: false });

    if (editing?.id) {
      await serviceService.update(editing.id, formData);
    } else {
      await serviceService.create(formData);
    }

    await fetchServices();
    setFormOpen(false);
    setEditing(null);
  };

  /** Save incomplete service as draft — permissive validation already done in the form */
  const handleSaveDraft = async (data) => {
    const formData = buildServiceFormData(data, { saveAsDraft: true });

    if (editing?.id) {
      await serviceService.update(editing.id, formData);
    } else {
      await serviceService.create(formData);
    }

    // Refresh list so cards show draft status; keep modal open so vendor can continue
    const refreshed = await fetchServices();

    // Re-bind editing to the latest API shape (media IDs after first create/update)
    if (editing?.id && refreshed) {
      const match = refreshed.find((s) => s.id === editing.id);
      if (match?.raw) {
        setEditing(apiServiceToFormData(match.raw));
      }
    } else if (!editing?.id && refreshed?.length) {
      // Newly created draft — pick the most recent matching title if possible
      const created = refreshed[0];
      if (created?.raw) {
        setEditing(apiServiceToFormData(created.raw));
      }
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Vendor Dashboard</h1>
            <p className={styles.subtitle}>
              Manage your services and track your business growth
            </p>
          </div>
          <button className={styles.addBtn} onClick={openCreate}>
            <Plus size={16} /> Add Service
          </button>
        </header>

        <ServiceStats stats={stats} />

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className={styles.grid}>
            {services.map((s) => (
              <VendorServiceCard
                key={s.id}
                service={s}
                onView={() => handleView(s)}
                onEdit={() => handleEdit(s)}
                onDelete={() => setDeleteId(s.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Calendar size={44} strokeWidth={1.2} />
            <h3>No services yet</h3>
            <p>Create your first service to start receiving bookings.</p>
            <button className={styles.addBtn} onClick={openCreate}>
              <Plus size={16} /> Add Your First Service
            </button>
          </div>
        )}
      </div>

      <ServiceFormModal
        isOpen={formOpen}
        onClose={handleCloseForm}
        initialData={editing}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
      />

      <VendorServiceDetailsModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        service={detail}
      />

      <ConfirmModal
        open={!!deleteId}
        title="Delete this service?"
        message="This action cannot be undone. The service will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}