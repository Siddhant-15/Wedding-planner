// VendorLayout.jsx
import { Outlet } from "react-router-dom";
import VendorNavbar from "../../../navbar/components/VendorNavbar";
import VendorSidebar from "../components/vendor/VendorSidebar";
import styles from "./VendorLayout.module.css";

export default function VendorLayout() {
  return (
    <>
      <VendorNavbar />
      <div className={styles.shell}>
        {/* <VendorSidebar /> */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}