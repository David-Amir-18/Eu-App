import { useState } from 'react'
import { Link } from 'react-router-dom'

// ── Custom Icons ────────────────────────────────────────────────────────────────
function IconBook({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
function IconDumbbell({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" />
    </svg>
  )
}
function IconLock({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}
function IconChart({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconUtensils({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v9" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      <path d="M12 15v7" />
    </svg>
  )
}
function IconUser({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

const FAQ_ITEMS = [
  {
    q: "How does the dynamic nutrition tracking work?",
    a: "Our backend processes your macronutrients in real-time. When you consume a meal from your dashboard, your caloric pool shrinks instantly and adjusts recommended target guidelines relative to your registered onboarding profile metrics."
  },
  {
    q: "Can I physically customize or add custom exercises to active plans?",
    a: "Absolutely! You can build highly specialized workout routines under the 'Plans' tab and populate them with a tailored mix of system-seeded catalog movements or customized personal data entries."
  },
  {
    q: "How do I update my primary bodyweight metrics or fitness goal?",
    a: "Head over to the 'Account' registry inside the sidebar. There, you can physically re-submit metric configurations which instantly forces the system to re-calculate your daily tracking targets and recommend new dietary slots."
  }
]

export default function Help() {
  const [recommendation, setRecommendation] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  const handleRecommendationSubmit = (e) => {
    e.preventDefault()
    if (!recommendation.trim()) return
    setSubmitted(true)
    setRecommendation('')

    // Auto-reset success state after 4 seconds
    setTimeout(() => setSubmitted(false), 4000)
  }

  const handleFaqToggle = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx)
  }

  return (
    <div className="w-full min-h-screen bg-neutral-50 flex flex-col">
      {/* ── HERO SECTION ── */}
      <div className="relative w-full bg-[#1A2E3B] text-white py-16 px-8 overflow-hidden shadow-lg shrink-0">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-primary-400 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-body-sm font-semibold tracking-wide text-blue-200">
            EU HEALTH SUPPORT CENTER
          </div>
          <h1 className="text-heading-h3 md:text-heading-h2 font-bold text-white tracking-tight leading-tight">
            How can we accelerate your journey today?
          </h1>
          <p className="text-body-lg text-neutral-200 max-w-2xl">
            Suggest new feature recommendations to enhance your overall application experience.
          </p>

          {/* Sleek Recommendation Input Widget */}
          <div className="w-full max-w-xl mt-2">
            {submitted ? (
              <div className="w-full p-4 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl text-emerald-300 font-bold text-body-sm flex items-center justify-center gap-2 animate-fade-in shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Thank you! Your recommendation has been submitted.
              </div>
            ) : (
              <form onSubmit={handleRecommendationSubmit} className="w-full flex items-center bg-white rounded-2xl shadow-xl shadow-black/10 border border-neutral-200 p-1.5 transition-all focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  required
                  placeholder="Write your recommendation or feature request..."
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="flex-1 px-4 py-3 text-text-headings text-body-md font-semibold outline-none bg-transparent placeholder:text-text-disabled"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#1A2E3B] hover:bg-[#2B4150] text-white font-bold text-body-sm px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 duration-200"
                >
                  Share


                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── CORE PAGE CONTENT ── */}
      <div className="w-full max-w-6xl mx-auto px-8 py-12 flex flex-col gap-16">

        {/* Section 1: Quick Articles */}
        <section className="flex flex-col gap-6">
          <h2 className="text-heading-h5 font-bold text-text-headings">Core Knowledge Libraries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <Link to="/workouts" className="bg-white border border-border-primary p-6 rounded-2xl flex flex-col gap-4 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group text-left">
              <div className="w-12 h-12 rounded-xl bg-workout-prim-100 flex items-center justify-center group-hover:bg-workout-prim-200 transition-colors">
                <IconDumbbell className="w-6 h-6 text-workout-prim" />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-text-headings mb-1">Workout Logs</h3>
                <p className="text-body-sm text-text-body">Customize your active routines, record physical lifting sets, and track training frequency.</p>
              </div>
            </Link>

            <Link to="/meals" className="bg-white border border-border-primary p-6 rounded-2xl flex flex-col gap-4 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group text-left">
              <div className="w-12 h-12 rounded-xl bg-meals-prim-100 flex items-center justify-center group-hover:bg-meals-prim-200 transition-colors">
                <IconUtensils className="w-6 h-6 text-meals-prim" />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-text-headings mb-1">Meal Registries</h3>
                <p className="text-body-sm text-text-body">Search high-protein food catalogs, log dynamic nutrition inputs, and hit daily caloric pools.</p>
              </div>
            </Link>

            <div className="bg-white border border-border-primary p-6 rounded-2xl flex flex-col gap-4 shadow-xs opacity-80 cursor-default">
              <div className="w-12 h-12 rounded-xl bg-rehab-prim-100 flex items-center justify-center">
                <IconBook className="w-6 h-6 text-rehab-prim" />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-text-headings mb-1">Rehab Protocols</h3>
                <p className="text-body-sm text-text-body">Access targeted physiotherapeutic regimes, restorative exercises, and injury prevention limits.</p>
              </div>
            </div>

            <Link to="/profile" className="bg-white border border-border-primary p-6 rounded-2xl flex flex-col gap-4 shadow-xs hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group text-left">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <IconUser className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-body-md font-bold text-text-headings mb-1">Account Profile</h3>
                <p className="text-body-sm text-text-body">Revise physical objective metrics, configure security thresholds, and modify health guidelines.</p>
              </div>
            </Link>

          </div>
        </section>

        {/* Section 2: Interactive FAQ Accordion */}
        <section className="flex flex-col gap-6 max-w-3xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-heading-h5 font-bold text-text-headings">Frequently Asked Questions</h2>
            <p className="text-body-sm text-text-disabled font-medium">Select a core query sequence to view optimized technical guidance.</p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div key={idx} className="border border-border-primary rounded-xl bg-white shadow-xs overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => handleFaqToggle(idx)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-neutral-50 transition-colors group"
                  >
                    <span className="text-body-md font-bold text-text-headings group-hover:text-primary-600 transition-colors">{faq.q}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-5 h-5 text-text-disabled transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 opacity-100 border-t border-border-primary' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5 bg-neutral-50 text-body-sm text-text-body leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 3: Premium Contact CTA Bar */}
        <section className="mt-4 bg-[#1A2E3B] text-white rounded-3xl overflow-hidden shadow-xl relative">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />

          <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col gap-2 max-w-xl">
              <h3 className="text-heading-h5 font-bold text-white tracking-tight">
                Still need specialized assistance?
              </h3>
              <p className="text-body-sm text-blue-100 leading-relaxed">
                If our automated knowledge base libraries didn't address your questions, click the button to launch an official message directly to our dispatch team.
              </p>
            </div>

            <Link
              to="/contact"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 font-bold text-body-md text-[#1A2E3B] bg-white hover:bg-neutral-100 transition-all rounded-2xl shadow-md hover:shadow-xl group hover:-translate-y-0.5 duration-200"
            >
              Contact Support
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
