import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/atoms/Button.jsx'
import { DefinedField } from '../components/molecules/DefinedField.jsx'
import { saveUserMetrics } from '../api/authService.js'
import { getConditions, setMyCondition } from '../api/rehabService.js'
import { useAuth } from '../context/AuthContext.jsx'

// ── Option generators ──────────────────────────────────────────────────────────

function range(start, end, step = 1) {
  const result = []
  for (let i = start; i <= end; i += step) result.push(i)
  return result
}

const AGE_OPTIONS = range(5, 100).map((v) => ({ value: String(v), label: `${v} years` }))
const WEIGHT_OPTIONS = range(20, 300, 0.5).map((v) => ({
  value: String(v),
  label: `${v} kg`,
}))
const HEIGHT_OPTIONS = range(50, 280).map((v) => ({ value: String(v), label: `${v} cm` }))

const GENDER_OPTIONS = [
  { value: 'male',   label: '  Male' },
  { value: 'female', label: '  Female' },
]

const PRIMARY_GOAL_OPTIONS = [
  { value: 'general',      label: '  General Fitness' },
  { value: 'weight_loss',  label: '  Weight Loss' },
  { value: 'muscle_gain',  label: '  Muscle Gain' },
  { value: 'rehab',        label: '  Rehabilitation' },
]

const FITNESS_LEVEL_OPTIONS = [
  { value: 'Beginner',     label: '  Beginner' },
  { value: 'Intermediate', label: ' Intermediate' },
  { value: 'Advanced',     label: '  Advanced' },
]

const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'Sedentary',          label: '  Sedentary (desk job / no exercise)' },
  { value: 'Lightly Active',     label: '  Lightly Active (1–3 days/week)' },
  { value: 'Moderately Active',  label: '  Moderately Active (3–5 days/week)' },
  { value: 'Very Active',        label: '  Very Active (6–7 days/week)' },
  { value: 'Extra Active',       label: '  Extra Active (athlete / physical job)' },
]

const CALORIE_OPTIONS = [
  { value: '', label: 'Let the app calculate it for me' },
  ...range(1000, 4000, 100).map((v) => ({ value: String(v), label: `${v} kcal / day` })),
]

const RECOVERY_STAGE_OPTIONS = [
  { value: '',          label: 'Not applicable' },
  { value: 'acute',     label: '  Acute (first 0–6 weeks)' },
  { value: 'sub-acute', label: '  Sub-acute (6 weeks – 3 months)' },
  { value: 'chronic',   label: '  Chronic (3+ months)' },
]

const INJURY_DETAIL_OPTIONS = [
  { value: '',                    label: 'No specific injury details' },
  { value: 'Lower back pain',     label: '  Lower Back Pain' },
  { value: 'Knee injury',         label: '  Knee Injury' },
  { value: 'Shoulder injury',     label: '  Shoulder Injury' },
  { value: 'Hip injury',          label: '  Hip Injury' },
  { value: 'Ankle/foot injury',   label: '  Ankle / Foot Injury' },
  { value: 'Neck pain',           label: '  Neck Pain' },
  { value: 'Post-surgery rehab',  label: '  Post-Surgery Rehab' },
  { value: 'Chronic fatigue',     label: '  Chronic Fatigue' },
  { value: 'Other',               label: '  Other' },
]

const DIET_NOTES_OPTIONS = [
  { value: '',             label: 'No dietary restrictions' },
  { value: 'Vegetarian',  label: '  Vegetarian' },
  { value: 'Vegan',       label: '  Vegan' },
  { value: 'Gluten-free', label: '  Gluten-Free' },
  { value: 'Dairy-free',  label: '  Dairy-Free' },
  { value: 'Diabetic',    label: '  Diabetic Diet' },
  { value: 'Low sodium',  label: '  Low Sodium' },
  { value: 'Low fat',     label: '  Low Fat' },
  { value: 'High protein',label: '  High Protein' },
  { value: 'Keto',        label: '  Keto' },
  { value: 'Intermittent fasting', label: '  Intermittent Fasting' },
]

// ── Step definitions ──────────────────────────────────────────────────────────

const STEPS = [
  'welcome',
  'basics',        // gender + age
  'body',          // weight + height
  'goals',         // primary_goal + fitness_level + activity_level
  'nutrition',     // daily_calorie_target + medical_diet_notes
  'rehab',         // illness (condition) + recovery_stage + injury_details
  'done',
]

const PROGRESS_STEPS = ['basics', 'body', 'goals', 'nutrition', 'rehab']

