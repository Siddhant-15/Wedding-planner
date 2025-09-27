// pages/vendor/VendorPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import VendorDashboard from "../dashboards/VendorDashboard";
import VendorMyServices from "./VendorMyServices";
import VendorAnalytics from "./VendorAnalytics";

const VendorPage = () => {
  const location = useLocation();
  const path = location.pathname;

  switch (path) {
    case "/vendor/dashboard":
      return <VendorDashboard />;
    case "/vendor/my-services":
      return <VendorMyServices />;
    case "/vendor/analytics":
      return <VendorAnalytics/>
    // add more vendor pages here as needed
    default:
      return <div>Page not found</div>;
  }
};

export default VendorPage;
