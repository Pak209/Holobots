'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { loginUser } from '@/services/authService';
import Loading from '@/components/Loading';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { state, dispatch } = useAuth();

  // Check if already logged in
  useEffect(() => {
    const authState = localStorage.getItem('AUTH_STATE');
    if (authState) {
      const auth = JSON.parse(authState);
      if (auth.isLoggedIn) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: auth.userData });
        router.push('/dashboard');
      }
    }
  }, [dispatch, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (!username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_-]*$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setLoading(true);

    try {
      dispatch({ type: 'LOGIN_START' });
      const userData = await loginUser({ username, password });
      
      // Save auth state in localStorage
      localStorage.setItem('AUTH_STATE', JSON.stringify({
        isLoggedIn: true,
        userData: userData
      }));

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      
      // Initialize user stats if first login
      const existingStats = localStorage.getItem('USER_STATS');
      if (!existingStats) {
        const initialStats = {
          username: username,
          wins: 0,
          losses: 0,
          energy: 100,
          maxEnergy: 100,
          lastEnergyRefresh: Date.now()
        };
        localStorage.setItem('USER_STATS', JSON.stringify(initialStats));
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] font-['Press_Start_2P'] text-white flex justify-center items-center p-4">
      {loading && <Loading />}
      
      <div className="bg-black/70 border-2 border-[#4a90e2] p-8 text-center max-w-[400px] w-full animate-fadeIn">
        <h1 className="text-[#4a90e2] text-2xl mb-8 animate-pulse">HOLOBOTS</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label htmlFor="username" className="block text-xs mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full p-3 bg-[#222] border-2 border-[#4a90e2] text-white font-['Press_Start_2P'] text-xs
                       focus:outline-none focus:border-[#6ba7e9] transition-colors"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]*"
              disabled={loading}
            />
          </div>

          <div className="text-left">
            <label htmlFor="password" className="block text-xs mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full p-3 bg-[#222] border-2 border-[#4a90e2] text-white font-['Press_Start_2P'] text-xs
                       focus:outline-none focus:border-[#6ba7e9] transition-colors"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-[#ff4444] text-xs animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#222] text-white border-2 border-[#4a90e2] px-8 py-4 text-sm uppercase
                     cursor-pointer transition-all hover:bg-[#4a90e2] hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 
