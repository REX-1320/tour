'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'onClick'> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export default function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  href,
  onClick,
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
    if (href.startsWith('/')) {
      return (
        <Link href={href} className={combinedClass} style={{ display: 'inline-flex', verticalAlign: 'middle' }} onClick={onClick as any}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={combinedClass} style={{ display: 'inline-flex', verticalAlign: 'middle' }} onClick={onClick as any}>
        {children}
      </a>
    );
  }

  return (
    <motion.button
      className={combinedClass}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
