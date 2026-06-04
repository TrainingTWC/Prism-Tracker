import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import { ArrowLeft, Plus, X, Calendar, User, Flag, Pencil, Trash2, GripVertical } from 'lucide-react';
import type { ViewId } from '../App';

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#6B7280' },
  { id: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { id: 'review', label: 'Review', color: '#F59E0B' },
  { id: 'done', label: 'Done', color: '#22C55E' },
];

const PRIORITY_COLOR: Record<Priority, string> = {
  low: '#6B7280', medium: '#3B82F6', high: '#F59E0B', critical: '#EF4444',
};
const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};
const STATUS_COLOR: Record<ProjectStatus, string> = {
  planned: '#6B7280', active: '#3B82F6', on_hold: '#F59E0B', completed: '#22C55E', cancelled: '#EF4444',
};
const STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: 'Planned', active: 'Active', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled',
};

const inputSt: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7,
  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};
const selectSt: React.CSSProperties = { ...inputSt, cursor: 'pointer' };

interface TaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string;
  dueDate: string;
}
const EMPTY_TASK: TaskForm = { title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '' };

export const ProjectDetailView: React.FC<{ projectId?: string; onNavigate: (v: ViewId, params?: any) => void }> = ({ projectId, onNavigate }) => {
  const data = useQuery(api.projects.get, projectId ? { id: projectId as any } : 'skip') as any;
  const createTask = useMutation(api.projects.createTask);
  const updateTask = useMutation(api.projects.updateTask);
  const removeTask = useMutation(api.projects.removeTask);
  const updateProject = useMutation(api.projects.update);
  const departments = useQuery(api.departments.list) as any[] | undefined;
  const employees = useQuery(api.employees.list, {}) as any[] | undefined;

  const [taskModal, setTaskModal] = useState<{ open: boolean; columnStatus: TaskStatus; editing: any | null }>({ open: false, columnStatus: 'todo', editing: null });
  const [taskForm, setTaskForm] = useState<TaskForm>(EMPTY_TASK);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projForm, setProjForm] = useState<any>({});
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);

  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, any[]> = { todo: [], in_progress: [], review: [], done: [] };
    if (data?.tasks) {
      for (const t of data.tasks) {
        if (map[t.status as TaskStatus]) map[t.status as TaskStatus].push(t);
      }
    }
    return map;
  }, [data]);

  const openNewTask = (columnStatus: TaskStatus) => {
    setTaskModal({ open: true, columnStatus, editing: null });
    setTaskForm({ ...EMPTY_TASK, status: columnStatus });
  };

  const openEditTask = (task: any) => {
    setTaskModal({ open: true, columnStatus: task.status, editing: task });
    setTaskForm({
      title: task.title, description: task.description || '', status: task.status,
      priority: task.priority, assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    });
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim()) return;
    setSaving(true);
    try {
      const args = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        status: taskForm.status,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo.trim() || undefined,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).getTime() : undefined,
      };
      if (taskModal.editing) {
        const completedAt = taskForm.status === 'done' && taskModal.editing.status !== 'done' ? Date.now() : (taskForm.status !== 'done' ? undefined : taskModal.editing.completedAt);
        await updateTask({ id: taskModal.editing._id, ...args, completedAt });
      } else {
        await createTask({ projectId: projectId as any, ...args });
      }
      setTaskModal(m => ({ ...m, open: false }));
    } finally { setSaving(false); }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    const completedAt = newStatus === 'done' ? Date.now() : undefined;
    await updateTask({ id: taskId as any, status: newStatus, completedAt });
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      await updateProject({
        id: projectId as any,
        departmentId: projForm.departmentId,
        title: projForm.title,
        description: projForm.description || undefined,
        status: projForm.status,
        priority: projForm.priority,
        ownerEmail: projForm.ownerEmail || undefined,
        startDate: projForm.startDate ? new Date(projForm.startDate).getTime() : undefined,
        endDate: projForm.endDate ? new Date(projForm.endDate).getTime() : undefined,
      });
      setEditingProject(false);
    } finally { setSaving(false); }
  };

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Loading…</span>
    </div>
  );

  const dept = data.department;
  const totalTasks = data.tasks?.length || 0;
  const doneTasks = data.tasks?.filter((t: any) => t.status === 'done').length || 0;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Back nav */}
      <button onClick={() => onNavigate('projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={13} /> All Projects
      </button>

      <PageHeader
        overline={dept ? `${dept.code} · ${dept.name}` : 'Projects'}
        title={data.title}
        subtitle={
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${STATUS_COLOR[data.status as ProjectStatus]}18`, color: STATUS_COLOR[data.status as ProjectStatus] }}>
              {STATUS_LABEL[data.status as ProjectStatus]?.toUpperCase()}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: `${PRIORITY_COLOR[data.priority as Priority]}18`, color: PRIORITY_COLOR[data.priority as Priority] }}>
              {PRIORITY_LABEL[data.priority as Priority]}
            </span>
            {data.ownerEmail && <span style={{ fontSize: 11 }}>{data.ownerEmail}</span>}
            {totalTasks > 0 && <span style={{ fontSize: 11 }}>{doneTasks}/{totalTasks} tasks · {pct}%</span>}
          </span>
        }
        actions={
          <button className="btn-secondary" onClick={() => { setProjForm({ ...data, startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0,10) : '', endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0,10) : '' }); setEditingProject(true); }}>
            <Pencil size={13} /> Edit project
          </button>
        }
      />

      {/* Progress bar */}
      {totalTasks > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22C55E' : '#3B82F6', borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
        {COLUMNS.map((col) => {
          const tasks = tasksByColumn[col.id];
          return (
            <div key={col.id}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>{col.label.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 99 }}>{tasks.length}</span>
                </div>
                <button onClick={() => openNewTask(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2, display: 'flex', alignItems: 'center' }} title="Add task">
                  <Plus size={14} />
                </button>
              </div>

              {/* Task cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map((task: any) => (
                  <div key={task._id} className="glass" style={{ padding: 12, cursor: 'pointer' }} onClick={() => openEditTask(task)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1 }}>{task.title}</span>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteTask(task._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0 0 0 4px', flexShrink: 0 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                    {task.description && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '0 0 8px', lineHeight: 1.4 }}>{task.description}</p>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: `${PRIORITY_COLOR[task.priority as Priority]}18`, color: PRIORITY_COLOR[task.priority as Priority] }}>
                        {PRIORITY_LABEL[task.priority as Priority].toUpperCase()}
                      </span>
                      {task.assignedTo && (
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <User size={9} />{task.assignedTo}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: 10, color: task.dueDate < Date.now() && task.status !== 'done' ? '#EF4444' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Calendar size={9} />{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    {/* Move buttons */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {COLUMNS.filter(c => c.id !== col.id).map(c => (
                        <button key={c.id} onClick={e => { e.stopPropagation(); handleMoveTask(task._id, c.id); }}
                          style={{ fontSize: 9, padding: '2px 6px', borderRadius: 5, border: `1px solid ${c.color}40`, background: `${c.color}10`, color: c.color, cursor: 'pointer', fontFamily: 'inherit' }}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Add task placeholder */}
                <button onClick={() => openNewTask(col.id)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.08)', background: 'transparent', color: 'var(--text-tertiary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Plus size={12} /> Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task modal */}
      {taskModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: 460, maxWidth: '94vw', padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setTaskModal(m => ({ ...m, open: false }))} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 22px' }}>{taskModal.editing ? 'Edit task' : 'New task'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Title *</label>
                <input style={inputSt} placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 60 }} placeholder="Details…" value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Status</label>
                  <select style={selectSt} value={taskForm.status} onChange={e => setTaskForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Priority</label>
                  <select style={selectSt} value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                    {(['low','medium','high','critical'] as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Assigned to</label>
                {employees && employees.length > 0 ? (
                  <select style={selectSt} value={taskForm.assignedTo} onChange={e => setTaskForm(f => ({ ...f, assignedTo: e.target.value }))}>
                    <option value="">— Unassigned —</option>
                    {employees.map((emp: any) => (
                      <option key={emp._id} value={emp.name}>
                        {emp.name}{emp.designation ? ` · ${emp.designation}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input style={inputSt} placeholder="Name or email" value={taskForm.assignedTo} onChange={e => setTaskForm(f => ({ ...f, assignedTo: e.target.value }))} />
                )}
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Due date</label>
                <input style={inputSt} type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button className="btn-secondary" onClick={() => setTaskModal(m => ({ ...m, open: false }))}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveTask} disabled={saving || !taskForm.title.trim()}>
                {saving ? 'Saving…' : taskModal.editing ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit project modal */}
      {editingProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: 500, maxWidth: '94vw', padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setEditingProject(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 22px' }}>Edit project</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Department</label>
                <select style={selectSt} value={projForm.departmentId} onChange={e => setProjForm((f: any) => ({ ...f, departmentId: e.target.value }))}>
                  {(departments || []).map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Title</label>
                <input style={inputSt} value={projForm.title || ''} onChange={e => setProjForm((f: any) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 64 }} value={projForm.description || ''} onChange={e => setProjForm((f: any) => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Status</label>
                  <select style={selectSt} value={projForm.status || 'active'} onChange={e => setProjForm((f: any) => ({ ...f, status: e.target.value }))}>
                    {(['planned','active','on_hold','completed','cancelled'] as ProjectStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Priority</label>
                  <select style={selectSt} value={projForm.priority || 'medium'} onChange={e => setProjForm((f: any) => ({ ...f, priority: e.target.value }))}>
                    {(['low','medium','high','critical'] as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Owner email</label>
                <input style={inputSt} type="email" value={projForm.ownerEmail || ''} onChange={e => setProjForm((f: any) => ({ ...f, ownerEmail: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Start date</label>
                  <input style={inputSt} type="date" value={projForm.startDate || ''} onChange={e => setProjForm((f: any) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>End date</label>
                  <input style={inputSt} type="date" value={projForm.endDate || ''} onChange={e => setProjForm((f: any) => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button className="btn-secondary" onClick={() => setEditingProject(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveProject} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete task confirm */}
      {confirmDeleteTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="glass" style={{ width: 320, padding: 28, textAlign: 'center' }}>
            <Trash2 size={28} style={{ color: '#EF4444', marginBottom: 14 }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Delete task?</h3>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 20px' }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setConfirmDeleteTask(null)}>Cancel</button>
              <button className="btn-danger" onClick={async () => { await removeTask({ id: confirmDeleteTask as any }); setConfirmDeleteTask(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
