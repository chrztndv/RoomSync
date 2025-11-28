
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UserRole, Room, ScheduleItem, DayOption, ThemeColor, UserProfile, UserStatus } from './types';
import { MOCK_ROOMS, INITIAL_SCHEDULE, CLASS_COLORS, DAYS_OF_WEEK, SECTIONS } from './constants';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { RoomList } from './components/RoomList';
import { ScheduleCard } from './components/ScheduleCard';
import { AIChat } from './components/AIChat';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, AlertTriangle, CheckCircle, Calendar, Clock, MapPin, User, Briefcase, Users, Lock, GraduationCap, UserCheck, CalendarPlus, XCircle, Mail, ShieldAlert, Check, X } from 'lucide-react';

// --- Helper Logic ---

const getCurrentTimeInfo = () => {
    const now = new Date();
    const dayIndex = now.getDay(); // 0=Sun, 1=Mon...
    const day = (dayIndex === 0) ? 'Monday' : DAYS_OF_WEEK[dayIndex - 1]?.value || 'Monday';
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    // Format YYYY-MM-DD for date comparison
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    
    return { day, time, dateString };
};

// Check if a schedule item is valid for the given date
const isScheduleActiveForDate = (item: ScheduleItem, dateString: string) => {
    return dateString >= item.startDate && dateString <= item.endDate;
};

// Helper to get Day of Week from Date string
const getDayOfWeekFromDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

// --- Context ---
interface AppContextType {
  rooms: Room[];
  schedule: ScheduleItem[];
  users: UserProfile[];
  currentUser: UserProfile | null;
  addScheduleItem: (item: ScheduleItem) => void;
  deleteScheduleItem: (id: string) => void;
  registerUser: (email: string, name: string) => UserStatus;
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  loginUser: (email: string) => UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setCurrentUser: (user: UserProfile | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Pages ---

const LoginSelection: React.FC = () => {
  const { setRole, registerUser, loginUser, setCurrentUser } = useAppContext();
  const [view, setView] = useState<'main' | 'admin' | 'teacher'>('main');
  
  // Admin Login State
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Teacher Mock Login State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [teacherStatusMsg, setTeacherStatusMsg] = useState<{type: 'error' | 'success' | 'info', text: string} | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setRole(UserRole.ADMIN);
    } else {
      setError('Invalid passkey. Please try again.');
    }
  };

  const handleTeacherGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherStatusMsg(null);

    // 1. Check if user exists
    const existingUser = loginUser(googleEmail);

