/** Original placeholder portraits (SVG) — swap for real photos by replacing this component. */
export default function Avatar({ tone = 'gray', label, className = '' }) {
  const gray = tone === 'gray'
  const id = `av-${tone}`
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={gray ? '#3a3a42' : '#2a1b5c'} />
          <stop offset="1" stopColor={gray ? '#141418' : '#0b3b48'} />
        </linearGradient>
        <linearGradient id={`${id}-fg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={gray ? '#d6d6dc' : '#c9b8ff'} />
          <stop offset="1" stopColor={gray ? '#8a8a94' : '#57d7ec'} />
        </linearGradient>
        <filter id={`${id}-n`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0" />
        </filter>
      </defs>
      <rect width="120" height="120" fill={`url(#${id}-bg)`} />
      <circle cx="60" cy="46" r="22" fill={`url(#${id}-fg)`} />
      <path d="M14 120c2-30 22-44 46-44s44 14 46 44z" fill={`url(#${id}-fg)`} opacity=".9" />
      <rect width="120" height="120" filter={`url(#${id}-n)`} />
    </svg>
  )
}
