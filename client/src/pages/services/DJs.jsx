import React, { useState } from 'react';
import { Filter, MapPin, Music, Star, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import styles from "../../styles/ServicePage.module.css"
import djImage from '@/assets/dj.jpg';

export default function DJs() {
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
          <h1 className={styles.title}>Wedding DJs</h1>
          <p className={styles.subtitle}>Find the perfect DJ to keep your celebration alive</p>
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
              <span className={styles.resultsCount}>Showing 18 of 305 DJs</span>
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <div key={i} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img 
                      src={djImage}
                      alt={`DJ Service ${i}`}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadge}>
                      <Star size={14} fill="currentColor" />
                      4.{Math.floor(Math.random() * 9) + 1}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>DJ {['Arjun', 'Rohit', 'Karan', 'Sameer', 'Vikram', 'Aditya'][i % 6]} {i}</h3>
                    <div className={styles.cardLocation}>
                      <MapPin size={14} />
                      Mumbai, Maharashtra
                    </div>
                    <div className={styles.cardCapacity}>
                      <Clock size={14} />
                      {2 + (i % 8)} years experience
                    </div>
                    <div className={styles.cardCapacity}>
                      <Music size={14} />
                      Bollywood, Punjabi, Western
                    </div>
                    <p className={styles.cardPrice}>Starting from ₹{(15 + i * 5).toFixed(0)}K</p>
                    <button className={styles.cardButton}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterSidebar 
        serviceType="djs"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
