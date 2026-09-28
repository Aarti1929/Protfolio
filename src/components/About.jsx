import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ABOUT } from '../data/about'
import { SITE } from '../data/site'
import { useEnv } from '../hooks/useEnv'
import { ScrubText } from './ui/Reveal'
import AnimatedPortrait from './ui/AnimatedPortrait'
import { cx } from '../lib/util'

function Module({ item, i, group }) {
  const { coarse } = useEnv()
  const [open, setOpen] = useState(false)
  const wide = group === 'EXPERIENCE' || group === 'CERTIFICATES'
  return (
    <div className={cx('mod', wide && 'mod--wide')} style={{ '--i': i }}>
      <motion.button
        type="button"
        className={cx('mod__card', open && 'is-open')}
        aria-expanded={open}
        onMouseEnter={() => !coarse && setOpen(true)}
        onMouseLeave={() => !coarse && setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        layout
        transition={{ layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      >
        <span className="mod__top">
          <span className="mod__label">{item.label}</span>
          <span className="mod__plus" aria-hidden="true">{open ? '−' : '+'}</span>
        </span>
        {item.sub && <span className="mod__sub">{item.sub}</span>}
        <AnimatePresence initial={false}>
          {open && (
            <motion.span
              className="mod__desc"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>{item.desc}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default function About() {
  return (
    <section id="about" className="section about" data-nav="about" aria-labelledby="about-h">
      <div className="section__meta">
        <span className="label" id="about-h">02 / THE HUMAN BEHIND THE SCREEN</span>
        <span className="label section__coord">SECTOR 04 · SUBJECT: DESIGNER</span>
      </div>

      <ScrubText as="h2" className="display about__statement" lines={ABOUT.statement} />

      <div className="about__lab">
        <div className="about__bio">
          <AnimatedPortrait label={`Animated illustrated portrait for ${SITE.name}`} />
          <div className="about__id">
            <div>
              <p className="about__name">{SITE.name}</p>
              <p className="label">{SITE.role}</p>
            </div>
          </div>
          {ABOUT.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <dl className="about__facts">
            {ABOUT.facts.map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="about__groups">
          {ABOUT.groups.map((g) => (
            <div key={g.title} className={cx('about__group', `about__group--${g.title.toLowerCase()}`)}>
              <span className="label about__gtitle">{g.title}</span>
              <div className="about__mods">
                {g.items.map((it, i) => (
                  <Module key={it.label} item={it} i={i} group={g.title} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
