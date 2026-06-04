import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTrackerData } from '../lib/useTrackerData';
import { PageHeader, Panel } from '../components/shell/PageHeader';
import {
  Shield, Users, Store, Database,
  Save, Download, RefreshCw, CheckCircle, AlertCircle,
  Crown, Lock, Upload, FileText, ArrowRight,
} from 'lucide-react';
import type { ViewId } from '../App';

type Role = 'viewer' | 'editor' | 'admin' | 'super_admin';

const ROLE_COLOR: Record<Role, string> = {
  viewer: '#6B7280',
  editor: '#3B82F6',
  admin: '#A855F7',
  super_admin: '#F59E0B',
};
const ROLE_LABEL: Record<Role, string> = {
  viewer: 'Viewer',
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const inputSt: React.CSSProperties = {
  padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
  background: 'var(--input-bg)', border: '1px solid var(--border-subtle)',
  borderRadius: 8, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
};

export const AdminView: React.FC<{ user: any; onNavigate: (v: ViewId) => void }> = ({ user, onNavigate }) => {
  const profiles = useQuery(api.admin.listUsers);
  const setUserRoleMut = useMutation(api.admin.setUserRole);
  const claimSuperAdminMut = useMutation(api.admin.claimSuperAdmin);
  const bulkPatchStoresMut = useMutation(api.admin.bulkPatchStores);
  const { stores } = useTrackerData();

  const [tab, setTab] = useState<'stores' | 'users' | 'data'>('stores');

  /* ── Users tab state ── */
  const [roleChanges, setRoleChanges] = useState<Record<string, Role>>({});
  const [savingRoles, setSavingRoles] = useState(false);
  const [roleMsg, setRoleMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [claiming, setClaiming] = useState(false);

  /* ── Stores tab state ── */
  const [edits, setEdits] = useState<Record<string, Record<string, string | boolean>>>({});
  const [storeSearch, setStoreSearch] = useState('');
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /* ── Derived ── */
  const hasSuperAdmin = profiles?.some((p: any) => p.role === 'super_admin');
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;
  const dirtyCount = Object.keys(edits).length;
  const missingCount = stores.filter(
    (s) => !s.coffeeMachine || !s.merrychefType || !s.storeFormat || !s.menuType
  ).length;

  const filteredStores = useMemo(() => {
    let s = stores.slice().sort((a, b) => a.storeCode.localeCompare(b.storeCode));
    if (showIncomplete) s = s.filter((st) => !st.coffeeMachine || !st.merrychefType || !st.storeFormat || !st.menuType);
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      s = s.filter((st) =>
        st.storeName.toLowerCase().includes(q) ||
        st.storeCode.toLowerCase().includes(q) ||
        (st.region || '').toLowerCase().includes(q) ||
        (st.city || '').toLowerCase().includes(q) ||
        (st.areaManager || '').toLowerCase().includes(q)
      );
    }
    return s;
  }, [stores, showIncomplete, storeSearch]);

  /* ── Store cell helpers ── */
  const getVal = (id: string, field: string, orig: string) =>
    (edits[id]?.[field] as string) ?? (orig || '');

  const isDirty = (id: string, field: string) => edits[id]?.[field] !== undefined;

  const setCell = (id: string, field: string, value: string, orig: string) => {
    setEdits((prev) => {
      const row = { ...(prev[id] || {}) };
      if (value === (orig || '')) { delete row[field]; }
      else { row[field] = value; }
      if (Object.keys(row).length === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: row };
    });
  };

  const setActive = (id: string, value: boolean, orig: boolean) => {
    setEdits((prev) => {
      const row = { ...(prev[id] || {}) };
      if (value === orig) { delete row['active']; }
      else { row['active'] = value; }
      if (Object.keys(row).length === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: row };
    });
  };

  /* ── Actions ── */
  const handleBulkSave = async () => {
    setSaving(true); setSaveMsg(null);
    try {
      const patches = Object.entries(edits).map(([id, fields]) => ({
        id: id as any,
        ...(Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)) as any),
      }));
      const count = await bulkPatchStoresMut({ patches });
      setEdits({});
      setSaveMsg({ ok: true, text: `✓ ${count} store${count !== 1 ? 's' : ''} saved successfully` });
      setTimeout(() => setSaveMsg(null), 5000);
    } catch (e: any) {
      setSaveMsg({ ok: false, text: `Error: ${e.message}` });
    } finally { setSaving(false); }
  };

  const handleSaveRoles = async () => {
    setSavingRoles(true); setRoleMsg(null);
    try {
      for (const [profileId, role] of Object.entries(roleChanges)) {
        await setUserRoleMut({ profileId: profileId as any, role });
      }
      setRoleChanges({});
      setRoleMsg({ ok: true, text: '✓ Roles updated' });
      setTimeout(() => setRoleMsg(null), 3000);
    } catch (e: any) {
      setRoleMsg({ ok: false, text: `Error: ${e.message}` });
    } finally { setSavingRoles(false); }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimSuperAdminMut({
        email: user.email, name: user.name || user.email,
      });
    } catch (e: any) { alert(e.message || 'Failed to claim Super Admin'); }
    finally { setClaiming(false); }
  };

  const downloadCSV = () => {
    const headers = ['Store Code','Store Name','Region','City','Area Manager','Format','Menu Type','Coffee Machine','Merrychef','Active'];
    const rows = stores.map((s) => [
      s.storeCode, s.storeName, s.region, s.city, s.areaManager,
      s.storeFormat, s.menuType, s.coffeeMachine, s.merrychefType, s.active ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map((r) =>
      r.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'stores-export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Access denied / claim ── */
  if (!isAdmin) {
    return (
      <>
        <PageHeader overline="Admin · Access Control" title="Admin Panel" subtitle="Role-based administration" />
        <Panel>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            {!hasSuperAdmin ? (
              <>
                <Crown size={44} style={{ color: '#F59E0B', marginBottom: 18 }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>
                  No Super Admin exists yet
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 28px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                  You're logged in as <strong>{user?.email}</strong> with role <strong>{user?.role || 'viewer'}</strong>.
                  Be the first to claim Super Admin access — this grants full control over all users and data.
                </p>
                <button className="btn-primary" onClick={handleClaim} disabled={claiming}
                  style={{ padding: '11px 28px', fontSize: 14 }}>
                  {claiming ? 'Claiming…' : '👑 Claim Super Admin'}
                </button>
              </>
            ) : (
              <>
                <Lock size={44} style={{ color: '#6B7280', marginBottom: 18 }} />
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: 'var(--text-primary)' }}>
                  Admin access required
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                  Your current role is <strong style={{ color: ROLE_COLOR[user?.role as Role] || '#6B7280' }}>{ROLE_LABEL[user?.role as Role] || user?.role || 'Viewer'}</strong>.
                  Contact your Super Admin to get elevated access.
                </p>
              </>
            )}
          </div>
        </Panel>
      </>
    );
  }

  /* ── Tab bar styles ── */
  const tabSt = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
    background: active ? 'var(--signal-500)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <>
      <style>{`
        .ace-input {
          width:100%; padding:4px 6px; font-size:12px; font-family:inherit;
          background:transparent; border:1px solid rgba(255,255,255,0.07);
          border-radius:5px; color:var(--text-primary); outline:none; box-sizing:border-box;
          transition:border-color 0.12s, background 0.12s;
        }
        .ace-input:focus { border-color:var(--border-subtle); background:var(--input-bg); }
        .ace-input.dirty { border-color:rgba(234,179,8,0.45); background:rgba(234,179,8,0.07); }
        .ace-input.dirty:focus { background:rgba(234,179,8,0.12); }
      `}</style>

      <PageHeader
        overline={`Admin · ${isSuperAdmin ? 'Super Admin' : 'Admin'}`}
        title="Admin Panel"
        subtitle={`${stores.length} stores · ${profiles?.length ?? 0} users`}
        actions={
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
            background: `${ROLE_COLOR[(user?.role || 'viewer') as Role]}18`,
            border: `1px solid ${ROLE_COLOR[(user?.role || 'viewer') as Role]}40`,
            color: ROLE_COLOR[(user?.role || 'viewer') as Role], fontSize: 12, fontWeight: 700 }}>
            {isSuperAdmin ? <Crown size={13} /> : <Shield size={13} />}
            {ROLE_LABEL[(user?.role || 'viewer') as Role] || user?.role}
          </span>
        }
      />

      {/* Tab bar */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--card-bg)',
        borderRadius:10, padding:4, width:'fit-content', border:'1px solid var(--border-subtle)' }}>
        <button style={tabSt(tab === 'stores')} onClick={() => setTab('stores')}>
          <Store size={13} /> Bulk Store Editor
        </button>
        {isSuperAdmin && (
          <button style={tabSt(tab === 'users')} onClick={() => setTab('users')}>
            <Users size={13} /> User Management
          </button>
        )}
        <button style={tabSt(tab === 'data')} onClick={() => setTab('data')}>
          <Database size={13} /> Data Tools
        </button>
      </div>

      {/* ═══════════ STORES TAB ═══════════ */}
      {tab === 'stores' && (
        <Panel title="Bulk Store Editor"
          subtitle="Edit every field for all stores in one place — changed cells highlight amber — click Save to write to database">

          {/* Toolbar */}
          <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            <input style={{ ...inputSt, maxWidth:280, width:'100%' }}
              placeholder="Search code, name, region, city, area manager…"
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
            />
            <button className="btn-ghost"
              onClick={() => setShowIncomplete((f) => !f)}
              style={{ padding:'8px 12px', fontSize:12, whiteSpace:'nowrap',
                background: showIncomplete ? 'rgba(234,179,8,0.1)' : undefined,
                color: showIncomplete ? '#EAB308' : undefined }}>
              {showIncomplete ? '⚠ Incomplete only' : 'Show incomplete'}
              {missingCount > 0 && (
                <span style={{ marginLeft:6, background:'#EAB308', color:'#000',
                  borderRadius:10, padding:'1px 6px', fontSize:10, fontWeight:700 }}>
                  {missingCount}
                </span>
              )}
            </button>
            <div style={{ flex:1 }} />
            <button className="btn-ghost" onClick={downloadCSV}
              style={{ padding:'8px 12px', fontSize:12, whiteSpace:'nowrap' }}>
              <Download size={12} /> Download CSV
            </button>
            {dirtyCount > 0 && (
              <>
                <button className="btn-ghost"
                  onClick={() => setEdits({})}
                  style={{ padding:'8px 12px', fontSize:12, color:'#EF4444', whiteSpace:'nowrap' }}>
                  Reset
                </button>
                <button className="btn-primary" disabled={saving} onClick={handleBulkSave}
                  style={{ padding:'8px 18px', fontSize:12, whiteSpace:'nowrap' }}>
                  {saving
                    ? <><RefreshCw size={12} style={{ animation:'spin 1s linear infinite' }} /> Saving…</>
                    : <><Save size={12} /> Save {dirtyCount} change{dirtyCount !== 1 ? 's' : ''}</>}
                </button>
              </>
            )}
          </div>

          {saveMsg && (
            <div style={{ display:'flex', gap:8, alignItems:'center', padding:'9px 14px',
              borderRadius:8, marginBottom:12,
              background: saveMsg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${saveMsg.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
              {saveMsg.ok
                ? <CheckCircle size={13} color="#22C55E" />
                : <AlertCircle size={13} color="#EF4444" />}
              <span style={{ fontSize:12, color: saveMsg.ok ? '#22C55E' : '#EF4444' }}>{saveMsg.text}</span>
            </div>
          )}

          <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>
            Showing {filteredStores.length} of {stores.length} stores
            {dirtyCount > 0 && (
              <span style={{ color:'#EAB308', marginLeft:8 }}>
                · {dirtyCount} row{dirtyCount !== 1 ? 's' : ''} modified (unsaved)
              </span>
            )}
          </p>

          <div style={{ overflowX:'auto', overflowY:'auto', maxHeight:'65vh' }}>
            <table className="prism-table" style={{ tableLayout:'fixed', minWidth:1180 }}>
              <colgroup>
                <col style={{ width:75 }} />
                <col style={{ width:165 }} />
                <col style={{ width:105 }} />
                <col style={{ width:105 }} />
                <col style={{ width:140 }} />
                <col style={{ width:105 }} />
                <col style={{ width:105 }} />
                <col style={{ width:130 }} />
                <col style={{ width:130 }} />
                <col style={{ width:60 }} />
              </colgroup>
              <thead style={{ position:'sticky', top:0, zIndex:2, background:'var(--card-bg)' }}>
                <tr>
                  <th>Code</th>
                  <th>Store Name</th>
                  <th>Region</th>
                  <th>City</th>
                  <th>Area Manager</th>
                  <th>Format</th>
                  <th>Menu Type</th>
                  <th>Coffee Machine</th>
                  <th>Merrychef</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((s) => {
                  const rowDirty = !!edits[s._id];
                  const ci = (field: string) =>
                    `ace-input${isDirty(s._id, field) ? ' dirty' : ''}`;
                  return (
                    <tr key={s._id} style={{ background: rowDirty ? 'rgba(234,179,8,0.025)' : undefined }}>
                      <td>
                        <input className={ci('storeCode')}
                          value={getVal(s._id, 'storeCode', s.storeCode)}
                          onChange={(e) => setCell(s._id, 'storeCode', e.target.value, s.storeCode)} />
                      </td>
                      <td>
                        <input className={ci('storeName')}
                          value={getVal(s._id, 'storeName', s.storeName)}
                          onChange={(e) => setCell(s._id, 'storeName', e.target.value, s.storeName)} />
                      </td>
                      <td>
                        <input className={ci('region')}
                          value={getVal(s._id, 'region', s.region)}
                          onChange={(e) => setCell(s._id, 'region', e.target.value, s.region)} />
                      </td>
                      <td>
                        <input className={ci('city')}
                          value={getVal(s._id, 'city', s.city)}
                          onChange={(e) => setCell(s._id, 'city', e.target.value, s.city)} />
                      </td>
                      <td>
                        <input className={ci('areaManager')}
                          value={getVal(s._id, 'areaManager', s.areaManager)}
                          onChange={(e) => setCell(s._id, 'areaManager', e.target.value, s.areaManager)} />
                      </td>
                      <td>
                        <input className={ci('storeFormat')}
                          value={getVal(s._id, 'storeFormat', s.storeFormat)}
                          onChange={(e) => setCell(s._id, 'storeFormat', e.target.value, s.storeFormat)} />
                      </td>
                      <td>
                        <input className={ci('menuType')}
                          value={getVal(s._id, 'menuType', s.menuType)}
                          onChange={(e) => setCell(s._id, 'menuType', e.target.value, s.menuType)} />
                      </td>
                      <td>
                        <input className={ci('coffeeMachine')}
                          placeholder="Not set"
                          value={getVal(s._id, 'coffeeMachine', s.coffeeMachine)}
                          onChange={(e) => setCell(s._id, 'coffeeMachine', e.target.value, s.coffeeMachine)} />
                      </td>
                      <td>
                        <input className={ci('merrychefType')}
                          placeholder="Not set"
                          value={getVal(s._id, 'merrychefType', s.merrychefType)}
                          onChange={(e) => setCell(s._id, 'merrychefType', e.target.value, s.merrychefType)} />
                      </td>
                      <td style={{ textAlign:'center' }}>
                        <input type="checkbox"
                          checked={edits[s._id]?.active !== undefined
                            ? (edits[s._id].active as boolean)
                            : s.active}
                          onChange={(e) => setActive(s._id, e.target.checked, s.active)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ═══════════ USERS TAB (super_admin only) ═══════════ */}
      {tab === 'users' && isSuperAdmin && (
        <Panel title="User Management" subtitle="Assign roles to registered users · changes take effect on next login">
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginBottom:14, alignItems:'center' }}>
            {roleMsg && (
              <div style={{ display:'flex', gap:6, alignItems:'center', fontSize:12,
                color: roleMsg.ok ? '#22C55E' : '#EF4444' }}>
                {roleMsg.ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {roleMsg.text}
              </div>
            )}
            {Object.keys(roleChanges).length > 0 && (
              <button className="btn-primary" disabled={savingRoles} onClick={handleSaveRoles}
                style={{ padding:'8px 16px', fontSize:12 }}>
                {savingRoles ? 'Saving…' : `Save ${Object.keys(roleChanges).length} role change${Object.keys(roleChanges).length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>

          {!profiles || profiles.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:'24px 0' }}>
              No user profiles found. Users appear here after first login.
            </p>
          ) : (
            <table className="prism-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Current Role</th>
                  <th>Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {(profiles as any[]).map((p) => {
                  const currentRole = (roleChanges[p._id] || p.role) as Role;
                  const isPending = !!roleChanges[p._id];
                  return (
                    <tr key={p._id}>
                      <td style={{ color:'var(--text-secondary)', fontSize:12 }}>{p.email}</td>
                      <td style={{ fontWeight:600 }}>{p.name || '—'}</td>
                      <td>
                        <span style={{ padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:700,
                          background: `${ROLE_COLOR[p.role as Role] || '#6B7280'}18`,
                          color: ROLE_COLOR[p.role as Role] || '#6B7280', border: `1px solid ${ROLE_COLOR[p.role as Role] || '#6B7280'}30` }}>
                          {ROLE_LABEL[p.role as Role] || p.role}
                        </span>
                      </td>
                      <td>
                        <select
                          value={currentRole}
                          onChange={(e) => {
                            const newRole = e.target.value as Role;
                            if (newRole === p.role) {
                              const { [p._id]: _, ...rest } = roleChanges;
                              setRoleChanges(rest);
                            } else {
                              setRoleChanges((prev) => ({ ...prev, [p._id]: newRole }));
                            }
                          }}
                          style={{ ...inputSt, padding:'5px 10px', fontSize:12, width:'auto',
                            borderColor: isPending ? 'rgba(234,179,8,0.5)' : undefined,
                            background: isPending ? 'rgba(234,179,8,0.06)' : 'var(--input-bg)' }}>
                          {(['viewer','editor','admin','super_admin'] as Role[]).map((r) => (
                            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      {/* ═══════════ DATA TOOLS TAB ═══════════ */}
      {tab === 'data' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
          {[
            {
              icon: <Upload size={24} />, color:'#3B82F6', view: 'import' as ViewId,
              title:'Import Data',
              desc:'Sync from Google Sheets or upload a CSV/Excel file with stores and initiatives.',
            },
            {
              icon: <Download size={24} />, color:'#22C55E', view: 'export' as ViewId,
              title:'Export Data',
              desc:'Download stores, rollouts, or initiative data as CSV or Excel.',
            },
            {
              icon: <FileText size={24} />, color:'#A855F7', view: 'audit' as ViewId,
              title:'Audit Log',
              desc:'View all data changes, imports, and user actions with timestamps.',
            },
            {
              icon: <Store size={24} />, color:'#F59E0B', view: 'stores' as ViewId,
              title:'All Stores',
              desc:'View the full store list with rollout counts and health.',
            },
          ].map((item) => (
            <button key={item.view} className="widget"
              onClick={() => onNavigate(item.view)}
              style={{ padding:24, textAlign:'left', cursor:'pointer', border:`1px solid ${item.color}20`,
                background:'var(--card-bg)', color:'inherit', font:'inherit', width:'100%' }}>
              <div style={{ color:item.color, marginBottom:14 }}>{item.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 6px', color:'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 14px', lineHeight:1.5 }}>
                {item.desc}
              </p>
              <span style={{ fontSize:11, color:item.color, display:'flex', alignItems:'center', gap:4, fontWeight:600 }}>
                Open <ArrowRight size={12} />
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};
