import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PageHeader, Panel, EmptyState } from '../components/shell/PageHeader';
import { FolderKanban, Plus, X, ChevronRight, Calendar } from 'lucide-react';
import type { ViewId } from '../App';

type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'critical';

const STATUS_COLOR: Record<ProjectStatus, string> = {
  planned: '#6B7280',
  active: '#3B82F6',
  on_hold: '#F59E0B',
  completed: '#22C55E',
  cancelled: '#EF4444',
};
const STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: 'Planned', active: 'Active', on_hold: 'On Hold', completed: 'Completed', cancelled: 'Cancelled',
};
const PRIORITY_COLOR: Record<Priority, string> = {
  low: '#6B7280', medium: '#3B82F6', high: '#F59E0B', critical: '#EF4444',
};
const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

const inputSt: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7,
  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};
const selectSt: React.CSSProperties = { ...inputSt, cursor: 'pointer' };

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => (
  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em',
    background: `${STATUS_COLOR[status]}18`, color: STATUS_COLOR[status] }}>
    {STATUS_LABEL[status].toUpperCase()}
  </span>
);
const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => (
  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
    background: `${PRIORITY_COLOR[priority]}18`, color: PRIORITY_COLOR[priority] }}>
    {PRIORITY_LABEL[priority]}
  </span>
);

interface ProjectForm {
  departmentId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  ownerEmail: string;
  startDate: string;
  endDate: string;
}
const EMPTY_FORM: ProjectForm = {
  departmentId: '', title: '', description: '', status: 'planned', priority: 'medium', ownerEmail: '', startDate: '', endDate: '',
};

export const ProjectsView: React.FC<{ onNavigate: (v: ViewId, params?: any) => void }> = ({ onNavigate }) => {
  const departments = useQuery(api.departments.list) as any[] | undefined;
  const allProjects = useQuery(api.projects.list, {}) as any[] | undefined;
  const createProject = useMutation(api.projects.create);
  const removeProject = useMutation(api.projects.remove);

  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const deptMap = useMemo(() => {
    const m: Record<string, any> = {};
    if (departments) for (const d of departments) m[d._id] = d;
    return m;
  }, [departments]);

  const filtered = useMemo(() => {
    let list = allProjects || [];
    if (deptFilter !== 'all') list = list.filter(p => p.departmentId === deptFilter);
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (priorityFilter !== 'all') list = list.filter(p => p.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    return list;
  }, [allProjects, deptFilter, statusFilter, priorityFilter, search]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, departmentId: departments?.[0]?._id || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.departmentId) return;
    setSaving(true);
    try {
      await createProject({
        departmentId: form.departmentId as any,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        priority: form.priority,
        ownerEmail: form.ownerEmail.trim() || undefined,
        startDate: form.startDate ? new Date(form.startDate).getTime() : undefined,
        endDate: form.endDate ? new Date(form.endDate).getTime() : undefined,
      });
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader
        overline="Projects · All"
        title="Projects"
        subtitle={`${filtered.length} project${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <button className="btn-primary" onClick={openCreate} disabled={!departments?.length}>
            <Plus size={14} /> New project
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...inputSt, width: 200, padding: '7px 10px' }} placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...selectSt, width: 'auto', padding: '7px 10px' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="all">All departments</option>
          {(departments || []).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select style={{ ...selectSt, width: 'auto', padding: '7px 10px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {(['planned','active','on_hold','completed','cancelled'] as ProjectStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select style={{ ...selectSt, width: 'auto', padding: '7px 10px' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="all">All priorities</option>
          {(['low','medium','high','critical'] as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState icon={<FolderKanban size={24} />} title="No projects found" hint={allProjects?.length === 0 ? 'Create your first project to get started.' : 'Try adjusting your filters.'} />
        </Panel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p) => {
            const dept = deptMap[p.departmentId];
            return (
              <div key={p._id} className="glass" style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'opacity 0.1s' }}
                onClick={() => onNavigate('project-detail', { projectId: p._id })}>
                {dept && <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: dept.color || '#3B82F6', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</span>
                    <StatusBadge status={p.status} />
                    <PriorityBadge priority={p.priority} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {dept && <span style={{ fontSize: 11, color: dept.color || 'var(--text-tertiary)', fontWeight: 600 }}>{dept.code} · {dept.name}</span>}
                    {p.ownerEmail && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.ownerEmail}</span>}
                    {(p.startDate || p.endDate) && (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={11} />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}
                        {' → '}
                        {p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                      </span>
                    )}
                    {p.description && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{p.description}</span>}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}

      {/* New project modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: 500, maxWidth: '94vw', padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 22px' }}>New project</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Department *</label>
                <select style={selectSt} value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
                  <option value="">Select department</option>
                  {(departments || []).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Title *</label>
                <input style={inputSt} placeholder="Project title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 64 }} placeholder="What is this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Status</label>
                  <select style={selectSt} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                    {(['planned','active','on_hold','completed','cancelled'] as ProjectStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Priority</label>
                  <select style={selectSt} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                    {(['low','medium','high','critical'] as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Owner email</label>
                <input style={inputSt} placeholder="owner@company.com" type="email" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Start date</label>
                  <input style={inputSt} type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>End date</label>
                  <input style={inputSt} type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.title.trim() || !form.departmentId}>
                {saving ? 'Creating…' : 'Create project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
