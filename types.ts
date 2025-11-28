
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type ThemeColor = 'default' | 'teal' | 'violet';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  building: string;
  features: string[];
  image: string;
}

export interface ScheduleItem {
  id: string;
  roomId: string;
  subject: string;
  section?: string;
  teacher: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  color: string;
}

export interface DayOption {
  value: string;
  label: string;
}

export interface TimeSlot {
  time: string;
  label: string;
}

export interface UtilizationData {
  name: string;
  usage: number;
}
