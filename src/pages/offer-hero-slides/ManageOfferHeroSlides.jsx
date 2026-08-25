import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Edit3, Plus, Image as ImageIcon, Link as LinkIcon, UploadCloud, X } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageOfferHeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSlide, setDeletingSlide] = useState(null);
  const [imageMode, setImageMode] = useState("upload");
  const [imageFile, setImageFile] = useState(null);
  const [currentSlide, setCurrentSlide] = useState({
    title: "",
    subTitle: "",
    img: "",
    order: 0,
    status: "active",
  });

  const fetchSlides = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/offerHero-slides`);
      setSlides(data);
    } catch {
      toast.error("Failed to fetch offer hero slides");
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSlide((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentSlide((prev) => ({ ...prev, img: reader.result }));
      toast.success("Image loaded");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", currentSlide.title);
      formData.append("subTitle", currentSlide.subTitle);
      formData.append("order", currentSlide.order);
      formData.append("status", currentSlide.status);

      if (imageMode === "upload") {
        if (imageFile) {
          formData.append("img", imageFile);
        } else if (currentSlide.img && !currentSlide.img.startsWith("data:")) {
          formData.append("img", currentSlide.img);
        }
      } else {
        formData.append("img", currentSlide.img);
      }

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/offerHero-slides/${currentSlide._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Offer hero slide updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/offerHero-slides`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Offer hero slide added successfully");
      }

      setIsModalOpen(false);
      fetchSlides();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (slide) => {
    setCurrentSlide(slide);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openDelete = (slide) => {
    setDeletingSlide(slide);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingSlide(null);
  };

  const handleDelete = async () => {
    if (!deletingSlide?._id) return;

    try {
      await axios.delete(`${API_BASE_URL}/offerHero-slides/${deletingSlide._id}`);
      toast.success("Offer hero slide deleted successfully");
      closeDelete();
      fetchSlides();
    } catch {
      toast.error("Failed to delete slide");
    }
  };

  const resetForm = () => {
    setCurrentSlide({
      title: "",
      subTitle: "",
      img: "",
      order: 0,
      status: "active",
    });
    setImageFile(null);
    setImageMode("upload");
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-slate-800">Manage Offer Hero Slides</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Slide
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slides.map((slide) => (
              <tr key={slide._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slide.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slide.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slide.subTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={slide.img}
                    alt="Slide"
                    className="h-16 w-20 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      slide.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {slide.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => openDelete(slide)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {slides.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No offer hero slides found. Click "Add Slide" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0000002b] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Offer Hero Slide" : "Add Offer Hero Slide"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={currentSlide.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Title
                </label>
                <input
                  type="text"
                  name="subTitle"
                  value={currentSlide.subTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageMode(imageMode === "url" ? "upload" : "url")}
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
                      type="url"
                      name="img"
                      value={currentSlide.img}
                      onChange={handleInputChange}
                      required={!imageFile}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="https://example.com/image.jpg"
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
                <span className="text-sm font-semibold text-gray-400">Dimension: 300x300</span>
                {currentSlide.img && (
                  <div className="relative mt-2">
                    <img
                      src={currentSlide.img}
                      alt="Preview"
                      className="h-32 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSlide((prev) => ({ ...prev, img: "" }));
                        setImageFile(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={currentSlide.order}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={currentSlide.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  {isEditMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && deletingSlide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-800 rounded-xl p-2">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Delete Offer Hero Slide</h2>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Confirm deletion</p>
                </div>
              </div>
              <button onClick={closeDelete} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingSlide.title}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <button onClick={closeDelete} className="flex-1 py-3 border rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-[2] py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition shadow-lg">
                  Delete Slide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOfferHeroSlides;
