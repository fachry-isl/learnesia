import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = () => {
  const { accessToken } = useAuth();
  const adminPath = import.meta.env.VITE_ADMIN_PATH || "/admin";

  return accessToken ? (
    <Outlet />
  ) : (
    <Navigate to={`${adminPath}/login`} replace />
  );
};

export default ProtectedRoute;
