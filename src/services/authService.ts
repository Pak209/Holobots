import { UserData } from '@/types/user';

interface LoginCredentials {
  username: string;
  password: string;
}

export async function loginUser({ username, password }: LoginCredentials): Promise<UserData> {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  // Get existing user data or create new
  const authState = localStorage.getItem('AUTH_STATE');
  let userData: UserData;

  if (authState) {
    try {
      const { userData: existingUser } = JSON.parse(authState);
      if (existingUser && existingUser.username === username) {
        // TODO: In a real app, we would verify the password here
        userData = existingUser;
      } else {
        // Create new user if username doesn't match
        userData = createNewUser(username);
      }
    } catch {
      // If JSON parse fails, create new user
      userData = createNewUser(username);
    }
  } else {
    // Create new user if no auth state exists
    userData = createNewUser(username);
  }

  // Save updated auth state
  const newAuthState = {
    isLoggedIn: true,
    userData
  };
  localStorage.setItem('AUTH_STATE', JSON.stringify(newAuthState));

  return userData;
}

function createNewUser(username: string): UserData {
  return {
    id: Math.random().toString(36).substr(2, 9),
    username,
    holos: 1000,
    dailyEnergy: 100,
    maxEnergy: 100,
    lastEnergyRefresh: Date.now(),
    holobots: [],
    wins: 0,
    losses: 0
  };
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('AUTH_STATE');
  localStorage.removeItem('HOLOBOTS_STATE');
  localStorage.removeItem('TRAINING_EFFECTS');
  localStorage.removeItem('USER_STATS');
}

export function checkAuthState(): { isLoggedIn: boolean; userData: UserData | null } {
  const authState = localStorage.getItem('AUTH_STATE');
  if (!authState) {
    return { isLoggedIn: false, userData: null };
  }

  try {
    const auth = JSON.parse(authState);
    return {
      isLoggedIn: !!auth.isLoggedIn,
      userData: auth.userData
    };
  } catch {
    return { isLoggedIn: false, userData: null };
  }
}

export async function updateUserData(userData: Partial<UserData>): Promise<UserData> {
  const authState = localStorage.getItem('AUTH_STATE');
  if (!authState) {
    throw new Error('No auth state found');
  }

  try {
    const auth = JSON.parse(authState);
    const updatedUserData = {
      ...auth.userData,
      ...userData
    };

    // Update auth state with new user data
    const newAuthState = {
      isLoggedIn: true,
      userData: updatedUserData
    };
    localStorage.setItem('AUTH_STATE', JSON.stringify(newAuthState));

    return updatedUserData;
  } catch (error) {
    throw new Error('Failed to update user data');
  }
}

export async function checkEnergyAndRefresh(): Promise<number> {
  const authState = localStorage.getItem('AUTH_STATE');
  if (!authState) {
    throw new Error('No auth state found');
  }

  const auth = JSON.parse(authState);
  const userData = auth.userData;
  const now = Date.now();
  
  // Check if it's been 24 hours since last refresh
  if (now - userData.lastEnergyRefresh >= 24 * 60 * 60 * 1000) {
    userData.dailyEnergy = userData.maxEnergy;
    userData.lastEnergyRefresh = now;
    
    // Update auth state
    const newAuthState = {
      ...auth,
      userData: {
        ...userData
      }
    };
    localStorage.setItem('AUTH_STATE', JSON.stringify(newAuthState));
  }

  return userData.dailyEnergy;
}

export async function useEnergy(amount: number): Promise<number> {
  const authState = localStorage.getItem('AUTH_STATE');
  if (!authState) {
    throw new Error('No auth state found');
  }

  const auth = JSON.parse(authState);
  const userData = auth.userData;
  
  if (userData.dailyEnergy < amount) {
    throw new Error(`Insufficient energy. Required: ${amount}, Available: ${userData.dailyEnergy}`);
  }

  userData.dailyEnergy -= amount;
  
  // Update auth state
  const newAuthState = {
    ...auth,
    userData: {
      ...userData
    }
  };
  localStorage.setItem('AUTH_STATE', JSON.stringify(newAuthState));

  return userData.dailyEnergy;
} 
