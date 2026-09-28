import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECTS } from './data/projects'
import { ScrollTrigger } from './lib/gsap'
import Loader from './components/Loader'
import FloatingNav from './components/FloatingNav'
import Hero from './components/Hero'
import Experiments from './components/Experiments'
import DesignDNA from './components/DesignDNA'
import About from './components/About'
import Testimonial from './components/Testimonial'
import Philosophy from './components/Philosophy'
import Contact from './components/Contact'
import CustomCursor from './components/CustomCursor'
import ExpandTransition from './components/ExpandTransition'
import Hud from './components/Hud'

const CaseStudy = lazy(() => import('./components/CaseStudy'))

/** Which [data-nav] section is under the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState('home')
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-nav]')]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.dataset.nav)),
      { rootMargin: '-45% 0px -54% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

export default function App() {
  const [ready, setReady] = useState(false) // loader is dissolving → intro can play
  const [loaded, setLoaded] = useState(false) // loader unmounted
  const [trans, setTrans] = useState(null) // { project, rect, kind }
  const [open, setOpen] = useState(null) // project currently in the case study
  const lastFocus = useRef(null)
  const active = useActiveSection()

  // once everything (fonts, layout) has settled, make sure scroll triggers measure correctly
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => ScrollTrigger.refresh(), 200)
    return () => clearTimeout(t)
  }, [loaded])
  useEffect(() => {
    const on = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(on)
    return () => {}
  }, [])

  const openProject = useCallback((project, rect, trigger) => {
    if (trans || open) return
    lastFocus.current = trigger || document.activeElement
    setTrans({ project, rect, kind: 'open' })
  }, [trans, open])

  const nextProject = useCallback((project, rect) => {
    if (trans) return
    setTrans({ project, rect, kind: 'next' })
  }, [trans])

  const covered = useCallback(() => {
    setOpen(trans.project)
    document.documentElement.classList.add('is-locked')
  }, [trans])

  const close = useCallback(() => setOpen(null), [])
  const afterClose = () => {
    document.documentElement.classList.remove('is-locked')
    lastFocus.current?.focus?.({ preventScroll: true })
    ScrollTrigger.refresh()
  }

  const idx = open ? PROJECTS.findIndex((p) => p.id === open.id) : 0
  const next = PROJECTS[(idx + 1) % PROJECTS.length]

  return (
    <>
      <a className="skip" href="#work">Skip to experiments</a>
      <CustomCursor />
      {!loaded && <Loader onReady={() => setReady(true)} onDone={() => setLoaded(true)} />}
      <FloatingNav active={active} ready={ready} />
      <Hud ready={ready} />

      <main id="main">
        <Hero ready={ready} />
        <Experiments onOpen={openProject} />
        <DesignDNA />
        <About />
        <Testimonial />
        <Philosophy />
        <Contact />
      </main>

      {trans && (
        <ExpandTransition
          key={trans.project.id + trans.kind}
          project={trans.project}
          rect={trans.rect}
          onCovered={covered}
          onDone={() => setTrans(null)}
        />
      )}

      <AnimatePresence onExitComplete={afterClose}>
        {open && (
          <motion.div
            key="case-shell"
            className="case-shell"
            style={{ clipPath: 'inset(0% 0% 0% 0% round 0px)' }}
            exit={{ clipPath: 'inset(50% 50% 50% 50% round 60px)', opacity: 0, transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }}
          >
            <Suspense fallback={null}>
              <CaseStudy key={open.id} project={open} total={PROJECTS.length} next={next} onClose={close} onNext={nextProject} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
