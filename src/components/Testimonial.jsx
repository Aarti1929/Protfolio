import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { SITE } from '../data/site'
import { useEnv } from '../hooks/useEnv'
import { useCanvasLoop } from '../hooks/useCanvasLoop'
import Avatar from './ui/Avatar'
import { LineReveal } from './ui/Reveal'

function Waveform({ reduced }) {
  const cv = useRef(null)
  useCanvasLoop(
    cv,
    (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h)
      const mid = h / 2
      const bars = Math.floor(w / 7)
      for (let i = 0; i < bars; i++) {
        const x = (i / bars) * w
        const u = i / bars
        // slow "speech-like" envelope
        const env = 0.25 + 0.75 * Math.abs(Math.sin(u * 9 + t * 0.6) * Math.sin(u * 3.1 - t * 0.35))
        const amp = env * (0.5 + 0.5 * Math.sin(i * 0.9 + t * 1.6)) * h * 0.34
        const a = 0.14 + env * 0.5
        ctx.fillStyle = i % 5 === 0 ? `rgba(34,211,238,${a})` : `rgba(139,92,255,${a})`
        ctx.fillRect(x, mid - amp, 2, amp * 2 + 1)
      }
    },
    { still: reduced },
  )
  return <canvas ref={cv} className="testi__wave" aria-hidden="true" />
}

export default function Testimonial() {
  const { reduced } = useEnv()
  const T = SITE.testimonial
  const panel = useRef(null)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from(panel.current, {
        y: 60,
        opacity: 0,
        scale: 0.96,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: panel.current, start: 'top 82%', once: true },
      })
    }, panel)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="feedback" className="testi" data-nav="about" aria-label="Client feedback">
      <Waveform reduced={reduced} />
      <div className="testi__panel" ref={panel}>
        <div className="testi__bar">
          <span className="testi__status">
            <i className="dot" /> <span className="label">{T.label}</span>
          </span>
          <span className="label">NEW · JUST NOW</span>
        </div>
        <figure className="testi__fig">
          <blockquote>
            <LineReveal as="p" className="testi__quote" lines={T.quote} start="top 85%" />
          </blockquote>
          <figcaption className="testi__by">
            <Avatar tone="duo" label="Illustrated avatar of Aarti" className="testi__avatar" />
            <span>
              <b>{T.name}</b>
              <span className="label">{T.role}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
