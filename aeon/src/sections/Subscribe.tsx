import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export const Subscribe = forwardRef<HTMLElement>(function Subscribe(_, ref) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setErrMsg('Enter a valid email');
      return;
    }
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'aeon-landing' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('ok');
    } catch (err) {
      try {
        const list = JSON.parse(localStorage.getItem('aeon_subscribers') || '[]');
        list.push({ email, ts: Date.now() });
        localStorage.setItem('aeon_subscribers', JSON.stringify(list));
        setStatus('ok');
      } catch {
        setStatus('error');
        setErrMsg('Something went wrong. Try again?');
      }
    }
  };

  return (
    <section
      id="subscribe"
      ref={ref}
      className="relative bg-black px-6 md:px-12 lg:px-20 py-32 overflow-hidden"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.04) 30%, transparent 65%)', filter: 'blur(20px)' }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.h3
          initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="font-heading italic text-white text-5xl md:text-6xl lg:text-7xl tracking-[-2px] leading-[0.95]"
        >
          Join the mission.
        </motion.h3>

        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="mt-5 text-sm md:text-base text-white/70 font-body font-light max-w-md md:max-w-2xl mx-auto md:whitespace-nowrap"
        >
          Quiet progress reports as we build. No spam, no hype — just what's working.
        </motion.p>

        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
          whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="mt-10"
        >
          {status === 'ok' ? (
            <div className="liquid-glass rounded-full inline-flex items-center gap-3 px-6 py-3.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-black">
                <Check className="w-4 h-4" strokeWidth={3} />
              </span>
              <span className="text-sm md:text-base text-white font-body">
                You're in. Welcome to the mission.
              </span>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="flex items-center gap-2 max-w-md mx-auto liquid-glass rounded-full p-1.5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading'}
                className="flex-1 bg-transparent px-4 py-2 text-sm md:text-base text-white placeholder:text-white/40 font-body focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-white text-black rounded-full px-5 py-2 text-sm md:text-base font-medium font-body inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
              >
                {status === 'loading' ? 'Sending…' : 'Subscribe'}
                {status !== 'loading' && <ArrowUpRight className="w-4 h-4" />}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-4 text-sm text-red-300/90 font-body">{errMsg}</p>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="mt-8 text-xs text-white/40 font-body"
        >
          By subscribing you agree to receive occasional updates from Aeon. Unsubscribe anytime.
        </motion.p>
      </div>
    </section>
  );
});
