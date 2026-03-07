'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Curtain wipe — slides out on page entry */}
      <motion.div
        className="fixed inset-0 z-[9990] origin-right pointer-events-none"
        style={{ background: 'var(--bg)' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] as const }}
      />

      {/* Page content fades in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, delay: 0.45 }}
      >
        {children}
      </motion.div>
    </>
  )
}
