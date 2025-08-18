import React, { useState } from 'react';
import { Filter, MapPin, Camera, Star, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import styles from "../../styles/ServicePage.module.css"
import photographyImage from '@/assets/photo.jpg';

export default function Photography() {
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
          <h1 className={styles.title}>Wedding Photography</h1>
          <p className={styles.subtitle}>Capture your precious moments forever</p>
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
              <span className={styles.resultsCount}>Showing 16 of 280 photographers</span>
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img 
                      src={photographyImage}
                      alt={`Photography Service ${i}`}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadge}>
                      <Star size={14} fill="currentColor" />
                      4.{Math.floor(Math.random() * 9) + 1}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{['Lens', 'Frame', 'Capture', 'Focus', 'Shutter', 'Vision'][i % 6]} Studios</h3>
                    <div className={styles.cardLocation}>
                      <MapPin size={14} />
                      Mumbai, Maharashtra
                    </div>
                    <div className={styles.cardCapacity}>
                      <Camera size={14} />
                      Traditional, Candid, Cinematic
                    </div>
                    <div className={styles.cardCapacity}>
                      <Award size={14} />
                      {2 + i} years experience
                    </div>
                    <p className={styles.cardPrice}>Starting from ₹{(50 + i * 15).toFixed(0)}K</p>
                    <button className={styles.cardButton}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterSidebar 
        serviceType="photography"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
