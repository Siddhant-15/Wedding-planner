import React, { useEffect, useMemo, useState } from "react";
import { Loader2, AlertTriangle, Frown } from "lucide-react";
import ServiceCard from "../../components/customer/cards/ServiceCard";
import FilterSidebar from "../../components/customer/cards/FilterSidebar";
// import { fetchServices } from "../../utils/customerMockData";
import { customerService } from "../../../../utils/api/services/customer.service";
import { getStartingPrice } from "../../utils/format";
import styles from "../../styles/ServicesListing.module.css"
// import Navbar from "../../../../navbar/components/Navbar";

const SERVICE_LABELS = {
  venue: "Wedding Venues",
  catering: "Caterers",
  photography: "Photographers",
  dj: "DJs",
  makeup_artist: "Makeup Artists",
  event_management: "Event Planners",
};


export default function ServicesListing({ serviceType = "" }) {
  const initialFilters = { search: "", serviceType: serviceType, city: "", maxPrice: "", verifiedOnly: false };
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState("recommended");
  const [wishlist, setWishlist] = useState(new Set());
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    if (serviceType) {
      setFilters((prev) => ({
        ...prev,
        serviceType,
      }));
    }
  }, [serviceType]);

  useEffect(() => {
    let cancelled = false;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        let res;

        if (serviceType) {
          // 👇 call type-based endpoint (BEST)
          res = await customerService.getByType(serviceType, {
            city: filters.city || undefined,
            max_price: filters.maxPrice || undefined,
            verified: filters.verifiedOnly || undefined,
            search: filters.search || undefined,
          });
        } else {
          // 👇 fallback if no type (optional)
          res = await customerService.getByType("all");
        }

        if (!cancelled) {
          setServices(res?.data?.services || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load services");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [serviceType, debouncedFilters]);

  const cities = useMemo(
    () => Array.from(new Set(services.map((s) => s.city).filter(Boolean))).sort(),
    [services]
  );

  const filtered = useMemo(() => {
    let list = [...services];

    if (sortBy === "price_asc")
      list.sort((a, b) => (getStartingPrice(a) ?? Infinity) - (getStartingPrice(b) ?? Infinity));

    if (sortBy === "price_desc")
      list.sort((a, b) => (getStartingPrice(b) ?? -Infinity) - (getStartingPrice(a) ?? -Infinity));

    if (sortBy === "rating")
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (sortBy === "name")
      list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [services, sortBy]);

  const toggleWishlist = (svc) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(svc.id) ? next.delete(svc.id) : next.add(svc.id);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* <Navbar /> */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            Discover {SERVICE_LABELS[serviceType] || "Wedding Services"}
          </h1>
          <p className={styles.subtitle}>Curated {serviceType} & more</p>
        </header>

        <div className={styles.layout}>
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                ...initialFilters,
                serviceType,
              })
            }
            cities={cities}
            lockServiceType={!!serviceType} // 👈 THIS LINE
          />

          <main className={styles.main}>
            <div className={styles.toolbar}>
              <span className={styles.count}>
                {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
              </span>
              <div className={styles.sortWrap}>
                <label htmlFor="sort">Sort by</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.select}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top rated</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className={styles.stateWrap}><Loader2 className={styles.spinner} size={26} /> Loading…</div>
            ) : error ? (
              <div className={styles.stateWrap}><AlertTriangle size={24} /> {error}</div>
            ) : filtered.length === 0 ? (
              <div className={styles.stateWrap}>
                <Frown size={28} />
                <p>No services match your filters.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    isWishlisted={wishlist.has(svc.id)}
                    onWishlistToggle={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
