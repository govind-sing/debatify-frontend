import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import API from "../api/axiosInstance";
import { motion } from "framer-motion";

// const BACKEND_BASE_URL = "http://0.0.0.0:5001";
const BACKEND_BASE_URL = API.defaults.baseURL.replace("/api", "");

const mediaStyles = `
  video { width: 100%; max-height: 20rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
  @media (min-width: 640px) { video { max-height: 28rem; } }
  video::-webkit-media-controls { display: flex !important; justify-content: center; }
  video::-webkit-media-controls-play-button { display: block !important; }
  audio::-webkit-media-controls-timeline,
  audio::-webkit-media-controls-current-time-display,
  audio::-webkit-media-controls-time-remaining-display { display: none !important; }
  audio::-webkit-media-controls { justify-content: center !important; }
  audio { width: 100%; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
  img { width: 100%; max-height: 20rem; object-fit: cover; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
  @media (min-width: 640px) { img { max-height: 28rem; } }
`;

const BlogPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [error, setError] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState(null);

  const fetchBlog = useCallback(
    async (enteredPasscodeParam = null) => {
      try {
        setLoading(true);
        setError(null);
        const passcodeToUse = enteredPasscodeParam || enteredPasscode;
        const url = passcodeToUse
          ? `/blogs/${id}?passcode=${encodeURIComponent(passcodeToUse)}`
          : `/blogs/${id}`;
        const { data } = await API.get(url);
        setBlog(data);
        if (enteredPasscodeParam) setEnteredPasscode(enteredPasscodeParam);
        setPasscodeRequired(false);
      } catch (error) {
        console.error("Error fetching blog:", error);
        if (error.response?.status === 401) {
          setPasscodeRequired(true);
          if (enteredPasscodeParam) setError("Incorrect passcode. Please try again.");
        } else {
          setError(error.response?.data?.message || "Failed to load blog.");
        }
      } finally {
        setLoading(false);
      }
    },
    [id, enteredPasscode]
  );

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const pollBlog = useCallback(async () => {
    try {
      const url = enteredPasscode
        ? `/blogs/${id}?passcode=${encodeURIComponent(enteredPasscode)}&poll=true`
        : `/blogs/${id}&poll=true`;
      const { data } = await API.get(url);
      const newBlog = data;

      setBlog((prevBlog) => {
        if (!prevBlog) return newBlog;
        if (
          prevBlog.upvotes !== newBlog.upvotes ||
          prevBlog.downvotes !== newBlog.downvotes ||
          prevBlog.views !== newBlog.views ||
          prevBlog.bookmarkCount !== newBlog.bookmarkCount ||
          prevBlog.isBookmarked !== newBlog.isBookmarked ||
          JSON.stringify(prevBlog.upvotedBy) !== JSON.stringify(newBlog.upvotedBy) ||
          JSON.stringify(prevBlog.downvotedBy) !== JSON.stringify(newBlog.downvotedBy)
        ) {
          return {
            ...prevBlog,
            upvotes: newBlog.upvotes || 0,
            downvotes: newBlog.downvotes || 0,
            views: newBlog.views || 0,
            bookmarkCount: newBlog.bookmarkCount || 0,
            isBookmarked: newBlog.isBookmarked,
            upvotedBy: newBlog.upvotedBy || prevBlog.upvotedBy,
            downvotedBy: newBlog.downvotedBy || prevBlog.downvotedBy,
          };
        }
        return prevBlog;
      });
    } catch (error) {
      console.error("Error polling blog:", error);
    }
  }, [id, enteredPasscode]);

  useEffect(() => {
    const intervalId = setInterval(pollBlog, 5000);
    return () => clearInterval(intervalId);
  }, [pollBlog]);

  const handleVote = useCallback(async (voteType) => {
    try {
      setVoting(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to vote.");
        return;
      }
      const endpoint = voteType === "upvote" ? `/blogs/${id}/upvote` : `/blogs/${id}/downvote`;
      const { data } = await API.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBlog((prevBlog) => ({
        ...prevBlog,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        upvotedBy: data.upvotedBy || prevBlog.upvotedBy,
        downvotedBy: data.downvotedBy || prevBlog.downvotedBy,
      }));
    } catch (error) {
      console.error("Error voting:", error);
      setError(error.response?.data?.message || "Failed to vote.");
    } finally {
      setVoting(false);
    }
  }, [id]);

  const handleBookmark = useCallback(async () => {
    try {
      setBookmarking(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to bookmark.");
        return;
      }
      const { data } = await API.post(`/blogs/${id}/bookmark`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBlog((prevBlog) => ({
        ...prevBlog,
        bookmarkCount: data.bookmarkCount || 0,
        isBookmarked: data.isBookmarked,
      }));
    } catch (error) {
      console.error("Error bookmarking:", error);
      setError(error.response?.data?.message || "Failed to bookmark.");
    } finally {
      setBookmarking(false);
    }
  }, [id]);

  const handlePasscodeSubmit = useCallback((e) => {
    e.preventDefault();
    if (!passcode.trim()) return setError("Please enter a passcode.");
    fetchBlog(passcode);
  }, [passcode, fetchBlog]);

  const getFileNameFromUrl = useCallback((url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
  }, []);

  const renderMedia = useCallback((fileUrl) => {
    if (!fileUrl) return null;
    const fullFileUrl = fileUrl.startsWith("http") ? fileUrl : `${BACKEND_BASE_URL}${fileUrl}`;
    if (fileUrl.match(/\.(jpeg|jpg|png)$/i)) {
      return <img src={fullFileUrl} alt="Blog media" />;
    } else if (fileUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video controls src={fullFileUrl} type={fileUrl.endsWith(".mp4") ? "video/mp4" : fileUrl.endsWith(".webm") ? "video/webm" : "video/ogg"}>
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) {
      return (
        <div>
          <p className="text-gray-700 font-medium mb-2 text-sm md:text-base">{getFileNameFromUrl(fullFileUrl)}</p>
          <audio controls controlsList="nodownload noremoteplayback">
            <source src={fullFileUrl} type={fileUrl.endsWith(".mp3") ? "audio/mpeg" : fileUrl.endsWith(".wav") ? "audio/wav" : "audio/ogg"} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (fileUrl.match(/\.pdf$/i)) {
      return (
        <a
          href={fullFileUrl}
          download={`blog_${id}.pdf`}
          className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm md:text-base"
        >
          <svg className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Download PDF
        </a>
      );
    }
    return null;
  }, [id, getFileNameFromUrl]);

  if (loading) return <p className="text-center mt-10 text-gray-600 text-base md:text-lg">Loading blog...</p>;

  if (passcodeRequired) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 md:p-5 md:ml-64">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">This is a Private Blog</h2>
        <form
          onSubmit={handlePasscodeSubmit}
          className="bg-white shadow-lg rounded-lg p-4 md:p-6 w-full max-w-md"
        >
          <label className="block mb-2 text-gray-700 text-sm md:text-base">Enter Passcode:</label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full p-2 md:p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
          >
            Submit
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-sm md:text-base">{error}</p>}
      </div>
    );
  }

  if (!blog) return <p className="text-center mt-10 text-red-500 text-base md:text-lg">Blog not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64">
      <style>{mediaStyles}</style>
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold leading-tight"
          >
            {blog.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2 text-xs md:text-base opacity-80"
          >
            By <Link to={`/profile/${blog.author?.username || 'unknown'}`} className="underline hover:text-yellow-300">{blog.author?.username || "Unknown"}</Link> | Published on{" "}
            <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown"}</span> | Views: <span>{blog.views || 0}</span>
          </motion.p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-100 text-red-700 rounded-lg text-center text-sm md:text-base">{error}</div>
          )}
          {blog.fileUrls && blog.fileUrls.length > 0 && (
            <div className="mt-4 md:mt-6 grid grid-cols-1 gap-4 md:gap-6">
              {blog.fileUrls.map((fileUrl, index) => (
                <div key={index}>{renderMedia(fileUrl)}</div>
              ))}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 md:mt-8 prose prose-sm md:prose-lg max-w-none"
          >
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{blog.content}</p>
          </motion.div>
          <div className="mt-8 md:mt-10 pt-4 md:pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
              <div className="text-gray-600 text-xs md:text-sm">
                <p>Posted on <span className="font-medium">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : "Unknown"}</span></p>
              </div>
              <div className="flex space-x-2 md:space-x-3">
                <motion.div
                  className={`flex items-center rounded-full bg-gray-100 shadow-sm text-sm md:text-base ${
                    voting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: voting ? 1 : 1.05 }}
                  whileTap={{ scale: voting ? 1 : 0.95 }}
                >
                  <button
                    onClick={() => handleVote("upvote")}
                    disabled={voting}
                    className="flex items-center px-2 py-1 md:px-3 md:py-2 text-gray-700 hover:text-green-600"
                  >
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <span className="px-1 md:px-2 text-gray-800 font-medium">
                    {(blog.upvotes || 0) - (blog.downvotes || 0)}
                  </span>
                  <button
                    onClick={() => handleVote("downvote")}
                    disabled={voting}
                    className="flex items-center px-2 py-1 md:px-3 md:py-2 text-gray-700 hover:text-red-600"
                  >
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </motion.div>
                <motion.div
                  className={`flex items-center rounded-full bg-gray-100 shadow-sm text-sm md:text-base ${
                    bookmarking ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                  } ${
                    blog.isBookmarked ? "bg-yellow-100 text-yellow-700" : "text-gray-700"
                  }`}
                  whileHover={{ scale: bookmarking ? 1 : 1.05 }}
                  whileTap={{ scale: bookmarking ? 1 : 0.95 }}
                >
                  <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className="flex items-center px-2 py-1 md:px-3 md:py-2"
                  >
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"
                      />
                    </svg>
                    <span>{blog.bookmarkCount || 0}</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 mb-8 md:mb-12 flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
        <Link
          to={`/profile/${location.state?.fromProfile || blog.author?.username || "unknown"}`}
          state={{ activeTab: location.state?.activeTab || "blogs" }}
          className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm text-sm md:text-base"
        >
          <svg className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Profile
        </Link>
        <Link
          to="/blog"
          className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm text-sm md:text-base"
        >
          <svg className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Blog Hub
        </Link>
      </div>
    </div>
  );
};

export default BlogPage;