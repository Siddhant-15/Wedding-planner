import React, { useState } from "react";
import { ChevronDown, ChevronUp, Filter, X, MapPin, IndianRupee } from "lucide-react";
import styles from "../styles/FilterSidebar.module.css"

const locationOptions = {
  countries: [
    { id: "india", label: "India", count: 1250 },
    { id: "usa", label: "USA", count: 45 },
    { id: "uk", label: "UK", count: 32 },
  ],
  states: [
    { id: "maharashtra", label: "Maharashtra", count: 450 },
    { id: "delhi", label: "Delhi", count: 320 },
    { id: "gujarat", label: "Gujarat", count: 280 },
    { id: "rajasthan", label: "Rajasthan", count: 220 },
    { id: "karnataka", label: "Karnataka", count: 180 },
  ],
  cities: [
    { id: "mumbai", label: "Mumbai", count: 250 },
    { id: "delhi", label: "Delhi", count: 200 },
    { id: "bangalore", label: "Bangalore", count: 150 },
    { id: "pune", label: "Pune", count: 120 },
    { id: "ahmedabad", label: "Ahmedabad", count: 100 },
  ],
};

const serviceSpecificFilters = {
  venues: {
    capacity: [
      { id: "0-100", label: "0-100 guests", count: 120 },
      { id: "100-300", label: "100-300 guests", count: 280 },
      { id: "300-500", label: "300-500 guests", count: 150 },
      { id: "500+", label: "500+ guests", count: 80 },
    ],
    venueType: [
      { id: "banquet", label: "Banquet Hall", count: 200 },
      { id: "resort", label: "Resort", count: 120 },
      { id: "hotel", label: "Hotel", count: 180 },
      { id: "farmhouse", label: "Farmhouse", count: 90 },
      { id: "palace", label: "Palace", count: 40 },
    ],
    amenities: [
      { id: "parking", label: "Parking", count: 450 },
      { id: "ac", label: "Air Conditioning", count: 380 },
      { id: "decoration", label: "Decoration Services", count: 320 },
      { id: "catering", label: "In-house Catering", count: 280 },
    ],
  },
  djs: {
    experience: [
      { id: "0-2", label: "0-2 years", count: 45 },
      { id: "2-5", label: "2-5 years", count: 120 },
      { id: "5-10", label: "5-10 years", count: 80 },
      { id: "10+", label: "10+ years", count: 60 },
    ],
    musicType: [
      { id: "bollywood", label: "Bollywood", count: 200 },
      { id: "punjabi", label: "Punjabi", count: 150 },
      { id: "western", label: "Western", count: 120 },
      { id: "classical", label: "Classical", count: 80 },
    ],
  },
  catering: {
    cuisine: [
      { id: "north-indian", label: "North Indian", count: 180 },
      { id: "south-indian", label: "South Indian", count: 150 },
      { id: "gujarati", label: "Gujarati", count: 120 },
      { id: "punjabi", label: "Punjabi", count: 100 },
      { id: "continental", label: "Continental", count: 90 },
    ],
    mealType: [
      { id: "veg", label: "Vegetarian", count: 250 },
      { id: "non-veg", label: "Non-Vegetarian", count: 200 },
      { id: "jain", label: "Jain", count: 80 },
      { id: "vegan", label: "Vegan", count: 45 },
    ],
  },
  photography: {
    style: [
      { id: "traditional", label: "Traditional", count: 120 },
      { id: "candid", label: "Candid", count: 180 },
      { id: "cinematic", label: "Cinematic", count: 150 },
      { id: "contemporary", label: "Contemporary", count: 100 },
    ],
    services: [
      { id: "pre-wedding", label: "Pre-wedding Shoot", count: 200 },
      { id: "ceremony", label: "Wedding Ceremony", count: 280 },
      { id: "reception", label: "Reception", count: 250 },
      { id: "albums", label: "Photo Albums", count: 180 },
    ],
  },
  management: {
    serviceType: [
      { id: "full-planning", label: "Full Wedding Planning", count: 80 },
      { id: "partial-planning", label: "Partial Planning", count: 120 },
      { id: "day-coordination", label: "Day Coordination", count: 100 },
      { id: "destination", label: "Destination Weddings", count: 60 },
    ],
    teamSize: [
      { id: "1-5", label: "1-5 members", count: 100 },
      { id: "5-10", label: "5-10 members", count: 80 },
      { id: "10+", label: "10+ members", count: 40 },
    ],
  },
};

export default function FilterSidebar({ serviceType, isOpen, onClose, onFiltersChange }) {
  const [openSections, setOpenSections] = useState(["price", "location"]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleFilterChange = (category, value, checked) => {
    const newFilters = { ...selectedFilters };
    if (!newFilters[category]) newFilters[category] = [];

    if (checked) {
      newFilters[category] = [...newFilters[category], value];
    } else {
      newFilters[category] = newFilters[category].filter((v) => v !== value);
    }

    setSelectedFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setPriceRange({ min: "", max: "" });
    onFiltersChange({});
  };

  const FilterSection = ({ title, options, category }) => (
    <div className={styles.filterSection}>
      <button className={styles.sectionHeader} onClick={() => toggleSection(category)}>
        <span>{title}</span>
        {openSections.includes(category) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {openSections.includes(category) && (
        <div className={styles.sectionContent}>
          {options.map((option) => (
            <label key={option.id} className={styles.filterOption}>
              <input
                type="checkbox"
                checked={selectedFilters[category]?.includes(option.id) || false}
                onChange={(e) => handleFilterChange(category, option.id, e.target.checked)}
              />
              <span className={styles.optionLabel}>
                {option.label}
                {option.count && <span className={styles.count}>({option.count})</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`${styles.backdrop} ${isOpen ? styles.backdropShow : ""}`} onClick={onClose} />
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Filter size={20} />
            <span>Filters</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Price Range */}
          <div className={styles.filterSection}>
            <button className={styles.sectionHeader} onClick={() => toggleSection("price")}>
              <span>
                <IndianRupee size={16} className={styles.icon} />
                Price Range
              </span>
              {openSections.includes("price") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.includes("price") && (
              <div className={styles.priceRange}>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className={styles.priceInput}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className={styles.priceInput}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className={styles.filterSection}>
            <button className={styles.sectionHeader} onClick={() => toggleSection("location")}>
              <span>
                <MapPin size={16} className={styles.icon} />
                Location
              </span>
              {openSections.includes("location") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {openSections.includes("location") && (
              <div className={styles.sectionContent}>
                <FilterSection title="Country" options={locationOptions.countries} category="country" />
                <FilterSection title="State" options={locationOptions.states} category="state" />
                <FilterSection title="City" options={locationOptions.cities} category="city" />
              </div>
            )}
          </div>

          {/* Service-specific filters */}
          {serviceSpecificFilters[serviceType] &&
            Object.entries(serviceSpecificFilters[serviceType]).map(([key, options]) => (
              <FilterSection
                key={key}
                title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                options={options}
                category={key}
              />
            ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.clearBtn} onClick={clearAllFilters}>
            Clear All
          </button>
          <button className={styles.applyBtn} onClick={onClose}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
