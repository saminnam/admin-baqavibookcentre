import React from "react";
import { X, Download, Send } from "lucide-react";

const InvoicePreview = ({ order, companyInfo, onClose, onSendInvoice }) => {
  if (!order || !companyInfo) return null;

  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const orderId = String(order._id).slice(-6).toUpperCase();

  const handleSendInvoice = async () => {
    try {
      await onSendInvoice();
      alert("Invoice sent successfully!");
    } catch (error) {
      console.error("Failed to send invoice:", error);
      alert("Failed to send invoice");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <div>
            <h2 className="font-black text-2xl text-slate-800 uppercase tracking-tight">Invoice Preview</h2>
            <p className="text-slate-700 text-xs font-bold uppercase tracking-widest mt-1">#{orderId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendInvoice}
              className="bg-[#E5B236] hover:bg-[#d4a12f] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Send size={16} /> Send Invoice
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
              <X size={24} className="text-slate-700" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 overflow-y-auto bg-slate-50">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-[#E5B236]">
              <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-800 mb-2">{companyInfo.companyName}</h1>
                <div className="space-y-1 text-slate-600 text-sm">
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.city}, {companyInfo.state} {companyInfo.postalCode}</p>
                  <p>{companyInfo.country}</p>
                  <p><strong>Email:</strong> {companyInfo.email}</p>
                  <p><strong>Phone:</strong> {companyInfo.phone}</p>
                  {companyInfo.website && <p><strong>Website:</strong> {companyInfo.website}</p>}
                  {companyInfo.taxId && <p><strong>Tax ID:</strong> {companyInfo.taxId}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-black text-[#E5B236] mb-2">INVOICE</h2>
                <div className="space-y-1 text-slate-600 text-sm">
                  <p><strong>Invoice #:</strong> {orderId}</p>
                  <p><strong>Date:</strong> {orderDate}</p>
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase mt-2">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border-l-4 border-[#E5B236]">
                <p className="text-xs font-black uppercase text-slate-700 tracking-wider mb-3">Bill To</p>
                <p className="font-bold text-slate-800">{order.customer.name}</p>
                <p className="text-slate-600 text-sm">{order.customer.email}</p>
                <p className="text-slate-600 text-sm">{order.customer.phone}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border-l-4 border-[#E5B236]">
                <p className="text-xs font-black uppercase text-slate-700 tracking-wider mb-3">Ship To</p>
                <p className="text-slate-600 text-sm">{order.shippingAddress.street}</p>
                <p className="text-slate-600 text-sm">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              </div>
            </div>

            {/* Order Details Table */}
            <div className="mb-8">
              <p className="text-xs font-black uppercase text-slate-700 tracking-wider mb-4">Order Details</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase">Product</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.products.map((p, idx) => {
                      const product = p.productId && typeof p.productId === 'object' 
                        ? p.productId 
                        : { name: "Unknown Product" };
                      const productName = product?.name || "Unknown Product";
                      const subtotal = p.price * p.quantity;

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700">{productName}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 text-center">{p.quantity}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 text-right">₹{p.price}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 text-right font-bold">₹{subtotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-end">
              <div className="w-full md:w-80">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm">Subtotal:</span>
                  <span className="text-slate-800 font-bold">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm">Shipping:</span>
                  <span className="text-slate-800 font-bold">₹0</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 text-sm">Tax:</span>
                  <span className="text-slate-800 font-bold">₹0</span>
                </div>
                <div className="bg-[#E5B236] text-white p-4 rounded-2xl mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-black">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-600 text-sm">Thank you for your business!</p>
              <p className="text-slate-500 text-xs mt-2">{companyInfo.companyName} | {companyInfo.email} | {companyInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;