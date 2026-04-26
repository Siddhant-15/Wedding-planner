// CustomerLayout.jsx
import { Outlet } from "react-router-dom";
import { WishlistProvider } from "../../../Wishlist/src/context/WishlistContext";
import CustomerNavbar from "../../../navbar/components/CustomerNavbar";

export default function CustomerLayout() {
    return (
        <WishlistProvider>
            <CustomerNavbar />
            <Outlet />
        </WishlistProvider>
    );
}