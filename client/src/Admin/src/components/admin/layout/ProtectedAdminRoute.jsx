import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { ready, isAuthed, user, token } = useAdminAuth();
  const location = useLocation();
  if (!ready) return null;
  if (!isAuthed) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return children;
}
