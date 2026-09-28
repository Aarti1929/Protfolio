import { useEffect, useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import ExperimentVisual from './ExperimentVisual'
import { useEnv } from '../hooks/useEnv'
import { useMagnetic } from '../hooks/useMagnetic'

/* Tiny particles that spawn under the cursor while it moves over an experiment */
function SparkLayer({ rgb, apiRef }) {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current
    const ctx = c.getContext('2d')
    let w = 1, h = 1, raf = 0
    let parts = []
    const resize = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = r.width; h = r.height
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const step = () => {
      raf = 0
      ctx.clearRect(0, 0, w, h)
      parts = parts.filter((p) => p.life > 0)
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy -= 0.005; p.life -= 0.022
        ctx.fillStyle = `rgba(${rgb},${Math.max(0, p.life) * 0.85})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 6.283)
        ctx.fill()
      }
      if (parts.length) raf = requestAnimationFrame(step)
    }
    apiRef.current = {
      spawn: (x, y) => {
        if (parts.length < 46) parts.push({ x, y, vx: (Math.random() - 0.5) * 0.9, vy: -Math.random() * 0.7 - 0.1, r: Math.random() * 1.7 + 0.6, life: 1 })
        if (!raf) raf = requestAnimationFrame(step)
      },
    }
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    resize()
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      apiRef.current = null
    }
  }, [rgb, apiRef])
  return <canvas ref={cv} className="exp__sparks" aria-hidden="true" />
}

export default function ExperimentCard({ project: p, onOpen }) {
  const { coarse, reduced } = useEnv()
  const root = useRef(null)
  const stage = useRef(null)
  const tilt = useRef(null)
  const title = useRef(null)
  const openBtn = useRef(null)
  const pointer = useRef({ x: 0.5, y: 0.5, active: false })
  const sparks = useRef(null)
  const tweens = useRef({})
  useMagnetic(openBtn, { strength: 0.3, pad: 50 })

  // scroll-in: masked stage reveal + meta rise, and pause CSS motion when off-screen
  useLayoutEffect(() => {
    const el = root.current
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from(stage.current, {
          clipPath: 'inset(16% 16% 16% 16% round 40px)',
          scale: 1.06,
          duration: 1.5,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 78%', once: true },
        })
        gsap.from(el.querySelectorAll('.exp__rise'), {
          y: 44,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 70%', once: true },
        })
      }
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (s) => el.classList.toggle('is-inview', s.isActive),
      })
    }, el)
    return () => ctx.revert()
  }, [reduced])

  useEffect(() => {
    if (coarse || reduced) return
    gsap.set(tilt.current, { transformPerspective: 1100 })
    tweens.current = {
      rx: gsap.quickTo(tilt.current, 'rotationX', { duration: 0.8, ease: 'power3.out' }),
      ry: gsap.quickTo(tilt.current, 'rotationY', { duration: 0.8, ease: 'power3.out' }),
      s: gsap.quickTo(tilt.current, 'scale', { duration: 0.9, ease: 'power3.out' }),
      tx: gsap.quickTo(title.current, 'x', { duration: 1, ease: 'power3.out' }),
    }
  }, [coarse, reduced])

  const move = (e) => {
    if (coarse) return
    const r = stage.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top) / r.height
    const pt = pointer.current
    pt.x = Math.min(1, Math.max(0, nx))
    pt.y = Math.min(1, Math.max(0, ny))
    pt.active = true
    const st = stage.current.style
    st.setProperty('--mx', `${nx * 100}%`)
    st.setProperty('--my', `${ny * 100}%`)
    st.setProperty('--px', ((pt.x - 0.5) * 2).toFixed(3))
    st.setProperty('--py', ((pt.y - 0.5) * 2).toFixed(3))
    const t = tweens.current
    if (t.rx) {
      t.rx(-(pt.y - 0.5) * 7)
      t.ry((pt.x - 0.5) * 9)
      t.tx((pt.x - 0.5) * -36)
    }
    if (Math.random() < 0.55 && nx > 0 && nx < 1 && ny > 0 && ny < 1) sparks.current?.spawn(e.clientX - r.left, e.clientY - r.top)
  }
  const enter = () => {
    if (coarse) return
    root.current.classList.add('is-hot')
    tweens.current.s?.(1.03)
  }
  const leave = () => {
    root.current.classList.remove('is-hot')
    pointer.current.active = false
    const t = tweens.current
    t.rx?.(0); t.ry?.(0); t.s?.(1); t.tx?.(0)
    stage.current.style.setProperty('--px', 0)
    stage.current.style.setProperty('--py', 0)
  }
  const open = () => onOpen(p, stage.current.getBoundingClientRect(), openBtn.current)

  return (
    <article
      ref={root}
      className={`exp exp--${p.layout}`}
      style={{ '--accent': p.accent, '--accent2': p.accent2 }}
      onPointerMove={move}
      onPointerEnter={enter}
      onPointerLeave={leave}
      aria-labelledby={`exp-${p.id}`}
    >
      <div className="exp__meta">
        <div className="exp__kicker exp__rise">
          <span className="label">{p.code}</span>
          <span className="label">PROJECT / {p.num}</span>
        </div>
        <h3 id={`exp-${p.id}`} className="exp__title exp__rise" ref={title}>
          {p.name}
        </h3>
        <p className="exp__cat exp__rise label">{p.category}</p>
        <p className="exp__tag exp__rise">{p.tagline}</p>
        <div className="exp__foot exp__rise">
          <span className="label">{p.year}</span>
          <button ref={openBtn} type="button" className="exp__open" onClick={open} data-cursor="explore" aria-label={`Open experiment ${p.index}: ${p.name}`}>
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" /> OPEN EXPERIMENT
          </button>
        </div>
      </div>

      <div className="exp__stage" ref={stage} onClick={open} data-cursor="explore">
        <div className="exp__glow" aria-hidden="true" />
        <div className="exp__tilt" ref={tilt}>
          <ExperimentVisual kind={p.visual} pointerRef={pointer} data={p.viz} />
        </div>
        <SparkLayer rgb={p.accent.replace(/ /g, ',')} apiRef={sparks} />
        <span className="exp__corner exp__corner--tl label">{p.index}</span>
        <span className="exp__corner exp__corner--br label">↗ {p.name}</span>
      </div>
    </article>
  )
}
