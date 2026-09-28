import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import CaseStages from './case/CaseStages'
import { useEnv } from '../hooks/useEnv'
import { cx } from '../lib/util'
import { usePlainMotionValue } from '../lib/motion'

function ProblemLine({ text, i, n, progress, alt }) {
  const start = 0.04 + (i / n) * 0.78
  const end = start + 0.11
  const opacity = useTransform(progress, [start, end], [0.1, 1], { clamp: true })
  const y = useTransform(progress, [start, end], [36, 0], { clamp: true })
  return (
    <motion.span className={cx('problem__line', alt && 'is-alt')} style={{ opacity, y }}>
      {text}
    </motion.span>
  )
}

function CaseProblem({ project, scroller }) {
  const ref = useRef(null)
  const { scrollYProgress: rawProgress } = useScroll({ target: ref, container: scroller, offset: ['start start', 'end end'] })
  const scrollYProgress = usePlainMotionValue(rawProgress)
  const n = project.problem.length
  return (
    <section className="problem" ref={ref} aria-label="The problem">
      <div className="problem__sticky">
        <span className="label problem__label">THE PROBLEM</span>
        <p className="problem__text">
          {project.problem.map((t, i) => (
            <ProblemLine key={i} text={t} i={i} n={n} progress={scrollYProgress} alt={i >= project.problemAlt} />
          ))}
        </p>
      </div>
    </section>
  )
}

export default function CaseStudy({ project, index, total, next, onClose, onNext }) {
  const { reduced } = useEnv()
  const scroller = useRef(null)
  const nextBtn = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const { scrollYProgress } = useScroll({ container: scroller })

  useEffect(() => {
    scroller.current?.focus({ preventScroll: true })
    const k = (e) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  return (
    <div
      className="case"
      ref={scroller}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.code}: ${project.name} case study`}
      style={{ '--accent': project.accent, '--accent2': project.accent2 }}
    >
      <div className="case__bar">
        <button type="button" className="case__back" onClick={onClose} data-cursor="link">
          <ArrowLeft size={16} aria-hidden="true" /> BACK TO THE LAB
        </button>
        <span className="label case__bar-mid">
          {project.code} / {String(total).padStart(2, '0')}
        </span>
        <span className="label">{project.year}</span>
        <motion.i className="case__progress" style={{ scaleX: scrollYProgress }} />
      </div>

      <header className="case__hero">
        <div className="case__glow" aria-hidden="true" />
        <p className="label case__kicker">
          {project.code} — PRODUCT DESIGN
        </p>
        <h1 className="case__name" aria-label={project.name}>
          {project.name.split('').map((ch, i) => (
            <span className="case__mask" key={i} aria-hidden="true">
              <motion.span
                style={{ display: 'inline-block' }}
                initial={reduced ? false : { y: '112%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </h1>
        <p className="case__tagline">{project.tagline}</p>
        <dl className="case__meta">
          {[
            ['ROLE', project.role],
            ['TIMELINE', project.timeline],
            ['TEAM', project.team],
            ['TOOLS', project.tools],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="label">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {project.repo && (
          <a className="case__repo" href={project.repo} target="_blank" rel="noreferrer noopener" data-cursor="link">
            VIEW SOURCE ON GITHUB <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
        <span className="label case__scroll">SCROLL ↓</span>
      </header>

      <CaseProblem project={project} scroller={scroller} />
      <CaseStages project={project} scroller={scroller} reduced={reduced} />

      <footer className="case__foot">
        <p className="label">END OF EXPERIMENT {project.index}</p>
        <button
          ref={nextBtn}
          type="button"
          className="case__next"
          style={{ '--accent': next.accent, '--accent2': next.accent2 }}
          onClick={() => onNext(next, nextBtn.current.getBoundingClientRect())}
          data-cursor="explore"
        >
          <span className="label">NEXT · {next.code}</span>
          <strong>{next.name}</strong>
          <span className="case__next-tag">{next.tagline}</span>
          <ArrowUpRight size={40} strokeWidth={1.2} className="case__next-arrow" aria-hidden="true" />
        </button>
        <button type="button" className="case__back case__back--foot" onClick={onClose} data-cursor="link">
          <ArrowLeft size={16} aria-hidden="true" /> BACK TO THE LAB
        </button>
      </footer>
    </div>
  )
}
