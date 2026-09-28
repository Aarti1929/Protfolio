# Aarti Thakur — Portfolio ("Design Lab")

React + Vite + GSAP + Framer Motion + Three.js.

```bash
npm install
npm run dev            # local dev server
npm run build          # production build  -> dist/
npm run build:single   # ONE self-contained index.html (easy to host/share)
```

## Where to edit things (you never need to touch the components)

| What                                   | File                     |
| -------------------------------------- | ------------------------ |
| Name, role, email, intro, social links | `src/data/site.js`       |
| The 3 featured projects + case studies | `src/data/projects.js`   |
| "More from the lab" smaller projects   | `src/data/archive.js`    |
| Bio, skills, tools, experience, certs  | `src/data/about.js`      |
| Design DNA steps                       | `src/data/process.js`    |
| Colours / spacing / type               | `src/styles/global.css`  |

## To-do before you publish

1. **LinkedIn** – paste your real URL in `src/data/site.js` (search for `TODO`).
2. **Case-study text** – it is a first draft written from your resume and repo
   descriptions. Edit each project's `stages`, `discover`, `research`, `insight`
   so it describes what you actually did. No fake numbers are used anywhere.
3. **Screens** – the phone screens in each case study are illustrative mock-ups.
   Replace `screens` with real screenshots when you have them.
4. **Links** – University Landing Page repo, Graphic Work link (`src/data/archive.js`),
   Date Time Range Picker repo (`repo: null` in `projects.js`).
5. **Photo** – the animated portrait is an illustration. To use a real photo,
   put it in `public/` and pass `src="/your-photo.jpg"` to `<AnimatedPortrait />`
   in `src/components/About.jsx`.
6. **Testimonial slot** – currently a "Lab Log" from your GitHub goal. Swap for a
   real quote from a mentor/manager when you have one (`SITE.testimonial`).
