import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "../components/utils.js";
import { Button } from "../components/atoms/Button.jsx";
import { Field } from "../components/atoms/Field.jsx";
import {
  getRehabExercises,
  getRehabPlan,
  createRehabRoutine,
  deleteRehabRoutine,
  addExerciseToRehabRoutine,
  deleteRoutineExercise,
} from "../api/rehabService.js";
import { getActiveRehabEnrollment, createEnrollment, updateEnrollmentStatus } from "../api/enrollmentService.js";
import {
  createRehabSession,
  updateRehabSessionStatus,
  updateRehabSessionExercise,
  listRehabSessions,
} from "../api/rehabTrackingService.js";

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-black opacity-50"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-surface-primary rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]",
          widths[size],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0">
          <h2 className="text-heading-h6 font-bold text-text-headings">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-text-disabled hover:text-text-headings transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Add Routine Modal ─────────────────────────────────────────────────────────
function AddRoutineModal({ open, onClose, plan, onCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Routine name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const orderIndex = plan?.routines?.length || 0;
      const created = await createRehabRoutine(plan.id, {
        name: name.trim(),
        order_index: orderIndex,
      });
      onCreated(created);
      setName("");
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Rehab Routine" size="sm">
      <Field
        id="routine-name"
        name="name"
        label="Routine Name"
        placeholder="e.g. Morning Mobility"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="text-body-sm text-text-error">{error}</p>}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <button
          className="flex-1 bg-rehab-sec text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          onClick={handleCreate}
        >
          Create
        </button>
      </div>
    </Modal>
  );
}

