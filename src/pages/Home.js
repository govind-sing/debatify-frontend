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

  return <span className="text-yellow-300 font-semibold">{currentText}</span>;
};

// Discussion Card Component
const DiscussionCard = ({ discussion }) => (
  <motion.div
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    className="relative group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
  >
    <div className="p-4 md:p-6 relative z-10">
      <Link to={`/discussionpage/${discussion._id}?section=discussion`}>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
          {discussion.title || "Untitled Discussion"}
        </h3>
        <p className="text-gray-600 group-hover:text-gray-200 mt-2 text-sm md:text-base">
          {discussion.description ? discussion.description.substring(0, 80) + "..." : "No description"}
        </p>
        <p className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300 mt-3 font-medium transition-colors duration-300">
          {discussion.category || "Uncategorized"}
        </p>
      </Link>
      <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300 mt-1 transition-colors duration-300">
        By:{" "}
        <Link to={`/profile/${discussion.author?.username || "unknown"}`} className="hover:underline">
          {discussion.author?.username || "Unknown"}
        </Link>
        {discussion.isPrivate && <LockClosedIcon className="h-3 w-3 inline ml-1 text-red-500" />}
      </p>
    </div>
  </motion.div>
);

// Debate Card Component
const DebateCard = ({ debate }) => (
  <motion.div
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    className="relative group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
  >
    <div className="p-4 md:p-6 relative z-10">
      <Link to={`/debatepage/${debate._id}?section=debate`}>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
          {debate.title || "Untitled Debate"}
        </h3>
        <p className="text-gray-600 group-hover:text-gray-200 mt-2 text-sm md:text-base">
          {debate.openingArgument ? debate.openingArgument.substring(0, 80) + "..." : "No argument"}
        </p>
        <p className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300 mt-3 font-medium transition-colors duration-300">
          {debate.category || "Uncategorized"}
        </p>
      </Link>
      <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300 mt-1 transition-colors duration-300">
        By:{" "}
        <Link to={`/profile/${debate.author?.username || "unknown"}`} className="hover:underline">
          {debate.author?.username || "Unknown"}
        </Link>
        {debate.isPrivate && <LockClosedIcon className="h-3 w-3 inline ml-1 text-red-500" />}
      </p>
    </div>
  </motion.div>
);

// Blog Card Component
const BlogCard = ({ blog }) => (
  <motion.div
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    className="relative group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
  >
    <div className="p-4 md:p-6 relative z-10">
      <Link to={`/blogpage/${blog._id}?section=blog`}>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
          {blog.title || "Untitled Blog"}
        </h3>
        <p className="text-gray-600 group-hover:text-gray-200 mt-2 text-sm md:text-base">
          {blog.content ? blog.content.substring(0, 80) + "..." : "No content available"}
        </p>
        {blog.fileUrl && (
          <p className="mt-1 text-xs md:text-sm text-blue-500 group-hover:text-yellow-300 font-medium transition-colors duration-300">
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
          <span className="text-xs md:text-sm text-blue-500 group-hover:text-yellow-300 font-medium transition-colors duration-300">
            Votes: {(blog.upvotes || 0) - (blog.downvotes || 0)}
          </span>
        </div>
      </Link>
      <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-300 mt-1 transition-colors duration-300">
        By:{" "}
        <Link to={`/profile/${blog.author?.username || "unknown"}`} className="hover:underline">
          {blog.author?.username || "Unknown"}
        </Link>
        {blog.isPrivate && <LockClosedIcon className="h-3 w-3 inline ml-1 text-red-500" />}
      </p>
    </div>
  </motion.div>
);

// See More Card
const SeeMoreCard = ({ section }) => (
  <motion.div
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    className="relative group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
  >
    <Link to={`/${section}`} className="flex items-center justify-center h-full">
      <div className="p-4 md:p-6 text-center">
        <h3 className="text-lg md:text-xl font-semibold text-blue-600 group-hover:text-white transition-colors duration-300">
          See More {section.charAt(0).toUpperCase() + section.slice(1)}
        </h3>
      </div>
    </Link>
  </motion.div>
);

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setActiveSection(params.get("section") || "discussion");
  }, [location.search]);

  const [activeSection, setActiveSection] = useState("discussion");
  const [discussion, setDiscussions] = useState([]);
  const [debate, setDebates] = useState([]);
  const [blog, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

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

  const renderSectionToggle = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center w-full">
      {["discussion", "debate", "blog"].map((sec) => (
        <motion.button
          key={sec}
          onClick={() => {
            setActiveSection(sec);
            navigate(`/?section=${sec}`);
          }}
          whileHover={{ scale: 1.1, background: "linear-gradient(to right, #3B82F6, #8B5CF6)" }}
          transition={{ duration: 0.3 }}
          className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm md:text-base font-semibold text-white ${
            activeSection === sec
              ? "bg-gradient-to-r from-blue-600 to-purple-600"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {sec.charAt(0).toUpperCase() + sec.slice(1)}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 md:ml-64">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 md:px-8 lg:px-10 text-center shadow-lg relative mb-6 sm:mb-8 md:mb-10 lg:mb-12"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <SparklesIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-16 lg:w-16 mx-auto mb-4 text-yellow-300" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 font-sans">
          <span className="text-white">Welcome to </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">Debatify!</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto opacity-90 leading-relaxed font-sans">
          Join the conversation, share your opinions, and engage in meaningful 'Discussions...Debates...Blogs... on topics that matter to you.
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mt-3 sm:mt-4 font-sans">
          Discover <TypewriterText texts={["Discussions", "Debates", "Blogs"]} /> that Inspire!
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="p-4 md:p-8 pt-6 sm:pt-8 md:pt-10 max-w-6xl mx-auto">
        {renderSectionToggle()}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm md:text-base">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
            <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-base font-sans">Loading...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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