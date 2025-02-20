import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { addHolobot, getUserData, initializeUserData } from '@/utils/localStorageUtils';
import { toast } from "@/components/ui/use-toast";

// Define starter Holobots
const STARTER_HOLOBOTS = ['ace', 'kuma', 'shadow'];

const MintPage = () => {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();

  const handleMint = async () => {
    if (!selectedHolobot) {
      toast({
        title: "Error",
        description: "Please select a Holobot to mint",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get or initialize user data
      let userData = getUserData();
      if (!userData) {
        userData = initializeUserData(state.user?.username || "Player");
        // Update auth context with initial user data
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      }

      // Check if user already has this Holobot
      const alreadyOwned = userData.holobots?.some(
        h => h.name.toLowerCase() === selectedHolobot.toLowerCase()
      );

      if (alreadyOwned) {
        toast({
          title: "Error",
          description: "You already own this Holobot!",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create new holobot instance
      const newHolobot = {
        id: Math.random().toString(36).substr(2, 9),
        userId: userData.id,
        ...HOLOBOT_STATS[selectedHolobot],
        wins: 0,
        losses: 0,
        experience: 0,
        level: 1
      };

      // Add to local storage and get updated user data
      const updatedHolobot = addHolobot(newHolobot);
      const updatedUserData = getUserData();

      if (updatedUserData) {
        // Update auth context with the latest user data
        dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUserData });

        toast({
          title: "Success!",
          description: `${updatedHolobot.name} has been added to your collection!`,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }

    } catch (error) {
      console.error('Failed to mint holobot:', error);
      toast({
        title: "Error",
        description: "Failed to mint Holobot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto pt-16 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-['Press_Start_2P'] text-cyan-400 mb-4 animate-neon-pulse">
            GENESIS MINT
          </h1>
          <p className="text-gray-400 font-['Press_Start_2P'] text-sm">
            Choose your first Holobot
          </p>
        </div>

        {/* Holobots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {STARTER_HOLOBOTS.map((holobotKey) => {
            const stats = HOLOBOT_STATS[holobotKey];
            const isSelected = selectedHolobot === holobotKey;

            return (
              <div 
                key={holobotKey}
                onClick={() => setSelectedHolobot(holobotKey)}
                className={`
                  relative cursor-pointer transition-all duration-300 transform 
                  hover:scale-105 ${isSelected ? 'scale-105' : ''}
                  bg-[#0f1319] rounded-lg p-6 border-2
                  ${isSelected ? 'border-cyan-500' : 'border-cyan-500/20'}
                  shadow-[0_0_10px_rgba(34,211,238,0.1)]
                  hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]
                  overflow-hidden
                `}
              >
                <div className="relative flex items-start gap-4">
                  {/* TCG Card Container */}
                  <div className="flex-shrink-0 relative z-10 w-[180px]">
                    <HolobotCard stats={stats} variant="blue" />
                  </div>
                  
                  {/* Rotated Name */}
                  <div 
                    className="absolute left-[220px] top-[35%] -translate-y-1/2 rotate-90 origin-left transform-gpu"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <h2 className={`
                      font-['Press_Start_2P'] whitespace-nowrap tracking-[0.2em] select-none
                      ${stats.name.length > 3 ? 'text-5xl' : 'text-7xl'}
                      text-[#00FFFF]
                    `}>
                      {stats.name}
                    </h2>
                  </div>
                </div>
                
                {/* Stats Summary */}
                <div className="mt-6 space-y-3 font-['Press_Start_2P'] text-xs relative z-10">
                  <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                    <span className="text-gray-400">Combat Style</span>
                    <span className="text-cyan-400">{stats.combatStyle}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                    <span className="text-gray-400">Special Move</span>
                    <span className="text-cyan-400">{stats.specialMove}</span>
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -inset-0.5 border-2 border-cyan-500 rounded-lg animate-pulse pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mint Button */}
        <div className="text-center mb-12">
          <Button
            onClick={handleMint}
            disabled={!selectedHolobot || isLoading}
            className={`
              px-8 py-4 bg-cyan-500 text-white font-['Press_Start_2P'] text-sm
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 hover:bg-cyan-600
              border-2 border-cyan-400
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLoading ? 'Minting...' : 'Mint Genesis Holobot'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MintPage; 