// ── Routine SlideOver ─────────────────────────────────────────────────────────
function RoutineSlideOver({
  routine,
  onClose,
  onRoutineUpdated,
  onDeleteRoutine,
}) {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loadingEx, setLoadingEx] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addingId, setAddingId] = useState(null);

  // Custom exercise config for rehab
  const [pendingEx, setPendingEx] = useState(null);
  const [exerciseConfig, setExerciseConfig] = useState({
    sets: "",
    reps: "",
    hold_time_seconds: "",
    rest_time_seconds: "",
  });

  // For viewing exercise details
  const [viewEx, setViewEx] = useState(null);

  useEffect(() => {
    if (!showSearch) return;
    setLoadingEx(true);
    getRehabExercises()
      .then((data) => {
        let filtered = data || [];
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.title?.toLowerCase().includes(q) ||
              e.target_area?.toLowerCase().includes(q),
          );
        }
        setExercises(filtered);
      })
      .catch(() => setExercises([]))
      .finally(() => setLoadingEx(false));
  }, [search, showSearch]);

  async function handleAddExerciseConfig() {
    if (!routine || !pendingEx) return;
    setAddingId(pendingEx.id);
    try {
      await addExerciseToRehabRoutine(routine.id, {
        exercise_id: pendingEx.id,
        sets: exerciseConfig.sets ? parseInt(exerciseConfig.sets) : null,
        reps: exerciseConfig.reps ? parseInt(exerciseConfig.reps) : null,
        hold_time_seconds: exerciseConfig.hold_time_seconds
          ? parseInt(exerciseConfig.hold_time_seconds)
          : null,
        rest_seconds: exerciseConfig.rest_time_seconds
          ? parseInt(exerciseConfig.rest_time_seconds)
          : null,
        order_index: routine.exercises?.length || 0,
        notes: "",
      });
      onRoutineUpdated();
      setPendingEx(null);
      setShowSearch(false);
      setSearch("");
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  }

  async function handleRemoveExercise(e, entryId) {
    e.stopPropagation();
    if (!confirm("Remove this exercise?")) return;
    try {
      await deleteRoutineExercise(entryId);
      onRoutineUpdated();
    } catch (err) {
      alert("Failed to remove exercise: " + err.message);
    }
  }

  if (!routine) return null;
  const exList = routine.exercises || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="absolute inset-0 bg-neutral-black opacity-40"
          onClick={onClose}
        />
        <div className="relative bg-surface-primary w-full max-w-md h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0">
            <div>
              <h2 className="text-heading-h6 font-bold text-text-headings">
                {routine.name}
              </h2>
              <p className="text-body-sm text-text-disabled">
                {exList.length} exercises
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-disabled hover:text-text-headings transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
            {exList.length === 0 && (
              <p className="text-body-sm text-text-disabled italic">
                No exercises yet. Add one below.
              </p>
            )}
            {exList.map((entry, i) => (
              <div
                key={entry.id}
                onClick={() => setViewEx(entry.exercise)}
                className="flex flex-col px-4 py-3 rounded-xl border border-border-primary bg-surface-primary shadow-sm cursor-pointer hover:border-rehab-sec transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-md font-semibold text-text-headings">
                      {entry.exercise?.title || `Exercise ${i + 1}`}
                    </p>
                    <p className="text-body-sm text-text-disabled capitalize">
                      {entry.exercise?.target_area || "General"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveExercise(e, entry.id)}
                    className="text-text-disabled hover:text-text-error"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.sets && entry.reps && (
                    <span className="text-[11px] font-bold bg-rehab-sec/10 text-rehab-sec px-2 py-0.5 rounded-full">
                      {entry.sets} sets × {entry.reps} reps
                    </span>
                  )}
                  {entry.hold_time_seconds > 0 && (
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {entry.hold_time_seconds}s hold
                    </span>
                  )}
                  {entry.rest_seconds > 0 && (
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {entry.rest_seconds}s rest
                    </span>
                  )}
                </div>
              </div>
            ))}

            {showSearch ? (
              <div className="flex flex-col gap-2 mt-4 bg-neutral-100 p-4 rounded-xl border border-border-primary">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rehab exercises…"
                  className="w-full rounded-md px-3 py-2 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-sec bg-surface-primary text-text-body"
                  autoFocus
                />
                {loadingEx && (
                  <p className="text-body-sm text-text-disabled">Loading…</p>
                )}
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                  {exercises.map((ex) => {
                    const alreadyAdded = exList.some(
                      (e) =>
                        e.exercise_id === ex.id || e.exercise?.id === ex.id,
                    );
                    return (
                      <button
                        key={ex.id}
                        disabled={alreadyAdded || addingId === ex.id}
                        onClick={() => {
                          setExerciseConfig({
                            sets: "",
                            reps: "",
                            hold_time_seconds: "",
                            rest_time_seconds: "",
                          });
                          setPendingEx(ex);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                          alreadyAdded
                            ? "opacity-50 cursor-not-allowed"
                            : "bg-surface-primary hover:border-rehab-sec border border-border-primary",
                        )}
                      >
                        <div className="flex-1">
                          <p className="text-body-sm font-semibold text-text-headings">
                            {ex.title}
                          </p>
                          <p className="text-[11px] text-text-disabled capitalize">
                            {ex.target_area}
                          </p>
                        </div>
                        {alreadyAdded && (
                          <span className="text-body-sm text-rehab-sec font-semibold shrink-0">
                            Added
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                  className="text-body-sm text-text-disabled hover:text-text-headings transition-colors self-start"
                >
                  Cancel Search
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-body-sm text-rehab-sec font-semibold hover:text-rehab-sec/80 transition-colors self-start mt-2 px-4 py-2 bg-rehab-sec/10 rounded-lg"
              >
                + Add Exercise
              </button>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border-primary flex flex-col gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              className="text-text-error"
              onClick={() => onDeleteRoutine(routine.id)}
            >
              Delete Routine
            </Button>
          </div>
        </div>
      </div>

      {pendingEx && (
        <Modal
          open={!!pendingEx}
          onClose={() => setPendingEx(null)}
          title={`Configure ${pendingEx.title}`}
          size="sm"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="r-sets"
              name="sets"
              label="Sets"
              type="number"
              value={exerciseConfig.sets}
              onChange={(e) =>
                setExerciseConfig((p) => ({ ...p, sets: e.target.value }))
              }
            />
            <Field
              id="r-reps"
              name="reps"
              label="Reps"
              type="number"
              value={exerciseConfig.reps}
              onChange={(e) =>
                setExerciseConfig((p) => ({ ...p, reps: e.target.value }))
              }
            />
            <Field
              id="r-hold"
              name="hold"
              label="Hold Time (s)"
              type="number"
              value={exerciseConfig.hold_time_seconds}
              onChange={(e) =>
                setExerciseConfig((p) => ({
                  ...p,
                  hold_time_seconds: e.target.value,
                }))
              }
            />
            <Field
              id="r-rest"
              name="rest"
              label="Rest Time (s)"
              type="number"
              value={exerciseConfig.rest_time_seconds}
              onChange={(e) =>
                setExerciseConfig((p) => ({
                  ...p,
                  rest_time_seconds: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setPendingEx(null)}
            >
              Cancel
            </Button>
            <button
              className="flex-1 bg-rehab-sec text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              onClick={handleAddExerciseConfig}
            >
              Add
            </button>
          </div>
        </Modal>
      )}

      {viewEx && (
        <Modal
          open={!!viewEx}
          onClose={() => setViewEx(null)}
          title="Exercise Details"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            {viewEx.thumbnail_url && (
              <img
                src={viewEx.thumbnail_url}
                alt={viewEx.title}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}
            <div>
              <h3 className="text-heading-h6 font-bold text-text-headings">
                {viewEx.title}
              </h3>
              <p className="text-body-sm text-rehab-sec font-bold uppercase tracking-wider mt-1">
                {viewEx.target_area}
              </p>
            </div>
            {viewEx.description && (
              <p className="text-body-md text-text-body leading-relaxed">
                {viewEx.description}
              </p>
            )}
            {viewEx.video_url && (
              <a
                href={viewEx.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-text-action font-semibold mt-2 hover:underline"
              >
                Watch Video Tutorial &rarr;
              </a>
            )}
            <Button
              variant="outline"
              size="md"
              className="w-full mt-2"
              onClick={() => setViewEx(null)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Protocol Structure sidebar ────────────────────────────────────────────────
function ProtocolStructure({ plan, onSlotClick }) {
  const routines = plan.routines || [];
  return (
    <div className="flex flex-col gap-2">
      {routines.map((r, i) => (
        <div
          key={r.id}
          onClick={() => onSlotClick(r)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-rehab-prim/10 cursor-pointer hover:bg-rehab-sec/20",
          )}
        >
          <span className="text-body-sm font-bold text-rehab-sec w-14 shrink-0">
            {`#${i + 1}`}
          </span>
          <span className="text-body-sm font-semibold text-text-headings">
            {r.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Rehab Session Logger (slide-over) ─────────────────────────────────────────
function RehabSessionLogger({ open, onClose, routine, planId, resumeSession, onSessionCompleted }) {
  const [session, setSession]       = useState(null);
  const [starting, setStarting]     = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError]           = useState("");
  // local perf state: { [entryId]: { sets, reps, hold, pain, notes, is_completed } }
  const [perf, setPerf]             = useState({});
  const [saving, setSaving]         = useState(null);  // entryId being saved

  const exercises = session?.exercises || [];

  useEffect(() => {
    if (!open) { setSession(null); setStarting(false); setCompleting(false); setError(""); setPerf({}); }
  }, [open]);

  // Auto-initialise perf — if resumeSession provided, pre-load it
  useEffect(() => {
    if (open && resumeSession && !session) {
      setSession(resumeSession)
      if (resumeSession.exercises?.length) {
        const init = {};
        resumeSession.exercises.forEach(ex => {
          init[ex.id] = {
            sets: String(ex.sets_completed ?? ""),
            reps: String(ex.reps_completed ?? ""),
            hold: String(ex.hold_time_seconds ?? ""),
            pain: String(ex.pain_level ?? ""),
            notes: ex.notes ?? "",
            is_completed: ex.is_completed ?? false,
          };
        });
        setPerf(init);
      }
    }
  }, [open, resumeSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-initialise perf from session exercises
  useEffect(() => {
    if (session?.exercises?.length) {
      const init = {};
      session.exercises.forEach(ex => {
        init[ex.id] = {
          sets: String(ex.sets_completed ?? ""),
          reps: String(ex.reps_completed ?? ""),
          hold: String(ex.hold_time_seconds ?? ""),
          pain: String(ex.pain_level ?? ""),
          notes: ex.notes ?? "",
          is_completed: ex.is_completed ?? false,
        };
      });
      setPerf(init);
    }
  }, [session?.id]);

  async function handleStart() {
    setStarting(true); setError("");
    try {
      const s = await createRehabSession({ plan_id: planId, routine_id: routine.id, status: "in_progress" });
      setSession(s);
    } catch (err) { setError(err.message); }
    finally { setStarting(false); }
  }

  async function handleSaveExercise(entryId) {
    if (!session) return;
    const p = perf[entryId] || {};
    setSaving(entryId);
    try {
      const updated = await updateRehabSessionExercise(session.id, entryId, {
        sets_completed:    p.sets ? parseInt(p.sets) : undefined,
        reps_completed:    p.reps ? parseInt(p.reps) : undefined,
        hold_time_seconds: p.hold ? parseInt(p.hold) : undefined,
        pain_level:        p.pain ? parseInt(p.pain) : undefined,
        notes:             p.notes || undefined,
        is_completed:      true,
      });
      // Reflect backend state
      setSession(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex => ex.id === entryId ? updated : ex),
      }));
      setPerf(prev => ({ ...prev, [entryId]: { ...prev[entryId], is_completed: true } }));
    } catch (err) { setError(err.message); }
    finally { setSaving(null); }
  }

  async function handleComplete() {
    if (!session) return;
    setCompleting(true); setError("");
    try {
      await updateRehabSessionStatus(session.id, { status: "completed" });
      window.dispatchEvent(new CustomEvent('sidebarStatsRefresh'));
      if (onSessionCompleted) onSessionCompleted();
      else onClose();
    } catch (err) { setError(err.message); setCompleting(false); }
  }

  async function handleSkip() {
    if (!session) return;
    try { await updateRehabSessionStatus(session.id, { status: "skipped" }); } catch (_) {}
    onClose();
  }

  function updateField(entryId, field, value) {
    setPerf(prev => ({ ...prev, [entryId]: { ...(prev[entryId] || {}), [field]: value } }));
  }

  if (!open) return null;
  const anyCompleted = exercises.some(ex => perf[ex.id]?.is_completed || ex.is_completed);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-black opacity-40" onClick={session ? undefined : onClose} />
      <div className="relative bg-surface-primary w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary shrink-0 bg-rehab-prim">
          <div>
            <h2 className="text-heading-h6 font-bold text-neutral-white">{routine?.name || "Rehab Session"}</h2>
            <p className="text-body-xs text-white/70">
              {session ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success-400 inline-block animate-pulse" />
                  Session in progress
                </span>
              ) : "Not started"}
            </p>
          </div>
          <button onClick={session ? handleSkip : onClose}
            className="text-neutral-white/70 hover:text-neutral-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {!session ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-rehab-prim/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rehab-prim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <div>
                <p className="text-body-lg font-bold text-text-headings">{routine?.name}</p>
                <p className="text-body-sm text-text-disabled mt-1">
                  {(routine?.exercises || []).length} exercises · Logs auto-generated from prescription
                </p>
              </div>
              <button onClick={handleStart} disabled={starting}
                className="px-8 py-3 rounded-xl bg-rehab-prim text-neutral-white font-bold text-body-md hover:bg-rehab-prim/90 transition-colors shadow-lg disabled:opacity-50">
                {starting ? "Starting…" : "▶ Start Session"}
              </button>
              {error && <p className="text-body-sm text-text-error">{error}</p>}
            </div>
          ) : (
            <>
              {exercises.map(ex => {
                const p = perf[ex.id] || {};
                const done = p.is_completed || ex.is_completed;
                const isSaving = saving === ex.id;
                return (
                  <div key={ex.id} className={cn(
                    "rounded-xl border p-4 flex flex-col gap-3 transition-colors",
                    done ? "border-success-300 bg-success-50" : "border-border-primary",
                  )}>
                    <div className="flex items-center justify-between">
                      <p className="text-body-md font-bold text-text-headings">
                        {ex.exercise?.title || "Exercise"}
                      </p>
                      {done && <span className="text-body-xs font-bold px-2 py-0.5 rounded-full bg-success-100 text-success-700 border border-success-200">✓ Done</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-body-xs text-text-disabled font-semibold">Sets</span>
                        <input type="number" min="0" value={p.sets || ""} disabled={done}
                          onChange={e => updateField(ex.id, "sets", e.target.value)}
                          placeholder="3"
                          className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim disabled:opacity-50" />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-body-xs text-text-disabled font-semibold">Reps</span>
                        <input type="number" min="0" value={p.reps || ""} disabled={done}
                          onChange={e => updateField(ex.id, "reps", e.target.value)}
                          placeholder="10"
                          className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim disabled:opacity-50" />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-body-xs text-text-disabled font-semibold">Hold (sec)</span>
                        <input type="number" min="0" value={p.hold || ""} disabled={done}
                          onChange={e => updateField(ex.id, "hold", e.target.value)}
                          placeholder="0"
                          className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim disabled:opacity-50" />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-body-xs text-text-disabled font-semibold">Pain (1–10)</span>
                        <input type="number" min="1" max="10" value={p.pain || ""} disabled={done}
                          onChange={e => updateField(ex.id, "pain", e.target.value)}
                          placeholder="—"
                          className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim disabled:opacity-50" />
                      </label>
                    </div>
                    <label className="flex flex-col gap-1">
                      <span className="text-body-xs text-text-disabled font-semibold">Notes</span>
                      <textarea rows="2" value={p.notes || ""} disabled={done}
                        onChange={e => updateField(ex.id, "notes", e.target.value)}
                        placeholder="How did it feel?"
                        className="rounded-md px-2 py-1.5 text-body-sm border border-border-primary focus:outline-none focus:border-rehab-prim resize-none disabled:opacity-50" />
                    </label>
                    {!done && (
                      <button onClick={() => handleSaveExercise(ex.id)} disabled={isSaving}
                        className="w-full py-2 rounded-lg text-body-sm font-bold bg-rehab-prim text-neutral-white hover:bg-rehab-prim/90 transition-colors disabled:opacity-50">
                        {isSaving ? "Saving…" : "✓ Mark Done"}
                      </button>
                    )}
                  </div>
                );
              })}
              {error && <p className="text-body-sm text-text-error">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        {session && (
          <div className="px-6 py-4 border-t border-border-primary flex flex-col gap-2 shrink-0">
            {/* Error always visible at bottom */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error-50 border border-error-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-error-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-body-xs text-error-600 font-medium">{error}</p>
              </div>
            )}
            <button onClick={handleComplete} disabled={completing || !anyCompleted}
              className="w-full py-3 rounded-xl bg-success-600 text-neutral-white font-bold text-body-md hover:bg-success-700 transition-colors shadow-md disabled:opacity-50">
              {completing ? "Completing…" : "✓ Complete Session"}
            </button>
            {!anyCompleted && (
              <p className="text-body-xs text-text-disabled text-center">Mark at least one exercise done to complete.</p>
            )}
            <button onClick={handleSkip} className="text-body-sm text-text-error hover:underline text-center">
              Skip Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RehabPlanPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState(null);

  // ── Tracker state
  const [sessionRoutine, setSessionRoutine] = useState(null);
  const [showSessionLogger, setShowSessionLogger] = useState(false);
  const [existingSession, setExistingSession] = useState(null);
  const [resumeSession, setResumeSession] = useState(null);

  // ── Enrollment state ───────────────────────────────────────────────────
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRehabPlan(id);
      setPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // Fetch active rehab enrollment on mount
  useEffect(() => {
    getActiveRehabEnrollment()
      .then((e) => { if (e.rehab_plan_id === id) setEnrollment(e); })
      .catch(() => {});
  }, [id]);

  // Detect any orphaned in_progress rehab session for this plan
  useEffect(() => {
    if (!id) return;
    listRehabSessions({ status: 'in_progress', plan_id: id })
      .then(({ results }) => {
        if (results?.length) setExistingSession(results[0]);
      })
      .catch(() => {});
  }, [id]);

  async function handleEnroll() {
    setEnrolling(true); setEnrollError("");
    try {
      const e = await createEnrollment({ rehabPlanId: id });
      setEnrollment(e);
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  async function handleEnrollStatus(newStatus) {
    if (!enrollment) return;
    setEnrolling(true); setEnrollError("");
    try {
      const e = await updateEnrollmentStatus(enrollment.id, newStatus);
      setEnrollment(e);
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRoutineUpdated() {
    await loadPlan();
    if (activeRoutine) {
      setPlan((prev) => {
        if (!prev) return prev;
        const updated = prev.routines?.find((r) => r.id === activeRoutine.id);
        if (updated) setActiveRoutine(updated);
        return prev;
      });
    }
  }

  async function handleDeleteRoutine(routineId) {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    try {
      await deleteRehabRoutine(routineId);
      if (activeRoutine?.id === routineId) setActiveRoutine(null);
      loadPlan();
    } catch (err) {
      alert("Failed to delete routine: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-page items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-rehab-prim border-t-transparent animate-spin" />
        <p className="text-body-md font-semibold text-text-disabled">
          Loading protocol…
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-page items-center justify-center gap-4 px-8">
        <p className="text-body-lg font-semibold text-text-error">
          {error || "Protocol not found."}
        </p>
        <Button variant="outline" onClick={() => navigate("/plans")}>
          Back to Plans
        </Button>
      </div>
    );
  }

  const routines = plan.routines || [];
  const todayRoutine = routines.length > 0 ? routines[0] : null;

  return (
    <div className="flex flex-col min-h-screen bg-surface-page">
      {/* ── Banner ── */}
      <div className="relative h-56 shrink-0 overflow-hidden bg-rehab-prim">
        <div className="absolute inset-0 bg-gradient-to-br from-rehab-prim via-rehab-prim/90 to-rehab-prim/80 opacity-90" />
        <div className="absolute inset-0 flex flex-col justify-between p-6">
          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-1 text-body-sm text-neutral-white font-semibold self-start hover:opacity-80 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="flex items-end justify-between">
            <div>
              <span className="bg-neutral-white/20 text-neutral-white text-body-sm font-bold px-2 py-0.5 rounded-round capitalize">
                {plan.condition?.name || "Rehab Protocol"}
              </span>
              <h1 className="text-heading-h4 font-bold text-neutral-white mt-1">
                {plan.title}
              </h1>
              <p className="text-body-sm text-neutral-200">
                {routines.length} module{routines.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="px-8 py-3 bg-surface-primary border-b border-border-primary flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-text-disabled">Modules</span>
          <span className="text-body-sm font-bold text-text-headings">
            {routines.length}
          </span>
        </div>
        {plan.description && (
          <p className="text-body-sm text-text-disabled ml-auto max-w-xs">
            {plan.description}
          </p>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col px-8 py-6 flex-1 gap-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Plan structure */}
          <div className="lg:w-72 shrink-0 flex flex-col gap-4">
            <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-body-lg font-bold text-text-headings">
                  Protocol Structure
                </h2>
                <span className="text-body-sm text-text-disabled capitalize">
                  Modules
                </span>
              </div>
              {routines.length ? (
                <ProtocolStructure
                  plan={plan}
                  onSlotClick={(r) => setActiveRoutine(r)}
                />
              ) : (
                <p className="text-body-sm text-text-disabled italic">
                  No modules yet. Add one to get started.
                </p>
              )}
            </div>

            {/* Today's Focus */}
            <div className="bg-rehab-prim rounded-xl p-5 flex flex-col gap-3">
              <p className="text-body-sm text-rehab-prim-100 font-semibold uppercase tracking-widest">
                Today's Focus
              </p>
              {todayRoutine ? (
                <>
                  <h3 className="text-body-lg font-bold text-neutral-white">
                    {todayRoutine.name}
                  </h3>
                  <p className="text-body-sm text-white/90">
                    {(todayRoutine.exercises || []).length} exercises
                  </p>
                </>
              ) : (
                <p className="text-body-md font-semibold text-neutral-white">
                  Rest / Recovery
                </p>
              )}
            </div>

            {/* ── Enrollment panel ──────────────────────────────────────────── */}
            <div className="bg-surface-primary rounded-xl border border-border-primary p-5 flex flex-col gap-3">
              <p className="text-body-sm font-bold text-text-headings">Enrollment</p>
              {enrollment ? (
                <>
                  <div className={cn(
                    'inline-flex items-center gap-1.5 self-start text-body-sm font-bold px-3 py-1 rounded-full border',
                    enrollment.status === 'active'    && 'bg-success-100 text-success-700 border-success-200',
                    enrollment.status === 'paused'    && 'bg-warning-100 text-warning-700 border-warning-200',
                    enrollment.status === 'completed' && 'bg-information-100 text-information-700 border-information-200',
                    enrollment.status === 'dropped'   && 'bg-error-100 text-error-600 border-error-200',
                  )}>
                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                  </div>
                  <p className="text-body-xs text-text-disabled">
                    Since {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex flex-col gap-2">
                    {enrollment.status === 'active' && (
                      <>
                        <button onClick={() => handleEnrollStatus('paused')} disabled={enrolling}
                          className="w-full py-2 rounded-lg text-body-sm font-bold border border-warning-300 text-warning-700 bg-warning-50 hover:bg-warning-100 transition-colors disabled:opacity-50">
                          {enrolling ? '…' : '⏸ Pause Enrollment'}
                        </button>
                        <button onClick={() => handleEnrollStatus('completed')} disabled={enrolling}
                          className="w-full py-2 rounded-lg text-body-sm font-bold border border-information-300 text-information-700 bg-information-50 hover:bg-information-100 transition-colors disabled:opacity-50">
                          {enrolling ? '…' : '✓ Mark Completed'}
                        </button>
                        <button onClick={() => handleEnrollStatus('dropped')} disabled={enrolling}
                          className="w-full py-2 rounded-lg text-body-sm font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50">
                          {enrolling ? '…' : '✕ Drop Protocol'}
                        </button>
                      </>
                    )}
                    {enrollment.status === 'paused' && (
                      <>
                        <button onClick={() => handleEnrollStatus('active')} disabled={enrolling}
                          className="w-full py-2 rounded-lg text-body-sm font-bold bg-success-600 text-neutral-white hover:bg-success-700 transition-colors disabled:opacity-50">
                          {enrolling ? '…' : '▶ Resume Enrollment'}
                        </button>
                        <button onClick={() => handleEnrollStatus('dropped')} disabled={enrolling}
                          className="w-full py-2 rounded-lg text-body-sm font-bold border border-error-200 text-error-500 bg-error-50 hover:bg-error-100 transition-colors disabled:opacity-50">
                          {enrolling ? '…' : '✕ Drop Protocol'}
                        </button>
                      </>
                    )}
                    {(enrollment.status === 'completed' || enrollment.status === 'dropped') && (
                      <button onClick={handleEnroll} disabled={enrolling}
                        className="w-full py-2 rounded-lg text-body-sm font-bold bg-success-600 text-neutral-white hover:bg-success-700 transition-colors disabled:opacity-50">
                        {enrolling ? '…' : '↩ Re-enroll'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-body-sm text-text-disabled">Not enrolled yet.</p>
                  <button onClick={handleEnroll} disabled={enrolling}
                    className="w-full py-2.5 rounded-lg text-body-sm font-bold bg-rehab-prim text-neutral-white hover:bg-rehab-prim/90 transition-colors shadow-sm disabled:opacity-50">
                    {enrolling ? 'Enrolling…' : '+ Enroll in This Protocol'}
                  </button>
                </>
              )}
              {enrollError && <p className="text-body-xs text-text-error">{enrollError}</p>}
            </div>
          </div>

          {/* Right: Routines grid */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-body-lg font-bold text-text-headings">
                Protocol Modules
              </h2>
              <button
                onClick={() => setShowAddRoutine(true)}
                className="bg-rehab-prim text-white px-4 py-2 rounded-lg font-semibold text-body-sm hover:opacity-90 transition-opacity"
              >
                + Add Routine
              </button>
            </div>

            {/* Resume banner — shows when an in_progress rehab session exists */}
            {existingSession && (() => {
              const routineMatch = routines?.find(r => r.id === existingSession.routine_id);
              return (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning-50 border border-warning-300">
                  <span className="text-warning-600 text-body-lg">⚠</span>
                  <div className="flex-1">
                    <p className="text-body-sm font-bold text-warning-700">Session in progress</p>
                    <p className="text-body-xs text-warning-600">{routineMatch?.name || 'Unknown module'} — started earlier</p>
                  </div>
                  <button
                    onClick={() => {
                      const r = routineMatch || routines?.[0];
                      setSessionRoutine(r);
                      setResumeSession(existingSession);
                      setShowSessionLogger(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-body-sm font-bold bg-warning-600 text-neutral-white hover:bg-warning-700 transition-colors">
                    ▶ Resume
                  </button>
                  <button
                    onClick={() => setExistingSession(null)}
                    className="text-warning-400 hover:text-warning-600 transition-colors" aria-label="Dismiss">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              );
            })()}

            {routines.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 border-2 border-dashed border-border-primary rounded-xl text-center">
                <p className="text-body-md font-semibold text-text-disabled">
                  No modules yet
                </p>
                <p className="text-body-sm text-text-disabled">
                  Create your first module to start tracking your rehab.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddRoutine(true)}
                >
                  Create Module
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="bg-surface-primary rounded-xl border border-border-primary px-5 py-4 flex items-center justify-between hover:border-rehab-prim transition-colors cursor-pointer"
                    onClick={() => setActiveRoutine(routine)}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-body-md font-bold text-text-headings">
                        {routine.name}
                      </span>
                      <span className="text-body-sm text-text-disabled">
                        {(routine.exercises || []).length} exercise
                        {(routine.exercises || []).length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="sm" onClick={() => setActiveRoutine(routine)}>
                        View
                      </Button>
                      <button
                        onClick={() => { setSessionRoutine(routine); setShowSessionLogger(true); }}
                        className="px-3 py-1.5 rounded-lg text-body-sm font-bold bg-rehab-prim text-neutral-white hover:bg-rehab-prim/90 transition-colors">
                        ▶ Start Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Details of Today's Exercises */}
        {todayRoutine && (todayRoutine.exercises || []).length > 0 && (
          <div className="flex flex-col gap-4 border-t border-border-primary pt-8 pb-12">
            <div>
              <h2 className="text-heading-h5 font-bold text-text-headings">
                Today's Exercises
              </h2>
              <p className="text-body-sm text-text-disabled mt-1">
                Detailed guide for your active module.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {(todayRoutine.exercises || []).map((entry, idx) => (
                <div
                  key={entry.id}
                  className="bg-surface-primary border border-border-primary rounded-xl overflow-hidden shadow-sm flex flex-col"
                >
                  {entry.exercise?.thumbnail_url ? (
                    <img
                      src={entry.exercise.thumbnail_url}
                      alt={entry.exercise?.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-neutral-100 flex items-center justify-center text-text-disabled italic">
                      No Image
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-start ">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rehab-sec">
                        Exercise {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-body-lg font-bold text-text-headings">
                      {entry.exercise?.title || "Unknown Exercise"}
                    </h3>
                    <p className="text-body-sm text-text-disabled capitalize mt-1 mb-4">
                      {entry.exercise?.target_area || "General"}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.sets && entry.reps && (
                        <span className="text-[12px] font-bold bg-rehab-sec/10 text-rehab-sec px-2 py-1 rounded-md">
                          {entry.sets} sets × {entry.reps} reps
                        </span>
                      )}
                      {entry.hold_time_seconds > 0 && (
                        <span className="text-[12px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                          {entry.hold_time_seconds}s hold
                        </span>
                      )}
                      {entry.rest_seconds > 0 && (
                        <span className="text-[12px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          {entry.rest_seconds}s rest
                        </span>
                      )}
                    </div>

                    {entry.exercise?.description && (
                      <p className="text-body-sm text-text-body  mt-auto border-t border-border-primary pt-3">
                        {entry.exercise.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals / slide-overs ── */}
      <AddRoutineModal
        open={showAddRoutine}
        onClose={() => setShowAddRoutine(false)}
        plan={plan}
        onCreated={() => loadPlan()}
      />
      <RoutineSlideOver
        routine={activeRoutine}
        onClose={() => setActiveRoutine(null)}
        onRoutineUpdated={handleRoutineUpdated}
        onDeleteRoutine={handleDeleteRoutine}
      />
      <RehabSessionLogger
        open={showSessionLogger}
        onClose={() => { setShowSessionLogger(false); setSessionRoutine(null); setResumeSession(null); }}
        routine={sessionRoutine}
        planId={id}
        resumeSession={resumeSession}
        onSessionCompleted={() => {
          setShowSessionLogger(false);
          setSessionRoutine(null);
          setResumeSession(null);
          setExistingSession(null); // clear banner
        }}
      />
    </div>
  );
}
