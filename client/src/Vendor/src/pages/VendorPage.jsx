// pages/vendor/VendorPage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
// import VendorDashboard from "../dashboards/VendorDashboard";
// import VendorMyServices from "./VendorMyServices";
// import VendorAnalytics from "./VendorAnalytics";
// import VendorOnboarding from "./VendorOnboarding";
import VendorServices from "./VendorServices";

const VendorPage = () => {
  const location = useLocation();
  const path = location.pathname;

  switch (path) {
    case "/vendor/dashboard":
      return <VendorServices />;
    // case "/vendor/my-services":
    //   return <VendorMyServices />;
    // case "/vendor/analytics":
    //   return <VendorAnalytics />
    // case "/vendor/onboarding":
    //   return <VendorOnboarding />
    // add more vendor pages here as needed
    default:
      return <div>Page not found</div>;
  }
};

export default VendorPage;
