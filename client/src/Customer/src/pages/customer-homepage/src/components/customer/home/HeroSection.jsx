import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HeroSection.module.css";

const SERVICE_TYPES = [
  { value: "", label: "All Services" },
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "decoration", label: "Decoration" },
  { value: "dj", label: "DJ / Music" },
  { value: "event_planner", label: "Event Planner" },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("city", location.trim());
    if (type) params.set("type", type);
    if (date) params.set("date", date);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.overlay} />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.title}>Plan Your Perfect Event</h1>
          <p className={styles.subtitle}>
            Book venues, catering, photographers & more — all in one place.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => navigate("/services")}
            >
              Explore Services
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => navigate("/bookings")}
            >
              View My Bookings
            </button>
          </div>
        </div>

        <form
          className={styles.searchBar}
          onSubmit={handleSearch}
          role="search"
          aria-label="Search services"
        >
          <div className={styles.field}>
            <label htmlFor="hero-loc">Location</label>
            <input
              id="hero-loc"
              type="text"
              placeholder="City or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.field}>
            <label htmlFor="hero-type">Service</label>
            <select
              id="hero-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.field}>
            <label htmlFor="hero-date">Date</label>
            <input
              id="hero-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
