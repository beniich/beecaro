import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'rating' | 'category';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');

  const getStyle = () => {
    switch (normalized) {
      case 'operational':
      case 'active':
      case 'resolved':
      case 'closed':
      case 'optimal':
      case 'paid':
      case 'normal':
      case 'a+':
      case 'a':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'in_progress':
      case 'pending':
      case 'medium':
      case 'b':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'degraded':
      case 'warning':
      case 'high':
      case 'expiring_soon':
      case 'pending_renewal':
      case 'c':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'critical':
      case 'emergency':
      case 'overdue':
      case 'offline':
      case 'd':
      case 'alert':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'open':
      case 'low':
      case 'preventive':
      case 'inspection':
      default:
        return 'bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-600/40';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase font-mono ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 animate-pulse"></span>
      {formatText(status)}
    </span>
  );
};
