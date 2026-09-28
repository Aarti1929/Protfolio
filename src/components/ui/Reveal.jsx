import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { useEnv } from '../../hooks/useEnv'

/** Masked line-by-line headline reveal, triggered once when scrolled into view. */
export function LineReveal({ lines, as: Tag = 'h2', className = '', stagger = 0.09, start = 'top 86%', children }) {
  const ref = useRef(null)
  const { reduced } = useEnv()

  useLayoutEffect(() => {
    const el = ref.current
    const inners = el.querySelectorAll('.line__in')
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 112 })
      ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => gsap.to(inners, { yPercent: 0, duration: 1.25, ease: 'expo.out', stagger }),
      })
    }, el)
    return () => ctx.revert()
  }, [reduced, stagger, start])

  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="line">
            <span className="line__in">{l}</span>
          </span>
        </Fragment>
      ))}
      {children}
    </Tag>
  )
}

/** Words that light up as the reader scrolls past — scrubbed, not timed. */
export function ScrubText({ lines, as: Tag = 'p', className = '' }) {
  const ref = useRef(null)
  const { reduced } = useEnv()

  useLayoutEffect(() => {
    if (reduced) return
    const words = ref.current.querySelectorAll('.scrub__w')
    const ctx = gsap.context(() => {
      words.forEach((w) => {
        gsap.fromTo(
          w,
          { opacity: 0.12 },
          { opacity: 1, ease: 'none', scrollTrigger: { trigger: w, start: 'top 88%', end: 'top 58%', scrub: true } },
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [reduced])

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span className="scrub__line" key={i}>
          {line.split(' ').map((w, j) => (
            <Fragment key={j}>
              <span className="scrub__w">{w}</span>{' '}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}
