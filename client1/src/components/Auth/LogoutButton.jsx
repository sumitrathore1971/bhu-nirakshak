import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LogoutButton({ className = '' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <button onClick={onLogout} className={`px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${className}`}>Logout</button>
  );
}
