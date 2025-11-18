
import React, { useState, useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { BuildControls } from './components/BuildControls';
import { Header } from './components/Header';
import { generateBuild } from './services/geminiService';
import { BlockData, AppMode, BuildProject } from './types';
import { exportToOBJ, generateInstructions } from './utils/exportUtils';
import { Download, Printer, Share2, Hammer, Layers, RotateCcw, Search } from 'lucide-react';

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.BUILDER);
  const [gallery, setGallery] = useState<BuildProject[]>([]);
  const [exploded, setExploded] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("Initial");
  const [searchTerm, setSearchTerm] = useState("");

  // Load gallery from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nego_gallery');
    if (saved) {
      try {
        setGallery(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gallery");
      }
    }
  }, []);

  // Save gallery when updated
  useEffect(() => {
    localStorage.setItem('nego_gallery', JSON.stringify(gallery));
  }, [gallery]);

  const handleGenerate = async (text: string, imageBase64?: string, mimeType?: string) => {
    setIsGenerating(true);
    setExploded(false);
    try {
      const newBlocks = await generateBuild(text, imageBase64 ? { base64: imageBase64, mimeType: mimeType! } : undefined);
      setBlocks(newBlocks);
      setLastPrompt(text || "Image Build");
      
      // Auto-save to gallery if successful
      if (newBlocks.length > 0) {
        const newProject: BuildProject = {
          id: Date.now().toString(),
          name: text.slice(0, 20) || "Untitled Build",
          timestamp: Date.now(),
          blocks: newBlocks
        };
        setGallery(prev => [newProject, ...prev]);
      }
    } catch (error) {
      alert("Could not build. Please check your API Key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setBlocks([]);
    setExploded(false);
  };

  const loadFromGallery = (project: BuildProject) => {
    setBlocks(project.blocks);
    setLastPrompt(project.name);
    setMode(AppMode.BUILDER);
    setExploded(false);
  };

  const shareBuild = () => {
      const text = `Check out my NEGO build: "${lastPrompt}"! #NegoAI #NoamGoldBlocks`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  const filteredGallery = gallery.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col font-sans text-slate-800 relative">
      <Header currentMode={mode} setMode={setMode} />

      <main className="flex-1 relative overflow-hidden pt-16">
        {mode === AppMode.BUILDER && (
          <>
            <div className="absolute inset-0 z-0">
              <Scene3D blocks={blocks} exploded={exploded} />
            </div>

            {/* Floating Controls Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                 {/* Placeholder for stats or tools if needed */}
            </div>

            {/* Input Panel */}
            <div className="absolute top-6 right-6 z-10 w-[400px] max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
              <BuildControls 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating} 
                onClear={handleClear}
              />
              
              {blocks.length > 0 && (
                <div className="mt-4 bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg border border-slate-200 space-y-2">
                   <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Actions</h3>
                   
                   <button 
                    onClick={() => setExploded(!exploded)}
                    className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors ${exploded ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                   >
                     <Hammer className="w-4 h-4" />
                     {exploded ? "Rebuild" : "Break Blocks"}
                   </button>

                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => exportToOBJ(blocks, lastPrompt)}
                        className="py-2 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        3D File (.obj)
                      </button>
                      <button 
                         onClick={() => generateInstructions(blocks, lastPrompt)}
                         className="py-2 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold"
                      >
                        <Printer className="w-4 h-4" />
                        Instructions
                      </button>
                   </div>

                   <button 
                     onClick={shareBuild}
                     className="w-full py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
                   >
                     <Share2 className="w-4 h-4" />
                     Share Build
                   </button>
                </div>
              )}
            </div>
          </>
        )}

        {mode === AppMode.GALLERY && (
          <div className="h-full overflow-y-auto bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                  <Layers className="w-8 h-8 text-blue-600" />
                  My Builds Gallery
                </h2>
                
                {gallery.length > 0 && (
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search builds..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm shadow-sm"
                    />
                  </div>
                )}
              </div>
              
              {gallery.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <p className="text-xl">No builds yet. Go to Builder to create something!</p>
                </div>
              ) : filteredGallery.length === 0 ? (
                 <div className="text-center py-20 text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No builds match "{searchTerm}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGallery.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 p-6 transition-all">
                       <div className="flex items-center justify-between mb-4">
                         <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
                         </div>
                         <span className="text-xs text-slate-400 font-mono">
                           {new Date(project.timestamp).toLocaleDateString()}
                         </span>
                       </div>
                       <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{project.name}</h3>
                       <p className="text-sm text-slate-500 mb-6">{project.blocks.length} Blocks</p>
                       
                       <div className="flex gap-2">
                         <button 
                           onClick={() => loadFromGallery(project)}
                           className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-700"
                         >
                           Load
                         </button>
                         <button 
                           onClick={() => {
                             setGallery(prev => prev.filter(p => p.id !== project.id));
                           }}
                           className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                         >
                           <RotateCcw className="w-4 h-4 transform rotate-45" />
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-3 px-6 flex items-center justify-between text-xs text-slate-500 z-50">
        <div className="font-bold text-slate-700">(C) Noam Gold AI 2025</div>
        <div className="flex gap-4">
            <a href="mailto:gold.noam@gmail.com" className="hover:text-blue-600 transition-colors">Send Feedback: gold.noam@gmail.com</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
