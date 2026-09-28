import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SITE } from '../data/site'
import { useEnv } from '../hooks/useEnv'

function Word({ w, i, n, progress, base, reduced }) {
  const s = base + (i / n) * 0.2
  const e = s + 0.07
  const opacity = useTransform(progress, [s, e], [0.0, 1], { clamp: true })
  const y = useTransform(progress, [s, e], [reduced ? 0 : 40, 0], { clamp: true })
  const blur = useTransform(progress, [s, e], [reduced ? 0 : 10, 0], { clamp: true })
  const filter = useTransform(blur, (b) => `blur(${b}px)`)
  return (
    <motion.span className="phil__w" style={{ opacity, y, filter }}>
      {w}
    </motion.span>
  )
}

function Phrase({ words, progress, base, out, reduced, alt }) {
  const opacity = useTransform(progress, out ? [out[0], out[1]] : [0, 1], out ? [1, 0] : [1, 1], { clamp: true })
  return (
    <motion.p className={alt ? 'phil__p phil__p--alt' : 'phil__p'} style={{ opacity }}>
      {words.map((w, i) => (
        <Word key={i} w={w} i={i} n={words.length} progress={progress} base={base} reduced={reduced} />
      ))}
    </motion.p>
  )
}

export default function Philosophy() {
  const { reduced } = useEnv()
  const ref = useRef(null)
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const bg = useTransform(p, [0.05, 0.95], ['#050507', '#1a0b3a'])
  const glow = useTransform(p, [0.45, 0.95], [0, 1])
  const F = SITE.philosophy

  return (
    <section id="philosophy" className="phil" ref={ref} data-nav="lab" aria-label="Design philosophy">
      <motion.div className="phil__sticky" style={{ backgroundColor: bg }}>
        <motion.div className="phil__glow" style={{ opacity: glow }} aria-hidden="true" />
        <span className="label phil__label">DESIGN PHILOSOPHY / 01</span>
        <div className="phil__stack">
          <Phrase words={F.first} progress={p} base={0.04} out={[0.42, 0.5]} reduced={reduced} />
          <Phrase words={F.second} progress={p} base={0.52} reduced={reduced} alt />
        </div>
        <span className="label phil__coord">SECTOR 06 · SIGNAL / NOISE 0.0</span>
      </motion.div>
    </section>
  )
}
