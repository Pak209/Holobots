import { Progress } from "./ui/progress";

interface ExperienceBarProps {
  currentXp: number;
  requiredXp: number;
  progress: number;
  level: number;
}

export const ExperienceBar = ({ currentXp, requiredXp, progress, level }: ExperienceBarProps) => {
  return (
    <div className="w-full p-1 bg-[#0f1319] rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] italic font-black text-yellow-300
            drop-shadow-[0_0_3px_rgba(234,179,8,1)] 
            [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]
            animate-pulse">
            XP
          </span>
          <span className="text-[10px] font-medium text-cyan-400">
            {currentXp}/{requiredXp}
          </span>
        </div>
        <div className="relative w-full">
          <Progress 
            value={progress} 
            className="h-2 bg-black/40 overflow-hidden"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};