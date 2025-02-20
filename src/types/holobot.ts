export type CombatStyle = 'Aggressive' | 'Defensive' | 'Balanced' | 'Technical' | 'Evasive';

export interface BattleState {
  playerHP: number;
  enemyHP: number;
  specialGauge: number;
  hackGauge: number;
  currentCombo: number;
  lastMoveEffective: boolean;
  enemyVulnerable: boolean;
  enemyStaggered: boolean;
  currentStyle: CombatStyle;
}

export interface StatBoosts {
  attack: number;
  defense: number;
  speed: number;
  maxHealth: number;
}

export interface HolobotStats {
  name: string;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  specialMove: string;
  level: number;
  fatigue?: number;
  gasTokens?: number;
  hackUsed?: boolean;
  specialAttackGauge?: number;
  specialAttackThreshold?: number;
  syncPoints?: number;
  intelligence: number;
  combatStyle: CombatStyle;
  learningRate: number;
  battleHistory: BattleRecord[];
  statBoosts?: StatBoosts;
  availableStatPoints?: number;
  hypeUses: number;
}

export interface BattleRecord {
  opponent: string;
  result: 'win' | 'loss';
  effectiveMoves: string[];
  ineffectiveMoves: string[];
  timestamp: number;
}

export interface CombatDecision {
  moveType: 'attack' | 'special' | 'counter' | 'evade' | 'combo';
  timing: number; // 0-100 effectiveness rating
  targetHP: number;
  currentCombo: number;
  styleAdjustment?: CombatStyle;
}

// INT-based behavior patterns
export interface IntBehavior {
  minInt: number;
  maxInt: number;
  specialThreshold: number; // When to use special (% enemy HP)
  comboThreshold: number; // Minimum combo length before special
  counterProbability: number; // 0-1 chance to counter when possible
  evadeProbability: number; // 0-1 chance to evade when possible
  adaptationRate: number; // How quickly style changes (1-10)
  stylePreferences: CombatStyle[];
}

export const INT_BEHAVIOR_TIERS: IntBehavior[] = [
  {
    minInt: 1,
    maxInt: 30,
    specialThreshold: 100,
    comboThreshold: 1,
    counterProbability: 0.2,
    evadeProbability: 0.2,
    adaptationRate: 1,
    stylePreferences: ['Aggressive']
  },
  {
    minInt: 31,
    maxInt: 60,
    specialThreshold: 50,
    comboThreshold: 2,
    counterProbability: 0.5,
    evadeProbability: 0.5,
    adaptationRate: 5,
    stylePreferences: ['Aggressive', 'Balanced']
  },
  {
    minInt: 61,
    maxInt: 90,
    specialThreshold: 30,
    comboThreshold: 3,
    counterProbability: 0.8,
    evadeProbability: 0.8,
    adaptationRate: 8,
    stylePreferences: ['Aggressive', 'Balanced', 'Technical']
  },
  {
    minInt: 91,
    maxInt: 100,
    specialThreshold: 20,
    comboThreshold: 4,
    counterProbability: 0.9,
    evadeProbability: 0.9,
    adaptationRate: 10,
    stylePreferences: ['Aggressive', 'Balanced', 'Technical', 'Evasive']
  }
];

