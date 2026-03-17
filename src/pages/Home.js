import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axiosInstance";
import { LockClosedIcon, SparklesIcon } from "@heroicons/react/solid";

// Typewriter Effect Component for Tagline
const TypewriterText = ({ texts }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const text = texts[currentIndex];
      if (!isDeleting && charIndex < text.length) {
        setCurrentText(text.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setCurrentText(text.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === text.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setCurrentIndex((currentIndex + 1) % texts.length);
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentIndex, texts]);

  return (
    <span className="text-yellow-300 font-semibold">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Discussion Card Component
const DiscussionCard = ({ discussion }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-50"
  >
    <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
    <div className="p-5">
      <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
        💬 Discussion
      </span>
      <Link to={`/discussionpage/${discussion._id}?section=discussion`}>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
          {discussion.title || "Untitled Discussion"}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
          {discussion.description ? discussion.description.substring(0, 80) + "..." : "No description"}
        </p>
      </Link>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          By{" "}
          <Link
            to={`/profile/${discussion.author?.username || "unknown"}`}
            className="font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            {discussion.author?.username || "Unknown"}
          </Link>
          {discussion.isPrivate && <LockClosedIcon className="h-3 w-3 inline ml-1 text-red-400" />}
        </p>
        <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
          {discussion.category || "General"}
        </span>
      </div>
    </div>
  </motion.div>
);

// Debate Card Component
const DebateCard = ({ debate }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-50"
  >
    <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600" />
    <div className="p-5">
      <span className="inline-block bg-purple-50 text-purple-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
        ⚔️ Debate
      </span>
      <Link to={`/debatepage/${debate._id}?section=debate`}>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2 mb-2">
          {debate.title || "Untitled Debate"}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
          {debate.openingArgument ? debate.openingArgument.substring(0, 80) + "..." : "No argument"}
        </p>
      </Link>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          By{" "}
          <Link
            to={`/profile/${debate.author?.username || "unknown"}`}
            className="font-semibold text-gray-600 hover:text-purple-600 transition-colors"
          >
            {debate.author?.username || "Unknown"}
          </Link>
          {debate.isPrivate && <LockClosedIcon className="h-3 w-3 inline ml-1 text-red-400" />}
        </p>
        <span className="text-xs font-medium text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
          {debate.category || "General"}
        </span>
      </div>
    </div>
  </motion.div>
);

// Blog Card Component
const BlogCard = ({ blog }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-pink-50"
  >
    <div className="h-1 w-full bg-gradient-to-r from-pink-400 to-pink-600" />
    <div className="p-5">
      <span className="inline-block bg-pink-50 text-pink-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-3">
        ✍️ Blog
      </span>
      <Link to={`/blogpage/${blog._id}?section=blog`}>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-200 line-clamp-2 mb-2">
          {blog.title || "Untitled Blog"}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
          {blog.content ? blog.content.substring(0, 80) + "..." : "No content available"}
        </p>
        {blog.fileUrl && (
          <p className="mt-2 text-xs text-pink-500 font-medium">
            📎{" "}
            {blog.fileUrl.endsWith(".pdf")
              ? "PDF Attached"
              : blog.fileUrl.match(/\.(mp4|webm|ogg)$/)
              ? "Video Attached"
              : blog.fileUrl.match(/\.(mp3|wav|ogg)$/)
              ? "Audio Attached"
              : "Image Attached"}
          </p>
        )}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs text-pink-500 font-medium">
            Votes: {(blog.upvotes || 0) - (blog.downvotes || 0)}
          </span>
        </div>
      </Link>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          By{" "}
          <Link
            to={`/profile/${blog.author?.username || "unknown"}`}
            className="font-semibold text-gray-600 hover:text-pink-600 transition-colors"
          >
            {blog.author?.username || "Unknown"}
          </Link>
          {blog.isPrivate && <LockClosedIcon className="h-3 w-3 inline ml-1 text-red-400" />}
        </p>
      </div>
    </div>
  </motion.div>
);

// See More Card
const SeeMoreCard = ({ section }) => {
  const gradients = {
    discussion: "from-blue-500 to-blue-700",
    debate: "from-purple-500 to-purple-700",
    blog: "from-pink-500 to-pink-700",
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <Link
        to={`/${section}`}
        className={`flex flex-col items-center justify-center h-full min-h-[160px] bg-gradient-to-br ${gradients[section]} text-white p-6 text-center`}
      >
        <span className="text-3xl mb-3">→</span>
        <h3 className="text-base font-bold">
          See All {section.charAt(0).toUpperCase() + section.slice(1)}s
        </h3>
        <p className="text-xs opacity-75 mt-1">Explore more content</p>
      </Link>
    </motion.div>
  );
};

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ FIX 1: Declare state BEFORE any useEffect that references it.
  // Read the section param once for the initial value — no effect needed.
  const initialSection = new URLSearchParams(location.search).get("section");
  const validSections = ["discussion", "debate", "blog"];
  const [activeSection, setActiveSection] = useState(
    validSections.includes(initialSection) ? initialSection : "discussion"
  );

  const [discussion, setDiscussions] = useState([]);
  const [debate, setDebates] = useState([]);
  const [blog, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIX 2: Sync URL → state ONLY when the URL search string actually changes.
  // Do NOT call navigate() here — that would change location.search and re-trigger
  // this effect, creating an infinite loop.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (validSections.includes(section)) {
      setActiveSection((prev) => (prev !== section ? section : prev)); // avoid redundant state update
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ FIX 3: Fetch runs exactly once on mount. Empty dependency array is correct
  // here because we never want to re-fetch just because location or activeSection changed.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [disRes, debRes, blogRes] = await Promise.all([
          API.get("/discussions", { headers }),
          API.get("/debates", { headers }),
          API.get("/blogs", { headers }),
        ]);
        setDiscussions(Array.isArray(disRes.data) ? disRes.data : []);
        setDebates(Array.isArray(debRes.data) ? debRes.data : []);
        setBlogs(Array.isArray(blogRes.data) ? blogRes.data : []);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // ✅ empty array = runs once on mount only

  const sortByPopularity = useCallback((items) => {
    return [...items].sort((a, b) => {
      const popA = (a.comments?.length || 0) + (a.upvotes?.length || 0) + (a.downvotes?.length || 0);
      const popB = (b.comments?.length || 0) + (b.upvotes?.length || 0) + (b.downvotes?.length || 0);
      return popB - popA;
    });
  }, []);

  const renderSectionCards = (items, renderCard, section) => {
    const sorted = sortByPopularity(items);
    const cards = sorted.slice(0, 8).map((item, index) => (
      <motion.div
        key={item._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {renderCard(item)}
      </motion.div>
    ));
    cards.push(
      <motion.div
        key="see-more"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <SeeMoreCard section={section} />
      </motion.div>
    );
    return cards;
  };

  const sectionMeta = {
    discussion: { color: "from-blue-500 to-blue-600", label: "Discussion" },
    debate: { color: "from-purple-500 to-purple-600", label: "Debate" },
    blog: { color: "from-pink-500 to-pink-600", label: "Blog" },
  };

  // ✅ FIX 4: navigate() is called only from explicit user interaction (button click),
  // never from inside a useEffect. This is the only correct place to call it.
  const handleSectionChange = (sec) => {
    setActiveSection(sec);
    navigate(`/?section=${sec}`, { replace: true });
  };

  const renderSectionToggle = () => (
    <div className="flex gap-2 mb-8 justify-center w-full bg-white rounded-2xl shadow-md p-2 max-w-sm mx-auto">
      {["discussion", "debate", "blog"].map((sec) => (
        <motion.button
          key={sec}
          onClick={() => handleSectionChange(sec)}
          whileTap={{ scale: 0.97 }}
          className={`flex-1 px-3 py-2 rounded-xl transition-all duration-300 text-sm font-semibold ${
            activeSection === sec
              ? `bg-gradient-to-r ${sectionMeta[sec].color} text-white shadow-md`
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          {sectionMeta[sec].label}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 md:ml-64">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12 md:py-20 px-4 md:px-8 text-center shadow-xl overflow-hidden mb-8 md:mb-12"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block relative z-10"
        >
          <SparklesIcon className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-5 text-yellow-300 drop-shadow-lg" />
        </motion.div>

        <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-white">Welcome to </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">
            Debatify!
          </span>
        </h1>

        <p className="relative z-10 text-base md:text-lg max-w-2xl mx-auto opacity-90 leading-relaxed mb-4">
          Join the conversation, share your opinions, and engage in meaningful{" "}
          <span className="font-semibold">Discussions · Debates · Blogs</span> on topics that matter to you.
        </p>

        <p className="relative z-10 text-lg md:text-xl font-medium">
          Discover <TypewriterText texts={["Discussions", "Debates", "Blogs"]} /> that Inspire!
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 md:px-8 pb-12 max-w-6xl mx-auto">
        {renderSectionToggle()}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center text-sm shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-500 text-sm font-medium">Loading amazing content...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {activeSection === "discussion" &&
              renderSectionCards(discussion, (d) => <DiscussionCard key={d._id} discussion={d} />, "discussion")}
            {activeSection === "debate" &&
              renderSectionCards(debate, (d) => <DebateCard key={d._id} debate={d} />, "debate")}
            {activeSection === "blog" &&
              renderSectionCards(blog, (b) => <BlogCard key={b._id} blog={b} />, "blog")}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;