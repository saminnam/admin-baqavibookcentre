import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Pencil, X, UploadCloud } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`);
      toast.success("Category removed");
      fetchCategories();
    } catch {
      toast.error("Unable to delete category");
    }
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category?.name || "",
      description: category?.description || "",
    });
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingCategory(null);
    setEditImageFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory?._id) return;

    try {
      const payload = new FormData();
      payload.append("name", editForm.name);
      payload.append("description", editForm.description || "");

      // backend only updates image if file is provided
      if (editImageFile) {
        payload.append("image", editImageFile);
      }

      await axios.put(`${API_BASE_URL}/categories/${editingCategory._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category updated");
      closeEdit();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update category");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Categories</h1>
          <p className="text-sm text-slate-500">Review, edit and remove categories shown on the website.</p>
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
                      src={`${import.meta.env.VITE_API_BASE_URL || ""}/uploads/${category.image}`}
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

                    onClick={() => openEdit(category)}
                    className="flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-700 transition hover:bg-amber-50"
                    title="Edit Category"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
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

      {isEditOpen && editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-800 rounded-xl p-2">
                  <Pencil size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Edit Category</h2>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Update name / description / image</p>
                </div>
              </div>
              <button onClick={closeEdit} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#E5B236] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Image (optional)</label>
                <label className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:border-amber-400 cursor-pointer transition">
                  <UploadCloud size={18} className="text-slate-600" />
                  <span className="text-xs text-slate-500 mt-2">Click to upload new image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeEdit} className="flex-1 py-3 border rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition shadow-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;

