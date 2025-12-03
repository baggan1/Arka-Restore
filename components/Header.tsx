import React from 'react';
import { Leaf, Settings } from 'lucide-react';

const Header = () => {
  const handleConnect = async () => {
    const win = window as any;
    if (win.aistudio?.openSelectKey) {
      await win.aistudio.openSelectKey();
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-800 tracking-tight">Arka Restore</span>
        </div>
        <nav className="flex items-center gap-4">
          <button 
            onClick={handleConnect}
            className="text-xs font-medium text-stone-500 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
            title="Connect Google Cloud Project"
          >
            <Settings className="w-3.5 h-3.5" />
            Connect Project
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;