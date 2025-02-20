import { HolobotStats, BattleState, CombatStyle } from "@/types/holobot";

interface IntBehavior {
  min: number;
  max: number;
  name: string;
  specialThreshold: number;
  comboMax: number;
  counterProbability: number;
  evadeProbability: number;
  adaptationRate: number;
  stylePreferences: CombatStyle[];
}

interface CombatDecision {
  action: 'attack' | 'special' | 'counter' | 'evade';
  styleAdjustment?: CombatStyle;
}

interface DecisionResult {
  decision: CombatDecision;
  messages: string[];
}

const INT_BEHAVIOR_TIERS: IntBehavior[] = [
  { 
    min: 0, 
    max: 30, 
    name: 'Novice', 
    specialThreshold: 0.8, 
    comboMax: 2,
    counterProbability: 0.2,
    evadeProbability: 0.2,
    adaptationRate: 1,
    stylePreferences: ['Aggressive']
  },
  { 
    min: 31, 
    max: 60, 
    name: 'Intermediate', 
    specialThreshold: 0.7, 
    comboMax: 3,
    counterProbability: 0.5,
    evadeProbability: 0.5,
    adaptationRate: 5,
    stylePreferences: ['Aggressive', 'Balanced']
  },
  { 
    min: 61, 
    max: 80, 
    name: 'Advanced', 
    specialThreshold: 0.6, 
    comboMax: 4,
    counterProbability: 0.8,
    evadeProbability: 0.8,
    adaptationRate: 8,
    stylePreferences: ['Aggressive', 'Balanced', 'Technical']
  },
  { 
    min: 81, 
    max: 100, 
    name: 'Expert', 
    specialThreshold: 0.5, 
    comboMax: 5,
    counterProbability: 0.9,
    evadeProbability: 0.9,
    adaptationRate: 10,
    stylePreferences: ['Aggressive', 'Balanced', 'Technical', 'Evasive']
  }
];

function getBehaviorTier(intelligence: number): IntBehavior {
  return INT_BEHAVIOR_TIERS.find(tier => 
    intelligence >= tier.min && intelligence <= tier.max
  ) || INT_BEHAVIOR_TIERS[0];
}

function getStyleChangeMessage(holobotName: string, newStyle: CombatStyle, reason: string): string {
  return `${holobotName} adapts their fighting style to ${newStyle} ${reason}!`;
}

function getCombatActionMessage(holobotName: string, action: string, effectiveness: number): string {
  const effectivenessText = effectiveness > 0.8 ? 'masterfully' : 
    effectiveness > 0.6 ? 'skillfully' : 
    effectiveness > 0.4 ? 'adequately' : 'poorly';
  
  return `${holobotName} ${effectivenessText} executes a ${action}!`;
}

export function decideCombatAction(
  holobot: HolobotStats,
  battleState: BattleState
): DecisionResult {
  const messages: string[] = [];
  const tier = getBehaviorTier(holobot.intelligence);
  const effectiveness = Math.min((holobot.intelligence / 100) + Math.random() * 0.3, 1);
  
  // Style adjustment logic based on battle state
  let newStyle: CombatStyle | undefined;
  if (battleState.playerHP < 30 && holobot.combatStyle !== 'Defensive') {
    newStyle = 'Defensive';
    messages.push(getStyleChangeMessage(holobot.name, newStyle, 'to protect their remaining health'));
  } else if (battleState.enemyVulnerable && holobot.combatStyle !== 'Aggressive') {
    newStyle = 'Aggressive';
    messages.push(getStyleChangeMessage(holobot.name, newStyle, 'to capitalize on the enemy\'s vulnerability'));
  } else if (battleState.currentCombo >= tier.comboMax && holobot.combatStyle !== 'Technical') {
    newStyle = 'Technical';
    messages.push(getStyleChangeMessage(holobot.name, newStyle, 'to maintain their combo advantage'));
  }

  // Action decision logic
  let action: CombatDecision['action'];
  if (battleState.specialGauge >= tier.specialThreshold * 100) {
    action = 'special';
    messages.push(getCombatActionMessage(holobot.name, 'special attack', effectiveness));
  } else if (battleState.enemyVulnerable && Math.random() < effectiveness) {
    action = 'counter';
    messages.push(getCombatActionMessage(holobot.name, 'counter attack', effectiveness));
  } else if (battleState.playerHP < 30 && Math.random() < effectiveness) {
    action = 'evade';
    messages.push(getCombatActionMessage(holobot.name, 'evasive maneuver', effectiveness));
  } else {
    action = 'attack';
    messages.push(getCombatActionMessage(holobot.name, 'standard attack', effectiveness));
  }

  return {
    decision: {
      action,
      styleAdjustment: newStyle
    },
    messages
  };
}

