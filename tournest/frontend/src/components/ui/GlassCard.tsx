'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  strong = false,
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  const baseClass = strong ? 'glass-strong rounded-2xl' : hoverEffect ? 'glass-card' : 'glass rounded-2xl';

  return (
    <motion.div
      className={`${baseClass} p-6 sm:p-8 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
