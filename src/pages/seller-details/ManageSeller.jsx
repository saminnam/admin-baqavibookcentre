import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Eye,
  Trash2,
  X,
  Mail,
  Phone,
  Briefcase,
  Building,
  CreditCard,
  MapPin,
  Landmark,
  FileText,
  User, // Added missing import
  CheckCircle,
  Clock as ClockIcon,
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  const fetchSellers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/seller`);
      setSellers(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    }
  };

  // 2. Delete Seller
  const deleteSeller = async (id) => {
    if (window.confirm("Remove this seller from the database?")) {
      try {
        await axios.delete(`${API_BASE_URL}/seller/${id}`);
        setSellers(sellers.filter((s) => s._id !== id));
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // 3. Search Logic
  const filteredSellers = sellers.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.businessName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleVerify = async (id) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/seller/${id}/toggle-verify`,
      );
      setSellers(sellers.map((s) => (s._id === id ? res.data : s)));
    } catch (error) {
      console.error("Verification failed");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#FBFBFD] min-h-screen font-sans">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Users className="text-[#E5B236]" size={32} /> Manage Sellers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review registrations and business documentation.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Sellers"
          count={sellers.length}
          color="blue"
          icon={<Users size={20} />}
        />
        <StatCard
          label="Companies"
          count={sellers.filter((s) => s.businessType === "company").length}
          color="indigo"
          icon={<Building size={20} />}
        />
        <StatCard
          label="Recent Signups"
          count={
            sellers.filter(
              (s) =>
                new Date(s.createdAt) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ).length
          }
          color="amber"
          icon={<ClockIcon size={20} />}
        />
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center px-4 focus-within:ring-2 ring-[#E5B236]/20 transition-all">
        <Search className="text-slate-400 mr-3" size={20} />
        <input
          type="text"
          placeholder="Search by Seller Name or Business..."
          className="w-full py-3 outline-none text-sm text-slate-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Business Info
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider text-center">
                Category
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredSellers.map((seller) => (
              <tr
                key={seller._id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">
                    {seller.businessName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                    {seller.businessType}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-700">
                    {seller.fullName}
                  </div>
                  <div className="text-xs text-slate-400 font-medium italic">
                    {seller.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {seller.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedSeller(seller)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => toggleVerify(seller._id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition-all ${
                        seller.isVerified
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {seller.isVerified ? "✓ Verified" : "Pending"}
                    </button>
                    <button
                      onClick={() => deleteSeller(seller._id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-all"
                      title="Delete Seller"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSellers.length === 0 && !loading && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-10 text-slate-400 text-sm italic"
                >
                  No sellers found...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SELLER DETAILS MODAL */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="bg-[#E5B236]/10 p-3 rounded-2xl text-[#E5B236]">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="font-black text-2xl text-slate-800 uppercase">
                    {selectedSeller.businessName}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Seller Profile Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto">
              {/* Business Section */}
              <div className="space-y-6">
                <SectionHeader
                  title="Business Documents"
                  icon={<FileText size={16} />}
                />
                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <DetailRow
                    label="GST Number"
                    value={selectedSeller.gst}
                    icon={<Landmark size={14} />}
                  />
                  <DetailRow
                    label="PAN Number"
                    value={selectedSeller.pan}
                    icon={<FileText size={14} />}
                  />
                  <DetailRow
                    label="Pickup Location"
                    value={selectedSeller.pickupAddress}
                    icon={<MapPin size={14} />}
                  />
                </div>
              </div>

              {/* Banking Section */}
              <div className="space-y-6">
                <SectionHeader
                  title="Banking Details"
                  icon={<CreditCard size={16} />}
                />
                <div className="space-y-4 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                  <DetailRow
                    label="A/C Holder"
                    value={selectedSeller.bankHolderName}
                    icon={<User size={14} />}
                  />
                  <DetailRow
                    label="A/C Number"
                    value={selectedSeller.accountNumber}
                    icon={<CreditCard size={14} />}
                  />
                  <DetailRow
                    label="IFSC Code"
                    value={selectedSeller.ifsc}
                    icon={<Landmark size={14} />}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t bg-slate-50 flex justify-center gap-4">
              <button
                onClick={() => toggleVerify(selectedSeller._id)}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold shadow-lg cursor-pointer hover:scale-105 transition-all ${
                  selectedSeller.isVerified
                    ? "bg-amber-500 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {selectedSeller.isVerified ? (
                  <>
                    <CheckCircle size={18} /> Revert to Pending
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Mark as Verified
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  deleteSeller(selectedSeller._id);
                  setSelectedSeller(null);
                }}
                className="bg-red-500 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg cursor-pointer hover:scale-105 transition-all flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete Seller
              </button>
              <button
                onClick={() => setSelectedSeller(null)}
                className="bg-slate-800 text-white px-10 py-3 rounded-2xl text-sm font-bold shadow-lg cursor-pointer hover:scale-105 transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ label, count, color, icon }) => {
  const themes = {
    blue: "border-blue-400",
    indigo: "border-indigo-400",
    amber: "border-amber-400",
  };
  return (
    <div
      className={`p-6 bg-white rounded-3xl border shadow-sm border-l-4 ${themes[color]}`}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          {label}
        </p>
        <span className="text-slate-300">{icon}</span>
      </div>
      <p className="text-3xl font-black text-slate-800">{count}</p>
    </div>
  );
};

const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-2 px-1">
    <span className="text-[#E5B236]">{icon}</span>
    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
      {title}
    </h4>
  </div>
);

const DetailRow = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-slate-400 font-bold uppercase">
      {label}
    </span>
    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
      {icon} {value || "Not Provided"}
    </div>
  </div>
);

export default ManageSellers;
