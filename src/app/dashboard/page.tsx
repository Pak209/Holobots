'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { checkEnergyAndRefresh } from '@/services/authService';
import Loading from '@/components/Loading';

export default function DashboardPage() {
  const router = useRouter();
  const { state, dispatch } = useAuth();
  const { user, loading } = state;

  useEffect(() => {
    const refreshEnergy = async () => {
      try {
        const energy = await checkEnergyAndRefresh();
        dispatch({ type: 'UPDATE_ENERGY', payload: energy });
      } catch (error) {
        console.error('Failed to refresh energy:', error);
      }
    };

    refreshEnergy();
  }, [dispatch]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Card */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Battle Stats</h2>
              <div className="space-y-2">
                <p>Wins: {user.wins}</p>
                <p>Losses: {user.losses}</p>
                <p>Win Rate: {user.wins + user.losses > 0 
                  ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1)
                  : 0}%</p>
              </div>
            </div>

            {/* Energy Card */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Energy</h2>
              <div className="space-y-2">
                <p>Daily Energy: {user.dailyEnergy}/{user.maxEnergy}</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${(user.dailyEnergy / user.maxEnergy) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400">Refreshes daily</p>
              </div>
            </div>

            {/* Currency Card */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Holos</h2>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-yellow-400">{user.holos}</p>
                <p className="text-sm text-gray-400">Available to spend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Holobots Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Your Holobots</h2>
          {user.holobots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">You don't have any Holobots yet.</p>
              <button
                onClick={() => router.push('/shop')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Your First Holobot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.holobots.map((holobot) => (
                <div key={holobot.id} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{holobot.name}</h3>
                  <div className="space-y-1">
                    <p>Level: {holobot.level}</p>
                    <p>Style: {holobot.combatStyle}</p>
                    <p>Wins: {holobot.wins}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 