/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { TaskBoard } from './components/TaskBoard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { SnagList } from './components/SnagList';
import { SpreadsheetImporter } from './components/SpreadsheetImporter';
import { Task } from './types';
import { 
  BarChart4, 
  ClipboardList, 
  AlertOctagon, 
  LogOut, 
  Layout, 
  ExternalLink,
  Lock,
  User,
  Activity,
  FolderOpen,
  Info,
  Upload
} from 'lucide-react';

type TabType = 'dashboard' | 'board' | 'snags' | 'import';

const MainApp: React.FC = () => {
  const { 
    user, 
    loadingAuth, 
    loadingProjects, 
    activeProject, 
    login, 
    logout 
  } = useProjects();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 animate-pulse">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-bold text-slate-700 tracking-wider">Synchronizing tracker workspace...</span>
        </div>
      </div>
    );
  }

  // Not logged in: Beautiful landing portal explaining features
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-150 shadow-xl overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-blue-100">
              <BarChart4 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prism Tracker.</h1>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                An end-to-end rollout tracker for new launches, trials, pilots &amp; transitions across stores. Track participation, auto-flag delays with reasons, and roll up health across regions.
              </p>
            </div>

            {/* Feature small specs */}
            <div className="grid grid-cols-2 gap-3 text-left py-2 border-t border-b border-slate-100">
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Real-Time</div>
                <div className="text-xs font-bold text-slate-700">onSnapshot Sync</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Collab thread</div>
                <div className="text-xs font-bold text-slate-700">Teammate bots</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Hurdles</div>
                <div className="text-xs font-bold text-slate-700">Snags & Blockers</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Timeline</div>
                <div className="text-xs font-bold text-slate-700">Deadlines & Priority</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={login}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer shadow-sm shadow-blue-100"
                id="btn-login-google"
              >
                <Lock className="w-4 h-4" />
                Sign in with Google
              </button>
              <p className="text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Uses secure standard Firebase authentication sandbox
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans grid-pattern">
      
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg uppercase">PRISM TRACKER</span>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1"></div>
          <div className="text-[10px] text-slate-500 font-mono font-semibold items-center gap-1.5 leading-none hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SYNCED: LIVE
          </div>
        </div>

        {/* User profile details and log out */}
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Operator Session</div>
            <div className="text-xs text-slate-600 font-mono font-medium">{user.displayName || user.email?.split('@')[0]}</div>
          </div>

          <button
            onClick={logout}
            className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors rounded-sm cursor-pointer"
            title="Sign out from sandbox"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left section: Sidebar projects picker */}
        <aside className="w-full md:w-[310px] bg-white border-b md:border-b-0 md:border-r border-slate-200 p-6 overflow-y-auto shrink-0 md:max-h-[calc(100vh-64px)]">
          <ProjectList />
        </aside>

        {/* Right Section: Workspace dashboard tabs */}
        <section className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 md:max-h-[calc(100vh-64px)] bg-slate-50/40">
          {activeProject ? (
            <>
              {/* Tabs selector */}
              <div className="flex p-1 bg-slate-100 rounded-sm border border-slate-200 self-start">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'dashboard' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart4 className="w-3.5 h-3.5" />
                  Performance Summary
                </button>
                <button
                  onClick={() => setActiveTab('board')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'board' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  Timeline Board
                </button>
                <button
                  onClick={() => setActiveTab('snags')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'snags' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Project Hurdles / Snags
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'import' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Data Import
                </button>
              </div>

              {/* Render Selected View */}
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'board' && <TaskBoard onSelectTask={setSelectedTask} />}
              {activeTab === 'snags' && <SnagList />}
              {activeTab === 'import' && <SpreadsheetImporter />}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-4">
              <FolderOpen className="w-12 h-12 text-slate-300" />
              <div>
                <h3 className="font-bold text-slate-800 text-lg">No Tracker Active</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  To begin utilizing this collaborative sync tracker, click <span className="font-semibold text-slate-950">New Project</span> in the left sidebar to initialize a tracking pipeline, map deadlines, allocate engineers, and resolve roadblocks.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Task detailed slide / modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <MainApp />
    </ProjectProvider>
  );
}
