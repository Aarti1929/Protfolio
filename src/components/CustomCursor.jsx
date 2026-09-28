import { useEffect, useRef } from 'react'
import { useEnv } from '../hooks/useEnv'

const LABELS = { explore: 'EXPLORE ↗', copy: 'COPY', link: '', view: 'VIEW', close: 'CLOSE' }

/** Dot + lagging ring. `data-cursor="explore|copy|link|view"` on any element changes its state. */
export default function CustomCursor() {
  const { coarse } = useEnv()
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (coarse) return
    const html = document.documentElement
    html.classList.add('has-cursor')
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, shown = false
    const INTERACTIVE = 'a,button,[role="button"],summary,input,textarea'

    const step = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`
      ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) raf = requestAnimationFrame(step)
      else raf = 0
    }
    const setMode = (t) => {
      const host = t?.closest?.('[data-cursor]')
      const mode = host?.dataset.cursor || (t?.closest?.(INTERACTIVE) ? 'link' : 'default')
      if (ring.current && ring.current.dataset.mode !== mode) {
        ring.current.dataset.mode = mode
        label.current.textContent = LABELS[mode] ?? ''
      }
    }
    // when content moves under a still pointer (scrolling, overlays opening) re-check what is under it
    const refresh = () => shown && setMode(document.elementFromPoint(x, y))
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      if (!shown) {
        shown = true
        rx = x
        ry = y
        ring.current.dataset.show = '1'
        dot.current.dataset.show = '1'
      }
      setMode(e.target instanceof Element ? e.target : null)
      if (!raf) raf = requestAnimationFrame(step)
    }
    const leave = () => {
      shown = false
      ring.current.dataset.show = '0'
      dot.current.dataset.show = '0'
    }
    const down = () => (ring.current.dataset.down = '1')
    const up = () => (ring.current.dataset.down = '0')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', refresh, { passive: true, capture: true })
    const poll = setInterval(refresh, 400)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', leave)
    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', refresh, { capture: true })
      clearInterval(poll)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [coarse])

  if (coarse) return null
  return (
    <div aria-hidden="true">
      <div className="cursor__dot" ref={dot} data-show="0" />
      <div className="cursor__ring" ref={ring} data-show="0" data-mode="default">
        <span ref={label} className="cursor__label" />
      </div>
    </div>
  )
}
