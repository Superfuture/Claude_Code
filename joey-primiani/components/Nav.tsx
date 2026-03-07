'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function Nav() {
  const [hidden, setHidden] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    if (isHome) {
      setHidden(false)
      setAtTop(true)
      return
    }
    let last = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      setAtTop(y < 20)
      setHidden(y > last && y > 80)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between transition-transform duration-300"
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        background: atTop ? 'transparent' : 'rgba(5,5,5,0.8)',
        backdropFilter: atTop ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: atTop ? 'none' : 'blur(12px)',
        borderBottom: atTop ? 'none' : '1px solid var(--border)',
        transition: 'transform 0.3s ease, background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Link
        href="/"
        className="text-sm tracking-[0.15em] uppercase font-sans transition-opacity hover:opacity-60"
        style={{ color: 'var(--fg)', fontFamily: 'var(--font-sans)' }}
      >
        Joey Primiani
      </Link>

      <div className="flex items-center gap-7">
        {[
          { href: '/work', label: 'Work' },
          { href: '/#about', label: 'About' },
          { href: 'mailto:jprimiani@gmail.com', label: 'Contact' },
        ].map(({ href, label }) => (
          <Link
            key={label}
            href={href}
            className="text-xs tracking-[0.15em] uppercase font-sans transition-opacity hover:opacity-60"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
          >
            {label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  )
}
