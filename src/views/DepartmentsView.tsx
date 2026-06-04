import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PageHeader, Panel, EmptyState } from '../components/shell/PageHeader';
import { Building2, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const DEPT_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
  '#F59E0B', '#EF4444', '#06B6D4', '#84CC16',
];

interface DeptForm {
  code: string;
  name: string;
  head: string;
  description: string;
  color: string;
  active: boolean;
}

const EMPTY_FORM: DeptForm = { code: '', name: '', head: '', description: '', color: '#3B82F6', active: true };

const inputSt: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7,
  color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};

export const DepartmentsView: React.FC = () => {
  const departments = useQuery(api.departments.listAll) as any[] | undefined;
  const projects = useQuery(api.projects.list, {}) as any[] | undefined;
  const createDept = useMutation(api.departments.create);
  const updateDept = useMutation(api.departments.update);
  const removeDept = useMutation(api.departments.remove);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null); // null = new
  const [form, setForm] = useState<DeptForm>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const projectCountByDept = useMemo(() => {
    const map: Record<string, number> = {};
    if (projects) for (const p of projects) map[p.departmentId] = (map[p.departmentId] || 0) + 1;
    return map;
  }, [projects]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (d: any) => {
    setEditing(d);
    setForm({ code: d.code, name: d.name, head: d.head || '', description: d.description || '', color: d.color || '#3B82F6', active: d.active });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);
    try {
      const args = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        head: form.head.trim() || undefined,
        description: form.description.trim() || undefined,
        color: form.color,
      };
      if (editing) {
        await updateDept({ id: editing._id, ...args, active: form.active });
      } else {
        await createDept(args);
      }
      closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await removeDept({ id: id as any });
    setConfirmDelete(null);
  };

  const sorted = useMemo(() =>
    [...(departments || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  );

  return (
    <>
      <PageHeader
        overline="Projects · Master Data"
        title="Departments"
        subtitle={`${sorted.filter(d => d.active).length} active departments`}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={14} /> Add department
          </button>
        }
      />

      {sorted.length === 0 ? (
        <Panel>
          <EmptyState icon={<Building2 size={24} />} title="No departments yet" hint="Add your first department to start tracking projects." />
        </Panel>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {sorted.map((d) => (
            <div key={d._id} className="glass" style={{ padding: 18, position: 'relative', opacity: d.active ? 1 : 0.5 }}>
              {/* Color stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, borderRadius: '8px 0 0 8px', background: d.color || '#3B82F6' }} />
              <div style={{ paddingLeft: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: d.color || '#3B82F6', letterSpacing: '0.08em' }}>{d.code}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0' }}>{d.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}><Pencil size={13} /></button>
                    <button onClick={() => setConfirmDelete(d._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                </div>
                {d.head && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Head: {d.head}</p>}
                {d.description && <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '0 0 8px' }}>{d.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {projectCountByDept[d._id] || 0} project{(projectCountByDept[d._id] || 0) !== 1 ? 's' : ''}
                  </span>
                  {!d.active && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '2px 7px', borderRadius: 99 }}>Inactive</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ width: 460, maxWidth: '94vw', padding: 28, position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={18} /></button>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 22px' }}>{editing ? 'Edit department' : 'New department'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Code *</label>
                  <input style={inputSt} placeholder="MKT" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} maxLength={8} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Name *</label>
                  <input style={inputSt} placeholder="Marketing" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Department head</label>
                <input style={inputSt} placeholder="Name or email" value={form.head} onChange={e => setForm(f => ({ ...f, head: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 60 }} placeholder="What does this department do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DEPT_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.color === c && <Check size={12} color="#fff" />}
                    </button>
                  ))}
                </div>
              </div>
              {editing && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}/> Active
                </label>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.name.trim() || !form.code.trim()}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create department'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div className="glass" style={{ width: 340, padding: 28, textAlign: 'center' }}>
            <Trash2 size={28} style={{ color: '#EF4444', marginBottom: 14 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Deactivate department?</h3>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 20px' }}>The department will be hidden but its projects will be preserved.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
