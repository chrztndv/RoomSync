import React, { useState, useMemo, useEffect } from 'react';
import { Room, ScheduleItem } from '../types';
import { Search, Clock, User, BookOpen, Calendar, Users } from 'lucide-react';
import { DAYS_OF_WEEK } from '../constants';

// Duplicate helper to ensure consistent 'Monday' fallback behavior matching App.tsx
const getCurrentTimeInfo = () => {
    const now = new Date();
    const dayIndex = now.getDay(); // 0=Sun, 1=Mon...
    // Demo logic: If Sunday (0), pretend it's Monday. 
    // Saturday (6) is now a valid day in DAYS_OF_WEEK (index 5).
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

interface RoomListProps {
  rooms: Room[];
  schedule: ScheduleItem[];
  onSelectRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, schedule, onSelectRoom }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTimeInfo, setCurrentTimeInfo] = useState(getCurrentTimeInfo());

  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentTimeInfo(getCurrentTimeInfo());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const getRoomStatus = (roomId: string) => {
      const { day, time, dateString } = currentTimeInfo;
      return schedule.find(s => 
        s.roomId === roomId && 
        s.dayOfWeek === day && 
        time >= s.startTime && 
        time < s.endTime &&
        dateString >= s.startDate &&
        dateString <= s.endDate
      );
  };

  const getNextSchedule = (roomId: string) => {
      const { day, time, dateString } = currentTimeInfo;
      const upcoming = schedule.filter(s => 
          s.roomId === roomId && 
          s.dayOfWeek === day && 
          s.startTime > time &&
          dateString >= s.startDate &&
          dateString <= s.endDate
      );
      // Sort by start time ascending
      return upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search rooms..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredRooms.map(room => {
          const activeSchedule = getRoomStatus(room.id);
          const nextSchedule = !activeSchedule ? getNextSchedule(room.id) : null;

          return (
            <div 
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="h-28 md:h-32 overflow-hidden relative shrink-0">
                 <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2 md:p-3">
                    <div className="flex justify-between items-end w-full">
                       <span className="text-white font-bold text-sm md:text-lg shadow-sm">{room.name}</span>
                       <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm ${activeSchedule ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                         {activeSchedule ? 'Occupied' : 'Available'}
                       </span>
                    </div>
                 </div>
              </div>
              <div className="p-3 md:p-4 flex-1 flex flex-col">
                <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">{room.building}</p>
                
                {activeSchedule ? (
                  <div className="space-y-2 mt-auto">
                    <div>
                       <div className="flex justify-between items-start mb-0.5">
                           <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Class / Section</p>
                       </div>
                       <div className="flex items-start text-[10px] md:text-sm text-slate-800 dark:text-slate-200 font-medium">
                         <BookOpen size={14} className="mr-1.5 mt-0.5 text-primary-500 shrink-0 hidden md:block" />
                         <BookOpen size={12} className="mr-1 mt-0.5 text-primary-500 shrink-0 md:hidden" />
                         <div>
                            <span className="block line-clamp-1" title={activeSchedule.subject}>{activeSchedule.subject}</span>
                            {activeSchedule.section && (
                                <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-normal">{activeSchedule.section}</span>
                            )}
                         </div>
                       </div>
                    </div>
                    
                    <div>
                       <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase mb-0.5">Instructor</p>
                       <div className="flex items-center text-[10px] md:text-sm text-slate-700 dark:text-slate-300">
                         <User size={14} className="mr-1.5 text-primary-500 shrink-0 hidden md:block" />
                         <User size={12} className="mr-1 text-primary-500 shrink-0 md:hidden" />
                         <span className="truncate">{activeSchedule.teacher}</span>
                       </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                       <div className="flex justify-between items-center text-[9px] md:text-xs">
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <Clock size={12} className="mr-1 text-orange-500 hidden md:block" />
                            <Clock size={10} className="mr-1 text-orange-500 md:hidden" />
                            <span>{activeSchedule.startTime} - {activeSchedule.endTime}</span>
                          </div>
                          <span className="text-orange-600 dark:text-orange-400 font-medium hidden md:inline">Ends {activeSchedule.endTime}</span>
                       </div>
                    </div>
                  </div>
                ) : (
                   <div className="mt-auto h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-1">
                      <div className="flex flex-col items-center mb-2">
                        <Calendar size={18} className="mb-1 opacity-20 hidden md:block" />
                        <Calendar size={14} className="mb-1 opacity-20 md:hidden" />
                        <span className="text-[10px] md:text-xs italic text-center">Empty</span>
                      </div>

                      {nextSchedule ? (
                         <div className="w-full border-t border-slate-100 dark:border-slate-700 pt-2 mt-1 px-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500">Up Next</span>
                                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">{nextSchedule.startTime}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded border border-slate-100 dark:border-slate-700 text-left">
                                <p className="text-[9px] md:text-[10px] font-semibold text-slate-700 dark:text-slate-200 truncate" title={nextSchedule.subject}>{nextSchedule.subject}</p>
                                <div className="flex justify-between items-center mt-0.5">
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{nextSchedule.section || 'No Section'}</p>
                                </div>
                            </div>
                         </div>
                      ) : (
                         <div className="mt-1 text-center">
                            <span className="text-[9px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30 font-medium whitespace-nowrap">Free all day</span>
                         </div>
                      )}
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};