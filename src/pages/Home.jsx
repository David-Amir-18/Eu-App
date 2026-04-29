import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '../components/index.js'
import { Field } from '../components/index.js'

gsap.registerPlugin(ScrollTrigger)

// ── Section: Hero ──────────────────────────────────────────────
const STRIPE_DATA = [
  {h:22,  offset:0,   z:1,  bg:'rgba(0,20,35,0.15)',    border:'rgba(191,222,224,0.06)', shadow:'none'},
  {h:32,  offset:16,  z:2,  bg:'rgba(0,31,47,0.22)',    border:'rgba(191,222,224,0.10)', shadow:'0 4px 12px rgba(0,0,0,0.4)'},
  {h:44,  offset:30,  z:3,  bg:'rgba(0,62,95,0.28)',    border:'rgba(191,222,224,0.14)', shadow:'0 6px 18px rgba(0,0,0,0.45)'},
  {h:58,  offset:42,  z:4,  bg:'rgba(0,93,142,0.32)',   border:'rgba(128,190,223,0.22)', shadow:'0 8px 24px rgba(0,0,0,0.5)'},
  {h:44,  offset:56,  z:3,  bg:'rgba(0,62,95,0.28)',    border:'rgba(191,222,224,0.18)', shadow:'0 6px 18px rgba(0,0,0,0.4)'},
  {h:100, offset:64,  z:6,  bg:'rgba(0,124,190,0.28)',  border:'rgba(128,190,223,0.28)', shadow:'0 10px 32px rgba(0,0,0,0.55)'},
  {h:16,  offset:148, z:7,  bg:'rgba(191,222,224,0.22)',border:'rgba(191,222,224,0.5)',  shadow:'0 2px 8px rgba(0,0,0,0.3)'},
  {h:120, offset:142, z:8,  bg:'rgba(64,157,206,0.25)', border:'rgba(191,222,224,0.30)', shadow:'0 12px 40px rgba(0,0,0,0.6)'},
  {h:16,  offset:248, z:9,  bg:'rgba(191,222,224,0.20)',border:'rgba(191,222,224,0.45)', shadow:'0 2px 8px rgba(0,0,0,0.3)'},
  {h:90,  offset:240, z:7,  bg:'rgba(0,124,190,0.22)',  border:'rgba(128,190,223,0.24)', shadow:'0 8px 28px rgba(0,0,0,0.5)'},
  {h:58,  offset:314, z:5,  bg:'rgba(0,93,142,0.26)',   border:'rgba(128,190,223,0.18)', shadow:'0 6px 20px rgba(0,0,0,0.45)'},
  {h:38,  offset:344, z:3,  bg:'rgba(0,62,95,0.24)',    border:'rgba(191,222,224,0.13)', shadow:'0 4px 14px rgba(0,0,0,0.4)'},
  {h:26,  offset:368, z:2,  bg:'rgba(0,31,47,0.20)',    border:'rgba(191,222,224,0.09)', shadow:'0 3px 10px rgba(0,0,0,0.35)'},
  {h:16,  offset:386, z:1,  bg:'rgba(0,31,47,0.14)',    border:'rgba(191,222,224,0.06)', shadow:'none'},
]

const maxBottom = Math.max(...STRIPE_DATA.map(d => d.offset + d.h))

