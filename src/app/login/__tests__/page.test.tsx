import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import LoginPage from '../page';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/services/authService';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/services/authService', () => ({
  loginUser: jest.fn()
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn()
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      dispatch: mockDispatch,
      state: { loading: false }
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Enter the Holoverse')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose your username')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockUser = {
      id: '123',
      username: 'testuser',
      holos: 1000,
      dailyEnergy: 100,
      maxEnergy: 100,
      lastEnergyRefresh: Date.now(),
      holobots: [],
      wins: 0,
      losses: 0
    };

    (loginUser as jest.Mock).mockResolvedValueOnce(mockUser);

    render(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose your username');
    const submitButton = screen.getByRole('button', { name: 'Enter' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_START' });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'LOGIN_SUCCESS',
        payload: mockUser
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login failure', async () => {
    const mockError = new Error('Login failed');
    (loginUser as jest.Mock).mockRejectedValueOnce(mockError);

    render(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose your username');
    const submitButton = screen.getByRole('button', { name: 'Enter' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to login. Please try again.')).toBeInTheDocument();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'LOGIN_FAILURE',
        payload: 'Login failed'
      });
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  it('disables form submission while loading', async () => {
    const { rerender } = render(<LoginPage />);
    
    const usernameInput = screen.getByPlaceholderText('Choose your username');
    const submitButton = screen.getByRole('button', { name: 'Enter' });

    // Trigger form submission
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      dispatch: mockDispatch,
      state: { loading: true }
    });

    // Re-render with loading state
    rerender(<LoginPage />);

    const loadingButton = screen.getByRole('button', { name: 'Logging in...' });
    const disabledInput = screen.getByPlaceholderText('Choose your username');

    expect(loadingButton).toBeDisabled();
    expect(disabledInput).toBeDisabled();
  });

  it('requires username input', () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Enter' });
    const usernameInput = screen.getByPlaceholderText('Choose your username') as HTMLInputElement;

    fireEvent.click(submitButton);
    
    expect(usernameInput.validity.valid).toBeFalsy();
    expect(usernameInput.validity.valueMissing).toBeTruthy();
  });
}); 