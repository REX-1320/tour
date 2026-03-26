'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Merge Framer Motion props with standard button attributes
interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

export default function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  href,
  ...props
}: GlassButtonProps) {
  const variants = {
    default: 'glass-btn',
    primary: 'glass-btn glass-btn-primary',
    danger: 'glass-btn glass-btn-danger',
  };

  const sizes = {
    sm: 'glass-btn-sm',
    md: '',
    lg: 'glass-btn-lg',
  };

  const combinedClass = `${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClass} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
        {children}
      </a>
    );
  }

  return (
    <motion.button
      className={combinedClass}
      whileTap={{ scale: 0.98 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
