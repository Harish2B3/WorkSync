
import {ReactNode, useState, useEffect} from 'react';
import {useAuthStore} from '../store/useStore';
import {Navigate, useLocation, Link, useNavigate} from 'react-router-dom';
import {LayoutDashboard, Calendar, Settings, Layers, Menu, LogOut, Users, AlertCircle} from 'lucide-react';
import { usersApi } from '../services/api';

export function Layout({children}: {children: ReactNode}) {
  const {user, logout} = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({ totalTasks: 0, weeklyTasks: 0 });

  useEffect(() => {
    if (user && location.pathname === '/dashboard') {
      usersApi.getStats().then(setStats).catch(console.error);
    }
  }, [user, location.pathname]);

  if (!user) return <Navigate to="/login" />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
    {path: '/calendar', label: 'Calendar', icon: Calendar},
    ...(user?.role === 'member' ? [
      {path: '/projects', label: 'Projects', icon: Layers},
      {path: '/team-create', label: 'Team Create', icon: Users},
      {path: '/raise-issue', label: 'Raise Issue', icon: AlertCircle},
    ] : [
      {path: '/manage', label: 'Manage', icon: Layers},
      {path: '/users', label: 'User Management', icon: Users},
    ]),
    {path: '/settings', label: 'Settings', icon: Settings},
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app-container flex overflow-hidden border border-white/40 shadow-2xl h-screen">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} flex flex-col bg-white border-r border-gray-100 z-20 transition-all duration-300`}>

        {/* Logo + Collapse Toggle */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h1 className="font-bold text-xl flex items-center gap-2 overflow-hidden whitespace-nowrap text-gray-900 tracking-tight">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white shrink-0">
                <Layers size={18} />
              </div>
              WorkSync
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 flex-1 px-4 mt-2">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all ${
                  isActive ? 'bg-gray-50 text-gray-900 font-bold' : 'text-gray-500 hover:bg-gray-50'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <item.icon size={18} className={`${isActive ? 'text-gray-900' : ''} flex-shrink-0`} />
                {!isCollapsed && <span className="text-[13px] overflow-hidden whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile + Logout — pinned at the bottom of sidebar */}
        <div className="px-4 pb-5 pt-4 border-t border-gray-100">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=111827&color=fff&size=80`}
                alt={user?.name}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=111827&color=fff&size=80`}
                alt={user?.name}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'text-indigo-600' : 'text-blue-600'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-10 overflow-y-auto">
        {location.pathname === '/dashboard' && (
          <header className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{getGreeting()}, {(user?.name || 'User').split(' ')[0]}!</h2>
              <p className="text-gray-500 text-sm">You have {stats.totalTasks} tasks for today and {stats.weeklyTasks} tasks for this week.</p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/manage')}
                className="bg-white border border-gray-200 shadow-sm text-gray-800 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="text-lg leading-none transform -translate-y-[1px]">+</span> New task
              </button>
            )}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
