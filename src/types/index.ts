export type GoalStatus = 'not-started' | 'in-progress' | 'completed';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string;
  status: GoalStatus;
  roadmapId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  description: string;
  mermaidCode: string;
  goalIds: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currentStreak: number;
  longestStreak: number;
  totalGoalsCompleted: number;
  badges: string[];
  lastActiveDate: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'goals' | 'roadmaps';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deadline' | 'streak' | 'achievement' | 'goal-complete';
  read: boolean;
  createdAt: string;
}

export const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first-goal', name: 'First Step', description: 'Complete your first goal', icon: '🎯', requirement: 1, type: 'goals' },
  { id: 'five-goals', name: 'Goal Getter', description: 'Complete 5 goals', icon: '⭐', requirement: 5, type: 'goals' },
  { id: 'ten-goals', name: 'Achiever', description: 'Complete 10 goals', icon: '🏆', requirement: 10, type: 'goals' },
  { id: 'streak-3', name: 'On Fire', description: '3 day streak', icon: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak-7', name: 'Week Warrior', description: '7 day streak', icon: '💪', requirement: 7, type: 'streak' },
  { id: 'streak-30', name: 'Monthly Master', description: '30 day streak', icon: '👑', requirement: 30, type: 'streak' },
  { id: 'first-roadmap', name: 'Path Finder', description: 'Create your first roadmap', icon: '🗺️', requirement: 1, type: 'roadmaps' },
];
