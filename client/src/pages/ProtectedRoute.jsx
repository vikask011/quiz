import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner

  if (!token) {
    return <Navigate to="/user/auth" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;
