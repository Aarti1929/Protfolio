import { useLayoutEffect } from 'react'
import { useMotionValue, useMotionValueEvent } from 'framer-motion'

/**
 * Framer Motion may hand scroll-linked values to the browser's native ScrollTimeline,
 * which rejects input ranges outside [0,1]. Mirroring the value into a plain
 * MotionValue keeps everything on the JS path so any range is safe.
 */
export function usePlainMotionValue(source) {
  const mv = useMotionValue(source.get())
  useLayoutEffect(() => {
    mv.set(source.get())
  }, [mv, source])
  useMotionValueEvent(source, 'change', (v) => mv.set(v))
  return mv
}
