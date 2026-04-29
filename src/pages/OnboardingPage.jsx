import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms/Button'
import { Field } from '../components/atoms/Field'

const STEPS = ['welcome', 'age', 'weight', 'height', 'illness', 'done']
const METRIC_STEPS = ['age', 'weight', 'height', 'illness']

// Top branded header — same circle pattern as login/register mobile
function BrandedHeader({ step }) {
  const stepMeta = {
    welcome: { label: null },
    age:     { label: 'Step 1 of 4' },
    weight:  { label: 'Step 2 of 4' },
    height:  { label: 'Step 3 of 4' },
    illness: { label: 'Step 4 of 4' },
    done:    { label: null },
  }
  const { label } = stepMeta[step]

  return (
    <div className="relative overflow-hidden bg-surface-action px-8 pt-12 pb-28 flex flex-col gap-4">
      {/* Decorative circles */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary-500 opacity-40" />
      <div className="absolute -bottom-20 -right-12 w-72 h-72 rounded-full bg-primary-600 opacity-50" />
      <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-primary-300 opacity-10" />

      {/* Logo */}
      <div className="relative z-10">
        <span className="text-heading-h6 font-bold text-neutral-white tracking-tight">EU Health</span>
      </div>

      {/* Step label */}
      {label && (
        <div className="relative z-10">
          <p className="text-body-sm text-primary-200 font-semibold uppercase tracking-widest">{label}</p>
        </div>
      )}
    </div>
  )
}

function ProgressDots({ current }) {
  const currentIdx = METRIC_STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-2">
      {METRIC_STEPS.map((s, i) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all duration-300 ${
            i <= currentIdx ? 'w-6 bg-surface-action' : 'w-2 bg-border-primary'
          }`}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('welcome')
  const [form, setForm] = useState({ age: '', weight: '', height: '', illness: '' })
  const [error, setError] = useState('')

  function next() {
    setError('')
    setStep(STEPS[STEPS.indexOf(step) + 1])
  }

  function back() {
    setError('')
    setStep(STEPS[STEPS.indexOf(step) - 1])
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validateAndNext() {
    if (step === 'age') {
      const v = Number(form.age)
      if (!form.age || v < 10 || v > 120) { setError('Please enter a valid age between 10 and 120.'); return }
    }
    if (step === 'weight') {
      const v = Number(form.weight)
      if (!form.weight || v < 20 || v > 500) { setError('Please enter a valid weight in kg.'); return }
    }
    if (step === 'height') {
      const v = Number(form.height)
      if (!form.height || v < 50 || v > 300) { setError('Please enter a valid height in cm.'); return }
    }
    next()
  }

  function finish() {
    // TODO: send form data to backend when endpoint is ready
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">

      {/* Branded top */}
      <BrandedHeader step={step} />

      {/* Overlapping card */}
      <div className="relative z-10 -mt-12 mx-4 bg-surface-primary rounded-2xl shadow-2xl px-6 pt-8 pb-10 flex flex-col justify-center gap-6 flex-1 mb-6">

        <div className='flex justify-center p-8 md:p-0'>
             {/* ── Welcome ── */}
        {step === 'welcome' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="lg:text-heading-h3 text-heading-h3 font-bold text-text-headings mb-2">Welcome to EU Health</h1>
              <p className="text-body-md text-text-body">
                Let's set up your profile. It only takes a minute and helps us personalise your experience.
              </p>
            </div>
            
            <Button size=""  onClick={next} className="mt-2 w-50 ">
              Get started
            </Button>
          </div>
        )}

        {/* ── Age ── */}
        {step === 'age' && (
          <div className="flex flex-col gap-8">
            <ProgressDots current="age" />
            <div>
              <p className="text-body-sm text-text-disabled font-semibold uppercase tracking-widest mb-2">Step 1 of 4</p>
              <h2 className="text-heading-h3 font-bold text-text-headings mb-2">How old are you?</h2>
              <p className="text-body-md text-text-body">We use this to tailor workout and nutrition recommendations.</p>
            </div>
            <div className="flex items-end gap-3">
              <Field
                id="age" name="age" type="number" placeholder="e.g. 25"
                value={form.age} onChange={handleChange}
                error={!!error} errorMessage={error} className="flex-1"
              />
              <span className="text-body-lg text-text-disabled pb-2 shrink-0">years</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={validateAndNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Weight ── */}
        {step === 'weight' && (
          <div className="flex flex-col gap-8">
            <ProgressDots current="weight" />
            <div>
              <p className="text-body-sm text-text-disabled font-semibold uppercase tracking-widest mb-2">Step 2 of 4</p>
              <h2 className="text-heading-h3 font-bold text-text-headings mb-2">What's your weight?</h2>
              <p className="text-body-md text-text-body">Used to calculate your daily calorie needs and track progress.</p>
            </div>
            <div className="flex items-end gap-3">
              <Field
                id="weight" name="weight" type="number" placeholder="e.g. 70"
                value={form.weight} onChange={handleChange}
                error={!!error} errorMessage={error} className="flex-1"
              />
              <span className="text-body-lg text-text-disabled pb-2 shrink-0">kg</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={validateAndNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Height ── */}
        {step === 'height' && (
          <div className="flex flex-col gap-8">
            <ProgressDots current="height" />
            <div>
              <p className="text-body-sm text-text-disabled font-semibold uppercase tracking-widest mb-2">Step 3 of 4</p>
              <h2 className="text-heading-h3 font-bold text-text-headings mb-2">How tall are you?</h2>
              <p className="text-body-md text-text-body">Helps us calculate your BMI and set realistic fitness goals.</p>
            </div>
            <div className="flex items-end gap-3">
              <Field
                id="height" name="height" type="number" placeholder="e.g. 175"
                value={form.height} onChange={handleChange}
                error={!!error} errorMessage={error} className="flex-1"
              />
              <span className="text-body-lg text-text-disabled pb-2 shrink-0">cm</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={validateAndNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Illness ── */}
        {step === 'illness' && (
          <div className="flex flex-col gap-8">
            <ProgressDots current="illness" />
            <div>
              <p className="text-body-sm text-text-disabled font-semibold uppercase tracking-widest mb-2">Step 4 of 4</p>
              <h2 className="text-heading-h3 font-bold text-text-headings mb-2">Any health conditions?</h2>
              <p className="text-body-md text-text-body">
                Completely optional — helps us adjust recommendations for you.
              </p>
            </div>
            <Field
              id="illness" name="illness"
              placeholder="e.g. diabetes, hypertension, asthma..."
              helperText="Optional — leave blank if none"
              value={form.illness} onChange={handleChange}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={next} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-heading-h3 font-bold text-text-headings mb-2">You're all set!</h2>
              <p className="text-body-md text-text-body">Your profile is ready. Here's a summary:</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Age', value: `${form.age} years` },
                { label: 'Weight', value: `${form.weight} kg` },
                { label: 'Height', value: `${form.height} cm` },
                { label: 'Health conditions', value: form.illness || 'None' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100">
                  <span className="text-body-sm text-text-disabled font-semibold">{label}</span>
                  <span className="text-body-md text-text-headings font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <Button size="lg" fullWidth onClick={finish} className="mt-2">
              Go to dashboard
            </Button>
          </div>
        )}
        </div>

       

      </div>
    </div>
  )
}
