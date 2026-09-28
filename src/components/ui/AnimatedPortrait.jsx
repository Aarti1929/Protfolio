/**
 * Animated illustrated portrait (pure SVG + CSS — no image files).
 * It blinks, sways, and is orbited by floating "code" chips.
 * To use a real photo instead: pass `src="/your-photo.jpg"`.
 */
export default function AnimatedPortrait({ src, label = 'Animated illustrated portrait' }) {
  return (
    <figure className="portrait" aria-label={label}>
      <div className="portrait__frame">
        <span className="portrait__ring portrait__ring--a" aria-hidden="true" />
        <span className="portrait__ring portrait__ring--b" aria-hidden="true" />
        {src ? (
          <img className="portrait__img" src={src} alt={label} />
        ) : (
          <svg viewBox="0 0 320 380" role="img" aria-label={label} className="portrait__svg">
            <defs>
              <radialGradient id="pg-bg" cx=".5" cy=".42" r=".7">
                <stop offset="0" stopColor="#3b2a7a" />
                <stop offset=".6" stopColor="#151033" />
                <stop offset="1" stopColor="#09090d" />
              </radialGradient>
              <linearGradient id="pg-skin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#efe4ff" />
                <stop offset="1" stopColor="#b9d9ff" />
              </linearGradient>
              <linearGradient id="pg-hair" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2a1670" />
                <stop offset="1" stopColor="#0d2f3d" />
              </linearGradient>
              <linearGradient id="pg-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8b5cff" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
              <filter id="pg-blur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
            </defs>
            <rect width="320" height="380" fill="url(#pg-bg)" />
            <circle className="portrait__glow" cx="160" cy="170" r="110" fill="#8b5cff" opacity=".35" filter="url(#pg-blur)" />

            <g className="portrait__sway">
              {/* back hair */}
              <path d="M96 168c-6-70 30-112 64-112s70 42 64 112c-2 40 6 70 14 96H82c8-26 16-56 14-96z" fill="url(#pg-hair)" />
              {/* neck + body */}
              <rect x="140" y="214" width="40" height="46" rx="16" fill="url(#pg-skin)" opacity=".92" />
              <path d="M40 380c4-66 48-112 120-112s116 46 120 112z" fill="url(#pg-body)" />
              <path d="M128 268c8 16 24 26 32 26s24-10 32-26" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round" />
              {/* face */}
              <ellipse cx="160" cy="172" rx="52" ry="60" fill="url(#pg-skin)" />
              {/* fringe */}
              <path d="M104 160c4-40 30-62 60-62 30 0 52 20 56 58-24-8-44-26-52-46-10 22-34 42-64 50z" fill="url(#pg-hair)" />
              {/* eyes (blink) */}
              <g className="portrait__eyes">
                <ellipse cx="139" cy="178" rx="5.5" ry="7" fill="#1b1240" />
                <ellipse cx="181" cy="178" rx="5.5" ry="7" fill="#1b1240" />
                <circle cx="141" cy="175" r="1.7" fill="#fff" />
                <circle cx="183" cy="175" r="1.7" fill="#fff" />
              </g>
              {/* cheeks + smile */}
              <ellipse cx="128" cy="196" rx="8" ry="4.5" fill="#ec4899" opacity=".22" />
              <ellipse cx="192" cy="196" rx="8" ry="4.5" fill="#ec4899" opacity=".22" />
              <path d="M146 205c8 9 20 9 28 0" fill="none" stroke="#1b1240" strokeWidth="2.6" strokeLinecap="round" />
              {/* headphones */}
              <path d="M104 172c0-36 24-58 56-58s56 22 56 58" fill="none" stroke="#f5f5f5" strokeWidth="6" strokeLinecap="round" opacity=".9" />
              <rect x="94" y="164" width="16" height="34" rx="8" fill="#f5f5f5" />
              <rect x="210" y="164" width="16" height="34" rx="8" fill="#f5f5f5" />
            </g>
          </svg>
        )}
      </div>
      <span className="portrait__chip portrait__chip--1" aria-hidden="true">&lt;/&gt;</span>
      <span className="portrait__chip portrait__chip--2" aria-hidden="true">Figma</span>
      <span className="portrait__chip portrait__chip--3" aria-hidden="true">React</span>
      <span className="portrait__chip portrait__chip--4" aria-hidden="true">UI/UX</span>
    </figure>
  )
}
