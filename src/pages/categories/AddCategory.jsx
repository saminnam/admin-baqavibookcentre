import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../components/Api";

const AddCategory = () => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/categories`, formData);
      toast.success("Category added successfully");
      setFormData({ name: "", description: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Add Category</h1>
        <p className="text-sm text-slate-500">Create categories that appear on the website homepage.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Books"
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Optional description"
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-xl bg-[#1E2939] px-5 py-2.5 font-semibold text-white transition hover:bg-[#090f17] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
