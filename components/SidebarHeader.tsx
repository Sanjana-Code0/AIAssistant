import React from 'react';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md z-10 relative">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
          <span className="text-xl filter drop-shadow-md">🌙</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">ShadowLight</h1>
          <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-[0.2em] opacity-80">AI Assistant</p>
        </div>
      </div>
      <button
        onClick={() => window.close()}
        className="text-white/70 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
