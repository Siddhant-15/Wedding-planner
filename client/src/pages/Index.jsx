import React from "react";
// import Navbar from "../navbar/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ServicesSection from "@/components/ServicesSection";
import VenuesCarousel from "@/components/VenuesCarousel";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import SiteFooter from "@/components/SiteFooter";
import { ToastDemo } from "@/components/ui/ToastDemo";
import { ToastTest } from "@/components/ui/ToastTest";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mangalam Wedding & Event Planners",
  url: "/",
  sameAs: [
    "https://instagram.com/",
    "https://facebook.com/",
    "https://twitter.com/"
  ],
  logo: "/favicon.ico"
};

function Index() {
  return (
    <>
      {/* <Navbar /> */}
      <main>
        <HeroSlider />
        <ServicesSection />
        <VenuesCarousel />
        <Testimonials />
        <BlogSection />
        <ToastTest />
        <ToastDemo />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

export default Index;
