import { Layout } from '../components/Layout';
import { MessageSquare, Heart, Share2, MoreHorizontal, User, CheckCircle2 } from 'lucide-react';

export function Activity() {
  const activities = [
    { id: 1, user: 'Sarah Connor', action: 'completed a task', item: 'Logo Redesign', time: '2 hours ago', avatar: 'SC' },
    { id: 2, user: 'John Doe', action: 'joined the project', item: 'Wixly Website', time: '4 hours ago', avatar: 'JD' },
    { id: 3, user: 'Admin Amy', action: 'created a new task', item: 'Mobile App Wireframes', time: 'Yesterday', avatar: 'AA' },
    { id: 4, user: 'Member Bob', action: 'commented on', item: 'API Integration', time: 'Yesterday', avatar: 'MB' },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Activity</h2>
          <p className="text-gray-500">Stay updated with what your teammates are working on.</p>
        </div>

        <div className="space-y-6">
          {activities.map((act) => (
            <div key={act.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                       {act.avatar}
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-gray-900">{act.user}</h4>
                       <p className="text-xs text-gray-400">{act.time}</p>
                    </div>
                 </div>
                 <button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
                    <MoreHorizontal size={20} />
                 </button>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {act.user} {act.action} <span className="text-indigo-600 font-bold">"{act.item}"</span>
                </p>
              </div>

              {act.action.includes('completed') && (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                   <div className="p-2 bg-white rounded-xl text-green-600 shadow-sm">
                      <CheckCircle2 size={20} />
                   </div>
                   <p className="text-xs font-bold text-green-700">Project milestone reached!</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-50 flex items-center gap-6">
                 <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                    <Heart size={18} />
                    <span className="text-xs font-bold">12</span>
                 </button>
                 <button className="flex items-center gap-2 text-gray-400 hover:text-indigo-500 transition-colors">
                    <MessageSquare size={18} />
                    <span className="text-xs font-bold">4</span>
                 </button>
                 <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <Share2 size={18} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-[2rem] font-bold text-sm border-2 border-dashed border-gray-100 hover:bg-gray-100 transition-all">
           Load older activities
        </button>
      </div>
    </Layout>
  );
}
