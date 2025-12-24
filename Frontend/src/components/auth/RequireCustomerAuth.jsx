import { Navigate, useLocation } from "react-router-dom";

const RequireCustomerAuth = ({ children }) => {
  const location = useLocation();

  // v1: simple gate. Later we’ll swap to real JWT validation.
  const token = localStorage.getItem("elx_customer_token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireCustomerAuth;
