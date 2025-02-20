import { UserData, UserHolobot } from '@/types/user';
import { HolobotStats, StatBoosts, calculateAvailableStatPoints, getTotalUsedStatPoints, canBoostStat } from '@/types/holobot';
import { calculateExperience, getNewLevel } from './battleUtils';

// Constants
const STORAGE_KEYS = {
  AUTH_STATE: 'AUTH_STATE',
  HOLOBOTS_STATE: 'HOLOBOTS_STATE',
  TRAINING_EFFECTS: 'TRAINING_EFFECTS',
  USER_STATS: 'USER_STATS'
};

interface TrainingEffect {
  holobotId: string;
  attribute: 'attack' | 'defense' | 'speed' | 'maxHealth';
  boost: number;
  expiresAt: number;
}

interface PermanentBoost {
  holobotId: string;
  attribute: 'attack' | 'defense' | 'speed' | 'maxHealth';
  boost: number;
}

interface HolobotState extends UserHolobot {
  permanentBoosts: PermanentBoost[];
  trainingEffects: TrainingEffect[];
  statBoosts: StatBoosts;
  availableStatPoints: number;
}

// Initialize default user data
export const initializeUserData = (username: string): UserData => {
  const userData: UserData = {
    id: Math.random().toString(36).substr(2, 9),
    username,
    holos: 1000, // Starting currency
    dailyEnergy: 100,
    maxEnergy: 100,
    lastEnergyRefresh: Date.now(),
    holobots: [],
    wins: 0,
    losses: 0
  };

  // Save to local storage with isLoggedIn flag
  const authState = {
    isLoggedIn: true,
    userData
  };
  
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
  return userData;
};

// Get user data from local storage
export const getUserData = (): UserData | null => {
  const authState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  if (!authState) return null;

  try {
    const { userData } = JSON.parse(authState);
    return userData;
  } catch {
    return null;
  }
};

// Update user stats
export const updateUserStats = (
  updates: Partial<UserData>
): UserData => {
  const currentData = getUserData();
  if (!currentData) throw new Error('No user data found');

  const updatedData = {
    ...currentData,
    ...updates
  };

  // Save updated data with isLoggedIn flag
  const authState = {
    isLoggedIn: true,
    userData: updatedData
  };
  
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
  return updatedData;
};

// Initialize a new Holobot with default stat boosts
export const addHolobot = (baseStats: HolobotStats): UserHolobot => {
  const userData = getUserData();
  if (!userData) throw new Error('No user data found');

  const newHolobot: UserHolobot = {
    id: Math.random().toString(36).substr(2, 9),
    userId: userData.id,
    ...baseStats,
    wins: 0,
    losses: 0,
    experience: 0,
    level: 1,
    statBoosts: {
      attack: 0,
      defense: 0,
      speed: 0,
      maxHealth: 0
    },
    availableStatPoints: 0
  };

  // Update user's holobots array
  const updatedHolobots = [...(userData.holobots || []), newHolobot];
  const updatedUserData = updateUserStats({ holobots: updatedHolobots });

  // Initialize Holobot state
  const holobotState: HolobotState = {
    ...newHolobot,
    permanentBoosts: [],
    trainingEffects: [],
    statBoosts: {
      attack: 0,
      defense: 0,
      speed: 0,
      maxHealth: 0
    },
    availableStatPoints: 0
  };

  saveHolobotState(holobotState);
  return newHolobot;
};

// Save Holobot state
export const saveHolobotState = (holobotState: HolobotState): void => {
  const currentStates = getHolobotStates();
  const updatedStates = {
    ...currentStates,
    [holobotState.id]: holobotState
  };

  localStorage.setItem(STORAGE_KEYS.HOLOBOTS_STATE, JSON.stringify(updatedStates));
};

// Get all Holobot states
export const getHolobotStates = (): Record<string, HolobotState> => {
  const states = localStorage.getItem(STORAGE_KEYS.HOLOBOTS_STATE);
  return states ? JSON.parse(states) : {};
};

// Add permanent boost to Holobot
export const addPermanentBoost = (
  holobotId: string,
  attribute: PermanentBoost['attribute'],
  boost: number
): void => {
  const states = getHolobotStates();
  const holobotState = states[holobotId];
  if (!holobotState) throw new Error('Holobot not found');

  const newBoost: PermanentBoost = {
    holobotId,
    attribute,
    boost
  };

  holobotState.permanentBoosts.push(newBoost);
  saveHolobotState(holobotState);
};

// Add training effect
export const addTrainingEffect = (
  holobotId: string,
  attribute: TrainingEffect['attribute'],
  boost: number,
  durationMs: number
): void => {
  const states = getHolobotStates();
  const holobotState = states[holobotId];
  if (!holobotState) throw new Error('Holobot not found');

  const newEffect: TrainingEffect = {
    holobotId,
    attribute,
    boost,
    expiresAt: Date.now() + durationMs
  };

  // Remove expired effects
  holobotState.trainingEffects = holobotState.trainingEffects.filter(
    effect => effect.expiresAt > Date.now()
  );
  
  holobotState.trainingEffects.push(newEffect);
  saveHolobotState(holobotState);
};

