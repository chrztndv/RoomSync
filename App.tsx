import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UserRole, Room, ScheduleItem, DayOption, ThemeColor } from './types';
import { MOCK_ROOMS, INITIAL_SCHEDULE, CLASS_COLORS, DAYS_OF_WEEK, SECTIONS } from './constants';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { RoomList } from './components/RoomList';
import { ScheduleCard } from './components/ScheduleCard';
import { AIChat } from './components/AIChat';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, AlertTriangle, CheckCircle, Calendar, Clock, MapPin, User, Briefcase, Users, Lock } from 'lucide-react';

// --- Helper Logic ---

const getCurrentTimeInfo = () => {
    const now = new Date();
    const dayIndex = now.getDay(); // 0=Sun, 1=Mon...
    // Demo logic: If Sunday (0), pretend it's Monday. 
    // Saturday (6) is now a valid day in DAYS_OF_WEEK (index 5).
    const day = (dayIndex === 0) ? 'Monday' : DAYS_OF_WEEK[dayIndex - 1]?.value || 'Monday';
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    return { day, time };
};

// --- Context ---
interface AppContextType {
  rooms: Room[];
  schedule: ScheduleItem[];
  addScheduleItem: (item: ScheduleItem) => void;
  deleteScheduleItem: (id: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Pages ---

const LoginSelection: React.FC = () => {
  const { setRole } = useAppContext();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setRole(UserRole.ADMIN);
    } else {
      setError('Invalid passkey. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300">
       <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">RoomSync</h1>
          <p className="text-slate-500 dark:text-slate-400">Your Campus Schedule, Simplified.</p>
       </div>
       <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 transition-all duration-300 border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-semibold text-center mb-4 text-slate-900 dark:text-white">Select Portal</h2>
          
          {!isAdminLogin ? (
            <>
              <Button 
                className="w-full py-4 text-lg justify-center" 
                onClick={() => setIsAdminLogin(true)}
                icon={<Lock size={20} />}
              >
                Login as Admin
              </Button>
              <Button 
                className="w-full py-4 text-lg justify-center" 
                variant="secondary" 
                onClick={() => setRole(UserRole.STUDENT)}
                icon={<User size={20} />}
              >
                Enter as Student / Teacher
              </Button>
            </>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Passkey</label>
                <input 
                  type="password" 
                  autoFocus
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition-colors bg-white dark:bg-slate-700 dark:text-white ${error ? 'border-red-300 focus:ring-red-200 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'}`}
                  placeholder="Enter passkey"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertTriangle size={14} className="mr-1"/> {error}</p>}
              </div>
              <div className="flex space-x-3">
                 <Button type="button" variant="secondary" className="flex-1" onClick={() => {
                   setIsAdminLogin(false);
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
       </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { rooms, schedule, role } = useAppContext();

  // Stats
  const totalRooms = rooms.length;
  const totalClasses = schedule.length;
  
  const { day: currentDay, time: currentTime } = getCurrentTimeInfo();

  const busyRoomsNow = schedule.filter(s => 
    s.dayOfWeek === currentDay && currentTime >= s.startTime && currentTime < s.endTime
  ).length;

  const utilizationData = rooms.map(room => {
    const count = schedule.filter(s => s.roomId === room.id).length;
    return { name: room.name, usage: count };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Rooms</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalRooms}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
           <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Schedules</h3>
           <p className="text-3xl font-bold text-primary-600">{totalClasses}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
           <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Occupied Now ({currentDay})</h3>
           <p className="text-3xl font-bold text-green-600">{busyRoomsNow}</p>
        </div>
      </div>

      {role === UserRole.ADMIN && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
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

      <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-colors">
         <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Room Finder</h2>
                <p className="text-slate-600 dark:text-slate-400">Find available spaces across campus instantly.</p>
            </div>
         </div>
         <RoomList rooms={rooms} schedule={schedule} onSelectRoom={() => {}} />
      </div>
    </div>
  );
};

const AvailableRoomsPage: React.FC = () => {
  const { rooms, schedule } = useAppContext();
  const { day: currentDay, time: currentTime } = getCurrentTimeInfo();

  const availableRooms = useMemo(() => {
    const busyRoomIds = schedule
      .filter(s => s.dayOfWeek === currentDay && currentTime >= s.startTime && currentTime < s.endTime)
      .map(s => s.roomId);
    
    return rooms.filter(r => !busyRoomIds.includes(r.id));
  }, [rooms, schedule, currentDay, currentTime]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Available Rooms</h2>
             <p className="text-slate-500 dark:text-slate-400">Currently free in Comscie Building ({currentDay}, {currentTime})</p>
          </div>
        </div>
      </div>

      {availableRooms.length > 0 ? (
        <RoomList rooms={availableRooms} schedule={schedule} onSelectRoom={() => {}} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-lg">All rooms are currently occupied.</p>
        </div>
      )}
    </div>
  );
};

const RoomsInUsePage: React.FC = () => {
  const { rooms, schedule } = useAppContext();
  const { day: currentDay, time: currentTime } = getCurrentTimeInfo();

  const activeSessions = useMemo(() => {
    return schedule
      .filter(s => s.dayOfWeek === currentDay && currentTime >= s.startTime && currentTime < s.endTime)
      .sort((a, b) => a.endTime.localeCompare(b.endTime));
  }, [schedule, currentDay, currentTime]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
            <Clock className="text-orange-600 dark:text-orange-400" size={24} />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Rooms in Use</h2>
             <p className="text-slate-500 dark:text-slate-400">Ongoing classes and occupancy status ({currentDay}, {currentTime})</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeSessions.length > 0 ? (
          activeSessions.map(session => {
            const room = rooms.find(r => r.id === session.roomId);
            return (
              <div key={session.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
                <div className="bg-slate-800 dark:bg-slate-900 p-4 flex justify-between items-center border-b border-slate-700 dark:border-slate-800">
                  <span className="text-white font-bold text-lg">{room?.name}</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium animate-pulse">OCCUPIED</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Subject & Section</p>
                    <div className="flex items-center text-slate-800 dark:text-slate-200 font-semibold">
                      <Briefcase size={16} className="mr-2 text-primary-500" />
                      <div>
                         {session.subject}
                         {session.section && <span className="text-slate-500 dark:text-slate-400 font-normal ml-2 text-sm">({session.section})</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Instructor</p>
                    <div className="flex items-center text-slate-800 dark:text-slate-200">
                      <User size={16} className="mr-2 text-primary-500" />
                      {session.teacher}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 font-medium uppercase mb-1">Current Session</p>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                         <Clock size={16} className="mr-2" />
                         {session.startTime} - {session.endTime}
                       </div>
                       <div className="text-right">
                         <span className="text-xs text-slate-400">Ends at</span>
                         <p className="font-bold text-orange-600 dark:text-orange-400">{session.endTime}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
             <CheckCircle size={48} className="text-green-500 mb-4 opacity-50" />
             <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No rooms are currently in use.</p>
             <p className="text-slate-400">The building is free!</p>
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Class Schedule</h2>
          <p className="text-slate-500 dark:text-slate-400">View timetables by day, room, or section.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <select 
             className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-colors"
             value={selectedDay}
             onChange={(e) => setSelectedDay(e.target.value)}
           >
             {DAYS_OF_WEEK.map(day => (
               <option key={day.value} value={day.value}>{day.label}</option>
             ))}
           </select>

           <select 
             className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-colors"
             value={selectedRoom}
             onChange={(e) => setSelectedRoom(e.target.value)}
           >
             <option value="All">All Rooms</option>
             {rooms.map(room => (
               <option key={room.id} value={room.id}>{room.name}</option>
             ))}
           </select>

           <select 
             className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white transition-colors"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No classes scheduled for this selection.</p>
           </div>
         )}
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { rooms, schedule, addScheduleItem, deleteScheduleItem } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Form State
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [teacher, setTeacher] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');

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

    // Simple conflict detection
    const hasConflict = schedule.some(item => 
      item.roomId === roomId && 
      item.dayOfWeek === day &&
      ((startTime >= item.startTime && startTime < item.endTime) ||
       (endTime > item.startTime && endTime <= item.endTime) ||
       (startTime <= item.startTime && endTime >= item.endTime))
    );

    if (hasConflict) {
      setFormError("Conflict detected! This room is already booked for this time slot.");
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
      color: CLASS_COLORS[Math.floor(Math.random() * CLASS_COLORS.length)]
    };

    addScheduleItem(newItem);
    setIsModalOpen(false);
    // Reset form
    setSubject('');
    setSection('');
    setTeacher('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage classroom bookings and resolve conflicts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={18}/>}>
          Add Class
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Subject</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Section</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Room</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Day</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Time</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Teacher</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {schedule.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{item.subject}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{item.section || '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{rooms.find(r => r.id === item.roomId)?.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-xs font-bold uppercase tracking-wide">{item.dayOfWeek.substring(0, 3)}</span></td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{item.startTime} - {item.endTime}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{item.teacher}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteScheduleItem(item.id)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete Schedule"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {schedule.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">No schedules found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New Class Schedule"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center text-sm">
              <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Advanced Math" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Section (User)</label>
               <select 
                 className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" 
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
                <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="e.g. Prof. X" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room</label>
                <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={roomId} onChange={e => setRoomId(e.target.value)}>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Day</label>
                <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={day} onChange={e => setDay(e.target.value)}>
                  {DAYS_OF_WEEK.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                <input required type="time" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={startTime} onChange={e => setStartTime(e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                <input required type="time" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-colors" value={endTime} onChange={e => setEndTime(e.target.value)} />
             </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
             <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit">Save Schedule</Button>
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

  useEffect(() => {
    // Update body class for theming
    const themeClass = `theme-${theme}`;
    // Reset classes
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

  const handleLogout = () => {
    setRole(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Global context value
  const contextValue = {
    rooms,
    schedule,
    addScheduleItem,
    deleteScheduleItem,
    role: role || UserRole.STUDENT,
    setRole: (r: UserRole) => setRole(r),
    theme,
    setTheme,
    darkMode,
    toggleDarkMode
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