    if (existingUser) {
        if (existingUser.status === UserStatus.APPROVED) {
            setCurrentUser(existingUser);
            setRole(UserRole.TEACHER);
        } else if (existingUser.status === UserStatus.PENDING) {
            setTeacherStatusMsg({ type: 'info', text: 'Your account is waiting for Admin approval. Please check back later.' });
        } else if (existingUser.status === UserStatus.REJECTED) {
            setTeacherStatusMsg({ type: 'error', text: 'Your account request was declined by the Admin.' });
        }
    } else {
        // 2. Register new pending user
        registerUser(googleEmail, googleName);
        setTeacherStatusMsg({ type: 'success', text: 'Request sent! Please wait for Admin approval to access the system.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300">
       <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">RoomSync</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Your Campus Schedule, Simplified.</p>
       </div>
       <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 transition-all duration-300 border border-slate-200 dark:border-slate-700">
          
          {view === 'main' && (
             <>
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-4 text-slate-900 dark:text-white">Select Portal</h2>
                <div className="space-y-4">
                  <Button 
                    className="w-full py-3 md:py-4 text-base md:text-lg justify-center relative group overflow-hidden" 
                    onClick={() => setView('admin')}
                    icon={<Lock size={18} />}
                  >
                    Login as Admin
                  </Button>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                     <Button 
                       className="w-full py-4 md:py-6 flex-col gap-2 h-auto" 
                       variant="secondary" 
                       onClick={() => setView('teacher')}
                     >
                       <UserCheck size={28} className="mb-1 text-purple-600 dark:text-purple-400 md:w-8 md:h-8" />
                       <span className="text-xs md:text-sm font-medium">Teacher Portal</span>
                     </Button>

                     <Button 
                       className="w-full py-4 md:py-6 flex-col gap-2 h-auto" 
                       variant="secondary" 
                       onClick={() => setRole(UserRole.STUDENT)}
                     >
                       <GraduationCap size={28} className="mb-1 text-green-600 dark:text-green-400 md:w-8 md:h-8" />
                       <span className="text-xs md:text-sm font-medium">Student Portal</span>
                     </Button>
                  </div>
                  <p className="text-[10px] md:text-xs text-center text-slate-400 dark:text-slate-500">Teachers need Google Account approval to book rooms.</p>
                </div>
             </>
          )}

          {view === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-center mb-2 text-slate-900 dark:text-white">Admin Access</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Passkey</label>
                <input 
                  type="password" 
                  autoFocus
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-colors bg-white dark:bg-slate-700 dark:text-white ${error ? 'border-red-300 focus:ring-red-200 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'}`}
                  placeholder="Enter admin123"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-red-500 text-xs md:text-sm mt-2 flex items-center"><AlertTriangle size={14} className="mr-1"/> {error}</p>}
              </div>
              <div className="flex space-x-3 pt-2">
                 <Button type="button" variant="secondary" className="flex-1" onClick={() => {
                   setView('main');
                   setPassword('');
                   setError('');
                 }}>
                   Back
                 </Button>
                 <Button type="submit" className="flex-1">
                   Login
                 </Button>
              </div>
            </form>
          )}

          {view === 'teacher' && (
            <form onSubmit={handleTeacherGoogleLogin} className="space-y-4 animate-fade-in">
               <h2 className="text-xl font-semibold text-center mb-2 text-slate-900 dark:text-white">Teacher Login</h2>
               
               {!teacherStatusMsg ? (
                 <>
                   <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Sign in with your institutional Google Account to continue.</p>
                      
                      {/* Google Inputs */}
                      <div className="space-y-3 text-left">
                         <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Google Email</label>
                            <input 
                              type="email" 
                              required
                              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none dark:bg-slate-800 dark:text-white"
                              placeholder="teacher@university.edu"
                              value={googleEmail}
                              onChange={(e) => setGoogleEmail(e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Name</label>
                            <input 
                              type="text" 
                              required
                              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none dark:bg-slate-800 dark:text-white"
                              placeholder="Prof. John Doe"
                              value={googleName}
                              onChange={(e) => setGoogleName(e.target.value)}
                            />
                         </div>
                      </div>
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-white dark:bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 shadow-sm"
                   >
                     <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                     </svg>
                     <span>Sign in with Google</span>
                   </button>
                 </>
               ) : (
                 <div className={`p-4 rounded-lg border ${
                    teacherStatusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                    teacherStatusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                 }`}>
                    <div className="flex items-start">
                       {teacherStatusMsg.type === 'error' && <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />}
                       {teacherStatusMsg.type === 'success' && <CheckCircle className="w-5 h-5 mr-2 shrink-0" />}
                       {teacherStatusMsg.type === 'info' && <Clock className="w-5 h-5 mr-2 shrink-0" />}
                       <p className="text-sm font-medium">{teacherStatusMsg.text}</p>
                    </div>
                 </div>
               )}

               <Button 
                 type="button" 
                 variant={teacherStatusMsg ? 'primary' : 'secondary'} 
                 className="w-full mt-2" 
                 onClick={() => {
                   setView('main');
                   setGoogleEmail('');
                   setGoogleName('');
                   setTeacherStatusMsg(null);
                 }}
               >
                 {teacherStatusMsg ? 'Back to Home' : 'Cancel'}
               </Button>
            </form>
          )}
       </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { rooms, schedule, role } = useAppContext();

  // Stats
  const totalRooms = rooms.length;
  const totalClasses = schedule.length;
  
  const { day: currentDay, time: currentTime, dateString: currentDate } = getCurrentTimeInfo();

  const busyRoomsNow = schedule.filter(s => 
    s.dayOfWeek === currentDay && 
    currentTime >= s.startTime && 
    currentTime < s.endTime &&
    isScheduleActiveForDate(s, currentDate)
  ).length;

  const utilizationData = rooms.map(room => {
    const count = schedule.filter(s => s.roomId === room.id).length;
    return { name: room.name, usage: count };
  });

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Stats - 3 columns on mobile, adjusted sizing */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">Total Rooms</h3>
          <p className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white">{totalRooms}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
           <h3 className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">Active Classes</h3>
           <p className="text-lg md:text-3xl font-bold text-primary-600">{totalClasses}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
           <h3 className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">Occupied Now</h3>
           <p className="text-lg md:text-3xl font-bold text-green-600">{busyRoomsNow}</p>
        </div>
      </div>

      {role === UserRole.ADMIN && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors hidden md:block">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Room Utilization Overview</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-bg-tooltip, #fff)' }}
                />
                <Bar dataKey="usage" fill="rgb(var(--color-primary-500))" radius={[4, 4, 0, 0]}>
                   {utilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`rgb(var(--color-primary-${index % 2 === 0 ? 500 : 400}))`} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 md:p-6 border border-slate-200 dark:border-slate-700 transition-colors">
         <div className="flex justify-between items-center mb-3 md:mb-4 px-1 md:px-0">
            <div>
                <h2 className="text-base md:text-xl font-bold text-slate-800 dark:text-white">Quick Room Finder</h2>
                <p className="text-[10px] md:text-base text-slate-600 dark:text-slate-400">Find available spaces across campus.</p>
            </div>
         </div>
         <RoomList rooms={rooms} schedule={schedule} onSelectRoom={() => {}} />
      </div>
    </div>
  );
};

const AvailableRoomsPage: React.FC = () => {
  const { rooms, schedule } = useAppContext();
  const { day: currentDay, time: currentTime, dateString: currentDate } = getCurrentTimeInfo();

  const availableRooms = useMemo(() => {
    const busyRoomIds = schedule
      .filter(s => 
        s.dayOfWeek === currentDay && 
        currentTime >= s.startTime && 
        currentTime < s.endTime &&
        isScheduleActiveForDate(s, currentDate)
      )
      .map(s => s.roomId);
    
    return rooms.filter(r => !busyRoomIds.includes(r.id));
  }, [rooms, schedule, currentDay, currentTime, currentDate]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-3 mb-1 md:mb-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-1.5 md:p-2 rounded-full">
            <CheckCircle className="text-green-600 dark:text-green-400 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
             <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">Available Rooms</h2>
             <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Currently free in Comscie Building ({currentDay}, {currentTime})</p>
          </div>
        </div>
      </div>

      {availableRooms.length > 0 ? (
        <RoomList rooms={availableRooms} schedule={schedule} onSelectRoom={() => {}} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">All rooms are currently occupied.</p>
        </div>
      )}
    </div>
  );
};

const RoomsInUsePage: React.FC = () => {
  const { rooms, schedule } = useAppContext();
  const { day: currentDay, time: currentTime, dateString: currentDate } = getCurrentTimeInfo();

  const activeSessions = useMemo(() => {
    return schedule
      .filter(s => 
        s.dayOfWeek === currentDay && 
        currentTime >= s.startTime && 
        currentTime < s.endTime &&
        isScheduleActiveForDate(s, currentDate)
      )
      .sort((a, b) => a.endTime.localeCompare(b.endTime));
  }, [schedule, currentDay, currentTime, currentDate]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-3 mb-1 md:mb-2">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 md:p-2 rounded-full">
            <Clock className="text-orange-600 dark:text-orange-400 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
             <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">Rooms in Use</h2>
             <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Ongoing classes and occupancy status ({currentDay}, {currentTime})</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {activeSessions.length > 0 ? (
          activeSessions.map(session => {
            const room = rooms.find(r => r.id === session.roomId);
            return (
              <div key={session.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
                <div className="bg-slate-800 dark:bg-slate-900 p-3 md:p-4 flex justify-between items-center border-b border-slate-700 dark:border-slate-800">
                  <span className="text-white font-bold text-base md:text-lg">{room?.name}</span>
                  <span className="bg-red-500 text-white text-[10px] md:text-xs px-2 py-1 rounded font-medium animate-pulse">OCCUPIED</span>
                </div>
                <div className="p-4 md:p-5 space-y-3 md:space-y-4">
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase mb-0.5 md:mb-1">Subject & Section</p>
                    <div className="flex items-center text-slate-800 dark:text-slate-200 font-semibold text-sm md:text-base">
                      <Briefcase size={14} className="mr-2 text-primary-500 md:w-4 md:h-4" />
                      <div>
                         {session.subject}
                         {session.section && <span className="text-slate-500 dark:text-slate-400 font-normal ml-2 text-xs md:text-sm">({session.section})</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase mb-0.5 md:mb-1">Instructor</p>
                    <div className="flex items-center text-slate-800 dark:text-slate-200 text-sm md:text-base">
                      <User size={14} className="mr-2 text-primary-500 md:w-4 md:h-4" />
                      {session.teacher}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase mb-0.5 md:mb-1">Current Session</p>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                         <Clock size={14} className="mr-2 md:w-4 md:h-4" />
                         {session.startTime} - {session.endTime}
                       </div>
                       <div className="text-right">
                         <span className="text-[10px] md:text-xs text-slate-400">Ends at</span>
                         <p className="font-bold text-orange-600 dark:text-orange-400 text-sm md:text-base">{session.endTime}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 md:py-16 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
             <CheckCircle size={40} className="text-green-500 mb-4 opacity-50 md:w-12 md:h-12" />
             <p className="text-base md:text-lg font-medium text-slate-600 dark:text-slate-300">No rooms are currently in use.</p>
             <p className="text-xs md:text-sm text-slate-400">The building is free!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SchedulePage: React.FC = () => {
  const { rooms, schedule } = useAppContext();
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Extract unique sections
  const uniqueSections = useMemo(() => {
    const sections = new Set(schedule.map(item => item.section).filter(Boolean) as string[]);
    return Array.from(sections).sort();
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    return schedule.filter(item => {
      const dayMatch = item.dayOfWeek === selectedDay;
      const roomMatch = selectedRoom === 'All' || item.roomId === selectedRoom;
      const sectionMatch = selectedSection === 'All' || item.section === selectedSection;
      
      return dayMatch && roomMatch && sectionMatch;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule, selectedDay, selectedRoom, selectedSection]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">Class Schedule</h2>
          <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">View timetables by day, room, or section.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
           <select 
             className="flex-1 md:flex-none px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-colors"
             value={selectedDay}
             onChange={(e) => setSelectedDay(e.target.value)}
           >
             {DAYS_OF_WEEK.map(day => (
               <option key={day.value} value={day.value}>{day.label}</option>
             ))}
           </select>

           <select 
             className="flex-1 md:flex-none px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-colors"
             value={selectedRoom}
             onChange={(e) => setSelectedRoom(e.target.value)}
           >
             <option value="All">All Rooms</option>
             {rooms.map(room => (
               <option key={room.id} value={room.id}>{room.name}</option>
             ))}
           </select>

           <select 
             className="flex-1 md:flex-none px-3 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-colors"
             value={selectedSection}
             onChange={(e) => setSelectedSection(e.target.value)}
           >
             <option value="All">All Sections</option>
             {uniqueSections.map(sec => (
               <option key={sec} value={sec}>{sec}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
         {filteredSchedule.length > 0 ? (
            filteredSchedule.map(item => {
              const room = rooms.find(r => r.id === item.roomId);
              return (
                <ScheduleCard 
                  key={item.id} 
                  item={item} 
                  roomName={room?.name}
                />
              );
            })
         ) : (
           <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <Calendar size={40} className="mb-4 opacity-50 md:w-12 md:h-12" />
              <p className="text-base md:text-lg font-medium">No classes scheduled.</p>
           </div>
         )}
      </div>
    </div>
  );
};

const TeacherBookingPage: React.FC = () => {
  const { rooms, schedule, addScheduleItem, deleteScheduleItem, currentUser } = useAppContext();
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  // Use logged-in teacher name if available, else default to empty
  const [teacher, setTeacher] = useState(currentUser?.name || '');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!subject || !teacher || !section) {
      setFormError("All fields are required.");
      return;
    }

    if (startTime >= endTime) {
      setFormError("End time must be after start time.");
      return;
    }

    // Determine Day of Week for the selected date
    const dayOfWeek = getDayOfWeekFromDate(date);

    // Conflict detection
    const hasConflict = schedule.some(item => {
      // 1. Check Room
      if (item.roomId !== roomId) return false;

      // 2. Check Day/Date Overlap
      // For a single day booking:
      // Does existing schedule cover this day of week?
      if (item.dayOfWeek !== dayOfWeek) return false;
      
      // Does existing schedule date range cover this specific date?
      const isDateInRange = (date >= item.startDate) && (date <= item.endDate);
      if (!isDateInRange) return false;

      // 3. Check Time Overlap
      const timeOverlap = (startTime < item.endTime) && (endTime > item.startTime);
      
      return timeOverlap;
    });

    if (hasConflict) {
      setFormError(`Conflict detected! Room is occupied on ${dayOfWeek}, ${date} at this time.`);
      return;
    }

    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      roomId,
      subject: `${subject} (Makeup)`,
      section,
      teacher,
      dayOfWeek, // Auto-calculated
      startTime,
      endTime,
      startDate: date,
      endDate: date, // Single day validity
      color: 'bg-pink-100 border-pink-300 text-pink-800' // Distinct color for makeup
    };

    addScheduleItem(newItem);
    setSuccessMsg("Room successfully booked for makeup class!");
    
    // Clear some fields
    setSubject('');
  };

  const handleCancelBooking = (id: string) => {
      // Direct deletion without browser confirm dialog to prevent blocking issues
      deleteScheduleItem(id);
      setSuccessMsg("Booking cancelled successfully.");
  };

  // Filter schedules that are designated as makeup classes
  const myBookings = useMemo(() => {
    return schedule
      .filter(s => s.subject.includes('(Makeup)'))
      .sort((a, b) => b.startDate.localeCompare(a.startDate)); // Newest first
  }, [schedule]);

  return (
    <div className="space-y-4 md:space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-3 mb-1 md:mb-2">
           <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 md:p-2 rounded-full">
             <CalendarPlus className="text-purple-600 dark:text-purple-400 w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
             <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">Book Makeup Class</h2>
             <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Reserve a room for a special session or makeup class.</p>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-8 max-w-3xl mx-auto transition-colors">
         <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 md:p-4 rounded-lg flex items-center text-sm md:text-base">
                <AlertTriangle size={18} className="mr-2 md:mr-3 flex-shrink-0" />
                <span className="font-medium">{formError}</span>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-3 md:p-4 rounded-lg flex items-center animate-fade-in text-sm md:text-base">
                <CheckCircle size={18} className="mr-2 md:mr-3 flex-shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Teacher Name</label>
                  <input 
                    required 
                    type="text" 
                    className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors ${currentUser ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
                    value={teacher} 
                    onChange={e => setTeacher(e.target.value)} 
                    placeholder="Enter your name" 
                    readOnly={!!currentUser}
                  />
               </div>
               <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                  <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject Code / Name" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               <div>
                 <label className="block text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Class Section</label>
                 <select 
                   required
                   className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" 
                   value={section} 
                   onChange={e => setSection(e.target.value)}
                 >
                   <option value="">Select Section</option>
                   {SECTIONS.map(sec => (
                     <option key={sec} value={sec}>{sec}</option>
                   ))}
                 </select>
               </div>
               <div>
                  <label className="block text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Room</label>
                  <select required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={roomId} onChange={e => setRoomId(e.target.value)}>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} - {r.features[0]}</option>)}
                  </select>
               </div>
            </div>

            <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
               <h4 className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 md:mb-3">Schedule Details</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                     <label className="block text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Date</label>
                     <input required type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                     <input required type="time" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                     <label className="block text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                     <input required type="time" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm md:text-base focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button type="submit" size="lg" className="w-full text-sm md:text-lg">Confirm Booking</Button>
            </div>
         </form>
      </div>

      <div className="max-w-3xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Scheduled Makeup Classes</h3>
        
        {myBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBookings.map(booking => {
              const room = rooms.find(r => r.id === booking.roomId);
              return (
                <div key={booking.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                   <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-800 dark:text-white truncate pr-2">{booking.subject}</div>
                      <span className="text-[10px] uppercase font-bold text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 px-2 py-0.5 rounded-full shrink-0">Makeup</span>
                   </div>
                   
                   <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <div className="flex items-center">
                         <User size={14} className="mr-2 opacity-70" /> {booking.teacher}
                      </div>
                      <div className="flex items-center">
                         <MapPin size={14} className="mr-2 opacity-70" /> {room?.name || booking.roomId}
                      </div>
                      <div className="flex items-center">
                         <Calendar size={14} className="mr-2 opacity-70" /> {booking.startDate} ({booking.dayOfWeek})
                      </div>
                      <div className="flex items-center">
                         <Clock size={14} className="mr-2 opacity-70" /> {booking.startTime} - {booking.endTime}
                      </div>
                   </div>

                   <button 
                     type="button"
                     onClick={(e) => {
                       e.preventDefault();
                       handleCancelBooking(booking.id);
                     }}
                     className="w-full mt-2 flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-lg transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-800"
                   >
                     <XCircle size={14} />
                     <span>Cancel Booking</span>
                   </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
             <Calendar className="mx-auto mb-2 opacity-20" size={32} />
             <p className="text-sm">No makeup classes scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { rooms, schedule, addScheduleItem, deleteScheduleItem, users, approveUser, rejectUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'schedule' | 'users'>('schedule');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Initialize default date range
  const today = new Date();
  const defaultStart = today.toISOString().split('T')[0];
  const nextSem = new Date();
  nextSem.setMonth(nextSem.getMonth() + 4);
  const defaultEnd = nextSem.toISOString().split('T')[0];

  // Form State
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [teacher, setTeacher] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const pendingUsers = users.filter(u => u.status === UserStatus.PENDING);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!subject || !teacher) {
      setFormError("Subject and Teacher are required.");
      return;
    }

    if (startTime >= endTime) {
      setFormError("End time must be after start time.");
      return;
    }

    if (startDate > endDate) {
        setFormError("Start date cannot be after end date.");
        return;
    }

    // Conflict detection including Date Range
    const hasConflict = schedule.some(item => {
      // 1. Check Room & Day
      if (item.roomId !== roomId || item.dayOfWeek !== day) return false;

      // 2. Check Date Range Overlap
      const dateOverlap = (startDate <= item.endDate) && (endDate >= item.startDate);
      if (!dateOverlap) return false;

      // 3. Check Time Overlap
      const timeOverlap = (startTime < item.endTime) && (endTime > item.startTime);
      
      return timeOverlap;
    });

    if (hasConflict) {
      setFormError("Conflict detected! This room is already booked for this time/date range.");
      return;
    }

    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      roomId,
      subject,
      section: section || undefined,
      teacher,
      dayOfWeek: day,
      startTime,
      endTime,
      startDate,
      endDate,
      color: CLASS_COLORS[Math.floor(Math.random() * CLASS_COLORS.length)]
    };

    addScheduleItem(newItem);
    setIsModalOpen(false);
    setSubject('');
    setSection('');
    setTeacher('');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">Admin Management</h2>
          <p className="text-xs md:text-base text-slate-500 dark:text-slate-400">Manage classroom bookings and user access.</p>
        </div>
        <div className="flex space-x-2 w-full md:w-auto">
             <button 
               onClick={() => setActiveTab('schedule')}
               className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
             >
               Schedules
             </button>
             <button 
               onClick={() => setActiveTab('users')}
               className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
             >
               Teacher Approvals
               {pendingUsers.length > 0 && (
                 <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                   {pendingUsers.length}
                 </span>
               )}
             </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <>
            <div className="flex justify-end">
                <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18}/>} className="text-sm md:text-base">
                  Add Class
                </Button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs md:text-base">Subject</th>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs md:text-base">Section</th>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs md:text-base">Room</th>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs md:text-base">Day/Date</th>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs md:text-base">Time</th>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-xs md:text-base">Teacher</th>
                        <th className="p-3 md:p-4 font-semibold text-slate-600 dark:text-slate-300 text-right text-xs md:text-base">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {schedule.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-3 md:p-4 font-medium text-slate-900 dark:text-white text-xs md:text-base">{item.subject}</td>
                        <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400 text-xs md:text-sm">{item.section || '-'}</td>
                        <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400 text-xs md:text-base">{rooms.find(r => r.id === item.roomId)?.name}</td>
                        <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400 text-xs md:text-base">
                            <div className="font-bold">{item.dayOfWeek.substring(0, 3)}</div>
                            <div className="text-[10px] md:text-xs opacity-70">{item.startDate} to {item.endDate}</div>
                        </td>
                        <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400 font-mono text-xs md:text-sm">{item.startTime} - {item.endTime}</td>
                        <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400 text-xs md:text-base">{item.teacher}</td>
                        <td className="p-3 md:p-4 text-right">
                            <button 
                            onClick={() => deleteScheduleItem(item.id)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Schedule"
                            >
                            <Trash2 size={16} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    {schedule.length === 0 && (
                        <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No schedules found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                 <h3 className="font-semibold text-slate-800 dark:text-white">Pending Requests</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400">Approve or reject teacher access to the booking portal.</p>
             </div>
             
             {pendingUsers.length > 0 ? (
                 <div className="divide-y divide-slate-100 dark:divide-slate-700">
                     {pendingUsers.map(user => (
                         <div key={user.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                             <div className="flex items-center space-x-3 w-full md:w-auto">
                                 <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                                     <Mail size={20} />
                                 </div>
                                 <div>
                                     <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                     <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full font-semibold">Pending Approval</span>
                                 </div>
                             </div>
                             <div className="flex space-x-2 w-full md:w-auto">
                                 <button 
                                   onClick={() => rejectUser(user.id)}
                                   className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                 >
                                     <X size={16} />
                                     <span>Reject</span>
                                 </button>
                                 <button 
                                   onClick={() => approveUser(user.id)}
                                   className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                                 >
                                     <Check size={16} />
                                     <span>Approve</span>
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="p-12 text-center text-slate-400 dark:text-slate-500">
                     <ShieldAlert className="mx-auto mb-2 opacity-30" size={32} />
                     <p>No pending approval requests.</p>
                 </div>
             )}
          </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Class Schedule"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center text-xs md:text-sm">
              <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Advanced Math" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section (User)</label>
               <select 
                 className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" 
                 value={section} 
                 onChange={e => setSection(e.target.value)}
               >
                 <option value="">Select Section</option>
                 {SECTIONS.map(sec => (
                   <option key={sec} value={sec}>{sec}</option>
                 ))}
               </select>
             </div>
             <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
                <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="e.g. Prof. X" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room</label>
                <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={roomId} onChange={e => setRoomId(e.target.value)}>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Day</label>
                <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={day} onChange={e => setDay(e.target.value)}>
                  {DAYS_OF_WEEK.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
             <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Duration Start</label>
                <input required type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
             </div>
             <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Duration End</label>
                <input required type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input required type="time" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={startTime} onChange={e => setStartTime(e.target.value)} />
             </div>
             <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input required type="time" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors text-sm" value={endTime} onChange={e => setEndTime(e.target.value)} />
             </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
             <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-sm">Cancel</Button>
             <Button type="submit" className="text-sm">Save Schedule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [theme, setTheme] = useState<ThemeColor>('default');
  const [darkMode, setDarkMode] = useState(false);
  const [rooms] = useState<Room[]>(MOCK_ROOMS);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  
  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const themeClass = `theme-${theme}`;
    document.body.className = `bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300 ${themeClass}`;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, darkMode]);

  const addScheduleItem = (item: ScheduleItem) => {
    setSchedule(prev => [...prev, item]);
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule(prev => prev.filter(i => i.id !== id));
  };

  // User Management Functions
  const registerUser = (email: string, name: string) => {
      const newUser: UserProfile = {
          id: Date.now().toString(),
          email,
          name,
          role: UserRole.TEACHER,
          status: UserStatus.PENDING
      };
      setUsers(prev => [...prev, newUser]);
      return UserStatus.PENDING;
  };

  const loginUser = (email: string) => {
      return users.find(u => u.email === email) || null;
  };

  const approveUser = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.APPROVED } : u));
  };

  const rejectUser = (id: string) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.REJECTED } : u));
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentUser(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const contextValue = {
    rooms,
    schedule,
    users,
    currentUser,
    addScheduleItem,
    deleteScheduleItem,
    registerUser,
    approveUser,
    rejectUser,
    loginUser,
    role: role || UserRole.STUDENT,
    setRole: (r: UserRole) => setRole(r),
    theme,
    setTheme,
    darkMode,
    toggleDarkMode,
    setCurrentUser
  };

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        {!role ? (
          <LoginSelection />
        ) : (
          <Layout role={role} onLogout={handleLogout} currentTheme={theme} onThemeChange={setTheme} darkMode={darkMode} onToggleDarkMode={toggleDarkMode}>
             <Routes>
               <Route path="/" element={<Dashboard />} />
               <Route path="/schedule" element={<SchedulePage />} />
               <Route path="/available" element={<AvailableRoomsPage />} />
               <Route path="/in-use" element={<RoomsInUsePage />} />
               <Route 
                 path="/admin" 
                 element={role === UserRole.ADMIN ? <AdminPanel /> : <Navigate to="/" />} 
               />
               <Route 
                 path="/book" 
                 element={role === UserRole.TEACHER ? <TeacherBookingPage /> : <Navigate to="/" />} 
               />
               <Route path="*" element={<Navigate to="/" />} />
             </Routes>
             <AIChat rooms={rooms} schedule={schedule} />
          </Layout>
        )}
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
