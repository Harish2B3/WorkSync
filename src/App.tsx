

import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {Login} from './pages/Login';
import {Dashboard} from './pages/Dashboard';
import {Projects} from './pages/Projects';
import {Tasks} from './pages/Tasks';
import {Calendar} from './pages/Calendar';
import {Manage} from './pages/Manage';
import {TeamCreate} from './pages/TeamCreate';
import {RaiseIssue} from './pages/RaiseIssue';
import {Analytics} from './pages/Analytics';
import {UserManagement} from './pages/UserManagement';
import {Progress} from './pages/Progress';
import {Activity} from './pages/Activity';
import {Settings} from './pages/Settings';
import {useAuthStore} from './store/useStore';
import {useEffect, useState} from 'react';
import {authApi} from './services/api';

export default function App() {
  const token = useAuthStore(s => s.token);
  const setUser = useAuthStore(s => s.setUser);
  const setToken = useAuthStore(s => s.setToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me().then(user => {
        setUser(user);
        setLoading(false);
      }).catch(() => {
        // Silently clear invalid or expired tokens (like previous dummy-tokens)
        setToken(null);
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token, setUser, setToken]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/manage" element={token ? <Manage /> : <Navigate to="/login" />} />
        <Route path="/projects" element={token ? <Projects /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={token ? <Tasks /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={token ? <Calendar /> : <Navigate to="/login" />} />
        <Route path="/team-create" element={token ? <TeamCreate /> : <Navigate to="/login" />} />
        <Route path="/raise-issue" element={token ? <RaiseIssue /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={token ? <Analytics /> : <Navigate to="/login" />} />
        <Route path="/users" element={token ? <UserManagement /> : <Navigate to="/login" />} />
        <Route path="/progress" element={token ? <Progress /> : <Navigate to="/login" />} />
        <Route path="/activity" element={token ? <Activity /> : <Navigate to="/login" />} />
        <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
