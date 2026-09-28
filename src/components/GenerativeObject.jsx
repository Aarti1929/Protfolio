import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { seeded, smooth } from '../lib/util'

const TIERS = {
  high: { nodes: 112, particles: 420, dpr: 1.75 },
  mid: { nodes: 76, particles: 220, dpr: 1.4 },
  low: { nodes: 54, particles: 110, dpr: 1.25 },
}
const VIOLET = new THREE.Color('#8b5cff')
const CYAN = new THREE.Color('#22d3ee')
const MAGENTA = new THREE.Color('#ec4899')

/* Four target arrangements the molecule morphs between as you scroll:
   sphere → torus → lattice → double helix                                  */
function makeShapes(N) {
  const rnd = seeded(11)
  const S = [[], [], [], []]
  const golden = Math.PI * (3 - Math.sqrt(5))
  const n = Math.ceil(Math.cbrt(N))
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    // 0 — sphere (fibonacci) with radial jitter
    const y = 1 - 2 * t
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    const k = 1.55 * (0.8 + rnd() * 0.4)
    S[0].push([Math.cos(th) * r * k, y * k, Math.sin(th) * r * k])
    // 1 — torus, tilted toward camera
    const u = golden * i
    const v = t * Math.PI * 2 * 7
    const R = 1.4, rr = 0.58
    const tx = (R + rr * Math.cos(v)) * Math.cos(u)
    const ty = rr * Math.sin(v)
    const tz = (R + rr * Math.cos(v)) * Math.sin(u)
    const c = Math.cos(0.55), s = Math.sin(0.55)
    S[1].push([tx, ty * c - tz * s, ty * s + tz * c])
    // 2 — lattice cube
    const ix = i % n, iy = Math.floor(i / n) % n, iz = Math.floor(i / (n * n))
    const sp = 2.7 / (n - 1)
    S[2].push([(ix - (n - 1) / 2) * sp + (rnd() - 0.5) * 0.08, (iy - (n - 1) / 2) * sp + (rnd() - 0.5) * 0.08, (iz - (n - 1) / 2) * sp + (rnd() - 0.5) * 0.08])
    // 3 — double helix
    const strand = i % 2
    const ht = Math.floor(i / 2) / Math.floor(N / 2)
    const a = ht * Math.PI * 7 + strand * Math.PI
    S[3].push([Math.cos(a) * 1.0, (ht - 0.5) * 4.4, Math.sin(a) * 1.0])
  }
  return S
}

function makeEdges(shapes, N, k = 3) {
  const set = new Set()
  shapes.forEach((sh) => {
    for (let i = 0; i < N; i++) {
      const d = []
      for (let j = 0; j < N; j++) {
        if (i === j) continue
        const dx = sh[i][0] - sh[j][0], dy = sh[i][1] - sh[j][1], dz = sh[i][2] - sh[j][2]
        d.push([dx * dx + dy * dy + dz * dz, j])
      }
      d.sort((a, b) => a[0] - b[0])
      for (let q = 0; q < k; q++) {
        const j = d[q][1]
        set.add(Math.min(i, j) * N + Math.max(i, j))
      }
    }
  })
  return [...set].map((key) => [Math.floor(key / N), key % N])
}

// rounded-rect outline points
function rrPts(w, h, r, seg = 5) {
  const pts = []
  const cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 1], [-w / 2 + r, -h / 2 + r, 2], [w / 2 - r, -h / 2 + r, 3]]
  cs.forEach(([cx, cy, q]) => {
    for (let s = 0; s <= seg; s++) {
      const a = (q + s / seg) * (Math.PI / 2)
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0))
    }
  })
  return pts
}
const circPts = (cx, cy, r, seg = 20) => Array.from({ length: seg }, (_, i) => new THREE.Vector3(cx + Math.cos((i / seg) * Math.PI * 2) * r, cy + Math.sin((i / seg) * Math.PI * 2) * r, 0))

