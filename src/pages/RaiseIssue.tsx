
import {Layout} from '../components/Layout';
import {AlertCircle, Send, MessageCircle, ChevronDown} from 'lucide-react';
import {useEffect, useState} from 'react';
import {projectsApi} from '../services/api';

export function RaiseIssue() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi.getProjects().then(data => {
      setProjects(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100 animate-pulse">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Report an Issue</h2>
          <p className="text-gray-500 mt-2 font-medium">Spotted a bug or having trouble? Let the admins know immediately.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Related Project</label>
              <div className="relative">
                <select className="w-full border border-gray-200 bg-gray-50/50 px-4 py-4 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all text-sm cursor-pointer appearance-none">
                  <option value="">General Issue (No Specific Project)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Issue Category</label>
              <div className="relative">
                <select className="w-full border border-gray-200 bg-gray-50/50 px-4 py-4 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all text-sm cursor-pointer appearance-none">
                  <option>Technical Bug</option>
                  <option>Access Credentials</option>
                  <option>Communication Error</option>
                  <option>Feature Request</option>
                  <option>Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Urgency Level</label>
              <div className="relative">
                <select className="w-full border border-gray-200 bg-gray-50/50 px-4 py-4 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all text-sm cursor-pointer appearance-none">
                  <option>Low - Info Only</option>
                  <option>Medium - Minor Issue</option>
                  <option>High - Blocking Work</option>
                  <option>Critical - System Failure</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Subject</label>
               <input type="text" placeholder="Brief summary of the problem" className="w-full border border-gray-200 bg-gray-50/50 px-6 py-4 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all text-sm" />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Detailed Description</label>
             <textarea 
               placeholder="Tell us more about what happened..." 
               className="w-full border border-gray-200 bg-gray-50/50 px-6 py-4 rounded-[2rem] outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all text-sm h-48 resize-none" 
             />
          </div>

          <div className="flex items-center justify-between pt-4">
             <div className="flex items-center gap-2 text-gray-400">
                <MessageCircle size={18} />
                <span className="text-xs font-semibold">Average response time: 2 hours</span>
             </div>
             <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-red-100 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 group">
               Send Report 
               <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
