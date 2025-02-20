interface BattleLogProps {
  logs: string[];
}

export const BattleLog = ({ logs }: BattleLogProps) => {
  return (
    <div className="w-full p-2 bg-[#0f1319] rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)] mt-1">
      <div className="h-[120px] overflow-y-auto text-xs md:text-sm text-foreground font-mono scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        <div className="flex flex-col-reverse">
          {logs.map((log, index) => (
            <p key={index} className="py-0.5 px-1 hover:bg-cyan-500/10 transition-colors duration-300">
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};