export const HOLOBOT_STATS: { [key: string]: HolobotStats } = {
  ace: {
    name: "ACE",
    maxHealth: 150,
    attack: 8,
    defense: 6,
    speed: 7,
    specialMove: "1st Strike",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 50,
    syncPoints: undefined,
    intelligence: 50,
    battleHistory: [],
    learningRate: 5,
    combatStyle: "Balanced",
    hypeUses: 0
  },
  kuma: {
    name: "KUMA",
    maxHealth: 200,
    attack: 7,
    defense: 5,
    speed: 3,
    specialMove: "Sharp Claws",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 30,
    syncPoints: undefined,
    intelligence: 30,
    battleHistory: [],
    learningRate: 3,
    combatStyle: "Aggressive",
    hypeUses: 0
  },
  shadow: {
    name: "Shadow",
    maxHealth: 170,
    attack: 5,
    defense: 7,
    speed: 4,
    specialMove: "Shadow Strike",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 40,
    syncPoints: undefined,
    intelligence: 40,
    battleHistory: [],
    learningRate: 4,
    combatStyle: "Defensive",
    hypeUses: 0
  },
  hare: {
    name: "HARE",
    maxHealth: 160,
    attack: 4,
    defense: 5,
    speed: 4,
    specialMove: "Counter Claw",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 20,
    syncPoints: undefined,
    intelligence: 20,
    battleHistory: [],
    learningRate: 2,
    combatStyle: "Technical",
    hypeUses: 0
  },
  tora: {
    name: "TORA",
    maxHealth: 180,
    attack: 5,
    defense: 4,
    speed: 6,
    specialMove: "Stalk",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 60,
    syncPoints: undefined,
    intelligence: 60,
    battleHistory: [],
    learningRate: 6,
    combatStyle: "Balanced",
    hypeUses: 0
  },
  wake: {
    name: "WAKE",
    maxHealth: 170,
    attack: 6,
    defense: 3,
    speed: 4,
    specialMove: "Torrent",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 70,
    syncPoints: undefined,
    intelligence: 70,
    battleHistory: [],
    learningRate: 7,
    combatStyle: "Aggressive",
    hypeUses: 0
  },
  era: {
    name: "ERA",
    maxHealth: 165,
    attack: 5,
    defense: 4,
    speed: 6,
    specialMove: "Time Warp",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 80,
    syncPoints: undefined,
    intelligence: 80,
    battleHistory: [],
    learningRate: 8,
    combatStyle: "Balanced",
    hypeUses: 0
  },
  gama: {
    name: "GAMA",
    maxHealth: 180,
    attack: 6,
    defense: 5,
    speed: 3,
    specialMove: "Heavy Leap",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 90,
    syncPoints: undefined,
    intelligence: 90,
    battleHistory: [],
    learningRate: 9,
    combatStyle: "Aggressive",
    hypeUses: 0
  },
  ken: {
    name: "KEN",
    maxHealth: 150,
    attack: 7,
    defense: 3,
    speed: 6,
    specialMove: "Blade Storm",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 40,
    syncPoints: undefined,
    intelligence: 40,
    battleHistory: [],
    learningRate: 4,
    combatStyle: "Technical",
    hypeUses: 0
  },
  kurai: {
    name: "KURAI",
    maxHealth: 190,
    attack: 4,
    defense: 6,
    speed: 3,
    specialMove: "Dark Veil",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 50,
    syncPoints: undefined,
    intelligence: 50,
    battleHistory: [],
    learningRate: 5,
    combatStyle: "Defensive",
    hypeUses: 0
  },
  tsuin: {
    name: "TSUIN",
    maxHealth: 160,
    attack: 6,
    defense: 4,
    speed: 5,
    specialMove: "Twin Strike",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 30,
    syncPoints: undefined,
    intelligence: 30,
    battleHistory: [],
    learningRate: 3,
    combatStyle: "Aggressive",
    hypeUses: 0
  },
  wolf: {
    name: "WOLF",
    maxHealth: 175,
    attack: 5,
    defense: 5,
    speed: 5,
    specialMove: "Lunar Howl",
    level: 1,
    fatigue: undefined,
    gasTokens: undefined,
    hackUsed: undefined,
    specialAttackGauge: undefined,
    specialAttackThreshold: 70,
    syncPoints: undefined,
    intelligence: 70,
    battleHistory: [],
    learningRate: 7,
    combatStyle: "Balanced",
    hypeUses: 0
  }
};

export function getRank(level: number): string {
  if (level >= 41) return "Legendary";
  if (level >= 31) return "Elite";
  if (level >= 21) return "Rare";
  if (level >= 11) return "Champion";
  if (level >= 2) return "Starter";
  return "Rookie";
}

export const MAX_TOTAL_STAT_BOOSTS = 50;
export const MAX_INDIVIDUAL_STAT_BOOST = 20;
export const HP_BOOST_MULTIPLIER = 10;

export function getMaxStatValue(stat: keyof StatBoosts): number {
  return stat === 'maxHealth' ? 500 : 100;
}

export function calculateAvailableStatPoints(level: number, usedPoints: number): number {
  // Each level after 1 grants a stat point
  const totalPoints = Math.max(0, level - 1);
  return Math.max(0, totalPoints - usedPoints);
}

export function getTotalUsedStatPoints(boosts: StatBoosts): number {
  return (
    boosts.attack +
    boosts.defense +
    boosts.speed +
    // Convert HP boosts to equivalent stat points (10 HP = 1 point)
    Math.floor(boosts.maxHealth / HP_BOOST_MULTIPLIER)
  );
}

export function canBoostStat(
  stat: keyof StatBoosts,
  currentBoosts: StatBoosts,
  availablePoints: number
): boolean {
  if (availablePoints <= 0) return false;
  
  const totalUsed = getTotalUsedStatPoints(currentBoosts);
  if (totalUsed >= MAX_TOTAL_STAT_BOOSTS) return false;
  
  const currentStatBoost = currentBoosts[stat];
  const maxBoost = stat === 'maxHealth' 
    ? MAX_INDIVIDUAL_STAT_BOOST * HP_BOOST_MULTIPLIER 
    : MAX_INDIVIDUAL_STAT_BOOST;
    
  return currentStatBoost < maxBoost;
}
