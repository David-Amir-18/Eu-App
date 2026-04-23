import { useNavigate } from 'react-router-dom'
import { Button } from '../components/index.js'
import { Field } from '../components/index.js'

export default function Home() {
  const navigate = useNavigate()

  return (
    <>

      {/* ── HERO ── */}
      <div className="min-h-screen flex justify-center items-center bg-neutral-100 px-8">
        <div className="max-w-2xl w-full flex flex-col items-center gap-8 text-center">
          <div className="w-12 h-[2px] bg-primary-900" />
          <h1 className="text-heading-h1 font-bold text-neutral-900 leading-tight tracking-tight">
            Take control of your health today
          </h1>
          <p className="text-body-md text-neutral-400 max-w-lg">
            EU brings together meal planning and workout guidance in one place, whether you're managing a chronic condition or simply want to feel better. Start building the life you deserve.
          </p>
          <Button variant="primary" size="lg">Begin</Button>
        </div>
      </div>


      {/* ── MEALS INTRO ── */}
      <div className="min-h-screen flex items-center justify-center bg-white py-24">
        <div className="max-w-6xl w-full px-8 flex flex-col gap-20">

          <div className="max-w-xl">
            <p className="text-body-sm font-semibold text-primary-400 uppercase tracking-widest mb-4">Nutrition</p>
            <h1 className="text-heading-h3 font-bold text-text-headings leading-tight">
              Meals built for your condition
            </h1>
            <p className="text-body-md text-text-body mt-4">
              Whether you're managing diabetes, heart disease, or simply following a diet, we build meals that fit your needs.
            </p>
          </div>

          <div className="flex gap-16 items-center">

            {/* Left: feature list */}
            <div className="flex flex-col gap-0 flex-1">
              {[
                {
                  title: 'Nutrition that works',
                  body: 'Eat right for your body. EU builds meals around your condition, not against it.',
                },
                {
                  title: 'Movement on your terms',
                  body: 'Move the way you need to move. Build strength, endurance, or just feel better in your own skin.',
                  accent: true,
                },
                {
                  title: 'Healing that sticks',
                  body: 'Heal from injury or fix what\'s been holding you back. Step-by-step guidance that actually works.',
                  accent: true,
                },
              ].map(({ title, body, accent }, i) => (
                <div key={i} className="flex gap-6 items-start py-8 border-b border-neutral-200 last:border-b-0 first:pt-0">
                  <span className="text-body-sm font-bold text-neutral-300 pt-1 w-6 flex-shrink-0 tabular-nums">
                    0{i + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className={`text-body-lg font-bold ${accent ? 'text-secondary-400' : 'text-text-headings'}`}>{title}</h3>
                    <p className={`text-body-sm ${accent ? 'text-secondary-300' : 'text-text-body'}`}>{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: image */}
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Healthy meal"
                className="w-full h-[480px] object-cover rounded-2xl shadow-lg"
              />
            </div>

          </div>
        </div>
      </div>


      {/* ── MEALS DESIGNED SECTION ── */}
      <div className="bg-neutral-50 py-24 px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-16">

          <div className="flex gap-16 items-end">
            <div className="flex-1">
              <p className="text-body-sm font-semibold text-primary-400 uppercase tracking-widest mb-4">Meal planning</p>
              <h2 className="text-heading-h3 font-bold text-text-headings leading-tight">
                Meals designed for your health
              </h2>
            </div>
            <div className="flex-1">
              <p className="text-body-md text-text-body">
                EU creates meal plans that account for your condition, your preferences, and what your body actually needs. No guessing. No generic diets that don't fit.
              </p>
            </div>
          </div>

          {/* 4-col photo mosaic */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', tall: true },
              { src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80', tall: false },
              { src: 'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=600&q=80', tall: true },
              { src: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80', tall: false },
            ].map(({ src }, i) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <img src={src} alt="" className="w-full h-44 object-cover" />
              </div>
            ))}
          </div>

        </div>
      </div>


      {/* ── REHAB ── */}
      <div className="bg-white py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-5 gap-6 min-h-[520px]">

          {/* Left big card */}
          <div className="col-span-3 bg-neutral-100 rounded-2xl p-12 flex flex-col justify-between">
            <div className="w-8 h-[2px] bg-primary-400" />
            <div className="flex flex-col gap-6">
              <h2 className="text-heading-h4 font-bold text-neutral-900 leading-tight">
                Rehabilitation built to restore your strength
              </h2>
              <p className="text-body-md text-neutral-400">
                Injury slows you down. A bad back stops you cold. HealthPlan Hub guides you through recovery with programs that work, whether you're healing from surgery or fixing posture that's held you back for years.
              </p>
              <div>
                <Button variant="primary" size="md">Start</Button>
              </div>
            </div>
          </div>

          {/* Right two cards stacked */}
          <div className="col-span-2 flex flex-col gap-6">
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col justify-center gap-3">
              <div className="w-6 h-[2px] bg-primary-400" />
              <h3 className="text-body-lg font-bold text-text-headings">
                Recover from injury
              </h3>
              <p className="text-body-sm text-text-body">
                Guided programs take you from pain to strength with exercises built for healing.
              </p>
            </div>
            <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col justify-center gap-3">
              <div className="w-6 h-[2px] bg-primary-400" />
              <h3 className="text-body-lg font-bold text-text-headings">
                Fix your posture
              </h3>
              <p className="text-body-sm text-text-body">
                Years of bad habits end here. Step-by-step corrections that stick and feel natural.
              </p>
            </div>
          </div>

        </div>
      </div>


      {/* ── WORKOUTS ── */}
      <div className="bg-neutral-50 py-24 px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-16">

          <div className="max-w-xl">
            <p className="text-body-sm font-semibold text-primary-400 uppercase tracking-widest mb-4">Training</p>
            <h1 className="text-heading-h3 font-bold text-text-headings leading-tight">
              Workouts that fit how you actually live
            </h1>
            <p className="text-body-md text-text-body mt-4">
              Build strength or maintain it. Run faster or just run. EU adapts to where you are now and takes you where you want to go, at your pace, on your schedule.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Strength training for real results', body: 'Build muscle and power at your own pace with programs that meet you where you are.', bg: 'bg-primary-600' },
              { title: 'Run longer, stronger, and smarter', body: 'Whether it\'s your first mile or your hundredth, we guide you forward without burning out.', bg: 'bg-primary-600' },
              { title: 'Move freely and feel the difference', body: 'Loosen tight muscles and improve your range of motion with routines that fit your schedule.', bg: 'bg-primary-600' },
            ].map(({ title, body, bg }, i) => (
              <div key={i} className={`${bg} rounded-2xl p-8 flex flex-col justify-end min-h-[300px]`}>
                <div className="w-6 h-[2px] bg-white/50 mb-6" />
                <h3 className="text-body-lg font-bold text-neutral-white mb-2">{title}</h3>
                <p className="text-body-sm text-neutral-white/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ── START JOURNEY ── */}
      <div className="bg-white py-24 px-8">
        <div className="max-w-6xl mx-auto flex gap-16 items-center">

          <div className="flex-1 flex flex-col gap-6">
            <div className="w-8 h-[2px] bg-primary-400" />
            <h2 className="text-heading-h1 font-bold text-text-headings leading-tight">
              Start your journey now
            </h2>
            <p className="text-body-md text-text-body max-w-md">
              Your workouts adapt to your body, your progress, and your lifestyle.
              No rigid plans. Just movement that makes sense for you.
            </p>
            <div>
              <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>Begin</Button>
            </div>
          </div>

          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
              alt="Workout"
              className="w-full h-[460px] object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>


      {/* ── QUESTIONS / CONTACT ── */}
      <div className="bg-neutral-100 py-24 px-8 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <div className="w-8 h-[2px] bg-primary-400 mx-auto" />
          <h1 className="text-heading-h2 font-bold text-neutral-900">
            Questions
          </h1>
          <p className="text-body-md text-neutral-400">
            Still wondering if EU is right for you? Check out our FAQs or reach out to our support team. We're here to help you take control of your health and wellness.
          </p>
          <div className="w-full h-[1px] bg-neutral-700 my-4" />
          <h2 className="text-heading-h4 font-bold text-neutral-900">
            Still have questions?
          </h2>
          <p className="text-body-md text-neutral-400">
            Reach out to our support team anytime.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/contact')}>
            Contact
          </Button>
        </div>
      </div>


      {/* ── NEWSLETTER ── */}
      <div className="bg-neutral-100 py-20 px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 flex gap-16 items-center">

          <div className="flex-1 flex flex-col gap-4">
            <div className="w-8 h-[2px] bg-primary-400" />
            <h3 className="text-heading-h3 font-bold text-text-headings">
              Get health tips weekly
            </h3>
            <p className="text-body-sm text-text-body max-w-sm">
              Subscribe for meal ideas, workout tips, and stories from people like you.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Field
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              required
            />
            <Button variant="primary" size="md" fullWidth>Subscribe</Button>
          </div>

        </div>
      </div>

    </>
  )
}