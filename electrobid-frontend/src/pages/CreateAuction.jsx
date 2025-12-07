import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function CreateAuction() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    category: "Power Tools",
    condition: "Used",
    brand: "",
    voltage: "",
    power: "",
    warranty: "",
    endDate: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Validate inputs before submit
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (!formData.startingPrice || isNaN(formData.startingPrice))
      newErrors.startingPrice = "Please enter a valid starting price.";
    if (!formData.endDate) newErrors.endDate = "End date is required.";
    if (!formData.image) newErrors.image = "Please upload a product image.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // ✅ Handle image upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
    setErrors({ ...errors, image: "" });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠️ No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      const response = await fetch("http://localhost:5219/api/Auctions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (response.ok) {
        alert("✅ Auction created successfully!");
        navigate("/my-auctions"); // 👈 Redirect to seller’s auction list
      } else if (response.status === 401) {
        alert("🚫 Unauthorized! Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`❌ Failed: ${err.message || "Server error occurred"}`);
      }
    } catch (error) {
      console.error("❌ Error creating auction:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Restrict access to Sellers/Admins only
  if (!user || (user.role !== "Seller" && user.role !== "Admin")) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">
          🚫 Access Denied — Only Sellers can create auctions.
        </h2>
      </div>
    );
  }

  // ✅ Render Form
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300 p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
          ⚡ Create New Auction
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="font-semibold text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full border ${
                errors.title ? "border-red-400" : "border-gray-300"
              } rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full border ${
                errors.description ? "border-red-400" : "border-gray-300"
              } rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Starting Price */}
          <div>
            <label className="font-semibold text-gray-700">
              Starting Price (Rs)
            </label>
            <input
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              className={`w-full border ${
                errors.startingPrice ? "border-red-400" : "border-gray-300"
              } rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400`}
            />
            {errors.startingPrice && (
              <p className="text-red-500 text-sm">{errors.startingPrice}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="font-semibold text-gray-700">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full border ${
                errors.endDate ? "border-red-400" : "border-gray-300"
              } rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-400`}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm">{errors.endDate}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="font-semibold text-gray-700">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white"
            />
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image}</p>
            )}
          </div>

          {/* Category & Condition */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-semibold text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              >
                <option>Power Tools</option>
                <option>Electronics</option>
                <option>Appliances</option>
                <option>Furniture</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="font-semibold text-gray-700">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              >
                <option>New</option>
                <option>Used</option>
                <option>Refurbished</option>
              </select>
            </div>
          </div>

          {/* Extra Info */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2"
            />
            <input
              type="text"
              name="voltage"
              placeholder="Voltage (e.g. 220V)"
              value={formData.voltage}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2"
            />
            <input
              type="text"
              name="power"
              placeholder="Power (W)"
              value={formData.power}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2"
            />
            <input
              type="text"
              name="warranty"
              placeholder="Warranty Info"
              value={formData.warranty}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-md transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Creating Auction..." : "Create Auction"}
          </button>
        </form>
      </div>
    </div>
  );
}
