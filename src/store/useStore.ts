
import {create} from 'zustand';
import {User} from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

interface DataState {
  tasks: any[];
  projects: any[];
  users: any[];
  collaborations: any[];
  isLoaded: boolean;
  isLoading: boolean;
  fetchData: (force?: boolean) => Promise<void>;
}

import { tasksApi, projectsApi, usersApi } from '../services/api';

export const useDataStore = create<DataState>((set, get) => ({
  tasks: [],
  projects: [],
  users: [],
  collaborations: [],
  isLoaded: false,
  isLoading: false,
  fetchData: async (force = false) => {
    if (get().isLoaded && !force) return;
    
    set({ isLoading: true });
    try {
      const [t, p, u, c] = await Promise.all([
        tasksApi.getTasks(),
        projectsApi.getProjects(),
        usersApi.getUsers(),
        usersApi.getCollaborations()
      ]);
      set({ tasks: t || [], projects: p || [], users: u || [], collaborations: c || [], isLoaded: true });
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
