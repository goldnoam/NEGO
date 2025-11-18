import React from 'react';
import { Blocks, Grid3X3, Share2 } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  return (
    <header className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => setMode(AppMode.BUILDER)}>
        <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-sm transform rotate-3 shadow-sm"></div>
            <div className="w-8 h-8 bg-blue-500 rounded-sm absolute top-0 left-0 transform -rotate-6 opacity-80"></div>
            <div className="w-8 h-8 bg-yellow-400 rounded-sm absolute top-0 left-0 flex items-center justify-center font-black text-yellow-800 text-xs">NG</div>
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-slate-800">NEGO</h1>
      </div>

      <nav className="flex gap-2">
        <button
          onClick={() => setMode(AppMode.BUILDER)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2
            ${currentMode === AppMode.BUILDER ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Blocks className="w-4 h-4" />
          Builder
        </button>
        <button
          onClick={() => setMode(AppMode.GALLERY)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2
            ${currentMode === AppMode.GALLERY ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Grid3X3 className="w-4 h-4" />
          Gallery
        </button>
      </nav>
    </header>
  );
};
