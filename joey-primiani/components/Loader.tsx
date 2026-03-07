'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoaderProps {
  onComplete: () => void
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  const finish = useCallback(() => {
    setVisible(false)
    sessionStorage.setItem('jp-loaded', '1')
    setTimeout(onComplete, 700)
  }, [onComplete])

  useEffect(() => {
    if (sessionStorage.getItem('jp-loaded')) {
      setVisible(false)
      onComplete()
      return
    }

    let p = 0
    const step = () => {
      p += Math.random() * 18 + 4
      if (p >= 100) {
        setProgress(100)
        setTimeout(finish, 500)
        return
      }
      setProgress(p)
      setTimeout(step, 80 + Math.random() * 80)
    }
    const t = setTimeout(step, 200)
    return () => clearTimeout(t)
  }, [finish, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'var(--bg)' }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {/* Monogram */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            className="font-serif text-5xl font-bold tracking-widest mb-12"
            style={{ color: 'var(--fg)', fontFamily: 'var(--font-serif)' }}
          >
            JP
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-40 h-px relative overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <motion.div
                className="absolute inset-y-0 left-0"
                style={{ background: 'var(--accent)' }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.25, ease: 'linear' }}
              />
            </div>
            <span
              className="text-xs tracking-[0.2em] tabular-nums"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
            >
              {String(Math.round(Math.min(progress, 100))).padStart(3, '0')}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
