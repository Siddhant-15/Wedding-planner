import React from "react";
import Navbar from "../../../../../../../navbar/components/Navbar";
import HeroSection from "../../components/customer/home/HeroSection";
import CategorySection from "../../components/customer/home/CategorySection";
import ServiceSection from "../../components/customer/home/ServiceSection";
import CTASection from "../../components/customer/home/CTASection";
import {
  fetchFeaturedServices,
  fetchPopularServices,
  fetchRecommendedServices,
} from "../../services/homeApi";
import styles from "./HomePage.module.css";

export default function HomePage({ user }) {
  const city = user?.city || "Jaipur";

  return (
    <div className={styles.page}>
      <Navbar />
      <HeroSection />

      <CategorySection />

      <ServiceSection
        id="featured"
        title="Featured Services"
        subtitle="Hand-picked vendors loved by couples like you"
        fetcher={fetchFeaturedServices}
      />

      <ServiceSection
        id="popular"
        title={`Popular in ${city}`}
        subtitle="Top-rated services trending in your city"
        fetcher={() => fetchPopularServices(city)}
      />

      <ServiceSection
        id="recommended"
        title="Recommended for You"
        subtitle="Personalised picks based on your interests"
        fetcher={fetchRecommendedServices}
      />

      <CTASection />
    </div>
  );
}
