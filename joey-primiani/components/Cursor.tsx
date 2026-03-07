'use client'

import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = -200
    let mouseY = -200
    let ringX = -200
    let ringY = -200
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"]')) {
        ring.classList.add('is-hover-link')
        dot.style.opacity = '0'
      }
      if (t.closest('[data-cursor="view"]')) {
        ring.classList.add('is-hover-card')
      }
    }

    const onOut = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"]')) {
        ring.classList.remove('is-hover-link')
        dot.style.opacity = '1'
      }
      if (t.closest('[data-cursor="view"]')) {
        ring.classList.remove('is-hover-card')
      }
    }

    const tick = () => {
      rafId = requestAnimationFrame(tick)
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    tick()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  )
}
