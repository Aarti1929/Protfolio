import { useEffect, useLayoutEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import GenerativeObject from './GenerativeObject'
import { useEnv } from '../hooks/useEnv'
import { useMagnetic } from '../hooks/useMagnetic'
import { SITE } from '../data/site'
import { goTo } from './FloatingNav'

const LINES = ['DESIGN', 'IS NOT', 'STATIC.']

export default function Hero({ ready }) {
  const env = useEnv()
  const { reduced, coarse } = env
  const wrap = useRef(null)
  const title = useRef(null)
  const scrollBtn = useRef(null)
  const progress = useRef(0)
  const tier = reduced || env.mobile ? 'low' : env.tablet ? 'mid' : 'high'
  useMagnetic(scrollBtn, { strength: 0.35, pad: 90 })

  // initial hidden states + scroll-driven transformation (runs once)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.set('.hero__letter', { yPercent: 118 })
        gsap.set('.hero__fade', { opacity: 0, y: 16 })
        gsap.set('.hero__object', { opacity: 0 })
      }
      ScrollTrigger.create({
        trigger: wrap.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => (progress.current = s.progress),
      })
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: true } })
      if (!reduced) tl.to(title.current, { yPercent: -10, scale: 0.92, ease: 'none', duration: 1 }, 0)
      tl.to('.hero__title, .hero__meta', { opacity: 0, ease: 'power1.in', duration: 0.55 }, 0.45)
    }, wrap)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the single orchestrated intro
  useLayoutEffect(() => {
    if (!ready || reduced) return
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to('.hero__object', { opacity: 1, duration: 2, ease: 'power2.out' }, 0)
      .to('.hero__letter', { yPercent: 0, duration: 1.5, stagger: 0.04 }, 0.1)
      .to('.hero__fade', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.7)
    return () => tl.kill()
  }, [ready, reduced])

  // cursor proximity on the headline + depth parallax on the floating tags
  useEffect(() => {
    if (coarse || reduced) return
    const letters = [...wrap.current.querySelectorAll('.hero__letter')]
    const tags = [...wrap.current.querySelectorAll('[data-depth]')]
    let raf = 0, mx = 0, my = 0
    const apply = () => {
      raf = 0
      if (progress.current < 0.5) {
        for (const el of letters) {
          const r = el.getBoundingClientRect()
          const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
          el.style.setProperty('--near', Math.max(0, 1 - d / (r.height * 1.15)).toFixed(3))
        }
      }
      for (const el of tags) {
        const dp = +el.dataset.depth
        gsap.to(el, { x: (mx / window.innerWidth - 0.5) * dp, y: (my / window.innerHeight - 0.5) * dp, duration: 1.4, ease: 'power3.out', overwrite: true })
      }
    }
    const move = (e) => {
      mx = e.clientX
      my = e.clientY
      if (!raf) raf = requestAnimationFrame(apply)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [coarse, reduced])

  return (
    <section id="top" className="hero" ref={wrap} data-nav="home" aria-label="Introduction">
      <div className="hero__sticky">
        <GenerativeObject progressRef={progress} tier={tier} reduced={reduced} />
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__vignette" aria-hidden="true" />

        <div className="hero__meta hero__meta--top">
          <span className="label hero__fade">WELCOME TO THE LAB / 01</span>
          <span className="label hero__fade hero__hide-sm">SECTOR 01 · GRID 00–00</span>
        </div>

        <h1 className="hero__title" ref={title} aria-label="Design is not static.">
          {LINES.map((line) => (
            <span className="hero__line" key={line} aria-hidden="true">
              {line.split(' ').map((word, wi) => (
                <span className="hero__word" key={wi}>
                  {word.split('').map((ch, ci) => (
                    <span className="hero__letter" key={ci}>
                      <i>{ch}</i>
                    </span>
                  ))}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="hero__intro hero__fade">{SITE.intro}</p>

        {['PRODUCT DESIGN', 'UI / UX', 'INTERACTION'].map((t, i) => (
          <div key={t} className={`hero__tag hero__tag--${i} hero__fade`} data-depth={[46, -34, 60][i]}>
            <span>{t}</span>
          </div>
        ))}

        <div className="hero__meta hero__meta--bottom">
          <span className="hero__status hero__fade">
            <i className="dot" /> SYSTEM ONLINE
          </span>
          <div className="hero__fade hero__scrollwrap">
            <a ref={scrollBtn} className="hero__scroll" href="#work" data-cursor="link" onClick={(e) => (e.preventDefault(), goTo('work', reduced))}>
              <span className="label">SCROLL TO EXPLORE</span>
              <ArrowDown size={18} strokeWidth={1.6} aria-hidden="true" />
              <span className="hero__count">03 EXPERIMENTS</span>
            </a>
          </div>
          <span className="label hero__fade hero__hide-sm">PROJECT / 001–003</span>
        </div>
      </div>
    </section>
  )
}
