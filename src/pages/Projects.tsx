
import {Layout} from '../components/Layout';
import React, {useEffect, useState} from 'react';
import {useAuthStore} from '../store/useStore';
import {projectsApi, tasksApi, usersApi} from '../services/api';
import {ProjectOverviewModal} from '../components/ProjectOverviewModal';
import {Pin} from 'lucide-react';

export function Projects() {
  const {user} = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProj, setNewProj] = useState({name: '', description: ''});
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const load = () => {
    setLoading(true);
    Promise.all([projectsApi.getProjects(), tasksApi.getTasks(), usersApi.getUsers()]).then(([p, t, u]) => {
      setProjects(p || []);
      setTasks(t || []);
      setUsers(u || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await projectsApi.createProject(newProj);
    setShowModal(false);
    setNewProj({name: '', description: ''});
    load();
  };

  const handleTogglePin = async (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    try {
      await projectsApi.updateProject(project.id, { pinned: !project.pinned });
      load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Error updating project");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold">Projects</h2>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Project</button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-medium animate-pulse">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProject(p)}
              className="p-6 rounded-3xl text-white shadow-md flex flex-col justify-between h-44 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 relative group" 
              style={{background: p.color || '#444'}}
            >
              <button 
                onClick={(e) => handleTogglePin(e, p)}
                className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all z-10 ${p.pinned ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-white/20'}`}
              >
                <Pin size={16} fill={p.pinned ? "currentColor" : "none"} />
              </button>
              <div>
                <h4 className="font-semibold text-lg pr-8 truncate">{p.name}</h4>
                <p className="text-sm opacity-90 mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-white/80 font-medium px-3 py-1 bg-black/10 rounded-full">{p.memberCount || 0} members</span>
                <span className="text-xs text-white/80 font-medium px-3 py-1 bg-black/10 rounded-full">{p.tasks?.length || 0} tasks</span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-medium bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl uppercase tracking-widest text-xs">
              No projects assigned
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <form className="bg-white p-6 rounded-2xl w-96 shadow-xl" onSubmit={handleCreate}>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Create Project</h3>
            <input 
              className="w-full border p-2 rounded mb-4" 
              placeholder="Project Name" 
              value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} 
              required
            />
            <input 
              className="w-full border p-2 rounded mb-4" 
              placeholder="Description" 
              value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} 
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
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
    </Layout>
  );
}
