
import React, { useState, useRef } from 'react';
import { Loader2, Upload, Image as ImageIcon, Wand2, Trash2, X, BarChart3, Undo2, Redo2, MousePointerClick } from 'lucide-react';
import { Theme, Density } from '../types';

interface BuildControlsProps {
  onGenerate: (text: string, density: Density, imageBase64?: string, mimeType?: string) => void;
  isGenerating: boolean;
  onClear: () => void;
  theme: Theme;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const BuildControls: React.FC<BuildControlsProps> = ({ 
    onGenerate, isGenerating, onClear, theme, canUndo, canRedo, onUndo, onRedo 
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [density, setDensity] = useState<Density>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isDark = theme === 'dark';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
      setSelectedImage({ base64: base64Data, mimeType });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !selectedImage) return;
    onGenerate(prompt, density, selectedImage?.base64, selectedImage?.mimeType);
  };

  return (
    <div className={`p-6 rounded-2xl shadow-xl border space-y-4 w-full max-w-md mx-auto relative z-10 transition-colors duration-300
      ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
      
      <div className="flex items-center justify-between mb-2">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <span className="bg-yellow-400 w-6 h-6 block rounded-sm border border-yellow-600 shadow-sm"></span>
            Build Station
        </h2>
        {selectedImage && (
             <button 
             onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
             className="text-xs text-red-500 hover:underline"
           >
             Remove Image
           </button>
        )}
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-4 transition-colors 
        ${isDragging 
            ? (isDark ? 'border-blue-400 bg-blue-900/30' : 'border-blue-500 bg-blue-50') 
            : (selectedImage 
                ? (isDark ? 'border-green-500 bg-green-900/20' : 'border-green-400 bg-green-50')
                : (isDark ? 'border-slate-600 bg-slate-900/50 hover:bg-slate-900' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'))
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        
        {selectedImage ? (
          <div className="flex items-center gap-4">
            <img src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`} className="w-16 h-16 object-cover rounded-lg border border-slate-300 shadow-sm" alt="Preview" />
            <div className="flex-1">
               <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Image attached</p>
               <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ready to sculpt</p>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center cursor-pointer py-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className={`w-8 h-8 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Drag image or click to upload</p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>For Image-to-Block generation</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Instruction</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A small blue castle, A red racecar..."
              className={`w-full p-3 pr-8 border rounded-lg focus:ring-2 outline-none resize-none h-24 text-sm transition-colors
                ${isDark 
                    ? 'bg-slate-900 border-slate-600 focus:border-blue-500 focus:ring-blue-500/50 text-slate-100 placeholder-slate-500' 
                    : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-slate-800 placeholder-slate-400'}`}
              disabled={isGenerating}
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className={`absolute top-2 right-2 rounded-full p-1 transition-colors
                    ${isDark ? 'text-slate-500 hover:text-slate-300 bg-slate-800/50' : 'text-slate-400 hover:text-slate-600 bg-white/50'}`}
                title="Clear text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
           <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Block Density: <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{density}</span>
                </label>
                <BarChart3 className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
           </div>
           <input 
            type="range" 
            min="0" 
            max="2" 
            step="1" 
            value={density === 'low' ? 0 : density === 'medium' ? 1 : 2}
            onChange={(e) => {
                const val = parseInt(e.target.value);
                setDensity(val === 0 ? 'low' : val === 1 ? 'medium' : 'high');
            }}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer
                ${isDark ? 'bg-slate-700 accent-blue-500' : 'bg-slate-200 accent-blue-600'}`}
            disabled={isGenerating}
           />
           <div className={`flex justify-between text-[10px] uppercase font-bold mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
             <span>Low</span>
             <span>Medium</span>
             <span>High</span>
           </div>
        </div>

        {/* Tools and Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-200/10 mt-2">
            <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo || isGenerating}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center
                    ${isDark 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50'}`}
                title="Undo (Ctrl+Z)"
            >
                <Undo2 className="w-5 h-5" />
            </button>
            <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo || isGenerating}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center
                    ${isDark 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50'}`}
                title="Redo (Ctrl+Y)"
            >
                <Redo2 className="w-5 h-5" />
            </button>
            <button
            type="button"
            onClick={onClear}
            disabled={isGenerating}
            className={`p-2 rounded-lg border transition-colors flex-1 flex items-center justify-center gap-2
                ${isDark 
                    ? 'bg-slate-700 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border-slate-600' 
                    : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-200'}`}
            title="Clear Scene"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Clear</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isGenerating || (!prompt && !selectedImage)}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2
              ${isGenerating || (!prompt && !selectedImage) 
                ? (isDark ? 'bg-slate-600 cursor-not-allowed shadow-none text-slate-400' : 'bg-slate-400 cursor-not-allowed shadow-none') 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/30'}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Building...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Build It
              </>
            )}
          </button>
        </div>
        
        <div className={`text-[10px] text-center flex items-center justify-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <MousePointerClick className="w-3 h-3" />
            <span>Click to Delete &bull; Alt+Click to Add Block</span>
        </div>
      </form>
    </div>
  );
};
