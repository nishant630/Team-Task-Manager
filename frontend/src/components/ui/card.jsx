import React from 'react';

export const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-2xl border border-slate-200/60 bg-white shadow-xl shadow-slate-100/40 p-6 ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 pb-4 ${className}`} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`font-display font-bold text-2xl text-slate-800 tracking-tight ${className}`} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className = '', ...props }) => (
  <p className={`text-xs text-slate-400 font-medium uppercase tracking-wider ${className}`} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className = '', ...props }) => (
  <div className={`${className}`} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className = '', ...props }) => (
  <div className={`flex items-center pt-4 border-t border-slate-100 mt-4 ${className}`} {...props} />
);
CardFooter.displayName = 'CardFooter';
