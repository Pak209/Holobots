import { createContext, useContext, useReducer, ReactNode } from 'react';
import { getExperienceProgress, getNewLevel } from '@/utils/battleUtils';
import { updateHolobotExperience } from '@/utils/localStorageUtils';

interface XpState {
  holobotXp: Record<string, number>;
  holobotLevels: Record<string, number>;
  currentProgress: {
    currentXp: number;
    requiredXp: number;
    progress: number;
    level: number;
  };
  selectedHolobot: string | null;
}

type XpAction =
  | { type: 'SET_INITIAL_STATE'; payload: { xp: Record<string, number>; levels: Record<string, number> } }
  | { type: 'SELECT_HOLOBOT'; payload: string }
  | { type: 'ADD_XP'; payload: { holobotId: string; xpGain: number } }
  | { type: 'UPDATE_PROGRESS'; payload: XpState['currentProgress'] }
  | { type: 'SYNC_STATE'; payload: { xp: Record<string, number>; levels: Record<string, number> } };

const initialState: XpState = {
  holobotXp: {},
  holobotLevels: {},
  currentProgress: {
    currentXp: 0,
    requiredXp: 0,
    progress: 0,
    level: 1
  },
  selectedHolobot: null
};

function xpReducer(state: XpState, action: XpAction): XpState {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return {
        ...state,
        holobotXp: action.payload.xp,
        holobotLevels: action.payload.levels
      };

    case 'SELECT_HOLOBOT':
      const holobot = action.payload.toLowerCase();
      const progress = getExperienceProgress(
        state.holobotXp[holobot] || 0,
        state.holobotLevels[holobot] || 1
      );
      return {
        ...state,
        selectedHolobot: holobot,
        currentProgress: progress
      };

    case 'ADD_XP': {
      const { holobotId, xpGain } = action.payload;
      const holobotKey = holobotId.toLowerCase();
      const currentXp = (state.holobotXp[holobotKey] || 0) + xpGain;
      const currentLevel = state.holobotLevels[holobotKey] || 1;
      const newLevel = getNewLevel(currentXp, currentLevel);
      const progress = getExperienceProgress(currentXp, newLevel);

      return {
        ...state,
        holobotXp: {
          ...state.holobotXp,
          [holobotKey]: currentXp
        },
        holobotLevels: {
          ...state.holobotLevels,
          [holobotKey]: newLevel
        },
        currentProgress: holobotKey === state.selectedHolobot ? progress : state.currentProgress
      };
    }

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        currentProgress: action.payload
      };

    case 'SYNC_STATE':
      return {
        ...state,
        holobotXp: action.payload.xp,
        holobotLevels: action.payload.levels
      };

    default:
      return state;
  }
}

const XpContext = createContext<{
  state: XpState;
  dispatch: React.Dispatch<XpAction>;
  addXp: (holobotId: string, xpGain: number) => Promise<void>;
  selectHolobot: (holobotName: string) => void;
} | null>(null);

export function XpProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(xpReducer, initialState);

  const addXp = async (holobotId: string, xpGain: number) => {
    try {
      console.log('Adding XP:', { holobotId, xpGain });
      
      // Update local state first (optimistic update)
      dispatch({ type: 'ADD_XP', payload: { holobotId, xpGain } });
      
      // Then update storage
      await updateHolobotExperience(holobotId, xpGain);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('holobot-update', {
        detail: {
          holobotId,
          experience: state.holobotXp[holobotId.toLowerCase()],
          level: state.holobotLevels[holobotId.toLowerCase()]
        }
      }));

      console.log('XP Update Complete:', {
        holobotId,
        newXp: state.holobotXp[holobotId.toLowerCase()],
        newLevel: state.holobotLevels[holobotId.toLowerCase()]
      });
    } catch (error) {
      console.error('Failed to update XP:', error);
      // TODO: Implement rollback mechanism
    }
  };

  const selectHolobot = (holobotName: string) => {
    console.log('Selecting Holobot:', holobotName);
    dispatch({ type: 'SELECT_HOLOBOT', payload: holobotName });
  };

  return (
    <XpContext.Provider value={{ state, dispatch, addXp, selectHolobot }}>
      {children}
    </XpContext.Provider>
  );
}

export function useXp() {
  const context = useContext(XpContext);
  if (!context) {
    throw new Error('useXp must be used within an XpProvider');
  }
  return context;
} 