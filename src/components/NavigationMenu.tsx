import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Moon, Sun, Battery, User, Trophy, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "../providers/theme-provider";
import { useAuth } from "@/contexts/AuthContext";

export const NavigationMenu = () => {
  const { theme, setTheme } = useTheme();
  const { state } = useAuth();
  const { user } = state;

  // Calculate win rate
  const winRate = user ? ((user.wins / (user.wins + user.losses)) * 100 || 0).toFixed(1) : '0.0';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-4 right-4 z-50 bg-background hover:bg-accent/20 border border-border shadow-md"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64 bg-background border-border">
        {/* User Info Section */}
        <div className="py-4 mb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-[#4a90e2]" />
            <span className="text-sm font-['Press_Start_2P'] text-[#4a90e2]">
              {user?.username || 'Guest'}
            </span>
          </div>

          {/* Battle Stats */}
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div className="flex-1">
              <div className="text-xs mb-1 text-foreground">Battle Record</div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="bg-green-500/20 p-1 rounded">
                  W: {user?.wins || 0}
                </div>
                <div className="bg-red-500/20 p-1 rounded">
                  L: {user?.losses || 0}
                </div>
                <div className="bg-blue-500/20 p-1 rounded">
                  {winRate}%
                </div>
              </div>
            </div>
          </div>

          {/* HOLOS Balance */}
          <div className="flex items-center gap-2 mb-3">
            <Coins className="h-4 w-4 text-yellow-400" />
            <div className="flex-1">
              <div className="text-xs mb-1 text-foreground">HOLOS</div>
              <div className="text-[10px] font-['Press_Start_2P'] text-yellow-400">
                {user?.holos?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Energy Bar */}
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-green-500" />
            <div className="flex-1">
              <div className="text-xs mb-1 text-foreground">Daily Energy</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${user ? (user.dailyEnergy / user.maxEnergy) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="text-[10px] mt-1 text-foreground">
                {user?.dailyEnergy || 0}/{user?.maxEnergy || 100}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link to="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Battle Arena
            </Button>
          </Link>
          <Link to="/holobots-info">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Holobots Info
            </Button>
          </Link>
          <Link to="/holos-farm">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Holos Farm
            </Button>
          </Link>
          <Link to="/quests">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Quests
            </Button>
          </Link>
          <Link to="/training">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Training
            </Button>
          </Link>
          <Link to="/mint">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Mint Holobot
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            >
              Leaderboard
            </Button>
          </Link>
          
          <div className="border-t border-border my-2" />
          
          <Button
            variant="ghost"
            className="w-full justify-between text-foreground hover:bg-accent/20 font-['Press_Start_2P'] text-xs"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span>Theme</span>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};