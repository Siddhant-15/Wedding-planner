import React, { useState } from 'react';
import { Filter, MapPin, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import styles from "../../styles/WeddingVenues.module.css"
import venue1 from '@/assets/venue-1.jpg';
import venue2 from '@/assets/venue-2.jpg';
import venue3 from '@/assets/venue-3.jpg';
import venue4 from '@/assets/venue-4.jpg';
import venue5 from '@/assets/venue-5.jpg';
import venue6 from '@/assets/venue-6.jpg';

const venueImages = [venue1, venue2, venue3, venue4, venue5, venue6];

export default function WeddingVenues() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('popularity');

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.pageWrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Wedding Venues</h1>
          <p className={styles.subtitle}>Discover the perfect venue for your dream wedding</p>
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
              <span className={styles.resultsCount}>Showing 24 of 450 venues</span>
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <div key={i} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img 
                      src={venueImages[(i - 1) % venueImages.length]}
                      alt={`Wedding Venue ${i}`}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadge}>
                      <Star size={14} fill="currentColor" />
                      4.{Math.floor(Math.random() * 9) + 1}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>Elegant Wedding Venue {i}</h3>
                    <div className={styles.cardLocation}>
                      <MapPin size={14} />
                      Mumbai, Maharashtra
                    </div>
                    <div className={styles.cardCapacity}>
                      <Users size={14} />
                      Up to {100 + i * 50} guests
                    </div>
                    <p className={styles.cardPrice}>Starting from ₹{(2 + i * 0.5).toFixed(1)}L</p>
                    <button className={styles.cardButton}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterSidebar 
        serviceType="venues"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
