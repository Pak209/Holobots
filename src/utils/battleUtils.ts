import { HolobotStats } from "@/types/holobot";

export const calculateDamage = (attacker: HolobotStats, defender: HolobotStats) => {
  // Calculate base damage
  const baseDamage = Math.max(1, attacker.attack * 2 - defender.defense);

  // Evasion check based on speed comparison
  if (defender.speed > attacker.speed) {
    const evasionChance = (defender.speed - attacker.speed) / (defender.speed + 5);
    if (Math.random() < evasionChance) {
      return { damage: 0, evaded: true };
    }
  }

  return { 
    damage: Math.floor(baseDamage), 
    evaded: false 
  };
};

export const calculateCounterDamage = (defender: HolobotStats, attacker: HolobotStats) => {
  // Counter attacks deal 70% of normal damage
  const baseDamage = Math.max(1, defender.attack * 1.4 - attacker.defense);
  return Math.floor(baseDamage);
};

export const calculateExperience = (level: number) => {
  // Base XP requirement is 100 × Level²
  return 100 * Math.pow(level, 2);
};

export const getNewLevel = (currentXp: number, currentLevel: number) => {
  // Calculate required XP for next level
  const requiredXp = calculateExperience(currentLevel + 1);
  
  // If current XP is enough for next level and not at max level (50)
  if (currentXp >= requiredXp && currentLevel < 50) {
    return currentLevel + 1;
  }
  return currentLevel;
};

export const applyHackBoost = (stats: HolobotStats, type: 'attack' | 'speed' | 'heal', gasTokens: number) => {
  if (gasTokens < 1) return stats;

  const newStats = { ...stats };

  switch (type) {
    case 'attack':
      newStats.attack += Math.floor(newStats.attack * 0.2);
      break;
    case 'speed':
      // All attribute boosts cost 50% hack gauge
      newStats.attack += Math.floor(newStats.attack * 0.3);
      newStats.speed += Math.floor(newStats.speed * 0.3);
      newStats.defense += Math.floor(newStats.defense * 0.3);
      break;
    case 'heal':
      // Heal costs 75% hack gauge
      newStats.maxHealth = Math.min(100, newStats.maxHealth + 50);
      break;
  }

  return newStats;
};

export const getExperienceProgress = (totalXp: number, currentLevel: number) => {
  // Calculate XP thresholds
  const currentLevelXp = calculateExperience(currentLevel);
  const nextLevelXp = calculateExperience(currentLevel + 1);
  
  // Calculate XP within current level
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpRequiredForNextLevel = nextLevelXp - currentLevelXp;
  
  // Calculate progress percentage (0-100)
  const progressPercentage = Math.min(100, Math.max(0, 
    (xpInCurrentLevel / xpRequiredForNextLevel) * 100
  ));

  return {
    currentXp: Math.max(0, xpInCurrentLevel),
    requiredXp: xpRequiredForNextLevel,
    progress: progressPercentage,
    level: currentLevel
  };
};

// Helper function to get total XP needed to reach a level
export const getTotalXpForLevel = (targetLevel: number) => {
  let totalXp = 0;
  for (let level = 1; level <= targetLevel; level++) {
    totalXp += calculateExperience(level);
  }
  return totalXp;
};

export const applySpecialAttack = (stats: HolobotStats, specialGauge: number) => {
  const newStats = { ...stats };
  let damage = 0;
  
  // Full special attack at 100%, half power at 50%
  const powerMultiplier = specialGauge >= 100 ? 1 : 0.5;
  
  switch (stats.specialMove) {
    case "1st Strike":
      damage = Math.floor(40 * powerMultiplier);
      newStats.attack += Math.floor(newStats.attack * 0.3 * powerMultiplier);
      newStats.speed += Math.floor(newStats.speed * 0.3 * powerMultiplier);
      break;
    case "Sharp Claws":
      damage = Math.floor(50 * powerMultiplier);
      newStats.attack += Math.floor(newStats.attack * 0.4 * powerMultiplier);
      break;
    case "Shadow Strike":
      damage = Math.floor(35 * powerMultiplier);
      newStats.speed += Math.floor(newStats.speed * 0.5 * powerMultiplier);
      break;
    case "Counter Claw":
      damage = Math.floor(45 * powerMultiplier);
      newStats.defense += Math.floor(newStats.defense * 0.3 * powerMultiplier);
      break;
    case "Stalk":
      damage = Math.floor(32 * powerMultiplier);
      newStats.speed += Math.floor(6 * powerMultiplier);
      break;
    case "Torrent":
      damage = Math.floor(40 * powerMultiplier);
      break;
    default:
      damage = Math.floor(25 * powerMultiplier);
      newStats.attack += Math.floor(5 * powerMultiplier);
}
  
  return { newStats, damage };
};

