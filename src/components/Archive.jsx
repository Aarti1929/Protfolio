import { ArrowUpRight } from 'lucide-react'
import { ARCHIVE } from '../data/archive'
import { LineReveal } from './ui/Reveal'

export default function Archive() {
  return (
    <div className="archive">
      <div className="section__meta">
        <span className="label">MORE FROM THE LAB</span>
        <span className="label section__coord">{String(ARCHIVE.length).padStart(2, '0')} SMALLER SAMPLES</span>
      </div>
      <LineReveal as="h3" className="archive__title" lines={['SMALLER EXPERIMENTS,', 'SAME CURIOSITY.']} />
      <ul className="archive__list">
        {ARCHIVE.map((a, i) => {
          const inner = (
            <>
              <span className="label archive__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="archive__main">
                <strong>{a.name}</strong>
                <span>{a.desc}</span>
              </span>
              <span className="archive__tech label">{a.tech}</span>
              <span className="archive__date label">{a.date}</span>
              {a.href ? <ArrowUpRight className="archive__arrow" size={22} strokeWidth={1.4} aria-hidden="true" /> : <span className="archive__arrow" />}
            </>
          )
          return (
            <li key={a.name}>
              {a.href ? (
                <a className="archive__row" href={a.href} target="_blank" rel="noreferrer noopener" data-cursor="link">
                  {inner}
                </a>
              ) : (
                <div className="archive__row is-static">{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
