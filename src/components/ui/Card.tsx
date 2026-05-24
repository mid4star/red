'use client';

import React from 'react';

const variantMap: Record<string, string> = {
  default: 'bg-white/5 border-white/10',
  dark: 'bg-[#1a1a2e] text-white/90 border-white/10',
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  variant?: 'default' | 'dark';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ interactive, variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`backdrop-blur-[10px] rounded-xl border p-4 shadow-sm transition-all duration-300 ${variantMap[variant] || variantMap.default} ${interactive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
