import React from 'react';

const StatCard = ({ title, value, icon: Icon, type = 'default' }) => {
  const themes = {
    default: {
      border: 'border-slate-200/60',
      text: 'text-slate-900',
      bg: 'bg-white',
      iconBg: 'bg-slate-100 text-slate-600',
    },
    success: {
      border: 'border-success-200/50',
      text: 'text-success',
      bg: 'bg-white',
      iconBg: 'bg-success/10 text-success',
    },
    danger: {
      border: 'border-danger-200/50',
      text: 'text-danger',
      bg: 'bg-white',
      iconBg: 'bg-danger/10 text-danger',
    },
    warning: {
      border: 'border-warning-200/50',
      text: 'text-warning',
      bg: 'bg-white',
      iconBg: 'bg-warning/10 text-warning',
    },
    primary: {
      border: 'border-primary-200/50',
      text: 'text-primary-600',
      bg: 'bg-white',
      iconBg: 'bg-primary-50 text-primary-600',
    }
  };

  const theme = themes[type] || themes.default;

  return (
    <div class={`glass-card p-6 border ${theme.border} flex items-center justify-between`}>
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <span class={`font-display text-4xl font-bold leading-none ${theme.text}`}>
          {value}
        </span>
      </div>
      <div class={`h-12 w-12 rounded-xl flex items-center justify-center ${theme.iconBg} shadow-sm`}>
        <Icon size={22} />
      </div>
    </div>
  );
};

export default StatCard;
