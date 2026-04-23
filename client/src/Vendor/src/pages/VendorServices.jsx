import { useMemo, useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import styles from "../styles/VendorServices.module.css";
import VendorServiceCard from "../components/vendor/VendorServiceCard";
import VendorServiceDetailsModal from "../components/vendor/VendorServiceDetailsModal";
import ServiceFormModal from "../components/vendor/ServiceFormModal";
import ConfirmModal from "../components/vendor/ConfirmModal";
// import { mockVendorServices } from "../data/vendorMockData";
import { serviceService } from "../../../utils/api/services/service.service";
import Navbar from "../../../components/Navbar";
import ServiceStats from "../../../components/VendorServiceStats";
import { buildServiceFormData } from "../utils/buildServiceFormData";
import { normalizeService } from "../utils/normalizeService";

export default function VendorServices() {
  const [services, setServices] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    monthlyRevenue: '₹0'
  });

  // const normalizeService = (s) => ({
  //   id: s.id,
  //   service_name: s.service_name,
  //   service_type: s.service_type,
  //   city: s.city,
  //   state: s.state,
  //   is_active: s.is_active,
  //   rating: s.rating,

  //   // ✅ FIX IMAGES
  //   media: s.media?.map((m) => m.media_url) || [],

  //   // ✅ FIX AMENITIES
  //   amenities: s.metadata?.amenities || [],

  //   // ✅ FIX PRICING
  //   pricing: getPricing(s),

  //   // keep raw if needed later
  //   raw: s,
  // });



  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await serviceService.getAll();
      setServices(data.map(normalizeService));
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  useEffect(() => {
    setStats({
      totalServices: services.length,
      activeServices: services.filter((s) => s.is_active).length,
      totalBookings: services.reduce((sum, s) => sum + (s.bookings || 0), 0),
      monthlyRevenue: "₹0", // update later from API if available
    });
  }, [services]);

  const handleView = (s) => {
    setDetail(s.raw); // pass full API data
    setDetailOpen(true);
  };

  const handleEdit = (s) => {
    const raw = s.raw;

    const formatted = {
      id: raw.id,

      // ✅ MOST IMPORTANT (form depends on this)
      service_type: raw.service_type,

      // ✅ BASIC INFO
      title: raw.service_name,
      description: raw.description || "",

      // ✅ LOCATION
      address_line1: raw.add_line1 || "",
      address_line2: raw.add_line2 || "",
      area: raw.area || "",
      city: raw.city || "",
      state: raw.state || "",
      country: raw.country || "India",
      pincode: raw.pincode || "",

      geo_point: {
        lat: raw.latitude || "",
        lon: raw.longitude || "",
      },

      // ✅ TAGS / AMENITIES
      tags: raw.metadata?.tags || [],
      amenities: raw.metadata?.amenities || [],

      // ✅ 🔥 VARIANTS (FIXED FOR YOUR API)
      variants: (raw.variants || []).map((v, i) => ({
        id: v.id || `${raw.id}-${i}`,
        variant_name: v.variant_name || "",
        is_default: v.is_default ?? i === 0,

        pricing_type: v.pricing_type || "",

        // 👇 IMPORTANT: match API structure
        veg_price: v.pricing?.veg_price ?? "",
        non_veg_price: v.pricing?.non_veg_price ?? "",
        price: v.pricing?.base_price ?? "",

        inclusions: v.inclusions || [],
      })),

      // ✅ IMAGES (VERY IMPORTANT FIX)
      images: raw.media?.map((m) => m.media_url) || [],
    };

    console.log("EDIT FORM DATA:", formatted); // 🔍 debug

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

  const handleSubmit = async (data) => {
    try {
      const formData = buildServiceFormData(data);

      if (editing) {
        const { data: updated } = await serviceService.update(
          editing.id,
          formData
        );

        setServices((prev) =>
          prev.map((s) =>
            s.id === editing.id ? normalizeService(updated) : s
          )
        );
      } else {
        const { data: created } = await serviceService.create(formData);

        setServices((prev) => [
          ...prev,
          normalizeService(created),
        ]);
      }

      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Navbar />
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Vendor Dashboard</h1>
            <p className={styles.subtitle}>Manage your services and track your business growth</p>
          </div>
          <button className={styles.addBtn} onClick={openCreate}>
            <Plus size={16} /> Add Service
          </button>
        </header>

        <ServiceStats stats={stats} />

        {services.length > 0 ? (
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
        onClose={() => setFormOpen(false)}
        initialData={editing}
        onSubmit={handleSubmit}
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
