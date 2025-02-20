import { Shield, Sword } from "lucide-react";
import { HolobotStats } from "@/types/holobot";
import { calculateComboMultiplier, calculateMeterFillRate } from "@/utils/battleUtils";
import { cn } from "@/utils/cn";

interface BattleStyleSliderProps {
  isDefense: boolean;
  onModeChange: (isDefense: boolean) => void;
  disabled?: boolean;
  holobot: HolobotStats;
}

export function BattleStyleSlider({
  isDefense,
  onModeChange,
  disabled = false,
  holobot
}: BattleStyleSliderProps) {
  const baseMultiplier = Math.max(1, holobot.intelligence / 50);
  const maxComboMultiplier = baseMultiplier + 0.5; // Max combo bonus is 50%
  const meterFillRate = calculateMeterFillRate(holobot.intelligence, 'counter');

  return (
    <button
      onClick={() => !disabled && onModeChange(!isDefense)}
      disabled={disabled}
      className={cn(
        "relative h-8 w-[120px] rounded-full",
        "transition-all duration-300 ease-in-out",
        isDefense ? "bg-cyan-500/20" : "bg-red-500/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          "absolute top-0.5 bottom-0.5 w-[56px] rounded-full",
          "transition-all duration-300 ease-in-out",
          isDefense ? 
            "right-0.5 bg-cyan-500/30 border-cyan-500/50" : 
            "left-0.5 bg-red-500/30 border-red-500/50",
          "border"
        )}
      />
      
      {/* Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <div className={cn(
          "flex items-center justify-center w-6 h-6",
          "transition-all duration-300",
          !isDefense ? "text-red-400" : "text-red-400/30"
        )}>
          <Sword className="w-4 h-4" />
        </div>
        <div className={cn(
          "flex items-center justify-center w-6 h-6",
          "transition-all duration-300",
          isDefense ? "text-cyan-400" : "text-cyan-400/30"
        )}>
          <Shield className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
} 