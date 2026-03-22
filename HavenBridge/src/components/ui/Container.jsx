import React from 'react';

const SIZES = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export default function Container({ 
  children, 
  className = '', 
  size = 'xl',
  padding = true,
  centered = true,
  as: Component = 'div'
}) {
  const sizeClass = SIZES[size] || size;
  const paddingClass = padding ? 'px-4 sm:px-6 lg:px-8' : '';
  const centerClass = centered ? 'mx-auto' : '';

  return (
    <Component 
      className={`${sizeClass} ${paddingClass} ${centerClass} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

// Section variant for full-width sections with contained content
Container.Section = function ContainerSection({ 
  children, 
  className = '', 
  bg = 'bg-white',
  size = 'xl',
  padding = true 
}) {
  return (
    <section className={`${bg} section-padding ${className}`}>
      <Container size={size} padding={padding}>
        {children}
      </Container>
    </section>
  );
};
