import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import useAuthStore from '../context/authStore';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, loading: false, error: null });
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('updates email field on input', async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('you@example.com');
    await userEvent.type(emailInput, 'alice@test.com');
    expect(emailInput).toHaveValue('alice@test.com');
  });

  it('calls login and navigates on successful submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ user: { id: '1' }, token: 'tok' });
    useAuthStore.setState({ login: mockLogin });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@test.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/feed');
    });
  });

  it('does not navigate on login failure', async () => {
    const mockLogin = vi.fn().mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    useAuthStore.setState({ login: mockLogin });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'bad@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('shows link to register page', () => {
    renderLogin();
    expect(screen.getByText(/create one free/i)).toBeInTheDocument();
  });
});
