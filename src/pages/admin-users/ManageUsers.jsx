import axios from "axios";
import React, { useEffect, useState } from "react";
import { Users, Search, Eye, Edit2, Trash2, X, Shield, Mail, Phone, CheckCircle, XCircle, ToggleLeft, ToggleRight, Loader2, RefreshCw, MoreVertical } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api"; 

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const availablePermissions = [
    { id: "dashboard", label: "Dashboard" },
    { id: "user-list", label: "User Management" },
    { id: "add-user", label: "Add User" },
    { id: "product-list", label: "Product List" },
    { id: "add-product", label: "Add Product" },
    { id: "order-list", label: "Order Management" },
    { id: "manage-sellers", label: "Seller Management" },
    { id: "manage-enquires", label: "Enquiry Management" },
    { id: "blog-list", label: "Blog Management" },
    { id: "add-blog", label: "Add Blog" },
    { id: "website-users", label: "Website Users" },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin-users`);
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

  const handleDelete = async (id, email) => {
    if (email === "admin@example.com")
      return alert("Cannot delete default admin!");
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin-users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      if (selectedUser) setSelectedUser(null);
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const user = users.find(u => u._id === id);
      const newStatus = user.status === "active" ? "inactive" : "active";
      await axios.put(`${API_BASE_URL}/admin-users/${id}`, { status: newStatus });
      setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
    } catch {
      alert("Failed to update status");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/admin-users/${editingUser._id}`, editingUser);
      alert("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch {
      alert("Failed to update user");
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setEditingUser((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-[#E5B236] rounded-lg text-white">
               <Users size={24} />
            </div>
            Manage Users
          </h1>
          <p className="text-slate-500 mt-1">Manage admin user accounts and permissions.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Users" count={users.length} icon={<Users size={20}/>} color="blue" />
        <StatCard label="Active Users" count={users.filter(u => u.status === "active").length} icon={<CheckCircle size={20}/>} color="green" />
        <StatCard label="Inactive Users" count={users.filter(u => u.status === "inactive").length} icon={<XCircle size={20}/>} color="red" />
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center px-4 focus-within:ring-2 ring-[#E5B236]/20 transition-all mb-6">
        <Search className="text-slate-400 mr-3" size={20} />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          className="w-full py-3 outline-none text-sm text-slate-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium animate-pulse">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-wider">User Info</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
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
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter flex items-center gap-1">
                            <Shield size={10} /> {user.role || 'admin'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" /> {user.email}
                      </div>
                      <div className="text-xs text-slate-400 font-medium italic flex items-center gap-1 mt-1">
                        <Phone size={12} /> {user.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className="inline-flex items-center border-slate-300 gap-1.5 py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-tight border cursor-pointer transition-all hover:scale-105"
                      >
                        {user.status === "active" ? (
                          <span className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1">
                            <CheckCircle size={12} /> Active
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-600 border-red-100 flex items-center gap-1">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </button>
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
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.email)}
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
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">User Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <DetailRow label="Email" value={selectedUser.email} icon={<Mail size={16}/>} />
              <DetailRow label="Phone" value={selectedUser.phone || "N/A"} icon={<Phone size={16}/>} />
              <DetailRow label="Role" value={selectedUser.role || "admin"} icon={<Shield size={16}/>} />
              <DetailRow label="Status" value={selectedUser.status || "active"} icon={selectedUser.status === "active" ? <CheckCircle size={16}/> : <XCircle size={16}/>} />
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Permissions</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                    selectedUser.permissions.map((permission) => (
                      <PermissionBadge key={permission} permission={permission} />
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">No specific permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50 flex justify-center">
              <button onClick={() => setSelectedUser(null)} className="bg-slate-800 text-white px-10 py-3 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white h-[90vh] w-full max-w-lg shadow-2xl overflow-y-scroll">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="bg-[#E5B236]/10 p-3 rounded-2xl text-[#E5B236]">
                  <Edit2 size={24} />
                </div>
                <div>
                  <h2 className="font-black text-2xl text-slate-800">Edit User</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Update user details</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-8 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide block mb-2">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide block mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide block mb-2">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide block mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide block mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide block mb-2">Permissions</label>
                <div className="max-h-32 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={editingUser.permissions?.includes(permission.id) || false}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="w-4 h-4 text-[#E5B236] focus:ring-[#E5B236] rounded"
                      />
                      <span className="text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
            <div className="p-8 border-t bg-slate-50 flex justify-center gap-4">
              <button onClick={() => setEditingUser(null)} className="bg-slate-200 text-slate-700 px-8 py-3 rounded-2xl text-sm font-bold hover:scale-105 transition-all">
                Cancel
              </button>
              <button onClick={handleEdit} className="bg-[#E5B236] text-white px-8 py-3 rounded-2xl text-sm font-bold hover:scale-105 transition-all">
                Save Changes
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
    green: "bg-green-600 shadow-green-200/50",
    red: "bg-red-600 shadow-red-200/50"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:translate-y-[-4px] transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-800 leading-none mt-1">{count}</p>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
    <div className="text-[#E5B236]">{icon}</div>
    <div>
      <div className="text-[10px] text-slate-400 font-bold uppercase">{label}</div>
      <div className="text-sm font-bold text-slate-700">{value}</div>
    </div>
  </div>
);

const PermissionBadge = ({ permission }) => {
  const labels = {
    dashboard: "Dashboard",
    "user-list": "User Management",
    "add-user": "Add User",
    "product-list": "Product List",
    "add-product": "Add Product",
    "order-list": "Order Management",
    "manage-sellers": "Seller Management",
    "manage-enquires": "Enquiry Management",
    "blog-list": "Blog Management",
    "add-blog": "Add Blog",
    "website-users": "Website Users",
  };
  return (
    <span className="inline-block px-2 py-1 bg-[#E5B236]/10 text-[#E5B236] text-xs font-bold rounded-full">
      {labels[permission] || permission}
    </span>
  );
};

export default ManageUsers;
