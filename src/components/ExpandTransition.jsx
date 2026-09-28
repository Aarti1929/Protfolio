import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useEnv } from '../hooks/useEnv'

/**
 * The cinematic hand-off: the clicked experiment's frame grows to fill the screen,
 * the title swells, then the frame dissolves to reveal the case study underneath.
 */
export default function ExpandTransition({ project, rect, onCovered, onDone }) {
  const root = useRef(null)
  const name = useRef(null)
  const { reduced } = useEnv()
  const cb = useRef({ onCovered, onDone })
  cb.current = { onCovered, onDone }

  useLayoutEffect(() => {
    const el = root.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const from = `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round 36px)`
    const to = 'inset(0px 0px 0px 0px round 0px)'
    const tl = gsap.timeline()
    if (reduced) {
      gsap.set(el, { clipPath: to })
      tl.add(() => cb.current.onCovered())
        .to(el, { opacity: 0, duration: 0.4 }, '+=0.15')
        .add(() => cb.current.onDone())
    } else {
      gsap.set(el, { clipPath: from })
      gsap.set(name.current, { yPercent: 110 })
      tl.to(el, { clipPath: to, duration: 1.05, ease: 'expo.inOut' })
        .to(name.current, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0.35)
        .add(() => cb.current.onCovered())
        .to(name.current, { yPercent: -110, duration: 0.7, ease: 'expo.in' }, '+=0.12')
        .to(el, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '<0.25')
        .add(() => cb.current.onDone())
    }
    return () => tl.kill()
  }, [project, rect, reduced])

  return (
    <div
      ref={root}
      className="expand"
      style={{ '--accent': project.accent, '--accent2': project.accent2 }}
      aria-hidden="true"
    >
      <div className="expand__glow" />
      <span className="label expand__code">{project.code}</span>
      <div className="expand__mask">
        <div className="expand__name" ref={name}>{project.name}</div>
      </div>
      <span className="label expand__cat">{project.category}</span>
    </div>
  )
}
