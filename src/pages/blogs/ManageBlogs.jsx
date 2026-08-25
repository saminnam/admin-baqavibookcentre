import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  Edit3,
  Plus,
  Calendar,
  Clock,
  X,
  Image as ImageIcon,
  FileText,
  UploadCloud,
  Link as LinkIcon,
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [imageMode, setImageMode] = useState("url"); // "url" | "file"
  const [imageFile, setImageFile] = useState(null);

  const initialFormState = {
    title: "",
    excerpt: "",
    category: "",
    readTime: "",
    image: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // Defaults to today
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/blogs`);
      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err.message);
      alert(`Error fetching blogs: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingId(blog._id);
      setForm({ ...blog });
      const isUrl = typeof blog.image === "string" && blog.image.startsWith("http");
      setImageMode(isUrl ? "url" : "file");
    } else {
      setEditingId(null);
      setForm(initialFormState);
      setImageMode("url");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Move this article to trash?")) {
      try {
        await axios.delete(`${API_BASE_URL}/blogs/${id}`);
        fetchBlogs();
      } catch (err) {
        console.error("Delete error:", err.message);
        alert(`Error deleting blog: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", form.title);
      formDataToSend.append("excerpt", form.excerpt);
      formDataToSend.append("category", form.category);
      formDataToSend.append("readTime", form.readTime);
      formDataToSend.append("content", form.content);
      formDataToSend.append("date", form.date);

      // Handle image
      if (imageMode === "file" && imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (imageMode === "url") {
        formDataToSend.append("image", form.image);
      }

      if (editingId) {
        await axios.put(`${API_BASE_URL}/blogs/${editingId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(`${API_BASE_URL}/blogs`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      setIsModalOpen(false);
      setImageFile(null);
      fetchBlogs();
    } catch (err) {
      console.error("Submit error:", err.message);
      const errorMessage = err.response?.data?.message || err.message || "Error saving blog post";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Content Studio
            </h1>
            <p className="text-slate-500 font-medium">
              Manage your digital stories and publication pipeline.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition-all shadow-xl shadow-slate-200 font-semibold"
          >
            <Plus size={20} /> Create Post
          </button>
        </div>

        {/* Table UI */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                  Article Details
                </th>
                <th className="px-6 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-6 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                  Schedule
                </th>
                <th className="px-8 py-5 text-right text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="group hover:bg-slate-50/30 transition-all"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative group">
                        <img
                          src={blog.image || "https://placehold.co/600x400"}
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-100 transition-all"
                        />
                      </div>
                      <div className="max-w-[300px]">
                        <div className="font-bold text-slate-900 text-lg leading-tight mb-1">
                          {blog.title}
                        </div>
                        <div className="text-sm text-slate-400 line-clamp-1 italic">
                          {blog.excerpt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="inline-flex items-center px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex flex-col text-sm font-medium">
                      <span className="text-slate-700 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />{" "}
                        {blog.date}
                      </span>
                      <span className="text-slate-400 flex items-center gap-2 mt-1">
                        <Clock size={14} /> {blog.readTime}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        onClick={() => handleOpenModal(blog)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PREMIUM MODAL --- */}
      {/* --- PREMIUM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {editingId ? "Edit Post" : "Draft New Post"}
                </h2>
                <p className="text-slate-400 text-sm">
                  Fine-tune your content details below.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                {/* Top Section: Title */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Article Title
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-transparent rounded-2xl p-4 text-lg font-semibold focus:bg-white focus:border-indigo-500/30 focus:ring-4 ring-indigo-500/5 transition-all outline-none"
                    placeholder="Enter title..."
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Middle Section: Balanced Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Stacked Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                        Category
                      </label>
                      <input
                        className="w-full bg-slate-50 border border-transparent rounded-xl p-3 focus:bg-white focus:border-indigo-500/30 outline-none transition-all"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Cover Image
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setImageMode((prev) => (prev === "url" ? "file" : "url"));
                            if (imageMode === "file") setImageFile(null);
                          }}
                          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
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
                            className="w-full bg-slate-50 border border-transparent rounded-xl p-3 pl-10 focus:bg-white focus:border-indigo-500/30 outline-none transition-all"
                            value={form.image}
                            onChange={(e) =>
                              setForm({ ...form, image: e.target.value })
                            }
                            placeholder="Paste image URL here..."
                          />
                        </div>
                      ) : (
                        <label className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:border-indigo-300 cursor-pointer transition-all">
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
                      {form.image && (
                        <div className="relative h-32 w-full rounded-xl overflow-hidden border bg-white group">
                          <img
                            src={form.image}
                            alt="Preview"
                            className="w-full h-full object-contain p-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, image: "" }));
                              setImageFile(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Read Time
                        </label>
                        <input
                          className="w-full bg-slate-50 border border-transparent rounded-xl p-3 focus:bg-white focus:border-indigo-500/30 outline-none transition-all"
                          value={form.readTime}
                          onChange={(e) =>
                            setForm({ ...form, readTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Date
                        </label>
                        <input
                          type="date"
                          className="w-full bg-slate-50 border border-transparent rounded-xl p-3 focus:bg-white focus:border-indigo-500/30 outline-none transition-all"
                          value={form.date}
                          onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Large Excerpt */}
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Short Excerpt
                    </label>
                    <textarea
                      className="w-full bg-slate-50 border border-transparent rounded-xl p-4 h-[225px] resize-none focus:bg-white focus:border-indigo-500/30 outline-none transition-all"
                      placeholder="A brief summary..."
                      value={form.excerpt}
                      onChange={(e) =>
                        setForm({ ...form, excerpt: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Bottom Section: Content Body */}
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Article Body (Content)
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-transparent rounded-2xl p-5 min-h-[200px] focus:bg-white focus:border-indigo-500/30 outline-none transition-all leading-relaxed text-slate-600"
                    placeholder="Start writing..."
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-10">
                <button
                  type="submit"
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {editingId ? "Save Changes" : "Create Publication"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;
