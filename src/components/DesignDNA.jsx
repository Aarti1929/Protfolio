import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { DNA_STEPS } from '../data/process'
import { useEnv } from '../hooks/useEnv'
import { cx, pad2 } from '../lib/util'

const N = DNA_STEPS.length
const RING = DNA_STEPS.slice(1) // orbiting steps; DISCOVER lives in the centre first
const C = 500
const R = 318
const nodeAt = (k) => {
  const a = (-90 + (k * 360) / RING.length) * (Math.PI / 180)
  return { x: C + Math.cos(a) * R, y: C + Math.sin(a) * R }
}

export default function DesignDNA() {
  const { reduced } = useEnv()
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive((a) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor(v * N)))
    return i === a ? a : i
  }))
  const spinA = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 200])
  const spinB = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -140])
  const step = DNA_STEPS[active]
  const ringIdx = active - 1 // -1 when the centre (DISCOVER) is active
  const tgt = ringIdx >= 0 ? nodeAt(ringIdx) : null

  return (
    <section id="lab" className="dna" ref={ref} data-nav="lab" aria-label="Design DNA — how I think" style={{ height: `${N * 78 + 60}vh` }}>
      <div className="dna__sticky">
        <div className="dna__head">
          <span className="label">LAB / DESIGN DNA</span>
          <span className="label">HOW I THINK</span>
        </div>

        <div className="dna__stage">
          <svg viewBox="0 0 1000 1000" className="dna__svg" aria-hidden="true">
            <defs>
              <linearGradient id="dnaG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8b5cff" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
              <radialGradient id="dnaC" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#8b5cff" stopOpacity=".22" />
                <stop offset="1" stopColor="#8b5cff" stopOpacity="0" />
              </radialGradient>
              <filter id="dnaB" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            <circle cx={C} cy={C} r="420" fill="url(#dnaC)" />
            <motion.circle cx={C} cy={C} r="452" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" strokeDasharray="2 14" style={{ rotate: spinA }} />
            <motion.circle cx={C} cy={C} r="392" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" strokeDasharray="60 18 4 18" style={{ rotate: spinB }} />
            {/* hexagon + spokes */}
            <polygon points={RING.map((_, k) => `${nodeAt(k).x},${nodeAt(k).y}`).join(' ')} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1" />
            {RING.map((_, k) => {
              const p = nodeAt(k)
              const q = nodeAt((k + 2) % RING.length)
              return (
                <g key={k}>
                  <line x1={C} y1={C} x2={p.x} y2={p.y} stroke="rgba(255,255,255,.08)" strokeWidth="1" />
                  <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(255,255,255,.04)" strokeWidth="1" />
                </g>
              )
            })}
            {/* live spoke */}
            {tgt && (
              <g key={active}>
                <motion.line x1={C} y1={C} x2={tgt.x} y2={tgt.y} stroke="url(#dnaG)" strokeWidth="2.5" filter="url(#dnaB)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
                <motion.line x1={C} y1={C} x2={tgt.x} y2={tgt.y} stroke="url(#dnaG)" strokeWidth="1.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
              </g>
            )}
            {/* nodes */}
            {RING.map((s, k) => {
              const p = nodeAt(k)
              const on = ringIdx === k
              return (
                <g key={s.key}>
                  {on && <circle cx={p.x} cy={p.y} r="26" fill="url(#dnaG)" opacity=".55" filter="url(#dnaB)" />}
                  <circle cx={p.x} cy={p.y} r={on ? 9 : 5} fill={on ? '#fff' : '#0b0b10'} stroke={on ? 'url(#dnaG)' : 'rgba(255,255,255,.4)'} strokeWidth="1.5" style={{ transition: 'r .5s cubic-bezier(.16,1,.3,1)' }} />
                </g>
              )
            })}
            {/* centre */}
            <circle cx={C} cy={C} r={active === 0 ? 8 : 4} fill="#fff" opacity={active === 0 ? 1 : 0.6} />
          </svg>

          {/* node labels (real text — selectable, readable) */}
          {RING.map((s, k) => {
            const a = (-90 + (k * 360) / RING.length) * (Math.PI / 180)
            const rr = 0.4 // label radius as fraction of the square
            return (
              <span
                key={s.key}
                className={cx('dna__node', ringIdx === k && 'is-on', ringIdx > k && 'is-past')}
                style={{ left: `${50 + Math.cos(a) * rr * 100}%`, top: `${50 + Math.sin(a) * rr * 100}%` }}
              >
                <i>{pad2(k + 2)}</i>
                {s.key}
              </span>
            )
          })}

          <div className="dna__center" aria-live="polite">
            <span className="label dna__idx">
              {pad2(active + 1)} / {pad2(N)}
            </span>
            <div className="dna__mask">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.key}
                  className="dna__word"
                  initial={reduced ? { opacity: 0 } : { y: '105%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { y: '-105%', opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step.key}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="dna__foot">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={step.key} className="dna__text" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
              {step.text}
            </motion.p>
          </AnimatePresence>
          <ol className="dna__seq" aria-label="Sequence">
            {DNA_STEPS.map((s, i) => (
              <li key={s.key} className={cx(i === active && 'is-on', i < active && 'is-past')} title={s.key} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
