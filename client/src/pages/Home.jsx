import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

export default function Home() {
  const { user } = useAuthStore();
  return <Navigate to={user ? '/feed' : '/'} replace />;
}
