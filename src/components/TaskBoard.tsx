import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { TEAM_MEMBERS, Task, TaskStatus, TaskPriority } from '../types';
import { 
  Plus, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  AlertOctagon, 
  MoreHorizontal, 
  Filter, 
  ChevronRight,
  Sparkles,
  ClipboardList,
  X
} from 'lucide-react';

interface TaskBoardProps {
  onSelectTask: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ onSelectTask }) => {
  const { activeProject, tasks, snags, createTask, updateTask } = useProjects();
  
  // Filtering states
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // New task form fields
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [targetColumn, setTargetColumn] = useState<TaskStatus>('todo');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskAssignee, setTaskAssignee] = useState(TEAM_MEMBERS[0].email);
  const [taskStart, setTaskStart] = useState(new Date().toISOString().split('T')[0]);
  const [taskEnd, setTaskEnd] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 1 week out
  const [submitting, setSubmitting] = useState(false);

  if (!activeProject) return null;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;
    const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchAssignee && matchPriority;
  });

  // Split into columns
  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status);
  };

  const columns: { id: TaskStatus; label: string; colorClass: string; bgClass: string }[] = [
    { id: 'todo', label: 'To Do', colorClass: 'text-slate-600 bg-slate-100 border border-slate-200', bgClass: 'bg-slate-50/40' },
    { id: 'in_progress', label: 'In Progress', colorClass: 'text-amber-700 bg-amber-50 border border-amber-200', bgClass: 'bg-slate-50/40' },
    { id: 'review', label: 'In Review', colorClass: 'text-blue-700 bg-blue-55/70 border border-blue-200', bgClass: 'bg-slate-50/40' },
    { id: 'completed', label: 'Completed', colorClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200', bgClass: 'bg-slate-50/40' }
  ];

  const handleOpenAddTask = (status: TaskStatus) => {
    setTargetColumn(status);
    setShowAddTaskModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDetails.trim()) return;

    setSubmitting(true);
    try {
      await createTask(activeProject.id, {
        title: taskTitle,
        details: taskDetails,
        status: targetColumn,
        priority: taskPriority,
        assignedTo: taskAssignee,
        timelineStart: taskStart,
        timelineEnd: taskEnd
      });

      // Reset
      setTaskTitle('');
      setTaskDetails('');
      setTaskPriority('medium');
      setShowAddTaskModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick move status helper (for touch and rapid desktops)
  const handleMoveStatus = async (e: React.MouseEvent, task: Task, direction: 'forward' | 'back') => {
    e.stopPropagation();
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed'];
    const idx = statusOrder.indexOf(task.status);
    let nextIdx = direction === 'forward' ? idx + 1 : idx - 1;
    if (nextIdx >= 0 && nextIdx < statusOrder.length) {
      await updateTask(activeProject.id, task.id, { status: statusOrder[nextIdx] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering header */}
      <div className="bg-white p-4 rounded-sm border border-slate-200 flex flex-wrap justify-between items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter Timeline Board
        </div>
        
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {/* Teammate Filter */}
          <select 
            value={filterAssignee} 
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-sm p-2 outline-none cursor-pointer uppercase tracking-wider"
          >
            <option value="all">👥 All Teammates</option>
            {TEAM_MEMBERS.map(tm => (
              <option key={tm.email} value={tm.email}>{tm.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-sm p-2 outline-none cursor-pointer uppercase tracking-wider"
          >
            <option value="all">⚡ All Priorities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = getTasksByStatus(col.id);

          return (
            <div key={col.id} className={`rounded-sm border border-slate-250 p-4 min-h-[500px] flex flex-col ${col.bgClass}`}>
              {/* Column Title */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm uppercase ${col.colorClass}`}>
                  {col.label} ({colTasks.length})
                </span>
                <button 
                  onClick={() => handleOpenAddTask(col.id)}
                  className="p-1 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-sm text-slate-400 hover:text-slate-900 transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task list container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 opacity-25 mb-1.5" />
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider">Empty stage</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = TEAM_MEMBERS.find(tm => tm.email === task.assignedTo);
                    const openSnags = snags.filter(s => s.taskId === task.id && s.status === 'open').length;

                    // Compute priority left stripe
                    const priorityLeftStripe = 
                      task.priority === 'critical' ? 'border-l-4 border-l-rose-500' :
                      task.priority === 'high' ? 'border-l-4 border-l-amber-500' :
                      task.priority === 'medium' ? 'border-l-4 border-l-blue-500' :
                      'border-l-4 border-l-emerald-500';

                    return (
                      <div 
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`bg-white p-4 rounded-sm border border-slate-200 hover:border-slate-400 hover:shadow-2xs transition-all duration-150 cursor-pointer relative group flex flex-col justify-between min-h-[140px] ${priorityLeftStripe}`}
                      >
                        {/* Task Card Header: Title and Priority badge */}
                        <div>
                          <div className="flex justify-between items-start gap-1 mb-1.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-sm font-black uppercase font-mono tracking-wider ${
                              task.priority === 'critical' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              task.priority === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {task.priority}
                            </span>
                            
                            {/* Action links */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {task.status !== 'todo' && (
                                <button
                                  onClick={(e) => handleMoveStatus(e, task, 'back')}
                                  className="p-0.5 hover:bg-slate-150 border border-slate-200 rounded-sm text-[10px]"
                                  title="Demote phase"
                                >
                                  ←
                                </button>
                              )}
                              {task.status !== 'completed' && (
                                <button
                                  onClick={(e) => handleMoveStatus(e, task, 'forward')}
                                  className="p-0.5 hover:bg-slate-150 border border-slate-200 rounded-sm text-[10px]"
                                  title="Advance phase"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 leading-snug truncate group-hover:text-slate-950 transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {task.details}
                          </p>
                        </div>

                        {/* Timeline & Metadata */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          {/* Left Metadata: Timeline start -> End */}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>DEADLINE: {task.timelineEnd.slice(5)}</span>
                          </div>

                          {/* Right Metadata: Comments, Snags, Attachments, Assignee */}
                          <div className="flex items-center gap-2">
                            {/* Snags count */}
                            {openSnags > 0 && (
                              <span 
                                className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 border border-rose-100 px-1 py-0.2 rounded-sm text-[9px] font-bold" 
                                title={`${openSnags} unresolved blockers`}
                              >
                                <AlertOctagon className="w-3 h-3" />
                                {openSnags}
                              </span>
                            )}
                            {/* Attachments */}
                            {task.attachments && task.attachments.length > 0 && (
                              <span className="text-[10px] text-slate-400 inline-flex items-center gap-0.5" title="Attachments">
                                <Paperclip className="w-3 h-3" />
                                {task.attachments.length}
                              </span>
                            )}
                            {/* Assignee Avatar */}
                            {assignee && (
                              <div 
                                className={`w-5.5 h-5.5 rounded-full ${assignee.color} flex items-center justify-center text-[9px] font-black border border-white shadow-xs`}
                                title={`${assignee.name} - ${assignee.role}`}
                              >
                                {assignee.initials}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Sparkles Bot feedback if review status */}
                        {task.status === 'review' && (
                          <div className="absolute top-2 right-2 flex items-center" title="Awaiting Teammate Review Sync">
                            <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl overflow-hidden w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                <ClipboardList className="w-4 h-4 text-slate-600" />
                Instate Project Task
              </h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Task Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Integrate Auth module, Redesign Landing Banner"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Details / Scope *
                </label>
                <textarea
                  required
                  placeholder="Elaborate on scope, target specs, deliverables, acceptance criteria..."
                  value={taskDetails}
                  onChange={(e) => setTaskDetails(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="critical">🚨 Critical Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Teammate Assignee
                  </label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                  >
                    {TEAM_MEMBERS.map(tm => (
                      <option key={tm.email} value={tm.email}>{tm.name} ({tm.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Timeline Start
                  </label>
                  <input
                    type="date"
                    value={taskStart}
                    onChange={(e) => setTaskStart(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Timeline Deadline
                  </label>
                  <input
                    type="date"
                    value={taskEnd}
                    onChange={(e) => setTaskEnd(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-sm outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-xs text-white bg-slate-900 hover:bg-slate-800 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Instate...' : 'Instate Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
