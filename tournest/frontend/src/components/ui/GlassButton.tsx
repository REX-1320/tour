'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface GlassButtonProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  href,
  onClick,
  disabled = false,
  type = 'button',
}: GlassButtonProps) {
  const router = useRouter();

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

  const handleClick = (e: any) => {
    if (disabled) return;
    
    // Custom onClick handler execution
    if (onClick) {
      onClick(e);
    }
    
    // Navigation routing
    if (href && !e.defaultPrevented) {
      e.preventDefault();
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(href);
      }
    }
  };

  return (
    <motion.button
      type={type}
      className={combinedClass}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
