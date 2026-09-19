import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, X } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);


  const getCategoryImageUrl = (image) => {
    if (!image) return "";
    if (typeof image !== "string") return "";

    // Absolute URL
    if (image.startsWith("http://") || image.startsWith("https://")) return image;

    // Base host (strip trailing /api if API_BASE_URL is something like http://host/api)
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, "");

    // Normalize any leading slashes: uploads/x -> uploads/x, /uploads/x -> uploads/x, etc.
    const normalized = image.replace(/^\/+/, "");

    // If backend ever stores a full relative path like uploads/<filename>
    if (normalized.startsWith("uploads/")) {
      return `${baseUrl}/${normalized}`;
    }

    // Otherwise treat it as a raw filename returned by multer (e.g. 12345.webp)
    return `${baseUrl}/uploads/${normalized}`;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data || []);
    } catch {
      toast.error("Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openDelete = (category) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingCategory(null);
  };

  const handleDelete = async () => {
    if (!deletingCategory?._id) return;

    try {
      await axios.delete(`${API_BASE_URL}/categories/${deletingCategory._id}`);
      toast.success("Category removed");
      closeDelete();
      fetchCategories();
    } catch {
      toast.error("Unable to delete category");
    }
  };

  const handleEdit = (category) => {
    // Store category data in localStorage for the AddCategory page to use
    localStorage.setItem('editCategoryData', JSON.stringify(category));
    navigate('/add-category');
  };

  return (
    <div className="p-6 min-h-screen text-slate-900 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Manage Categories</h1>
          {/* <p className="text-sm text-slate-500">Review, edit and remove categories shown on the website.</p> */}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No categories available yet.</div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  {category.image ? (
                    <img
                      src={getCategoryImageUrl(category.image)}
                      alt={category.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  </div>
                </div>

                  <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-700 transition hover:bg-amber-50"
                    title="Edit Category"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => openDelete(category)}
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    title="Delete Category"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isDeleteOpen && deletingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-800 rounded-xl p-2">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Delete Category</h2>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Confirm deletion</p>
                </div>
              </div>
              <button onClick={closeDelete} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingCategory.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <button onClick={closeDelete} className="flex-1 py-3 border rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-[2] py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg">
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;

