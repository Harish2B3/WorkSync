
import {Layout} from '../components/Layout';
import {useEffect, useState} from 'react';
import {useAuthStore} from '../store/useStore';
import {tasksApi, projectsApi, usersApi} from '../services/api';

export function Tasks() {
  const {user} = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({title: '', description: '', dueDate: '', projectId: '', assignedTo: ''});

  const load = () => {
    Promise.all([tasksApi.getTasks(), projectsApi.getProjects(), usersApi.getUsers()]).then(([t, p, u]) => {
      setTasks(t);
      setProjects(p);
      setUsers(u);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await tasksApi.createTask(newTask);
    setShowModal(false);
    setNewTask({title: '', description: '', dueDate: '', projectId: '', assignedTo: ''});
    load();
  };

  const handleStatusChange = async (task: any, newStatus: string) => {
    try {
        await tasksApi.updateTask(task.id, { status: newStatus });
        load();
    } catch (e: any) {
        alert(e.response?.data?.error || "Error updating task");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Task</button>
        )}
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Task Name</th>
                <th className="p-4 font-semibold text-gray-600">Assignee</th>
                <th className="p-4 font-semibold text-gray-600">Project</th>
                <th className="p-4 font-semibold text-gray-600">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, idx) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed';
                return (
                <tr key={t.id} className={`${idx !== tasks.length - 1 ? 'border-b' : ''} ${isOverdue ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 w-40">
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
                  <td className={`p-4 font-medium ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    <div>
                      {t.title}
                      {t.description && <p className="text-xs text-gray-500 mt-1 font-normal line-clamp-1">{t.description}</p>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {t.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                          {(users.find(u => u.id === t.assignedTo)?.name || 'U').charAt(0)}
                        </div>
                        <span className="text-xs">{users.find(u => u.id === t.assignedTo)?.name || 'Unknown'}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {projects.find(p => p.id === t.projectId)?.name || 'None'}
                  </td>
                  <td className="p-4 text-sm">
                     <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-700 border border-red-200' : 'text-gray-500'}`}>
                        {t.dueDate || 'No date'}
                     </span>
                  </td>
                </tr>
              )})}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <form className="bg-white p-6 rounded-2xl w-96 shadow-xl" onSubmit={handleCreate}>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Create Task</h3>
            <div className="space-y-4">
                <div>
                    <input 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="Task Title" 
                      value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} 
                      required
                    />
                </div>
                <div>
                    <textarea 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20" 
                      placeholder="Description" 
                      value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} 
                    />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                      <input 
                        type="date"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-500" 
                        value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                      />
                  </div>
                  <div className="flex-1">
                      <select 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-500"
                        value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                  </div>
                </div>
                <div>
                    <select 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-500"
                      value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
