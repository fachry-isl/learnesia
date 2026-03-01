import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = () => {
  const { accessToken } = useAuth();
  return accessToken ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
