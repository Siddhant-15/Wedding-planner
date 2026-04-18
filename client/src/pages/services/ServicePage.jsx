import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import { customerService } from "../../utils/api/services/customer.service";
import styles from "../../styles/ServicePage.module.css";
import ServiceCard from "./ServiceCard";

// ✅ Reusable Page
export default function ServicesPage({
  serviceType,
  title,
  subtitle,
  showCapacity = false,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("popularity");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await customerService.getByType(serviceType, {
        skip: (page - 1) * limit,
        limit,
        ...filters,
      });
      const data = Array.isArray(response.data?.services)
        ? response.data.services
        : [];
      setServices(data);
      setTotalCount(response.data?.total_count || data.length);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters, sortBy, page]);

  const getSortedServices = () => {
    if (!Array.isArray(services)) return [];
    let sortedServices = [...services];
    switch (sortBy) {
      case "price-low":
        return sortedServices.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return sortedServices.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rating":
        return sortedServices.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
        return sortedServices.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      default:
        return sortedServices;
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.contentWithFilters}>
          <div className={styles.mainContent}>
            <button
              className={styles.filterToggle}
              onClick={() => setFiltersOpen(true)}
            >
              <Filter size={18} />
              Filters
            </button>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                {loading
                  ? "Loading..."
                  : `Showing ${services.length} of ${totalCount} results`}
              </span>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            <div className={styles.grid}>
              {loading ? (
                <p>Loading...</p>
              ) : services.length === 0 ? (
                <p>No services found.</p>
              ) : (
                getSortedServices().map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showCapacity={showCapacity}
                  />
                ))
              )}
            </div>
            {!loading && services.length > 0 && (
              <div className={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {Math.ceil(totalCount / limit) || 1}
                </span>
                <button
                  disabled={page >= Math.ceil(totalCount / limit)}
                  onClick={() => setPage((prev) => prev + 1)}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <FilterSidebar
        serviceType={serviceType}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
