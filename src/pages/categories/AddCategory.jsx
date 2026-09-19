import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../components/Api";
import { ImageIcon, Link as LinkIcon, UploadCloud, X } from "lucide-react";

const AddCategory = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", image: "" });

  // "upload" | "url"
  const [imageMode, setImageMode] = useState("upload");

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for edit mode data
    const editCategoryData = localStorage.getItem('editCategoryData');
    if (editCategoryData) {
      try {
        const category = JSON.parse(editCategoryData);
        setFormData({
          name: category.name || "",
          image: category.image || "",
        });
        setEditCategoryId(category._id);
        setIsEditMode(true);
        
        // Set image mode based on whether it's a URL
        const isUrl = typeof category.image === "string" && category.image.startsWith("http");
        setImageMode(isUrl ? "url" : "upload");
        if (isUrl) {
          setImageUrl(category.image);
        }
        
        // Clear the localStorage after loading
        localStorage.removeItem('editCategoryData');
      } catch (error) {
        console.error('Error parsing edit category data:', error);
        toast.error('Error loading category data for editing');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSource = (section) => {
    if (section !== "main") return;
    setImageMode((prev) => (prev === "url" ? "upload" : "url"));

    // keep state consistent
    if (imageMode === "url") {
      setImageUrl("");
    } else {
      setImageFile(null);
    }
  };

  // Preview + set db value (base64 preview kept in formData.image)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      toast.success("Category image loaded and ready to save");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (imageMode === "upload" && !imageFile && !isEditMode) {
      toast.error("Category image file is required");
      return;
    }

    if (imageMode === "url" && !imageUrl.trim() && !isEditMode) {
      toast.error("Category image URL is required");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", formData.name);

      // Backend currently only stores `image` filename from req.file
      if (imageMode === "upload") {
        if (imageFile) payload.append("image", imageFile);
      }

      // Keep existing URL mode behavior for UI compatibility.
      // NOTE: backend does not use imageUrl right now.
      if (imageMode === "url") {
        payload.append("imageUrl", imageUrl);
        payload.append("image", "");
      }

      if (isEditMode && editCategoryId) {
        // Update existing category
        await axios.put(`${API_BASE_URL}/categories/${editCategoryId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await axios.post(`${API_BASE_URL}/categories`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added successfully");
      }

      // Reset form and navigate back
      setFormData({ name: "", image: "" });
      setImageFile(null);
      setImageUrl("");
      setImageMode("upload");
      setIsEditMode(false);
      setEditCategoryId(null);
      
      // Navigate back to category list
      navigate('/manage-categories');
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save category");
    } finally {
      setLoading(false);
    }
  };

  const ImageUploadBox = ({ label, name, value, sectionKey }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => toggleSource(sectionKey)}
          className="text-[10px] font-bold text-[#1E2939] bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100"
        >
          {imageMode === "url" ? "SWITCH TO UPLOAD" : "SWITCH TO URL"}
        </button>
      </div>

      {imageMode === "url" ? (
        <div className="relative">
          <LinkIcon
            size={16}
            className="absolute left-3 top-3.5 text-slate-700"
          />
          <input
            name={name}
            value={imageUrl || ""}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setFormData((prev) => ({ ...prev, [name]: e.target.value }));
            }}
            placeholder="Paste image URL here..."
            className="w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
          />
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:border-indigo-300 cursor-pointer transition-all">
          <UploadCloud className="text-slate-700 mb-1" size={24} />
          <span className="text-xs text-slate-500">Click to select</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}

      {value && imageMode === "upload" && (
        <div className="relative h-32 w-full rounded-xl overflow-hidden border bg-white group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain p-2"
          />
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, [name]: "" }));
              setImageFile(null);
            }}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {imageMode === "url" && imageUrl && (
        <div className="relative h-32 w-full rounded-xl overflow-hidden border bg-white group">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-contain p-2"
          />
          <button
            type="button"
            onClick={() => {
              setImageUrl("");
              setFormData((prev) => ({ ...prev, [name]: "" }));
            }}
            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 min-h-screen text-slate-900 font-sans">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {isEditMode ? "Edit Category" : "Add Category"}
          </h1>
        </div>
        <div className="flex gap-3">
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate('/manage-categories')}
              className="border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            form="category-form"
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#1E2939] px-5 py-2.5 font-semibold text-white transition hover:bg-[#090f17] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : (isEditMode ? "Update" : "Save Category")}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
        id="category-form"
      >
        <div className="space-y-4">
          <div>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Category name"
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-[#E5B234]" /> Media
            </h2>

            <ImageUploadBox
              label="Main Category Image"
              name="image"
              value={formData.image}
              sectionKey="main"
            />
            <span className="text-sm font-semibold text-gray-400">Image Dimension: 250x250</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
