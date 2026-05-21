'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalPortalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidthClass?: string
}

export default function ModalPortal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'sm:max-w-md'
}: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div className={`relative w-full ${maxWidthClass} bg-black border border-slate-800 rounded-t-[2rem] sm:rounded-2xl shadow-2xl p-6 overflow-hidden animate-fade-float-in z-10 max-h-[95vh] flex flex-col`}>
        {/* Subtle flat border accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-amber-500/80" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0 relative z-10">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-700/50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 overflow-y-auto pr-1 flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
