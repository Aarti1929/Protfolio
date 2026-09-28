import { PROJECTS } from '../data/projects'
import ExperimentCard from './ExperimentCard'
import { LineReveal } from './ui/Reveal'
import Archive from './Archive'
import GraphicWork from './GraphicWork'

export default function Experiments({ onOpen }) {
  return (
    <section id="work" className="section experiments" data-nav="work" aria-labelledby="exp-head">
      <header className="section__head">
        <div className="section__meta">
          <span className="label">01 / EXPERIMENTS</span>
          <span className="label section__coord">SECTOR 02 · 03 SAMPLES</span>
        </div>
        <LineReveal as="h2" className="display" lines={["THINGS I'VE", 'BUILT, BROKEN', 'AND REBUILT.']} />
        <p className="section__lede">
          Three of my favourite builds so far. Move across them — every experiment reacts. Open one to see how it was made, or scroll on for the smaller ones.
        </p>
        <span id="exp-head" className="sr-only">Selected experiments</span>
      </header>
      <div className="experiments__list">
        {PROJECTS.map((p) => (
          <ExperimentCard key={p.id} project={p} onOpen={onOpen} />
        ))}
      </div>
      <Archive />
      <GraphicWork />
    </section>
  )
}
