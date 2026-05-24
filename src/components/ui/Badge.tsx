'use client';

import React from 'react';

const colorMap: Record<string, string> = {
  primary: 'bg-indigo-500/10 text-indigo-400',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  danger: 'bg-rose-500/10 text-rose-400',
  teal: 'bg-teal-500/10 text-teal-400',
};

const sizeMap: Record<string, string> = {
  sm: 'text-[0.7rem] px-1.5 py-0',
  md: 'text-xs px-2 py-0.5',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'teal';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full font-semibold leading-relaxed whitespace-nowrap ${colorMap[color] || colorMap.primary} ${sizeMap[size] || sizeMap.md} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
