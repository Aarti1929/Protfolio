// ─────────────────────────────────────────────────────────────
//  GRAPHIC WORK — real logos & posters, shown in the gallery.
//  Imported as modules so they bundle correctly in every build
//  mode (dev, multi-chunk, and the single self-contained HTML).
//  Add more by dropping a file in src/assets/graphics/ and adding
//  an import + row here.
// ─────────────────────────────────────────────────────────────
import bachpanshala1 from '../assets/graphics/bachpanshala-poster-1.png'
import bachpanshala2 from '../assets/graphics/bachpanshala-poster-2.png'
import deknek3d from '../assets/graphics/deknek3d-poster.png'
import nexadot from '../assets/graphics/nexadot-logo.png'
import leafora from '../assets/graphics/leafora-logo.png'
import lotus from '../assets/graphics/lotus-logo.png'
import cu from '../assets/graphics/cu-logo.png'
import feynman from '../assets/graphics/feynman-slide.png'

export const GRAPHICS = [
  { id: 'bachpanshala-1', title: 'Bridging the Gap', tag: 'Poster · Project Bachpanshala', tool: 'Canva', file: bachpanshala1, span: 'tall' },
  { id: 'deknek3d', title: 'Internships → Entrepreneurship', tag: 'Poster · Deknek 3D', tool: 'Canva', file: deknek3d, span: 'wide' },
  { id: 'nexadot', title: 'Nexa Dot', tag: 'Logo design', tool: 'Canva', file: nexadot, span: 'normal' },
  { id: 'bachpanshala-2', title: 'Power of Learning', tag: 'Poster · Project Bachpanshala', tool: 'Canva', file: bachpanshala2, span: 'normal' },
  { id: 'leafora', title: 'Leafora', tag: 'Logo design', tool: 'Canva', file: leafora, span: 'normal' },
  { id: 'lotus', title: 'Lotus', tag: 'Logo design · “Bloom with Grace”', tool: 'Canva', file: lotus, span: 'normal' },
  { id: 'cu', title: 'CU', tag: 'Logo design', tool: 'Canva', file: cu, span: 'normal' },
  { id: 'feynman', title: 'Surely You Are Joking, Mr Feynman', tag: 'Presentation cover slide', tool: 'Canva', file: feynman, span: 'wide' },
]
