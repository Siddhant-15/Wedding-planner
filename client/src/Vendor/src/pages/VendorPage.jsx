import React from "react";
import { useLocation } from "react-router-dom";
import VendorServices from "./VendorServices";

const VendorPage = () => {
  const location = useLocation();
  const path = location.pathname;

  switch (path) {
    case "/vendor/dashboard":
      return <VendorServices />;

    default:
      return <div>Page not found</div>;
  }
};

export default VendorPage;
