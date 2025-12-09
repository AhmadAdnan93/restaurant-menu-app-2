// Authentication utilities for Frontend

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface User {
  id: string;
  email: string;
  role: string;
  restaurantId?: string;
}

export const auth = {
  // Save token and user data
  setAuth: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // Get token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get user data
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return auth.getToken() !== null;
  },

  // Check if user is Super Admin
  isSuperAdmin: (): boolean => {
    const user = auth.getUser();
    return user?.role === 'SUPER_ADMIN';
  },

  // Check if user is Restaurant Owner
  isRestaurantOwner: (): boolean => {
    const user = auth.getUser();
    return user?.role === 'RESTAURANT_OWNER';
  },

  // Clear auth data
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};