// Calculate combat effectiveness based on INT and move timing
export const calculateMoveEffectiveness = (
  intelligence: number,
  action: CombatDecision['action'],
  battleState: BattleState
): number => {
  const baseProbability = intelligence / 100;
  const tier = getBehaviorTier(intelligence);
  
  switch (action) {
    case 'counter':
      return Math.random() < tier.counterProbability ? 1 : 0;
    case 'evade':
      return Math.random() < tier.evadeProbability ? 1 : 0;
    case 'special':
      const hpThreshold = (battleState.enemyHP / 100) * 100;
      return hpThreshold <= tier.specialThreshold * 100 ? 1 : 0.3;
    default:
      return baseProbability;
  }
};

// Determine if style should change based on battle state
export const shouldChangeStyle = (
  intelligence: number,
  battleState: BattleState
): boolean => {
  const tier = getBehaviorTier(intelligence);
  const adaptationChance = tier.specialThreshold / 10;
  
  // More likely to change style when:
  // 1. Current style isn't effective (lastMoveEffective is false)
  // 2. HP is low (below 30%)
  // 3. Enemy is vulnerable
  const shouldAdapt = 
    (!battleState.lastMoveEffective && Math.random() < adaptationChance) ||
    (battleState.playerHP < 30 && Math.random() < adaptationChance * 1.5) ||
    (battleState.enemyVulnerable && Math.random() < adaptationChance * 2);
    
  return shouldAdapt;
};

// Choose new combat style based on INT and battle state
export const chooseCombatStyle = (
  intelligence: number,
  battleState: BattleState
): CombatStyle => {
  const tier = getBehaviorTier(intelligence);
  
  if (battleState.playerHP < 30) {
    // Favor defensive styles when low on HP
    return Math.random() < 0.7 ? 'Defensive' : 'Technical';
  }
  
  if (battleState.enemyVulnerable) {
    // Favor aggressive styles when enemy is vulnerable
    return Math.random() < 0.7 ? 'Aggressive' : 'Technical';
  }
  
  if (battleState.currentCombo >= 3) {
    // Favor technical style during long combos
    return 'Technical';
  }
  
  // Otherwise, randomly choose from available styles based on INT tier
  return tier.stylePreferences[
    Math.floor(Math.random() * tier.stylePreferences.length)
  ];
};

// Update INT based on battle outcome
export const updateIntelligence = (
  holobot: HolobotStats,
  opponent: string,
  won: boolean,
  effectiveMoves: string[],
  ineffectiveMoves: string[]
): HolobotStats => {
  const newHolobot = { ...holobot };
  
  // Base INT change
  const baseChange = won ? 2 : -1;
  
  // Adjust based on move effectiveness
  const effectiveBonus = effectiveMoves.length * 0.5;
  const ineffectivePenalty = ineffectiveMoves.length * -0.3;
  
  // Apply learning rate modifier
  const totalChange = (baseChange + effectiveBonus + ineffectivePenalty) * 
    (holobot.learningRate / 5);
  
  // Update INT within bounds
  newHolobot.intelligence = Math.max(1, Math.min(100, 
    holobot.intelligence + totalChange
  ));
  
  // Update battle history
  newHolobot.battleHistory.push({
    opponent,
    result: won ? 'win' : 'loss',
    effectiveMoves,
    ineffectiveMoves,
    timestamp: Date.now()
  });
  
  // Trim history to last 10 battles
  if (newHolobot.battleHistory.length > 10) {
    newHolobot.battleHistory = newHolobot.battleHistory.slice(-10);
  }
  
  return newHolobot;
}; 
