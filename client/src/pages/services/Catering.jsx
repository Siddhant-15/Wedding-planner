import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, MapPin, Users, Star, ChefHat } from "lucide-react";
import Navbar from "@/components/Navbar";
import FilterSidebar from "@/components/FilterSidebar";
import styles from "../../styles/Catering.module.css"
import cateringImage from "@/assets/catering.jpg";

export default function Catering() {
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
          <h1 className={styles.title}>Wedding Catering</h1>
          <p className={styles.subtitle}>
            Delicious cuisine for your special day
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
                Showing 20 of 380 caterers
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={cateringImage}
                      alt={`Catering Service ${i}`}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadge}>
                      <Star size={14} fill="currentColor" />
                      4.{Math.floor(Math.random() * 9) + 1}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>
                      {["Spice", "Royal", "Golden", "Supreme", "Elite", "Premium"][
                        i % 6
                      ]}{" "}
                      Caterers
                    </h3>
                    <div className={styles.cardLocation}>
                      <MapPin size={14} />
                      Mumbai, Maharashtra
                    </div>
                    <div className={styles.cardCapacity}>
                      <Users size={14} />
                      Serves up to {200 + i * 100} guests
                    </div>
                    <div className={styles.cardCapacity}>
                      <ChefHat size={14} />
                      North Indian, South Indian, Continental
                    </div>
                    <p className={styles.cardPrice}>
                      Starting from ₹{600 + i * 100}/plate
                    </p>
                    <Link
                      to={`/services/catering/${i}`}
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
        serviceType="catering"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
