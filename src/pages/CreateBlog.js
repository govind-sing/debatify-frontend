import React, { useState, useRef, useCallback } from "react";
import API from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/outline";

const CreateBlog = () => {
  const [formState, setFormState] = useState({
    title: "",
    content: "",
    files: [],
    isPrivate: false,
    passcode: "",
  });
  const [status, setStatus] = useState({
    error: null,
    loading: false,
    success: false,
  });
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Memoized handlers
  const handleAddFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const newFiles = Array.from(e.target.files);
    setFormState((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
    e.target.value = null;
  }, []);

  const handleRemoveFile = useCallback((indexToRemove) => {
    setFormState((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      title: "",
      content: "",
      files: [],
      isPrivate: false,
      passcode: "",
    });
    setStatus({ error: null, loading: false, success: false });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setStatus({ error: null, loading: true, success: false });

      const formData = new FormData();
      formData.append("title", formState.title);
      formData.append("content", formState.content);
      formData.append("isPrivate", formState.isPrivate.toString());
      if (formState.isPrivate) formData.append("passcode", formState.passcode);
      formState.files.forEach((file) => formData.append("files", file));

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to create a blog post");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        await API.post("/blogs", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setStatus((prev) => ({ ...prev, success: true }));
        setTimeout(() => {
          resetForm();
          navigate("/blog");
        }, 1500);
      } catch (err) {
        console.error("Error in blog creation:", err);
        setStatus({
          error:
            err.name === "AbortError"
              ? "Request timed out. Try smaller files or check your connection."
              : err.response?.data?.message || err.message || "An unexpected error occurred",
          loading: false,
          success: false,
        });
      }
    },
    [formState, navigate, resetForm]
  );

  const handleInputChange = useCallback((field) => (e) => {
    const value = field === "isPrivate" ? e.target.checked : e.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

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
          Create a <span className="text-yellow-400">Blog</span>
        </motion.h2>

        {status.success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <CheckCircleIcon className="h-16 w-16 md:h-20 md:w-20 text-green-500 mx-auto mb-4 animate-pulse" />
            <p className="text-lg md:text-xl font-semibold text-green-600">Blog Created Successfully!</p>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Redirecting to Blog Hub...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label htmlFor="title" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formState.title}
                onChange={handleInputChange("title")}
                placeholder="Enter blog title"
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm md:text-base"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="content" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={formState.content}
                onChange={handleInputChange("content")}
                placeholder="Write your blog content..."
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-24 md:h-32 resize-none text-sm md:text-base"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf"
                multiple
              />
              <button
                type="button"
                onClick={handleAddFile}
                className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 text-sm md:text-base"
              >
                Add File
              </button>
              {formState.files.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {formState.files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-xl">
                      <span className="text-xs md:text-sm text-gray-700 truncate max-w-[10rem] md:max-w-xs">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs md:text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="flex items-center space-x-2 text-sm md:text-base font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formState.isPrivate}
                  onChange={handleInputChange("isPrivate")}
                  className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                />
                <span>Keep this blog private</span>
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
                  value={formState.passcode}
                  onChange={handleInputChange("passcode")}
                  placeholder="Enter a passcode"
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
                  Posting...
                </span>
              ) : (
                "Create Blog"
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default CreateBlog;