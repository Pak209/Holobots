import { NavigationMenu } from "@/components/NavigationMenu";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Card } from "@/components/ui/card";
import { ExperienceBar } from "@/components/ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { StatUpgradePanel } from "@/components/StatUpgradePanel";

const HolobotsInfo = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();

  // Function to get holobot level and experience from user data
  const getHolobotData = (holobotKey: string) => {
    if (!user?.holobots) return { 
      level: 1, 
      experience: 0, 
      isOwned: false,
      statBoosts: { attack: 0, defense: 0, speed: 0, maxHealth: 0 },
      availableStatPoints: 0,
      id: '',
      wins: 0,
      losses: 0
    };

    const userHolobot = user.holobots.find(h => h.name.toLowerCase() === holobotKey.toLowerCase());
    const level = userHolobot?.level || 1;
    const totalStatPoints = level; // One point per level
    const usedPoints = Object.values(userHolobot?.statBoosts || { attack: 0, defense: 0, speed: 0, maxHealth: 0 })
      .reduce((sum, current) => sum + current, 0);
    
    return {
      level,
      experience: userHolobot?.experience || 0,
      isOwned: !!userHolobot,
      statBoosts: userHolobot?.statBoosts || { attack: 0, defense: 0, speed: 0, maxHealth: 0 },
      availableStatPoints: totalStatPoints - usedPoints,
      id: userHolobot?.id || '',
      wins: userHolobot?.wins || 0,
      losses: userHolobot?.losses || 0
    };
  };

  return (
    <div className="min-h-screen bg-background text-cyan-400 p-4">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto pt-16">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground animate-neon-pulse">
          HOLOBOTS INFO
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          {Object.entries(HOLOBOT_STATS).map(([key, stats]) => {
            const { level, experience, isOwned, statBoosts, availableStatPoints, id, wins, losses } = getHolobotData(key);
            const progressData = getExperienceProgress(experience, level);
            
            return (
              <div key={key} className="flex flex-col md:flex-row gap-4 items-stretch">
                <Card className={`
                  flex-1 bg-[#0f1319] rounded-lg p-6 border-2
                  ${isOwned ? 'border-cyan-500/30' : 'border-red-500/30'}
                  shadow-[0_0_10px_rgba(34,211,238,0.1)]
                  hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]
                  transition-all relative overflow-hidden
                `}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-xl font-mono text-foreground">
                        {stats.name}
                      </h2>
                      {isOwned && (
                        <div className="flex-1">
                          <ExperienceBar 
                            {...progressData}
                            level={level}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-sm mb-2">
                      <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20">
                        <span className="text-foreground">HP:</span> {stats.maxHealth + (statBoosts?.maxHealth || 0)}
                      </div>
                      <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20">
                        <span className="text-foreground">Attack:</span> {stats.attack + (statBoosts?.attack || 0)}
                      </div>
                      <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20">
                        <span className="text-foreground">Defense:</span> {stats.defense + (statBoosts?.defense || 0)}
                      </div>
                      <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20">
                        <span className="text-foreground">Speed:</span> {stats.speed + (statBoosts?.speed || 0)}
                      </div>
                    </div>

                    <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20 mb-2">
                      <span className="text-foreground">Special:</span> {stats.specialMove}
                    </div>

                    {!isOwned && (
                      <div className="mt-auto text-center">
                        <Button
                          onClick={() => navigate('/mint')}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30
                                   font-['Press_Start_2P'] text-xs py-6 w-full animate-pulse"
                        >
                          Not Owned - Mint Now
                        </Button>
                      </div>
                    )}

                    {isOwned && (
                      <>
                        <div className="grid grid-cols-2 gap-1.5 text-xs mb-4">
                          <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20">
                            <span className="text-foreground">Wins:</span> {wins}
                          </div>
                          <div className="bg-[#1a1f2c] p-1.5 rounded border border-cyan-500/20">
                            <span className="text-foreground">Losses:</span> {losses}
                          </div>
                        </div>

                        <StatUpgradePanel
                          holobotId={id}
                          statBoosts={statBoosts}
                          availableStatPoints={availableStatPoints}
                          experience={progressData.currentXp}
                          requiredXp={progressData.requiredXp}
                        />
                      </>
                    )}
                  </div>
                </Card>
                
                {/* TCG Card */}
                <div className="flex-none flex items-center">
                  <HolobotCard 
                    stats={{
                      ...stats,
                      level: level,
                      maxHealth: stats.maxHealth + (statBoosts?.maxHealth || 0),
                      attack: stats.attack + (statBoosts?.attack || 0),
                      defense: stats.defense + (statBoosts?.defense || 0),
                      speed: stats.speed + (statBoosts?.speed || 0)
                    }} 
                    variant="blue" 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HolobotsInfo;