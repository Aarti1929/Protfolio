import { useMemo, useRef } from 'react'
import { useCanvasLoop } from '../hooks/useCanvasLoop'
import { useEnv } from '../hooks/useEnv'
import { seeded } from '../lib/util'

/* Three fully different compositions:
   FLUX — orbital gauge dashboard (SVG, layered parallax)
   HALO — breathing signal terrain (canvas)
   RANGE — calendar range picker that follows the cursor (canvas)        */

function Spark({ data, color = 'currentColor' }) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / (max - min || 1)) * 84 - 8}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="viz__spark" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ─────────────────────────── FLUX ─────────────────────────── */
function FluxVisual({ data = {} }) {
  const bars = useMemo(() => {
    const r = seeded(9)
    return Array.from({ length: 34 }, (_, i) => 14 + Math.round((Math.sin(i * 0.55) * 0.5 + 0.5) * 46 + r() * 22))
  }, [])
  return (
    <div className="viz viz--flux" aria-hidden="true">
      <svg viewBox="0 0 800 640" preserveAspectRatio="xMidYMid slice" className="viz__svg">
        <defs>
          <linearGradient id="fxg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cff" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="fxc" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#8b5cff" stopOpacity=".35" />
            <stop offset="1" stopColor="#8b5cff" stopOpacity="0" />
          </radialGradient>
          <filter id="fxb" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <circle cx="400" cy="300" r="300" fill="url(#fxc)" />
        <g transform="translate(400 300)">
          <circle r="262" className="fx__ticks" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="9" strokeDasharray="1.4 12.6" />
          <circle r="226" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
          <circle r="196" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="26" />
          <g transform="rotate(-90)">
            <circle r="196" fill="none" stroke="url(#fxg)" strokeWidth="26" strokeLinecap="round" strokeDasharray="838 1232" filter="url(#fxb)" opacity=".8" />
            <circle r="196" fill="none" stroke="url(#fxg)" strokeWidth="26" strokeLinecap="round" strokeDasharray="838 1232" />
          </g>
          <circle r="150" className="fx__inner" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" strokeDasharray="3 9" />
          <circle r="132" fill="rgba(5,5,7,.6)" />
        </g>
        {bars.map((h, i) => (
          <rect key={i} x={70 + i * 20.5} y={628 - h} width="6" height={h} rx="3" fill="url(#fxg)" opacity={0.15 + (h / 90) * 0.55} />
        ))}
      </svg>
      <div className="viz__center fx__center">
        <span className="label">{data.label}</span>
        <strong>{data.value}</strong>
        <em>{data.note}</em>
      </div>
      {data.chips?.[0] && (
        <div className="viz__chip" style={{ '--x': '6%', '--y': '12%', '--d': 1.6 }}>
          <span className="label">{data.chips[0].label}</span>
          <b>{data.chips[0].b}</b>
          {data.chips[0].spark && <Spark data={data.chips[0].spark} color="#22d3ee" />}
        </div>
      )}
      {data.chips?.[1] && (
        <div className="viz__chip" style={{ '--x': '68%', '--y': '66%', '--d': 2.2 }}>
          <span className="label">{data.chips[1].label}</span>
          <b>{data.chips[1].b}</b>
          <span className="viz__sub">{data.chips[1].sub}</span>
        </div>
      )}
      {data.goal && (
        <div className="viz__chip viz__chip--wide" style={{ '--x': '6%', '--y': '74%', '--d': 1.1 }}>
          <span className="label">{data.goal.label}</span>
          <div className="viz__bar"><i style={{ width: `${data.goal.pct}%` }} /></div>
          <span className="viz__sub">{data.goal.sub}</span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── HALO ─────────────────────────── */
function HaloVisual({ pointerRef, data = {} }) {
  const { reduced } = useEnv()
  const cv = useRef(null)
  const sm = useRef({ x: 0.5, y: 0.5, a: 0 })

  useCanvasLoop(
    cv,
    (ctx, w, h, t) => {
      const ps = pointerRef.current
      const s = sm.current
      s.x += (ps.x - s.x) * 0.12
      s.y += (ps.y - s.y) * 0.12
      s.a += ((ps.active ? 1 : 0) - s.a) * 0.08
      ctx.clearRect(0, 0, w, h)

      const breathe = 0.5 + 0.5 * Math.sin(t * 0.8)
      const rows = Math.max(22, Math.round(h / 13))
      const cx = w * 0.5, cyO = h * 0.46
      const px = s.x * w, py = s.y * h

      const g = ctx.createRadialGradient(cx, cyO, 0, cx, cyO, w * 0.55 * (0.92 + breathe * 0.1))
      g.addColorStop(0, 'rgba(34,211,238,.30)')
      g.addColorStop(0.5, 'rgba(139,92,255,.10)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      ctx.lineWidth = 1.1
      ctx.lineJoin = 'round'
      for (let r = 0; r < rows; r++) {
        const y0 = ((r + 0.5) / rows) * h
        const dy = (y0 - cyO) / (h * 0.5)
        const envl = Math.exp(-dy * dy * 3.4)
        ctx.beginPath()
        for (let x = 0; x <= w + 5; x += 5) {
          const dx = (x - cx) / (w * 0.5)
          const orb = Math.exp(-dx * dx * 5.2) * envl * h * 0.12 * (0.75 + breathe * 0.35)
          const wave = Math.sin(x * 0.022 + t * 0.9 + r * 0.35) * 2 + Math.sin(x * 0.047 - t * 1.3 + r * 0.7) * 1.1
          const ddx = x - px, ddy = y0 - py
          const rip = -Math.exp(-(ddx * ddx + ddy * ddy) / (2 * 58 * 58)) * 16 * s.a
          const y = y0 - orb + wave * (0.55 + envl) + rip
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        const a = 0.1 + envl * 0.62
        ctx.strokeStyle = r % 8 === 0 ? `rgba(139,92,255,${a})` : `rgba(34,211,238,${a})`
        ctx.stroke()
      }
      // the "halo" ring
      ctx.strokeStyle = `rgba(245,245,245,${0.35 + breathe * 0.3})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cyO - h * 0.02, w * 0.14 * (0.94 + breathe * 0.1), 0, Math.PI * 2)
      ctx.stroke()
    },
    { still: reduced },
  )

  return (
    <div className="viz viz--halo" aria-hidden="true">
      <canvas ref={cv} className="viz__canvas" />
      <div className="halo__ruler" />
      {data.chips?.[0] && (
        <div className="viz__chip" style={{ '--x': '8%', '--y': '10%', '--d': 1.4 }}>
          <span className="label">{data.chips[0].label}</span>
          <b>{data.chips[0].b}</b>
          <span className="viz__sub">{data.chips[0].sub}</span>
        </div>
      )}
      {data.chips?.[1] && (
        <div className="viz__chip" style={{ '--x': '52%', '--y': '76%', '--d': 2 }}>
          <span className="label">{data.chips[1].label}</span>
          <b>{data.chips[1].b}</b>
          {data.chips[1].spark && <Spark data={data.chips[1].spark} color="#8b5cff" />}
        </div>
      )}
      {data.pill && <div className="viz__pill" style={{ '--x': '58%', '--y': '14%', '--d': 1 }}>{data.pill}</div>}
    </div>
  )
}

/* ─────────────────────────── RANGE ─────────────────────────── */
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const fmtTime = (pos) => {
  const mins = Math.round((6 * 60 + pos * 16 * 60) / 5) * 5
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function PickerVisual({ pointerRef, data = {} }) {
  const { reduced } = useEnv()
  const cv = useRef(null)
  const sm = useRef({ x: 0.5, y: 0.5, a: 0, end: 14, hs: 0.3, he: 0.7 })

  useCanvasLoop(
    cv,
    (ctx, w, h, t) => {
      const s = sm.current
      const ps = pointerRef.current
      s.x += (ps.x - s.x) * 0.18
      s.y += (ps.y - s.y) * 0.18
      s.a += ((ps.active ? 1 : 0) - s.a) * 0.08
      const px = s.x * w, py = s.y * h
      ctx.clearRect(0, 0, w, h)

      const narrow = w < 560
      const cols = 7, rows = 5
      const cell = narrow ? Math.min((w * 0.84) / cols, (h * 0.5) / rows) : Math.min((w * 0.46) / cols, (h * 0.68) / rows)
      const gw = cell * cols, gh = cell * rows
      const x0 = narrow ? (w - gw) / 2 : w * 0.06 + (w * 0.5 - gw) / 2
      const y0 = narrow ? h * 0.1 : (h - gh) / 2 + h * 0.03
      const A = 9

      const inGrid = px > x0 && px < x0 + gw && py > y0 && py < y0 + gh
      let target = A + 4 + 5 * (0.5 + 0.5 * Math.sin(t * 0.6))
      if (ps.active && inGrid) target = Math.floor((py - y0) / cell) * cols + Math.floor((px - x0) / cell)
      s.end += (target - s.end) * 0.2
      const e = Math.max(0, Math.min(cols * rows - 1, Math.round(s.end)))
      const lo = Math.min(A, e), hi = Math.max(A, e)

      // weekday header
      ctx.font = '500 11px "Space Grotesk", system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(245,245,245,.35)'
      for (let c = 0; c < cols; c++) ctx.fillText(WEEK[c], x0 + c * cell + cell / 2, y0 - 12)

      const g = ctx.createLinearGradient(x0, y0, x0 + gw, y0 + gh)
      g.addColorStop(0, '#ec4899')
      g.addColorStop(1, '#8b5cff')
      for (let i = 0; i < cols * rows; i++) {
        const c = i % cols, r = Math.floor(i / cols)
        const x = x0 + c * cell + 3, y = y0 + r * cell + 3, size = cell - 6
        const edge = i === lo || i === hi
        const inside = i >= lo && i <= hi
        if (edge) {
          ctx.shadowColor = 'rgba(236,72,153,.75)'
          ctx.shadowBlur = 20
          ctx.fillStyle = g
          rr(ctx, x, y, size, size, 10)
          ctx.fill()
          ctx.shadowBlur = 0
        } else if (inside) {
          ctx.fillStyle = 'rgba(236,72,153,.2)'
          rr(ctx, x, y, size, size, 10)
          ctx.fill()
        } else {
          ctx.fillStyle = 'rgba(255,255,255,.035)'
          rr(ctx, x, y, size, size, 10)
          ctx.fill()
        }
        ctx.fillStyle = edge ? '#fff' : inside ? 'rgba(245,245,245,.9)' : 'rgba(245,245,245,.38)'
        ctx.font = `${edge ? 600 : 500} ${Math.max(10, Math.min(14, cell * 0.24))}px "Space Grotesk", system-ui, sans-serif`
        ctx.fillText(String(i + 1 <= 31 ? i + 1 : i - 30), x + size / 2, y + size / 2 + 0.5)
      }

      // time range
      const tx0 = narrow ? w * 0.1 : w * 0.6
      const tx1 = narrow ? w * 0.9 : w * 0.93
      const ty = narrow ? h * 0.86 : h * 0.64
      const tw = tx1 - tx0
      const wantS = 0.3 + 0.05 * Math.sin(t * 0.7)
      let wantE = 0.7 + 0.07 * Math.sin(t * 0.5 + 1)
      if (ps.active && !inGrid && px > tx0 - 30 && px < tx1 + 30) wantE = Math.max(wantS + 0.1, Math.min(1, (px - tx0) / tw))
      s.hs += (wantS - s.hs) * 0.15
      s.he += (wantE - s.he) * 0.15

      ctx.fillStyle = 'rgba(245,245,245,.4)'
      ctx.font = '500 11px "Space Grotesk", system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('TIME RANGE', tx0, narrow ? ty - h * 0.2 : h * 0.3)
      ctx.fillStyle = '#f5f5f5'
      ctx.font = `600 ${Math.round(Math.min(narrow ? 30 : 54, w * (narrow ? 0.09 : 0.04)))}px "Space Grotesk", system-ui, sans-serif`
      ctx.fillText(`${fmtTime(s.hs)} — ${fmtTime(s.he)}`, tx0, narrow ? ty - h * 0.11 : h * 0.42)

      ctx.lineWidth = 1
      for (let i = 0; i <= 16; i++) {
        const x = tx0 + (i / 16) * tw
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(245,245,245,.35)' : 'rgba(245,245,245,.14)'
        ctx.beginPath()
        ctx.moveTo(x, ty + 12)
        ctx.lineTo(x, ty + (i % 4 === 0 ? 26 : 20))
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(255,255,255,.12)'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(tx0, ty)
      ctx.lineTo(tx1, ty)
      ctx.stroke()
      const gg = ctx.createLinearGradient(tx0, 0, tx1, 0)
      gg.addColorStop(0, '#ec4899')
      gg.addColorStop(1, '#8b5cff')
      ctx.strokeStyle = gg
      ctx.beginPath()
      ctx.moveTo(tx0 + s.hs * tw, ty)
      ctx.lineTo(tx0 + s.he * tw, ty)
      ctx.stroke()
      ;[s.hs, s.he].forEach((p) => {
        ctx.shadowColor = 'rgba(236,72,153,.8)'
        ctx.shadowBlur = 16
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(tx0 + p * tw, ty, 9, 0, 6.283)
        ctx.fill()
        ctx.shadowBlur = 0
      })
    },
    { still: reduced },
  )

  return (
    <div className="viz viz--picker" aria-hidden="true">
      <canvas ref={cv} className="viz__canvas" />
      {data.chips?.[0] && (
        <div className="viz__chip" style={{ '--x': '78%', '--y': '9%', '--d': 1.6 }}>
          <span className="label">{data.chips[0].label}</span>
          <b>{data.chips[0].b}</b>
          <span className="viz__sub">{data.chips[0].sub}</span>
        </div>
      )}
    </div>
  )
}

export default function ExperimentVisual({ kind, pointerRef, data }) {
  if (kind === 'halo') return <HaloVisual pointerRef={pointerRef} data={data} />
  if (kind === 'picker') return <PickerVisual pointerRef={pointerRef} data={data} />
  return <FluxVisual data={data} />
}
