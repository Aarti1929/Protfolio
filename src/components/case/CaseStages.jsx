import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import Artifact from './Artifacts'
import { cx, pad2 } from '../../lib/util'
import { usePlainMotionValue } from '../../lib/motion'

const OPEN = 'inset(-12% -100% -12% -100%)'

function StageLayer({ stage, i, n, progress, project, skew, active }) {
  const a = i / n
  const b = (i + 1) / n
  const pad = 0.03
  const range = [i === 0 ? -0.3 : a - pad, i === 0 ? -0.2 : a + pad, i === n - 1 ? 2 : b - pad, i === n - 1 ? 3 : b + pad]

  const opacity = useTransform(progress, range, [0, 1, 1, 0])
  // text fades out fully before the next stage's text fades in (art masks may overlap, text must not)
  const tr = [i === 0 ? -0.3 : a + 0.004, i === 0 ? -0.2 : a + 0.03, i === n - 1 ? 2 : b - 0.03, i === n - 1 ? 3 : b - 0.004]
  const textOpacity = useTransform(progress, tr, [0, 1, 1, 0])
  const clip = useTransform(progress, range, ['inset(100% -100% -12% -100%)', OPEN, OPEN, 'inset(-12% -100% 100% -100%)'])
  const ty = useTransform(progress, range, [70, 0, 0, -70])
  const ax = useTransform(progress, range, ['9vw', '0vw', '0vw', '-5vw'])
  const sc = useTransform(progress, range, [1.14, 1, 1, 0.95])
  const lp = useTransform(progress, [a, b], [0, 1], { clamp: true })

  return (
    <motion.div className="stage" aria-hidden={!active}>
      <motion.div className="stage__text" style={{ y: ty, opacity: textOpacity }}>
        <span className="stage__num">{pad2(i + 1)}</span>
        <h3 className="stage__key">{stage.key}</h3>
        <p className="stage__head">{stage.head}</p>
        <p className="stage__body">{stage.body}</p>
        {stage.points.length > 0 && (
          <ul className="stage__points">
            {stage.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </motion.div>
      <motion.div className="stage__art" style={{ clipPath: clip, x: ax, skewY: skew, opacity }}>
        <motion.div className="stage__art-in" style={{ scale: sc }}>
          <Artifact kind={stage.key} project={project} lp={lp} />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function CaseStages({ project, scroller, reduced }) {
  const ref = useRef(null)
  const n = project.stages.length
  const [idx, setIdx] = useState(0)
  const { scrollYProgress: rawProgress } = useScroll({ target: ref, container: scroller, offset: ['start start', 'end end'] })
  const scrollYProgress = usePlainMotionValue(rawProgress)
  const { scrollY } = useScroll({ container: scroller })
  // subtle scroll-velocity distortion on the artifacts
  const vel = useVelocity(scrollY)
  const skewRaw = useTransform(vel, [-3200, 0, 3200], reduced ? [0, 0, 0] : [2.2, 0, -2.2])
  const skew = useSpring(skewRaw, { stiffness: 140, damping: 26 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => setIdx(Math.min(n - 1, Math.max(0, Math.floor(v * n)))))

  return (
    <section className="stages" ref={ref} style={{ height: `${n * 100 + 40}vh` }} aria-label="Process">
      <div className="stages__sticky">
        <ol className="stages__rail" aria-label="Stages">
          {project.stages.map((s, i) => (
            <li key={s.key} className={cx(i === idx && 'is-on', i < idx && 'is-past')}>
              <span>{pad2(i + 1)}</span>
              {s.key}
            </li>
          ))}
        </ol>
        <div className="stages__viewport">
          {project.stages.map((s, i) => (
            <StageLayer key={s.key} stage={s} i={i} n={n} progress={scrollYProgress} project={project} skew={skew} active={i === idx} />
          ))}
        </div>
        <div className="stages__count label">
          {pad2(idx + 1)} / {pad2(n)}
        </div>
      </div>
    </section>
  )
}
