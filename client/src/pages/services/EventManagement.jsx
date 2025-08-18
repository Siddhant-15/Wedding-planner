import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, MapPin, Users, Star, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import styles from "../../styles/EventManagement.module.css";
import managementImage from "@/assets/event-management.jpg";

export default function EventManagement() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("popularity");

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.pageWrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Event Management</h1>
          <p className={styles.subtitle}>
            Complete event planning and management services
          </p>
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
                Showing 15 of 220 companies
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
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={managementImage}
                      alt={`Event Management Service ${i}`}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadge}>
                      <Star size={14} fill="currentColor" />
                      4.{Math.floor(Math.random() * 9) + 1}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {["Dream", "Elite", "Royal", "Perfect", "Grand", "Luxury"][
                        i % 6
                      ]}{" "}
                      Events {i}
                    </h3>
                    <div className={styles.cardLocation}>
                      <MapPin size={14} />
                      Mumbai, Maharashtra
                    </div>
                    <div className={styles.cardCapacity}>
                      <Users size={14} />
                      Team of {5 + i * 2} professionals
                    </div>
                    <div className={styles.cardCapacity}>
                      <Calendar size={14} />
                      {100 + i * 50}+ events completed
                    </div>
                    <p className={styles.cardPrice}>
                      Starting from ₹{(40 + i * 10).toFixed(0)}K
                    </p>
                    <Link
                      to={`/services/management/${i}`}
                      className={styles.cardButton}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterSidebar
        serviceType="management"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
