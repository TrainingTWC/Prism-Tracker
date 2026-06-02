import React, { useState, useRef } from 'react';
import { useProjects } from '../context/ProjectContext';
import { TEAM_MEMBERS, Task, TaskStatus, TaskPriority } from '../types';
import { 
  X, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  Trash2, 
  UploadCloud, 
  Send,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { 
    activeProject, 
    updateTask, 
    deleteTask, 
    comments, 
    addComment, 
    addAttachment, 
    removeAttachment,
    user 
  } = useProjects();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [commentText, setCommentText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  if (!activeProject) return null;

  const taskComments = comments[task.id] || [];
  const assignee = TEAM_MEMBERS.find(tm => tm.email === task.assignedTo);

  // Status transitions
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateTask(activeProject.id, task.id, { status: e.target.value as TaskStatus });
  };

  // Priority transitions
  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateTask(activeProject.id, task.id, { priority: e.target.value as TaskPriority });
  };

  // Assignee change
  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateTask(activeProject.id, task.id, { assignedTo: e.target.value });
  };

  // Timeline changes
  const handleDeadlineChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await updateTask(activeProject.id, task.id, { timelineEnd: e.target.value });
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (confirm("Are you sure you want to delete this task? All comment threads and attachment listings on this task will be permanently expunged.")) {
      await deleteTask(activeProject.id, task.id);
      onClose();
    }
  };

  // Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      await addComment(activeProject.id, task.id, commentText);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  // File Upload Handlers (Drag & Drop + Click)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await addAttachment(activeProject.id, task.id, file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await addAttachment(activeProject.id, task.id, file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Formatting helper for byte sizes
  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      {/* Outer Click Boundary */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row">
        
        {/* LEFT PANEL: Task Parameters & Attachments */}
        <div className="flex-1 p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-200 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[9px] bg-slate-950 text-white px-2 py-0.5 rounded-sm font-black font-mono tracking-widest uppercase">
                TASK WORKSPACE
              </span>
              <h2 className="text-base font-black text-slate-900 mt-2 leading-snug uppercase tracking-tight">{task.title}</h2>
            </div>
          </div>

          {/* Details / Body */}
          <div className="bg-slate-50 p-4 rounded-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Task Details / Objectives Code
            </h3>
            <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
              {task.details}
            </p>
          </div>

          {/* Attachments Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-slate-400" />
              File Attachments ({task.attachments?.length || 0}/10 limits)
            </h3>

            {/* Drag & Drop Card */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 ${
                dragActive 
                  ? 'border-slate-900 bg-slate-50' 
                  : 'border-slate-250 hover:border-slate-900 hover:bg-slate-50/40'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              <UploadCloud className="w-5 h-5 text-slate-400" />
              <p className="text-xs text-slate-700 font-bold font-mono">
                DRAG, DROP or <span className="text-slate-900 underline">BROWSE</span> FILES TO ATTACH
              </p>
              <p className="text-[9.5px] text-slate-400 font-mono">PDF, PNG, CSV, etc. (MAX 10 PER TASK)</p>
            </div>

            {/* Attached files list */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-2">
                {task.attachments.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-sm border border-slate-205 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-slate-200 text-slate-800 rounded-sm">
                        <Paperclip className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate" title={file.name}>{file.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(file.size)} • Attached by {file.uploadedBy.split('@')[0]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async () => {
                          if (confirm(`Expunge ${file.name}?`)) {
                            await removeAttachment(activeProject.id, task.id, file.url);
                          }
                        }}
                        className="p-1 hover:bg-white rounded-sm text-rose-600 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Task Boundary for Active Project Members */}
          <div className="pt-2 flex justify-between border-t border-slate-200">
            <button
              onClick={handleDeleteTask}
              role="button"
              className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-sm text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Expunge Task
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Controls, Assignees, Real-sync Chat threads */}
        <div className="w-full md:w-[380px] bg-slate-50 p-6 flex flex-col h-full overflow-hidden max-h-[85vh] justify-between border-t md:border-t-0 border-slate-200">
          
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Header and Close */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-slate-850" />
                Parameters & Logs
              </span>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-sm hover:bg-slate-200"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Status, Priority, Assignee Selectors */}
            <div className="space-y-4">
              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Workflow Track Status
                </label>
                <select 
                  value={task.status}
                  onChange={handleStatusChange}
                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                >
                  <option value="todo">📋 To Do</option>
                  <option value="in_progress">🏗️ In Progress</option>
                  <option value="review">🔬 In Review</option>
                  <option value="completed">🏆 Completed</option>
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Urgency Layer
                </label>
                <select 
                  value={task.priority}
                  onChange={handlePriorityChange}
                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🚨 Critical</option>
                </select>
              </div>

              {/* Assignee Select */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Assigned Team Specialist
                </label>
                <select 
                  value={task.assignedTo}
                  onChange={handleAssigneeChange}
                  className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-250 rounded-sm p-2.5 outline-none cursor-pointer"
                >
                  {TEAM_MEMBERS.map(tm => (
                    <option key={tm.email} value={tm.email}>{tm.name} ({tm.role})</option>
                  ))}
                </select>
              </div>

              {/* Deadline Calendar picker */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Timeline Deadline / Target
                </label>
                <div className="flex gap-2 items-center">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    value={task.timelineEnd}
                    onChange={handleDeadlineChange}
                    className="flex-1 text-xs font-bold p-2 bg-white border border-slate-250 rounded-sm outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Comment Thread Workspace */}
            <div className="pt-4 border-t border-slate-205 space-y-3.5">
              <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1 font-sans">
                <MessageSquare className="w-3.5 h-3.5 text-slate-700" />
                Real-sync Comment Thread
              </h3>

              {/* Comm List container */}
              <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                {taskComments.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-mono text-center uppercase font-bold py-3">No messages posted. Start collaboration!</p>
                ) : (
                  taskComments.map((comm) => {
                    const authorInitials = comm.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TM';
                    const isCurrentUser = comm.authorUid === user?.uid;
                    const botTag = comm.text.startsWith('[Bot Teammate') || comm.authorUid.startsWith('bot_');

                    return (
                      <div key={comm.id} className={`flex gap-2 items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-sm flex items-center justify-center font-black text-[9px] text-white shrink-0 ${
                          isCurrentUser ? 'bg-slate-900 border border-slate-900' : 'bg-slate-450'
                        }`}>
                          {authorInitials}
                        </div>
                        <div className={`rounded-sm p-2.5 max-w-[80%] text-xs border ${
                          isCurrentUser 
                            ? 'bg-slate-900 text-white border-slate-950 shadow-2xs' 
                            : botTag ? 'bg-amber-50 text-slate-800 border-amber-200' : 'bg-white text-slate-800 border-slate-200'
                        }`}>
                          <div className={`text-[9px] font-bold mb-0.5 ${isCurrentUser ? 'text-slate-100 text-right' : 'text-slate-500'}`}>
                            {comm.author.toUpperCase()} {botTag && '🤖'}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{comm.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Post Comment Input text area */}
          <form onSubmit={handlePostComment} className="pt-4 mt-4 border-t border-slate-200 flex gap-2">
            <input 
              type="text"
              placeholder="Post update... use '?' or 'bug' for bot help"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={postingComment}
              className="flex-1 text-xs p-2.5 bg-white border border-slate-250 rounded-sm outline-none focus:border-slate-800 shadow-3xs"
            />
            <button
              type="submit"
              disabled={postingComment || !commentText.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm transition-colors disabled:opacity-55 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