function Hero({ navigate }) {
  const heroRef  = useRef(null)
  const canvasRef = useRef(null)
  const mouse    = useRef({ x: -9999, y: -9999 })
  const cur      = useRef(0)
  const rafRef   = useRef(null)
  const stripeEls = useRef([])

  useEffect(() => {
    const hero   = heroRef.current
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    function resize() {
      canvas.width  = hero.clientWidth
      canvas.height = hero.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function lerp(a, b, t) { return a + (b - a) * t }

    function getRotatedCorners(el, heroRect) {
      const r   = el.getBoundingClientRect()
      const ang = 38 * Math.PI / 180
      const cos = Math.cos(ang), sin = Math.sin(ang)
      const scx = r.left + r.width  / 2
      const scy = r.top  + r.height / 2
      const hw  = el.offsetWidth  / 2
      const hh  = el.offsetHeight / 2
      return [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([lx,ly]) => [
        scx + lx*cos - ly*sin - heroRect.left,
        scy + lx*sin + ly*cos - heroRect.top,
      ])
    }

    function pointInPoly(px, py, corners) {
      for (let i = 0; i < corners.length; i++) {
        const [ax,ay] = corners[i], [bx,by] = corners[(i+1) % corners.length]
        if ((bx-ax)*(py-ay) - (by-ay)*(px-ax) < 0) return false
      }
      return true
    }

    // ── GSAP finger-swipe ──
    const PUSH_AMOUNT = 14
    const INFLUENCE   = 4
    let lastHoveredIdx = -2  // -2 = uninitialized

    function nudgeStripes(idx) {
      if (idx === lastHoveredIdx) return
      lastHoveredIdx = idx
      const els = stripeEls.current.filter(Boolean)
      els.forEach((el, i) => {
        const dist = idx === -1 ? Infinity : Math.abs(i - idx)
        if (dist > INFLUENCE) {
          gsap.to(el, { y: 0, duration: 0.5, ease: 'power2.out' })
        } else {
          const falloff = Math.cos((dist / (INFLUENCE + 1)) * Math.PI * 0.5)
          gsap.to(el, { y: PUSH_AMOUNT * falloff, duration: 0.3, ease: 'power2.out' })
        }
      })
    }

    // ── Canvas glow rAF loop ──
    function frame() {
      rafRef.current = requestAnimationFrame(frame)
      const hr  = hero.getBoundingClientRect()
      const els = stripeEls.current.filter(Boolean)
      const allCorners = els.map(el => getRotatedCorners(el, hr))
      const lx  = mouse.current.x - hr.left
      const ly  = mouse.current.y - hr.top
      const hit = allCorners.some(c => pointInPoly(lx, ly, c))
      const tar = hit ? 1 : 0
      cur.current = lerp(cur.current, tar, 0.1)

      // Find closest stripe by centroid distance — always, not just on hit
      let closestIdx = -1
      let minDist = Infinity
      allCorners.forEach((corners, i) => {
        const cx = (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4
        const cy = (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4
        const d  = Math.hypot(lx - cx, ly - cy)
        if (d < minDist) { minDist = d; closestIdx = i }
      })
      nudgeStripes(minDist < 250 ? closestIdx : -1)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (cur.current < 0.005) return

      ctx.save()
      ctx.beginPath()
      allCorners.forEach(corners => {
        ctx.moveTo(corners[0][0], corners[0][1])
        corners.slice(1).forEach(([x,y]) => ctx.lineTo(x, y))
        ctx.closePath()
      })
      ctx.clip()

      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 380)
      g.addColorStop(0,    `rgba(220,240,242,${0.95 * cur.current})`)
      g.addColorStop(0.12, `rgba(191,222,224,${0.8  * cur.current})`)
      g.addColorStop(0.3,  `rgba(128,190,223,${0.55 * cur.current})`)
      g.addColorStop(0.55, `rgba(0,124,190,  ${0.3  * cur.current})`)
      g.addColorStop(0.8,  `rgba(0,93,142,   ${0.1  * cur.current})`)
      g.addColorStop(1,    `rgba(0,31,47,    0)`)

      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
    }

    frame()

    function onMove(e) { mouse.current = { x: e.clientX, y: e.clientY } }
    function onLeave() { mouse.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{ background: '#001f2f' }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
        }}
      />

      {/* Canvas for mouse glow */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 3, display: 'block' }}
      />

      {/* Stripe wrapper — rotated 38deg, centered */}
      <div
        className="absolute"
        style={{
          top: '-5%',
          left: '65%',
          width: '180%',
          transform: 'translate(-50%, 0) rotate(38deg)',
          height: (maxBottom + 20) + 'px',
          zIndex: 1,
        }}
      >
        {STRIPE_DATA.map((d, i) => (
          <div
            key={i}
            ref={el => stripeEls.current[i] = el}
            style={{
              position: 'absolute',
              left: 0, right: 0,
              top: d.offset + 'px',
              height: d.h + 'px',
              borderRadius: '5px',
              zIndex: d.z,
            }}
          >
            {/* Backdrop blur layer */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '5px',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 0,
            }} />
            {/* Face */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '5px',
              background: d.bg,
              border: `0.5px solid ${d.border}`,
              boxShadow: `${d.shadow}, inset 0 1px 0 rgba(191,222,224,0.28), inset 0 -1px 0 rgba(0,0,0,0.2)`,
              zIndex: 1,
            }} />
            {/* Shine line */}
            <div style={{
              position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(191,222,224,0.85), transparent)',
              zIndex: 2, borderRadius: '1px',
            }} />
            {/* Depth shadow */}
            <div style={{
              position: 'absolute', bottom: '-3px', left: '2%', right: '2%', height: '3px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent)',
              zIndex: 3, borderRadius: '0 0 4px 4px',
            }} />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative pl-[5%]" style={{ zIndex: 5 }}>
        <h1
          className="font-bold text-neutral-100 m-0 mb-2"
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
        >
          Take control of your health today
        </h1>
        <p
          style={{
            fontSize: 'clamp(0.8rem, 1.3vw, 1rem)',
            color: '#bfdee0',
            lineHeight: 1.5,
            margin: 0,
            fontFamily: "'Helvetica Neue', sans-serif",
          }}
        >
          Meal planning and workout guidance — all in one place.
        </p>
      </div>
    </section>
  )
}

// ── Section: Pinned scroll feature ─────────────────────────────
const FEATURE_ITEMS = [
  {
    label: 'Nutrition that works',
    desc: 'Eat right for your body. EU builds meals around your condition, not against it. Every meal is tailored to your health needs.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Movement on your terms',
    desc: 'Move the way you need to move. Build strength, endurance, or just feel better in your own skin — at your own pace.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Healing that sticks',
    desc: 'Heal from injury or fix what\'s been holding you back. Step-by-step guidance that actually works and lasts.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  },
]

function PinnedFeature() {
  const sectionRef = useRef(null)
  const stickyRef  = useRef(null)
  const imgRefs    = useRef([])
  const paraRefs   = useRef([])

  useEffect(() => {
    const section = sectionRef.current

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: stickyRef.current,
      pinSpacing: false,
    })

    // 400vh total: items at 0-100, 100-200, 200-300, buffer 300-400
    // Each item gets exactly 100vh dwell time
    const N = FEATURE_ITEMS.length
    FEATURE_ITEMS.forEach((_, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: `${(i * 25)}% top`,
        end:   `${((i + 1) * 25)}% top`,
        onEnter:     () => activate(i),
        onEnterBack: () => activate(i),
      })
    })

    function activate(idx) {
      // Images: crossfade
      imgRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, { opacity: i === idx ? 1 : 0, duration: 0.6, ease: 'power2.inOut' })
      })
      // Paragraphs: opacity + color only — no font-weight change to avoid layout shift
      paraRefs.current.forEach((el, i) => {
        if (!el) return
        const labelEl = el.querySelector('.feat-label')
        const descEl  = el.querySelector('.feat-desc')
        const barEl   = el.querySelector('.feat-bar')
        gsap.to(el,      { opacity: i === idx ? 1 : 0.35, duration: 0.5, ease: 'power2.inOut' })
        gsap.to(labelEl, { color: i === idx ? '#007cbe' : '#1a1a2c', duration: 0.5 })
        gsap.to(barEl,   { scaleY: i === idx ? 1 : 0, opacity: i === idx ? 1 : 0, duration: 0.4, ease: 'power2.out' })
      })
    }

    // Set initial state
    activate(0)

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    // Tall section — 300vh gives scroll room for 3 items
    <section ref={sectionRef} className="relative bg-surface-page" style={{ height: '400vh' }}>

      {/* Sticky panel */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen flex items-center px-8 lg:px-24 gap-16"
      >
        {/* Left: text */}
        <div className="flex-1 flex flex-col gap-8">
          <h2 className="text-heading-h2 font-bold text-text-headings leading-tight">
            Meals built for your condition
          </h2>
          <div className="flex flex-col gap-6">
            {FEATURE_ITEMS.map(({ label, desc }, i) => (
              <div
                key={label}
                ref={el => paraRefs.current[i] = el}
                className="flex gap-4 items-start"
                style={{ opacity: i === 0 ? 1 : 0.35 }}
              >
                {/* Left accent bar — primary color when active, secondary when not */}
                <div
                  className="feat-bar shrink-0 w-1 rounded-full bg-secondary-400 mt-1"
                  style={{
                    height: '100%',
                    minHeight: '48px',
                    transformOrigin: 'top',
                    transform: i === 0 ? 'scaleY(1)' : 'scaleY(0)',
                    opacity: i === 0 ? 1 : 0,
                    background: '#007cbe',
                  }}
                />
                <div>
                  <p className="feat-label text-body-lg font-semibold mb-1"
                    style={{ color: i === 0 ? '#007cbe' : '#1a1a2c' }}>
                    {label}
                  </p>
                  <p className="feat-desc text-body-md text-text-body">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: images stacked */}
        <div className="flex-1 relative h-[480px]">
          {FEATURE_ITEMS.map(({ image, label }, i) => (
            <img
              key={label}
              ref={el => imgRefs.current[i] = el}
              src={image}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-xl"
              style={{ opacity: i === 0 ? 1 : 0 }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section: Infinite marquee ──────────────────────────────────
const ROW1_IMAGES = [
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
]
const ROW2_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80',
]

function MarqueeRow({ images, baseSpeed, sectionRef, rowRef }) {
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const totalW = row.scrollWidth / 2  // half because we duplicate
    let x = 0
    let lastScroll = window.scrollY
    let direction = baseSpeed > 0 ? 1 : -1
    let rafId

    function tick() {
      const currentScroll = window.scrollY
      const delta = currentScroll - lastScroll
      // Reverse direction based on scroll direction
      if (delta > 0) direction = baseSpeed > 0 ? 1 : -1
      if (delta < 0) direction = baseSpeed > 0 ? -1 : 1
      lastScroll = currentScroll

      x += Math.abs(baseSpeed) * direction
      // Loop seamlessly
      if (x > 0) x -= totalW
      if (x < -totalW) x += totalW

      row.style.transform = `translateX(${x}px)`
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Duplicate images for seamless loop
  const doubled = [...images, ...images]

  return (
    <div className="overflow-hidden">
      <div ref={rowRef} className="flex gap-4 w-max">
        {doubled.map((src, i) => (
          <div key={i} className="shrink-0 w-72 h-48 rounded-xl overflow-hidden ring-1 ring-primary-600">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

function InfiniteMarquee() {
  const sectionRef = useRef(null)
  const row1Ref    = useRef(null)
  const row2Ref    = useRef(null)

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24" style={{ background: '#001f2f' }}>

      {/* Decorative circles */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary-600 opacity-40 pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[32rem] h-[32rem] rounded-full bg-primary-500 opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-300 opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 px-8 lg:px-24 mb-12">
        <div className="flex-1">
          <p className="text-body-sm text-primary-300 font-semibold uppercase tracking-widest mb-2">Nutrition</p>
          <h2 className="text-heading-h2 font-bold text-neutral-white leading-tight">
            Meals designed for your health
          </h2>
        </div>
        <div className="flex-1 flex items-center">
          <p className="text-body-md text-primary-100 max-w-md">
            EU creates meal plans that account for your condition, your preferences, and what your body actually needs. No guessing. No generic diets that don't fit.
          </p>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative z-10 mb-4">
        <MarqueeRow images={ROW1_IMAGES} baseSpeed={0.6} sectionRef={sectionRef} rowRef={row1Ref} />
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative z-10">
        <MarqueeRow images={ROW2_IMAGES} baseSpeed={-0.6} sectionRef={sectionRef} rowRef={row2Ref} />
      </div>
    </section>
  )
}

// ── Section: Rehab bento ────────────────────────────────────────
function RehabBento() {
  return (
    <section className="px-8 lg:px-24 py-24 bg-surface-page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

        {/* Big card */}
        <div className="lg:row-span-2 relative overflow-hidden bg-surface-action rounded-2xl p-10 flex flex-col justify-between">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-500 opacity-30" />
          <div className="absolute -bottom-20 -left-12 w-72 h-72 rounded-full bg-primary-600 opacity-40" />

          <div className="relative z-10">
            <p className="text-body-sm text-primary-200 font-semibold uppercase tracking-widest mb-4">Rehabilitation</p>
            <h2 className="text-heading-h3 font-bold text-neutral-white leading-tight">
              Rehabilitation built to restore your strength
            </h2>
          </div>

          <div className="relative z-10 flex flex-col gap-4">
            <p className="text-body-md text-primary-100">
              Injury slows you down. A bad back stops you cold. EU guides you through recovery with programs that work.
            </p>
            <div className="self-start">
              <Button variant="secondary" size="md">Start recovering</Button>
            </div>
          </div>
        </div>

        {/* Small card 1 */}
        <div className="bg-neutral-100 rounded-2xl p-8 flex flex-col gap-3 border border-border-primary">
          <h3 className="text-body-lg font-semibold text-text-headings">Recover from injury</h3>
          <p className="text-body-sm text-text-body">
            Guided programs take you from pain to strength with exercises built for healing.
          </p>
        </div>

        {/* Small card 2 */}
        <div className="bg-neutral-100 rounded-2xl p-8 flex flex-col gap-3 border border-border-primary">
          <h3 className="text-body-lg font-semibold text-text-headings">Fix your posture</h3>
          <p className="text-body-sm text-text-body">
            Years of bad habits end here. Step-by-step corrections that stick and feel natural.
          </p>
        </div>

      </div>
    </section>
  )
}

// ── Section: CTA ────────────────────────────────────────────────
function CTA({ navigate }) {
  return (
    <section className="min-h-[60vh] flex items-center px-8 lg:px-24 py-24 bg-neutral-100">
      <div className="flex flex-col lg:flex-row gap-16 w-full items-center">

        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-heading-h1 font-bold text-text-headings leading-tight">
            Start your journey now
          </h2>
          <p className="text-body-lg text-text-body max-w-lg">
            Your workouts adapt to your body, your progress, and your lifestyle. No rigid plans. Just movement that makes sense for you.
          </p>
          <div className="self-start">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
              Begin
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"
            alt="Workout"
            className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}

// ── Section: FAQ ────────────────────────────────────────────────
function FAQ({ navigate }) {
  return (
    <section className="px-8 lg:px-24 py-24 bg-surface-page flex flex-col gap-12 items-center text-center">
      <div className="flex flex-col gap-4 max-w-2xl">
        <h2 className="text-heading-h2 font-bold text-text-headings">Questions</h2>
        <p className="text-body-lg text-text-body">
          Still wondering if EU is right for you? Check out our FAQs or reach out to our support team.
        </p>
      </div>
      <div className="flex flex-col gap-4 max-w-xl">
        <h3 className="text-heading-h5 font-bold text-text-headings">Still have questions?</h3>
        <p className="text-body-md text-text-body">Reach out to our support team anytime.</p>
        <div className="self-center">
          <Button variant="outline" size="md" onClick={() => navigate('/contact')}>
            Contact us
          </Button>
        </div>
      </div>
    </section>
  )
}

// ── Section: Newsletter ─────────────────────────────────────────
function Newsletter() {
  return (
    <section className="relative overflow-hidden bg-surface-action px-8 lg:px-24 py-20">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-500 opacity-30" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-600 opacity-40" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-heading-h3 font-bold text-neutral-white">Get health tips weekly</h2>
          <p className="text-body-md text-primary-100 max-w-md">
            Subscribe for meal ideas, workout tips, and stories from people like you.
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 w-full max-w-md">
          <Field
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="bg-surface-primary"
          />
          <Button variant="secondary" size="lg" fullWidth>Subscribe</Button>
        </div>
      </div>
    </section>
  )
}

// ── Footer ──────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-neutral-700 px-8 lg:px-24 py-10 flex items-center justify-between">
      <span className="text-heading-h6 font-bold text-neutral-white">EU Health</span>
      <p className="text-body-sm text-neutral-400">© 2026 EU Health & Fitness. All rights reserved.</p>
    </footer>
  )
}

// ── Page ────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <Hero navigate={navigate} />

      <PinnedFeature />

      <InfiniteMarquee />

      <RehabBento />

      <CTA navigate={navigate} />

      <FAQ navigate={navigate} />

      <Newsletter />

      <Footer />
    </>
  )
}