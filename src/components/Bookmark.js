import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { motion } from "framer-motion";
import { BookmarkIcon } from "@heroicons/react/outline";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view bookmarks");
          return;
        }
        const { data } = await API.get("/bookmarks");
        setBookmarks(data);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleNavigate = useCallback((item) => {
    if (item.type === "blog") navigate(`/blogpage/${item._id}`);
    else if (item.type === "debate") navigate(`/debatepage/${item._id}`);
    else if (item.type === "discussion") navigate(`/discussionpage/${item._id}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-indigo-100 md:ml-64">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-12 md:py-16 px-4 md:px-5 text-center shadow-lg relative"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <BookmarkIcon className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-yellow-300" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Your <span className="text-yellow-300">Bookmarks</span>
        </h1>
        <p className="text-base md:text-xl max-w-xl mx-auto opacity-90">
          Revisit your favorite blogs, debates, and discussions anytime.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="p-4 md:p-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block h-6 w-6 md:h-8 md:w-8 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-600 mt-2 text-sm md:text-base">Loading bookmarks...</p>
          </div>
        ) : error ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-red-500 text-base md:text-lg"
          >
            {error}
          </motion.p>
        ) : bookmarks.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-500 text-base md:text-lg"
          >
            You haven't bookmarked any posts yet.
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {bookmarks.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="relative group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
                onClick={() => handleNavigate(item)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-6 relative z-10">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 group-hover:text-white transition-colors duration-300 mb-2">
                    {item.title || "Untitled"}
                  </h2>
                  <p className="text-gray-600 group-hover:text-gray-200 text-sm md:text-base mb-3">
                    {(item.description || item.openingArgument || item.content || "No preview available").substring(0, 80)}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-indigo-500 group-hover:text-yellow-300 font-medium transition-colors duration-300 capitalize">
                      {item.type}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300 transition-colors duration-300">
                      By: {item.author?.username || "Unknown"}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300 mt-2 transition-colors duration-300">
                    Views: {item.views || 0}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
