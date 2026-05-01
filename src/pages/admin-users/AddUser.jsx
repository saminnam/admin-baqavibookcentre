import axios from "axios";
import React, { useState } from "react";
import { UserPlus, Shield, Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckSquare, Square } from "lucide-react";

const AddUser = ({ onUserAdded }) => {
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
    status: "active",
    permissions: []
  });
  const [selectAll, setSelectAll] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") checkPasswordStrength(value);
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
    // Update select all state
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter((p) => p !== permissionId)
      : [...formData.permissions, permissionId];
    setSelectAll(newPermissions.length === availablePermissions.length);
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

  const checkPasswordStrength = (password) => {
    let strength = 0;
    let errors = [];

    if (password.length >= 8) strength += 20;
    else errors.push("8+ characters");

    if (/[A-Z]/.test(password)) strength += 20;
    else errors.push("uppercase");

    if (/[a-z]/.test(password)) strength += 20;
    else errors.push("lowercase");

    if (/[0-9]/.test(password)) strength += 20;
    else errors.push("number");

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    else errors.push("special character");

    setPasswordStrength(Math.min(100, strength));
    setPasswordError(errors.length > 0 ? `Missing: ${errors.join(", ")}` : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordStrength < 100) {
      alert("Password does not meet requirements.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/admin-users`, formData);
      alert("User created successfully!");
      setFormData({ name: "", email: "", phone: "", password: "", role: "admin", status: "active", permissions: [] });
      setPasswordStrength(0);
      setPasswordError("");
      if (onUserAdded) onUserAdded();  
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const getProgressBarColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    else if (passwordStrength < 80) return "bg-yellow-500";
    else return "bg-green-500";
  };

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E5B236] to-[#d4a32e] p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl text-white">
                <UserPlus size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Add New User</h1>
                <p className="text-white/80 mt-1">Create a new admin user account</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <UserPlus size={16} className="text-[#E5B236]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Mail size={16} className="text-[#E5B236]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Phone size={16} className="text-[#E5B236]" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Shield size={16} className="text-[#E5B236]" />
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition bg-white"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <Lock size={16} className="text-[#E5B236]" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm mt-1">
                        {passwordError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#E5B236] focus:ring-[#E5B236]"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#E5B236] focus:ring-[#E5B236]"
                    />
                    <span className="font-medium text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <Shield size={16} className="text-[#E5B236]" />
                    Page Access Permissions
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors"
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

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E5B236] to-[#d4a32e] text-white py-4 rounded-xl font-bold hover:from-[#d4a32e] hover:to-[#c49226] transition-all shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader2 size={20} className="animate-spin"/> Creating User...</> : <><UserPlus size={20} /> Create User</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
