'use client'

import { useEffect, type ReactNode } from 'react'
import { AlertTriangle, Trash2, Loader2, Edit2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string | ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  icon?: 'alert' | 'trash' | 'edit' | 'refresh'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon = 'alert',
  loading = false,
}: ConfirmDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  if (!open) return null

  const handleConfirm = async () => {
    await onConfirm()
  }

  const getIcon = () => {
    if (icon === 'trash') return Trash2
    if (icon === 'edit') return Edit2
    if (icon === 'refresh') return RefreshCw
    return AlertTriangle
  }

  const Icon = getIcon()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !loading && onOpenChange(false)}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200",
          "bg-[#120a21]/95 backdrop-blur-2xl",
          "border border-white/10 rounded-[28px]",
          "shadow-2xl shadow-black/50"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center",
                "border-2",
                variant === 'danger'
                  ? 'bg-[#ff4d4d]/10 border-[#ff4d4d]/30 shadow-[0_0_30px_rgba(255,77,77,0.3)]'
                  : variant === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-[#f183ff]/10 border-[#f183ff]/30 shadow-[0_0_30px_rgba(241,131,255,0.3)]'
              )}
            >
              <Icon
                size={36}
                className={cn(
                  "animate-in spin-in-12 duration-500",
                  variant === 'danger' ? 'text-[#ff4d4d]' : variant === 'warning' ? 'text-amber-500' : 'text-[#f183ff]',
                  icon === 'edit' && 'animate-none'
                )}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {title}
          </h2>

          {/* Description */}
          {typeof description === 'string' ? (
            <p className="text-white/60 text-center text-sm leading-relaxed mb-8">
              {description}
            </p>
          ) : (
            <div className="text-white/60 text-center text-sm leading-relaxed mb-8">
              {description}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => !loading && onOpenChange(false)}
              disabled={loading}
              className={cn(
                "flex-1 px-6 py-4 rounded-xl font-semibold text-base",
                "bg-white/5 border border-white/10 text-white/70",
                "hover:bg-white/10 hover:text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                "flex-1 px-6 py-4 rounded-xl font-semibold text-base",
                "flex items-center justify-center gap-2",
                "border-0 shadow-lg",
                variant === 'danger'
                  ? 'bg-[#ff4d4d] text-white shadow-[#ff4d4d]/40 hover:shadow-[#ff4d4d]/60'
                  : variant === 'warning'
                  ? 'bg-amber-500 text-white shadow-amber-500/40 hover:shadow-amber-500/60'
                  : 'bg-[#f183ff] text-white shadow-[#f183ff]/40 hover:shadow-[#f183ff]/60',
                "hover:opacity-90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
