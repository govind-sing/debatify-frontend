import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axiosInstance";
import { CheckCircleIcon } from "@heroicons/react/outline";

const CreateDebate = () => {
  const [formState, setFormState] = useState({
    title: "",
    openingArgument: "",
    category: "",
    isPrivate: false,
    passcode: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      title: "",
      openingArgument: "",
      category: "",
      isPrivate: false,
      passcode: "",
    });
    setStatus({ loading: false, success: false, error: null });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setStatus({ loading: true, success: false, error: null });

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("You must be logged in to create a debate.");

        const payload = {
          title: formState.title,
          openingArgument: formState.openingArgument,
          category: formState.category,
          isPrivate: formState.isPrivate,
          passcode: formState.isPrivate ? formState.passcode : null,
        };

        await API.post("/debates", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus((prev) => ({ ...prev, success: true }));
        setTimeout(() => {
          resetForm();
          navigate("/debate");
        }, 1500);
      } catch (error) {
        console.error("Error creating debate:", error.response?.data);
        setStatus({
          loading: false,
          success: false,
          error: error.response?.data?.message || error.message || "Failed to create debate",
        });
      }
    },
    [formState, navigate, resetForm]
  );

  const categories = [
    { value: "", label: "Select Category" },
    { value: "🏛 Politics & Governance", label: "🏛 Politics & Governance" },
    { value: "📚 Education", label: "📚 Education" },
    { value: "🌐 Technology & Science", label: "🌐 Technology & Science" },
    { value: "🌍 Social Issues", label: "🌍 Social Issues" },
    { value: "💼 Business & Economy", label: "💼 Business & Economy" },
    { value: "🌱 Environment & Sustainability", label: "🌱 Environment & Sustainability" },
    { value: "🧠 Ethics Morality & Philosophy", label: "🧠 Ethics, Morality & Philosophy" },
    { value: "🕹 Entertainment Media & Sports", label: "🕹 Entertainment, Media & Sports" },
    { value: "🚀 Future & Innovation", label: "🚀 Future & Innovation" },
    { value: "🏥 Health & Lifestyle", label: "🏥 Health & Lifestyle" },
    { value: "🕌 Religion Caste & Social Identity", label: "🕌 Religion, Caste & Social Identity" },
    { value: "🌍 Region Regionalism", label: "🌍 Region / Regionalism" },
    { value: "🗣 Language & Communication", label: "🗣 Language & Communication" },
    { value: "📲 Social Media & Fandom_Culture", label: "📲 Social Media & Fandom Culture" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4 md:p-6 md:ml-64">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 w-full max-w-md md:max-w-lg"
      >
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4 md:mb-6 text-center"
        >
          Create a <span className="text-yellow-400">Debate</span>
        </motion.h2>

        {status.success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <CheckCircleIcon className="h-16 w-16 md:h-20 md:w-20 text-green-500 mx-auto mb-4 animate-pulse" />
            <p className="text-lg md:text-xl font-semibold text-green-600">Debate Created Successfully!</p>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Redirecting to Debate Hub...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label htmlFor="title" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter debate title"
                value={formState.title}
                onChange={handleChange}
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm md:text-base"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="openingArgument" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Opening Argument
              </label>
              <textarea
                id="openingArgument"
                name="openingArgument"
                placeholder="Please start with your Opening Argument..."
                value={formState.openingArgument}
                onChange={handleChange}
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-24 md:h-32 resize-none text-sm md:text-base"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label htmlFor="category" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none bg-white text-sm md:text-base"
                required
              >
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formState.isPrivate}
                  onChange={handleChange}
                  className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                />
                <span>Keep this debate private</span>
              </label>
            </motion.div>

            {formState.isPrivate && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label htmlFor="passcode" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                  Set a Passcode
                </label>
                <input
                  type="password"
                  id="passcode"
                  name="passcode"
                  placeholder="Enter a passcode"
                  value={formState.passcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm md:text-base"
                  required
                />
              </motion.div>
            )}

            {status.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="p-2 md:p-3 bg-red-100 text-red-700 rounded-xl border border-red-300 text-sm md:text-base"
              >
                {status.error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={status.loading}
              whileHover={{ scale: status.loading ? 1 : 1.05 }}
              whileTap={{ scale: status.loading ? 1 : 0.95 }}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 md:py-3 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-700 text-sm md:text-base ${
                status.loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {status.loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Debate"
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default CreateDebate;