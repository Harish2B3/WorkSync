import { Layout } from '../components/Layout';
import { useAuthStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { tasksApi } from '../services/api';
import { Award, Target, Rocket, Zap, Trophy, Star } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function Progress() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    tasksApi.getTasks().then(data => {
      setTasks(data.filter((t: any) => t.assignedTo === user?.id) || []);
    }).catch(console.error);
  }, [user]);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.length - completed;

  const chartData = [
    { name: 'Completed', value: completed },
    { name: 'Pending', value: pending },
  ];
  const COLORS = ['#4f46e5', '#f1f5f9'];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Progress</h2>
          <p className="text-gray-500">Visualize your achievements and upcoming goals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-pink-500 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">You're on fire! 🔥</h3>
                  <p className="text-white/80 max-w-md font-medium">You've completed {completed} tasks this week. Keep up the momentum to reach your monthly milestone.</p>
                  
                  <div className="mt-10 flex items-center gap-10">
                    <div>
                      <p className="text-4xl font-black">{Math.round((completed/tasks.length || 0) * 100)}%</p>
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Completion Rate</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <div>
                      <p className="text-4xl font-black">{completed * 100}</p>
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest mt-1">XP Points</p>
                    </div>
                  </div>
               </div>
               <Rocket size={180} className="absolute -right-10 -bottom-10 text-white/10 -rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-56">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-3xl">
                      <Trophy size={28} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Achievement</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Task Master</h4>
                    <p className="text-xs text-gray-500 mt-1">Complete 10 tasks in a single week</p>
                    <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-yellow-500" style={{width: `${(completed/10) * 100}%`}}></div>
                    </div>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between h-56">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                      <Zap size={28} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Streak</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Daily Hustler</h4>
                    <p className="text-xs text-gray-500 mt-1">5 day active streak</p>
                    <div className="flex gap-2 mt-4">
                       {[1,2,3,4,5].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${i <= 3 ? 'bg-indigo-500' : 'bg-gray-100'}`}></div>)}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="font-bold text-gray-900 mb-8 w-full">Task Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-4 mt-8">
               <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-sm font-bold text-gray-600">Completed</span>
                  </div>
                  <span className="text-sm font-black">{completed}</span>
               </div>
               <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <span className="text-sm font-bold text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-black">{pending}</span>
               </div>
            </div>
            <button className="w-full mt-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:scale-105 transition-all">
               View Full Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
