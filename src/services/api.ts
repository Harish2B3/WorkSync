
import axios from 'axios';
import { User } from '../types';

const api = axios.create({
  baseURL: '/api'
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (missing token) or 403 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/signup');
      if (!isAuthRoute) {
        // Clear session and force re-login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string, role: string): Promise<{token: string, user: User}> => {
    const { data } = await api.post('/auth/login', { email, password, role });
    return data;
  },
  signup: async (name: string, email: string, password: string, role: string): Promise<{token: string, user: User}> => {
    const { data } = await api.post('/auth/signup', { name, email, password, role });
    return data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  updatePassword: async (newPassword: string) => {
    const { data } = await api.put('/auth/password', { newPassword });
    return data;
  }
};

export const projectsApi = {
  getProjects: async () => {
    const { data } = await api.get('/projects');
    return data;
  },
  createProject: async (project: { name: string, description: string }) => {
    const { data } = await api.post('/projects', project);
    return data;
  },
  updateProject: async (id: string, updates: Partial<{ name: string, description: string, pinned: boolean }>) => {
    const { data } = await api.put(`/projects/${id}`, updates);
    return data;
  },
  deleteProject: async (id: string) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  }
};

export const usersApi = {
  getUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  collaborate: async (userId: string, leaderName?: string) => {
    const { data } = await api.post('/collaborate', { userId, leaderName });
    return data;
  },
  getCollaborations: async () => {
    const { data } = await api.get('/collaborations');
    return data;
  },
  acceptInvitation: async (invitationId: string) => {
    const { data } = await api.post(`/collaborate/accept/${invitationId}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/stats');
    return data;
  },
  updateUser: async (id: string, updates: any) => {
    const { data } = await api.put(`/users/${id}`, updates);
    return data;
  },
  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
  deleteCollaboration: async (id: string) => {
    const { data } = await api.delete(`/collaborate/${id}`);
    return data;
  }
};

export const tasksApi = {
  getTasks: async () => {
    const { data } = await api.get('/tasks');
    return data;
  },
  createTask: async (task: { title: string, description?: string, dueDate?: string, projectId?: string, assignedTo?: string, assignedToId?: string }) => {
    const payload = { ...task, assignedToId: task.assignedTo || task.assignedToId };
    const { data } = await api.post('/tasks', payload);
    return data;
  },
  updateTask: async (id: string, updates: Partial<{ title: string, description: string, dueDate: string, status: string, assignedTo: string | null, assignedToId: string | null }>) => {
    const payload = { ...updates, assignedToId: updates.assignedTo !== undefined ? updates.assignedTo : updates.assignedToId };
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data;
  },
  deleteTask: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  }
};

export default api;
