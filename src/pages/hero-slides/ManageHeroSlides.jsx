import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2, Edit3, Plus, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const ManageHeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState({
    title: "",
    desktopImg: "",
    mobileImg: "",
    order: 0,
    status: "active",
  });

  const fetchSlides = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/hero-slides`);
      setSlides(data);
    } catch (error) {
      toast.error("Failed to fetch hero slides");
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSlide((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/${currentSlide._id}`, currentSlide);
        toast.success("Hero slide updated successfully");
      } else {
        await axios.post(API_BASE_URL, currentSlide);
        toast.success("Hero slide added successfully");
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        toast.success("Hero slide deleted successfully");
        fetchSlides();
      } catch (error) {
        toast.error("Failed to delete slide");
      }
    }
  };

  const resetForm = () => {
    setCurrentSlide({
      title: "",
      desktopImg: "",
      mobileImg: "",
      order: 0,
      status: "active",
    });
    setIsEditMode(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-slate-800">Manage Hero Slides</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Slide
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                Desktop Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile Image
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={slide.desktopImg}
                    alt="Desktop"
                    className="h-16 w-32 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={slide.mobileImg}
                    alt="Mobile"
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
                      onClick={() => handleDelete(slide._id)}
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
                  No hero slides found. Click "Add Slide" to create one.
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
                {isEditMode ? "Edit Hero Slide" : "Add Hero Slide"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 cursor-pointer hover:text-gray-700"
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
                  Desktop Image URL
                </label>
                <input
                  type="url"
                  name="desktopImg"
                  value={currentSlide.desktopImg}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="https://example.com/image.jpg"
                />
                {currentSlide.desktopImg && (
                  <img
                    src={currentSlide.desktopImg}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Image URL
                </label>
                <input
                  type="url"
                  name="mobileImg"
                  value={currentSlide.mobileImg}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="https://example.com/mobile-image.jpg"
                />
                {currentSlide.mobileImg && (
                  <img
                    src={currentSlide.mobileImg}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded"
                  />
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
    </div>
  );
};

export default ManageHeroSlides;
