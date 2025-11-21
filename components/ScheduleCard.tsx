import React from 'react';
import { ScheduleItem } from '../types';
import { Clock, MapPin, User } from 'lucide-react';

interface ScheduleCardProps {
  item: ScheduleItem;
  roomName?: string;
  onClick?: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, roomName, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer mb-2 ${item.color} bg-white dark:bg-slate-800 dark:border-l-primary-500`}
    >
      <h4 className="font-bold text-slate-800 dark:text-slate-900 truncate">{item.subject}</h4>
      
      <div className="mt-2 space-y-1">
        <div className="flex items-center text-xs text-slate-600 dark:text-slate-700">
          <Clock size={12} className="mr-1" />
          <span>{item.startTime} - {item.endTime}</span>
        </div>
        
        {roomName && (
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-700">
            <MapPin size={12} className="mr-1" />
            <span>{roomName}</span>
          </div>
        )}

        <div className="flex items-center text-xs text-slate-600 dark:text-slate-700">
          <User size={12} className="mr-1" />
          <span>{item.teacher}</span>
        </div>
      </div>
    </div>
  );
};