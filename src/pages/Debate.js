import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axiosInstance";
import { FireIcon, ArrowLeftIcon, ArrowRightIcon, SearchIcon, LockClosedIcon } from "@heroicons/react/outline";

const Debate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debates, setDebates] = useState([]);
  const [filteredDebates, setFilteredDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState("all");
  const dropdownRef = useRef(null);
  const debatesPerPage = 9;

  const fetchDebates = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = viewMode === "following" ? "/debates/following" : "/debates";
      const { data } = await API.get(endpoint);
      setDebates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching debates:", error);
      setDebates([]);
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
    fetchDebates();
  }, [fetchDebates]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const endpoint = viewMode === "following" ? "/debates/following" : "/debates";
        const { data } = await API.get(endpoint);
        const newDebates = Array.isArray(data) ? data : [];
        const existingDebateIds = new Set(debates.map((d) => d._id));
        const debatesToAdd = newDebates.filter((d) => !existingDebateIds.has(d._id));

        if (debatesToAdd.length > 0) {
          setDebates((prevDebates) => [...prevDebates, ...debatesToAdd]);
        }
      } catch (error) {
        console.error("Error polling debates:", error);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [debates, viewMode]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDebates(debates);
      setIsDropdownOpen(false);
      setCurrentPage(0);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const results = debates.filter((debate) => {
      const title = debate.title || "";
      const openingArgument = debate.openingArgument || "";
      const category = debate.category || "";
      const username = debate.author?.username || "";
      return (
        title.toLowerCase().includes(lowerQuery) ||
        openingArgument.toLowerCase().includes(lowerQuery) ||
        category.toLowerCase().includes(lowerQuery) ||
        username.toLowerCase().includes(lowerQuery)
      );
    });

    setFilteredDebates(results);
    setIsDropdownOpen(results.length > 0);
    setCurrentPage(0);
  }, [searchQuery, debates]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedDebates = [...filteredDebates].sort((a, b) => {
    if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "popularity") {
      const popularityA = (a.comments?.length || 0) + (a.upvotes || 0) + (a.downvotes || 0);
      const popularityB = (b.comments?.length || 0) + (b.upvotes || 0) + (b.downvotes || 0);
      return popularityB - popularityA;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedDebates.length / debatesPerPage);
  const paginatedDebates = sortedDebates.slice(
    currentPage * debatesPerPage,
    (currentPage + 1) * debatesPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredDebates.length > 0) {
      navigate(`/debatepage/${filteredDebates[0]._id}`);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  };

  const handleFollowingClick = () => {
    navigate("?view=following");
  };

  const handleAllClick = () => {
    navigate("/debate");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 md:ml-64">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-12 px-4 md:py-16 md:px-5 text-center shadow-lg relative"
      >
        <div className="absolute top-4 right-4 md:right-5" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search debates..."
                className="px-3 py-2 md:px-4 md:py-2 pr-10 w-52 md:w-64 bg-white/20 backdrop-blur-md text-white placeholder-gray-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 text-sm md:text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-300 hover:text-orange-200"
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
              {filteredDebates.map((debate) => (
                <Link
                  key={debate._id}
                  to={`/debatepage/${debate._id}`}
                  onClick={() => {
                    setSearchQuery("");
                    setIsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 md:py-3 border-b border-gray-200 hover:bg-gradient-to-r hover:from-teal-500/20 hover:to-blue-500/20 transition-colors duration-200"
                >
                  <h3 className="text-gray-800 font-semibold text-sm md:text-base">
                    {debate.title || "Untitled Debate"}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm truncate">
                    {debate.openingArgument
                      ? `${debate.openingArgument.substring(0, 30)}...`
                      : "No argument"}
                  </p>
                  <div className="flex justify-between text-xs md:text-sm mt-1">
                    <span className="text-teal-500">{debate.category || "Uncategorized"}</span>
                    <span className="text-gray-500">
                      By: {debate.author?.username || "Unknown"}
                      {debate.isPrivate && (
                        <LockClosedIcon className="h-3 w-3 md:h-4 md:w-4 inline ml-1 text-red-500" />
                      )}
                    </span>
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
          <FireIcon className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-orange-300" />
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-orange-300">Debate</span> Hub
        </h1>
        <p className="text-base md:text-xl max-w-xl mx-auto opacity-90">
          Ignite your passion, challenge perspectives, and dive into thrilling debates.
        </p>
        <div className="mt-4 md:mt-6 space-x-4">
          <Link
            to="/CreateDebate"
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-orange-400 text-teal-900 font-semibold rounded-full shadow-lg hover:bg-orange-500 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
          >
            Start a New Debate
          </Link>
          <button
            onClick={handleFollowingClick}
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-blue-500 text-white font-semibold rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
          >
            Following
          </button>
          <button
            onClick={handleAllClick}
            className="inline-block px-6 py-2 md:px-8 md:py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
          >
            All
          </button>
        </div>
      </motion.div>
      <div className="p-4 md:p-10 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8 text-center"
        >
          {viewMode === "following" ? "Debates from Following" : "Active Debates"}
        </motion.h2>
        <div className="flex flex-col md:flex-row md:flex-wrap justify-between items-center mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div className="flex space-x-2 md:space-x-4">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                sortBy === "latest"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy("oldest")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                sortBy === "oldest"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setSortBy("popularity")}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                sortBy === "popularity"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Popularity
            </button>
          </div>
          <div className="flex space-x-4 items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <span className="text-gray-700 text-sm md:text-base">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="inline-block h-6 w-6 md:h-8 md:w-8 border-4 border-teal-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-600 mt-2 text-sm md:text-base">Loading debates...</p>
          </div>
        ) : sortedDebates.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-500 text-base md:text-lg"
          >
            No debates yet. Start one now!
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedDebates.map((debate, index) => (
              <motion.div
                key={debate._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="relative group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <Link to={`/debatepage/${debate._id}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="p-4 md:p-6 relative z-10">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
                      {debate.title || "Untitled Debate"}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-200 mt-2 text-sm md:text-base">
                      {debate.openingArgument
                        ? debate.openingArgument.substring(0, 80) + "..."
                        : "No opening argument"}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs md:text-sm text-teal-500 group-hover:text-orange-300 font-medium transition-colors duration-300">
                        {debate.category || "Uncategorized"}
                      </span>
                      <span className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300 transition-colors duration-300">
                        By: {debate.author?.username || "Unknown"}
                        {debate.isPrivate && (
                          <LockClosedIcon className="h-3 w-3 md:h-4 md:w-4 inline ml-1 text-red-500" />
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Debate;