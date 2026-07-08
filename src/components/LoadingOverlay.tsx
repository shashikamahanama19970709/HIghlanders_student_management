import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-50/65 backdrop-blur-[1px]">
      {/* Self-contained CSS keyframes for a smooth, hardware-accelerated sliding progress bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loadingSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-loading-slide {
          animation: loadingSlide 1.5s infinite ease-in-out;
        }
      `}} />

      <div className="flex flex-col items-center max-w-xs w-full px-6">
        {/* Shield Logo with a very soft, premium breathing pulse */}
        <div className="w-16 h-16 mb-4 select-none animate-pulse" style={{ animationDuration: '2.5s' }}>
          <img 
            src="/images/logo.png" 
            alt="Highlanders" 
            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        
        {/* Brand Text */}
        <h3 className="text-gray-800 text-xs font-black tracking-widest uppercase font-athletic text-center mb-0.5">
          Highlanders
        </h3>
        <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest text-center mb-4">
          Taekwondo CIC
        </p>

        {/* Minimalist Linear Progress Bar */}
        <div className="w-24 h-[2px] bg-gray-200 rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary-sunset to-orange-500 rounded-full w-8 animate-loading-slide" />
        </div>
      </div>
    </div>
  );
}
