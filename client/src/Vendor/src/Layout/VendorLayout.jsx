// VendorLayout.jsx
import { Outlet } from "react-router-dom";
import VendorNavbar from "../../../navbar/components/VendorNavbar";

export default function VendorLayout() {
    return (
        <>
            <VendorNavbar />
            <Outlet />
        </>
    );
}