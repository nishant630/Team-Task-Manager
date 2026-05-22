import React from 'react';

export const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
  
  const variants = {
    default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/10',
    destructive: 'bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger-500/10',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-905',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-150',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    link: 'text-primary-600 underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-5 py-2.5',
    sm: 'h-9 px-3 rounded-lg',
    lg: 'h-11 px-8 rounded-xl',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});

Button.displayName = 'Button';
