import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './userContext';

const ProtectedRoute = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login"/>;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;