import { useState, useEffect } from 'react'
import { getAllUsers } from '../api/adminService.js'
import { getExercises, createExercise, updateExercise, archiveExercise } from '../api/exercisesService.js'
import { getMeals, createMeal, deleteMeal } from '../api/mealPlansService.js'
import { cn } from '../components/utils.js'

// ── Constants mapped to DB domain options ───────────────────────────────────────
const MUSCLE_OPTIONS = ['chest', 'shoulders', 'upper_back', 'lower_back', 'lats', 'abs', 'obliques', 'biceps', 'triceps', 'forearms', 'quadriceps', 'hamstrings', 'glutes', 'calves']
const TYPE_OPTIONS = ['weight_reps', 'reps_only', 'duration']
const EQUIPMENT_OPTIONS = ['barbell', 'dumbbell', 'machine', 'none']
const MEDIA_OPTIONS = ['image', 'gif', 'video']

const EMPTY_FORM = {
  title: '',
  exercise_type: 'weight_reps',
  muscle_group: 'chest',
  equipment_category: 'none',
  url: '',
  media_type: 'video',
  thumbnail_url: '',
  instructions: '',
  manual_tag: '',
  priority: 0,
  hundred_percent_bodyweight: false,
  secondary_muscles_str: '' // internal use for parsing
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconUsers() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconDumbbell() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 12a2 2 0 01-2-2V8a2 2 0 012-2M20 12a2 2 0 002-2V8a2 2 0 00-2-2M4 12a2 2 0 00-2 2v2a2 2 0 002 2M20 12a2 2 0 012 2v2a2 2 0 01-2 2" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconArchive() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function IconMeal() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M5 3l1.5 2M19 3l-1.5 2" />
      <path d="M2 12h20A10 10 0 0 1 2 12z" />
      <path d="M7 12v-2M12 12v-3M17 12v-2" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminHub() {
  const [activeTab, setActiveTab] = useState('exercises') // 'users' | 'exercises'

  return (
    <div className="p-8 w-full"> {/* Removed max-w-7xl mx-auto for left alignment */}
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-heading-h4 font-bold text-text-headings tracking-tight">Admin Hub</h1>
          <p className="text-body-md text-text-body">Database and user oversight.</p>
        </div>
      </header>

      {/* Custom Styled Tabs */}
      <div className="flex border-b border-border-primary mb-6 justify-start">
        <button
          onClick={() => setActiveTab('exercises')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-body-md font-bold transition-colors border-b-2",
            activeTab === 'exercises'
              ? "border-text-action text-text-action"
              : "border-transparent text-text-disabled hover:text-text-body"
          )}
        >
          <IconDumbbell />
          Exercise Registry
        </button>
        <button
          onClick={() => setActiveTab('meals')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-body-md font-bold transition-colors border-b-2",
            activeTab === 'meals'
              ? "border-text-action text-text-action"
              : "border-transparent text-text-disabled hover:text-text-body"
          )}
        >
          <IconMeal />
          Meal Library
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            "flex items-center gap-2 px-6 py-3 text-body-md font-bold transition-colors border-b-2",
            activeTab === 'users'
              ? "border-text-action text-text-action"
              : "border-transparent text-text-disabled hover:text-text-body"
          )}
        >
          <IconUsers />
          Manage Users
        </button>
      </div>

      {/* Tab Panes */}
      <div className="mt-6 text-left">
        {activeTab === 'users' && <UsersPane />}
        {activeTab === 'exercises' && <ExercisesPane />}
        {activeTab === 'meals' && <MealsPane />}
      </div>
    </div>
  )
}

