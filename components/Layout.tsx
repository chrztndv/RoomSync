import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Settings, LayoutDashboard, LogOut, ShieldCheck, GraduationCap, CheckCircle, Clock, Palette, Moon, Sun } from 'lucide-react';
import { UserRole, ThemeColor } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onLogout: () => void;
  currentTheme: ThemeColor;
  onThemeChange: (theme: ThemeColor) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onLogout, currentTheme, onThemeChange, darkMode, onToggleDarkMode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/schedule', label: 'Schedule', icon: Calendar },
    { path: '/available', label: 'Available Rooms', icon: CheckCircle },
    { path: '/in-use', label: 'Rooms in Use', icon: Clock },
  ];

  if (role === UserRole.ADMIN) {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: Settings });
  }

  const themes: { id: ThemeColor; color: string; label: string }[] = [
    { id: 'default', color: 'bg-blue-500', label: 'Default' },
    { id: 'teal', color: 'bg-teal-500', label: 'Teal' },
    { id: 'violet', color: 'bg-violet-500', label: 'Violet' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <aside className="bg-white dark:bg-slate-800 w-full md:w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col sticky top-0 h-auto md:h-screen z-20 transition-colors duration-300">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-700">
          <div className="bg-primary-600 p-2 rounded-lg transition-colors duration-300">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RoomSync</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Schedule, Simplified.</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname === item.path;
             return (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                   isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                 }`}
               >
                 <Icon size={20} />
                 <span>{item.label}</span>
               </NavLink>
             );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
          {/* Theme Selector */}
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-colors">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    <Palette size={14} />
                    <span>Theme</span>
                </div>
                <button 
                   onClick={onToggleDarkMode} 
                   className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                   title="Toggle Dark Mode"
                >
                   {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
             </div>
             <div className="flex space-x-2">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={`w-6 h-6 rounded-full ${theme.color} transition-all ${currentTheme === theme.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 dark:ring-offset-slate-800 scale-110' : 'hover:scale-110'}`}
                    title={theme.label}
                  />
                ))}
             </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
             <div className="flex items-center space-x-2">
                {role === UserRole.ADMIN ? (
                    <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                ) : (
                    <GraduationCap size={16} className="text-green-600 dark:text-green-400" />
                )}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {role === UserRole.ADMIN ? 'Admin Access' : 'Student View'}
                </span>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};