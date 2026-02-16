import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../firebase/auth';

// App.js resolves auth before rendering this, so getCurrentUser() is reliable here.
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!authService.getCurrentUser()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
