import { useState, useEffect } from 'react'
import { getUserMetrics, saveUserMetrics } from '../api/authService.js'
import { cn } from '../components/utils.js'

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function IconFire() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c0 0-4 4-4 8a4 4 0 004 4 4 4 0 004-4c0-1.5-.75-3-1.5-4C14 8 12 2 12 2zm0 14a2 2 0 01-2-2c0-1.5 1-3 2-4 1 1 2 2.5 2 4a2 2 0 01-2 2z" />
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

function IconChart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  )
}

// ── Personal Data Card ─────────────────────────────────────────────────────────
function DataCard({ label, value, unit, detail }) {
  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <span className="text-body-sm text-text-disabled font-semibold uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-heading-h3 font-bold text-text-headings">{value}</span>
        {unit && <span className="text-body-md text-text-disabled font-medium">{unit}</span>}
      </div>
      {detail && (
        <span className="mt-1 text-body-sm text-text-body">{detail}</span>
      )}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
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

// ── Bar Chart ──────────────────────────────────────────────────────────────────
function BarChart({ title, data, max = 4, labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }) {
  return (
    <div className="bg-surface-page rounded-xl p-6 border border-border-primary shadow-sm flex flex-col">
      <h3 className="text-heading-h6 font-bold text-text-headings mb-8">{title}</h3>
      <div className="relative h-48 flex w-full ml-4">
        {/* Y-axis labels and grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
          {[...Array(max + 1)].map((_, i) => (
            <div key={i} className="flex items-center w-full relative">
              <span className="text-[11px] text-text-disabled w-6 text-right absolute -translate-y-1/2 -left-8">
                {max - i}
              </span>
              <div className="w-full border-t border-neutral-100" />
            </div>
          ))}
        </div>
        
        {/* Bars */}
        <div className="flex-1 flex justify-between items-end px-2 z-10">
          {data.map((val, i) => (
            <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
              <div 
                className="w-full max-w-[1.75rem] bg-neutral-200 rounded-full transition-all duration-1000 ease-out origin-bottom group-hover:bg-surface-action"
                style={{ height: `${(val / max) * 100}%` }} 
                title={`${val}`} 
              />
              <span className="text-[11px] text-text-disabled font-medium">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)

  const userId = localStorage.getItem('user_id')
  const username = localStorage.getItem('username') || 'User'
  const email = localStorage.getItem('email') || 'user@example.com' // Mock email or fetch from API

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    getUserMetrics(userId)
      .then(data => {
        setProfile(data)
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err)
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [userId])

  const handleEditClick = () => {
    setEditData({
      Age: profile?.Age || '',
      Weight: profile?.Weight || '',
      Height: profile?.Height || '',
      PrimaryGoal: profile?.PrimaryGoal || 'Maintain',
      FitnessLevel: profile?.FitnessLevel || 'Beginner',
      ActivityLevel: profile?.ActivityLevel || 'Sedentary',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updatedProfile = await saveUserMetrics(userId, editData)
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const bmi = profile?.Weight && profile?.Height
    ? (parseFloat(profile.Weight) / Math.pow(parseFloat(profile.Height) / 100, 2)).toFixed(1)
    : '—'

  let bmiDetail = ''
  if (bmi !== '—') {
    if (bmi < 18.5) bmiDetail = 'Underweight'
    else if (bmi < 25) bmiDetail = 'Normal weight'
    else if (bmi < 30) bmiDetail = 'Overweight'
    else bmiDetail = 'Obese'
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-surface-action-hover2 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[20%] w-48 h-48 bg-warning-100 rounded-full opacity-50 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-surface-action to-surface-action-hover border-4 border-neutral-white shadow-lg flex items-center justify-center shrink-0">
            <span className="text-heading-h3 md:text-heading-h2 font-bold text-neutral-white uppercase">
              {username.slice(0, 2)}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <h1 className="text-heading-h3 font-bold text-text-headings">{username}</h1>
            <p className="text-body-md text-text-disabled mt-1">{email}</p>
            
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-surface-action-hover2 text-text-action text-body-sm font-semibold rounded-round">
                Member
              </span>
              {profile?.FitnessLevel && (
                <span className="px-3 py-1 bg-neutral-200 text-text-body text-body-sm font-semibold rounded-round capitalize">
                  {profile.FitnessLevel} Level
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
      <div className="flex-1 overflow-auto px-8 py-8 md:px-12 flex flex-col gap-10 animate-fade-in">
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-surface-action"></div>
          </div>
        ) : (
          <>
            {/* ── Statistics Section ────────────────────────────────────────────── */}
            <section aria-label="Statistics">
              <h2 className="text-heading-h5 font-bold text-text-headings mb-5">Your Statistics</h2>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <BarChart title="Workouts done" data={[3, 0, 0, 0, 4, 3, 4]} />
                <BarChart title="Meals ate" data={[3, 4, 3, 4, 4, 3, 4]} />
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                  title="Meals Streak" 
                  value={profile?.CurrentStreak || 0} 
                  subtitle="Days in a row" 
                  icon={<IconFire />} 
                  colorClass="bg-warning-100 text-warning-500"
                  bgClass="bg-surface-primary"
                />
                <StatCard 
                  title="Workout Streak" 
                  value={profile?.CurrentStreak || 0} 
                  subtitle="Days in a row" 
                  icon={<IconFire />} 
                  colorClass="bg-error-100 text-error-500"
                  bgClass="bg-surface-primary"
                />
                <StatCard 
                  title="Total Workouts" 
                  value="24" 
                  subtitle="Completed this month" 
                  icon={<IconDumbbell />} 
                  colorClass="bg-information-100 text-information-500"
                  bgClass="bg-surface-primary"
                />
                <StatCard 
                  title="Avg. Daily Calories" 
                  value={profile?.DailyCalorieTarget || '2,000'} 
                  subtitle="Target daily intake" 
                  icon={<IconApple />} 
                  colorClass="bg-success-100 text-success-600"
                  bgClass="bg-surface-primary"
                />
              </div>
            </section>

            {/* ── Personal Data Section ─────────────────────────────────────────── */}
            <section aria-label="Personal Data">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-heading-h5 font-bold text-text-headings">Personal Data</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                <DataCard 
                  label="Age" 
                  value={profile?.Age || '—'} 
                  unit="yrs"
                />
                <DataCard 
                  label="Weight" 
                  value={profile?.Weight || '—'} 
                  unit="kg" 
                  detail={profile?.PrimaryGoal === 'LoseWeight' ? 'Goal: Decrease' : profile?.PrimaryGoal === 'GainMuscle' ? 'Goal: Increase' : 'Goal: Maintain'}
                />
                <DataCard 
                  label="Height" 
                  value={profile?.Height || '—'} 
                  unit="cm" 
                />
                <DataCard 
                  label="BMI" 
                  value={bmi} 
                  detail={bmiDetail}
                />
                <DataCard 
                  label="Daily Activity" 
                  value={profile?.ActivityLevel ? profile.ActivityLevel.replace(/([A-Z])/g, ' $1').trim() : '—'} 
                  detail="Activity Level"
                />
              </div>
            </section>

            {/* ── Goals & Progress ──────────────────────────────────────────────── */}
            <section aria-label="Goals and Progress" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface-primary rounded-xl p-6 border border-border-primary shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-surface-action-hover2 rounded-lg text-text-action">
                    <IconChart />
                  </div>
                  <h3 className="text-heading-h6 font-bold text-text-headings">Monthly Goal Progress</h3>
                </div>
                
                <div className="flex flex-col gap-6 flex-1 justify-center">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md font-semibold text-text-body">Weight Goal</span>
                      <span className="text-body-md font-bold text-text-headings">65%</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-round overflow-hidden">
                      <div className="h-full bg-surface-action rounded-round transition-all duration-1000 w-[65%]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md font-semibold text-text-body">Workout Consistency</span>
                      <span className="text-body-md font-bold text-text-headings">80%</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-round overflow-hidden">
                      <div className="h-full bg-success-500 rounded-round transition-all duration-1000 w-[80%]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md font-semibold text-text-body">Diet Adherence</span>
                      <span className="text-body-md font-bold text-text-headings">90%</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-round overflow-hidden">
                      <div className="h-full bg-warning-400 rounded-round transition-all duration-1000 w-[90%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-surface-disabled to-neutral-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden opacity-80 cursor-not-allowed">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-white opacity-20 rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-neutral-black opacity-5 rounded-full -translate-x-1/2 translate-y-1/2" />
                
                <div className="relative z-10 grayscale">
                  <h3 className="text-heading-h5 font-bold text-text-disabled mb-3">Premium Member</h3>
                  <p className="text-body-md text-text-disabled mb-6 max-w-sm mx-auto">
                    You have access to all premium personalized diet and workout plans.
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
          <div className="bg-surface-primary rounded-xl shadow-lg max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-primary flex justify-between items-center">
              <h2 className="text-heading-h6 font-bold text-text-headings">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-text-disabled hover:text-text-headings transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-text-body">Age (yrs)</label>
                <input 
                  type="number" 
                  name="Age" 
                  value={editData.Age} 
                  onChange={handleChange}
                  className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-surface-action"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-body-sm font-semibold text-text-body">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    name="Weight" 
                    value={editData.Weight} 
                    onChange={handleChange}
                    className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-surface-action"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-body-sm font-semibold text-text-body">Height (cm)</label>
                  <input 
                    type="number" 
                    name="Height" 
                    value={editData.Height} 
                    onChange={handleChange}
                    className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-surface-action"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-text-body">Primary Goal</label>
                <select 
                  name="PrimaryGoal" 
                  value={editData.PrimaryGoal} 
                  onChange={handleChange}
                  className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-surface-action"
                >
                  <option value="LoseWeight">Lose Weight</option>
                  <option value="Maintain">Maintain</option>
                  <option value="GainMuscle">Gain Muscle</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-text-body">Fitness Level</label>
                <select 
                  name="FitnessLevel" 
                  value={editData.FitnessLevel} 
                  onChange={handleChange}
                  className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-surface-action"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-text-body">Activity Level</label>
                <select 
                  name="ActivityLevel" 
                  value={editData.ActivityLevel} 
                  onChange={handleChange}
                  className="px-3 py-2 border border-border-primary rounded-lg focus:outline-none focus:border-surface-action"
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="LightlyActive">Lightly Active</option>
                  <option value="ModeratelyActive">Moderately Active</option>
                  <option value="VeryActive">Very Active</option>
                  <option value="ExtraActive">Extra Active</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border-primary flex justify-end gap-3 bg-neutral-100">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-body-sm font-semibold text-text-body border border-border-primary bg-surface-primary hover:bg-neutral-100 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 rounded-lg text-body-sm font-semibold text-neutral-white bg-surface-action hover:bg-surface-action-hover transition-colors flex items-center gap-2"
                disabled={saving}
              >
                {saving && <div className="w-4 h-4 rounded-full border-2 border-neutral-white border-t-transparent animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
