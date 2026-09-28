import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useEnv } from '../hooks/useEnv'
import { pad2 } from '../lib/util'

const START = 3
const TOTAL = 27
const TAU = Math.PI * 2

// Polar radius functions — the symbol morphs by blending them.
const ngon = (n) => (th) => {
  const a = TAU / n
  const m = ((th % a) + a) % a
  return Math.cos(Math.PI / n) / Math.cos(m - Math.PI / n)
}
const SHAPES = [ngon(3), ngon(4), ngon(6), () => 1, (th) => 0.8 + 0.2 * Math.cos(8 * th), ngon(3)]
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function drawSymbol(ctx, S, tRaw) {
  const t = Math.max(0, tRaw) // rAF timestamps can be slightly earlier than our start time
  const cx = S / 2
  const R = S * 0.36
  const phase = t / 1.05
  const base = Math.floor(phase)
  const f = phase - base
  const e = f < 0.38 ? 0 : ease((f - 0.38) / 0.62)
  const a = SHAPES[base % SHAPES.length]
  const b = SHAPES[(base + 1) % SHAPES.length]
  const N = 140

  const trace = (scale, rot) => {
    ctx.beginPath()
    for (let k = 0; k <= N; k++) {
      const th = (k / N) * TAU
      const q = th + Math.PI / 2
      const r = (a(q) * (1 - e) + b(q) * e) * scale
      const x = cx + Math.cos(th + rot) * r
      const y = cx + Math.sin(th + rot) * r
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.closePath()
  }

  ctx.clearRect(0, 0, S, S)
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1.4
  ctx.strokeStyle = 'rgba(245,245,245,.92)'
  trace(R, -Math.PI / 2 * 0)
  ctx.stroke()

  const g = ctx.createLinearGradient(0, 0, S, S)
  g.addColorStop(0, 'rgba(139,92,255,.95)')
  g.addColorStop(1, 'rgba(34,211,238,.95)')
  ctx.strokeStyle = g
  ctx.lineWidth = 1.2
  trace(R * 0.56, t * 0.7)
  ctx.stroke()

  ctx.fillStyle = 'rgba(245,245,245,.95)'
  ctx.beginPath()
  ctx.arc(cx, cx, 2.2, 0, TAU)
  ctx.fill()

  // registration ticks
  ctx.strokeStyle = 'rgba(245,245,245,.28)'
  ctx.lineWidth = 1
  ctx.beginPath()
  const tk = R * 1.28
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2
    ctx.moveTo(cx + Math.cos(ang) * tk, cx + Math.sin(ang) * tk)
    ctx.lineTo(cx + Math.cos(ang) * (tk + 8), cx + Math.sin(ang) * (tk + 8))
  }
  ctx.stroke()
}

export default function Loader({ onReady, onDone }) {
  const { reduced } = useEnv()
  const [n, setN] = useState(START)
  const root = useRef(null)
  const cv = useRef(null)
  const nameRef = useRef(null)
  const countRef = useRef(null)
  const footRef = useRef(null)
  const cb = useRef({ onReady, onDone })
  cb.current = { onReady, onDone }

  // morphing symbol
  useEffect(() => {
    const c = cv.current
    const S = 150
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = S * dpr
    c.height = S * dpr
    const ctx = c.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (reduced) {
      drawSymbol(ctx, S, 0.2)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      drawSymbol(ctx, S, (now - t0) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  // counter + dissolve
  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    window.scrollTo(0, 0)
    let cancelled = false
    let tl
    const state = { v: START }
    ;(async () => {
      await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))])
      if (cancelled) return
      tl = gsap.timeline()
      tl.fromTo(
        [nameRef.current, footRef.current],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
        0,
      )
        .to(state, { v: TOTAL, duration: reduced ? 0.9 : 2.1, ease: 'power2.inOut', onUpdate: () => setN(Math.round(state.v)) }, 0)
        .to(countRef.current, { opacity: 0, y: -12, duration: 0.4, ease: 'power2.in' }, '+=0.1')
        .to([nameRef.current, footRef.current], { opacity: 0, duration: 0.4 }, '<')
        .add(() => cb.current.onReady?.(), '>-0.1')
        .to(cv.current, { scale: reduced ? 1 : 16, opacity: 0, duration: 1, ease: 'expo.in' }, '<')
        .to(root.current, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.55')
        .add(() => {
          document.documentElement.classList.remove('is-loading')
          cb.current.onDone?.()
        })
    })()
    return () => {
      cancelled = true
      tl?.kill()
      document.documentElement.classList.remove('is-loading')
    }
  }, [reduced])

  const rows = [n - 2, n - 1, n]
  const pct = Math.round(((n - START) / (TOTAL - START)) * 100)

  return (
    <div className="loader" ref={root} role="status" aria-label="Loading Design Lab">
      <div className="loader__center">
        <canvas ref={cv} className="loader__symbol" aria-hidden="true" />
        <div className="loader__name" ref={nameRef}>DESIGN LAB</div>
        <div className="loader__count" ref={countRef} aria-hidden="true">
          {rows.map((v, i) => (
            <div key={i} className={`loader__row r${i}`}>
              {v >= START ? `${pad2(v)} — ${TOTAL}` : '\u00a0'}
            </div>
          ))}
        </div>
      </div>
      <div className="loader__foot" ref={footRef} aria-hidden="true">
        <span>INITIALISING SYSTEM</span>
        <span>{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  )
}
