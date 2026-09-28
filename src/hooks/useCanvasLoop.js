import { useEffect, useRef } from 'react'

/**
 * 2D canvas render loop that
 *  - handles DPR + resize
 *  - pauses when off-screen, when the tab is hidden, or when a full-screen case study is open
 *  - draws a single frame when `still` (reduced motion)
 * draw(ctx, w, h, t, dt)
 */
export function useCanvasLoop(canvasRef, draw, { still = false, maxDpr = 1.75 } = {}) {
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = 1, h = 1, raf = 0, visible = true, t = 0
    let last = performance.now()

    const paint = (dt) => drawRef.current(ctx, w, h, t, dt)
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      w = Math.max(1, r.width)
      h = Math.max(1, r.height)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (still) paint(0)
    }
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden || document.documentElement.classList.contains('is-locked')) {
        last = now
        return
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt
      paint(dt)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '80px' })
    io.observe(canvas)
    resize()
    if (!still) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [canvasRef, still, maxDpr])
}
