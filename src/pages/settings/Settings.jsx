import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Mail, Phone, MapPin, Globe, Save, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const Settings = () => {
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    taxId: "",
    website: "",
    logo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/company-info`);
      setCompanyInfo(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch company info:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCompanyInfo({
      ...companyInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (!companyInfo._id) {
        setMessage("Please wait for company info to load");
        setSaving(false);
        return;
      }
      
      await axios.put(`${API_BASE_URL}/company-info/${companyInfo._id}`, companyInfo);
      setMessage("Company information updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      // Refresh the data after saving
      fetchCompanyInfo();
    } catch (error) {
      console.error("Failed to update company info:", error);
      setMessage("Failed to update company information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#E5B236]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Building2 className="text-[#E5B236]" /> Company Settings
        </h1>
        <p className="text-slate-600 mt-2">Manage your company information for invoices and communications</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={companyInfo.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="Enter company name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Mail size={14} /> Email *
            </label>
            <input
              type="email"
              name="email"
              value={companyInfo.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="company@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Phone size={14} /> Phone *
            </label>
            <input
              type="text"
              name="phone"
              value={companyInfo.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="+91 9999999999"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <Globe size={14} /> Website
            </label>
            <input
              type="url"
              name="website"
              value={companyInfo.website}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="https://www.example.com"
            />
          </div>

          {/* Tax ID */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Tax ID / GSTIN</label>
            <input
              type="text"
              name="taxId"
              value={companyInfo.taxId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="Enter tax ID"
            />
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <MapPin size={14} /> Address *
            </label>
            <input
              type="text"
              name="address"
              value={companyInfo.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="Street address"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">City *</label>
            <input
              type="text"
              name="city"
              value={companyInfo.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="City"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">State *</label>
            <input
              type="text"
              name="state"
              value={companyInfo.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="State"
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Postal Code *</label>
            <input
              type="text"
              name="postalCode"
              value={companyInfo.postalCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="123456"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Country *</label>
            <input
              type="text"
              name="country"
              value={companyInfo.country}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#E5B236] focus:outline-none transition-all"
              placeholder="Country"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#E5B236] hover:bg-[#d4a12f] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-black/5 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;