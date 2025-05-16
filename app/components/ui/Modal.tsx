'use client'

import type React from 'react'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  children: React.ReactNode
  className?: string
  onClose?: () => void
}

export function Modal({ children, className, onClose }: ModalProps) {
  const overlay = useRef<HTMLDivElement>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }, [onClose, router])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    },
    [handleClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        handleClose()
      }
    },
    [handleClose, overlay, wrapper]
  )

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleClick}
    >
      <div
        ref={wrapper}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className={cn(
            'relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-400',
            className
          )}
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-950 dark:focus:ring-gray-800"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}
