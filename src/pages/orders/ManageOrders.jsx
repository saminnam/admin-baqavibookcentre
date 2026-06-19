import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Package, Search, Eye, Trash2, CheckCircle, Truck, Clock, X, Mail, MapPin, Phone, User, Ban
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      const productsData = res.data.products || res.data;
      const productMap = {};
      productsData.forEach((p) => {
        productMap[p._id] = p;
      });
      setProducts(productMap);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/orders/status/${id}`, {
        status: newStatus,
      });
      fetchOrders();
      if (selectedOrder) setSelectedOrder(null);
      alert(`Order updated to ${newStatus} and email notification sent!`);
    } catch (error) {
      alert("Status update failed");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id.includes(searchTerm)
  );

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Package className="text-[#E5B236]" /> Manage Orders
        </h1>
      </div>

      {/* STATS - Added Confirmed and Cancelled */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" count={orders.length} color="blue" />
        <StatCard label="Pending" count={orders.filter((o) => o.status === "Pending").length} color="amber" />
        <StatCard label="Confirmed" count={orders.filter((o) => o.status === "Confirmed").length} color="indigo" />
        <StatCard label="Delivered" count={orders.filter((o) => o.status === "Delivered").length} color="green" />
        <StatCard label="Cancelled" count={orders.filter((o) => o.status === "Cancelled").length} color="red" />
      </div>

      {/* SEARCH */}
      <div className="bg-white px-3 py-4 rounded-3xl shadow-sm border border-slate-200 mb-6 flex items-center">
        <Search className="text-slate-700 mr-3" size={20} />
        <input
          type="text"
          placeholder="Search by Customer Name or Order ID..."
          className="w-full outline-none text-slate-700 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-700">Order ID / Date</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-700">Customer</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-700">Amount</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-700 text-center">Status</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-4 text-sm font-bold text-slate-600">
                  #{order._id.slice(-6).toUpperCase()}
                  <div className="text-[10px] font-normal text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{order.customer.name}</div>
                  <div className="text-xs text-slate-500 italic">{order.customer.email}</div>
                </td>
                <td className="px-6 py-4 font-black text-slate-700">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 bg-slate-100 text-slate-600 hover:bg-[#E5B236] hover:text-white rounded-xl transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW ORDER POPUP */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="font-black text-2xl text-slate-800 uppercase tracking-tight">Order Details</h2>
                <p className="text-slate-700 text-xs font-bold uppercase tracking-widest mt-1">ID: #{selectedOrder._id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} className="text-slate-700" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Left Column: User Info & Shipping */}
              <div className="space-y-8">
                <Section title="Customer Information" icon={<User size={16}/>}>
                  <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-200">
                    <p className="flex items-center gap-3 text-sm font-bold text-slate-700"><User size={14} className="text-[#E5B236]"/> {selectedOrder.customer.name}</p>
                    <p className="flex items-center gap-3 text-sm font-medium text-slate-600"><Mail size={14} className="text-[#E5B236]"/> {selectedOrder.customer.email}</p>
                    <p className="flex items-center gap-3 text-sm font-medium text-slate-600"><Phone size={14} className="text-[#E5B236]"/> {selectedOrder.customer.phone}</p>
                  </div>
                </Section>

                <Section title="Shipping Address" icon={<MapPin size={16}/>}>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {selectedOrder.shippingAddress.street},<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </Section>
              </div>

              {/* Right Column: Product List */}
              <div className="space-y-6">
                 <Section title="Items Summary" icon={<Package size={16}/>}>
                    <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                      <div className="max-h-[250px] overflow-y-auto p-2">
                        {selectedOrder.products.map((p, idx) => {
                          const product = products[p.productId];
                          return (
                            <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-200/50 last:border-0">
                              <div>
                                <p className="text-sm font-bold text-slate-800">{product?.name || "Unknown Product"}</p>
                                <p className="text-[10px] font-black text-slate-700 uppercase">Qty: {p.quantity} × ₹{p.price}</p>
                              </div>
                              <span className="font-black text-sm text-slate-700">₹{p.price * p.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-5 bg-white border-t border-slate-200 flex justify-between items-center">
                        <span className="font-black text-slate-700 uppercase text-xs">Total Amount</span>
                        <span className="text-2xl font-black text-[#E5B236]">₹{selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                 </Section>
              </div>
            </div>

            {/* ACTION FOOTER - Integrated New Buttons */}
            <div className="p-8 bg-white border-t border-slate-200 flex flex-wrap gap-3 justify-center">
              <ActionButton label="Confirm Order" color="indigo" icon={<CheckCircle size={14}/>} onClick={() => updateStatus(selectedOrder._id, "Confirmed")} />
              <ActionButton label="Ship Order" color="blue" icon={<Truck size={14}/>} onClick={() => updateStatus(selectedOrder._id, "Shipped")} />
              <ActionButton label="Mark Delivered" color="green" icon={<CheckCircle size={14}/>} onClick={() => updateStatus(selectedOrder._id, "Delivered")} />
              <div className="w-full flex justify-center gap-3 mt-2 border-t border-slate-200 pt-4">
                <ActionButton label="Back to Pending" color="amber" icon={<Clock size={14}/>} onClick={() => updateStatus(selectedOrder._id, "Pending")} />
                <ActionButton label="Cancel Order" color="red" icon={<Ban size={14}/>} onClick={() => updateStatus(selectedOrder._id, "Cancelled")} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Components
const StatCard = ({ label, count, color }) => {
    const colors = {
        blue: "border-blue-400",
        amber: "border-amber-400",
        indigo: "border-indigo-400",
        green: "border-green-400",
        red: "border-red-400"
    };
    return (
        <div className={`p-5 bg-white rounded-3xl border shadow-sm border-l-4 ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase text-slate-700 tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{count}</p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-100 text-amber-700",
    Confirmed: "bg-indigo-100 text-indigo-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${styles[status]}`}>
      {status}
    </span>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
        <span className="text-slate-700">{icon}</span>
        <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">{title}</h4>
    </div>
    {children}
  </div>
);

const ActionButton = ({ label, color, icon, onClick }) => {
  const bg = {
    amber: "bg-amber-500 hover:bg-amber-600",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    red: "bg-red-500 hover:bg-red-600"
  };
  return (
    <button
      onClick={onClick}
      className={`${bg[color]} cursor-pointer text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-black/5 hover:scale-105 transition-all flex items-center gap-2`}
    >
      {icon} {label}
    </button>
  );
};

export default ManageOrders;