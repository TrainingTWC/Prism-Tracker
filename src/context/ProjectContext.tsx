import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { Project, Task, Snag, Comment, TEAM_MEMBERS, TeamMember, TaskStatus, TaskPriority, SnagStatus, SnagPriority, Attachment } from '../types';

interface ProjectContextType {
  user: User | null;
  loadingAuth: boolean;
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeProject: Project | null;
  tasks: Task[];
  snags: Snag[];
  comments: Record<string, Comment[]>; // taskId -> Comments
  loadingProjects: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Project operations
  createProject: (name: string, description: string, projectUrl: string, memberEmails: string[]) => Promise<string>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Task operations
  createTask: (projectId: string, task: Omit<Task, 'id' | 'projectId' | 'snagsCount' | 'attachments' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addAttachment: (projectId: string, taskId: string, file: File) => Promise<void>;
  removeAttachment: (projectId: string, taskId: string, fileUrl: string) => Promise<void>;
  
  // Comment operations
  addComment: (projectId: string, taskId: string, text: string) => Promise<void>;
  
  // Snag operations
  createSnag: (projectId: string, snag: Omit<Snag, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolvedBy'>) => Promise<void>;
  updateSnag: (projectId: string, snagId: string, updates: Partial<Snag>) => Promise<void>;
  deleteSnag: (projectId: string, snagId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [projectsMap, setProjectsMap] = useState<Record<string, Project>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [snags, setSnags] = useState<Snag[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Authenticated state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoadingAuth(false);
      if (!usr) {
        setProjectsMap({});
        setTasks([]);
        setSnags([]);
        setComments({});
        setActiveProjectId(null);
      }
    });
    return unsubscribe;
  }, []);

