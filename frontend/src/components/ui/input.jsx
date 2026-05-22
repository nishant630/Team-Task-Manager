import React from 'react';

export const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={`flex h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';
