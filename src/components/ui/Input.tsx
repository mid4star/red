'use client';

import React from 'react';

const sizeMap: Record<string, string> = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = 'md', hasError, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full inline-flex items-center justify-center rounded-md px-3 border transition-colors duration-200 bg-th-input text-th-text ${sizeMap[inputSize] || sizeMap.md} ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-th-border focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'} outline-none ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
