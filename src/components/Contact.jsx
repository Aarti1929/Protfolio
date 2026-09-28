import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { SITE } from '../data/site'
import { useEnv } from '../hooks/useEnv'
import { useMagnetic } from '../hooks/useMagnetic'
import { LineReveal } from './ui/Reveal'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // clipboard API can be blocked inside embedded frames — fall back to a hidden textarea
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
    return ok
  }
}

export default function Contact() {
  const { coarse } = useEnv()
  const [copied, setCopied] = useState(false)
  const btn = useRef(null)
  const wrap = useRef(null)
  const timer = useRef(0)
  useMagnetic(btn, { strength: 0.22, pad: 120 })
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    await copyText(SITE.email)
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2400)
  }
  const glow = (e) => {
    if (coarse) return
    const r = btn.current.getBoundingClientRect()
    btn.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    btn.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section id="contact" className="contact" data-nav="contact" ref={wrap} aria-labelledby="contact-h">
      <div className="contact__aura" aria-hidden="true" />
      <div className="section__meta contact__meta">
        <span className="label" id="contact-h">EXIT THE LAB</span>
        <span className="label contact__avail"><i className="dot" /> AVAILABLE FOR WORK</span>
      </div>

      <p className="contact__q label">HAVE AN IDEA?</p>
      <LineReveal as="h2" className="display contact__title" lines={["LET'S MAKE", 'SOMETHING', 'REAL.']} />

      <div className="contact__cta">
        <button
          ref={btn}
          type="button"
          className={`mail ${copied ? 'is-copied' : ''}`}
          onClick={copy}
          onPointerMove={glow}
          data-cursor="copy"
          aria-label={`Copy email address ${SITE.email}`}
        >
          <span className="mail__glow" aria-hidden="true" />
          <span className="mail__text">{SITE.email}</span>
          <ArrowUpRight className="mail__arrow" strokeWidth={1.3} aria-hidden="true" />
          <span className="mail__hint label" aria-hidden="true">
            {copied ? (
              <>
                COPIED <Check size={14} strokeWidth={2.4} />
              </>
            ) : (
              'COPY EMAIL'
            )}
          </span>
        </button>
        <span className="sr-only" role="status" aria-live="polite">{copied ? 'Email address copied to clipboard' : ''}</span>
        <a className="contact__mailto label" href={`mailto:${SITE.email}`}>OR OPEN IN MAIL ↗</a>
      </div>

      <ul className="contact__social">
        {SITE.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noreferrer noopener" data-cursor="link">
              {s.label} <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      <footer className="contact__foot">
        <span className="label">SYSTEM SESSION COMPLETE</span>
        <button type="button" className="label contact__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          BACK TO START ↑
        </button>
        <span className="label">© {SITE.year}</span>
      </footer>
    </section>
  )
}
