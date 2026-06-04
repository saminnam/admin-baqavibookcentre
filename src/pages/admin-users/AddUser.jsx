import axios from "axios";
import React, { useState, useEffect } from "react";
import { UserPlus, Shield, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const AddUser = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "active",
  });
  const [roles, setRoles] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") checkPasswordStrength(value);
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
      setFormData({ name: "", email: "", phone: "", password: "", role: "", status: "active" });
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
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
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
