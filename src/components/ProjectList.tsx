import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { TEAM_MEMBERS } from '../types';
import { 
  Folder, 
  FolderPlus, 
  Plus, 
  X, 
  Trash2, 
  ExternalLink, 
  Share2,
  Check
} from 'lucide-react';

interface ProjectListProps {
  onSelectProject?: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    createProject, 
    deleteProject, 
    user 
  } = useProjects();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>(
    TEAM_MEMBERS.map(t => t.email) // Pre-select all 5 core team member emails for rich collaboration simulator
  );
  const [submitting, setSubmitting] = useState(false);

  const handleToggleEmail = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email) 
        : [...prev, email]
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSubmitting(true);
    try {
      let formattedUrl = projectUrl.trim();
      if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const newId = await createProject(name, description, formattedUrl, selectedEmails);
      setActiveProjectId(newId);
      setName('');
      setDescription('');
      setProjectUrl('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with New Project Button */}
      <div className="flex justify-between items-center bg-white p-3 rounded-sm border border-slate-200 shadow-xs">
        <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-2 uppercase tracking-widest">
          <Folder className="w-4 h-4 text-slate-700" />
          Tracked Projects
        </h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center gap-1 text-[11px] font-bold uppercase cursor-pointer tracking-wider"
          id="btn-new-project"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Project list container */}
      <div className="space-y-2">
        {projects.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-sm border border-dashed border-slate-200">
            No active trackers yet. Create one!
          </div>
        ) : (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;
            const isOwner = project.ownerId === user?.uid;

            return (
              <div 
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  if (onSelectProject) onSelectProject();
                }}
                className={`p-3.5 rounded-sm border transition-all duration-150 cursor-pointer flex justify-between items-start group ${
                  isActive 
                    ? 'border-slate-300 bg-slate-50/90 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/55'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold truncate text-xs tracking-tight ${isActive ? 'text-slate-950 underline decoration-slate-900 decoration-2' : 'text-slate-700'}`}>
                      {project.name}
                    </h4>
                    {isOwner && (
                      <span className="text-[8px] bg-slate-200 text-slate-800 px-1 py-0.2 rounded font-black font-mono tracking-wider">
                        OWNER
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1.5 truncate max-w-[200px]">
                    {project.description || 'No description provided.'}
                  </p>
                  
                  {project.projectUrl && (
                    <div className="mt-2 text-left">
                      <a 
                        href={project.projectUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-900 font-mono font-bold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        SYSTEM_URL
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isOwner && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${project.name}? This deletes all related tasks, comments, and snags permanently.`)) {
                          await deleteProject(project.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Tracker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl overflow-hidden w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-widest">
                <FolderPlus className="w-4 h-4 text-slate-700" />
                Initialize Project Tracker
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Website Overhaul, iOS App Build"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Scope / Details
                </label>
                <textarea
                  placeholder="Goals, target milestones, general info overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-sm border border-slate-250 focus:border-slate-800 outline-none"
                />
              </div>

              {/* Members check row */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" />
                  Assign Teammates ({selectedEmails.length}/5 max)
                </label>
                <div className="space-y-1.5 max-h-[145px] overflow-y-auto border border-slate-200 rounded-sm p-2 bg-slate-50">
                  {TEAM_MEMBERS.map((member) => {
                    const isSelected = selectedEmails.includes(member.email);
                    return (
                      <div 
                        key={member.email}
                        onClick={() => handleToggleEmail(member.email)}
                        className={`flex items-center justify-between p-1.5 rounded-sm cursor-pointer transition-colors ${
                          isSelected ? 'bg-white border border-slate-200' : 'hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${member.color}`}>
                            {member.initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 leading-none">{member.name}</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{member.role}</div>
                          </div>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-xs text-white bg-slate-900 hover:bg-slate-800 p-2.5 rounded-sm transition-colors font-bold uppercase cursor-pointer tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Initializing...' : 'Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
