export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export type ThemeColor = 'default' | 'teal' | 'violet';

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