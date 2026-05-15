import { useState, useEffect } from 'react'
import { getUserMetrics, saveUserMetrics, getMe } from '../api/authService.js'
import { cn } from '../components/utils.js'
import { DefinedField } from '../components/molecules/DefinedField.jsx'

// ── Dropdown option sets (mirrors OnboardingPage) ──────────────────────────────

function range(start, end, step = 1) {
  const result = []
  for (let i = start; i <= end; i += step) result.push(i)
  return result
}

const AGE_OPTIONS = range(5, 100).map((v) => ({ value: String(v), label: `${v} years` }))
const WEIGHT_OPTIONS = range(20, 300, 0.5).map((v) => ({ value: String(v), label: `${v} kg` }))
const HEIGHT_OPTIONS = range(50, 280).map((v) => ({ value: String(v), label: `${v} cm` }))

const GENDER_OPTIONS = [
  { value: 'male',   label: '♂  Male' },
  { value: 'female', label: '♀  Female' },
]

const PRIMARY_GOAL_OPTIONS = [
  { value: 'general',      label: '  General Fitness' },
  { value: 'weight_loss',  label: '  Weight Loss' },
  { value: 'muscle_gain',  label: '  Muscle Gain' },
  { value: 'rehab',        label: '  Rehabilitation' },
]

const FITNESS_LEVEL_OPTIONS = [
  { value: 'Beginner',     label: '🌱  Beginner' },
  { value: 'Intermediate', label: '⚡  Intermediate' },
  { value: 'Advanced',     label: '🔥  Advanced' },
]

const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'Sedentary',         label: '  Sedentary' },
  { value: 'Lightly Active',    label: '  Lightly Active' },
  { value: 'Moderately Active', label: '  Moderately Active' },
  { value: 'Very Active',       label: '  Very Active' },
  { value: 'Extra Active',      label: '  Extra Active' },
]

const CALORIE_OPTIONS = [
  { value: '', label: 'Auto (calculated by app)' },
  ...range(1000, 4000, 100).map((v) => ({ value: String(v), label: `${v} kcal / day` })),
]

const RECOVERY_STAGE_OPTIONS = [
  { value: '',          label: 'Not applicable' },
  { value: 'acute',     label: '  Acute (0–6 weeks)' },
  { value: 'sub-acute', label: '  Sub-acute (6 wks – 3 months)' },
  { value: 'chronic',   label: '  Chronic (3+ months)' },
]

const INJURY_DETAIL_OPTIONS = [
  { value: '',                   label: 'No specific injury' },
  { value: 'Lower back pain',    label: '  Lower Back Pain' },
  { value: 'Knee injury',        label: '  Knee Injury' },
  { value: 'Shoulder injury',    label: '  Shoulder Injury' },
  { value: 'Hip injury',         label: '  Hip Injury' },
  { value: 'Ankle/foot injury',  label: '  Ankle / Foot Injury' },
  { value: 'Neck pain',          label: '  Neck Pain' },
  { value: 'Post-surgery rehab', label: '  Post-Surgery Rehab' },
  { value: 'Chronic fatigue',    label: '  Chronic Fatigue' },
  { value: 'Other',              label: '  Other' },
]

const DIET_NOTES_OPTIONS = [
  { value: '',                      label: 'No dietary restrictions' },
  { value: 'Vegetarian',            label: '  Vegetarian' },
  { value: 'Vegan',                 label: '  Vegan' },
  { value: 'Gluten-free',           label: '  Gluten-Free' },
  { value: 'Dairy-free',            label: '  Dairy-Free' },
  { value: 'Diabetic',              label: '  Diabetic Diet' },
  { value: 'Low sodium',            label: '  Low Sodium' },
  { value: 'Low fat',               label: '  Low Fat' },
  { value: 'High protein',          label: '  High Protein' },
  { value: 'Keto',                  label: '  Keto' },
  { value: 'Intermittent fasting',  label: ' Intermittent Fasting' },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function IconDumbbell() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" />
    </svg>
  )
}

