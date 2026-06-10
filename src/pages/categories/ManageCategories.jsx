import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data || []);
    } catch (error) {
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
    } catch (error) {
      toast.error("Unable to delete category");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Categories</h1>
          <p className="text-sm text-slate-500">Review and remove categories shown on the website.</p>
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
              <div key={category._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.description || "No description provided"}</p>
                </div>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