// Get Holobot with all active boosts applied
export const getHolobotWithBoosts = (holobotId: string): HolobotStats | null => {
  const states = getHolobotStates();
  const holobotState = states[holobotId];
  if (!holobotState) return null;

  // Start with base stats
  const boostedStats = { ...holobotState };

  // Apply permanent boosts
  holobotState.permanentBoosts.forEach(boost => {
    boostedStats[boost.attribute] += boost.boost;
  });

  // Apply active training effects
  const now = Date.now();
  holobotState.trainingEffects
    .filter(effect => effect.expiresAt > now)
    .forEach(effect => {
      boostedStats[effect.attribute] += effect.boost;
    });

  return boostedStats;
};

// Refresh daily energy
export const refreshDailyEnergy = (): void => {
  const userData = getUserData();
  if (!userData) return;

  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  if (now - userData.lastEnergyRefresh >= dayInMs) {
    updateUserStats({
      dailyEnergy: userData.maxEnergy,
      lastEnergyRefresh: now
    });
  }
};

// Use energy
export const useEnergy = (amount: number): boolean => {
  const userData = getUserData();
  if (!userData || userData.dailyEnergy < amount) return false;

  updateUserStats({
    dailyEnergy: userData.dailyEnergy - amount
  });
  return true;
};

// Update Holobot experience and level
export const updateHolobotExperience = (
  holobotId: string,
  experienceGained: number
): void => {
  // Get current states
  const states = getHolobotStates();
  const holobotState = states[holobotId];
  if (!holobotState) return;

  // Get current auth state
  const authState = localStorage.getItem('AUTH_STATE');
  if (!authState) return;

  try {
    const auth = JSON.parse(authState);
    if (!auth.userData?.holobots) return;

    // Update experience in holobot state
    holobotState.experience += experienceGained;
    
    // Calculate new level
    const currentLevel = holobotState.level;
    const newLevel = getNewLevel(holobotState.experience, currentLevel);
    
    // Update level if changed
    if (newLevel > currentLevel) {
      holobotState.level = newLevel;
    }

    // Update holobot in auth state
    auth.userData.holobots = auth.userData.holobots.map(h => 
      h.id === holobotId 
        ? { 
            ...h, 
            level: holobotState.level, 
            experience: holobotState.experience 
          }
        : h
    );

    // Save both states atomically
    localStorage.setItem('AUTH_STATE', JSON.stringify(auth));
    saveHolobotState(holobotState);

    // Dispatch a custom event to notify components of the update
    window.dispatchEvent(new CustomEvent('holobot-update', {
      detail: {
        holobotId,
        level: holobotState.level,
        experience: holobotState.experience
      }
    }));
  } catch (error) {
    console.error('Failed to update holobot experience:', error);
  }
};

// Apply a stat boost to a Holobot
export const applyStatBoost = (
  holobotId: string,
  stat: keyof StatBoosts,
  amount: number
): void => {
  console.log('Starting applyStatBoost:', { holobotId, stat, amount });

  const authState = localStorage.getItem('AUTH_STATE');
  if (!authState) {
    console.error('No auth state found');
    throw new Error('No auth state found');
  }

  try {
    const auth = JSON.parse(authState);
    const holobot = auth.userData.holobots.find((h: any) => h.id === holobotId);

    if (!holobot) {
      console.error('Holobot not found:', holobotId);
      throw new Error('Holobot not found');
    }

    console.log('Current holobot state:', {
      holobot,
      currentBoosts: holobot.statBoosts,
      availablePoints: holobot.availableStatPoints
    });

    // Initialize statBoosts if it doesn't exist
    if (!holobot.statBoosts) {
      console.log('Initializing statBoosts');
      holobot.statBoosts = {
        attack: 0,
        defense: 0,
        speed: 0,
        maxHealth: 0
      };
    }

    // Ensure availableStatPoints is initialized
    if (typeof holobot.availableStatPoints === 'undefined') {
      console.log('Initializing availableStatPoints');
      holobot.availableStatPoints = holobot.level;
    }

    if (holobot.availableStatPoints <= 0) {
      console.error('No available stat points');
      throw new Error('No available stat points');
    }

    // Apply the boost
    holobot.statBoosts[stat] += amount;
    holobot.availableStatPoints--;

    console.log('Updated holobot state:', {
      newBoosts: holobot.statBoosts,
      remainingPoints: holobot.availableStatPoints
    });

    // Save updated state
    localStorage.setItem('AUTH_STATE', JSON.stringify(auth));

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('holobot-update', {
      detail: {
        holobotId,
        statBoosts: holobot.statBoosts,
        availableStatPoints: holobot.availableStatPoints
      }
    }));
  } catch (error) {
    console.error('Error in applyStatBoost:', error);
    throw error;
  }
}; 