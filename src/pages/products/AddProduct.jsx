import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ImagePlus,
  Trash2,
  Save,
  ImageIcon,
  Layers,
  DollarSign,
  ListOrdered,
  FileText,
  UploadCloud,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../../components/Api";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    images: [],
    mrp: "",
    price: "",
    discount: "",
    stock: "",
    status: "active",
    // store category name (for website filtering)
    category: "",
    desc: "",
    productDetails: "",
    author: "",
    rating: "",
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [galleryInput, setGalleryInput] = useState("");

  const [sourceType, setSourceType] = useState({
    main: "url",
    category: "url",
    gallery: "url",
  });

  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // 🟢 FIXED: Handler to store file object for FormData upload
  const handleFileChange = (e, name) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result })); // For preview only
        toast.success(`${name} loaded and ready to save`);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🟢 FIXED: Multi-file gallery handler for FormData upload
  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} images added to gallery`);
  };

  const toggleSource = (section) => {
    setSourceType((prev) => ({
      ...prev,
      [section]: prev[section] === "url" ? "file" : "url",
    }));
  };

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

  useEffect(() => {
    const mrpVal = parseFloat(formData.mrp) || 0;
    const discountVal = parseFloat(formData.discount) || 0;
    if (mrpVal > 0) {
      const calculatedPrice = mrpVal - (mrpVal * discountVal) / 100;
      setFormData((prev) => ({ ...prev, price: Math.round(calculatedPrice) }));
    }
  }, [formData.mrp, formData.discount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };

  const addGalleryImage = () => {
    if (galleryInput && !formData.images.includes(galleryInput)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, galleryInput],
      }));
      setGalleryInput("");
    }
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Check if image is provided when using file mode in serverless environment
    if (sourceType.main === "file" && !imageFile && !formData.image) {
      toast.error("Please provide an image (URL or file upload)");
      return;
    }
    
    // Warning for file upload mode
    if (sourceType.main === "file" && imageFile) {
      toast.warning("File upload mode selected - may not work in serverless environments. URL mode is recommended.");
    }
    
    try {
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("mrp", formData.mrp);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("discount", formData.discount);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("desc", formData.desc);
      formDataToSend.append("productDetails", formData.productDetails);
      formDataToSend.append("author", formData.author);
      formDataToSend.append("rating", formData.rating);

      // Handle main image
      if (sourceType.main === "file" && imageFile) {
        // For serverless environments, file uploads may not work
        console.warn("File upload mode selected for main image - may not work in serverless environments");
        formDataToSend.append("image", imageFile);
      } else if (sourceType.main === "url") {
        formDataToSend.append("image", formData.image);
      }

      // Handle gallery images
      if (sourceType.gallery === "file" && galleryFiles.length > 0) {
        // For serverless environments, file uploads may not work
        console.warn("File upload mode selected for gallery - may not work in serverless environments");
        galleryFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });
      } else if (sourceType.gallery === "url" && formData.images.length > 0) {
        formData.images.forEach((img) => {
          formDataToSend.append("images", img);
        });
      }

      await axios.post(`${API_BASE_URL}/products`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product Published Successfully!");

      setFormData({
        name: "",
        slug: "",
        image: "",
        images: [],
        mrp: "",
        price: "",
        discount: "",
        stock: "",
        status: "active",
        category: "",
        desc: "",
        productDetails: "",
        author: "",
        rating: "",
      });

      setGalleryInput("");
      setImageFile(null);
      setGalleryFiles([]);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data.message || "Error publishing product";
      
      // Provide more helpful error message for serverless file upload issues
      if (errorMessage.includes("ENOENT") || errorMessage.includes("no such file")) {
        toast.error("File uploads are not supported in the current environment. Please use image URLs instead.");
      } else if (err.response?.data?.details) {
        // Show detailed validation errors
        const details = err.response.data.details;
        const detailMessages = details.map(d => `${d.field}: ${d.message}`).join(", ");
        toast.error(`Validation error: ${detailMessages}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // UI Component for Image Upload Sections
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
          {sourceType[sectionKey] === "url"
            ? "SWITCH TO UPLOAD"
            : "SWITCH TO URL"}
        </button>
      </div>

      {sourceType[sectionKey] === "url" ? (
        <div className="relative">
          <LinkIcon
            size={16}
            className="absolute left-3 top-3.5 text-slate-700"
          />
          <input
            name={name}
            value={value || ""}
            onChange={handleChange}
            placeholder="Paste image URL here..."
            className="w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
          />
        </div>
      ) : (
        <div>
          <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:border-indigo-300 cursor-pointer transition-all">
            <UploadCloud className="text-slate-700 mb-1" size={24} />
            <span className="text-xs text-slate-500">
              Click to select from folder
            </span>
            {/* 🟢 FIXED: Added onChange handler here */}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, name)}
            />
          </label>
          <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
            ⚠️ File uploads may not work in serverless environments. URL mode is recommended.
          </p>
        </div>
      )}

      {value && (
        <div className="relative h-32 w-full rounded-xl overflow-hidden border bg-white group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-contain p-2"
          />
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, [name]: "" }))}
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Add Product
          </h1>
          <p className="text-slate-500">
            Create a new listing with gallery and category details.
          </p>
        </div>
        <button
          form="product-form"
          type="submit"
          className="bg-[#1E2939] hover:bg-[#090f17] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Save size={20} /> Publish
        </button>
      </div>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers size={20} className="text-[#E5B234]" /> General
              Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Product Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                  placeholder="Product name..."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  SEO Slug
                </label>
                <input
                  name="slug"
                  value={formData.slug}
                  readOnly
                  className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-500 italic"
                  placeholder="Auto-generated..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                >
                  <option value="" disabled>
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Author/Brand
                </label>
                <input
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  placeholder="Brand..."
                />
              </div>
            </div>
          </div>

          {/* Media & Gallery */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-[#E5B234]" /> Media & Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <ImageUploadBox
                label="Main Product Image"
                name="image"
                value={formData.image}
                sectionKey="main"
              />
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Additional Gallery
                </label>
                <button
                  type="button"
                  onClick={() => toggleSource("gallery")}
                  className="text-[10px] font-bold text-[#E5B234] bg-indigo-50 px-2 py-1 rounded-md"
                >
                  {sourceType.gallery === "url"
                    ? "SWITCH TO UPLOAD"
                    : "SWITCH TO URL"}
                </button>
              </div>

              {sourceType.gallery === "url" ? (
                <div className="flex gap-2">
                  <input
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="Paste gallery image link..."
                  />
                  <button
                    type="button"
                    onClick={addGalleryImage}
                    className="bg-slate-900 text-white px-6 rounded-xl font-bold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <div>
                  <label className="w-full h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 hover:border-indigo-300 cursor-pointer">
                    <UploadCloud size={20} className="text-slate-700 mr-2" />
                    <span className="text-sm text-slate-500">
                      Upload Multiple Images
                    </span>
                    {/* 🟢 FIXED: Added handleGalleryFiles here */}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryFiles}
                    />
                  </label>
                  <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded mt-2">
                    ⚠️ File uploads may not work in serverless environments. URL mode is recommended.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt="Gallery"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-400">
            Note: Image Dimension - 650x700
            </span>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText size={20} className="text-[#E5B234]" /> Descriptions
            </h2>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              rows="2"
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              placeholder="Short description..."
            ></textarea>
            <textarea
              name="productDetails"
              value={formData.productDetails}
              onChange={handleChange}
              rows="5"
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              placeholder="Detailed specifications..."
            ></textarea>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Inventory Card */}
          <div className="p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <DollarSign size={20} className="text-[#E5B234]" /> Inventory
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">
                  MRP (₹)
                </label>
                <input
                  name="mrp"
                  type="number"
                  value={formData.mrp}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase">
                  Discount (%)
                </label>
                <input
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-2xl">
              <label className="text-[10px] font-bold uppercase block mb-1">
                Selling Price
              </label>
              <span className="text-2xl font-black">
                ₹{Number(formData.price || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase">
                Stock Level
              </label>
              <input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Attributes Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ListOrdered size={20} className="text-[#E5B234]" /> Attributes
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Rating (0-5)
                </label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl p-3 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Visible</option>
                  <option value="inactive">Hidden</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
