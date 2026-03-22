import React from 'react';

const VARIANTS = {
  default: `
    bg-white 
    rounded-2xl 
    shadow-md hover:shadow-xl
    border border-gray-100
    transition-all duration-300 ease-out
  `,
  elevated: `
    bg-white 
    rounded-2xl 
    shadow-lg hover:shadow-2xl
    border border-gray-50
    transition-all duration-300 ease-out
  `,
  flat: `
    bg-white 
    rounded-xl 
    border border-gray-200
    transition-colors duration-200
    hover:border-gray-300
  `,
  interactive: `
    bg-white 
    rounded-2xl 
    shadow-md hover:shadow-xl
    border border-gray-100 hover:border-teal-200
    transition-all duration-300 ease-out
    hover:-translate-y-1
    cursor-pointer
  `,
  glass: `
    bg-white/80 backdrop-blur-lg
    rounded-2xl 
    shadow-lg
    border border-white/20
    transition-all duration-300
  `,
  gradient: `
    bg-gradient-to-br from-white to-gray-50
    rounded-2xl 
    shadow-md hover:shadow-xl
    border border-gray-100
    transition-all duration-300 ease-out
  `
};

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  shadow = true,
  padding = 'p-6',
  animate = false,
  onClick,
  ...props 
}) {
  const v = shadow ? VARIANTS[variant] || VARIANTS.default : VARIANTS.flat;
  const animateClass = animate ? 'animate-fade-in-up' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${v} ${padding} ${animateClass} ${clickableClass} ${className}`.replace(/\s+/g, ' ').trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Card sub-components for structured layouts
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 mb-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 mt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};
