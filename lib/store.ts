/**
 * Simple user store for authentication state management
 * Provides functions to get and set user data in localStorage
 */

const USER_STORAGE_KEY = 'instaInrUser';

export interface User {
  id: string;
  address?: string;
  nullifierHash?: string;
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Get the current user from local storage
 * @returns User object or null if not logged in
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;
    
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
}

/**
 * Set the current user in local storage
 * @param user User object to store
 */
export function setUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (user === null) {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error storing user data:', error);
  }
}

/**
 * Clear user data from local storage
 */
export function clearUser(): void {
  setUser(null);
} 