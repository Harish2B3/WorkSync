import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';

export function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading || !stats) {
    return (
      <Layout>
        <div className="py-20 text-center text-gray-400 animate-pulse font-bold text-xl">
          Calculating Real-time Insights...
        </div>
      </Layout>
    );
  }

  const data = stats.trend && stats.trend.length > 0 ? stats.trend : [
    { name: 'Mon', tasks: 0, completed: 0 },
    { name: 'Tue', tasks: 0, completed: 0 },
    { name: 'Wed', tasks: 0, completed: 0 },
    { name: 'Thu', tasks: 0, completed: 0 },
    { name: 'Fri', tasks: 0, completed: 0 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Analytics</h2>
          <p className="text-gray-500">Track your team's performance and productivity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <BarChart3 size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500">Total Tasks</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalTasks}</h3>
            <p className="text-xs text-green-500 font-bold mt-2">Overall productivity</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500">Completed</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.completedTasks}</h3>
            <p className="text-xs text-green-500 font-bold mt-2">{Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}% success rate</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Users size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</h3>
            <p className="text-xs text-gray-400 font-bold mt-2">Active tasks</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <span className="text-sm font-bold text-gray-500">Efficiency</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%</h3>
            <p className="text-xs text-green-500 font-bold mt-2">Based on completion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[400px]">
            <h3 className="font-bold text-gray-900 mb-6">Task Completion Trend</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="tasks" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[400px]">
            <h3 className="font-bold text-gray-900 mb-6">Productivity Score</h3>
             <ResponsiveContainer width="100%" height="85%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="completed" stroke="#ec4899" strokeWidth={4} dot={{r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
