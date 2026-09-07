import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        title="System Preference"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('gray')}
        className={`p-1.5 rounded-md transition-all ${
          theme === 'gray'
            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
        title="Mode Gris (Vercel Style)"
      >
        <Palette className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
