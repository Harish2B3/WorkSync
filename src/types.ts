
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  projectId: string;
  assignedTo?: string;
}
