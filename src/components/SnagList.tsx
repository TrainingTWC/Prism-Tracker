import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { TEAM_MEMBERS, Snag, SnagStatus, SnagPriority } from '../types';
import { 
  Plus, 
  X, 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Link,
  Users,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const SnagList: React.FC = () => {
  const { activeProject, tasks, snags, createSnag, updateSnag, deleteSnag, user } = useProjects();
  const [showAddSnagModal, setShowAddSnagModal] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SnagPriority>('medium');
  const [assignedTo, setAssignedTo] = useState(TEAM_MEMBERS[0].email);
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!activeProject) return null;

  const handleCreateSnag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await createSnag(activeProject.id, {
        description,
        status: 'open',
        priority,
        taskId: linkedTaskId || null,
        assignedTo
      });

      // Reset
      setDescription('');
      setPriority('medium');
      setLinkedTaskId('');
      setShowAddSnagModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSnagStatus = async (snag: Snag) => {
    const nextStatus: SnagStatus = snag.status === 'open' ? 'resolved' : 'open';
    await updateSnag(activeProject.id, snag.id, { status: nextStatus });
  };

  return (
    <div className="space-y-4">
      {/* Header with Register button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 uppercase tracking-widest">
            <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
            Project Blockers / Snags List
          </h2>
          <p className="text-slate-500 text-[10px] font-mono font-bold uppercase mt-1">Track, assign, and clear release inhibitors</p>
        </div>
        <button
          onClick={() => setShowAddSnagModal(true)}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase cursor-pointer tracking-wider"
          id="btn-add-snag"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Blocker
        </button>
      </div>

      {/* Snags display columns/cards */}
      {snags.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-sm border border-dashed border-slate-250">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-75 mb-2" />
          <p className="text-slate-800 font-bold font-mono text-xs uppercase">Clear Skies!</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">No blockages reported on this project tracker workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snags.map((snag) => {
            const isResolved = snag.status === 'resolved';
            const assignee = TEAM_MEMBERS.find(tm => tm.email === snag.assignedTo);
            const linkedTask = tasks.find(t => t.id === snag.taskId);

            return (
              <div 
                key={snag.id}
                className={`p-4 rounded-sm border transition-all duration-150 flex flex-col justify-between ${
                  isResolved 
                    ? 'border-slate-200 bg-slate-50/50 opacity-75' 
                    : snag.priority === 'high' ? 'border-l-4 border-l-rose-500 border-slate-250 bg-white shadow-2xs' : 'border-slate-250 bg-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1 pb-2 mb-2 border-b border-slate-100">
                    <span className={`text-[9px] px-2 py-0.5 rounded-sm font-black font-mono tracking-widest uppercase ${
                      isResolved 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                        : snag.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          snag.priority === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {isResolved ? 'Resolved' : `${snag.priority} hurdle`}
                    </span>

                    <button
                      onClick={async () => {
                        if (confirm('Permanently purge this registered hurdle?')) {
                          await deleteSnag(activeProject.id, snag.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-sm"
                      title="Purge blocker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className={`text-xs leading-relaxed ${isResolved ? 'text-slate-400 line-through' : 'text-slate-850 font-medium'}`}>
                    {snag.description}
                  </p>

                  {/* Linked task if any */}
                  {linkedTask && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm text-[10px] text-slate-500 font-mono font-bold">
                      <Link className="w-2.5 h-2.5 text-slate-400" />
                      <span className="truncate">TIED: "{linkedTask.title.toUpperCase()}"</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Left: Assignee */}
                  <div className="flex items-center gap-2">
                    {assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full ${assignee.color} flex items-center justify-center text-[9px] font-black border border-white shadow-xs`}>
                          {assignee.initials}
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Unallocated</span>
                    )}
                  </div>

                  {/* Right: Toggle Resolution */}
                  <button
                    onClick={() => toggleSnagStatus(snag)}
                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-sm flex items-center gap-1 cursor-pointer transition-colors ${
                      isResolved 
                        ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-150 hover:bg-rose-100'
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <Clock className="w-3 h-3" />
                        Reopen Blocker
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Clear Blocker
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Snag / Blocker Modal */}
      {showAddSnagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl overflow-hidden w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                Register Project Blocker
              </h3>
              <button 
                onClick={() => setShowAddSnagModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSnag} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Blocker Explanation *
                </label>
                <textarea
                  required
                  placeholder="Define exactly what the bottleneck is, why it's blocked, and its impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as SnagPriority)}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                >
                  <option value="low">🟢 Low Urgency</option>
                  <option value="medium">🟡 Medium Urgency</option>
                  <option value="high">🔴 High / Fatal Blocker</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Specialist Assigned
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                  >
                    {TEAM_MEMBERS.map(tm => (
                      <option key={tm.email} value={tm.email}>{tm.name} ({tm.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Tie To Project Task
                  </label>
                  <select
                    value={linkedTaskId}
                    onChange={(e) => setLinkedTaskId(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                  >
                    <option value="">(None - General Blocker)</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSnagModal(false)}
                  className="flex-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-xs text-white bg-slate-900 hover:bg-slate-800 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Blocker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
