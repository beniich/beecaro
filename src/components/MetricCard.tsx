import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'optimal' | 'warning' | 'critical';
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  changePercent,
  trend,
  status = 'optimal',
  subtitle,
  icon,
  onClick
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'border-rose-500/30 hover:border-rose-500/50 hover:shadow-rose-950/30';
      case 'warning':
        return 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-950/30';
      case 'optimal':
      default:
        return 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-emerald-950/20';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-5 border transition-all duration-300 shadow-lg ${getStatusColor()} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-1.5 pt-1">
            <span className="text-2xl font-bold tracking-tight text-black dark:text-white font-mono">{value}</span>
            {unit && <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-emerald-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{subtitle}</span>}
        {changePercent !== undefined && (
          <div
            className={`flex items-center space-x-1 font-mono font-medium ml-auto ${
              trend === 'up'
                ? 'text-emerald-400'
                : trend === 'down'
                ? 'text-cyan-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`}</span>
            <span className="text-slate-500 dark:text-slate-500 text-[10px]">vs last mo</span>
          </div>
        )}
      </div>
    </div>
  );
};
