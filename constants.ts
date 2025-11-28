import { Room, ScheduleItem, DayOption } from './types';

export const DAYS_OF_WEEK: DayOption[] = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
];

export const SECTIONS = [
  'BSCS 1-A', 'BSCS 1-B', 'BSCS 1-C', 'BSCS 1-D',
  'BSCS 2-A', 'BSCS 2-B', 'BSCS 2-C', 'BSCS 2-D',
  'BSCS 3-A', 'BSCS 3-B', 'BSCS 3-C', 'BSCS 3-D',
  'BSCS 4-A', 'BSCS 4-B', 'BSCS 4-C', 'BSCS 4-D'
];

export const MOCK_ROOMS: Room[] = [
  // 1st Floor
  {
    id: 'cc101',
    name: 'CC101',
    capacity: 45,
    building: 'Comscie Building',
    features: ['Computer Lab', 'Smart Projector', 'AC'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cc102',
    name: 'CC102',
    capacity: 45,
    building: 'Comscie Building',
    features: ['Computer Lab', 'Whiteboard', 'AC'],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cc103',
    name: 'CC103',
    capacity: 60,
    building: 'Comscie Building',
    features: ['Lecture Hall', 'Audio System', 'AC'],
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80'
  },
  // 2nd Floor
  {
    id: 'cc201',
    name: 'CC201',
    capacity: 40,
    building: 'Comscie Building',
    features: ['Lecture Room', 'Projector', 'Whiteboard'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cc202',
    name: 'CC202',
    capacity: 40,
    building: 'Comscie Building',
    features: ['Lecture Room', 'Smart TV', 'AC'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cc203',
    name: 'CC203',
    capacity: 35,
    building: 'Comscie Building',
    features: ['Seminar Room', 'Round Tables', 'AC'],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80'
  },
  // 3rd Floor
  {
    id: 'cc301',
    name: 'CC301',
    capacity: 30,
    building: 'Comscie Building',
    features: ['Networking Lab', 'Server Racks', 'AC'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cc302',
    name: 'CC302',
    capacity: 30,
    building: 'Comscie Building',
    features: ['Hardware Lab', 'Workbenches'],
    image: 'https://images.unsplash.com/photo-1593642632823-8f785e67ac73?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cc303',
    name: 'CC303',
    capacity: 25,
    building: 'Comscie Building',
    features: ['Research Lab', 'Meeting Area', 'AC'],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
  }
];

// Helper to set a default "Semester" range for mock data (Current Year)
const CURRENT_YEAR = new Date().getFullYear();
const SEM_START = `${CURRENT_YEAR}-01-01`;
const SEM_END = `${CURRENT_YEAR}-12-31`;

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    roomId: 'cc101',
    subject: 'Intro to Programming',
    section: 'BSCS 1-A',
    teacher: 'Dr. Smith',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 's2',
    roomId: 'cc101',
    subject: 'Data Structures',
    section: 'BSCS 2-B',
    teacher: 'Prof. Johnson',
    dayOfWeek: 'Monday',
    startTime: '11:00',
    endTime: '12:30',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 's3',
    roomId: 'cc201',
    subject: 'Web Development',
    section: 'BSCS 3-A',
    teacher: 'Dr. Emily',
    dayOfWeek: 'Tuesday',
    startTime: '14:00',
    endTime: '16:00',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    id: 's4',
    roomId: 'cc301',
    subject: 'Computer Networks',
    section: 'BSCS 3-C',
    teacher: 'Mr. Brown',
    dayOfWeek: 'Wednesday',
    startTime: '09:00',
    endTime: '11:00',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  },
  {
    id: 's5',
    roomId: 'cc102',
    subject: 'Database Systems',
    section: 'BSCS 2-A',
    teacher: 'Prof. Davis',
    dayOfWeek: 'Tuesday',
    startTime: '10:00',
    endTime: '12:00',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-red-100 border-red-300 text-red-800'
  },
  {
    id: 's6',
    roomId: 'cc202',
    subject: 'Software Engineering',
    section: 'BSCS 4-A',
    teacher: 'Dr. Wilson',
    dayOfWeek: 'Thursday',
    startTime: '13:00',
    endTime: '14:30',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
  },
  {
    id: 's7',
    roomId: 'cc303',
    subject: 'Thesis Defense',
    section: 'BSCS 4-D',
    teacher: 'Panel A',
    dayOfWeek: 'Friday',
    startTime: '09:00',
    endTime: '12:00',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-orange-100 border-orange-300 text-orange-800'
  },
  {
    id: 's8',
    roomId: 'cc103',
    subject: 'Intro to CS',
    section: 'BSCS 1-C',
    teacher: 'Prof. Allen',
    dayOfWeek: 'Wednesday',
    startTime: '13:00',
    endTime: '15:00',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 's9',
    roomId: 'cc201',
    subject: 'Advanced Programming (Makeup)',
    section: 'BSCS 3-B',
    teacher: 'Dr. Smith',
    dayOfWeek: 'Saturday',
    startTime: '08:00',
    endTime: '12:00',
    startDate: SEM_START,
    endDate: SEM_END,
    color: 'bg-teal-100 border-teal-300 text-teal-800'
  }
];

export const CLASS_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
];