import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, Mail, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../components/Api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin-users/login`, {
        email,
        password,
      });

      localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      localStorage.setItem("adminToken", response.data.token);
      console.log("User data saved to localStorage:", response.data.user);
      console.log("User permissions:", response.data.user.permissions);
      window.dispatchEvent(new Event('custom-storage-update'));
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            {/* <Shield size={40} className="text-white" /> */}
            <img src="src/assets/logos/logo-bg.png" alt="Logo-Gold" className="w-32" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Welcome Back User</h1>
          {/* <p className="text-slate-500">Sign in to access the dashboard</p> */}
        </div>

        {/* Login Card */}
        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-center font-medium text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Mail size={16} className="text-[#E5B236]" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Lock size={16} className="text-[#E5B236]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#E5B236] focus:ring-[#E5B236]"
                />
                <span className="text-sm font-medium">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#E5B236] to-[#d4a32e] text-white font-bold rounded-xl hover:from-[#d4a32e] hover:to-[#c49226] transition-all shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={20} className="animate-spin"/> Signing In...</> : <><Lock size={20} /> Sign In</>}
            </button>
          </form>


        </div>

        {/* Copyright */}
        {/* <div className="text-center mt-8 text-slate-700 text-sm">
          © 2024 Admin Panel. All rights reserved.
        </div> */}
      </div>
    </div>
  );
}

export default Login;
