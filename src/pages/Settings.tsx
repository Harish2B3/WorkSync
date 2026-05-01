
import { Layout } from '../components/Layout';
import { useState } from 'react';
import { useAuthStore } from '../store/useStore';
import { authApi } from '../services/api';
import { KeyRound, User, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export function Settings() {
  const { user } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setIsLoading(true);
      await authApi.updatePassword(newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully. Please log in again with your new password.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500 mt-1 text-sm">Manage your account preferences and security.</p>
        </div>

        {/* Account Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Account Information</h3>
              <p className="text-xs text-gray-500">Your current account details</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <p className="text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">{user?.name}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <p className="text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">{user?.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Role</label>
              <div className="flex items-center gap-2">
                <Shield size={14} className={user?.role === 'admin' ? 'text-indigo-600' : 'text-blue-600'} />
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${user?.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <KeyRound size={16} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Reset Password</h3>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-5">
            {message && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border text-sm font-medium ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {message.type === 'success'
                  ? <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-600" />
                  : <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                }
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Must be at least 6 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 transition-all ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-300 focus:border-red-400 bg-red-50/30'
                      : 'border-gray-200 focus:border-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">Passwords do not match.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