  // Listen to projects: owned OR member
  useEffect(() => {
    if (!user) {
      setLoadingProjects(false);
      return;
    }

    setLoadingProjects(true);
    const userEmail = user.email || '';

    // Query 1: Owned projects
    const qOwned = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
    
    // Query 2: Member projects
    const qMember = query(collection(db, 'projects'), where('memberEmails', 'array-contains', userEmail));

    const ownedMap: Record<string, Project> = {};
    const memberMap: Record<string, Project> = {};

    const updateCombinedProjects = () => {
      const combined = { ...ownedMap, ...memberMap };
      setProjectsMap(combined);
      setLoadingProjects(false);

      // Set active project if not set or if it was removed
      const projectKeys = Object.keys(combined);
      if (projectKeys.length > 0) {
        if (!activeProjectId || !combined[activeProjectId]) {
          setActiveProjectId(projectKeys[0]);
        }
      } else {
        setActiveProjectId(null);
      }
    };

    // Listen to owned projects
    const unsubscribeOwned = onSnapshot(qOwned, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        if (change.type === 'removed') {
          delete ownedMap[id];
        } else {
          ownedMap[id] = { id, ...change.doc.data() } as Project;
        }
      });
      // Handle initial load or empty snapshot
      if (snapshot.empty) {
        Object.keys(ownedMap).forEach(key => delete ownedMap[key]);
      } else {
        snapshot.docs.forEach(docSnap => {
          ownedMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as Project;
        });
      }
      updateCombinedProjects();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects(owned)');
    });

    // Listen to member projects
    const unsubscribeMember = onSnapshot(qMember, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        if (change.type === 'removed') {
          delete memberMap[id];
        } else {
          memberMap[id] = { id, ...change.doc.data() } as Project;
        }
      });
      if (snapshot.empty) {
        Object.keys(memberMap).forEach(key => delete memberMap[key]);
      } else {
        snapshot.docs.forEach(docSnap => {
          memberMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as Project;
        });
      }
      updateCombinedProjects();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'projects(member)');
    });

    return () => {
      unsubscribeOwned();
      unsubscribeMember();
    };
  }, [user]);

  // Listen to tasks and snags of active PROJECT
  useEffect(() => {
    if (!user || !activeProjectId) {
      setTasks([]);
      setSnags([]);
      setComments({});
      return;
    }

    const tasksPath = `projects/${activeProjectId}/tasks`;
    const qTasks = query(collection(db, tasksPath), orderBy('createdAt', 'desc'));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const taskList: Task[] = [];
      snapshot.forEach((docSnap) => {
        taskList.push({ id: docSnap.id, projectId: activeProjectId, ...docSnap.data() } as Task);
      });
      setTasks(taskList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, tasksPath);
    });

    const snagsPath = `projects/${activeProjectId}/snags`;
    const qSnags = query(collection(db, snagsPath), orderBy('createdAt', 'desc'));
    const unsubscribeSnags = onSnapshot(qSnags, (snapshot) => {
      const snagList: Snag[] = [];
      snapshot.forEach((docSnap) => {
        snagList.push({ id: docSnap.id, projectId: activeProjectId, ...docSnap.data() } as Snag);
      });
      setSnags(snagList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, snagsPath);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeSnags();
    };
  }, [user, activeProjectId]);

  // Listen to comments of active tasks
  useEffect(() => {
    if (!user || !activeProjectId || tasks.length === 0) {
      setComments({});
      return;
    }

    const unsubscribes: (() => void)[] = [];

    tasks.forEach((task) => {
      const pathComments = `projects/${activeProjectId}/tasks/${task.id}/comments`;
      const qComments = query(collection(db, pathComments), orderBy('createdAt', 'asc'));
      
      const unsub = onSnapshot(qComments, (snapshot) => {
        const commentList: Comment[] = [];
        snapshot.forEach((docSnap) => {
          commentList.push({ id: docSnap.id, projectId: activeProjectId, taskId: task.id, ...docSnap.data() } as Comment);
        });
        setComments((prev) => ({ ...prev, [task.id]: commentList }));
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, pathComments);
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [user, activeProjectId, tasks.map(t => t.id).join(',')]);

  // Auth Operations
  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  // Simulated Team member interactive automated triggers
  const triggerTeammateAction = (projectId: string, taskId: string, type: 'review' | 'comment' | 'create_snag', teammate: typeof TEAM_MEMBERS[number]) => {
    setTimeout(async () => {
      if (type === 'comment') {
        const path = `projects/${projectId}/tasks/${taskId}/comments`;
        const commentId = 'sim_' + Date.now().toString(36);
        const textOptions = [
          "Looks solid! Let's schedule the deployment.",
          "I reviewed the logs, everything seems optimized nicely.",
          "Awesome work on this specific task! Keep it up.",
          "Can we verify if this meets the requirements in our project specification?",
          "Done on my end. Ready for the UX team to review!"
        ];
        const randomText = textOptions[Math.floor(Math.random() * textOptions.length)];
        
        try {
          await setDoc(doc(db, path, commentId), {
            text: `[Bot Teammate - ${teammate.role}] ${randomText}`,
            author: teammate.name,
            authorUid: 'bot_uid_' + teammate.initials,
            createdAt: new Date() // local date mock for bots (non-resource files don't fail)
          });
        } catch (e) {
          console.error("Failed to inject simulation comment", e);
        }
      } else if (type === 'create_snag') {
        const snagPath = `projects/${projectId}/snags`;
        const snagId = 'sim_snag_' + Date.now().toString(36);
        try {
          await setDoc(doc(db, snagPath, snagId), {
            description: `[Blocker - ${teammate.name}] The API route is throwing a 500 status code on the review build. Needs urgent hotfix.`,
            status: 'open',
            priority: 'high',
            taskId: taskId,
            assignedTo: teammate.email,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          // Also update snagsCount on the task
          const taskDoc = doc(db, `projects/${projectId}/tasks`, taskId);
          const taskSnap = await getDoc(taskDoc);
          if (taskSnap.exists()) {
            const currentSnags = taskSnap.data().snagsCount || 0;
            await updateDoc(taskDoc, { snagsCount: currentSnags + 1 });
          }
        } catch (e) {
          console.error('Failed to inject simulation snag', e);
        }
      }
    }, 2500);
  };

  // Create Project
  const createProject = async (name: string, description: string, projectUrl: string, memberEmails: string[]): Promise<string> => {
    if (!user) throw new Error('Unauthenticated user');
    const path = 'projects';
    const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 6);
    
    // Ensure unique elements and valid formats
    const members = Array.from(new Set(memberEmails.map(m => m.trim().toLowerCase()).filter(m => m.length > 0)));

    const payload = {
      name,
      description,
      projectUrl: projectUrl || '',
      ownerId: user.uid,
      ownerEmail: user.email || '',
      memberEmails: members,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, path, cleanId), payload);
      return cleanId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${cleanId}`);
    }
  };

  // Update Project
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user) throw new Error('Unauthenticated user');
    const path = `projects/${projectId}`;
    
    const payload: any = {
      updatedAt: serverTimestamp()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.projectUrl !== undefined) payload.projectUrl = updates.projectUrl;
    if (updates.memberEmails !== undefined) payload.memberEmails = updates.memberEmails;

    try {
      await updateDoc(doc(db, 'projects', projectId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Delete Project
  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Create Task
  const createTask = async (projectId: string, task: Omit<Task, 'id' | 'projectId' | 'snagsCount' | 'attachments' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/tasks`;
    const cleanId = task.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 6);

    const payload = {
      title: task.title,
      details: task.details,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      timelineStart: task.timelineStart,
      timelineEnd: task.timelineEnd,
      snagsCount: 0,
      attachments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, path, cleanId), payload);

      // Trigger automatic simulated comment if assigned to a team member bot
      const botTeammate = TEAM_MEMBERS.find(tm => tm.email === task.assignedTo);
      if (botTeammate) {
        // Post welcome message from assignee
        setTimeout(async () => {
          await setDoc(doc(db, `projects/${projectId}/tasks/${cleanId}/comments`, 'welcome_bot'), {
            text: `Hey team! I'm assigned to this. I'll get started right away and match the deadline (${task.timelineEnd}).`,
            author: botTeammate.name,
            authorUid: 'bot_uid_' + botTeammate.initials,
            createdAt: new Date()
          });
        }, 1500);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${cleanId}`);
    }
  };

  // Update Task
  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/tasks/${taskId}`;

    const payload: any = {
      updatedAt: serverTimestamp()
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.details !== undefined) payload.details = updates.details;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.assignedTo !== undefined) payload.assignedTo = updates.assignedTo;
    if (updates.timelineStart !== undefined) payload.timelineStart = updates.timelineStart;
    if (updates.timelineEnd !== undefined) payload.timelineEnd = updates.timelineEnd;
    if (updates.snagsCount !== undefined) payload.snagsCount = updates.snagsCount;
    if (updates.attachments !== undefined) payload.attachments = updates.attachments;

    try {
      await updateDoc(doc(db, `projects/${projectId}/tasks`, taskId), payload);

      // Trigger simulated bot feedback when status flips to 'review' or 'completed'
      if (updates.status === 'review') {
        const taskSnap = tasks.find(t => t.id === taskId);
        if (taskSnap) {
          const assignee = TEAM_MEMBERS.find(tm => tm.email === taskSnap.assignedTo);
          if (assignee) {
            triggerTeammateAction(projectId, taskId, 'comment', assignee);
          } else {
            // Pick a product owner bot to review it if assigned to self
            const pm = TEAM_MEMBERS[0]; // Alice
            triggerTeammateAction(projectId, taskId, 'comment', pm);
          }
        }
      } else if (updates.status === 'completed') {
        const taskSnap = tasks.find(t => t.id === taskId);
        if (taskSnap) {
          const rand = Math.random();
          // 50% chance a bot says thanks or logs a snag if it's completed but has loose ends
          if (rand > 0.6) {
            const bot = TEAM_MEMBERS[Math.floor(Math.random() * TEAM_MEMBERS.length)];
            triggerTeammateAction(projectId, taskId, 'comment', bot);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Delete Task
  const deleteTask = async (projectId: string, taskId: string) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, `projects/${projectId}/tasks`, taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Add Attachment (Simulated storage encoding inside Firestore to comply with Firestore-only sandbox limits)
  const addAttachment = async (projectId: string, taskId: string, file: File) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/tasks/${taskId}`;
    
    // Simulate uploading a file by generating a mock CDN URL and loading meta
    const mockCdnUrl = `https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=85&w=1200&auto=format&fit=crop`; // Beautiful default mockup
    const cleanFileName = file.name;
    const cleanFileSize = file.size;

    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const newAttachment: Attachment = {
      name: cleanFileName,
      url: mockCdnUrl,
      size: cleanFileSize,
      uploadedBy: user.email || 'Anonymous',
      createdAt: new Date().toISOString()
    };

    const updatedAttachments = [...(currentTask.attachments || []), newAttachment].slice(0, 10);

    try {
      await updateDoc(doc(db, `projects/${projectId}/tasks`, taskId), {
        attachments: updatedAttachments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Remove Attachment
  const removeAttachment = async (projectId: string, taskId: string, fileUrl: string) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/tasks/${taskId}`;

    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const updatedAttachments = (currentTask.attachments || []).filter(a => a.url !== fileUrl);

    try {
      await updateDoc(doc(db, `projects/${projectId}/tasks`, taskId), {
        attachments: updatedAttachments,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Add Comment
  const addComment = async (projectId: string, taskId: string, text: string) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/tasks/${taskId}/comments`;
    const commentId = 'comment_' + Date.now().toString(36);
    
    const payload = {
      text,
      author: user.displayName || user.email || 'Teammate',
      authorUid: user.uid,
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, path, commentId), payload);

      // Trigger automatic funny/valuable responses from assigned bots
      const currentTask = tasks.find(t => t.id === taskId);
      if (currentTask) {
        const assignee = TEAM_MEMBERS.find(tm => tm.email === currentTask.assignedTo);
        if (assignee && assignee.email !== user.email && text.toLowerCase().includes('?')) {
          // If user asked a question, bot responds!
          triggerTeammateAction(projectId, taskId, 'comment', assignee);
        } else if (assignee && text.toLowerCase().includes('bug') || text.toLowerCase().includes('broken') || text.toLowerCase().includes('error')) {
          // If comment raises an issue, bot opens a snag!
          triggerTeammateAction(projectId, taskId, 'create_snag', assignee);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${commentId}`);
    }
  };

  // Create Snag
  const createSnag = async (projectId: string, snag: Omit<Snag, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolvedBy'>) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/snags`;
    const cleanId = 'snag_' + Date.now().toString(36);

    const payload = {
      description: snag.description,
      status: snag.status,
      priority: snag.priority,
      taskId: snag.taskId || null,
      assignedTo: snag.assignedTo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resolvedAt: null,
      resolvedBy: null
    };

    try {
      await setDoc(doc(db, path, cleanId), payload);

      // increment snagsCount on the linked task if any
      if (snag.taskId) {
        const taskDoc = doc(db, `projects/${projectId}/tasks`, snag.taskId);
        const taskSnap = await getDoc(taskDoc);
        if (taskSnap.exists()) {
          const currentCount = taskSnap.data().snagsCount || 0;
          await updateDoc(taskDoc, { snagsCount: currentCount + 1 });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${path}/${cleanId}`);
    }
  };

  // Update Snag
  const updateSnag = async (projectId: string, snagId: string, updates: Partial<Snag>) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/snags/${snagId}`;

    const payload: any = {
      updatedAt: serverTimestamp()
    };
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) {
      payload.status = updates.status;
      if (updates.status === 'resolved') {
        payload.resolvedAt = serverTimestamp();
        payload.resolvedBy = user.email;
      } else {
        payload.resolvedAt = null;
        payload.resolvedBy = null;
      }
    }
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.assignedTo !== undefined) payload.assignedTo = updates.assignedTo;

    try {
      await updateDoc(doc(db, `projects/${projectId}/snags`, snagId), payload);

      // Decrement task's snagsCount if resolved
      const snagSnap = snags.find(s => s.id === snagId);
      if (snagSnap && snagSnap.taskId && updates.status !== undefined) {
        const taskDoc = doc(db, `projects/${projectId}/tasks`, snagSnap.taskId);
        const taskSnap = await getDoc(taskDoc);
        if (taskSnap.exists()) {
          const currentCount = taskSnap.data().snagsCount || 0;
          const delta = updates.status === 'resolved' ? -1 : 1;
          const newCount = Math.max(0, currentCount + delta);
          await updateDoc(taskDoc, { snagsCount: newCount });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  // Delete Snag
  const deleteSnag = async (projectId: string, snagId: string) => {
    if (!user) throw new Error('Unauthenticated');
    const path = `projects/${projectId}/snags/${snagId}`;

    const snagSnap = snags.find(s => s.id === snagId);

    try {
      await deleteDoc(doc(db, `projects/${projectId}/snags`, snagId));
      
      // Update snag count
      if (snagSnap && snagSnap.taskId && snagSnap.status === 'open') {
        const taskDoc = doc(db, `projects/${projectId}/tasks`, snagSnap.taskId);
        const taskSnap = await getDoc(taskDoc);
        if (taskSnap.exists()) {
          const currentCount = taskSnap.data().snagsCount || 0;
          await updateDoc(taskDoc, { snagsCount: Math.max(0, currentCount - 1) });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const activeProject = activeProjectId ? projectsMap[activeProjectId] || null : null;

  return (
    <ProjectContext.Provider value={{
      user,
      loadingAuth,
      projects: Object.values(projectsMap).sort((a: Project, b: Project) => {
        const aSecs = a.createdAt?.seconds || 0;
        const bSecs = b.createdAt?.seconds || 0;
        return bSecs - aSecs;
      }),
      activeProjectId,
      setActiveProjectId,
      activeProject,
      tasks,
      snags,
      comments,
      loadingProjects,
      login,
      logout,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      addAttachment,
      removeAttachment,
      addComment,
      createSnag,
      updateSnag,
      deleteSnag
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
};
