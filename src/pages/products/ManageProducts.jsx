import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Trash2,
  Edit3,
  Eye,
  Search,
  Save,
  X,
  UploadCloud,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);


  // Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Image Source Toggle for Modal
  const [editSourceType, setEditSourceType] = useState({
    main: "url",
    gallery: "url",
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editGalleryFiles, setEditGalleryFiles] = useState([]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/products?limit=1000`);
      const productsData = data.products || data;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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


  // 🟢 Handle File to Base64 for preview and store file object for upload
  const handleFileChange = (e, name) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files);
    setEditGalleryFiles(files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProduct((prev) => ({
          ...prev,
          images: [...(prev.images || []), reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleEditSource = (section) => {
    setEditSourceType((prev) => ({
      ...prev,
      [section]: prev[section] === "url" ? "file" : "url",
    }));
  };
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
      fetchProducts();
      toast.success("Product Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate price if MRP or Discount changes
      if (name === "mrp" || name === "discount") {
        const mrp = name === "mrp" ? parseFloat(value) : parseFloat(prev.mrp);
        const disc =
          name === "discount" ? parseFloat(value) : parseFloat(prev.discount);
        updated.price = Math.round(mrp - (mrp * (disc || 0)) / 100);
      }
      return updated;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("name", selectedProduct.name);
      formDataToSend.append("slug", selectedProduct.slug);
      formDataToSend.append("mrp", selectedProduct.mrp);
      formDataToSend.append("price", selectedProduct.price);
      formDataToSend.append("discount", selectedProduct.discount);
      formDataToSend.append("stock", selectedProduct.stock);
      formDataToSend.append("status", selectedProduct.status);
      formDataToSend.append("category", selectedProduct.category);
      formDataToSend.append("desc", selectedProduct.desc);
      formDataToSend.append("productDetails", selectedProduct.productDetails);
      formDataToSend.append("author", selectedProduct.author);
      formDataToSend.append("rating", selectedProduct.rating);

      // Handle main image
      if (editSourceType.main === "file" && editImageFile) {
        formDataToSend.append("image", editImageFile);
      } else if (editSourceType.main === "url") {
        formDataToSend.append("image", selectedProduct.image);
      }

      // Handle gallery images
      if (editSourceType.gallery === "file" && editGalleryFiles.length > 0) {
        editGalleryFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });
      } else if (editSourceType.gallery === "url" && selectedProduct.images) {
        selectedProduct.images.forEach((img) => {
          formDataToSend.append("images", img);
        });
      }

      await axios.put(
        `${API_BASE_URL}/products/${selectedProduct._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Product Updated Successfully!");
      setIsEditOpen(false);
      setEditImageFile(null);
      setEditGalleryFiles([]);
      fetchProducts();
    } catch {
      toast.error("Update failed");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reusable Image Input Component for Modal
  const EditImageInput = ({ label, name, value, sectionKey }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-600">{label}</label>
        <button
          type="button"
          onClick={() => toggleEditSource(sectionKey)}
          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
        >
          {editSourceType[sectionKey] === "url" ? "USE FOLDER" : "USE URL"}
        </button>
      </div>

      {editSourceType[sectionKey] === "url" ? (
        <input
          name={name}
          value={value || ""}
          onChange={handleEditChange}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Paste Image URL..."
        />
      ) : (
        <label className="flex items-center justify-center border-2 border-dashed rounded-xl p-3 bg-gray-50 cursor-pointer hover:border-yellow-400 transition">
          <UploadCloud size={18} className="text-gray-400 mr-2" />
          <span className="text-xs text-gray-500 font-medium">
            Click to upload from folder
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, name)}
          />
        </label>
      )}
    </div>
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
                        onClick={() => {
                          setSelectedProduct({ ...p });
                          setIsEditOpen(true);
                        }}
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

      {/* ================= MODAL: EDIT PRODUCT (Add-Product Style) ================= */}
      {isEditOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">
                  Update Product
                </h2>
                <p className="text-xs text-gray-500 uppercase">
                  Modify existing inventory data
                </p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition"
              >
                <X />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleEditSubmit}
              className="p-6 md:p-10 overflow-y-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Core Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Product Name
                      </label>
                      <input
                        name="name"
                        value={selectedProduct.name}
                        onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Category
                      </label>
                      <select
                        name="category"
                        value={selectedProduct.category || ""}
                        onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      >
                        <option value="" disabled>
                          {categoriesLoading ? "Loading categories..." : "Select category"}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <EditImageInput
                      label="Main Image"
                      name="image"
                      value={selectedProduct.image}
                      sectionKey="main"
                    />

                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Full Specifications
                    </label>
                    <textarea
                      name="productDetails"
                      value={selectedProduct.productDetails}
                      onChange={handleEditChange}
                      rows="6"
                      className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  {/* Edit Gallery (Always at the bottom) */}
                  <div className="">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-bold text-gray-700 uppercase">
                        Gallery Photos
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEditSource("gallery")}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
                      >
                        {editSourceType.gallery === "url"
                          ? "SWITCH TO FOLDER"
                          : "SWITCH TO URL"}
                      </button>
                    </div>

                    {editSourceType.gallery === "url" ? (
                      <div className="flex gap-2">
                        <input
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          placeholder="Enter Image Link..."
                          className="flex-1 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newGalleryUrl) {
                              setSelectedProduct((prev) => ({
                                ...prev,
                                images: [...(prev.images || []), newGalleryUrl],
                              }));
                              setNewGalleryUrl("");
                            }
                          }}
                          className="bg-gray-900 text-white px-8 rounded-xl font-bold"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 hover:border-yellow-400 cursor-pointer transition">
                        <UploadCloud size={20} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 font-medium">
                          Click to upload multiple images
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleGalleryFiles}
                        />
                      </label>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4">
                      {selectedProduct.images?.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group w-24 h-24 border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProduct((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }))
                            }
                            className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Inventory & Extra */}
                <div className="space-y-6">
                  <div className="bg-gray-900 text-white p-6 rounded-3xl space-y-4 shadow-xl">
                    <h3 className="font-bold border-b border-gray-700 pb-2 text-yellow-400">
                      Pricing & Stock
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          name="mrp"
                          value={selectedProduct.mrp}
                          onChange={handleEditChange}
                          className="w-full bg-gray-800 rounded-lg p-2 mt-1 text-white border-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">
                          Disc (%)
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={selectedProduct.discount}
                          onChange={handleEditChange}
                          className="w-full bg-gray-800 rounded-lg p-2 mt-1 text-white border-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase">
                        Calculated Sale Price
                      </p>
                      <p className="text-2xl font-black text-yellow-500">
                        ₹{selectedProduct.price}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={selectedProduct.stock}
                        onChange={handleEditChange}
                        className="w-full bg-gray-800 rounded-lg p-2 mt-1 text-white border-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white border p-6 border-gray-200 rounded-3xl space-y-4">
                    <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2">
                      Meta Info
                    </h3>
                    <div>
                      <label className="text-xs font-bold text-gray-500">
                        Brand
                      </label>
                      <input
                        name="publisher"
                        value={selectedProduct.publisher || ""}
                        onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-xl p-2.5 mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500">
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="rating"
                        value={selectedProduct.rating ?? 0}
                        onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-xl p-2.5 mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500">
                        Status
                      </label>
                      <select
                        name="status"
                        value={selectedProduct.status || "active"}
                        onChange={handleEditChange}
                        className="w-full border border-gray-200 rounded-xl p-2.5 mt-1"
                      >
                        <option value="active">Visible</option>
                        <option value="inactive">Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-4 border rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold shadow-lg shadow-yellow-100 transition flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Push Updates to Live Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW ONLY ================= */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
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