function makeFragments(mat, matAccent) {
  const frags = []
  const loop = (pts, m = mat) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), m)
  const segs = (pairs, m = mat) => new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pairs.flat().map(([x, y]) => new THREE.Vector3(x, y, 0))), m)

  // card
  const card = new THREE.Group()
  card.add(loop(rrPts(1.15, 0.72, 0.09)), loop(circPts(-0.38, 0.14, 0.1), matAccent), segs([[[-0.2, 0.19], [0.42, 0.19]], [[-0.2, 0.08], [0.2, 0.08]], [[-0.46, -0.16], [0.46, -0.16]], [[-0.46, -0.24], [0.1, -0.24]]]))
  frags.push(card)
  // slider
  const slider = new THREE.Group()
  slider.add(segs([[[-0.7, 0], [0.7, 0]]]), loop(circPts(0.2, 0, 0.09), matAccent), segs([[[-0.7, -0.08], [-0.7, 0.08]], [[0.7, -0.08], [0.7, 0.08]], [[0, -0.05], [0, 0.05]]]))
  frags.push(slider)
  // toggle
  const toggle = new THREE.Group()
  toggle.add(loop(rrPts(0.7, 0.32, 0.16, 6)), loop(circPts(0.19, 0, 0.11), matAccent))
  frags.push(toggle)
  // bars
  const bars = new THREE.Group()
  bars.add(loop(rrPts(1.0, 0.7, 0.06)))
  ;[-0.3, -0.1, 0.1, 0.3].forEach((x, i) => {
    const h = [0.2, 0.36, 0.28, 0.46][i]
    bars.add(segs([[[x, -0.24], [x, -0.24 + h]]], matAccent))
  })
  frags.push(bars)
  return frags
}

const PT_VERT = /* glsl */ `
  uniform float uPx; uniform vec3 uLight;
  attribute vec3 aColor; attribute float aSize;
  varying vec3 vColor; varying float vGlow;
  void main(){
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float d = distance(wp.xyz, uLight);
    float glow = smoothstep(2.4, 0.0, d);
    vGlow = glow; vColor = aColor;
    vec4 mv = viewMatrix * wp;
    gl_PointSize = aSize * uPx * (1.0 + glow * 1.4) * (6.5 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`
const PT_FRAG = /* glsl */ `
  uniform float uFade;
  varying vec3 vColor; varying float vGlow;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.2, 0.0, d);
    float halo = pow(smoothstep(0.5, 0.0, d), 2.2);
    vec3 col = mix(vColor, vec3(1.0), core * 0.8 + vGlow * 0.25);
    float a = (halo * 0.85 + core) * (0.7 + vGlow * 0.7) * uFade;
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
  }`
const PA_VERT = /* glsl */ `
  uniform float uTime; uniform vec2 uMouse; uniform float uPx; uniform float uFade;
  attribute float aSeed; attribute vec3 aColor;
  varying vec3 vColor; varying float vA;
  void main(){
    vec3 p = position;
    float t = uTime * 0.12;
    p.x += sin(t * 2.0 + aSeed * 20.0) * 0.35 + uMouse.x * (0.4 + aSeed) * 0.9;
    p.y += cos(t * 1.7 + aSeed * 31.0) * 0.35 + uMouse.y * (0.4 + aSeed) * 0.9;
    p.z += sin(t * 1.3 + aSeed * 11.0) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.3 + aSeed * 2.4) * uPx * (6.5 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor; vA = (0.2 + aSeed * 0.45) * uFade;
  }`
const PA_FRAG = /* glsl */ `
  varying vec3 vColor; varying float vA;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vA;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }`