function IconApple() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
      <path d="M10 2c1 .5 2 2 2 5" />
    </svg>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DataCard({ label, value, unit, detail }) {
  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <span className="text-body-sm text-text-disabled font-semibold uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-heading-h3 font-bold text-text-headings">{value}</span>
        {unit && <span className="text-body-md text-text-disabled font-medium">{unit}</span>}
      </div>
      {detail && <span className="mt-1 text-body-sm text-text-body">{detail}</span>}
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, colorClass, bgClass }) {
  return (
    <div className={cn("rounded-xl p-5 border border-border-primary shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform", bgClass)}>
      <div className={cn("p-3 rounded-xl", colorClass)}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-body-sm text-text-disabled font-semibold">{title}</span>
        <span className="text-heading-h4 font-bold text-text-headings leading-tight mt-1">{value}</span>
        {subtitle && <span className="text-body-sm text-text-body mt-1">{subtitle}</span>}
      </div>
    </div>
  )
}

// ── Section header for the modal ───────────────────────────────────────────────
function ModalSection({ title }) {
  return (
    <p className="text-body-xs font-bold text-text-disabled uppercase tracking-widest pt-2 border-t border-border-primary mt-2">
      {title}
    </p>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [me, metrics] = await Promise.all([getMe(), getUserMetrics()])
        setUser(me)
        setProfile(metrics)
      } catch (err) {
        console.error('Failed to fetch user or profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  function handleEditClick() {
    setEditData({
      gender:               profile?.gender               || '',
      age:                  profile?.age                  ? String(profile.age)    : '',
      weight:               profile?.weight               ? String(profile.weight) : '',
      height:               profile?.height               ? String(profile.height) : '',
      primary_goal:         profile?.primary_goal         || 'general',
      fitness_level:        profile?.fitness_level        || 'Beginner',
      activity_level:       profile?.activity_level       || 'Sedentary',
      daily_calorie_target: profile?.daily_calorie_target ? String(profile.daily_calorie_target) : '',
      autoCalorie:          !profile?.daily_calorie_target,
      medical_diet_notes:   profile?.medical_diet_notes   || '',
      recovery_stage:       profile?.recovery_stage       || '',
      injury_details:       profile?.injury_details       || '',
    })
    setSaveError('')
    setIsEditing(true)
  }

  function set(field, value) {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    try {
      setSaving(true)
      setSaveError('')
      const payload = {
        gender:               editData.gender               || undefined,
        age:                  parseInt(editData.age)        || 0,
        weight:               parseFloat(editData.weight)   || 0,
        height:               parseFloat(editData.height)   || 0,
        primary_goal:         editData.primary_goal         || 'general',
        fitness_level:        editData.fitness_level        || 'Beginner',
        activity_level:       editData.activity_level       || 'Sedentary',
        daily_calorie_target: editData.daily_calorie_target ? Number(editData.daily_calorie_target) : undefined,
        medical_diet_notes:   editData.medical_diet_notes   || undefined,
        recovery_stage:       editData.recovery_stage       || undefined,
        injury_details:       editData.injury_details       || undefined,
      }
      const updated = await saveUserMetrics(payload)
      setProfile(updated)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setSaveError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const bmi = profile?.weight && profile?.height
    ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)
    : '—'

  const bmiDetail =
    bmi === '—' ? '' :
    bmi < 18.5  ? 'Underweight' :
    bmi < 25    ? 'Normal weight' :
    bmi < 30    ? 'Overweight'   :
                  'Obese'

  const goalLabel = PRIMARY_GOAL_OPTIONS.find(o => o.value === profile?.primary_goal)?.label || '—'

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-surface-action-hover2 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[20%] w-48 h-48 bg-warning-100 rounded-full opacity-50 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-surface-action to-surface-action-hover border-4 border-neutral-white shadow-lg flex items-center justify-center shrink-0">
            <span className="text-heading-h3 md:text-heading-h2 font-bold text-neutral-white uppercase">
              {user?.name?.slice(0, 2) || '??'}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <h1 className="text-heading-h3 font-bold text-text-headings">{user?.name || 'Loading...'}</h1>
            <p className="text-body-md text-text-disabled mt-1">{user?.email || '—'}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-surface-action-hover2 text-text-action text-body-sm font-semibold rounded-round">
                Member
              </span>
              {profile?.fitness_level && (
                <span className="px-3 py-1 bg-neutral-200 text-text-body text-body-sm font-semibold rounded-round capitalize">
                  {profile.fitness_level} Level
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleEditClick}
            className="md:ml-auto mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-surface-primary border border-border-primary text-text-headings text-body-sm font-semibold rounded-lg hover:bg-neutral-100 transition-colors shadow-sm"
          >
            <IconEdit />
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 flex flex-col gap-10">

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-surface-action" />
          </div>
        ) : (
          <>
            {/* Statistics */}
            <section aria-label="Statistics">
              <h2 className="text-heading-h5 font-bold text-text-headings mb-5">Your Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <StatCard
                  title="Total Workouts"
                  value="—"
                  subtitle="Completed overall"
                  icon={<IconDumbbell />}
                  colorClass="bg-information-100 text-information-500"
                  bgClass="bg-surface-primary"
                />
                <StatCard
                  title="Daily Calorie Goal"
                  value={profile?.daily_calorie_target?.toLocaleString() || '—'}
                  subtitle="Target daily intake"
                  icon={<IconApple />}
                  colorClass="bg-success-100 text-success-600"
                  bgClass="bg-surface-primary"
                />
              </div>
            </section>

            {/* Personal Data */}
            <section aria-label="Personal Data">
              <h2 className="text-heading-h5 font-bold text-text-headings mb-5">Personal Data</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                <DataCard label="Age"    value={profile?.age    || '—'} unit="yrs" />
                <DataCard label="Weight" value={profile?.weight || '—'} unit="kg"
                  detail={goalLabel !== '—' ? `Goal: ${goalLabel}` : undefined}
                />
                <DataCard label="Height" value={profile?.height || '—'} unit="cm" />
                <DataCard label="BMI"    value={bmi} detail={bmiDetail} />
                <DataCard
                  label="Activity"
                  value={profile?.activity_level || '—'}
                  detail="Activity Level"
                />
              </div>
            </section>

            {/* Premium placeholder */}
            <section aria-label="Membership Status" className="grid grid-cols-1 gap-6">
              <div className="bg-gradient-to-br from-surface-disabled to-neutral-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden opacity-80 cursor-not-allowed">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-white opacity-20 rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-neutral-black opacity-5 rounded-full -translate-x-1/2 translate-y-1/2" />
                <div className="relative z-10 grayscale">
                  <h3 className="text-heading-h5 font-bold text-text-disabled mb-3">Premium Member</h3>
                  <p className="text-body-md text-text-disabled mb-6 max-w-sm mx-auto">
                    You have access to all premium personalised diet and workout plans.
                  </p>
                  <button disabled className="px-6 py-2.5 bg-neutral-100 text-text-disabled font-bold rounded-lg shadow-sm cursor-not-allowed">
                    Coming Soon
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-black/50 backdrop-blur-sm">
          <div className="bg-surface-primary rounded-xl shadow-xl max-w-md w-full flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-border-primary flex justify-between items-center">
              <h2 className="text-heading-h6 font-bold text-text-headings">Edit Health Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-text-disabled hover:text-text-headings transition-colors text-lg leading-none"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable fields */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[65vh]">

              {/* Personal */}
              <ModalSection title="Personal Info" />
              <DefinedField
                id="edit-gender"
                label="Biological Sex"
                placeholder="Select sex"
                options={GENDER_OPTIONS}
                value={editData.gender}
                onChange={(v) => set('gender', v)}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="edit-age" className="block text-body-sm font-semibold text-text-body">Age</label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-age"
                    type="number"
                    min={5}
                    max={100}
                    placeholder="e.g. 25"
                    value={editData.age}
                    onChange={(e) => set('age', e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-border-primary bg-surface-primary text-text-body text-body-md focus:outline-none focus:border-border-focus transition-colors"
                  />
                  <span className="text-body-md text-text-disabled shrink-0">yrs</span>
                </div>
              </div>

              {/* Body */}
              <ModalSection title="Body Metrics" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-weight" className="block text-body-sm font-semibold text-text-body">Weight</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-weight"
                      type="number"
                      min={20}
                      max={300}
                      step={0.5}
                      placeholder="e.g. 70"
                      value={editData.weight}
                      onChange={(e) => set('weight', e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-border-primary bg-surface-primary text-text-body text-body-md focus:outline-none focus:border-border-focus transition-colors"
                    />
                    <span className="text-body-md text-text-disabled shrink-0">kg</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-height" className="block text-body-sm font-semibold text-text-body">Height</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="edit-height"
                      type="number"
                      min={50}
                      max={280}
                      placeholder="e.g. 175"
                      value={editData.height}
                      onChange={(e) => set('height', e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-border-primary bg-surface-primary text-text-body text-body-md focus:outline-none focus:border-border-focus transition-colors"
                    />
                    <span className="text-body-md text-text-disabled shrink-0">cm</span>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <ModalSection title="Fitness Goals" />
              <DefinedField
                id="edit-primary-goal"
                label="Primary Goal"
                placeholder="Select goal"
                options={PRIMARY_GOAL_OPTIONS}
                value={editData.primary_goal}
                onChange={(v) => set('primary_goal', v)}
              />
              <DefinedField
                id="edit-fitness-level"
                label="Fitness Level"
                placeholder="Select level"
                options={FITNESS_LEVEL_OPTIONS}
                value={editData.fitness_level}
                onChange={(v) => set('fitness_level', v)}
              />
              <DefinedField
                id="edit-activity-level"
                label="Daily Activity Level"
                placeholder="Select activity level"
                options={ACTIVITY_LEVEL_OPTIONS}
                value={editData.activity_level}
                onChange={(v) => set('activity_level', v)}
              />

              <ModalSection title="Nutrition" />
              <div className="flex flex-col gap-2">
                <label className="block text-body-sm font-semibold text-text-body">Daily Calorie Target</label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editData.autoCalorie}
                    onChange={(e) => set('autoCalorie', e.target.checked)}
                    className="w-4 h-4 rounded accent-surface-action cursor-pointer"
                  />
                  <span className="text-body-sm text-text-body">Calculate it for me automatically</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-calorie-target"
                    type="number"
                    min={1500}
                    max={10000}
                    step={50}
                    placeholder="e.g. 2000"
                    disabled={editData.autoCalorie}
                    value={editData.autoCalorie ? '' : editData.daily_calorie_target}
                    onChange={(e) => set('daily_calorie_target', e.target.value)}
                    className={`w-full px-4 py-2 rounded-md border text-body-md transition-colors ${
                      editData.autoCalorie
                        ? 'border-border-disabled bg-surface-disabled text-text-disabled cursor-not-allowed'
                        : 'border-border-primary bg-surface-primary text-text-body focus:outline-none focus:border-border-focus'
                    }`}
                  />
                  <span className="text-body-md text-text-disabled shrink-0">kcal</span>
                </div>
                {!editData.autoCalorie && (
                  <p className="text-body-xs text-text-disabled">Minimum 1500 kcal / day</p>
                )}
              </div>
              <DefinedField
                id="edit-diet-notes"
                label="Dietary Restrictions"
                placeholder="No dietary restrictions"
                options={DIET_NOTES_OPTIONS}
                value={editData.medical_diet_notes}
                onChange={(v) => set('medical_diet_notes', v)}
              />

              {/* Rehab */}
              <ModalSection title="Rehab & Medical" />
              <DefinedField
                id="edit-recovery-stage"
                label="Recovery Stage"
                placeholder="Not applicable"
                options={RECOVERY_STAGE_OPTIONS}
                value={editData.recovery_stage}
                onChange={(v) => set('recovery_stage', v)}
              />
              <DefinedField
                id="edit-injury-details"
                label="Injury Details"
                placeholder="No specific injury"
                options={INJURY_DETAIL_OPTIONS}
                value={editData.injury_details}
                onChange={(v) => set('injury_details', v)}
              />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-border-primary flex flex-col gap-2 bg-neutral-100">
              {saveError && (
                <p className="text-body-sm text-text-error">{saveError}</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-body-sm font-semibold text-text-body border border-border-primary bg-surface-primary hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-body-sm font-semibold text-neutral-white bg-surface-action hover:bg-surface-action-hover transition-colors flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 rounded-full border-2 border-neutral-white border-t-transparent animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
