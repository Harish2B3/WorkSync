import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { Users, Mail, Shield, MoreVertical, Search, Filter, Trash2 } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getUsers().then(data => {
      setUsers(data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500">Manage team members, roles and access permissions.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                />
             </div>
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
                   <Filter size={18} />
                   Filter
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-6">User</th>
                  <th className="px-8 py-6">Role</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Last Active</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                          className="w-10 h-10 rounded-xl"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <button 
                          onClick={async () => {
                            const newRole = u.role === 'admin' ? 'member' : 'admin';
                            if (window.confirm(`Change ${u.name}'s role to ${newRole}?`)) {
                              try {
                                await usersApi.updateUser(u.id, { role: newRole });
                                const updated = await usersApi.getUsers();
                                setUsers(updated);
                              } catch(e) { console.error(e); }
                            }
                          }}
                          className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-lg transition-colors group/role"
                        >
                          <Shield size={14} className={u.role === 'admin' ? 'text-red-500' : 'text-blue-500'} />
                          <span className={`text-xs font-bold capitalize ${u.role === 'admin' ? 'text-red-600' : 'text-blue-600'}`}>
                            {u.role}
                          </span>
                        </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                      Today, 10:45 AM
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to permanently delete ${u.name}?`)) {
                              try {
                                await usersApi.deleteUser(u.id);
                                const updated = await usersApi.getUsers();
                                setUsers(updated);
                              } catch(e) { console.error(e); }
                            }
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-gray-50 flex items-center justify-between">
             <p className="text-xs text-gray-400 font-medium">Showing {users.length} users</p>
             <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Previous</button>
                <button className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl">1</button>
                <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Next</button>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
