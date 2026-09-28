import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import { GRAPHICS } from '../data/graphics'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useEnv } from '../hooks/useEnv'
import { cx } from '../lib/util'
import { LineReveal } from './ui/Reveal'

const ACCENTS = [
  ['139 92 255', '34 211 238'],
  ['34 211 238', '236 72 153'],
  ['236 72 153', '139 92 255'],
]

function Tile({ g, i, onOpen }) {
  const { coarse, reduced } = useEnv()
  const root = useRef(null)
  const [a1, a2] = ACCENTS[i % ACCENTS.length]

  useLayoutEffect(() => {
    const el = root.current
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.from(el, {
        y: 46,
        opacity: 0,
        scale: 0.96,
        duration: 1,
        ease: 'expo.out',
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [i, reduced])

  const move = (e) => {
    if (coarse) return
    const r = root.current.getBoundingClientRect()
    root.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    root.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <figure
      ref={root}
      className={cx('gfx', `gfx--${g.span}`)}
      style={{ '--accent': a1, '--accent2': a2 }}
      onPointerMove={move}
      onClick={() => onOpen(i)}
      data-cursor="view"
    >
      <span className="gfx__glow" aria-hidden="true" />
      <img className="gfx__img" src={g.file} alt={`${g.title} — ${g.tag}`} loading="lazy" />
      <figcaption className="gfx__cap">
        <span className="gfx__n label">{String(i + 1).padStart(2, '0')}</span>
        <span className="gfx__meta">
          <strong>{g.title}</strong>
          <span className="label">{g.tag}</span>
        </span>
        <ZoomIn size={18} strokeWidth={1.6} className="gfx__zoom" aria-hidden="true" />
      </figcaption>
    </figure>
  )
}

export default function GraphicWork() {
  const [open, setOpen] = useState(null) // index into GRAPHICS, or null
  const closeRef = useRef(null)

  useEffect(() => {
    if (open === null) return
    document.documentElement.classList.add('is-locked')
    const k = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => (o + 1) % GRAPHICS.length)
      if (e.key === 'ArrowLeft') setOpen((o) => (o - 1 + GRAPHICS.length) % GRAPHICS.length)
    }
    window.addEventListener('keydown', k)
    closeRef.current?.focus()
    return () => {
      document.documentElement.classList.remove('is-locked')
      window.removeEventListener('keydown', k)
    }
  }, [open])

  const g = open !== null ? GRAPHICS[open] : null

  return (
    <div className="graphic" id="graphic-work">
      <div className="section__meta">
        <span className="label">GRAPHIC WORK</span>
        <span className="label section__coord">{String(GRAPHICS.length).padStart(2, '0')} PIECES · CANVA</span>
      </div>
      <LineReveal as="h3" className="archive__title" lines={['DESIGN, ONE POSTER', 'AT A TIME.']} />
      <p className="section__lede graphic__lede">
        Logos and posters from my graphic design internship and personal practice. Click any piece to view it full size.
      </p>

      <div className="gfx__grid">
        {GRAPHICS.map((item, i) => (
          <Tile key={item.id} g={item} i={i} onOpen={setOpen} />
        ))}
      </div>

      <AnimatePresence>
        {g && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={g.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          >
            <button ref={closeRef} type="button" className="lightbox__close" onClick={() => setOpen(null)} data-cursor="close" aria-label="Close">
              <X size={20} strokeWidth={1.8} />
            </button>
            <motion.figure
              key={g.id}
              className="lightbox__fig"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={g.file} alt={`${g.title} — ${g.tag}`} />
              <figcaption>
                <strong>{g.title}</strong>
                <span className="label">
                  {g.tag} · {g.tool} · {String(open + 1).padStart(2, '0')} / {String(GRAPHICS.length).padStart(2, '0')}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
