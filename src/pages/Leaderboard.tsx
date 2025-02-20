import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  username: string;
  wins: number;
  losses: number;
  winRate: number;
  holobots?: { name: string; level: number }[];
}

export const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const { state } = useAuth();
  const user = state.user;

  // Simulated leaderboard data - replace with actual data fetching
  useEffect(() => {
    const mockData: LeaderboardEntry[] = [
      {
        username: "pak209",
        wins: 1,
        losses: 0,
        winRate: 100.0,
        holobots: [
          { name: "ACE", level: 12 },
          { name: "KUMA", level: 9 },
          { name: "Shadow", level: 1 }
        ]
      },
      {
        username: "CyberKnight",
        wins: 42,
        losses: 12,
        winRate: 77.8,
        holobots: [
          { name: "TORA", level: 15 },
          { name: "KUMA", level: 14 },
          { name: "ACE", level: 13 }
        ]
      },
      {
        username: "PixelMaster",
        wins: 38,
        losses: 15,
        winRate: 71.7,
        holobots: [
          { name: "WAKE", level: 14 },
          { name: "ERA", level: 13 },
          { name: "GAMA", level: 12 }
        ]
      },
      {
        username: "HoloHero",
        wins: 35,
        losses: 18,
        winRate: 66.0,
        holobots: [
          { name: "KEN", level: 13 },
          { name: "KURAI", level: 12 },
          { name: "TSUIN", level: 11 }
        ]
      }
    ];

    // Sort by win rate
    const sortedByWinRate = [...mockData].sort((a, b) => b.winRate - a.winRate);
    setLeaderboardData(sortedByWinRate);
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-[#0f1319] border-none">
        <div className="flex items-center gap-2 p-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white font-['Press_Start_2P']">Battle Rankings</h1>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-cyan-500/20">
                <TableHead className="text-white">Rank</TableHead>
                <TableHead className="text-white">Player</TableHead>
                <TableHead className="text-white text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Trophy className="w-4 h-4" />
                    Battle Record
                  </div>
                </TableHead>
                <TableHead className="text-white">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-purple-500" />
                    Strongest Holobots
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry, index) => (
                <TableRow 
                  key={entry.username} 
                  className={`
                    ${entry.username === user?.username ? "bg-blue-500/10" : ""}
                    border-b border-cyan-500/20
                  `}
                >
                  <TableCell className="font-mono text-white">{index + 1}</TableCell>
                  <TableCell className="font-bold text-white">{entry.username}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-500">{entry.wins}W</span>
                    <span className="mx-1 text-gray-500">/</span>
                    <span className="text-red-500">{entry.losses}L</span>
                    <span className="ml-4 text-blue-400">{entry.winRate.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-4">
                      {entry.holobots?.map((holobot) => (
                        <div key={holobot.name} className="flex items-center gap-2">
                          <span className="text-white font-['Press_Start_2P'] text-xs">
                            {holobot.name}
                          </span>
                          <span className="text-purple-400 font-['Press_Start_2P'] text-xs">
                            Lv.{holobot.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}; 