// ── Sub-component: Users Management ─────────────────────────────────────────────
function UsersPane() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllUsers()
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="py-12 text-text-disabled font-medium">Querying authorized directories...</div>
  }

  if (error) {
    return (
      <div className="bg-surface-error border border-border-error p-4 rounded-lg text-text-error flex gap-2 items-center font-medium w-fit">
        <span>⚠ Error querying backend:</span>
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-border-primary shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-border-primary">
            <tr>
              <th className="px-6 py-4 text-body-sm font-bold text-text-disabled uppercase tracking-wider">Username / Name</th>
              <th className="px-6 py-4 text-body-sm font-bold text-text-disabled uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-body-sm font-bold text-text-disabled uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-body-sm font-bold text-text-disabled uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-body-sm font-bold text-text-disabled uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-text-disabled font-medium">No recorded users available.</td>
              </tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-text-headings">@{u.username || u.email?.split('@')[0] || 'user'}</div>
                  <div className="text-body-sm text-text-body">{u.full_name || '-'}</div>
                </td>
                <td className="px-6 py-4 text-body-sm text-text-body">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-round text-xs font-bold uppercase tracking-wide",
                    u.role === 'admin' ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-600"
                  )}>
                    {u.role || 'general'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-round", u.is_active ? "bg-success-500" : "bg-error-500")} />
                    <span className="text-body-sm font-medium">{u.is_active ? 'Active' : 'Suspended'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-body-sm text-text-disabled">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sub-component: Exercises Library ─────────────────────────────────────────────
function ExercisesPane() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [modalOpen, setModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmDialog, setConfirmDialog] = useState(null) // { title: '', message: '', onConfirm: () => void }
  const [errorAlert, setErrorAlert] = useState(null) // { title: '', message: '' }
  const [searchQuery, setSearchQuery] = useState('')

  const load = async (currentSearch = searchQuery) => {
    try {
      setLoading(true)
      const res = await getExercises({ pageSize: 100, search: currentSearch }) // Capped at 100 per FastAPI `le=100` restriction
      setItems(res.items || [])
    } catch (err) {
      // Extract exact detail message if available (especially for Pydantic Validation Errors which are arrays)
      const msg = typeof err.message === 'string' ? err.message : JSON.stringify(err.message)
      setError(msg.includes('[object Object]') ? "Invalid API constraint: Verify request parameters." : msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      load()
    }, searchQuery ? 400 : 0)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormMode('create')
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      exercise_type: item.exercise_type || 'weight_reps',
      muscle_group: item.muscle_group || 'chest',
      equipment_category: item.equipment_category || 'none',
      url: item.url || '',
      media_type: item.media_type || 'video',
      thumbnail_url: item.thumbnail_url || '',
      instructions: item.instructions || '',
      manual_tag: item.manual_tag || '',
      priority: item.priority || 0,
      hundred_percent_bodyweight: item.hundred_percent_bodyweight || false,
      secondary_muscles_str: item.secondary_muscles?.map(m => m.muscle_name).join(', ') || ''
    })
    setFormMode('edit')
    setEditingId(item.id)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Parse inputs
    const payload = {
      ...form,
      secondary_muscles: form.secondary_muscles_str.split(',').map(s => s.trim()).filter(s => s.length > 0),
      priority: parseInt(form.priority, 10) || 0,
      // Ensure empty strings map to null for optional text fields
      url: form.url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      instructions: form.instructions.trim() || null,
      manual_tag: form.manual_tag.trim() || null,
    }
    delete payload.secondary_muscles_str // clean from internal form struct

    try {
      if (formMode === 'create') {
        await createExercise(payload)
      } else {
        await updateExercise(editingId, payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setErrorAlert({ title: "Operation Failure", message: err.message })
    }
  }

  const handleArchive = (id) => {
    setConfirmDialog({
      title: "Confirm Archive Command",
      message: "Are you sure you want to trigger a structural archive command? The selected exercise node will be hidden from consumer catalogs.",
      onConfirm: async () => {
        try {
          await archiveExercise(id)
          setItems(prev => prev.filter(ex => ex.id !== id)) // Force immediate UI eviction
          load()
        } catch (err) {
          setErrorAlert({ title: "Operation Failure", message: err.message })
        }
      }
    })
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-heading-h6 font-bold text-text-headings">Active Exercise Data ({items.length})</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-body-sm outline-none shadow-xs focus:ring-1 focus:ring-surface-action focus:border-surface-action transition-all w-64 text-text-body"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-surface-action text-neutral-white px-4 py-2 rounded-lg text-body-sm font-bold hover:bg-surface-action-hover transition-colors shadow-sm"
          >
            <IconPlus />
            Add Exercise
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-text-disabled font-medium">Mapping data node indexes...</div>
      ) : error ? (
        <div className="bg-surface-error border border-border-error p-4 rounded-lg text-text-error font-medium w-fit">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((ex) => (
            <div key={ex.id} className="bg-white border border-border-primary rounded-xl flex flex-col hover:border-neutral-300 shadow-sm transition-all relative group">
              {/* Media Preview */}
              <div className="h-32 bg-neutral-100 border-b border-border-primary rounded-t-xl overflow-hidden shrink-0 relative">
                {ex.thumbnail_url ? (
                  <img src={ex.thumbnail_url} className="w-full h-full object-cover opacity-90" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-body-xs text-text-disabled font-bold bg-neutral-50">NO PREVIEW</div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="bg-neutral-800/80 text-white text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded">PRIORITY: {ex.priority}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="mb-3">
                  <h4 className="font-bold text-text-headings truncate leading-snug" title={ex.title}>{ex.title}</h4>
                  <p className="text-[11px] text-text-disabled font-medium uppercase tracking-wide">{ex.exercise_type}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge text={ex.muscle_group} color="blue" />
                  <Badge text={ex.equipment_category} color="gray" />
                  {ex.hundred_percent_bodyweight && <Badge text="BW%" color="green" />}
                </div>

                <div className="flex gap-2 border-t border-border-primary pt-3">
                  <button
                    onClick={() => openEdit(ex)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-border-primary rounded-lg text-body-xs font-bold text-text-body hover:bg-neutral-50 transition-colors"
                  >
                    <IconEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleArchive(ex.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-border-primary rounded-lg text-body-xs font-bold text-error-500 hover:bg-surface-error hover:border-error-200 transition-colors"
                  >
                    <IconArchive /> Hide
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── COMPREHENSIVE EDITOR MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-border-primary flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            {/* Modal Title */}
            <div className="p-6 border-b border-border-primary bg-neutral-50 flex justify-between items-center">
              <div>
                <h3 className="text-heading-h6 font-bold text-text-headings flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-round", formMode === 'edit' ? "bg-blue-500" : "bg-success-500")} />
                  {formMode === 'create' ? 'Register New Exercise Profile' : 'Edit Record Payload'}
                </h3>
                <p className="text-body-sm text-text-disabled">Configure schema attributes synchronized with remote table instances.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-text-disabled hover:text-text-headings p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="admin-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

                {/* Core Identifier Group */}
                <div className="md:col-span-2">
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">System Title *</label>
                  <input
                    required
                    className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-body-md font-bold focus:ring-2 focus:ring-surface-action/20 focus:border-surface-action outline-none transition-all shadow-sm"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Flat Bench Dumbbell Press"
                  />
                </div>

                {/* Classification Controls */}
                <div>
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Primary Activation Group</label>
                  <select
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md bg-white shadow-sm cursor-pointer focus:border-surface-action outline-none capitalize"
                    value={form.muscle_group}
                    onChange={e => setForm({ ...form, muscle_group: e.target.value })}
                  >
                    {MUSCLE_OPTIONS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Secondary Recruits <span className="text-xs font-normal lowercase">(Comma sep)</span></label>
                  <input
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md shadow-sm focus:border-surface-action outline-none placeholder:text-neutral-400"
                    value={form.secondary_muscles_str}
                    onChange={e => setForm({ ...form, secondary_muscles_str: e.target.value })}
                    placeholder="triceps, anterior_delts"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Input Logic Type</label>
                  <select
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md bg-white shadow-sm capitalize"
                    value={form.exercise_type}
                    onChange={e => setForm({ ...form, exercise_type: e.target.value })}
                  >
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Equipment Hardware</label>
                  <select
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md bg-white shadow-sm capitalize"
                    value={form.equipment_category}
                    onChange={e => setForm({ ...form, equipment_category: e.target.value })}
                  >
                    {EQUIPMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {/* Media Payload */}
                <div className="md:col-span-2 h-px bg-border-primary my-2" />

                <div>
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Payload Storage URL</label>
                  <input
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md shadow-sm font-mono text-xs"
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    placeholder="https://cdn.site.com/video.mp4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">File MIME Type</label>
                    <select
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md bg-white uppercase"
                      value={form.media_type}
                      onChange={e => setForm({ ...form, media_type: e.target.value })}
                    >
                      {MEDIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Sort Priority</label>
                    <input
                      type="number"
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md shadow-sm"
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Raster Thumbnail Pointer</label>
                  <input
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md shadow-sm font-mono text-xs"
                    value={form.thumbnail_url}
                    onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                    placeholder="https://cdn.site.com/poster.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Instruction Corpus</label>
                  <textarea
                    rows="4"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-md shadow-sm focus:ring-1 focus:ring-surface-action outline-none leading-relaxed"
                    value={form.instructions}
                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                    placeholder="Line 1: Desc\nLine 2: Desc"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 bg-neutral-50 p-4 rounded-lg border border-border-primary">
                  <input
                    type="checkbox"
                    id="chk-bw"
                    className="w-5 h-5 rounded text-surface-action cursor-pointer"
                    checked={form.hundred_percent_bodyweight}
                    onChange={e => setForm({ ...form, hundred_percent_bodyweight: e.target.checked })}
                  />
                  <label htmlFor="chk-bw" className="text-body-md font-bold text-text-headings cursor-pointer select-none">
                    Classify as 100% Bodyweight Metric
                    <p className="text-xs text-text-disabled font-normal normal-case">Controls gravity volume mathematical models in logic trackers.</p>
                  </label>
                </div>

              </form>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-border-primary bg-neutral-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-border-primary rounded-lg font-bold text-text-body hover:bg-white transition-all">
                Discard Buffer
              </button>
              <button
                type="submit"
                form="admin-form"
                className={cn(
                  "px-6 py-2.5 text-neutral-white rounded-lg font-bold shadow-md transition-all",
                  formMode === 'create' ? "bg-success-600 hover:bg-success-700" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {formMode === 'create' ? 'Push to Production' : 'Save Node Delta'}
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ── CONFIRM DIALOG MODAL ── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-primary overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-50 rounded-full text-amber-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-heading-h6 font-bold text-text-headings">{confirmDialog.title}</h3>
              </div>
              <p className="text-body-sm text-text-body font-medium leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-border-primary flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-body-sm font-bold text-text-body hover:bg-white bg-neutral-50 border border-border-primary rounded-lg transition-all">
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm()
                  setConfirmDialog(null)
                }}
                className="px-5 py-2 text-body-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all shadow-md shadow-amber-600/10"
              >
                Archive Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR ALERT MODAL ── */}
      {errorAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-primary overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-error-600">
                <div className="p-2.5 bg-rose-50 rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-heading-h6 font-bold text-text-headings">{errorAlert.title}</h3>
              </div>
              <p className="text-body-sm text-text-body font-medium leading-relaxed">{errorAlert.message}</p>
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-border-primary flex justify-end">
              <button onClick={() => setErrorAlert(null)} className="px-5 py-2 text-body-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all">
                Dismiss Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-component: Meals Management ───────────────────────────────────────────────
const EMPTY_MEAL_FORM = {
  title: '',
  url: '',
  image_url: '',
  servings: 1,
  prep_time: '',
  time_to_make: '',
  guide_info: '',
  instructions_str: '',
  tags_str: '',
  ingredients_str: '',

  // Nutrition optional primitives
  calories_cal: '',
  kilojoules_kj: '',
  protein_g: '',
  total_fat_g: '',
  carbohydrates_g: '',
  sugar_g: '',
  saturated_fat_g: '',
  dietary_fibre_g: '',
  sodium_mg: '',
  calcium_mg: '',
  iron_mg: '',
}

function MealsPane() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_MEAL_FORM)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null) // { title: '', message: '', onConfirm: () => void }
  const [errorAlert, setErrorAlert] = useState(null) // { title: '', message: '' }
  const [searchQuery, setSearchQuery] = useState('')

  const load = async (currentSearch = searchQuery) => {
    try {
      setLoading(true)
      const res = await getMeals({ pageSize: 100, search: currentSearch }) // Limit requested
      setItems(res.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      load()
    }, searchQuery ? 400 : 0)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  const openCreate = () => {
    setForm(EMPTY_MEAL_FORM)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parseNumber = (val) => {
      const n = parseFloat(val)
      return isNaN(n) ? null : n
    }

    const parseInteger = (val) => {
      const n = parseInt(val, 10)
      return isNaN(n) ? null : n
    }

    // Prepare nutrition payload if any exist
    const hasNutrition = [
      form.calories_cal, form.kilojoules_kj, form.protein_g, form.total_fat_g,
      form.carbohydrates_g, form.sugar_g, form.saturated_fat_g, form.dietary_fibre_g,
      form.sodium_mg, form.calcium_mg, form.iron_mg
    ].some(x => x !== '')

    const nutrition = hasNutrition ? {
      calories_cal: parseInteger(form.calories_cal),
      kilojoules_kj: parseInteger(form.kilojoules_kj),
      protein_g: parseNumber(form.protein_g),
      total_fat_g: parseNumber(form.total_fat_g),
      carbohydrates_g: parseNumber(form.carbohydrates_g),
      sugar_g: parseNumber(form.sugar_g),
      saturated_fat_g: parseNumber(form.saturated_fat_g),
      dietary_fibre_g: parseNumber(form.dietary_fibre_g),
      sodium_mg: parseNumber(form.sodium_mg),
      calcium_mg: parseNumber(form.calcium_mg),
      iron_mg: parseNumber(form.iron_mg),
    } : null

    // Split arrays safely
    const parseList = (str) => str.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    const parseCommaList = (str) => str.split(',').map(s => s.trim()).filter(s => s.length > 0)

    const payload = {
      title: form.title.trim(),
      url: form.url.trim() || null,
      image_url: form.image_url.trim() || null,
      servings: parseInt(form.servings, 10) || 1,
      prep_time: form.prep_time.trim() || null,
      time_to_make: form.time_to_make.trim() || null,
      guide_info: form.guide_info.trim() || null,
      instructions: parseList(form.instructions_str),
      ingredients: parseList(form.ingredients_str),
      tags: parseCommaList(form.tags_str),
      nutrition
    }

    try {
      await createMeal(payload)
      setModalOpen(false)
      load()
    } catch (err) {
      setErrorAlert({ title: "Administrative Mutation Blocked", message: err.message })
    }
  }

  const handleDelete = (id) => {
    setConfirmDialog({
      title: "Confirm Physical Delete",
      message: "CAUTION: Confirm physical delete command. This operation permanently destroys the global master meal node index and is completely irreversible.",
      onConfirm: async () => {
        try {
          await deleteMeal(id)
          load()
        } catch (err) {
          const isFetchError = err.message?.includes('Failed to fetch') || err.message?.includes('fetch')
          setErrorAlert({
            title: "Delete Interrupted",
            message: isFetchError 
              ? "This meal cannot be deleted because it's currently being used in active user meal plans or tracking history."
              : `Operation Failure: ${err.message}`
          })
        }
      }
    })
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-heading-h6 font-bold text-text-headings">All Available Meals ({items.length})</h3>
          <p className="text-body-sm text-text-disabled"></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search meals by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-body-sm outline-none shadow-xs focus:ring-1 focus:ring-surface-action focus:border-surface-action transition-all w-64 text-text-body"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 text-neutral-white px-4 py-2 rounded-lg text-body-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <IconPlus />
            Add Meal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-text-disabled font-medium">Fetching dietary schemas from database...</div>
      ) : error ? (
        <div className="bg-surface-error border border-border-error p-4 rounded-lg text-text-error font-medium w-fit">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((meal) => (
            <div key={meal.id} className="bg-white border border-border-primary rounded-xl flex flex-col hover:border-neutral-300 shadow-sm transition-all relative group">

              {/* Thumbnail */}
              <div className="h-36 bg-neutral-100 border-b border-border-primary rounded-t-xl overflow-hidden shrink-0 relative">
                {meal.image_url ? (
                  <img src={meal.image_url} className="w-full h-full object-cover opacity-95" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-body-xs text-text-disabled font-bold bg-neutral-50">NO PREVIEW</div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-neutral-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-round">{meal.servings} Serv</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-text-headings text-body-md leading-snug truncate mb-1" title={meal.title}>{meal.title}</h4>
                  <div className="flex items-center gap-3 text-body-xs text-text-disabled mb-3 font-medium">
                    {meal.prep_time && <span>Prep: {meal.prep_time}</span>}
                    {meal.time_to_make && <span>Cook: {meal.time_to_make}</span>}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {meal.tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} text={tag} color="green" />
                    ))}
                    {meal.tags?.length > 3 && <span className="text-[9px] font-bold text-text-disabled">+{meal.tags.length - 3}</span>}
                  </div>
                </div>

                {/* Meta macro preview */}
                {meal.nutrition && (
                  <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 py-2.5 mb-2">
                    <div className="text-center">
                      <div className="text-body-sm font-bold text-text-headings leading-none">{meal.nutrition.calories_cal || '-'}</div>
                      <div className="text-[9px] uppercase text-text-disabled font-bold tracking-wider mt-0.5">Kcal</div>
                    </div>
                    <div className="text-center border-x border-neutral-100">
                      <div className="text-body-sm font-bold text-emerald-600 leading-none">{meal.nutrition.protein_g || '-'}g</div>
                      <div className="text-[9px] uppercase text-text-disabled font-bold tracking-wider mt-0.5">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-body-sm font-bold text-text-headings leading-none">{meal.nutrition.total_fat_g || '-'}g</div>
                      <div className="text-[9px] uppercase text-text-disabled font-bold tracking-wider mt-0.5">Fat</div>
                    </div>
                  </div>
                )}

                <div className="border-t border-border-primary pt-3 flex gap-2">
                  <button
                    onClick={() => { setSelectedMeal(meal); setViewModalOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-neutral-200 rounded-lg text-body-xs font-bold text-text-body bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <IconEye /> View Meal
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-error-200 rounded-lg text-body-xs font-bold text-error-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <IconArchive /> Delete Meal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MASTER MEAL CREATION MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-border-primary flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            <div className="p-6 border-b border-border-primary bg-neutral-50 flex justify-between items-center">
              <div>
                <h3 className="text-heading-h6 font-bold text-text-headings flex items-center gap-2">
                  <div className="w-2 h-2 rounded-round bg-emerald-500" />
                  Create Master Meal Profile
                </h3>
                <p className="text-body-sm text-text-disabled font-normal mt-0.5">Specify catalog dimensions including full macros, ingredients arrays, and instruction sequences.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-text-disabled hover:text-text-headings p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Form Scroll Block */}
            <div className="flex-1 overflow-y-auto p-6">
              <form id="meal-admin-form" onSubmit={handleSubmit} className="space-y-6 text-left">

                {/* Core Properties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Meal Name *</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-body-md font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                      placeholder="e.g. Grilled Chicken Breast with Roasted Asparagus" />
                  </div>

                  <div>
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Serving Count *</label>
                    <input type="number" required min="1" value={form.servings} onChange={e => setForm({ ...form, servings: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-body-md" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Prep Interval</label>
                      <input value={form.prep_time} onChange={e => setForm({ ...form, prep_time: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-sm" placeholder="e.g. 15 mins" />
                    </div>
                    <div>
                      <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Cook Interval</label>
                      <input value={form.time_to_make} onChange={e => setForm({ ...form, time_to_make: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-sm" placeholder="e.g. 30 mins" />
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Hero Raster URL</label>
                      <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono" placeholder="https://cdn.img.com/meal.png" />
                    </div>
                    <div>
                      <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Raw Article Link</label>
                      <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono" placeholder="https://myblog.com/recipe" />
                    </div>
                  </div>
                </div>

                {/* Macro Blocks - Nested */}
                <div>
                  <h4 className="text-body-sm font-bold text-emerald-700 border-b border-emerald-100 pb-2 mb-3 uppercase tracking-wider">Core Diagnostic Nutrition (Per Serving)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-text-disabled block mb-1 uppercase">Calories (kCal)</label>
                      <input type="number" value={form.calories_cal} onChange={e => setForm({ ...form, calories_cal: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-disabled block mb-1 uppercase">Energy (kJ)</label>
                      <input type="number" value={form.kilojoules_kj} onChange={e => setForm({ ...form, kilojoules_kj: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase">Protein (g)</label>
                      <input type="number" step="0.1" value={form.protein_g} onChange={e => setForm({ ...form, protein_g: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-headings block mb-1 uppercase">Fat (Total g)</label>
                      <input type="number" step="0.1" value={form.total_fat_g} onChange={e => setForm({ ...form, total_fat_g: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-disabled block mb-1 uppercase">Carbs (g)</label>
                      <input type="number" step="0.1" value={form.carbohydrates_g} onChange={e => setForm({ ...form, carbohydrates_g: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-disabled block mb-1 uppercase">Sugars (g)</label>
                      <input type="number" step="0.1" value={form.sugar_g} onChange={e => setForm({ ...form, sugar_g: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-disabled block mb-1 uppercase">Fibre (g)</label>
                      <input type="number" step="0.1" value={form.dietary_fibre_g} onChange={e => setForm({ ...form, dietary_fibre_g: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-rose-600 block mb-1 uppercase">Sodium (mg)</label>
                      <input type="number" step="0.1" value={form.sodium_mg} onChange={e => setForm({ ...form, sodium_mg: e.target.value })} className="w-full border border-neutral-300 rounded px-2 py-1.5 text-body-sm" />
                    </div>
                  </div>
                </div>

                {/* Metadata Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Target Catalog Tags <span className="text-xs font-normal lowercase">(Comma sep)</span></label>
                    <input value={form.tags_str} onChange={e => setForm({ ...form, tags_str: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-body-sm" placeholder="vegan, high-protein, keto, low-sodium" />
                  </div>

                  <div>
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Constituent Ingredients <span className="text-xs font-normal lowercase">(One entry per line)</span></label>
                    <textarea rows="6" value={form.ingredients_str} onChange={e => setForm({ ...form, ingredients_str: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-sm font-mono" placeholder="200g Skinless Chicken Breast&#10;1 tbsp Extra Virgin Olive Oil" />
                  </div>

                  <div>
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Preparation Pipelines <span className="text-xs font-normal lowercase">(One step per line)</span></label>
                    <textarea rows="6" value={form.instructions_str} onChange={e => setForm({ ...form, instructions_str: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-body-sm" placeholder="Step 1: Preheat oven to 200C&#10;Step 2: Season and grill" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-body-sm font-bold text-text-headings mb-1.5 uppercase tracking-wide">Guide Overview</label>
                    <textarea rows="2" value={form.guide_info} onChange={e => setForm({ ...form, guide_info: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-body-sm" placeholder="Quick overview or nutritional notes about this master meal setup." />
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Controls */}
            <div className="p-6 border-t border-border-primary bg-neutral-50 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-border-primary rounded-lg font-bold text-text-body hover:bg-white transition-all">
                Cancel Buffer
              </button>
              <button type="submit" form="meal-admin-form"
                className="px-6 py-2.5 text-neutral-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold shadow-md transition-all">
                Commit Master Node
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MEAL DETAIL PREVIEW MODAL ── */}
      {viewModalOpen && selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-border-primary flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

            {/* Hero Header */}
            <div className="relative h-56 shrink-0 overflow-hidden bg-neutral-100">
              {selectedMeal.image_url ? (
                <img src={selectedMeal.image_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-disabled font-bold bg-neutral-200 uppercase">NO PREVIEW</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button onClick={() => setViewModalOpen(false)} className="absolute top-4 right-4 bg-black/40 text-white hover:bg-black/60 p-2 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="absolute bottom-5 left-6 right-6 flex flex-col items-start">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedMeal.tags?.map(t => <Badge key={t} text={t} color="green" />)}
                </div>
                <h2 className="text-heading-h5 font-bold text-white leading-tight">{selectedMeal.title}</h2>
              </div>
            </div>

            {/* Scroll Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

              {/* Core Metrics */}
              <div className="grid grid-cols-3 bg-neutral-50 border border-border-primary rounded-xl p-4 divide-x divide-border-primary text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-disabled mb-0.5">Servings</p>
                  <p className="text-body-md font-bold text-text-headings">{selectedMeal.servings} People</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-disabled mb-0.5">Prep Time</p>
                  <p className="text-body-md font-bold text-text-headings">{selectedMeal.prep_time || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-disabled mb-0.5">Cook Time</p>
                  <p className="text-body-md font-bold text-text-headings">{selectedMeal.time_to_make || '-'}</p>
                </div>
              </div>

              {/* Optional Macro Grid */}
              {selectedMeal.nutrition && (
                <div>
                  <h4 className="text-body-sm font-bold text-text-headings mb-2 uppercase tracking-wide text-left">Macro Breakdown (Per serving)</h4>
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                      <p className="text-body-lg font-black text-emerald-700 leading-none">{selectedMeal.nutrition.calories_cal || '-'}</p>
                      <p className="text-[9px] font-bold text-emerald-600/80 uppercase mt-1">Kcal</p>
                    </div>
                    <div className="bg-neutral-50 border border-border-primary rounded-lg p-3 text-center">
                      <p className="text-body-lg font-black text-text-headings leading-none">{selectedMeal.nutrition.protein_g || '-'}g</p>
                      <p className="text-[9px] font-bold text-text-disabled uppercase mt-1">Protein</p>
                    </div>
                    <div className="bg-neutral-50 border border-border-primary rounded-lg p-3 text-center">
                      <p className="text-body-lg font-black text-text-headings leading-none">{selectedMeal.nutrition.carbohydrates_g || '-'}g</p>
                      <p className="text-[9px] font-bold text-text-disabled uppercase mt-1">Carbs</p>
                    </div>
                    <div className="bg-neutral-50 border border-border-primary rounded-lg p-3 text-center">
                      <p className="text-body-lg font-black text-text-headings leading-none">{selectedMeal.nutrition.total_fat_g || '-'}g</p>
                      <p className="text-[9px] font-bold text-text-disabled uppercase mt-1">Fat</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guide Info */}
              {selectedMeal.guide_info && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-body-sm text-blue-800 text-left">
                  <strong className="block text-[10px] uppercase tracking-wider mb-1 text-blue-900">Guide Overview</strong>
                  {selectedMeal.guide_info}
                </div>
              )}

              {/* Ingredients Array */}
              {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                <div className="border-t border-neutral-100 pt-5 text-left">
                  <h4 className="text-body-sm font-bold text-text-headings mb-2.5 uppercase tracking-wide">Required Ingredients</h4>
                  <ul className="space-y-2">
                    {selectedMeal.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 text-body-sm text-text-body">
                        <div className="w-1.5 h-1.5 rounded-round bg-emerald-500 shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions Array */}
              {selectedMeal.instructions && selectedMeal.instructions.length > 0 && (
                <div className="border-t border-neutral-100 pt-5 text-left">
                  <h4 className="text-body-sm font-bold text-text-headings mb-2.5 uppercase tracking-wide">Preparation Pipeline</h4>
                  <ol className="space-y-3.5">
                    {selectedMeal.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-body-sm text-text-body items-start">
                        <span className="flex items-center justify-center w-5 h-5 rounded-round bg-emerald-100 text-emerald-700 font-bold text-[10px] mt-0.5 shrink-0">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

            </div>

            {/* Footer Control */}
            <div className="p-5 border-t border-border-primary bg-neutral-50 flex justify-end">
              <button onClick={() => setViewModalOpen(false)} className="px-6 py-2 text-body-sm font-bold text-text-body border border-border-primary hover:bg-white bg-neutral-50 rounded-lg transition-all">
                Dismiss Details
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ── CONFIRM DIALOG MODAL ── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-primary overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-rose-50 rounded-full text-error-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-heading-h6 font-bold text-text-headings">{confirmDialog.title}</h3>
              </div>
              <p className="text-body-sm text-text-body font-medium leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-border-primary flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-body-sm font-bold text-text-body hover:bg-white bg-neutral-50 border border-border-primary rounded-lg transition-all">
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm()
                  setConfirmDialog(null)
                }}
                className="px-5 py-2 text-body-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-md shadow-rose-600/10"
              >
                Destroy Meal Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR ALERT MODAL ── */}
      {errorAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-border-primary overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3 text-error-600">
                <div className="p-2.5 bg-rose-50 rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-heading-h6 font-bold text-text-headings">{errorAlert.title}</h3>
              </div>
              <p className="text-body-sm text-text-body font-medium leading-relaxed">{errorAlert.message}</p>
            </div>
            <div className="px-6 py-4 bg-neutral-50 border-t border-border-primary flex justify-end">
              <button onClick={() => setErrorAlert(null)} className="px-5 py-2 text-body-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all">
                Dismiss Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reusable Components ────────────────────────────────────────────────────────
function Badge({ text, color }) {
  if (!text) return null
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    gray: "bg-neutral-100 text-neutral-700 border-neutral-200",
  }
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border shadow-xs whitespace-nowrap", styles[color] || styles.gray)}>
      {text.replace('_', ' ')}
    </span>
  )
}
