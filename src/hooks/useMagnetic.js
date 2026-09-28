import { useEffect } from 'react'
import { gsap } from '../lib/gsap'
import { useEnv } from './useEnv'

/** Pulls an element toward the cursor when the cursor is near it. */
export function useMagnetic(ref, { strength = 0.35, pad = 70 } = {}) {
  const { coarse, reduced } = useEnv()
  useEffect(() => {
    const el = ref.current
    if (!el || coarse || reduced) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })
    let inside = false
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const near =
        e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad
      if (near) {
        inside = true
        xTo((e.clientX - cx) * strength)
        yTo((e.clientY - cy) * strength)
      } else if (inside) {
        inside = false
        xTo(0)
        yTo(0)
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [ref, coarse, reduced, strength, pad])
}
