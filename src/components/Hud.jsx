import { useEffect, useRef } from 'react'
import { useEnv } from '../hooks/useEnv'

/** Fixed system read-outs. Updated through refs — zero React re-renders while scrolling / moving. */
export default function Hud({ ready }) {
  const { coarse } = useEnv()
  const coord = useRef(null)
  const scroll = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (scroll.current) scroll.current.textContent = `SCROLL ${String(Math.round(p * 100)).padStart(3, '0')}%`
    }
    const onMove = (e) => {
      if (coord.current)
        coord.current.textContent = `X ${String(Math.round(e.clientX)).padStart(4, '0')}  Y ${String(Math.round(e.clientY)).padStart(4, '0')}`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    if (!coarse) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [coarse])

  return (
    <div className={`hud ${ready ? 'is-on' : ''}`} aria-hidden="true">
      <div className="hud__bl">
        {!coarse && <span ref={coord}>X 0000  Y 0000</span>}
        <span ref={scroll}>SCROLL 000%</span>
      </div>
      <div className="hud__br">
        <i className="dot" /> AVAILABLE FOR WORK
      </div>
      <div className="hud__side">SYSTEM / ONLINE — DESIGN LAB v1.0</div>
    </div>
  )
}
