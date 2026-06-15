import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return <Navigate to="/" replace />;
    
    const parsed = JSON.parse(raw);
    const role = (parsed?.roleCode || parsed?.roleName || '').toUpperCase();
    
    if (role.includes('ADMIN')) {
      return <Outlet />;
    }
  } catch (err) {
    // ignore
  }

  // Se não for admin, volta pra tela inicial (home)
  return <Navigate to="/home" replace />;
}
