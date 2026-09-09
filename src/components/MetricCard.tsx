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
        return 'border-rose-500/30 hover:border-rose-500/50';
      case 'warning':
        return 'border-amber-500/30 hover:border-amber-500/50';
      case 'optimal':
      default:
        return 'border-slate-200 dark:border-zinc-800 hover:border-zinc-700';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white dark:bg-zinc-900 rounded-xl p-3.5 border transition-all duration-200 shadow-sm ${getStatusColor()} ${
        onClick ? 'cursor-pointer hover:border-zinc-700' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-1.5 pt-0.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-mono">{value}</span>
            {unit && <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-zinc-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
        {subtitle && <span className="text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">{subtitle}</span>}
        {changePercent !== undefined && (
          <div
            className={`flex items-center space-x-1 font-mono font-medium ml-auto ${
              trend === 'up'
                ? 'text-emerald-500 dark:text-emerald-400'
                : trend === 'down'
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`}</span>
            <span className="text-slate-400 dark:text-zinc-500 text-[9px]">vs last mo</span>
          </div>
        )}
      </div>
    </div>
  );
};
