import { X, CheckCircle2, Clock, Loader2 } from 'lucide-react';

import { useAuthStore, useDataStore } from '../store/useStore';
import { tasksApi } from '../services/api';
import React, { useState } from 'react';

interface ProjectOverviewModalProps {
  project: any;
  tasks: any[];
  users: any[];
  onClose: () => void;
  onUpdate?: () => void;
}

export function ProjectOverviewModal({ project, tasks, users, onClose, onUpdate }: ProjectOverviewModalProps) {
  const { user } = useAuthStore();
  const { collaborations } = useDataStore();

  const activeTeams = React.useMemo(() => {
    const teamMap = new Map<string, any>();
    collaborations.forEach(c => {
      if (!teamMap.has(c.userId)) {
        const leader = users.find(u => u.id === c.userId);
        teamMap.set(c.userId, {
          leaderId: c.userId,
          leaderName: leader ? leader.name : 'Unknown',
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
    return Array.from(teamMap.values());
  }, [collaborations, users]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const projectTasks = tasks.filter((t: any) => t.projectId === project.id);
  
  const pendingCount = projectTasks.filter((t: any) => t.status === 'pending').length;
  const inProgressCount = projectTasks.filter((t: any) => t.status === 'in_progress').length;
  const completedCount = projectTasks.filter((t: any) => t.status === 'completed').length;

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      await tasksApi.updateTask(taskId, { status: newStatus });
      onUpdate?.();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const assignedTeams = new Set<string>();
  const assignedUsers = new Set<string>();

  projectTasks.forEach((t: any) => {
    if (t.assignedTo) {
      const assigneeId = typeof t.assignedTo === 'object' ? t.assignedTo.id : t.assignedTo;
      if (assigneeId?.startsWith?.('team_')) {
        assignedTeams.add(assigneeId);
      } else if (assigneeId) {
        assignedUsers.add(assigneeId);
      }
    }
  });

  const teamNames = Array.from(assignedTeams).map(id => {
     // Check if it's a team leader assignment
     const team = activeTeams.find((at: any) => at.leaderId === id);
     return team ? `${team.leaderName}'s Team` : id;
  }).filter(Boolean);
  
  const userNames = Array.from(assignedUsers).map(id => {
    const foundUser = users.find((u: any) => u.id === id);
    return foundUser ? foundUser.name : id;
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-[95%] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-start" style={{backgroundColor: project.color ? `${project.color}15` : '#f8fafc'}}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate mr-8">{project.name}</h2>
            <p className="text-sm text-gray-500 font-medium">{project.description || 'No description provided.'}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{projectTasks.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">In Progress</p>
              <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
            </div>
          </div>

          {/* Teams and Assignees */}
          <div className="mb-8">
             <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Assigned To</h3>
             <div className="space-y-3">
                {teamNames.length > 0 && (
                   <div className="flex gap-2 items-start">
                     <span className="text-sm font-semibold text-gray-500 w-16 pt-0.5">Teams:</span>
                     <div className="flex flex-wrap gap-2 flex-1">
                        {teamNames.map((name, i) => (
                           <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                             {name}
                           </span>
                        ))}
                     </div>
                   </div>
                )}
                {userNames.length > 0 && (
                   <div className="flex gap-2 items-start">
                     <span className="text-sm font-semibold text-gray-500 w-16 pt-0.5">Members:</span>
                     <div className="flex flex-wrap gap-2 flex-1">
                        {userNames.map((name, i) => (
                           <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                             {name}
                           </span>
                        ))}
                     </div>
                   </div>
                )}
                {teamNames.length === 0 && userNames.length === 0 && (
                   <p className="text-sm text-gray-500 italic">No teams or members assigned yet.</p>
                )}
             </div>
          </div>
          
          {/* Recent Tasks Preview */}
          <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Recent Tasks</h3>
              <div className="space-y-3">
                 {projectTasks.slice(0, 10).map((t: any) => {
                    const isMyTask = t.assignedTo === user?.id;
                    return (
                      <div key={t.id} className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white ${isMyTask ? 'ring-2 ring-blue-500/10' : ''}`}>
                         <div className="flex flex-col gap-1 pr-4 max-w-[60%]">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm truncate">{t.title}</span>
                              {isMyTask && <span className="bg-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Your Task</span>}
                            </div>
                            <span className="text-xs text-gray-400 truncate font-medium">{t.description || 'No description'}</span>
                         </div>
                         
                         <div className="flex items-center gap-4">
                            {isMyTask ? (
                              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                                 {updatingId === t.id ? (
                                   <Loader2 size={16} className="animate-spin text-blue-500 mx-4" />
                                 ) : (
                                   <div className="flex items-center gap-2">
                                     {t.status === 'pending' ? (
                                       <button 
                                         onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                                         className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                                       >
                                         Accept Project
                                       </button>
                                     ) : t.status === 'in_progress' ? (
                                       <button 
                                         onClick={() => handleUpdateStatus(t.id, 'completed')}
                                         className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-sm"
                                       >
                                         Complete Job
                                       </button>
                                     ) : (
                                       <span className="text-[10px] font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full uppercase tracking-wider border border-green-100">
                                         Success
                                       </span>
                                     )}
                                   </div>
                                 )}
                              </div>
                            ) : (
                              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ml-2 flex-shrink-0 ${
                                t.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                                t.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                              }`}>
                                {t.status === 'pending' ? 'Pending' : t.status === 'in_progress' ? 'In Progress' : 'Completed'}
                              </span>
                            )}
                         </div>
                      </div>
                    );
                 })}
                 {projectTasks.length === 0 && (
                    <div className="p-4 rounded-xl bg-gray-50 text-center text-sm text-gray-500">
                       No tasks found in this project.
                    </div>
                  )}
              </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
           >
             Close
           </button>
        </div>

      </div>
    </div>
  );
}
