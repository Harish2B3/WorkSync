
import {Layout} from '../components/Layout';
import React, {useEffect, useState} from 'react';
import {Users, Plus, Search, Check, Clock} from 'lucide-react';
import {usersApi} from '../services/api';
import {useAuthStore, useDataStore} from '../store/useStore';

export function TeamCreate() {
  const {user} = useAuthStore();
  const { users, collaborations, isLoaded, isLoading, fetchData } = useDataStore();
  const [search, setSearch] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [isTeamCreated, setIsTeamCreated] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())) &&
    u.id !== user?.id &&
    u.role !== 'admin'
  );

  const handleCreateTeam = () => {
    if (!leaderName.trim()) return;
    setIsTeamCreated(true);
  };

  const handleCollaborate = async (userId: string) => {
    if (!isTeamCreated) return;
    if (collaborations.find(c => c.collaboratedWithId === userId && c.userId === user?.id)) return;
    try {
      await usersApi.collaborate(userId, leaderName);
      fetchData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const myInvitedMembers = collaborations.filter(c => c.userId === user?.id);
  const isTeamCreator = myInvitedMembers.length > 0 || isTeamCreated;
  const isTeamMember = collaborations.some(c => c.collaboratedWithId === user?.id && c.status === 'accepted');
  const isInATeam = isTeamCreator || isTeamMember;

  const handleAcceptInvite = async (invitationId: string) => {
    try {
      await usersApi.acceptInvitation(invitationId);
      fetchData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    try {
      await usersApi.deleteCollaboration(id);
      fetchData(true);
    } catch(e) {
      console.error(e);
    }
  };

  const pendingIncomingInvite = collaborations.find(c => c.collaboratedWithId === user?.id && c.status === 'pending');

  return (
    <Layout>
      <div className="mb-8 px-2">
        <h2 className="text-2xl font-bold text-gray-900">Form a Team</h2>
        <p className="text-sm text-gray-500 mt-1">Connect with your colleagues and start working together</p>
      </div>

      {collaborations.filter(c => c.collaboratedWithId === user?.id && c.status === 'accepted').length > 0 && (
        <div className="mb-10 space-y-6 animate-in slide-in-from-top-4 duration-500">
          {collaborations.filter(c => c.collaboratedWithId === user?.id && c.status === 'accepted').map(invite => {
            const leaderUser = users.find(u => u.id === invite.userId);
            const teamMembers = collaborations.filter(c => c.userId === invite.userId && c.status === 'accepted');
            return (
              <div key={invite.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-indigo-50/30 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Team: {invite.leaderName}</h3>
                    <p className="text-xs text-gray-500 mt-1">You are a member of this team</p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {teamMembers.length} Members
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111827] text-white text-[10px] font-bold uppercase tracking-wider">
                        <th className="px-8 py-4">Member</th>
                        <th className="px-8 py-4">Role in Team</th>
                        <th className="px-8 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {/* Show Leader */}
                      {leaderUser && (
                        <tr className="hover:bg-gray-50/50 transition-all bg-indigo-50/10">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leaderUser.name)}&background=random`} className="w-8 h-8 rounded-lg" alt={leaderUser.name} />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{leaderUser.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{leaderUser.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-indigo-100 text-indigo-700">Team Leader</span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                          </td>
                        </tr>
                      )}
                      
                      {/* Show Members */}
                      {teamMembers.map(m => {
                        const memberUser = users.find(u => u.id === m.collaboratedWithId);
                        if (!memberUser) return null;
                        return (
                          <tr key={m.id} className="hover:bg-gray-50/50 transition-all">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(memberUser.name)}&background=random`} className="w-8 h-8 rounded-lg" alt={memberUser.name} />
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{memberUser.name} {memberUser.id === user?.id ? '(You)' : ''}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{memberUser.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-blue-50 text-blue-600">Member</span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingIncomingInvite && !isInATeam && (
        <div className="mb-10 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-[#1e1b4b] p-8 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-200">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center animate-bounce">
                <Users size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Team Invitation</h3>
                <p className="text-white/60 text-sm font-medium">
                  <span className="text-white font-bold">{pendingIncomingInvite.leaderName}</span> has invited you to join their team.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => handleRemoveMember(pendingIncomingInvite.id)}
                 className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all border border-white/10"
               >
                 Decline
               </button>
               <button 
                 onClick={() => handleAcceptInvite(pendingIncomingInvite.id)}
                 className="px-10 py-3 rounded-2xl bg-white text-indigo-900 font-bold hover:scale-105 active:scale-95 transition-all"
               >
                 Accept & Join
                </button>
            </div>
          </div>
        </div>
      )}

      {!isTeamMember && (
        <div className={`grid grid-cols-1 ${!isTeamCreator ? 'lg:grid-cols-[1fr_2fr] gap-10' : 'gap-8'}`}>
          {!isTeamCreator && (
            <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-6">Initialize Team</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Team Leader Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe" 
                    value={leaderName}
                    onChange={e => setLeaderName(e.target.value)}
                    disabled={isTeamCreated}
                    className="w-full border border-gray-200 bg-gray-50/50 px-4 py-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-sm disabled:opacity-50" 
                  />
                </div>
                <button 
                  onClick={handleCreateTeam}
                  className="w-full bg-[#4F46E5] text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Create Team
                </button>
              </div>
            </div>
              <div className="bg-[#1e1b4b] p-8 rounded-2xl text-white">
                <h4 className="font-bold mb-4">Collaboration Tips</h4>
                <ul className="text-xs space-y-3 text-white/70">
                  <li className="flex items-start gap-2">• First, establish the Team Leader</li>
                  <li className="flex items-start gap-2">• Search for colleagues by name or email</li>
                  <li className="flex items-start gap-2">• Click "Add" to invite them to collaborate</li>
                </ul>
              </div>
            </div>
          )}

        <div className="space-y-6">
          {!isTeamCreator ? (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 h-[500px] flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                <Users size={64} className="mb-6 opacity-20" />
                <h3 className="font-bold text-xl text-gray-900 mb-2">Member List Locked</h3>
                <p className="text-sm font-medium max-w-xs">Please provide the Team Leader name and "Create Team" to start adding members for collaboration.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-lg">Registered Members</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all w-64" 
                  />
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#111827] text-white text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-8 py-4">Member</th>
                      <th className="px-8 py-4">Role</th>
                      <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(!isLoaded || isLoading) ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400 text-sm animate-pulse">Loading users...</td>
                      </tr>
                    ) : filteredUsers.length > 0 ? filteredUsers.map(u => {
                      const collabStatus = collaborations.find(c => c.collaboratedWithId === u.id && c.userId === user?.id);
                      return (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-all group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} className="w-10 h-10 rounded-xl" alt={u.name} />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => handleCollaborate(u.id)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${collabStatus ? (collabStatus.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') : 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100 hover:scale-105 active:scale-95'}`}
                            >
                              {collabStatus ? (collabStatus.status === 'accepted' ? <><Check size={14} /> Accepted</> : <><Clock size={14} /> Pending</>) : <><Plus size={14} /> Collaborate</>}
                            </button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400 text-sm">No members found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {isTeamCreator && myInvitedMembers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-10">
                <div className="p-8 border-b border-gray-50 bg-gray-50/10">
                  <h3 className="font-bold text-lg">Your Team Status</h3>
                  <p className="text-xs text-gray-500 mt-1">Real-time status of collaboration requests sent by you</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#111827] text-white text-[10px] font-bold uppercase tracking-wider">
                        <th className="px-8 py-4">Member</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {myInvitedMembers.map(m => {
                        const targetUser = users.find(u => u.id === m.collaboratedWithId);
                        return (
                          <tr key={m.id} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.name || 'User')}&background=random`} className="w-8 h-8 rounded-lg" />
                                <span className="text-sm font-bold text-gray-900">{targetUser?.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${m.status === 'accepted' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`}></div>
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${m.status === 'accepted' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {m.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <button 
                                onClick={() => handleRemoveMember(m.id)}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-full transition-colors"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
        </div>
        </div>
      )}
    </Layout>
  );
}
