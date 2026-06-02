export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type SnagStatus = 'open' | 'resolved';
export type SnagPriority = 'low' | 'medium' | 'high';

export interface Attachment {
  name: string;
  url: string;
  size?: number;
  uploadedBy: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  projectUrl: string;
  ownerId: string;
  ownerEmail: string;
  memberEmails: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  details: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // email of team member
  timelineStart: string; // YYYY-MM-DD
  timelineEnd: string; // YYYY-MM-DD (deadline)
  snagsCount: number;
  attachments: Attachment[];
  createdAt: any;
  updatedAt: any;
}

export interface Comment {
  id: string;
  projectId: string;
  taskId: string;
  text: string;
  author: string; // Name or email
  authorUid: string;
  createdAt: any;
}

export interface Snag {
  id: string;
  projectId: string;
  description: string;
  status: SnagStatus;
  priority: SnagPriority;
  taskId: string | null; // Optional link to a task
  assignedTo: string; // email of team member
  createdAt: any;
  updatedAt: any;
  resolvedAt?: any;
  resolvedBy?: string | null;
}

export interface TeamMember {
  email: string;
  name: string;
  role: string;
  color: string; // Tailwind color class for avatars
  initials: string;
}

// Exactly 5 dedicated team members for collaboration simulation, plus the current user
export const TEAM_MEMBERS: TeamMember[] = [
  {
    email: 'alice@company.com',
    name: 'Alice Chen',
    role: 'Product Manager',
    color: 'bg-emerald-500 text-white',
    initials: 'AC'
  },
  {
    email: 'bob@company.com',
    name: 'Bob Johnson',
    role: 'Frontend Engineer',
    color: 'bg-sky-500 text-white',
    initials: 'BJ'
  },
  {
    email: 'charlie@company.com',
    name: 'Charlie Smith',
    role: 'Backend Engineer',
    color: 'bg-indigo-500 text-white',
    initials: 'CS'
  },
  {
    email: 'diana@company.com',
    name: 'Diana Prince',
    role: 'UX Designer',
    color: 'bg-rose-500 text-white',
    initials: 'DP'
  },
  {
    email: 'ethan@company.com',
    name: 'Ethan Hunt',
    role: 'QA & DevOps',
    color: 'bg-amber-500 text-white',
    initials: 'EH'
  }
];
