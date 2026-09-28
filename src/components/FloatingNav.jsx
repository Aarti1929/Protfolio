import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { SITE } from '../data/site'
import { useEnv } from '../hooks/useEnv'
import { useMagnetic } from '../hooks/useMagnetic'
import { cx, pad2 } from '../lib/util'

export function goTo(id, reduced) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

export default function FloatingNav({ active, ready }) {
  const { reduced } = useEnv()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const cta = useRef(null)
  useMagnetic(cta, { strength: 0.25, pad: 40 })

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // full-screen menu: lock scroll, close on Escape
  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('is-locked')
    const k = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', k)
    return () => {
      document.documentElement.classList.remove('is-locked')
      window.removeEventListener('keydown', k)
    }
  }, [open])

  const jump = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    // wait a beat so the menu can start closing before we scroll
    setTimeout(() => (id === 'top' ? window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }) : goTo(id, reduced)), open ? 350 : 0)
  }

  const ox = typeof window !== 'undefined' ? window.innerWidth - 42 : 320
  const oy = 42

  return (
    <>
      <motion.header
        className={cx('nav', scrolled && 'is-scrolled')}
        initial={{ y: -28, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : { y: -28, opacity: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <a className="nav__pill nav__brand" href="#top" onClick={jump('top')} aria-label={`${SITE.name} — Design Lab, back to top`}>
          <span className="nav__mark">
            [ <b>{SITE.initial}</b> ]
          </span>
          <span className="nav__brandtext">/ DESIGN LAB</span>
        </a>

        <nav className="nav__pill nav__links" aria-label="Primary">
          {SITE.nav.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={jump(l.id)}
              className={cx(active === l.id && 'is-active')}
              aria-current={active === l.id ? 'true' : undefined}
            >
              {active === l.id && <motion.span layoutId="navActive" className="nav__ind" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <span>{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="nav__right">
          <a ref={cta} className="nav__pill nav__cta" href="#contact" onClick={jump('contact')}>
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" /> LET&apos;S TALK
          </a>
        </div>
      </motion.header>

      <button
        type="button"
        className={cx('burger', open && 'is-open')}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: `circle(0px at ${ox}px ${oy}px)` }}
            animate={{ clipPath: `circle(160vmax at ${ox}px ${oy}px)` }}
            exit={{ clipPath: `circle(0px at ${ox}px ${oy}px)` }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="menu__inner">
              <p className="label">NAVIGATE / DESIGN LAB</p>
              <ul>
                {[{ id: 'top', label: 'HOME' }, ...SITE.nav].map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.25 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    <a href={`#${l.id}`} onClick={jump(l.id)}>
                      <span className="menu__n">{pad2(i)}</span>
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <a className="menu__mail" href={`mailto:${SITE.email}`}>
                {SITE.email} <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
