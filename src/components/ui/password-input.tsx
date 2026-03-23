'use client'

import { useState } from 'react'
import { Input, InputProps } from './input'
import { Eye, EyeOff, Lock } from 'lucide-react'

export function PasswordInput({ lightMode, leftIcon, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  // Use Lock icon as default if no leftIcon provided
  const finalLeftIcon = leftIcon || (
    <Lock
      size={18}
      className="text-slate-400 dark:text-white/50"
    />
  )

  return (
    <Input
      {...props}
      lightMode={lightMode}
      leftIcon={finalLeftIcon}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`p-1 rounded-md transition-colors cursor-pointer pointer-events-auto ${lightMode ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white/80' : 'hover:bg-white/10 text-white/50 hover:text-white/80'}`}
          tabIndex={-1}
          aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  )
}
