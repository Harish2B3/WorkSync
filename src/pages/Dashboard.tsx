
import {Layout} from '../components/Layout';
import {CheckCircle2, Circle, ArrowLeft, ArrowRight, Check, Pin, Award, Clock, Star, TrendingUp, Users, Loader2} from 'lucide-react';
import {useAuthStore, useDataStore} from '../store/useStore';
import {useEffect, useState, useRef} from 'react';
import {projectsApi, tasksApi, usersApi} from '../services/api';
import {Link} from 'react-router-dom';
import {ProjectOverviewModal} from '../components/ProjectOverviewModal';
import {PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend} from 'recharts';

export function Dashboard() {
  const {user} = useAuthStore();
  const { tasks, projects, users, collaborations, isLoaded, isLoading, fetchData } = useDataStore();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData(true);
  }, [user]);

  const pinnedProjects = projects.filter(p => p.pinned);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Member focused data
  const myTasks = tasks.filter(t => t.assignedTo?.id === user?.id || t.assignedTo === user?.id);
  const myCompletedTasks = myTasks.filter(t => t.status === 'completed');
  const myPendingTasks = myTasks.filter(t => t.status !== 'completed');
  const pendingIncomingInvite = collaborations.find(c => c.collaboratedWithId === user?.id && c.status === 'pending');

  const handleAcceptInvite = async (invitationId: string) => {
    try {
      setIsActionLoading(true);
      await usersApi.acceptInvitation(invitationId);
      await fetchData(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineInvite = async (invitationId: string) => {
    try {
      setIsActionLoading(true);
      await usersApi.collaborate(invitationId); // We would need a real decline endpoint, but this is a placeholder
      await fetchData(true);
    } catch(e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      setIsActionLoading(true);
      await tasksApi.updateTask(taskId, { status });
      await fetchData(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isLoaded) return <Layout><div className="pt-20 text-center text-gray-400 font-medium italic animate-pulse">Preparing your dashboard...</div></Layout>;

  if (user?.role === 'member') {
    return (
      <Layout>
        {pendingIncomingInvite && (
          <div className="mb-10">
            <div className="bg-white p-6 border-l-4 border-[#1e1b4b] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-[#1e1b4b]">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Team Invitation</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    <span className="font-bold text-gray-700">{pendingIncomingInvite.leaderName}</span> has invited you to join their team.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => handleDeclineInvite(pendingIncomingInvite.id)}
                  className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-tight"
                 >
                   Decline
                 </button>
                 <button 
                   onClick={() => handleAcceptInvite(pendingIncomingInvite.id)}
                   className="px-6 py-2 bg-[#1e1b4b] text-white text-xs font-bold hover:bg-[#2e2a70] transition-colors uppercase tracking-tight"
                 >
                   Accept & Join
                  </button>
              </div>
            </div>
          </div>
        )}

        {/* Member Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">My Tasks</p>
              <h4 className="text-2xl font-bold text-gray-900">{myTasks.length}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Completed</p>
              <h4 className="text-2xl font-bold text-gray-900">{myCompletedTasks.length}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Pending</p>
              <h4 className="text-2xl font-bold text-gray-900">{myPendingTasks.length}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Points</p>
              <h4 className="text-2xl font-bold text-gray-900">{myCompletedTasks.length * 10}</h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-bold text-gray-900 text-xl">My Projects</h3>
              <Link to="/projects" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide">
              {projects.length > 0 ? projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProject(p)}
                  className="flex-shrink-0 w-[280px] p-5 rounded-2xl text-white shadow-md cursor-pointer hover:-translate-y-1 transition-all"
                  style={{background: p.color || '#444'}}
                >
                  <h4 className="font-bold truncate">{p.name}</h4>
                  <p className="text-[10px] text-white/70 mt-1 uppercase tracking-wider font-bold">{p.tasks?.length || 0} Tasks - {p.memberCount || 0} Members</p>
                </div>
              )) : (
                <div className="w-full py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  No projects assigned
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-bold text-gray-900 text-xl">My Assigned Tasks</h3>
            </div>
            <div className="space-y-4">
              {myTasks.length > 0 ? myTasks.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${t.status === 'completed' ? 'bg-[#1e1b4b] border-[#1e1b4b] text-white' : 'border-gray-200'}`}>
                      {t.status === 'completed' && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold truncate max-w-[280px] ${t.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Project: {projects.find(p => p.id === t.projectId)?.name || 'Personal'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.status === 'pending' ? (
                      <button 
                        onClick={() => handleUpdateTaskStatus(t.id, 'in_progress')}
                        className="bg-blue-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition-all"
                      >
                        Accept Task
                      </button>
                    ) : t.status === 'in_progress' ? (
                      <button 
                        onClick={() => handleUpdateTaskStatus(t.id, 'completed')}
                        className="bg-green-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 transition-all"
                      >
                        Mark as Done
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-gray-100 text-gray-400">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <CheckCircle2 size={40} className="mb-4 opacity-20" />
                  <p className="font-bold">No tasks assigned to you yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4 px-2">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Pinned projects</h3>
              <p className="text-xs text-gray-500 mt-0.5">Quick access to your important projects</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5 mr-2">
                <button 
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-900 transition-all hover:shadow-sm"
                >
                  <ArrowLeft size={14} />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-900 transition-all hover:shadow-sm"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              <Link to="/manage" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All</Link>
            </div>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-2"
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {pinnedProjects.map(p => (
            <div 
               key={p.id} 
               onClick={() => setSelectedProject(p)}
               className="flex-shrink-0 w-[320px] p-6 rounded-3xl text-white shadow-md relative overflow-hidden h-44 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 snap-start group" 
               style={{background: p.color}}
            >
              <div 
                className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  projectsApi.updateProject(p.id, { pinned: !p.pinned }).then(() => fetchData(true));
                }}
              >
                <Pin size={16} fill={p.pinned ? "white" : "none"} className="rotate-45" />
              </div>
              <div>
                <h4 className="font-semibold text-lg hover:underline pr-6 truncate">{p.name}</h4>
                <p className="text-xs text-white/80 mt-1 font-medium">{p.memberCount || 0} members - {p.tasks?.length || 0} tasks</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                  <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-white/20 hover:border-white transition-colors shadow-sm" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} alt="p" />
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-medium">+</div>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-sm hover:bg-white transition-all hover:text-gray-900 group/btn">
                    <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
              </div>
            </div>
          ))}
          {pinnedProjects.length === 0 && (
            <div className="w-full py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-500">
               <Pin size={24} className="mb-2 opacity-20" />
               <p className="text-sm font-medium">No projects pinned yet</p>
               <Link to="/manage" className="text-xs text-blue-600 mt-2 font-bold hover:underline">Pin one in Manage Projects</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Analytics Graphs Section ── */}
      {(() => {
        const totalTasks = tasks.length;
        const completedCount = completedTasks.length;
        const pendingCount = pendingTasks.length;
        const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
        const purelyPending = pendingCount - inProgressCount;
        const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

        const donutData = [
          { name: 'Completed', value: completedCount },
          { name: 'In Progress', value: inProgressCount },
          { name: 'Pending', value: purelyPending > 0 ? purelyPending : 0 },
        ];
        const DONUT_COLORS = ['#22c55e', '#6366f1', '#f59e0b'];

        const projectBarData = projects.slice(0, 6).map(p => {
          const pTasks = tasks.filter(t => t.projectId === p.id);
          return {
            name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
            Completed: pTasks.filter(t => t.status === 'completed').length,
            'In Progress': pTasks.filter(t => t.status === 'in_progress').length,
            Pending: pTasks.filter(t => t.status === 'pending').length,
          };
        });

        return (
          <div className="mb-10">
            <h3 className="font-bold text-gray-800 text-lg mb-4 px-2">Task Analytics</h3>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Tasks', value: totalTasks, color: '#6366f1', bg: 'bg-indigo-50' },
                { label: 'Completed', value: completedCount, color: '#22c55e', bg: 'bg-green-50' },
                { label: 'In Progress', value: inProgressCount, color: '#8b5cf6', bg: 'bg-violet-50' },
                { label: 'Pending', value: purelyPending > 0 ? purelyPending : 0, color: '#f59e0b', bg: 'bg-amber-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`w-3 h-10 rounded-full`} style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-6">
              {/* Donut Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-1">Completion Rate</h4>
                <p className="text-xs text-gray-400 mb-4">Overall task status distribution</p>
                <div className="relative" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {donutData.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-gray-900">{completionPercent}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Done</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-5 mt-4">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }} />
                      <span className="text-[11px] font-semibold text-gray-500">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h4 className="font-bold text-gray-800 mb-1">Project-wise Breakdown</h4>
                <p className="text-xs text-gray-400 mb-4">Task status per project</p>
                {projectBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={projectBarData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="In Progress" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Pending" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-gray-300 text-sm italic">
                    No project data available
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      
      <div className="grid grid-cols-[1fr_1.5fr] gap-6">
        <div>
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Tasks for today</h3>
            <div className="bg-white p-7 rounded-xl shadow-sm border border-gray-100 min-h-[340px]">
              <div className="mb-8">
                  <h4 className="font-bold text-2xl text-gray-900">{tasks.length} tasks</h4>
                  <p className="text-gray-400 text-sm mt-1">{completedTasks.length} completed, {pendingTasks.length} left</p>
              </div>
              
              <div className="space-y-5">
                  {tasks.map(t => (
                      <div key={t.id} className="flex gap-4 items-start">
                          <div className={`rounded-full mt-1 ${t.status === 'completed' ? 'bg-[#1e1b4b] text-white p-0.5' : 'border border-gray-300 w-[18px] h-[18px]'}`}>
                              {t.status === 'completed' && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div>
                              <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{t.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[200px]">in {projects.find(p => p.id === t.projectId)?.name || 'Personal'}</p>
                          </div>
                      </div>
                  ))}
              </div>
            </div>
        </div>

        <div>
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Project Progress</h3>
            <div className="bg-white p-7 rounded-xl shadow-sm border border-gray-100 min-h-[340px]">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h4 className="font-bold text-2xl text-gray-900">Active Overview</h4>
                        <p className="text-gray-400 text-sm mt-1">{projects.length} projects in progress</p>
                    </div>
                </div>

                <div className="space-y-6">
                  {projects.slice(0, 4).map(p => {
                    const projectTasks = tasks.filter(t => t.projectId === p.id);
                    const completed = projectTasks.filter(t => t.status === 'completed').length;
                    const percent = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
                    
                    return (
                      <div key={p.id} className="group cursor-pointer" onClick={() => setSelectedProject(p)}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</span>
                           <span className="text-xs font-bold text-gray-400">{percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                           <div 
                             className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                             style={{width: `${percent}%`, backgroundColor: p.color}}
                           ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                           <span className="text-[10px] text-gray-400 font-medium">{projectTasks.length} total tasks</span>
                           <span className="text-[10px] text-gray-400 font-medium">{completed} completed</span>
                        </div>
                      </div>
                    );
                  })}
                  {projects.length === 0 && (
                    <div className="py-20 text-center text-gray-300 italic text-sm">
                      No project data available
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>

      {selectedProject && (
        <ProjectOverviewModal 
          project={selectedProject} 
          tasks={tasks} 
          users={users} 
          onClose={() => setSelectedProject(null)} 
          onUpdate={() => fetchData(true)}
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
