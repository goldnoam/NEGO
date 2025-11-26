
import React, { useState, useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { BuildControls } from './components/BuildControls';
import { Header } from './components/Header';
import { generateBuild } from './services/geminiService';
import { BlockData, AppMode, BuildProject, Theme, Density } from './types';
import { exportToOBJ, generateInstructions } from './utils/exportUtils';
import { Download, Printer, Share2, Hammer, Layers, RotateCcw, Search, Quote } from 'lucide-react';

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.BUILDER);
  const [gallery, setGallery] = useState<BuildProject[]>([]);
  const [exploded, setExploded] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("Initial");
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark

  // Load theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('nego_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to local storage
  useEffect(() => {
    localStorage.setItem('nego_theme', theme);
  }, [theme]);

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
    try {
        localStorage.setItem('nego_gallery', JSON.stringify(gallery));
    } catch (e) {
        console.error("Failed to save gallery - likely storage quota exceeded", e);
    }
  }, [gallery]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleGenerate = async (text: string, density: Density, imageBase64?: string, mimeType?: string) => {
    setIsGenerating(true);
    setExploded(false);
    try {
      const newBlocks = await generateBuild(text, density, imageBase64 ? { base64: imageBase64, mimeType: mimeType! } : undefined);
      setBlocks(newBlocks);
      setLastPrompt(text || "Image Build");
      
      // Auto-save to gallery if successful
      if (newBlocks.length > 0) {
        const newProject: BuildProject = {
          id: Date.now().toString(),
          name: text.slice(0, 20) || "Untitled Build",
          timestamp: Date.now(),
          blocks: newBlocks,
          originalPrompt: text,
          originalImage: imageBase64 ? `data:${mimeType};base64,${imageBase64}` : undefined
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
    setLastPrompt(project.originalPrompt || project.name);
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

  const isDark = theme === 'dark';

  return (
    <div className={`h-full flex flex-col font-sans transition-colors duration-300 relative ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
      <Header currentMode={mode} setMode={setMode} theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1 relative overflow-hidden pt-16">
        {mode === AppMode.BUILDER && (
          <>
            <div className="absolute inset-0 z-0">
              <Scene3D blocks={blocks} exploded={exploded} theme={theme} />
            </div>

            {/* Input Panel */}
            <div className="absolute top-6 right-6 z-10 w-[400px] max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar">
              <BuildControls 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating} 
                onClear={handleClear}
                theme={theme}
              />
              
              {blocks.length > 0 && (
                <div className={`mt-4 backdrop-blur rounded-xl p-4 shadow-lg border space-y-2 transition-colors duration-300
                    ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
                   <h3 className={`text-xs font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</h3>
                   
                   <button 
                    onClick={() => setExploded(!exploded)}
                    className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors 
                        ${exploded 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : (isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}`}
                   >
                     <Hammer className="w-4 h-4" />
                     {exploded ? "Rebuild" : "Break Blocks"}
                   </button>

                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => exportToOBJ(blocks, lastPrompt)}
                        className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors
                            ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-blue-900/50 hover:text-blue-400' : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'}`}
                      >
                        <Download className="w-4 h-4" />
                        3D File (.obj)
                      </button>
                      <button 
                         onClick={() => generateInstructions(blocks, lastPrompt)}
                         className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-colors
                             ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-blue-900/50 hover:text-blue-400' : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'}`}
                      >
                        <Printer className="w-4 h-4" />
                        Instructions
                      </button>
                   </div>

                   <button 
                     onClick={shareBuild}
                     className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors
                         ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
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
          <div className={`h-full overflow-y-auto p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className={`text-3xl font-black flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <Layers className="w-8 h-8 text-blue-600" />
                  My Builds Gallery
                </h2>
                
                {gallery.length > 0 && (
                  <div className="relative w-full md:w-72">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder="Search builds..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-colors
                          ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>
                )}
              </div>
              
              {gallery.length === 0 ? (
                <div className={`text-center py-20 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <p className="text-xl">No builds yet. Go to Builder to create something!</p>
                </div>
              ) : filteredGallery.length === 0 ? (
                 <div className={`text-center py-20 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No builds match "{searchTerm}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGallery.map((project) => (
                    <div key={project.id} className={`rounded-xl shadow-sm hover:shadow-md border p-6 transition-all flex flex-col h-full
                        ${isDark ? 'bg-slate-900 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200'}`}>
                       <div className="flex items-center justify-between mb-4">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            {project.originalImage ? (
                                <img src={project.originalImage} alt="Reference" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
                            )}
                         </div>
                         <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                           {new Date(project.timestamp).toLocaleDateString()}
                         </span>
                       </div>
                       <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{project.name}</h3>
                       <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{project.blocks.length} Blocks</p>

                       {project.originalPrompt && (
                           <div className={`p-3 rounded-lg mb-4 flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                <Quote className={`w-3 h-3 mb-1 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                                <p className={`text-xs italic line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    "{project.originalPrompt}"
                                </p>
                           </div>
                       )}
                       
                       <div className="flex gap-2 mt-auto">
                         <button 
                           onClick={() => loadFromGallery(project)}
                           className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors
                               ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                         >
                           Load
                         </button>
                         <button 
                           onClick={() => {
                             setGallery(prev => prev.filter(p => p.id !== project.id));
                           }}
                           className={`px-3 rounded-lg hover:text-red-500 transition-colors
                               ${isDark ? 'bg-slate-800 text-slate-500 hover:bg-red-900/30' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                           title="Delete Build"
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

      <footer className={`border-t py-3 px-6 flex items-center justify-between text-xs z-50 transition-colors duration-300
          ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>(C) Noam Gold AI 2025</div>
        <div className="flex gap-4">
            <a href="mailto:gold.noam@gmail.com" className="hover:text-blue-600 transition-colors">Send Feedback: gold.noam@gmail.com</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
