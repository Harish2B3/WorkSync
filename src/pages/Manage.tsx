import {Layout} from '../components/Layout';
import React, {useEffect, useState} from 'react';
import {useAuthStore, useDataStore} from '../store/useStore';
import {tasksApi, projectsApi, usersApi} from '../services/api';
import {Info, Pin, Trash2, Edit, Plus, Loader2, Check} from 'lucide-react';
import {ProjectOverviewModal} from '../components/ProjectOverviewModal';

export function Manage() {
  const {user} = useAuthStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'teams' | 'assigned_jobs'>('projects');

  const { tasks, projects, users, collaborations, isLoaded, isLoading, fetchData } = useDataStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', 
    description: '', 
    dueDate: new Date().toISOString().split('T')[0], 
    projectId: '', 
    assignedToId: ''
  });

  // Teams state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningToTeam, setAssigningToTeam] = useState<any>(null);

  // Projects state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProj, setNewProj] = useState({name: '', description: ''});
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Editing state
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchData(true);
  }, [user]);

  const load = async () => {
    await fetchData(true);
  };

  const activeTeams = React.useMemo(() => {
    const teamMap = new Map<string, any>();
    collaborations.forEach(c => {
      if (!teamMap.has(c.userId)) {
        const leader = users.find(u => u.id === c.userId);
        teamMap.set(c.userId, {
          leaderId: c.userId,
          leaderName: c.leaderName || leader?.name || 'Unknown',
          members: []
        });
      }
      if (c.status === 'accepted') {
        const memberUser = users.find(u => u.id === c.collaboratedWithId);
        if (memberUser) {
           teamMap.get(c.userId).members.push(memberUser);
        }
      }
    });
    // Only return teams that have at least 1 member (or just the leader)
    return Array.from(teamMap.values());
  }, [collaborations, users]);

  const handleCreateTask = async (e: any) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      if (editingTask) {
        await tasksApi.updateTask(editingTask.id, newTask);
      } else {
        await tasksApi.createTask(newTask);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setNewTask({
        title: '', 
        description: '', 
        dueDate: new Date().toISOString().split('T')[0], 
        projectId: '', 
        assignedToId: ''
      });
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Error saving task");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStatusChange = async (task: any, newStatus: string) => {
    try {
        setIsActionLoading(true);
        await tasksApi.updateTask(task.id, { status: newStatus });
        await load();
    } catch (e: any) {
        alert(e.response?.data?.error || "Error updating task");
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleCreateProject = async (e: any) => {
    e.preventDefault();
    try {
      setIsActionLoading(true);
      if (editingProject) {
        await projectsApi.updateProject(editingProject.id, newProj);
      } else {
        await projectsApi.createProject(newProj);
      }
      setShowProjectModal(false);
      setNewProj({name: '', description: ''});
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Error saving project");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
      try {
        setIsActionLoading(true);
        await projectsApi.deleteProject(id);
        await load();
      } catch (e: any) {
        alert(e.response?.data?.error || "Error deleting project");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsActionLoading(true);
        await tasksApi.deleteTask(id);
        await load();
      } catch (e: any) {
        alert(e.response?.data?.error || "Error deleting task");
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      projectId: task.projectId || '',
      assignedToId: task.assignedToId || ''
    });
    setShowTaskModal(true);
  };

  const handleEditProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setEditingProject(project);
    setNewProj({
      name: project.name,
      description: project.description || ''
    });
    setShowProjectModal(true);
  };

  const handleTogglePin = async (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    try {
      await projectsApi.updateProject(project.id, { pinned: !project.pinned });
      await load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Error updating project");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage</h2>
          <p className="text-gray-500 mt-1">Manage your team's projects and tasks</p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-3">
            {activeTab === 'projects' && (
              <button onClick={() => setShowProjectModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">+ New Project</button>
            )}
            {activeTab === 'tasks' && (
              <button onClick={() => setShowTaskModal(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">+ New Task</button>
            )}
            {activeTab === 'teams' && (
              <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">+ New Member</button>
            )}
          </div>
        )}
      </div>

      <div className="flex border-b border-gray-200 gap-8 mb-6">
        <button 
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'projects' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Projects
          {activeTab === 'projects' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'tasks' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Tasks
          {activeTab === 'tasks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('teams')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'teams' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Teams
          {activeTab === 'teams' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('assigned_jobs')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'assigned_jobs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Assigned Jobs
          {activeTab === 'assigned_jobs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
      </div>

      {!isLoaded ? (
        <div className="py-20 text-center text-gray-400 font-medium animate-pulse">Loading data...</div>
      ) : activeTab === 'projects' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProject(p)}
              className="p-6 rounded-xl text-white shadow-lg shadow-gray-200/50 flex flex-col justify-between h-44 transition-transform hover:-translate-y-1 cursor-pointer relative group" 
              style={{background: p.color || '#444'}}
            >
              <button 
                onClick={(e) => handleTogglePin(e, p)}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-10 ${p.pinned ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-white/20'}`}
              >
                <Pin size={16} fill={p.pinned ? "currentColor" : "none"} />
              </button>
              <div>
                <h4 className="font-bold text-xl mb-1 pr-8 truncate">{p.name}</h4>
                <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{p.description}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-black/10 px-2.5 py-1.5 rounded-lg backdrop-blur-sm uppercase tracking-wider">
                    {p.memberCount || 0} Members
                  </span>
                  <span className="text-[10px] font-bold bg-black/10 px-2.5 py-1.5 rounded-lg backdrop-blur-sm uppercase tracking-wider">
                    {p.tasks?.length || 0} Tasks
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleEditProject(e, p)}
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 transition-all shadow-sm backdrop-blur-md"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-500/60 transition-all shadow-sm backdrop-blur-md"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">No projects found. Click "New Project" to create one.</div>
          )}
        </div>
      ) : activeTab === 'tasks' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#111827] text-white">
              <tr>
                <th className="p-4 pl-6 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Task Name</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Assignee</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Project</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Due Date</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t: any, idx: number) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed';
                return (
                <tr key={t.id} className={`${idx !== tasks.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                  <td className="p-4 pl-6">
                    <select
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none appearance-none cursor-pointer ${
                        t.status === 'pending' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}
                      value={t.status}
                      onChange={(e) => handleStatusChange(t, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <p className={`font-bold text-sm ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px] font-normal">{t.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                          {t.assignedTo.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs font-medium text-gray-600">{t.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                      {projects.find(p => p.id === t.projectId)?.name || 'Personal'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                     <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-700 border border-red-200' : 'text-gray-500'}`}>
                        {t.dueDate || 'No date'}
                     </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {t.status !== 'completed' ? (
                        <>
                          <button 
                            onClick={() => handleEditTask(t)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="p-1.5 text-green-500"><Check size={14} strokeWidth={3} /></span>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No tasks found. Click "New Task" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'teams' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#111827] text-white">
              <tr>
                <th className="p-4 pl-6 font-bold text-xs uppercase tracking-wider">Team Name (Leader)</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Active Members</th>
                <th className="p-4 pr-6 font-bold text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTeams.map((team: any, idx: number) => (
                <tr key={team.leaderId} className={idx !== activeTeams.length - 1 ? 'border-b border-gray-50' : ''}>
                  <td className="p-4 pl-6 font-medium text-gray-900">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {team.leaderName.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold">{team.leaderName}'s Team</p>
                         <p className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-1">Leader</p>
                       </div>
                     </div>
                  </td>
                  <td className="p-4 relative">
                     <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-700">{team.members.length} Members</span>
                        {team.members.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {team.members.map((m: any) => (
                              <span key={m.id} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                                {m.name}
                              </span>
                            ))}
                          </div>
                        )}
                     </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                     <div className="flex items-center justify-end gap-3">
                       <button 
                         onClick={() => {
                           setAssigningToTeam({ id: team.leaderId, name: `${team.leaderName}'s Team` });
                           setShowAssignModal(true);
                         }}
                         className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                       >
                         Assign Task
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {activeTeams.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">No active teams found.</td></tr>
              )}

            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#111827] text-white">
              <tr>
                <th className="p-4 pl-6 font-bold text-xs uppercase tracking-wider">Assignee / Team</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Project Name</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Task</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Assigned Status</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Date</th>
                <th className="p-4 pr-6 font-bold text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.filter(t => t.assignedTo).map((t, idx, filteredTasks) => {
                const assignedName = t.assignedTo?.name || 'Unknown';
                const assignedProject = projects.find(p => p.id === t.projectId);
                const team = activeTeams.find((team: any) => team.leaderId === t.assignedToId);
                const displayName = team ? `${team.leaderName}'s Team` : assignedName;
                return (
                  <tr key={t.id} className={idx !== filteredTasks.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="p-4 pl-6 text-sm font-medium text-gray-900 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${team ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                          {displayName.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="truncate font-bold">{displayName}</p>
                          {team && <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-tighter">Team Assignment</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 max-w-[180px]">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium truncate inline-block max-w-full">
                        {assignedProject?.name || 'Personal'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-sm text-gray-900 max-w-[250px]">
                      <div>
                        <p className="truncate">{t.title}</p>
                        {t.description && <p className="text-xs text-gray-500 mt-1 font-normal line-clamp-1">{t.description}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        t.status === 'pending' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                        t.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {t.status === 'pending' ? 'Pending' : t.status === 'in_progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                           : 'text-gray-500'
                      }`}>
                        {t.dueDate || 'No date'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {t.status !== 'completed' ? (
                            <>
                              <button
                                 onClick={async () => {
                                    if (!window.confirm("Are you sure you want to unassign this job?")) return;
                                    try {
                                      setIsActionLoading(true);
                                      await tasksApi.updateTask(t.id, { assignedTo: null });
                                      await load();
                                    } catch(e) { console.error(e); }
                                    finally { setIsActionLoading(false); }
                                 }}
                                 className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                              >
                                 Unassign
                              </button>
                              <button
                                 onClick={() => handleDeleteTask(t.id)}
                                 className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
                              >
                                 Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                               Locked Records
                            </span>
                          )}
                        </div>
                    </td>
                  </tr>
                );
              })}
              {tasks.filter(t => t.assignedTo).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No assigned jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Assign Task to {assigningToTeam?.name}</h3>
            <p className="text-gray-500 text-sm mb-6">Select an existing unassigned task or create a new one.</p>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-3">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">Unassigned Tasks</h4>
                {tasks.filter(t => !t.assignedTo).length > 0 ? (
                  <div className="space-y-2">
                    {tasks.filter(t => !t.assignedTo).map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                           <h5 className="font-semibold text-sm text-gray-900 truncate">{t.title}</h5>
                           <p className="text-xs text-gray-500 truncate">{t.description || 'No description'}</p>
                        </div>
                        <button 
                           onClick={async () => {
                              try {
                                await tasksApi.updateTask(t.id, { assignedTo: assigningToTeam.id });
                                load();
                                setShowAssignModal(false);
                              } catch(e) {
                                console.error(e);
                              }
                           }}
                           className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-blue-600 text-xs font-semibold rounded-lg transition-colors"
                        >
                           Assign
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="text-sm text-gray-400 bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">No unassigned tasks available.</div>
                )}
              </div>

              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                 <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">OR</span></div>
              </div>

              <div>
                 <button 
                   onClick={() => {
                      setShowAssignModal(false);
                      setNewTask({...newTask, assignedToId: assigningToTeam.id});
                      setShowTaskModal(true);
                   }}
                   className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2"
                 >
                   + Create New Task for {assigningToTeam?.name}
                 </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowAssignModal(false)} className="px-5 py-2.5 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl" onSubmit={handleCreateTask}>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">{editingTask ? 'Edit Task' : 'Create Task'}</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title</label>
                    <input 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="What needs to be done?" 
                      value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} 
                      required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                    <textarea 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20" 
                      placeholder="Add details" 
                      value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} 
                    />
                </div>
              <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                  />
              </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project</label>
                    <select 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => { setShowTaskModal(false); setEditingTask(null); }} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-colors">
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl" onSubmit={handleCreateProject}>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">{editingProject ? 'Edit Project' : 'Create Project'}</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                    <input 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="e.g. Website Redesign" 
                      value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} 
                      required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Option)</label>
                    <textarea 
                      className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24" 
                      placeholder="Brief details about the project" 
                      value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} 
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => { setShowProjectModal(false); setEditingProject(null); }} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-colors">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedProject && (
        <ProjectOverviewModal 
          project={selectedProject} 
          tasks={tasks} 
          users={users} 
          onClose={() => setSelectedProject(null)} 
          onUpdate={load}
        />
      )}

      {isActionLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">Processing...</p>
          </div>
        </div>
      )}
    </Layout>
  );
}
