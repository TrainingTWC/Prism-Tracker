import React from 'react';
import { useProjects } from '../context/ProjectContext';
import { TEAM_MEMBERS } from '../types';
import { 
  BarChart2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Layout, 
  ExternalLink,
  Users,
  Calendar,
  Settings,
  X
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { activeProject, tasks, snags, updateProject, user } = useProjects();

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editUrl, setEditUrl] = React.useState('');
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (activeProject) {
      setEditName(activeProject.name || '');
      setEditDescription(activeProject.description || '');
      setEditUrl(activeProject.projectUrl || '');
    }
  }, [activeProject, showEditModal]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setUpdating(true);
    try {
      let formattedUrl = editUrl.trim();
      if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      await updateProject(activeProject.id, {
        name: editName,
        description: editDescription,
        projectUrl: formattedUrl
      });
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-sm border border-dashed border-slate-200">
        <Layout className="w-12 h-12 text-slate-400 mb-3" />
        <p className="text-slate-600 font-bold font-mono text-xs">SELECT OR CREATE A PROJECT TO LOAD TRACKING PIPELINE</p>
      </div>
    );
  }

  // Calculate task counts
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const reviewTasks = tasks.filter(t => t.status === 'review').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Snag counts
  const totalSnags = snags.length;
  const unresolvedSnags = snags.filter(s => s.status === 'open').length;
  const resolvedSnags = snags.filter(s => s.status === 'resolved').length;

  // Priority counts (of tasks)
  const criticalTasks = tasks.filter(t => t.priority === 'critical').length;
  const highTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowTasks = tasks.filter(t => t.priority === 'low').length;

  // Team load calculation
  const taskDistributionByTeammate = TEAM_MEMBERS.map(member => {
    const count = tasks.filter(t => t.assignedTo === member.email).length;
    const completed = tasks.filter(t => t.assignedTo === member.email && t.status === 'completed').length;
    return {
      ...member,
      count,
      completed,
      percentage: count > 0 ? Math.round((completed / count) * 100) : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Heading banner */}
      <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1">
            <span className="px-2 py-0.5 text-[9px] font-black bg-slate-900 text-white rounded-sm uppercase tracking-widest">Active System Pipeline</span>
            {activeProject.projectUrl && (
              <a 
                href={activeProject.projectUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-950 font-mono font-bold uppercase transition-colors"
                id="proj-url-link"
              >
                <ExternalLink className="w-3 h-3" />
                SYSTEM_URL
              </a>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-950 font-mono font-bold uppercase transition-colors cursor-pointer"
              id="proj-edit-btn"
              title="Edit project parameters"
            >
              <Settings className="w-3 h-3" />
              CONFIGURE
            </button>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase" id="dashboard-title">{activeProject.name}</h1>
          <p className="text-slate-500 text-xs mt-1.5 max-w-xl leading-relaxed">{activeProject.description}</p>
        </div>
        
        {/* Progress Circular Badge */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-sm border border-slate-200">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#E2E8F0" strokeWidth="4" />
              <circle 
                cx="28" 
                cy="28" 
                r="24" 
                fill="none" 
                stroke="#0F172A" 
                strokeWidth="4" 
                strokeDasharray="150.8" 
                strokeDashoffset={150.8 - (150.8 * completionRate) / 100}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-800">{completionRate}%</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Completion</div>
            <div className="text-xs font-bold text-slate-800 mt-1">{completedTasks} / {totalTasks} tasks done</div>
          </div>
        </div>
      </div>

      {/* Grid of Micro stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-sm">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tasks</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{totalTasks}</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-800 border border-blue-100 rounded-sm">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Review</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{reviewTasks}</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{inProgressTasks}</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-sm border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-sm">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hurdles / Snags</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">{unresolvedSnags}</div>
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1st Col: Task Workflow distribution (Clean Custom SVG Chart) */}
        <div className="bg-white p-5 rounded-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              Workflow Progression
            </h3>
            
            {/* Horizontal Bar Chart representation */}
            <div className="space-y-4">
              {/* Completed */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-800">Completed ({completedTasks})</span>
                  <span className="font-mono font-bold">{totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden border border-slate-150">
                  <div className="bg-slate-900 h-full rounded-xs transition-all duration-500" style={{ width: `${totalTasks > 0 ? (completedTasks/totalTasks)*100 : 0}%` }} />
                </div>
              </div>

              {/* In Review */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-800">In Review ({reviewTasks})</span>
                  <span className="font-mono font-bold">{totalTasks > 0 ? Math.round((reviewTasks/totalTasks)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden border border-slate-150">
                  <div className="bg-blue-500 h-full rounded-xs transition-all duration-500" style={{ width: `${totalTasks > 0 ? (reviewTasks/totalTasks)*100 : 0}%` }} />
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-800">In Progress ({inProgressTasks})</span>
                  <span className="font-mono font-bold">{totalTasks > 0 ? Math.round((inProgressTasks/totalTasks)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden border border-slate-150">
                  <div className="bg-amber-500 h-full rounded-xs transition-all duration-500" style={{ width: `${totalTasks > 0 ? (inProgressTasks/totalTasks)*100 : 0}%` }} />
                </div>
              </div>

              {/* To Do */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-800">To Do ({todoTasks})</span>
                  <span className="font-mono font-bold">{totalTasks > 0 ? Math.round((todoTasks/totalTasks)*100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-sm overflow-hidden border border-slate-150">
                  <div className="bg-slate-400 h-full rounded-xs transition-all duration-500" style={{ width: `${totalTasks > 0 ? (todoTasks/totalTasks)*100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono uppercase tracking-wider font-bold">
            PROGRESSION STATS RECALCULATED SECURELY
          </div>
        </div>

        {/* 2nd Col: Priorities Distribution */}
        <div className="bg-white p-5 rounded-sm border border-slate-200">
          <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-slate-700" />
            Priority Breakdown
          </h3>

          <div className="flex justify-center items-center py-2">
            {/* Compact donut representation in custom SVG */}
            <svg viewBox="0 0 100 100" className="w-28 h-28">
              {/* BG circle */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="#F1F5F9" strokeWidth="10" />
              
              {/* Dynamic segmented arcs */}
              {totalTasks === 0 ? (
                <circle cx="50" cy="50" r="35" fill="none" stroke="#E2E8F0" strokeWidth="10" />
              ) : (
                (() => {
                  let accumulatedOffset = 0;
                  const strokeWidth = 10;
                  const radius = 35;
                  const circumference = 2 * Math.PI * radius; // 219.9

                  return [
                    { label: 'Critical', val: criticalTasks, color: '#EF4444' }, // Red
                    { label: 'High', val: highTasks, color: '#F97316' },       // Orange
                    { label: 'Medium', val: mediumTasks, color: '#3B82F6' },   // Blue (matching board)
                    { label: 'Low', val: lowTasks, color: '#10B981' }         // Emerald
                  ].map((item, idx) => {
                    if (item.val === 0) return null;
                    const segmentLength = (item.val / totalTasks) * circumference;
                    const strokeDash = `${segmentLength} ${circumference - segmentLength}`;
                    const strokeOffset = circumference - accumulatedOffset;
                    accumulatedOffset += segmentLength;

                    return (
                      <circle 
                        key={idx}
                        cx="50" 
                        cy="50" 
                        r={radius} 
                        fill="none" 
                        stroke={item.color} 
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()
              )}
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span className="text-[11px] text-slate-600 font-bold">Critical ({criticalTasks})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
              <span className="text-[11px] text-slate-600 font-bold">High ({highTasks})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span className="text-[11px] text-slate-600 font-bold">Medium ({mediumTasks})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-[11px] text-slate-600 font-bold">Low ({lowTasks})</span>
            </div>
          </div>
        </div>

        {/* 3rd Col: Team Load / Assignments */}
        <div className="bg-white p-5 rounded-sm border border-slate-200">
          <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-700" />
            Teammate Task Load
          </h3>

          <div className="space-y-3.5 max-h-[190px] overflow-y-auto pr-1">
            {taskDistributionByTeammate.map((member) => (
              <div key={member.email} className="flex gap-3 items-center">
                <div className={`w-7 h-7 rounded-sm ${member.color} flex items-center justify-center font-bold text-xs tracking-wider border border-white shadow-3xs`}>
                  {member.initials}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{member.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{member.completed}/{member.count} tasks</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden mt-1 border border-slate-150">
                    <div 
                      className="bg-slate-900 h-full rounded-xs transition-all duration-500" 
                      style={{ width: `${member.count > 0 ? (member.completed/member.count)*100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Gantt Timeline Mockup for high level mapping */}
      <div className="bg-white p-5 rounded-sm border border-slate-200">
        <h3 className="font-extrabold text-slate-800 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-700" />
          General Task Timeline & Deadlines Map
        </h3>

        {tasks.length === 0 ? (
          <p className="text-slate-400 text-xs font-mono py-6 text-center uppercase">No active timelines logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-2 px-3 font-extrabold text-slate-500 text-[9px] uppercase tracking-widest">Task Title</th>
                  <th className="py-2 px-3 font-extrabold text-slate-500 text-[9px] uppercase tracking-widest">Assignee</th>
                  <th className="py-2 px-3 font-extrabold text-slate-500 text-[9px] uppercase tracking-widest">Start</th>
                  <th className="py-2 px-3 font-extrabold text-slate-500 text-[9px] uppercase tracking-widest">Deadline</th>
                  <th className="py-2 px-3 font-extrabold text-slate-500 text-[9px] uppercase tracking-widest">Timeline Graphic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.slice(0, 5).map((task) => {
                  const assignee = TEAM_MEMBERS.find(tm => tm.email === task.assignedTo);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800 truncate max-w-[200px]">{task.title}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-200 text-[10px] font-bold text-slate-600 font-mono">
                          <span className={`w-2 h-2 rounded-full ${assignee?.color || 'bg-slate-400'}`} />
                          {(assignee?.name || task.assignedTo).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[10px] text-slate-500 font-mono">{task.timelineStart}</td>
                      <td className="py-3 px-3 text-[10px] text-slate-600 font-mono font-bold">{task.timelineEnd}</td>
                      <td className="py-3 px-3 min-w-[200px]">
                        {/* Beautiful simulated horizontal bar showing timeline relative width */}
                        <div className="relative w-full bg-slate-100 h-3 rounded-xs overflow-hidden border border-slate-150">
                          <div 
                            className={`absolute top-0 h-full rounded-xs opacity-85 ${
                              task.status === 'completed' ? 'bg-slate-900' :
                              task.status === 'review' ? 'bg-blue-500' :
                              task.status === 'in_progress' ? 'bg-amber-400' : 'bg-slate-450'
                            }`}
                            style={{ 
                              left: '12%', 
                              width: '76%' 
                              // Clean geometric alignment
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tasks.length > 5 && (
              <div className="text-right text-[10px] font-black font-mono text-slate-750 uppercase mt-3">
                + {tasks.length - 5} more elements active in pipeline
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Project Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl overflow-hidden w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-widest">
                <Settings className="w-4 h-4 text-slate-700" />
                Configure Tracker Pipeline
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-sm hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Website Overhaul, iOS App Build"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Scope / Details
                </label>
                <textarea
                  placeholder="Goals, target milestones, general info overview..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Target Project URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. production-build.app, github-repo"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 text-xs text-white bg-slate-900 hover:bg-slate-800 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
