import { useState, useEffect } from 'react';
import { NavigationMenu } from "@/components/NavigationMenu";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/AuthContext";
import { useXp } from "@/contexts/XpContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Battery, Swords, Trophy, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BATTLE_ENERGY_COST } from "@/types/user";
import { useEnergy } from "@/services/authService";
import { calculateBattleXpReward } from "@/utils/battleUtils";

// CPU difficulty levels
const DIFFICULTY_LEVELS = {
  easy: { level: 5, xpMultiplier: 1, energyCost: 5 },
  medium: { level: 15, xpMultiplier: 2, energyCost: 10 },
  hard: { level: 25, xpMultiplier: 3, energyCost: 15 },
  expert: { level: 35, xpMultiplier: 4, energyCost: 20 }
};

const Training = () => {
  const [selectedHolobot, setSelectedHolobot] = useState<string>('');
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<keyof typeof DIFFICULTY_LEVELS>('easy');
  const [isBattling, setIsBattling] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    won: boolean;
    xpGained: number;
    message: string;
  } | null>(null);

  const { state: authState, dispatch: authDispatch } = useAuth();
  const { addXp } = useXp();
  const { toast } = useToast();

  // Reset battle result when selections change
  useEffect(() => {
    setBattleResult(null);
  }, [selectedHolobot, selectedOpponent, selectedDifficulty]);

  const handleStartTraining = async () => {
    if (!selectedHolobot || !selectedOpponent) {
      toast({
        title: "Error",
        description: "Please select both holobots",
        variant: "destructive"
      });
      return;
    }

    const difficulty = DIFFICULTY_LEVELS[selectedDifficulty];
    
    try {
      // Check and use energy
      const remainingEnergy = await useEnergy(difficulty.energyCost);
      authDispatch({ type: 'UPDATE_ENERGY', payload: remainingEnergy });

      setIsBattling(true);

      // Simulate battle (we'll implement actual battle logic later)
      const battleDuration = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, battleDuration));

      // Calculate battle outcome (simplified for now)
      const playerHolobot = authState.user?.holobots.find(h => 
        h.name.toLowerCase() === selectedHolobot.toLowerCase()
      );
      
      if (!playerHolobot) {
        throw new Error('Selected holobot not found');
      }

      const won = Math.random() > 0.4; // 60% win rate in training
      const baseXp = calculateBattleXpReward(
        playerHolobot.level,
        DIFFICULTY_LEVELS[selectedDifficulty].level,
        won
      );
      const xpGained = Math.floor(baseXp * difficulty.xpMultiplier);

      // Update XP
      if (won) {
        await addXp(playerHolobot.id, xpGained);
      }

      // Set battle result
      setBattleResult({
        won,
        xpGained: won ? xpGained : 0,
        message: won 
          ? `Victory! Gained ${xpGained} XP!` 
          : 'Defeat. No XP gained.'
      });

      // Show toast
      toast({
        title: won ? "Victory!" : "Defeat",
        description: won 
          ? `Your holobot gained ${xpGained} XP!`
          : "Keep training to get stronger!",
        variant: won ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start training",
        variant: "destructive"
      });
    } finally {
      setIsBattling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationMenu />
      
      <div className="max-w-7xl mx-auto pt-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-['Press_Start_2P'] text-cyan-400 mb-4 animate-neon-pulse">
            TRAINING GROUNDS
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            Train your Holobots and gain experience
          </p>
          
          {/* Energy Display */}
          <Card className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border-cyan-500/20">
            <Battery className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              Energy: {authState.user?.dailyEnergy}/{authState.user?.maxEnergy}
            </span>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Player Holobot Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-['Press_Start_2P'] text-cyan-400 mb-4">
              Select Your Holobot
            </h2>
            <Select value={selectedHolobot} onValueChange={setSelectedHolobot}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your holobot" />
              </SelectTrigger>
              <SelectContent>
                {authState.user?.holobots.map((holobot) => (
                  <SelectItem key={holobot.id} value={holobot.name.toLowerCase()}>
                    {holobot.name} (Lv.{holobot.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedHolobot && (
              <div className="mt-4">
                <HolobotCard 
                  stats={{
                    ...HOLOBOT_STATS[selectedHolobot],
                    level: authState.user?.holobots.find(h => 
                      h.name.toLowerCase() === selectedHolobot.toLowerCase()
                    )?.level || 1,
                    // Include other stats from the player's holobot
                    ...authState.user?.holobots.find(h => 
                      h.name.toLowerCase() === selectedHolobot.toLowerCase()
                    )?.statBoosts
                  }}
                  variant="blue"
                />
              </div>
            )}
          </div>

          {/* Opponent Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-['Press_Start_2P'] text-red-400 mb-4">
              Select Training Opponent
            </h2>
            <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose opponent" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                  <SelectItem key={key} value={key}>
                    {stats.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedOpponent && (
              <div className="mt-4">
                <HolobotCard 
                  stats={{
                    ...HOLOBOT_STATS[selectedOpponent],
                    level: DIFFICULTY_LEVELS[selectedDifficulty].level
                  }}
                  variant="red"
                />
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Selection */}
        <Card className="mb-8 p-6 bg-black/40 border-cyan-500/20">
          <h3 className="text-lg font-['Press_Start_2P'] text-cyan-400 mb-4">
            Select Difficulty
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(Object.entries(DIFFICULTY_LEVELS) as [keyof typeof DIFFICULTY_LEVELS, typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS]][]).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedDifficulty === key ? "default" : "outline"}
                className={`
                  h-auto py-4 px-6
                  ${selectedDifficulty === key ? 'bg-cyan-500' : 'bg-black/40'}
                  border-cyan-500/20 hover:border-cyan-400
                `}
                onClick={() => setSelectedDifficulty(key)}
              >
                <div className="text-center space-y-2">
                  <div className="font-['Press_Start_2P'] text-sm capitalize">
                    {key}
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Level {config.level}</div>
                    <div>x{config.xpMultiplier} XP</div>
                    <div className="text-green-400">{config.energyCost} Energy</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Battle Controls */}
        <div className="text-center space-y-4">
          <Button
            size="lg"
            disabled={isBattling || !selectedHolobot || !selectedOpponent}
            onClick={handleStartTraining}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-['Press_Start_2P'] text-sm px-8 py-6"
          >
            {isBattling ? (
              <>
                <Swords className="w-4 h-4 mr-2 animate-spin" />
                Training...
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Start Training
              </>
            )}
          </Button>

          {battleResult && (
            <Card className={`
              p-4 animate-fadeIn
              ${battleResult.won ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}
            `}>
              <div className="flex items-center justify-center gap-2">
                {battleResult.won ? (
                  <Trophy className="w-5 h-5 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-['Press_Start_2P'] text-sm">
                  {battleResult.message}
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Training;