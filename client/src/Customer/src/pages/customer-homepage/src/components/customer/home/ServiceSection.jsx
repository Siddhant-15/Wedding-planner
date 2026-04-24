import React, { useEffect, useState, useCallback } from "react";
import ServiceCard from "./ServiceCard";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import styles from "./ServiceSection.module.css";

export default function ServiceSection({ id, title, subtitle, fetcher }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher();
      setServices(Array.isArray(data) ? data : data?.services || []);
    } catch (err) {
      console.error(`[${id}] failed to load`, err);
      setError("Couldn’t load services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetcher, id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className={styles.wrap} aria-labelledby={`${id}-heading`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h2 id={`${id}-heading`} className={styles.heading}>
              {title}
            </h2>
            {subtitle && <p className={styles.sub}>{subtitle}</p>}
          </div>
        </header>

        {loading && (
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className={styles.state} role="alert">
            <p>{error}</p>
            <button type="button" className={styles.retry} onClick={load}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className={styles.state}>
            <p>No services available right now. Check back soon.</p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className={styles.grid}>
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
