import React from 'react';
import { Blocks, Grid3X3, Sun, Moon } from 'lucide-react';
import { AppMode, Theme } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, setMode, theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <header className={`absolute top-0 left-0 right-0 h-16 backdrop-blur-md border-b flex items-center justify-between px-6 z-50 transition-colors duration-300
      ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
      
      <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => setMode(AppMode.BUILDER)}>
        <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-sm transform rotate-3 shadow-sm"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-sm absolute top-0 left-0 transform -rotate-6 opacity-80"></div>
            <div className="w-8 h-8 bg-yellow-400 rounded-sm absolute top-0 left-0 flex items-center justify-center font-black text-yellow-800 text-xs">NG</div>
        </div>
        <h1 className={`text-2xl font-black tracking-tighter hidden sm:block ${isDark ? 'text-white' : 'text-slate-800'}`}>NEGO</h1>
      </div>

      <nav className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className={`h-6 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

        <button
          onClick={() => setMode(AppMode.BUILDER)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2
            ${currentMode === AppMode.BUILDER 
              ? (isDark ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'bg-slate-900 text-white shadow-md') 
              : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}
        >
          <Blocks className="w-4 h-4" />
          <span className="hidden sm:inline">Builder</span>
        </button>
        <button
          onClick={() => setMode(AppMode.GALLERY)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2
            ${currentMode === AppMode.GALLERY 
              ? (isDark ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'bg-slate-900 text-white shadow-md') 
              : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="hidden sm:inline">Gallery</span>
        </button>
      </nav>
    </header>
  );
};
