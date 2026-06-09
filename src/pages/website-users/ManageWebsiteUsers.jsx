import axios from "axios";
import React, { useEffect, useState } from "react";
import { Users, Search, Eye, Trash2, X, Mail, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageWebsiteUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/auth/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      if (selectedUser) setSelectedUser(null);
    } catch {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="text-[#E5B236]">
               <Users size={24} />
            </div>
            Website Users
          </h1>
          <p className="text-slate-500 mt-1">Manage registered website users and their accounts.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard label="Total Users" count={users.length} icon={<Users size={20}/>} color="blue" />
        <StatCard label="Active Users" count={users.length} icon={<Users size={20}/>} color="green" />
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-3xl shadow-sm border border-slate-100 flex items-center px-4 focus-within:ring-2 ring-[#E5B236]/20 transition-all mb-6">
        <Search className="text-slate-700 mr-3" size={20} />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full py-3 outline-none text-sm text-slate-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-700">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium animate-pulse">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-700 uppercase tracking-wider">User Info</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-700 uppercase tracking-wider">Joined Date</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-700 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#E5B236]/10 rounded-xl flex items-center justify-center text-[#E5B236] font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{user.name}</div>
                          <div className="text-[10px] text-slate-700 font-black uppercase tracking-tighter">
                            Website User
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <Mail size={12} className="text-slate-700" /> {user.email}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-xs text-slate-700 font-medium italic flex items-center gap-1">
                        <Calendar size={12} /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete User"
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
        ) : (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No users found</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">No users matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="bg-[#E5B236]/10 p-3 rounded-2xl text-[#E5B236]">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="font-black text-2xl text-slate-800">{selectedUser.name}</h2>
                  <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">User Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <DetailRow label="Email" value={selectedUser.email} icon={<Mail size={16}/>} />
              <DetailRow label="Joined Date" value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'} icon={<Calendar size={16}/>} />
              <DetailRow label="User ID" value={selectedUser._id} icon={<Users size={16}/>} />
            </div>
            <div className="p-8 border-t bg-slate-50 flex justify-center">
              <button onClick={() => setSelectedUser(null)} className="bg-slate-800 text-white px-10 py-3 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, count, icon, color }) => {
  const colors = {
    blue: "bg-blue-600 shadow-blue-200/50",
    green: "bg-green-600 shadow-green-200/50"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-800 leading-none mt-1">{count}</p>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
    <div className="text-[#E5B236]">{icon}</div>
    <div>
      <div className="text-[10px] text-slate-700 font-bold uppercase">{label}</div>
      <div className="text-sm font-bold text-slate-700">{value}</div>
    </div>
  </div>
);

export default ManageWebsiteUsers;
