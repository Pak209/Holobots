import { Button } from "./ui/button";
import { Rocket, Zap, Sword } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BattleStyleSlider } from "./BattleStyleSlider";
import { HolobotStats, HOLOBOT_STATS } from "@/types/holobot";

interface BattleControlsProps {
  onStartBattle: () => void;
  onHypeUp: () => void;
  onHack: (type: 'attack' | 'speed' | 'heal') => void;
  onSpecialAttack: () => void;
  onModeChange: (isDefense: boolean) => void;
  isBattleStarted: boolean;
  hackGauge: number;
  specialGauge: number;
  isHypeCooldown?: boolean;
  hypeUses?: number;
  isDefenseMode: boolean;
  playerHolobot: HolobotStats;
  selectedLeftHolobot: string;
  selectedRightHolobot: string;
  onLeftHolobotChange: (value: string) => void;
  onRightHolobotChange: (value: string) => void;
}

export const BattleControls = ({
  onStartBattle,
  onHypeUp,
  onHack,
  onSpecialAttack,
  onModeChange,
  isBattleStarted,
  hackGauge,
  specialGauge,
  isHypeCooldown = false,
  hypeUses = 0,
  isDefenseMode,
  playerHolobot,
  selectedLeftHolobot,
  selectedRightHolobot,
  onLeftHolobotChange,
  onRightHolobotChange
}: BattleControlsProps) => {
  const PreBattleMenu = () => (
    <div className="flex gap-2 items-center justify-center w-full">
      <div className="w-[180px] h-[90px] bg-black/40 rounded-lg border border-cyan-500/20">
        <div className="p-2">
          <h3 className="text-cyan-400 text-[10px] mb-1 font-['Press_Start_2P']">YOUR HOLOBOT</h3>
          <Select value={selectedLeftHolobot} onValueChange={onLeftHolobotChange}>
            <SelectTrigger className="h-8 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-white border-cyan-500/20 text-xs">
              <SelectValue placeholder="Choose Holobot" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1319] border-cyan-500/20">
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <SelectItem key={key} value={key} className="text-foreground hover:bg-cyan-500/20">
                  {stats.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        variant="outline"
        className="bg-holobots-accent hover:bg-holobots-hover text-white border-none text-sm shadow-neon-blue animate-pulse font-['Press_Start_2P'] px-6 py-3"
        onClick={onStartBattle}
      >
        Start Battle
      </Button>

      <div className="w-[180px] h-[90px] bg-black/40 rounded-lg border border-red-500/20">
        <div className="p-2">
          <h3 className="text-red-400 text-[10px] mb-1 font-['Press_Start_2P']">ENEMY HOLOBOT</h3>
          <Select value={selectedRightHolobot} onValueChange={onRightHolobotChange}>
            <SelectTrigger className="h-8 w-full bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/20 text-xs">
              <SelectValue placeholder="Choose Enemy" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1319] border-red-500/20">
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <SelectItem key={key} value={key} className="text-foreground hover:bg-red-500/20">
                  {stats.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const BattleMenu = () => (
    <div className="flex gap-2 items-center">
      <Button 
        variant="outline"
        className={`${
          isHypeCooldown 
            ? "bg-gray-500 hover:bg-gray-600" 
            : "bg-yellow-400 hover:bg-yellow-500"
        } text-white border-none text-xs shadow-neon ${
          !isHypeCooldown && "animate-pulse"
        }`}
        size="sm"
        onClick={onHypeUp}
        disabled={isHypeCooldown || hypeUses >= 3}
      >
        <Rocket className="w-3 h-3 md:w-4 md:h-4" /> 
        {isHypeCooldown ? "Cooldown" : `Hype (${hypeUses}/3)`}
      </Button>

      <Button 
        variant="outline"
        className="bg-purple-500 hover:bg-purple-600 text-white border-none text-xs shadow-neon"
        size="sm"
        onClick={onSpecialAttack}
        disabled={specialGauge < 50}
      >
        <Sword className="w-3 h-3 md:w-4 md:h-4" /> Special ({Math.floor(specialGauge)}%)
      </Button>
      
      <Select 
        onValueChange={(value) => onHack(value as 'attack' | 'speed' | 'heal')} 
        disabled={hackGauge < 50}
      >
        <SelectTrigger className="h-8 w-[120px] bg-red-500 hover:bg-red-600 text-white border-none text-xs shadow-neon">
          <Zap className="w-3 h-3 md:w-4 md:h-4" /> {Math.floor(hackGauge)}%
        </SelectTrigger>
        <SelectContent className="bg-holobots-card border-holobots-border">
          <SelectItem 
            value="attack" 
            className="text-holobots-text hover:bg-holobots-accent hover:text-white"
            disabled={hackGauge < 50}
          >
            Boost All Stats (50%)
          </SelectItem>
          <SelectItem 
            value="heal" 
            className="text-holobots-text hover:bg-holobots-accent hover:text-white"
            disabled={hackGauge < 75}
          >
            Heal (75%)
          </SelectItem>
        </SelectContent>
      </Select>

      <BattleStyleSlider 
        isDefense={isDefenseMode}
        onModeChange={onModeChange}
        disabled={false}
        holobot={playerHolobot}
      />
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!isBattleStarted ? <PreBattleMenu /> : <BattleMenu />}
    </div>
  );
};