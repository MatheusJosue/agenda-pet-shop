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

const ICONS = {
  alert: AlertTriangle,
  trash: Trash2,
  edit: Edit2,
  refresh: RefreshCw,
} as const

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

  const Icon = ICONS[icon]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !loading && onOpenChange(false)}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#21363a]/45 backdrop-blur-md animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200",
          "bg-[#fff9fb]/96 backdrop-blur-2xl",
          "border border-[rgba(232,50,123,0.28)] rounded-[24px]",
          "shadow-[0_24px_70px_rgba(33,54,58,0.24)]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-7">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "border-2",
                variant === 'danger'
                  ? 'bg-red-50 border-red-200 shadow-[0_12px_28px_rgba(220,38,38,0.12)]'
                  : variant === 'warning'
                  ? 'bg-amber-50 border-amber-200 shadow-[0_12px_28px_rgba(245,158,11,0.14)]'
                  : 'bg-[#ffe0ec] border-[#ff8cba] shadow-[0_12px_28px_rgba(232,50,123,0.16)]'
              )}
            >
              <Icon
                size={30}
                className={cn(
                  "animate-in spin-in-12 duration-500",
                  variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-[#e8327b]',
                  icon === 'edit' && 'animate-none'
                )}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-[#006c73] text-center mb-3">
            {title}
          </h2>

          {/* Description */}
          {typeof description === 'string' ? (
            <p className="text-[#68797d] text-center text-sm font-semibold leading-relaxed mb-6">
              {description}
            </p>
          ) : (
            <div className="text-[#68797d] text-center text-sm leading-relaxed mb-6">
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
                "bg-white border border-[rgba(232,50,123,0.26)] text-[#006c73]",
                "hover:bg-[#fff1f6] hover:text-[#bf185d]",
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
                  ? 'bg-red-600 text-white shadow-red-500/30 hover:shadow-red-500/45'
                  : variant === 'warning'
                  ? 'bg-amber-500 text-white shadow-amber-500/30 hover:shadow-amber-500/45'
                  : 'bg-[#e8327b] text-white shadow-[#e8327b]/30 hover:shadow-[#e8327b]/45',
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
