import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axiosInstance";
import { PencilIcon, ArrowLeftIcon, ArrowRightIcon, SearchIcon, LockClosedIcon } from "@heroicons/react/outline";

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const dropdownRef = useRef(null);
  const blogsPerPage = 9;

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = viewMode === "following" ? "/blogs/following" : "/blogs";
      const { data } = await API.get(endpoint);
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("view") || "all";
    setViewMode(mode);
    setCurrentPage(0);
  }, [location.search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const endpoint = viewMode === "following" ? "/blogs/following" : "/blogs";
        const { data } = await API.get(endpoint);
        const newBlogs = Array.isArray(data) ? data : [];
        const existingBlogIds = new Set(blogs.map((d) => d._id));
        const blogsToAdd = newBlogs.filter((d) => !existingBlogIds.has(d._id));
        if (blogsToAdd.length > 0) {
          setBlogs((prevBlogs) => [...prevBlogs, ...blogsToAdd]);
        }
      } catch (error) {
        console.error("Error polling blogs:", error);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [blogs, viewMode]);

  const filterBlogs = useCallback(() => {
    if (searchQuery.trim() === "") {
      setFilteredBlogs(blogs);
      setIsDropdownOpen(false);
      setCurrentPage(0);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const results = blogs.filter((blog) => {
      const title = blog.title || "";
      const content = blog.content || "";
      const username = blog.author?.username || "";
      return (
        title.toLowerCase().includes(lowerQuery) ||
        content.toLowerCase().includes(lowerQuery) ||
        username.toLowerCase().includes(lowerQuery)
      );
    });

    setFilteredBlogs(results);
    setIsDropdownOpen(results.length > 0);
    setCurrentPage(0);
  }, [searchQuery, blogs]);

  useEffect(() => {
    filterBlogs();
  }, [filterBlogs]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "popularity") {
      const popularityA = (a.upvotes || 0) + (a.downvotes || 0);
      const popularityB = (b.upvotes || 0) + (b.downvotes || 0);
      return popularityB - popularityA;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedBlogs.length / blogsPerPage);
  const paginatedBlogs = sortedBlogs.slice(currentPage * blogsPerPage, (currentPage + 1) * blogsPerPage);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  }, [currentPage, totalPages]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (filteredBlogs.length > 0) {
      navigate(`/blogs/${filteredBlogs[0]._id}`);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  }, [filteredBlogs, navigate]);

  const handleFollowingClick = () => {
    navigate("?view=following");
  };

  const handleAllClick = () => {
    navigate("/blog");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-green-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 px-4 md:py-16 md:px-5 text-center shadow-lg relative md:ml-64"
      >
        <div className="absolute top-4 right-4 md:right-5" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs..."
                className="px-3 py-2 md:px-4 md:py-2 pr-10 w-52 md:w-64 bg-white/20 backdrop-blur-md text-white placeholder-gray-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm md:text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-300 hover:text-yellow-200"
              >
                <SearchIcon className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </motion.div>
          </form>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-12 right-0 w-52 md:w-64 bg-white rounded-xl shadow-lg max-h-80 overflow-y-auto z-40"
            >
              {filteredBlogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blogs/${blog._id}`}
                  onClick={() => {
                    setSearchQuery("");
                    setIsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 md:py-3 border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-green-500/20"
                >
                  <h3 className="text-gray-800 font-semibold text-sm md:text-base">
                    {blog.title || "Untitled Blog"}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm truncate">
                    {blog.content ? `${blog.content.substring(0, 30)}...` : "No content"}
                  </p>
                  <div className="text-xs md:text-sm mt-1 text-gray-500">
                    By: {blog.author?.username || "Unknown"}{" "}
                    {blog.isPrivate && <LockClosedIcon className="h-3 w-3 md:h-4 md:w-4 inline text-red-500" />}
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <PencilIcon className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-yellow-300" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-yellow-300">Blog</span> Hub
        </h1>
        <p className="text-base md:text-xl max-w-xl mx-auto opacity-90">
          Share your thoughts, inspire others, and explore a world of ideas.
        </p>
        <div className="mt-4 md:mt-6 space-x-4">
          <Link
            to="/createblog"
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-yellow-400 text-blue-900 font-semibold rounded-full shadow-lg hover:bg-yellow-500 text-sm md:text-base"
          >
            Write a New Blog
          </Link>
          <button
            onClick={handleFollowingClick}
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-blue-500 text-white font-semibold rounded-full shadow-lg hover:bg-blue-600 text-sm md:text-base"
          >
            Following
          </button>
          <button
            onClick={handleAllClick}
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 text-sm md:text-base"
          >
            All
          </button>
        </div>
      </motion.div>
      <div className="p-4 md:p-10 max-w-6xl mx-auto md:ml-64">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8 text-center"
        >
          {viewMode === "following" ? "Blogs from Following" : "Latest Blogs"}
        </motion.h2>
        <div className="flex flex-col md:flex-row md:flex-wrap justify-between items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div className="flex space-x-2 md:space-x-4">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                sortBy === "latest" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy("oldest")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                sortBy === "oldest" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setSortBy("popularity")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                sortBy === "popularity" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Popularity
            </button>
          </div>
          <div className="flex space-x-4 items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <span className="text-gray-700 text-sm md:text-base">Page {currentPage + 1} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block h-6 w-6 md:h-8 md:w-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-600 mt-2 text-sm md:text-base">Loading blogs...</p>
          </div>
        ) : sortedBlogs.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-500 text-base md:text-lg"
          >
            No blogs yet. Write one now!
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="relative group bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Blog card content without wrapping Link */}
                <div className="p-4 md:p-6 relative z-10">
                  <Link to={`/blogpage/${blog._id}`}>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-white">
                      {blog.title || "Untitled Blog"}
                    </h3>
                  </Link>
                  <p className="text-gray-600 group-hover:text-gray-200 mt-2 text-sm md:text-base">
                    {blog.content ? blog.content.substring(0, 80) + "..." : "No content available"}
                  </p>
                  {blog.fileUrl && (
                    <div className="mt-2">
                      {blog.fileUrl.endsWith(".pdf") ? (
                        <span className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300">
                          PDF Attached
                        </span>
                      ) : blog.fileUrl.match(/\.(mp4|webm|ogg)$/) ? (
                        <span className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300">
                          Video Attached
                        </span>
                      ) : blog.fileUrl.match(/\.(mp3|wav|ogg)$/) ? (
                        <span className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300">
                          Audio Attached
                        </span>
                      ) : (
                        <span className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300">
                          Image Attached
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300 font-medium">
                      Votes: {(blog.upvotes || 0) - (blog.downvotes || 0)}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300">
                      By:{" "}
                      <Link
                        to={`/profile/${blog.author?.username || "unknown"}`}
                        className="hover:underline"
                      >
                        {blog.author?.username || "Unknown"}
                      </Link>
                      {blog.isPrivate && <LockClosedIcon className="h-3 w-3 md:h-4 md:w-4 inline ml-1 text-red-500" />}
                    </span>
                  </div>
                </div>
                {/* Overlay for hover effect, linked to blog page */}
                <Link
                  to={`/blogpage/${blog._id}`}
                  className="absolute inset-0 bg-gradient-to-t from-blue-500/80 to-transparent opacity-0 group-hover:opacity-100"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Blog;