export const initializeHolobotStats = (stats: HolobotStats): HolobotStats => {
  return {
    ...stats,
    fatigue: 0,
    gasTokens: 0,
    hackUsed: false,
    specialAttackGauge: 0,
    specialAttackThreshold: 5,
    syncPoints: 0,
    hypeUses: 0 // Track hype uses
  };
};

// Calculate combo multiplier based on INT and consecutive hits
export const calculateComboMultiplier = (
  intelligence: number,
  consecutiveHits: number
): number => {
  // Base multiplier scales with INT (1.0 to 1.5)
  const baseMultiplier = 1 + (intelligence / 200); // 1.0 to 1.5 based on INT
  
  // Max combo hits based on INT (1 to 10)
  const maxComboHits = Math.min(10, Math.max(1, Math.floor(intelligence / 10)));
  
  // Limit consecutive hits to max allowed by INT
  const effectiveHits = Math.min(consecutiveHits, maxComboHits);
  
  // Combo bonus scales with effective hits (up to 50% bonus)
  const comboBonus = (effectiveHits / maxComboHits) * 0.5;
  
  return baseMultiplier + comboBonus;
};

// Calculate meter fill rate based on INT and defensive actions
export const calculateMeterFillRate = (
  intelligence: number,
  actionType: 'evade' | 'guard' | 'counter'
): number => {
  const baseRate = Math.max(1, intelligence / 50); // 1-2x base rate
  
  // Different actions have different base fill amounts
  const actionMultiplier = {
    evade: 0.15,  // 15% fill
    guard: 0.10,  // 10% fill
    counter: 0.20 // 20% fill
  };

  return baseRate * actionMultiplier[actionType] * 100; // Returns percentage to fill
};

// Calculate damage with INT and mode multipliers
export const calculateDamageWithMode = (
  attacker: HolobotStats,
  defender: HolobotStats,
  isDefenseMode: boolean,
  consecutiveHits: number = 0
) => {
  // Get base damage
  const { damage: baseDamage, evaded } = calculateDamage(attacker, defender);
  
  if (evaded) return { damage: 0, evaded: true };

  // Apply mode and combo multipliers
  const comboMultiplier = isDefenseMode ? 0.7 : calculateComboMultiplier(attacker.intelligence, consecutiveHits);
  
  // In defense mode, reduce damage output but increase defense
  const modeMultiplier = isDefenseMode ? 0.6 : 1;
  
  return {
    damage: Math.floor(baseDamage * comboMultiplier * modeMultiplier),
    evaded: false,
    comboMultiplier
  };
};

// Calculate special meter gain from defensive actions
export const calculateSpecialGain = (
  intelligence: number,
  actionType: 'evade' | 'guard' | 'counter',
  isDefenseMode: boolean
): number => {
  const baseGain = calculateMeterFillRate(intelligence, actionType);
  return isDefenseMode ? baseGain * 2 : baseGain; // Double gain in defense mode
};

// Calculate hack meter gain from defensive actions
export const calculateHackGain = (
  intelligence: number,
  actionType: 'evade' | 'guard' | 'counter',
  isDefenseMode: boolean
): number => {
  // Increase base gain rate
  const baseGain = calculateMeterFillRate(intelligence, actionType);
  return isDefenseMode ? baseGain * 2.5 : baseGain; // 2.5x gain in defense mode
};

// Constants for XP calculations
const BASE_BATTLE_XP = 50; // Base XP for same-level fights
const XP_SCALING_FACTOR = 10; // K factor for smoother scaling

// Calculate XP reward based on level difference
export const calculateBattleXpReward = (
  playerLevel: number,
  opponentLevel: number,
  wasVictorious: boolean
): number => {
  // Base XP calculation
  const baseXp = 50;
  
  // Level difference modifier
  const levelDiff = opponentLevel - playerLevel;
  const levelModifier = Math.max(0.5, 1 + (levelDiff * 0.1)); // +10% per level difference
  
  // Victory/Defeat modifier
  const victoryModifier = wasVictorious ? 1 : 0.25;
  
  // Calculate final XP
  const finalXp = Math.floor(baseXp * levelModifier * victoryModifier);
  
  // Ensure minimum XP gain
  return Math.max(10, finalXp);
};

// Example XP rewards:
// - Same level (ΔL = 0):  50 XP
// - +2 levels (ΔL = 2):  60 XP (20% bonus)
// - +5 levels (ΔL = 5):  75 XP (50% bonus)
// - -2 levels (ΔL = -2): 40 XP (20% penalty)
// - -5 levels (ΔL = -5): 25 XP (50% penalty)