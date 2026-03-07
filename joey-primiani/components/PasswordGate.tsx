'use client'

import { useState, useEffect, FormEvent } from 'react'

interface PasswordGateProps {
  slug: string
  password: string
  children: React.ReactNode
}

export default function PasswordGate({ slug, password, children }: PasswordGateProps) {
  const key = `jp-pw-${slug}`
  const [unlocked, setUnlocked] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (sessionStorage.getItem(key) === 'ok') setUnlocked(true)
  }, [key])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value === password) {
      sessionStorage.setItem(key, 'ok')
      setUnlocked(true)
    } else {
      setError(true)
      setValue('')
      setTimeout(() => setError(false), 1500)
    }
  }

  if (!mounted) return null
  if (unlocked) return <>{children}</>

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: 'var(--bg)' }}
    >
      <p
        className="text-xs tracking-[0.2em] uppercase mb-8"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
      >
        This project is password protected
      </p>
      <form onSubmit={submit} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-3 text-sm text-center tracking-widest bg-transparent border transition-colors focus:outline-none"
          style={{
            borderColor: error ? '#ff4d4d' : 'var(--border)',
            color: 'var(--fg)',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <button
          type="submit"
          className="text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-60"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
        >
          Enter →
        </button>
        {error && (
          <p
            className="text-xs tracking-wide"
            style={{ color: '#ff4d4d', fontFamily: 'var(--font-sans)' }}
          >
            Incorrect password
          </p>
        )}
      </form>
    </div>
  )
}
