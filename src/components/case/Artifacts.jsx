import { motion, useTransform } from 'framer-motion'
import MockScreen from './MockScreen'

/* One "artifact" per stage. `lp` is a 0→1 MotionValue of progress *within* that stage. */

const NOTES = [
  { left: '2%', top: '6%', r: -4, dx: 30 },
  { left: '46%', top: '0%', r: 3, dx: -24 },
  { left: '10%', top: '38%', r: 2, dx: 40 },
  { left: '52%', top: '46%', r: -3, dx: -36 },
  { left: '24%', top: '72%', r: 4, dx: 20 },
]
function Note({ text, i, lp }) {
  const p = NOTES[i % NOTES.length]
  const x = useTransform(lp, [0, 1], [p.dx, -p.dx])
  return (
    <motion.div className="note" style={{ left: p.left, top: p.top, rotate: p.r, x }}>
      <p>{text}</p>
      <span className="label">QUESTION / 0{i + 1}</span>
    </motion.div>
  )
}
function DiscoverArt({ project, lp }) {
  return (
    <div className="art art--discover">
      {project.discover.map((t, i) => (
        <Note key={i} text={t} i={i} lp={lp} />
      ))}
    </div>
  )
}

function Item({ text, i, lp }) {
  const w = useTransform(lp, [0.04 + i * 0.1, 0.44 + i * 0.1], [0, 1], { clamp: true })
  const o = useTransform(lp, [0.02 + i * 0.1, 0.22 + i * 0.1], [0.25, 1], { clamp: true })
  return (
    <motion.li className="ritem" style={{ opacity: o }}>
      <span className="label">0{i + 1}</span>
      <p>{text}</p>
      <motion.i style={{ scaleX: w }} />
    </motion.li>
  )
}
function ResearchArt({ project, lp }) {
  return (
    <div className="art art--research">
      <span className="label research__h">{project.research.heading}</span>
      <ul className="research__list">
        {project.research.items.map((t, i) => (
          <Item key={t} text={t} i={i} lp={lp} />
        ))}
      </ul>
    </div>
  )
}

function InsightArt({ project, lp }) {
  const dash = useTransform(lp, [0.05, 0.6], [0, 0.98], { clamp: true })
  const sc = useTransform(lp, [0, 1], [0.94, 1.04])
  return (
    <div className="art art--insight">
      <svg viewBox="0 0 200 200" className="insight__ring" aria-hidden="true">
        <defs>
          <linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgb(var(--accent))" />
            <stop offset="1" stopColor="rgb(var(--accent2))" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
        <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10" />
        <g transform="rotate(-90 100 100)">
          <motion.circle cx="100" cy="100" r="76" fill="none" stroke="url(#ig)" strokeWidth="10" strokeLinecap="round" style={{ pathLength: dash }} />
        </g>
      </svg>
      <motion.div className="insight__body" style={{ scale: sc }}>
        <strong>{project.insight.big}</strong>
        <p>{project.insight.text}</p>
      </motion.div>
    </div>
  )
}

function ExploreArt({ lp }) {
  const x1 = useTransform(lp, [0, 1], ['4%', '-12%'])
  const x2 = useTransform(lp, [0, 1], ['-12%', '4%'])
  const tiles = (ids) =>
    ids.map((i) => (
      <div key={i} className={`sketch sketch--${i}${i === 4 ? ' is-picked' : ''}`}>
        <span className="label">{'ABCDEF'[i]}{i === 4 ? ' · PICKED' : ''}</span>
        <i /><i /><i /><i />
      </div>
    ))
  return (
    <div className="art art--explore">
      <motion.div className="explore__row" style={{ x: x1 }}>{tiles([0, 1, 2])}</motion.div>
      <motion.div className="explore__row" style={{ x: x2 }}>{tiles([3, 4, 5])}</motion.div>
    </div>
  )
}

function DesignScreen({ s, i, lp }) {
  const a = 0.02 + i * 0.12
  const clip = useTransform(lp, [a, a + 0.36], ['inset(0% 0% 100% 0% round 28px)', 'inset(0% 0% 0% 0% round 28px)'], { clamp: true })
  const sc = useTransform(lp, [a, a + 0.46], [1.22, 1], { clamp: true })
  return (
    <motion.div className="design__item" style={{ clipPath: clip, y: [0, -38, 28][i % 3] }}>
      <motion.div style={{ scale: sc }}>
        <MockScreen data={s} />
      </motion.div>
    </motion.div>
  )
}
function DesignArt({ project, lp }) {
  const x = useTransform(lp, [0, 1], ['10%', '-26%'])
  return (
    <div className="art art--design">
      <motion.div className="design__strip" style={{ x }}>
        {project.screens.map((s, i) => (
          <DesignScreen key={s.title} s={s} i={i} lp={lp} />
        ))}
      </motion.div>
    </div>
  )
}

function OutcomeRow({ o, i, lp }) {
  const y = useTransform(lp, [0.05 + i * 0.09, 0.4 + i * 0.09], [36, 0], { clamp: true })
  const op = useTransform(lp, [0.05 + i * 0.09, 0.35 + i * 0.09], [0, 1], { clamp: true })
  return (
    <motion.div className="outcome__row" style={{ y, opacity: op }}>
      <span className="label">{o.k}</span>
      <strong>{o.v}</strong>
    </motion.div>
  )
}
function ResultArt({ project, lp }) {
  return (
    <div className="art art--result">
      {project.outcome.map((o, i) => (
        <OutcomeRow key={o.k} o={o} i={i} lp={lp} />
      ))}
    </div>
  )
}

const MAP = { DISCOVER: DiscoverArt, RESEARCH: ResearchArt, INSIGHT: InsightArt, EXPLORE: ExploreArt, DESIGN: DesignArt, RESULT: ResultArt }
export default function Artifact({ kind, project, lp }) {
  const C = MAP[kind]
  return C ? <C project={project} lp={lp} /> : null
}
