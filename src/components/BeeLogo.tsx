import React from 'react';
import logoImage from '../assets/images/beecarbonat_logo_1787760318477.jpg';

interface BeeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textColor?: string;
  tagline?: string;
}

export const BeeLogo: React.FC<BeeLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textColor = 'text-black dark:text-white',
  tagline
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', container: 'w-8 h-8', text: 'text-lg', badge: 'text-[9px]' },
    md: { img: 'w-9 h-9', container: 'w-10 h-10', text: 'text-xl', badge: 'text-[10px]' },
    lg: { img: 'w-12 h-12', container: 'w-14 h-14', text: 'text-3xl', badge: 'text-xs' },
    xl: { img: 'w-16 h-16', container: 'w-18 h-18', text: 'text-4xl', badge: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Bee Logo Icon with glowing ring and subtle hover animation */}
      <div className="relative rounded-xl p-[1px] bg-gradient-to-tr from-slate-700 via-[#ff9a00]/60 to-slate-700 shadow-[0_0_15px_rgba(255,85,0,0.25)] transition-transform hover:scale-105 shrink-0">
        <div className={`${currentSize.container} bg-[#0a0a0a] rounded-[11px] overflow-hidden flex items-center justify-center p-0.5`}>
          <img 
            className={`${currentSize.img} object-contain rounded-lg`} 
            src={logoImage} 
            alt="BeeCarbonIt Logo" 
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Ambient subtle status dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black shadow-[0_0_6px_#10b981]"></span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight font-sans ${currentSize.text} ${textColor}`}>
              Bee<span className="text-orange-500">CarbonIt</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              CAFM
            </span>
          </div>
          {tagline && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};


