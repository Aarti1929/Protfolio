import { createContext, useContext, useEffect, useState } from 'react'

const QUERIES = {
  reduced: '(prefers-reduced-motion: reduce)',
  coarse: '(hover: none), (pointer: coarse)',
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1099px)',
}

const read = () => {
  const out = {}
  for (const k in QUERIES) out[k] = typeof window !== 'undefined' && !!window.matchMedia?.(QUERIES[k]).matches
  return out
}

const EnvContext = createContext(read())

/** Central place for reduced-motion / touch / viewport-tier detection. */
export function EnvProvider({ children }) {
  const [env, setEnv] = useState(read)

  useEffect(() => {
    const list = Object.values(QUERIES).map((q) => window.matchMedia(q))
    const on = () => setEnv(read())
    list.forEach((m) => m.addEventListener('change', on))
    return () => list.forEach((m) => m.removeEventListener('change', on))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', env.reduced)
  }, [env.reduced])

  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>
}

export const useEnv = () => useContext(EnvContext)
