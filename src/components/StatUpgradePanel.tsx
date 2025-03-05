import { Button } from "./ui/button";
import { StatBoosts, MAX_INDIVIDUAL_STAT_BOOST, HP_BOOST_MULTIPLIER, canBoostStat } from "@/types/holobot";
import { applyStatBoost } from "@/utils/localStorageUtils";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface StatUpgradePanelProps {
  holobotId: string;
  statBoosts: StatBoosts;
  availableStatPoints: number;
  experience: number;
  requiredXp: number;
  onUpgrade?: () => void;
}

export const StatUpgradePanel = ({ 
  holobotId, 
  statBoosts, 
  availableStatPoints,
  experience,
  requiredXp,
  onUpgrade 
}: StatUpgradePanelProps) => {
  const { toast } = useToast();
  const { dispatch } = useAuth();

  useEffect(() => {
    const handleHolobotUpdate = (event: CustomEvent) => {
      const { holobotId: updatedId, statBoosts: newBoosts, availableStatPoints: newPoints } = event.detail;
      if (updatedId === holobotId) {
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { 
            holobots: (prevHolobots: any[]) => 
              prevHolobots.map(h => 
                h.id === holobotId 
                  ? { ...h, statBoosts: newBoosts, availableStatPoints: newPoints }
                  : h
              )
          }
        });
      }
    };

    window.addEventListener('holobot-update', handleHolobotUpdate as EventListener);
    return () => {
      window.removeEventListener('holobot-update', handleHolobotUpdate as EventListener);
    };
  }, [holobotId, dispatch]);

  const handleUpgrade = async (stat: keyof StatBoosts) => {
    try {
      const amount = stat === 'maxHealth' ? HP_BOOST_MULTIPLIER : 1;
      await applyStatBoost(holobotId, stat, amount);

      toast({
        title: "Stat Upgraded",
        description: `Successfully upgraded ${stat}!`,
      });

      if (onUpgrade) {
        onUpgrade();
      }
    } catch (error) {
      console.error('[StatUpgradePanel] Stat upgrade failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upgrade stat",
        variant: "destructive"
      });
    }
  };

  const renderStatButton = (stat: keyof StatBoosts, label: string) => {
    const currentBoost = statBoosts[stat];
    const maxBoost = stat === 'maxHealth' 
      ? MAX_INDIVIDUAL_STAT_BOOST * HP_BOOST_MULTIPLIER 
      : MAX_INDIVIDUAL_STAT_BOOST;
    const canBoost = canBoostStat(stat, statBoosts, availableStatPoints);

    const boostAmount = stat === 'maxHealth' ? '+10 HP' : '+1';

    return (
      <Button
        size="sm"
        variant="outline"
        className={`
          h-auto py-1 px-2 bg-black/40 hover:bg-cyan-500/20 
          border border-cyan-500/20 hover:border-cyan-400
          text-xs font-['Press_Start_2P'] text-cyan-400
          ${!canBoost && 'opacity-50 cursor-not-allowed hover:bg-black/40 hover:border-cyan-500/20'}
        `}
        onClick={() => handleUpgrade(stat)}
        disabled={!canBoost}
      >
        {boostAmount} {label}
      </Button>
    );
  };

  return (
    <div className="mt-4">
      <div className="bg-black/40 p-2 rounded border border-cyan-500/20 mb-2">
        <div className="flex items-center gap-2 font-['Press_Start_2P'] text-[8px]">
          <span className="text-white">EXP:</span>
          <span className="text-cyan-400">{experience}/{requiredXp}</span>
        </div>
      </div>

      <div className="bg-black/40 p-2 rounded border border-cyan-500/20">
        <div className="flex items-center gap-2 font-['Press_Start_2P'] text-[8px] mb-2">
          <span className="text-white">Available Points:</span>
          <span className="text-cyan-400">{availableStatPoints}</span>
        </div>

        <div className="grid grid-cols-2 gap-1">
          {renderStatButton('maxHealth', 'HP')}
          {renderStatButton('attack', 'ATK')}
          {renderStatButton('defense', 'DEF')}
          {renderStatButton('speed', 'SPD')}
        </div>
      </div>
    </div>
  );
}; 