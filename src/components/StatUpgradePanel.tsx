import { Button } from "./ui/button";
import { StatBoosts, MAX_INDIVIDUAL_STAT_BOOST, HP_BOOST_MULTIPLIER, canBoostStat } from "@/types/holobot";
import { applyStatBoost } from "@/utils/localStorageUtils";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";

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

  console.log('StatUpgradePanel Render:', {
    holobotId,
    statBoosts,
    availableStatPoints,
    experience,
    requiredXp
  });

  const handleUpgrade = async (stat: keyof StatBoosts) => {
    try {
      console.log('[StatUpgradePanel] Starting stat upgrade:', {
        holobotId,
        stat,
        currentBoosts: statBoosts,
        availablePoints: availableStatPoints
      });

      const amount = stat === 'maxHealth' ? HP_BOOST_MULTIPLIER : 1;
      
      // Add event listener before applying boost
      const updateHandler = (event: CustomEvent) => {
        console.log('[StatUpgradePanel] Received holobot-update event:', event.detail);
      };
      window.addEventListener('holobot-update', updateHandler as EventListener);
      
      await applyStatBoost(holobotId, stat, amount);
      
      console.log('[StatUpgradePanel] After applyStatBoost:', {
        stat,
        amount,
        newBoosts: statBoosts,
        props: {
          holobotId,
          statBoosts,
          availableStatPoints
        }
      });

      // Remove event listener after update
      window.removeEventListener('holobot-update', updateHandler as EventListener);

      toast({
        title: "Stat Upgraded",
        description: `Successfully upgraded ${stat}!`,
      });

      if (onUpgrade) {
        console.log('[StatUpgradePanel] Calling onUpgrade callback');
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

  // Add effect to log prop changes
  useEffect(() => {
    console.log('[StatUpgradePanel] Props updated:', {
      holobotId,
      statBoosts,
      availableStatPoints,
      experience,
      requiredXp
    });
  }, [holobotId, statBoosts, availableStatPoints, experience, requiredXp]);

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