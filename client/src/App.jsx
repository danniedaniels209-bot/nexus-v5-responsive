import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './context/authStore';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { PageSpinner } from './components/ui/Spinner';

// ── Eager-loaded core pages ───────────────────────────────────────────────────
import Landing  from './pages/Landing';
import Login    from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// ── Lazy-loaded feature pages ─────────────────────────────────────────────────
const Feed       = lazy(() => import('./pages/Feed'));
const Explore    = lazy(() => import('./pages/Explore'));
const Chat       = lazy(() => import('./pages/Chat'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Profile    = lazy(() => import('./pages/Profile'));
const Settings   = lazy(() => import('./pages/Settings'));
const Home       = lazy(() => import('./pages/Home'));

// ── Route guards ──────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <PageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <PageSpinner />;
  return !user ? children : <Navigate to="/feed" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { init, logout } = useAuthStore();

  useEffect(() => {
    init();
    // Listen for forced logout dispatched by axios interceptor on refresh failure
    const handleLogout = () => logout();
    window.addEventListener('nexus:logout', handleLogout);
    return () => window.removeEventListener('nexus:logout', handleLogout);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <SocketProvider>
        <ErrorBoundary>
          <div className="relative min-h-screen bg-void">
            <Navbar />
            <BottomNav />

            <Suspense fallback={<PageSpinner />}>
              <Routes>
                {/* Public */}
                <Route path="/"        element={<GuestRoute><Landing /></GuestRoute>} />
                <Route path="/login"   element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register"element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/posts/:id"element={<PostDetail />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/home"    element={<Home />} />

                {/* Protected */}
                <Route path="/feed"    element={<PrivateRoute><Feed /></PrivateRoute>} />
                <Route path="/chat"    element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/create"  element={<PrivateRoute><CreatePost /></PrivateRoute>} />
                <Route path="/settings"element={<PrivateRoute><Settings /></PrivateRoute>} />

                <Route path="*"        element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </ErrorBoundary>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(17,24,39,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#E5E7EB',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#0B0B0F' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#0B0B0F' } },
          }}
        />
      </SocketProvider>
    </BrowserRouter>
  );
}
