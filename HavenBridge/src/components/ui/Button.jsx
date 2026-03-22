import React from 'react';

const VARIANTS = {
  primary: `
    bg-gradient-to-r from-orange-400 to-orange-500 
    text-white font-semibold
    shadow-md hover:shadow-lg hover:shadow-orange-500/25
    hover:from-orange-500 hover:to-orange-600
    active:scale-[0.98]
  `,
  secondary: `
    bg-white text-teal-700 
    border border-gray-200
    shadow-sm hover:shadow-md
    hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-white 
    hover:bg-white/15 
    backdrop-blur-sm
    active:bg-white/20
  `,
  outline: `
    bg-transparent 
    border-2 border-teal-600 text-teal-700
    hover:bg-teal-50 hover:border-teal-700 hover:text-teal-800
    active:scale-[0.98]
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 
    text-white
    shadow-md hover:shadow-lg hover:shadow-red-500/25
    hover:from-red-600 hover:to-red-700
    active:scale-[0.98]
  `,
  teal: `
    bg-gradient-to-r from-teal-600 to-teal-700
    text-white font-semibold
    shadow-md hover:shadow-lg hover:shadow-teal-500/25
    hover:from-teal-700 hover:to-teal-800
    active:scale-[0.98]
  `
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-7 py-3.5 text-lg rounded-xl',
  xl: 'px-9 py-4 text-xl rounded-2xl'
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  disabled = false, 
  loading = false,
  icon,
  iconPosition = 'left',
  ...props 
}) {
  const base = `
    inline-flex items-center justify-center gap-2.5
    font-semibold tracking-wide
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
    select-none
  `;
  
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const disabledClass = disabled || loading 
    ? 'opacity-50 cursor-not-allowed pointer-events-none saturate-75' 
    : 'cursor-pointer';

  return (
    <button 
      className={`${base} ${v} ${s} ${className} ${disabledClass}`.replace(/\s+/g, ' ').trim()} 
      disabled={disabled || loading} 
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" cy="12" r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}
