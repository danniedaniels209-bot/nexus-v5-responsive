import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import useAuthStore from '../context/authStore';

// Replicate the guards from App.jsx for isolated testing
import { Navigate } from 'react-router-dom';
import { PageSpinner } from '../components/ui/Spinner';

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

function renderWithRouter(element, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login"    element={<div>Login Page</div>} />
        <Route path="/feed"     element={<div>Feed Page</div>} />
        <Route path="/protected"element={<PrivateRoute><div>Secret Content</div></PrivateRoute>} />
        <Route path="/guest"    element={<GuestRoute><div>Guest Content</div></GuestRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  it('shows spinner while loading', () => {
    useAuthStore.setState({ user: null, token: null, loading: true });
    renderWithRouter(null, '/protected');
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated', () => {
    useAuthStore.setState({ user: null, token: null, loading: false });
    renderWithRouter(null, '/protected');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ user: { id: '1', username: 'alice' }, token: 'tok', loading: false });
    renderWithRouter(null, '/protected');
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });
});

describe('GuestRoute', () => {
  it('renders guest content when not logged in', () => {
    useAuthStore.setState({ user: null, token: null, loading: false });
    renderWithRouter(null, '/guest');
    expect(screen.getByText('Guest Content')).toBeInTheDocument();
  });

  it('redirects to /feed when logged in', () => {
    useAuthStore.setState({ user: { id: '1', username: 'alice' }, token: 'tok', loading: false });
    renderWithRouter(null, '/guest');
    expect(screen.getByText('Feed Page')).toBeInTheDocument();
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
  });
});
