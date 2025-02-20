import { useState, useEffect } from "react";
import { StatusBar } from "./HealthBar";
import { Character } from "./Character";
import { AttackParticle } from "./AttackParticle";
import { HolobotCard } from "./HolobotCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { BattleControls } from "./BattleControls";
import { BattleLog } from "./BattleLog";
import { ExperienceBar } from "./ExperienceBar";
import { HolobotStats, BattleState } from "@/types/holobot";
import { calculateDamage, calculateExperience, getNewLevel, applyHackBoost, getExperienceProgress, applySpecialAttack, calculateCounterDamage } from "@/utils/battleUtils";
import { decideCombatAction } from "@/utils/intBattleUtils";
import { useAuth } from "@/contexts/AuthContext";
import { updateHolobotExperience, updateUserStats } from "@/utils/localStorageUtils";
import { calculateDamageWithMode, calculateSpecialGain, calculateHackGain } from "@/utils/battleUtils";
import { useXp } from '@/contexts/XpContext';

export const BattleScene = () => {
  const [leftHealth, setLeftHealth] = useState(100);
  const [rightHealth, setRightHealth] = useState(100);
  const [leftSpecial, setLeftSpecial] = useState(0);
  const [rightSpecial, setRightSpecial] = useState(0);
  const [leftHack, setLeftHack] = useState(0);
  const [rightHack, setRightHack] = useState(0);
  const [leftIsAttacking, setLeftIsAttacking] = useState(false);
  const [rightIsAttacking, setRightIsAttacking] = useState(false);
  const [leftIsDamaged, setLeftIsDamaged] = useState(false);
  const [rightIsDamaged, setRightIsDamaged] = useState(false);
  const [selectedLeftHolobot, setSelectedLeftHolobot] = useState("ace");
  const [selectedRightHolobot, setSelectedRightHolobot] = useState("kuma");
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'left' | 'right'>('left');
  const [holobotLevels, setHolobotLevels] = useState<Record<string, number>>({});
  
  const { state: authState, dispatch } = useAuth();
  const [holobotXp, setHolobotXp] = useState<Record<string, number>>({});

  const [leftGasTokens, setLeftGasTokens] = useState(3);
  const [rightGasTokens, setRightGasTokens] = useState(3);
  const [leftHypeUses, setLeftHypeUses] = useState(0);
  const [rightHypeUses, setRightHypeUses] = useState(0);
  const [tempLeftXp, setTempLeftXp] = useState(0);
  const [tempRightXp, setTempRightXp] = useState(0);
  const [isHypeCooldown, setIsHypeCooldown] = useState(false);
  const [leftBattleState, setLeftBattleState] = useState<BattleState>({
    playerHP: 100,
    enemyHP: 100,
    specialGauge: 0,
    hackGauge: 0,
    currentCombo: 0,
    lastMoveEffective: true,
    enemyVulnerable: false,
    enemyStaggered: false,
    currentStyle: HOLOBOT_STATS[selectedLeftHolobot].combatStyle
  });

  const [rightBattleState, setRightBattleState] = useState<BattleState>({
    playerHP: 100,
    enemyHP: 100,
    specialGauge: 0,
    hackGauge: 0,
    currentCombo: 0,
    lastMoveEffective: true,
    enemyVulnerable: false,
    enemyStaggered: false,
    currentStyle: HOLOBOT_STATS[selectedRightHolobot].combatStyle
  });

  const [isDefenseMode, setIsDefenseMode] = useState(false);

  const [battleXpProgress, setBattleXpProgress] = useState<{
    currentXp: number;
    requiredXp: number;
    progress: number;
    level: number;
  }>({ currentXp: 0, requiredXp: 0, progress: 0, level: 1 });

  const { addXp, selectHolobot, state: xpState } = useXp();

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const handleHypeUp = () => {
    if (isBattleStarted && leftHypeUses < 3 && !isHypeCooldown) {
      setLeftSpecial(prev => Math.min(100, prev + 10));
      setLeftHypeUses(prev => prev + 1);
      addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} is getting hyped up! (${leftHypeUses + 1}/3)`);
      
      if (leftHypeUses === 2) { // About to use last hype
        setIsHypeCooldown(true);
        setTimeout(() => {
          setIsHypeCooldown(false);
          setLeftHypeUses(0);
          addToBattleLog("Hype Up is ready again!");
        }, 5000); // 5 second cooldown
      }
    }
  };

  const handleSpecialAttack = () => {
    if (isBattleStarted && leftSpecial >= 50) {
      setLeftIsAttacking(true);
      const { newStats, damage } = applySpecialAttack(HOLOBOT_STATS[selectedLeftHolobot], leftSpecial);
      HOLOBOT_STATS[selectedLeftHolobot] = newStats;
      
      setRightHealth(prev => Math.max(0, prev - damage));
      setLeftSpecial(0);
      
      addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} used ${newStats.specialMove} for ${damage} damage!`);
      
      setTimeout(() => {
        setRightIsDamaged(true);
        setTimeout(() => {
          setRightIsDamaged(false);
          setLeftIsAttacking(false);
        }, 200);
      }, 100);
    }
  };

  const handleHack = (type: 'attack' | 'speed' | 'heal') => {
    if (leftGasTokens > 0) {
      const updatedStats = applyHackBoost(HOLOBOT_STATS[selectedLeftHolobot], type, leftGasTokens);
      HOLOBOT_STATS[selectedLeftHolobot] = updatedStats;
      setLeftGasTokens(prev => prev - 1);
      
      if (type === 'heal') {
        setLeftHealth(prev => Math.min(100, prev + 40));
      }
      
      addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} used Gas Hack: ${type}! (${leftGasTokens - 1} tokens left)`);
    }
  };

  const handleStartBattle = () => {
    setIsBattleStarted(true);
    setLeftHealth(100);
    setRightHealth(100);
    setLeftSpecial(0);
    setRightSpecial(0);
    setLeftHack(0);
    setRightHack(0);
    setCurrentTurn('left');
    setBattleLog(["Battle started!"]);
    selectHolobot(selectedLeftHolobot);
  };

  const handleModeChange = (isDefense: boolean) => {
    setIsDefenseMode(isDefense);
    addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} switches to ${isDefense ? 'Defense' : 'Attack'} mode!`);
  };

  // Reset combos when battle starts
  useEffect(() => {
    if (isBattleStarted) {
      setLeftBattleState(prev => ({
        ...prev,
        currentCombo: 0
      }));
      setRightBattleState(prev => ({
        ...prev,
        currentCombo: 0
      }));
      setBattleLog([]);
    }
  }, [isBattleStarted]);

  useEffect(() => {
    if (!isBattleStarted) return;

    // Check for battle end
    if (leftHealth <= 0 || rightHealth <= 0) {
      setIsBattleStarted(false);
      
      if (leftHealth > 0) {
        // Player wins
        const xpGain = tempLeftXp;
        console.log('Battle Won - Initial State:', {
          selectedHolobot: selectedLeftHolobot,
          currentXp: holobotXp[selectedLeftHolobot] || 0,
          xpGain,
          currentLevel: holobotLevels[selectedLeftHolobot]
        });
        
        setTempLeftXp(0);
        
        // Find the holobot first
        const holobot = authState.user?.holobots.find(h => 
          h.name.toLowerCase() === selectedLeftHolobot.toLowerCase()
        );
        
        if (holobot) {
          console.log('Found Holobot:', {
            id: holobot.id,
            name: holobot.name,
            currentXp: holobot.experience,
            level: holobot.level
          });

          // Calculate new values first
          const currentXp = (holobotXp[selectedLeftHolobot] || 0) + xpGain;
          const currentLevel = holobotLevels[selectedLeftHolobot];
          const newLevel = getNewLevel(currentXp, currentLevel);
          
          console.log('Calculated New Values:', {
            currentXp,
            currentLevel,
            newLevel,
            xpGain
          });

          // Update XP progress immediately with new values
          const progress = getExperienceProgress(currentXp, newLevel);
          console.log('Setting XP Progress:', progress);
          setBattleXpProgress(progress);

          // Update localStorage and auth state
          updateHolobotExperience(holobot.id, xpGain);
          
          // Update local state after localStorage
          setHolobotXp(prev => {
            const newState = {
              ...prev,
              [selectedLeftHolobot]: currentXp
            };
            console.log('Updating HolobotXP State:', newState);
            return newState;
          });
          
          if (newLevel > currentLevel) {
            setHolobotLevels(prev => ({
              ...prev,
              [selectedLeftHolobot]: newLevel
            }));
            addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} reached level ${newLevel}!`);
          }
          
          addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} wins the battle and gains ${xpGain} XP!`);
          
          // Update user stats
          const updatedStats = {
            wins: (authState.user?.wins || 0) + 1,
            holos: (authState.user?.holos || 0) + 100
          };
          updateUserStats(updatedStats);
          dispatch({ type: 'UPDATE_USER', payload: updatedStats });
        }
      } else {
        // Player loses
        const xpGain = tempRightXp;
        setTempRightXp(0);
        
        // Update XP in local state first
        const newXp = (holobotXp[selectedRightHolobot] || 0) + xpGain;
        setHolobotXp(prev => ({
          ...prev,
          [selectedRightHolobot]: newXp
        }));
        
        // Then update in localStorage and auth state
        const holobot = authState.user?.holobots.find(h => 
          h.name.toLowerCase() === selectedRightHolobot.toLowerCase()
        );
        
        if (holobot) {
          updateHolobotExperience(holobot.id, xpGain);
          
          // Get the updated level
          const currentLevel = holobotLevels[selectedRightHolobot];
          const newLevel = getNewLevel(newXp, currentLevel);
          
          if (newLevel > currentLevel) {
            setHolobotLevels(prev => ({
              ...prev,
              [selectedRightHolobot]: newLevel
            }));
            addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} reached level ${newLevel}!`);
          }
        }
        
        addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} wins the battle and gains ${xpGain} XP!`);
        
        // Update user stats in both context and local storage
        const updatedStats = {
          losses: (authState.user?.losses || 0) + 1
        };
        updateUserStats(updatedStats);
        dispatch({ type: 'UPDATE_USER', payload: updatedStats });
      }
      return;
    }

    const interval = setInterval(() => {
      const isLeftTurn = currentTurn === 'left';
      const attacker = isLeftTurn ? selectedLeftHolobot : selectedRightHolobot;
      const defender = isLeftTurn ? selectedRightHolobot : selectedLeftHolobot;
      
      // Update battle states
      const attackerState = isLeftTurn ? leftBattleState : rightBattleState;
      const defenderState = isLeftTurn ? rightBattleState : leftBattleState;
      
      // Get combat decision with messages
      const { decision, messages } = decideCombatAction(
        HOLOBOT_STATS[attacker],
        attackerState
      );
    
      // Add all decision messages to battle log
      messages.forEach(msg => addToBattleLog(msg));

      // Update styles if needed
      if (decision.styleAdjustment) {
        if (isLeftTurn) {
          setLeftBattleState(prev => ({
            ...prev,
            currentStyle: decision.styleAdjustment!
          }));
        } else {
          setRightBattleState(prev => ({
            ...prev,
            currentStyle: decision.styleAdjustment!
          }));
        }
      }

      if (isLeftTurn) {
        setLeftIsAttacking(true);
      } else {
        setRightIsAttacking(true);
      }

      // Use calculateDamageWithMode instead of calculateDamage
      const result = calculateDamageWithMode(
        HOLOBOT_STATS[attacker],
        HOLOBOT_STATS[defender],
        isLeftTurn ? isDefenseMode : false, // Apply defense mode only for left (player) Holobot
        attackerState.currentCombo
      );
      
      setTimeout(() => {
        if (result.evaded) {
          addToBattleLog(`${HOLOBOT_STATS[defender].name} evaded the attack!`);
          
          // Increase meter gains in defense mode
          const specialGain = calculateSpecialGain(
            HOLOBOT_STATS[defender].intelligence,
            'evade',
            isLeftTurn ? false : isDefenseMode
          );
          
          const hackGain = calculateHackGain(
            HOLOBOT_STATS[defender].intelligence,
            'evade',
            isLeftTurn ? false : isDefenseMode
          );

          if (isLeftTurn) {
            setRightSpecial(prev => Math.min(100, prev + specialGain));
            setRightHack(prev => Math.min(100, prev + hackGain));
          } else {
            setLeftSpecial(prev => Math.min(100, prev + specialGain));
            setLeftHack(prev => Math.min(100, prev + hackGain));
          }

          // Counter attack with defense mode consideration
          const counterResult = calculateDamageWithMode(
            HOLOBOT_STATS[defender],
            HOLOBOT_STATS[attacker],
            !isLeftTurn ? isDefenseMode : false,
            0 // Reset combo for counter attacks
          );
          
          if (isLeftTurn) {
            setLeftHealth(prev => Math.max(0, prev - counterResult.damage));
            setRightSpecial(prev => Math.min(100, prev + specialGain * 0.5));
            setRightHack(prev => Math.min(100, prev + hackGain * 0.5));
            setTempRightXp(prev => prev + Math.floor(counterResult.damage * 2));
          } else {
            setRightHealth(prev => Math.max(0, prev - counterResult.damage));
            setLeftSpecial(prev => Math.min(100, prev + specialGain * 0.5));
            setLeftHack(prev => Math.min(100, prev + hackGain * 0.5));
            setTempLeftXp(prev => prev + Math.floor(counterResult.damage * 2));
          }
          
          addToBattleLog(`${HOLOBOT_STATS[defender].name} counter attacks for ${counterResult.damage} damage!`);
        } else {
          // Regular attack damage
          if (isLeftTurn) {
            setRightIsDamaged(true);
            setRightHealth(prev => Math.max(0, prev - result.damage));
            
            // Adjust meter gains based on combo
            const comboMultiplier = Math.min(1 + (attackerState.currentCombo * 0.1), 1.5);
            setLeftSpecial(prev => Math.min(100, prev + 10 * comboMultiplier));
            setLeftHack(prev => Math.min(100, prev + 5 * comboMultiplier));
            setTempLeftXp(prev => prev + Math.floor(result.damage * 2));
            
            // Add combo message if applicable
            if (attackerState.currentCombo > 1) {
              addToBattleLog(`${HOLOBOT_STATS[attacker].name} maintains a ${attackerState.currentCombo}x combo!`);
            }
          } else {
            setLeftIsDamaged(true);
            setLeftHealth(prev => Math.max(0, prev - result.damage));
            setRightSpecial(prev => Math.min(100, prev + 10));
            setRightHack(prev => Math.min(100, prev + 5));
            setTempRightXp(prev => prev + Math.floor(result.damage * 2));
          }

          addToBattleLog(`${HOLOBOT_STATS[attacker].name} attacks for ${result.damage} damage!`);
        }

        // Update battle states with results
        if (isLeftTurn) {
          const maxCombo = Math.min(10, Math.max(1, Math.floor(HOLOBOT_STATS[selectedLeftHolobot].intelligence / 10)));
          setLeftBattleState(prev => ({
            ...prev,
            lastMoveEffective: !result.evaded,
            currentCombo: result.evaded ? 0 : Math.min(prev.currentCombo + 1, maxCombo),
            enemyVulnerable: result.evaded
          }));
        } else {
          const maxCombo = Math.min(10, Math.max(1, Math.floor(HOLOBOT_STATS[selectedRightHolobot].intelligence / 10)));
          setRightBattleState(prev => ({
            ...prev,
            lastMoveEffective: !result.evaded,
            currentCombo: result.evaded ? 0 : Math.min(prev.currentCombo + 1, maxCombo),
            enemyVulnerable: result.evaded
          }));
        }

        setTimeout(() => {
          if (isLeftTurn) {
            setRightIsDamaged(false);
            setLeftIsAttacking(false);
          } else {
            setLeftIsDamaged(false);
            setRightIsAttacking(false);
          }
          // Switch turns
          setCurrentTurn(prev => prev === 'left' ? 'right' : 'left');
        }, 100); // Reduced from 200ms
      }, 300); // Reduced from 500ms
    }, 1000); // Reduced from 2000ms

    return () => clearInterval(interval);
  }, [isBattleStarted, selectedLeftHolobot, selectedRightHolobot, currentTurn, leftHealth, rightHealth, leftBattleState, rightBattleState]);

  // Initialize holobot levels and XP from auth state
  useEffect(() => {
    if (authState.user?.holobots) {
      const levels: Record<string, number> = {};
      const xp: Record<string, number> = {};
      
      authState.user.holobots.forEach(holobot => {
        levels[holobot.name.toLowerCase()] = holobot.level;
        xp[holobot.name.toLowerCase()] = holobot.experience;
      });
      
      setHolobotLevels(levels);
      setHolobotXp(xp);

      // Update XP progress for selected holobot
      if (selectedLeftHolobot) {
        const progress = getExperienceProgress(
          xp[selectedLeftHolobot] || 0,
          levels[selectedLeftHolobot] || 1
        );
        setBattleXpProgress(progress);
      }
    }
  }, [authState.user?.holobots, selectedLeftHolobot]);

  // Listen for holobot updates
  useEffect(() => {
    const handleHolobotUpdate = (event: CustomEvent) => {
      const { holobotId, level, experience } = event.detail;
      console.log('Holobot Update Event Received:', {
        holobotId,
        level,
        experience,
        selectedHolobot: selectedLeftHolobot
      });

      const holobot = authState.user?.holobots.find(h => h.id === holobotId);
      
      if (holobot) {
        const holobotKey = holobot.name.toLowerCase();
        console.log('Found Matching Holobot:', {
          name: holobot.name,
          key: holobotKey,
          isSelected: holobotKey === selectedLeftHolobot
        });
        
        // Update local state
        setHolobotLevels(prev => {
          const newState = {
            ...prev,
            [holobotKey]: level
          };
          console.log('Updating Holobot Levels:', newState);
          return newState;
        });
        
        setHolobotXp(prev => {
          const newState = {
            ...prev,
            [holobotKey]: experience
          };
          console.log('Updating Holobot XP:', newState);
          return newState;
        });

        // Force update XP progress if this is the selected holobot
        if (holobotKey === selectedLeftHolobot) {
          const progress = getExperienceProgress(experience, level);
          console.log('Updating Battle XP Progress from event:', progress);
          setBattleXpProgress(progress);
        }
      }
    };

    window.addEventListener('holobot-update', handleHolobotUpdate as EventListener);
    return () => {
      window.removeEventListener('holobot-update', handleHolobotUpdate as EventListener);
    };
  }, [authState.user?.holobots, selectedLeftHolobot]);

  const updateHolobotXp = async (holobotKey: string, xpGain: number) => {
    console.log('Updating Holobot XP:', { holobotKey, xpGain });
    await addXp(holobotKey, xpGain);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center mb-1 bg-[#0f1319] p-4 rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
          <BattleControls
            onStartBattle={handleStartBattle}
            onHypeUp={handleHypeUp}
            onHack={handleHack}
            onSpecialAttack={handleSpecialAttack}
            onModeChange={handleModeChange}
            isBattleStarted={isBattleStarted}
            hackGauge={leftHack}
            specialGauge={leftSpecial}
            isHypeCooldown={isHypeCooldown}
            hypeUses={leftHypeUses}
            isDefenseMode={isDefenseMode}
            playerHolobot={HOLOBOT_STATS[selectedLeftHolobot]}
            selectedLeftHolobot={selectedLeftHolobot}
            selectedRightHolobot={selectedRightHolobot}
            onLeftHolobotChange={setSelectedLeftHolobot}
            onRightHolobotChange={setSelectedRightHolobot}
          />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#0f1319] border-cyan-500/20">
              <div className="flex flex-col gap-4 mt-4">
                <BattleLog logs={battleLog} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex justify-center gap-2 mb-2">
          <div className="flex flex-col">
            <HolobotCard 
              stats={{
                ...HOLOBOT_STATS[selectedLeftHolobot], 
                level: holobotLevels[selectedLeftHolobot]
              }} 
              variant="blue" 
            />
            <div className="w-full">
              <ExperienceBar 
                {...getExperienceProgress(
                  holobotXp[selectedLeftHolobot] || 0, 
                  holobotLevels[selectedLeftHolobot]
                )}
                level={holobotLevels[selectedLeftHolobot]}
              />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-holobots-accent font-bold text-xl animate-neon-pulse">VS</span>
          </div>
          <div className="flex flex-col">
            <HolobotCard stats={{...HOLOBOT_STATS[selectedRightHolobot], level: holobotLevels[selectedRightHolobot]}} variant="red" />
          </div>
        </div>
        
        <div className="relative w-full max-w-3xl mx-auto h-24 md:h-32 bg-cyberpunk-background rounded-lg overflow-hidden border-2 border-cyberpunk-border shadow-neon">
          <div className="absolute inset-0 bg-gradient-to-t from-cyberpunk-background to-cyberpunk-primary/5" />
          
          <div className="relative z-10 w-full h-full p-2 md:p-4 flex flex-col">
            <div className="space-y-0.5 md:space-y-1">
              <div className="flex justify-between items-center gap-2 md:gap-4">
                <div className="flex-1 space-y-0.5 md:space-y-1">
                  <StatusBar current={leftHealth} max={100} isLeft={true} type="health" />
                  <StatusBar current={leftSpecial} max={100} isLeft={true} type="special" />
                  <StatusBar current={leftHack} max={100} isLeft={true} type="hack" />
                </div>
                <div className="px-2 py-1 bg-black/50 rounded-lg animate-vs-pulse">
                  <span className="text-white font-bold text-xs md:text-sm">VS</span>
                </div>
                <div className="flex-1 space-y-0.5 md:space-y-1">
                  <StatusBar current={rightHealth} max={100} isLeft={false} type="health" />
                  <StatusBar current={rightSpecial} max={100} isLeft={false} type="special" />
                  <StatusBar current={rightHack} max={100} isLeft={false} type="hack" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex justify-between items-center px-4 md:px-8">
              <div className="relative flex flex-col items-center gap-2">
                <Character isLeft={true} isDamaged={leftIsDamaged} />
                {leftIsAttacking && <AttackParticle isLeft={true} />}
              </div>
              <div className="relative flex items-center">
                <Character isLeft={false} isDamaged={rightIsDamaged} />
                {rightIsAttacking && <AttackParticle isLeft={false} />}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <BattleLog logs={battleLog} />
        </div>

        <div className="w-full max-w-4xl mx-auto mb-4">
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-cyan-500/20">
            <span className="text-xs text-yellow-300 font-bold">XP</span>
            <div className="flex-1">
              <ExperienceBar
                currentXp={xpState.currentProgress.currentXp}
                requiredXp={xpState.currentProgress.requiredXp}
                progress={xpState.currentProgress.progress}
                level={xpState.currentProgress.level}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
