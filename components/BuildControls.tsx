import React, { useState, useRef } from 'react';
import { Loader2, Upload, Image as ImageIcon, Wand2, Trash2 } from 'lucide-react';

interface BuildControlsProps {
  onGenerate: (text: string, imageBase64?: string, mimeType?: string) => void;
  isGenerating: boolean;
  onClear: () => void;
}

export const BuildControls: React.FC<BuildControlsProps> = ({ onGenerate, isGenerating, onClear }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract Base64 and Mime Type
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
    onGenerate(prompt, selectedImage?.base64, selectedImage?.mimeType);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4 w-full max-w-md mx-auto relative z-10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
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
        className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
        } ${selectedImage ? 'border-green-400 bg-green-50' : ''}`}
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
               <p className="text-sm font-medium text-slate-700">Image attached</p>
               <p className="text-xs text-slate-500">Ready to sculpt</p>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center cursor-pointer py-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 font-medium">Drag image or click to upload</p>
            <p className="text-xs text-slate-400">For Image-to-Block generation</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Instruction</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A small blue castle, A red racecar..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24 text-sm"
            disabled={isGenerating}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isGenerating || (!prompt && !selectedImage)}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2
              ${isGenerating || (!prompt && !selectedImage) ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-200'}
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
          
          <button
            type="button"
            onClick={onClear}
            disabled={isGenerating}
            className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 p-3 rounded-lg border border-slate-200 transition-colors"
            title="Clear Scene"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