export default function GenerativeObject({ progressRef, tier = 'high', reduced = false }) {
  const mount = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = mount.current
    const cfg = TIERS[tier] || TIERS.high
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' })
    } catch {
      setFailed(true)
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, cfg.dpr)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)
    const canvas = renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    canvas.className = 'hero__gl'
    host.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50)
    camera.position.set(0, 0, 6.4)

    const N = cfg.nodes
    const shapes = makeShapes(N)
    const edges = makeEdges(shapes, N, 3)
    const rnd = seeded(5)

    const main = new THREE.Group()
    scene.add(main)

    // ── nodes
    const nodePos = new Float32Array(N * 3)
    const nodeCol = new Float32Array(N * 3)
    const nodeSize = new Float32Array(N)
    const cols = []
    for (let i = 0; i < N; i++) {
      const t = i / N
      const c = new THREE.Color().copy(VIOLET).lerp(CYAN, t)
      if (i % 11 === 0) c.copy(MAGENTA)
      cols.push(c)
      nodeCol.set([c.r, c.g, c.b], i * 3)
      nodeSize[i] = 5 + rnd() * 9 + (i % 9 === 0 ? 8 : 0)
    }
    const nGeo = new THREE.BufferGeometry()
    nGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3).setUsage(THREE.DynamicDrawUsage))
    nGeo.setAttribute('aColor', new THREE.BufferAttribute(nodeCol, 3))
    nGeo.setAttribute('aSize', new THREE.BufferAttribute(nodeSize, 1))
    const nMat = new THREE.ShaderMaterial({
      vertexShader: PT_VERT,
      fragmentShader: PT_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uPx: { value: dpr }, uLight: { value: new THREE.Vector3(0, 0, 3) }, uFade: { value: 1 } },
    })
    const points = new THREE.Points(nGeo, nMat)
    points.frustumCulled = false
    main.add(points)

    // ── connections
    const E = edges.length
    const linePos = new Float32Array(E * 6)
    const lineCol = new Float32Array(E * 6)
    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage))
    lGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3).setUsage(THREE.DynamicDrawUsage))
    const lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    const lines = new THREE.LineSegments(lGeo, lMat)
    lines.frustumCulled = false
    main.add(lines)

    // ── ambient particles
    const P = cfg.particles
    const pPos = new Float32Array(P * 3)
    const pSeed = new Float32Array(P)
    const pCol = new Float32Array(P * 3)
    for (let i = 0; i < P; i++) {
      const r = 2.2 + rnd() * 3.6
      const th = rnd() * Math.PI * 2
      const ph = Math.acos(2 * rnd() - 1)
      pPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.8, r * Math.cos(ph)], i * 3)
      pSeed[i] = rnd()
      const c = new THREE.Color().copy(VIOLET).lerp(CYAN, rnd())
      pCol.set([c.r, c.g, c.b], i * 3)
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1))
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3))
    const pMat = new THREE.ShaderMaterial({
      vertexShader: PA_VERT,
      fragmentShader: PA_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uPx: { value: dpr }, uFade: { value: 1 } },
    })
    const particles = new THREE.Points(pGeo, pMat)
    particles.frustumCulled = false
    scene.add(particles)

    // ── floating UI fragments
    const uiGroup = new THREE.Group()
    scene.add(uiGroup)
    const fMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })
    const fAcc = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    const frags = cfg === TIERS.low ? makeFragments(fMat, fAcc).slice(0, 2) : makeFragments(fMat, fAcc)
    const orbit = frags.map((g, i) => ({ g, a: (i / frags.length) * Math.PI * 2 + 0.6, r: 2.5 + (i % 2) * 0.4, y: [0.9, -1.0, 1.4, -0.4][i] ?? 0, sp: 0.05 + i * 0.012 }))
    orbit.forEach(({ g }) => uiGroup.add(g))

    // ── state
    const m = { x: 0, y: 0 }, mt = { x: 0, y: 0 }
    const light = new THREE.Vector3(0, 0, 3)
    let autoY = 0.6, t = 0, raf = 0, visible = true, last = performance.now()

    const size = () => {
      const w = host.clientWidth || 1
      const h = host.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const portrait = w / h < 0.9
      camera.position.z = portrait ? 9.4 : 6.4
      main.position.set(w / h > 1.25 ? 0.75 : 0, portrait ? 0.55 : 0, 0)
      camera.updateProjectionMatrix()
    }

    const A = new THREE.Vector3()
    const update = (dt, freeze) => {
      const p = progressRef?.current || 0
      if (!freeze) {
        m.x += (mt.x - m.x) * Math.min(1, dt * 3.2)
        m.y += (mt.y - m.y) * Math.min(1, dt * 3.2)
        autoY += dt * (0.11 + p * 0.14)
      }
      main.rotation.y = autoY + m.x * 0.65
      main.rotation.x = 0.16 + m.y * 0.38 + p * 0.45
      main.scale.setScalar(1 + p * 0.3)
      uiGroup.position.copy(main.position)
      uiGroup.rotation.y = m.x * 0.25
      uiGroup.rotation.x = -m.y * 0.15

      // pointer light in world space
      light.set(main.position.x + m.x * 3.4, m.y * 2.6, 1.6)
      nMat.uniforms.uLight.value.copy(light)
      pMat.uniforms.uMouse.value.set(m.x, m.y)
      pMat.uniforms.uTime.value = t
      const fade = 1 - smooth(0.7, 1, p) * 0.8
      nMat.uniforms.uFade.value = fade
      pMat.uniforms.uFade.value = fade
      lMat.opacity = fade
      fMat.opacity = 0.32 * fade
      fAcc.opacity = 0.9 * fade

      // morph node positions between the two nearest target shapes
      const s = Math.min(2.999, p * 3)
      const i0 = Math.floor(s)
      const f = smooth(0, 1, s - i0)
      const SA = shapes[i0], SB = shapes[i0 + 1]
      for (let i = 0; i < N; i++) {
        const a = SA[i], b = SB[i]
        nodePos[i * 3] = a[0] + (b[0] - a[0]) * f + Math.sin(t * 0.6 + i * 1.7) * 0.055
        nodePos[i * 3 + 1] = a[1] + (b[1] - a[1]) * f + Math.cos(t * 0.5 + i * 2.1) * 0.055
        nodePos[i * 3 + 2] = a[2] + (b[2] - a[2]) * f + Math.sin(t * 0.7 + i * 0.9) * 0.055
      }
      nGeo.attributes.position.needsUpdate = true

      for (let e = 0; e < E; e++) {
        const [a, b] = edges[e]
        const ax = nodePos[a * 3], ay = nodePos[a * 3 + 1], az = nodePos[a * 3 + 2]
        const bx = nodePos[b * 3], by = nodePos[b * 3 + 1], bz = nodePos[b * 3 + 2]
        const len = Math.hypot(ax - bx, ay - by, az - bz)
        const al = (1 - smooth(0.95, 1.8, len)) * 0.55
        const o = e * 6
        linePos[o] = ax; linePos[o + 1] = ay; linePos[o + 2] = az
        linePos[o + 3] = bx; linePos[o + 4] = by; linePos[o + 5] = bz
        const ca = cols[a], cb = cols[b]
        lineCol[o] = ca.r * al; lineCol[o + 1] = ca.g * al; lineCol[o + 2] = ca.b * al
        lineCol[o + 3] = cb.r * al; lineCol[o + 4] = cb.g * al; lineCol[o + 5] = cb.b * al
      }
      lGeo.attributes.position.needsUpdate = true
      lGeo.attributes.color.needsUpdate = true

      // orbiting UI fragments
      orbit.forEach((o, i) => {
        if (!freeze) o.a += dt * o.sp
        A.set(Math.cos(o.a) * o.r, o.y + Math.sin(t * 0.4 + i) * 0.06, Math.sin(o.a) * o.r * 0.55 - 0.4)
        o.g.position.copy(A)
        o.g.rotation.y = -Math.cos(o.a) * 0.35
        o.g.visible = A.z > -1.6 // hide the ones passing behind the object's core
      })
    }

    const render = () => renderer.render(scene, camera)

    size()
    const ro = new ResizeObserver(() => {
      size()
      if (reduced) {
        update(0, true)
        render()
      }
    })
    ro.observe(host)

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '60px' })
    io.observe(host)

    const onMove = (e) => {
      mt.x = (e.clientX / window.innerWidth) * 2 - 1
      mt.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    if (reduced) {
      // static, beautiful still — no rotation, no scroll distortion, no drift
      update(0, true)
      render()
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        if (!visible || document.hidden) {
          last = now
          return
        }
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        t += dt
        update(dt, false)
        render()
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      io.disconnect()
      ;[nGeo, lGeo, pGeo].forEach((g) => g.dispose())
      ;[nMat, lMat, pMat, fMat, fAcc].forEach((mm) => mm.dispose())
      uiGroup.traverse((o) => o.geometry?.dispose?.())
      renderer.dispose()
      canvas.remove()
    }
  }, [tier, reduced, progressRef])

  return (
    <div className="hero__object" ref={mount} aria-hidden="true">
      {failed && <div className="hero__fallback" />}
    </div>
  )
}
