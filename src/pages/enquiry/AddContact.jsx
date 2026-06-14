import React, { useState, useEffect } from 'react';
import { Save, Edit2, X, MapPin, Phone, Mail, Globe, Loader2, Facebook, MessageCircle, Radio, Youtube } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../components/Api';

const AddContact = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactData, setContactData] = useState({
    address: "",
    googleMapsLink: "",
    mapEmbedUrl: "",
    phone: "",
    email: "",
    facebook: "",
    whatsappChat: "",
    whatsappChannel: "",
    youtube: ""
  });
  const [errors, setErrors] = useState({});

  // Fetch data from API on load
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/contact/info`);
        setContactData(res.data);
      } catch (error) {
        console.error('Error fetching contact info:', error);
        // Keep default values if no data exists
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    try {
      const res = await axios.put(`${API_BASE_URL}/contact/info`, contactData);
      if (res.data.success) {
        setIsEditing(false);
        alert("Contact information updated successfully!");
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errorMessage = error.response?.data?.message || "Please fix the validation errors";
        alert(errorMessage);
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to update contact information";
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E5B236]" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-slate-800">Manage Contact Information</h1>
              <p className="mt-2">Update your business contact details and social media links</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center border border-slate-200 gap-2 px-6 py-3 bg-white text-[#E5B236] font-semibold rounded-xl hover:bg-gray-100 transition shadow-sm"
            >
              {isEditing ? <><X size={18}/> Cancel</> : <><Edit2 size={18}/> Edit Info</>}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Address Section */}
            <div className="space-y-3 col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <MapPin size={18} className="text-[#E5B236]" />
                Physical Address
              </label>
              <textarea
                name="address"
                disabled={!isEditing}
                value={contactData.address}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition resize-none ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                rows="3"
                placeholder="Enter your physical address"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Phone size={18} className="text-[#E5B236]" />
                Phone Number
              </label>
              <input
                name="phone"
                disabled={!isEditing}
                value={contactData.phone}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="+91 74488 88336"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Mail size={18} className="text-[#E5B236]" />
                Email Address
              </label>
              <input
                name="email"
                disabled={!isEditing}
                value={contactData.email}
                onChange={handleChange}
                className={`w-full p-4 border-2 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="baqavibookcentre@gmail.com"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Links */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Globe size={18} className="text-[#E5B236]" />
                Google Maps Embed URL
              </label>
              <input 
                name="mapEmbedUrl"
                disabled={!isEditing}
                value={contactData.mapEmbedUrl}
                onChange={handleChange}
                placeholder="https://google.com/maps/embed?..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Facebook size={18} className="text-[#E5B236]" />
                Facebook URL
              </label>
              <input 
                name="facebook"
                disabled={!isEditing}
                value={contactData.facebook}
                onChange={handleChange}
                placeholder="https://www.facebook.com/..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <MessageCircle size={18} className="text-[#E5B236]" />
                WhatsApp Chat Link
              </label>
              <input 
                name="whatsappChat"
                disabled={!isEditing}
                value={contactData.whatsappChat}
                onChange={handleChange}
                placeholder="https://wa.me/+91..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Radio size={18} className="text-[#E5B236]" />
                WhatsApp Channel Link
              </label>
              <input 
                name="whatsappChannel"
                disabled={!isEditing}
                value={contactData.whatsappChannel}
                onChange={handleChange}
                placeholder="https://www.whatsapp.com/channel/..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
                <Youtube size={18} className="text-[#E5B236]" />
                YouTube Channel URL
              </label>
              <input 
                name="youtube"
                disabled={!isEditing}
                value={contactData.youtube}
                onChange={handleChange}
                placeholder="https://www.youtube.com/@..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:border-gray-100 focus:border-[#E5B236] focus:ring-2 focus:ring-[#E5B236]/20 outline-none transition"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-10 flex justify-end gap-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                {saving ? <><Loader2 size={20} className="animate-spin"/> Saving...</> : <><Save size={20}/> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddContact;