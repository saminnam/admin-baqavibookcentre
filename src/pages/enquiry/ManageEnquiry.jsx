import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Mail, Phone, Calendar, User, Search, Trash2, 
  MessageSquare, Loader2, RefreshCw, Eye, X, 
  CheckCircle, Clock, RotateCcw, Filter, ArrowUpDown
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/contact/enquiries`);
      setEnquiries(res.data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/contact/enquiries/${id}/verify`);
      if (res.status === 200) {
        fetchEnquiries(); 
        if (selectedEnquiry) setSelectedEnquiry(null);
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this enquiry permanently?")) {
      try {
        await axios.delete(`${API_BASE_URL}/contact/enquiries/${id}`);
        setEnquiries(enquiries.filter(item => item._id !== id));
        if (selectedEnquiry) setSelectedEnquiry(null);
      } catch (error) {
        alert("Failed to delete");
      }
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // --- STATS CALCULATION ---
  const totalCount = enquiries.length;
  const verifiedCount = enquiries.filter(item => item.verified).length;
  const pendingCount = totalCount - verifiedCount;

  // --- SEARCH & SORTING LOGIC ---
  const processedEnquiries = enquiries
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-[#E5B236] rounded-lg text-white">
               <MessageSquare size={24} />
            </div>
            Enquiry Inbox
          </h1>
          <p className="text-slate-500 mt-1">Monitor and manage incoming customer requests.</p>
        </div>
        <button 
          onClick={fetchEnquiries}
          className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Sync
        </button>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Received" count={totalCount} icon={<MessageSquare size={20}/>} color="blue" />
        <StatCard label="Verified" count={verifiedCount} icon={<CheckCircle size={20}/>} color="green" />
        <StatCard label="Pending Action" count={pendingCount} icon={<Clock size={20}/>} color="amber" />
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or keyword..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-[#E5B236]/20 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex items-center bg-slate-50 px-4 rounded-xl border border-slate-100">
            <ArrowUpDown size={16} className="text-slate-400 mr-2" />
            <select 
              className="bg-transparent outline-none text-sm font-semibold text-slate-600 cursor-pointer py-3"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-medium animate-pulse">Syncing data...</p>
          </div>
        ) : processedEnquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer info</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedEnquiries.map((item) => (
                  <tr key={item._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${item.verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium italic">
                            <Mail size={12} /> {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-semibold text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {item.verified ? (
                        <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-tight border border-green-100">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-tight border border-amber-100">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedEnquiry(item)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View Details">
                          <Eye size={20} />
                        </button>
                        <button 
                          onClick={() => handleVerify(item._id)} 
                          className={`p-2.5 rounded-xl transition-all ${item.verified ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={item.verified ? "Revert to Pending" : "Mark Verified"}
                        >
                          {item.verified ? <RotateCcw size={20} /> : <CheckCircle size={20} />}
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                          <Trash2 size={20} />
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
            <h3 className="text-lg font-bold text-slate-800">No results found</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">We couldn't find any enquiries matching "{searchTerm}". Try another keyword.</p>
          </div>
        )}
      </div>

      {/* 5. POPUP (MODAL) */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-[#E5B236]/10 rounded-2xl flex items-center justify-center text-[#E5B236]">
                    <User size={28} />
                 </div>
                 <div>
                    <h3 className="font-black text-2xl text-slate-800">{selectedEnquiry.name}</h3>
                    <p className="text-slate-500 font-medium text-sm">Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString()}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <InfoRow label="Email Address" value={selectedEnquiry.email} icon={<Mail size={16}/>} isLink />
                <InfoRow label="Phone Number" value={selectedEnquiry.phone || "Not Provided"} icon={<Phone size={16}/>} />
                <InfoRow label="Subject Line" value={selectedEnquiry.subject} icon={<Filter size={16}/>} />
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#E5B236] mb-4">Message Body</div>
                <div className="text-slate-600 leading-relaxed italic text-sm">
                   "{selectedEnquiry.message}"
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleVerify(selectedEnquiry._id)} 
                className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-200/50 ${selectedEnquiry.verified ? 'bg-amber-500 text-white shadow-amber-200/50' : 'bg-green-600 text-white'}`}
              >
                {selectedEnquiry.verified ? <RotateCcw size={18}/> : <CheckCircle size={18}/>}
                {selectedEnquiry.verified ? "Revert to Pending" : "Mark as Verified"}
              </button>
              <button 
                onClick={() => handleDelete(selectedEnquiry._id)} 
                className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const StatCard = ({ label, count, icon, color }) => {
  const colors = {
    blue: "bg-blue-600 shadow-blue-200/50",
    green: "bg-green-600 shadow-green-200/50",
    amber: "bg-amber-500 shadow-amber-200/50"
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

const InfoRow = ({ label, value, icon, isLink }) => (
  <div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className={`flex items-center gap-2 font-bold text-slate-700 ${isLink ? 'text-blue-600 hover:underline cursor-pointer' : ''}`}>
      {icon} {value}
    </div>
  </div>
);

export default ManageEnquiry;