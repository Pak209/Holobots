import { HolobotStats } from "@/types/holobot";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

const getRankColor = (level: number): string => {
  if (level >= 41) return "bg-yellow-900/80 border-yellow-400"; // Legendary
  if (level >= 31) return "bg-purple-900/80 border-purple-400"; // Elite
  if (level >= 21) return "bg-blue-900/80 border-blue-400";     // Rare
  if (level >= 11) return "bg-green-900/80 border-green-400";   // Champion
  return "bg-gray-900/80 border-gray-400";                      // Rookie
};

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  const getHolobotImage = (name: string) => {
    const images: Record<string, string> = {
      "ace": "/lovable-uploads/ace.png",
      "kuma": "/lovable-uploads/kuma.png",
      "shadow": "/lovable-uploads/shadow.png",
      "hare": "/lovable-uploads/hare.png",
      "tora": "/lovable-uploads/tora.png",
      "wake": "/lovable-uploads/wake.png",
      "era": "/lovable-uploads/era.png",
      "gama": "/lovable-uploads/gama.png",
      "ken": "/lovable-uploads/ken.PNG",
      "kurai": "/lovable-uploads/kurai.png",
      "tsuin": "/lovable-uploads/tsuin.png",
      "wolf": "/lovable-uploads/wolf.png"
    };
    
    const normalizedName = name.toLowerCase();
    return images[normalizedName] || "/placeholder.svg";
  };

  const rankColor = getRankColor(stats.level);

  return (
    <div className={`w-[180px] h-auto rounded-lg ${
      variant === "red" ? "bg-red-900/80 border-red-400" : rankColor
    } border-2 p-1.5 flex flex-col font-mono text-[8px] transition-all duration-300 hover:scale-105 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1 bg-black/40 px-1.5 py-0.5 rounded-md border border-white/20">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${
            variant === "red" ? "text-red-200" : "text-cyan-200"
          }`}>
            {stats.name}
          </span>
          <span className="text-yellow-300">Lv.{stats.level}</span>
        </div>
      </div>
      
      {/* Image Container */}
      <div className="aspect-square bg-black/40 rounded-lg mb-1 flex items-center justify-center border border-white/20 hover:border-blue-400/50 transition-colors duration-300 p-1">
        <img 
          src={getHolobotImage(stats.name)} 
          alt={stats.name} 
          className="w-32 h-32 object-contain image-pixelated" 
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      
      {/* Ability Section */}
      <div className="bg-black/40 rounded-lg p-1.5 mb-1 border border-white/20">
        <div className="font-bold text-white mb-0.5">
          Ability: {stats.specialMove}
        </div>
        <div className="text-[7px] text-gray-300 leading-tight">
          Uses its speed to strike first and gets in position to land the next hit.
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="bg-black/40 rounded-lg p-1.5 border border-white/20">
        <div className="grid grid-cols-4 gap-1 text-white">
          <div>HP:{stats.maxHealth}</div>
          <div>A:{stats.attack}</div>
          <div>D:{stats.defense}</div>
          <div>S:{stats.speed}</div>
        </div>
      </div>
    </div>
  );
};