import { useState, useEffect } from 'react'
import { getAllUsers } from '../api/adminService.js'
import { getExercises, createExercise, updateExercise, archiveExercise } from '../api/exercisesService.js'
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

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminHub() {
  const [activeTab, setActiveTab] = useState('exercises') // 'users' | 'exercises'

  return (
    <div className="p-8 w-full"> {/* Removed max-w-7xl mx-auto for left alignment */}
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-heading-h4 font-bold text-text-headings tracking-tight">Admin Hub</h1>
          <p className="text-body-md text-text-body">System orchestration and library oversight.</p>
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
                  <div className="font-bold text-text-headings">@{u.username || 'unknown'}</div>
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
                  {new Date(u.created_at).toLocaleDateString()}
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

  const load = async () => {
    try {
      setLoading(true)
      const res = await getExercises({ pageSize: 100 }) // Capped at 100 per FastAPI `le=100` restriction
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
    load()
  }, [])

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
      alert("Operation Failure: " + err.message)
    }
  }

  const handleArchive = async (id) => {
    if (!confirm("Confirm structural archive command. The selected exercise node will be hidden from consumer catalogs.")) return
    try {
      await archiveExercise(id)
      load()
    } catch (err) {
      alert("Purge abort: " + err.message)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-heading-h6 font-bold text-text-headings">Active Data ({items.length})</h3>

        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-surface-action text-neutral-white px-4 py-2 rounded-lg text-body-sm font-bold hover:bg-surface-action-hover transition-colors shadow-sm"
        >
          <IconPlus />
          Add Exercise
        </button>
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
