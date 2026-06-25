import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ImageIcon,
  Link as LinkIcon,
  Upload,
  Clock,
  Tag,
  Calendar,
  PenLine,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Type,
  AlignLeft,
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const AddBlog = () => {
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    category: "",
    readTime: "",
    image: "",
    content: "",
    date: "",
  });

  const [imageType, setImageType] = useState("url"); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const regex = {
    title: /^[A-Za-z0-9\s]{5,120}$/,
    excerpt: /^.{10,200}$/,
    category: /^[A-Za-z\s]{3,30}$/,
    readTime: /^[0-9]{1,2}\s?(min|minutes|read)?$/i,
    image: /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))/i,
    date: /^\d{1,2}\s[A-Za-z]+$/,
  };

  // Logic for the "Today" shortcut
  const handleSetToday = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
    setForm((prev) => ({ ...prev, date: formatted }));
    setErrors((prev) => ({ ...prev, date: "" }));
  };

  const validate = (name, value) => {
    switch (name) {
      case "title":
        return regex.title.test(value) ? "" : "5–120 characters required.";
      case "excerpt":
        return regex.excerpt.test(value) ? "" : "10–200 characters required.";
      case "category":
        return regex.category.test(value) ? "" : "Letters only.";
      case "readTime":
        return regex.readTime.test(value) ? "" : "Ex: 5 min";
      case "image":
        if (imageType === "file") return "";
        return regex.image.test(value) ? "" : "Enter a valid image URL.";
      case "date":
        return regex.date.test(value) ? "" : "Ex: 27 March";
      case "content":
        return value.length > 30 ? "" : "Minimum 30 characters.";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validate(name, value) });
    if (name === "image" && imageType === "url") setPreviewUrl(value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, image: file.name }));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(form).forEach((field) => {
      const errorMsg = validate(field, form[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("excerpt", form.excerpt);
      formData.append("category", form.category);
      formData.append("readTime", form.readTime);
      formData.append("content", form.content);
      formData.append("date", form.date);

      // ✅ FIX IMAGE LOGIC
      if (imageType === "file") {
        formData.append("image", selectedFile);
      } else {
        formData.append("image", form.image);
      }

      // ✅ ONLY ONE API CALL
      await axios.post(`${API_BASE_URL}/blogs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Blog added successfully!");
      setErrors({});

      // Reset form
      setForm({
        title: "",
        excerpt: "",
        category: "",
        readTime: "",
        image: "",
        content: "",
        date: "",
      });
      setPreviewUrl("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Blog submission error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to add blog. Please try again.";
      setErrors({ submit: errorMessage });
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-scree p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT SIDE: THE FORM */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-200">
          <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <PenLine className="text-[#E5B234]" /> Add New Blog
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Title
              </label>
              <div className="relative">
                <Type
                  className="absolute left-3 top-3.5 text-slate-700"
                  size={18}
                />
                <input
                  name="title"
                  placeholder="Blog Title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Excerpt
              </label>
              <div className="relative">
                <AlignLeft
                  className="absolute left-3 top-3.5 text-slate-700"
                  size={18}
                />
                <input
                  name="excerpt"
                  placeholder="Short description"
                  value={form.excerpt}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              {errors.excerpt && (
                <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>
              )}
            </div>

            {/* Category & Read Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Category
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-3.5 text-slate-700"
                    size={18}
                  />
                  <input
                    name="category"
                    placeholder="Category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                  Read Time
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-3.5 text-slate-700"
                    size={18}
                  />
                  <input
                    name="readTime"
                    placeholder="5 min"
                    value={form.readTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                {errors.readTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.readTime}</p>
                )}
              </div>
            </div>

            {/* Image Source Toggle & Input */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Featured Image
                </label>
                <div className="flex bg-white p-1 rounded-lg border border-gray-300 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageType("url")}
                    className={`px-3 py-1 rounded ${imageType === "url" ? "bg-[#E5B234] text-white" : "text-slate-700"}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageType("file")}
                    className={`px-3 py-1 rounded ${imageType === "file" ? "bg-[#E5B234] text-white" : "text-slate-700"}`}
                  >
                    UPLOAD
                  </button>
                </div>
              </div>
              {imageType === "url" ? (
                <div className="relative">
                  <LinkIcon
                    className="absolute left-3 top-3.5 text-slate-700"
                    size={18}
                  />
                  <input
                    name="image"
                    placeholder="Image URL"
                    value={form.image}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ) : (
                <label className="w-full flex flex-col items-center justify-center h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <Upload className="text-slate-700 mb-1" size={20} />
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedFile ? selectedFile.name : "Select from computer"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                
              )}
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
              <span className="mt-2 text-sm font-semibold text-gray-400">Dimension: 500x400</span>
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Date
                </label>
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="text-[10px] font-bold text-[#E5B234] hover:text-blue-800 uppercase tracking-tighter"
                >
                  Set Today
                </button>
              </div>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3.5 text-slate-700"
                  size={18}
                />
                <input
                  name="date"
                  placeholder="27 March"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            {/* Content Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Content
              </label>
              <textarea
                name="content"
                placeholder="Write your content..."
                value={form.content}
                onChange={handleChange}
                rows="5"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Publish Blog Post"
              )}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: THE PREVIEW */}
        <div className="hidden lg:block">
          <div className="sticky top-10 space-y-4">
            <p className="text-xs font-black text-slate-700 uppercase tracking-widest ml-4">
              Live Preview
            </p>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 group">
              <div className="h-64 bg-slate-100 relative overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={48} strokeWidth={1} />
                    <span className="text-xs mt-2 font-medium">
                      No Image Provided
                    </span>
                  </div>
                )}
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black text-[#E5B234] shadow-sm uppercase tracking-tighter">
                    {form.category || "Category"}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-700 mb-4 uppercase">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {form.date || "Date"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {form.readTime || "Read Time"}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 line-clamp-2">
                  {form.title || "Your Blog Title"}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 italic">
                  {form.excerpt ||
                    "Your excerpt will appear here as a hook for readers..."}
                </p>
                <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-700">
                    <PenLine size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      New Author
                    </p>
                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-tight">
                      Publisher
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="bg-green-500 text-white p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 />
                <span className="font-bold text-sm">{success}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
