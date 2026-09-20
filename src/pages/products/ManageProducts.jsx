import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Edit3,
  Eye,
  Search,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const fetchProducts = async (page = 1) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/products?page=${page}&limit=${itemsPerPage}`);
      const productsData = data.products || data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      if (data.pagination) {
        setTotalPages(data.pagination.pages);
        setTotalProducts(data.pagination.total);
        setCurrentPage(data.pagination.current);
      }
    } catch (error) {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(res.data || []);
      } catch {
        toast.error("Unable to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);


  const openDelete = (product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingProduct(null);
  };

  const deleteProduct = async () => {
    if (!deletingProduct?._id) return;

    try {
      await axios.delete(`${API_BASE_URL}/products/${deletingProduct._id}`);
      closeDelete();
      fetchProducts(currentPage);
      toast.success("Product Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (product) => {
    // Store product data in localStorage for the AddProduct page to use
    localStorage.setItem('editProductData', JSON.stringify(product));
    navigate('/add-product');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.productCode && p.productCode.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="p-6 min-h-screen">
      {/* --- Search and Table header (remains same as your code) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Manage Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            View, edit, or delete your store products.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-yellow-500 outline-none bg-white shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs uppercase font-bold">Product</th>
                <th className="p-4 text-xs uppercase font-bold">Category</th>
                <th className="p-4 text-xs uppercase font-bold">Product Code</th>
                <th className="p-4 text-xs uppercase font-bold">Price</th>
                <th className="p-4 text-xs uppercase font-bold">Stock</th>
                <th className="p-4 text-xs uppercase font-bold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isHidden = p?.status === "inactive";

                return (
                  <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${isHidden ? "bg-slate-50/80" : ""}`}>
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={p.image}
                          className={`w-12 h-12 rounded-lg object-cover bg-gray-50 ${isHidden ? "blur-[1px] opacity-70" : ""}`}
                          alt=""
                        />
                        {isHidden && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-900/55 px-2 text-[10px] font-bold text-white text-center">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{p.name}</span>
                        {isHidden && (
                          <span className="text-[11px] font-semibold text-amber-600 mt-1">
                            Currently no available
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{p.category}</td>
                    <td className="p-4 text-sm text-gray-600">{p.productCode || "-"}</td>
                    <td className="p-4 font-bold text-gray-800">₹{p.price}</td>
                  <td className="p-4">
                    {p.stock <= 0 ? (
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit">
                        <AlertTriangle size={12} /> Out
                      </span>
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {p.stock} Units
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsViewOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-[#E5B234] text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW ONLY ================= */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl h-[80vh] overflow-y-scroll">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X />
            </button>
            <div className="flex justify-center mb-6">
              <img
                src={selectedProduct.image}
                className="w-48 h-48 object-contain rounded-xl"
                alt=""
              />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800">
              {selectedProduct.name}
            </h2>
            <p className="text-center text-blue-600 font-medium mb-6">
              {selectedProduct.category}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  Price
                </p>
                <p className="text-xl font-black text-gray-800">
                  ₹{selectedProduct.price}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  Stock
                </p>
                <p
                  className={`text-xl font-black ${selectedProduct.stock > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {selectedProduct.stock}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Description</h4>
                <p className="text-sm text-gray-500 italic">
                  {selectedProduct.desc || "No description provided."}
                </p>
              </div>
              
              {selectedProduct.descriptions && selectedProduct.descriptions.length > 0 && selectedProduct.descriptions.some(d => d.trim() !== "") && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mt-4">Additional Descriptions</h4>
                  <div className="space-y-2">
                    {selectedProduct.descriptions.filter(d => d.trim() !== "").map((desc, index) => (
                      <p key={index} className="text-sm text-gray-500 italic">
                        {desc}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProduct.productCode && (
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mt-4">Product Code</h4>
                  <p className="text-sm text-gray-500 italic">
                    {selectedProduct.productCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && deletingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-800 rounded-xl p-2">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Delete Product</h2>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Confirm deletion</p>
                </div>
              </div>
              <button onClick={closeDelete} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingProduct.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <button onClick={closeDelete} className="flex-1 py-3 border rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={deleteProduct} className="flex-[2] py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg">
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