// ── Sub-components ────────────────────────────────────────────────────────────

function BrandedHeader({ step }) {
  const meta = {
    welcome:   { label: null },
    basics:    { label: 'Step 1 of 5  Personal Info' },
    body:      { label: 'Step 2 of 5  Body Metrics' },
    goals:     { label: 'Step 3 of 5  Your Goals' },
    nutrition: { label: 'Step 4 of 5  Nutrition' },
    rehab:     { label: 'Step 5 of 5  Rehab & Medical' },
    done:      { label: null },
  }
  const { label } = meta[step] || { label: null }

  return (
    <div className="relative overflow-hidden bg-surface-action px-8 pt-12 pb-28 flex flex-col gap-4">
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary-500 opacity-40" />
      <div className="absolute -bottom-20 -right-12 w-72 h-72 rounded-full bg-primary-600 opacity-50" />
      <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-primary-300 opacity-10" />
      <div className="relative z-10">
        <span className="text-heading-h6 font-bold text-neutral-white tracking-tight">EU Health</span>
      </div>
      {label && (
        <div className="relative z-10">
          <p className="text-body-sm text-primary-200 font-semibold uppercase tracking-widest">{label}</p>
        </div>
      )}
    </div>
  )
}

function ProgressDots({ current }) {
  const currentIdx = PROGRESS_STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-2">
      {PROGRESS_STEPS.map((s, i) => (
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

function StepHeader({ step, title, subtitle }) {
  return (
    <div>
      <ProgressDots current={step} />
      <h2 className="text-heading-h3 font-bold text-text-headings mt-4 mb-1">{title}</h2>
      {subtitle && <p className="text-body-md text-text-body">{subtitle}</p>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState('welcome')
  const [form, setForm] = useState({
    gender:               '',
    age:                  '',
    weight:               '',
    height:               '',
    primary_goal:         '',
    fitness_level:        '',
    activity_level:       '',
    daily_calorie_target: '',
    autoCalorie:          true,
    medical_diet_notes:   '',
    illness:              '',      // condition UUID
    recovery_stage:       '',
    injury_details:       '',
  })
  const [error, setError]       = useState('')
  const [conditions, setConditions] = useState([])
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    getConditions().then((data) => setConditions(data || [])).catch(() => {})
  }, [])

  // Condition options built dynamically
  const conditionOptions = [
    { value: '', label: 'None (General Fitness)' },
    ...conditions.map((c) => ({ value: c.id, label: c.name })),
  ]

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function next() { setError(''); setStep(STEPS[STEPS.indexOf(step) + 1]) }
  function back() { setError(''); setStep(STEPS[STEPS.indexOf(step) - 1]) }

  function validateAndNext() {
    if (step === 'basics') {
      if (!form.gender)  { setError('Please select your biological sex.'); return }
      if (!form.age)     { setError('Please select your age.'); return }
    }
    if (step === 'body') {
      if (!form.weight)  { setError('Please select your weight.'); return }
      if (!form.height)  { setError('Please select your height.'); return }
    }
    if (step === 'goals') {
      if (!form.primary_goal)    { setError('Please select your primary goal.'); return }
      if (!form.fitness_level)   { setError('Please select your fitness level.'); return }
      if (!form.activity_level)  { setError('Please select your activity level.'); return }
    }
    next()
  }

  async function finish() {
    if (!user?.id) { navigate('/dashboard'); return }
    setSaving(true)
    setSaveError('')
    try {
      const payload = {
        age:            Number(form.age),
        weight:         parseFloat(form.weight),
        height:         parseFloat(form.height),
        gender:         form.gender,
        primary_goal:   form.primary_goal   || 'general',
        fitness_level:  form.fitness_level  || 'Beginner',
        activity_level: form.activity_level || 'Sedentary',
        daily_calorie_target: form.daily_calorie_target ? Number(form.daily_calorie_target) : undefined,
        injury_details:       form.injury_details       || undefined,
        recovery_stage:       form.recovery_stage       || undefined,
        medical_diet_notes:   form.medical_diet_notes   || undefined,
      }
      await saveUserMetrics(payload)

      if (form.illness) {
        await setMyCondition(
          form.illness,
          form.injury_details || 'Added during onboarding',
          form.recovery_stage || 'acute',
        )
      }
      navigate('/dashboard')
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Summary rows for "Done" step
  const summary = [
    { label: 'Gender',           value: form.gender ? (form.gender.charAt(0).toUpperCase() + form.gender.slice(1)) : '—' },
    { label: 'Age',              value: form.age    ? `${form.age} years` : '—' },
    { label: 'Weight',           value: form.weight ? `${form.weight} kg` : '—' },
    { label: 'Height',           value: form.height ? `${form.height} cm` : '—' },
    { label: 'Primary Goal',     value: PRIMARY_GOAL_OPTIONS.find(o => o.value === form.primary_goal)?.label || '—' },
    { label: 'Fitness Level',    value: FITNESS_LEVEL_OPTIONS.find(o => o.value === form.fitness_level)?.label || '—' },
    { label: 'Activity Level',   value: ACTIVITY_LEVEL_OPTIONS.find(o => o.value === form.activity_level)?.label || '—' },
    { label: 'Calorie Target',   value: form.daily_calorie_target ? `${form.daily_calorie_target} kcal/day` : 'Auto' },
    { label: 'Diet Notes',       value: form.medical_diet_notes || 'None' },
    { label: 'Rehab Condition',  value: form.illness ? (conditions.find(c => c.id === form.illness)?.name || 'Yes') : 'None' },
    { label: 'Recovery Stage',   value: RECOVERY_STAGE_OPTIONS.find(o => o.value === form.recovery_stage)?.label || '—' },
    { label: 'Injury Details',   value: form.injury_details || 'None' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <BrandedHeader step={step} />

      <div className="relative z-10 -mt-12 mx-4 bg-surface-primary rounded-2xl shadow-2xl px-6 pt-8 pb-10 flex flex-col gap-6 flex-1 mb-6">

        {/* ── Welcome ── */}
        {step === 'welcome' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-heading-h3 font-bold text-text-headings mb-2">Welcome to EU Health</h1>
              <p className="text-body-md text-text-body">
                Let's build your health profile. It takes about 2 minutes and helps us personalise
                your workouts, nutrition, and recovery plans.
              </p>
            </div>
            <Button onClick={next} className="mt-2 w-fit">Get started</Button>
          </div>
        )}

        {/* ── Step 1: Basics (gender + age) ── */}
        {step === 'basics' && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <StepHeader
              step="basics"
              title="Personal Info"
              subtitle="Used to accurately calculate calorie targets and metrics."
            />

            <div className="flex flex-col gap-4">
              <DefinedField
                id="gender"
                label="Biological Sex"
                required
                placeholder="Select your sex"
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={(v) => set('gender', v)}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="age" className="block text-body-sm font-semibold text-text-body">Age <span className="text-text-error" aria-hidden="true">*</span></label>
                <div className="flex items-center gap-2">
                  <input
                    id="age"
                    type="number"
                    min={5}
                    max={100}
                    placeholder="e.g. 25"
                    value={form.age}
                    onChange={(e) => set('age', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-border-primary bg-surface-primary text-text-body text-body-md focus:outline-none focus:border-border-focus transition-colors"
                  />
                  <span className="text-body-md text-text-disabled shrink-0">yrs</span>
                </div>
              </div>
            </div>

            {error && <p className="text-body-sm text-text-error">{error}</p>}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={validateAndNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Body (weight + height) ── */}
        {step === 'body' && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <StepHeader
              step="body"
              title="Body Metrics"
              subtitle="We use these to calculate your BMI and daily calorie needs."
            />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="weight" className="block text-body-sm font-semibold text-text-body">Weight <span className="text-text-error" aria-hidden="true">*</span></label>
                <div className="flex items-center gap-2">
                  <input
                    id="weight"
                    type="number"
                    min={20}
                    max={300}
                    step={0.5}
                    placeholder="e.g. 70"
                    value={form.weight}
                    onChange={(e) => set('weight', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-border-primary bg-surface-primary text-text-body text-body-md focus:outline-none focus:border-border-focus transition-colors"
                  />
                  <span className="text-body-md text-text-disabled shrink-0">kg</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="height" className="block text-body-sm font-semibold text-text-body">Height <span className="text-text-error" aria-hidden="true">*</span></label>
                <div className="flex items-center gap-2">
                  <input
                    id="height"
                    type="number"
                    min={50}
                    max={280}
                    placeholder="e.g. 175"
                    value={form.height}
                    onChange={(e) => set('height', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-border-primary bg-surface-primary text-text-body text-body-md focus:outline-none focus:border-border-focus transition-colors"
                  />
                  <span className="text-body-md text-text-disabled shrink-0">cm</span>
                </div>
              </div>
            </div>

            {error && <p className="text-body-sm text-text-error">{error}</p>}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={validateAndNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Goals (primary_goal + fitness_level + activity_level) ── */}
        {step === 'goals' && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <StepHeader
              step="goals"
              title="Your Goals"
              subtitle="Help us tailor your plan to match your lifestyle and ambitions."
            />

            <div className="flex flex-col gap-4">
              <DefinedField
                id="primary_goal"
                label="Primary Goal"
                required
                placeholder="What are you training for?"
                options={PRIMARY_GOAL_OPTIONS}
                value={form.primary_goal}
                onChange={(v) => set('primary_goal', v)}
              />
              <DefinedField
                id="fitness_level"
                label="Fitness Level"
                required
                placeholder="How experienced are you?"
                options={FITNESS_LEVEL_OPTIONS}
                value={form.fitness_level}
                onChange={(v) => set('fitness_level', v)}
              />
              <DefinedField
                id="activity_level"
                label="Daily Activity Level"
                required
                placeholder="How active are you day-to-day?"
                options={ACTIVITY_LEVEL_OPTIONS}
                value={form.activity_level}
                onChange={(v) => set('activity_level', v)}
              />
            </div>

            {error && <p className="text-body-sm text-text-error">{error}</p>}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={validateAndNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Nutrition (daily_calorie_target + medical_diet_notes) ── */}
        {step === 'nutrition' && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <StepHeader
              step="nutrition"
              title="Nutrition Preferences"
              subtitle="All optional — you can update these anytime from your profile."
            />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="block text-body-sm font-semibold text-text-body">Daily Calorie Target</label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.autoCalorie}
                    onChange={(e) => set('autoCalorie', e.target.checked)}
                    className="w-4 h-4 rounded accent-surface-action cursor-pointer"
                  />
                  <span className="text-body-sm text-text-body">Calculate it for me automatically</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="daily_calorie_target"
                    type="number"
                    min={1500}
                    max={10000}
                    step={50}
                    placeholder="e.g. 2000"
                    disabled={form.autoCalorie}
                    value={form.autoCalorie ? '' : form.daily_calorie_target}
                    onChange={(e) => set('daily_calorie_target', e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border text-body-md transition-colors ${
                      form.autoCalorie
                        ? 'border-border-disabled bg-surface-disabled text-text-disabled cursor-not-allowed'
                        : 'border-border-primary bg-surface-primary text-text-body focus:outline-none focus:border-border-focus'
                    }`}
                  />
                  <span className={`text-body-md shrink-0 ${form.autoCalorie ? 'text-text-disabled' : 'text-text-disabled'}`}>kcal</span>
                </div>
                {!form.autoCalorie && (
                  <p className="text-body-xs text-text-disabled"></p>
                )}
              </div>
              <DefinedField
                id="medical_diet_notes"
                label="Dietary Restrictions / Notes"
                placeholder="No dietary restrictions"
                options={DIET_NOTES_OPTIONS}
                value={form.medical_diet_notes}
                onChange={(v) => set('medical_diet_notes', v)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={next} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Step 5: Rehab & Medical ── */}
        {step === 'rehab' && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <StepHeader
              step="rehab"
              title="Rehab & Medical Info"
              subtitle="Completely optional — helps us adjust recommendations for you."
            />

            <div className="flex flex-col gap-4">
              <DefinedField
                id="illness"
                label="Rehab Condition"
                placeholder="None (General Fitness)"
                options={conditionOptions}
                value={form.illness}
                onChange={(v) => set('illness', v)}
              />
              <DefinedField
                id="recovery_stage"
                label="Recovery Stage"
                placeholder="Not applicable"
                options={RECOVERY_STAGE_OPTIONS}
                value={form.recovery_stage}
                onChange={(v) => set('recovery_stage', v)}
              />
              <DefinedField
                id="injury_details"
                label="Injury Details"
                placeholder="No specific injury details"
                options={INJURY_DETAIL_OPTIONS}
                value={form.injury_details}
                onChange={(v) => set('injury_details', v)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button onClick={next} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ── Done: summary ── */}
        {step === 'done' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-heading-h3 font-bold text-text-headings mb-1">You're all set! </h2>
              <p className="text-body-md text-text-body">Here's a summary of your health profile.</p>
            </div>
            <div className="flex flex-col gap-2">
              {summary.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100"
                >
                  <span className="text-body-sm text-text-disabled font-semibold">{label}</span>
                  <span className="text-body-md text-text-headings font-semibold max-w-[60%] text-right">{value}</span>
                </div>
              ))}
            </div>
            {saveError && <p className="text-body-sm text-text-error">{saveError}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              <Button size="lg" loading={saving} onClick={finish} className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
