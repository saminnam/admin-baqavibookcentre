import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Shield, Plus, Edit, Trash2, CheckSquare, Square, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },

  // System Users
  { id: "user-list", label: "User Management" },
  { id: "add-user", label: "Add User" },

  // Roles
  { id: "manage-roles", label: "Manage Roles" },

  // Products
  { id: "product-list", label: "Product List" },
  { id: "add-product", label: "Add Product" },

  // Orders
  { id: "order-list", label: "Order Management" },

  // Sellers & Enquiries
  { id: "manage-sellers", label: "Seller Management" },
  { id: "manage-enquires", label: "Enquiry Management" },

  // Blogs
  { id: "blog-list", label: "Blog Management" },
  { id: "add-blog", label: "Add Blog" },

  // Categories
  { id: "manage-categories", label: "Manage Categories" },
  { id: "add-category", label: "Add Category" },

  // Hero Slides
  { id: "manage-hero-slides", label: "Manage Hero Slides" },
  { id: "manage-offer-hero-slides", label: "Manage Offer Hero Slides" },

  // Notifications
  { id: "notifications", label: "Notifications" },

  // Contacts
  { id: "add-contact", label: "Add Contact" },

  // Website Users
  { id: "website-users", label: "Website Users" },
];

const RolesAndPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles");
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => {
      const nextPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId];

      setSelectAll(nextPermissions.length === availablePermissions.length);
      return { ...prev, permissions: nextPermissions };
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setFormData((prev) => ({ ...prev, permissions: [] }));
      setSelectAll(false);
    } else {
      const allPermissions = availablePermissions.map((p) => p.id);
      setFormData((prev) => ({ ...prev, permissions: allPermissions }));
      setSelectAll(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Submitting form data:", formData);
      if (editingRole) {
        const response = await axios.put(`${API_BASE_URL}/roles/${editingRole._id}`, formData);
        console.log("Update response:", response.data);
        toast.success("Role updated successfully!");
      } else {
        const response = await axios.post(`${API_BASE_URL}/roles`, formData);
        console.log("Create response:", response.data);
        toast.success("Role created successfully!");
      }
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to save role.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions || [],
      status: role.status || "active",
    });
    setSelectAll(role.permissions?.length === availablePermissions.length);
    setIsEditing(true);
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/roles/${roleId}`);
      toast.success("Role deleted successfully!");
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", permissions: [], status: "active" });
    setEditingRole(null);
    setIsEditing(false);
    setSelectAll(false);
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl text-[#E5B236]">
                  <Shield size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900">Roles & Permissions</h1>
                  <p className="text-slate-600 mt-1">Manage user roles and their access permissions</p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsEditing(true);
                }}
                className="flex items-center border border-slate-200 gap-2 bg-white text-[#E5B236] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
              >
                <Plus size={20} /> Add Role
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Form */}
            {isEditing && (
              <div className="mb-8 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {editingRole ? "Edit Role" : "Add New Role"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Role Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="w-full p-3 border-2 bg-white border-gray-200 rounded-lg focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                        placeholder="Enter role name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Status
                      </label>
                      <select
                        name="status"
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition bg-white"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Permissions
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-[#E5B236] focus:ring-[#E5B236] rounded"
                        />
                        Select All
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-white rounded-lg border border-gray-200">
                      {availablePermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="w-4 h-4 text-[#E5B236] focus:ring-[#E5B236] rounded"
                          />
                          <span className="text-sm text-gray-700">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#E5B236] to-[#d4a32e] text-white px-6 py-3 rounded-xl font-bold hover:from-[#d4a32e] hover:to-[#c49226] transition-all shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 size={20} className="animate-spin"/> Saving...</>
                      ) : (
                        <><Plus size={20} /> {editingRole ? "Update Role" : "Create Role"}</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Roles List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Existing Roles</h2>
              {roles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No roles found. Click "Add Role" to create one.</p>
              ) : (
                <div className="grid gap-4">
                  {roles.map((role) => (
                    <div key={role._id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#E5B236] transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              role.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {role.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions?.map((permId) => {
                              const perm = availablePermissions.find((p) => p.id === permId);
                              return perm ? (
                                <span key={permId} className="px-3 py-1 bg-[#E5B236]/10 text-[#E5B236] rounded-lg text-xs font-medium">
                                  {perm.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(role._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesAndPermissions;
