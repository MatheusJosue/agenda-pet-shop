'use client'

import { motion, Easing } from 'framer-motion'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

type IconName = keyof typeof Icons

interface AnimatedIconProps {
  icon: IconName | React.ComponentType<{ className?: string; size?: number }>
  className?: string
  size?: number
  variant?: 'pulse' | 'bounce' | 'spin' | 'scale' | 'shake' | 'none'
  delay?: number
}

export function AnimatedIcon({
  icon,
  className,
  size = 24,
  variant = 'none',
  delay = 0,
}: AnimatedIconProps) {
  // If icon is a string (name), get the component from Icons
  const IconComponent = typeof icon === 'string'
    ? (Icons[icon as IconName] as React.ComponentType<{ className?: string; size?: number }>)
    : icon

  if (!IconComponent) {
    return null
  }
  const variants = {
    pulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        delay,
      },
    },
    bounce: {
      animate: {
        y: [0, -8, 0],
      },
      transition: {
        duration: 1,
        repeat: Infinity,
        delay,
        ease: 'easeInOut' as Easing,
      },
    },
    spin: {
      animate: {
        rotate: [0, 360],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        delay,
        ease: 'linear' as Easing,
      },
    },
    scale: {
      animate: {
        scale: [1, 1.15, 1],
      },
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut' as Easing,
      },
    },
    shake: {
      animate: {
        rotate: [-5, 5, -5, 5, 0],
      },
      transition: {
        duration: 0.5,
        delay,
      },
    },
    none: {
      animate: {},
      transition: {},
    },
  }

  const { animate, transition } = variants[variant]

  return (
    <motion.div
      animate={animate}
      transition={transition as any}
      className={cn('inline-flex', className)}
    >
      <IconComponent size={size} />
    </motion.div>
  )
}
