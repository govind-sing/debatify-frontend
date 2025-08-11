import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import API from "../api/axiosInstance";
import { motion } from "framer-motion";

const DiscussionPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [discussion, setDiscussion] = useState(null);
  const [originalComments, setOriginalComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [error, setError] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [userId, setUserId] = useState(null);

  // Extract userId from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && typeof token === "string" && token.split(".").length === 3) {
      try {
        const payload = atob(token.split(".")[1]);
        const parsedPayload = JSON.parse(payload);
        setUserId(parsedPayload?.userId || null);
      } catch (e) {
        console.error("Error decoding token:", e);
        setUserId(null);
      }
    }
  }, []);

  const fetchDiscussion = useCallback(
    async (enteredPasscodeParam = null) => {
      try {
        setLoading(true);
        setError(null);
        const passcodeToUse = enteredPasscodeParam || enteredPasscode;
        const url = passcodeToUse
          ? `/discussions/${id}?passcode=${encodeURIComponent(passcodeToUse)}`
          : `/discussions/${id}`;
        const { data } = await API.get(url);
        setDiscussion(data);
        setOriginalComments(data.comments || []);
        if (enteredPasscodeParam) setEnteredPasscode(enteredPasscodeParam);
        setPasscodeRequired(false);
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setPasscodeRequired(true);
          if (enteredPasscodeParam) setError("Incorrect passcode. Please try again.");
        } else {
          setError(err.response?.data?.message || "Failed to load discussion.");
        }
      } finally {
        setLoading(false);
      }
    },
    [id, enteredPasscode]
  );

  useEffect(() => {
    fetchDiscussion();
  }, [fetchDiscussion]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const url = enteredPasscode
          ? `/discussions/${id}?passcode=${encodeURIComponent(enteredPasscode)}&poll=true`
          : `/discussions/${id}&poll=true`;
        const { data } = await API.get(url);
        const newDiscussion = data;

        setDiscussion((prev) => {
          if (
            prev.upvotes !== newDiscussion.upvotes ||
            prev.downvotes !== newDiscussion.downvotes ||
            prev.bookmarkCount !== newDiscussion.bookmarkCount ||
            prev.isBookmarked !== newDiscussion.isBookmarked ||
            prev.views !== newDiscussion.views ||
            JSON.stringify(prev.upvotedBy) !== JSON.stringify(newDiscussion.upvotedBy) ||
            JSON.stringify(prev.downvotedBy) !== JSON.stringify(newDiscussion.downvotedBy)
          ) {
            return {
              ...prev,
              upvotes: newDiscussion.upvotes || 0,
              downvotes: newDiscussion.downvotes || 0,
              bookmarkCount: newDiscussion.bookmarkCount || 0,
              isBookmarked: newDiscussion.isBookmarked,
              views: newDiscussion.views || 0,
              upvotedBy: newDiscussion.upvotedBy || prev.upvotedBy,
              downvotedBy: newDiscussion.downvotedBy || prev.downvotedBy,
            };
          }
          return prev;
        });

        const newComments = newDiscussion.comments || [];
        const existingCommentIds = new Set(originalComments.map((c) => c._id));
        const commentsToAdd = newComments.filter((c) => !existingCommentIds.has(c._id));
        if (commentsToAdd.length > 0) {
          setOriginalComments((prevComments) => [...prevComments, ...commentsToAdd]);
        }

        setOriginalComments((prevComments) =>
          prevComments.map((prevComment) => {
            const updatedComment = newComments.find((c) => c._id === prevComment._id);
            if (
              updatedComment &&
              (prevComment.likes !== updatedComment.likes ||
                JSON.stringify(prevComment.likedBy) !== JSON.stringify(updatedComment.likedBy))
            ) {
              return { ...prevComment, likes: updatedComment.likes, likedBy: updatedComment.likedBy };
            }
            return prevComment;
          })
        );
      } catch (error) {
        console.error("Error polling discussion:", error);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [id, originalComments, enteredPasscode]);

  const sortedComments = useMemo(() => {
    const commentsCopy = [...originalComments];
    if (sortBy === "mostLiked") {
      return commentsCopy.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === "earliest") {
      return commentsCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return commentsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sortBy, originalComments]);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) return setError("Please enter a passcode.");
    fetchDiscussion(passcode);
  };

  const handleVote = async (voteType) => {
    try {
      setVoting(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) return setError("You must be logged in to vote.");

      const endpoint = voteType === "upvote" ? `/discussions/${id}/upvote` : `/discussions/${id}/downvote`;
      const { data } = await API.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      setDiscussion((prev) => ({
        ...prev,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        upvotedBy: data.upvotedBy || prev.upvotedBy,
        downvotedBy: data.downvotedBy || prev.downvotedBy,
      }));
    } catch (err) {
      console.error("Voting error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to vote.");
    } finally {
      setVoting(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setIsBookmarking(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to bookmark.");
        return;
      }
      const { data } = await API.post(`/discussions/${id}/bookmark`, {}, { headers: { Authorization: `Bearer ${token}` } });

      setDiscussion((prev) => ({
        ...prev,
        bookmarkCount: data.bookmarkCount,
        isBookmarked: data.isBookmarked,
      }));
    } catch (err) {
      console.error("Bookmarking error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to bookmark.");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleComment = async () => {
    try {
      setCommenting(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) return setError("You must be logged in to comment.");
      if (!comment.trim()) return setError("Comment cannot be empty.");

      const { data } = await API.post(
        `/discussions/${id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = data.comments[data.comments.length - 1];
      setOriginalComments((prevComments) => [...prevComments, newComment]);
      setComment("");
    } catch (err) {
      console.error("Commenting error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to comment.");
    } finally {
      setCommenting(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) return setError("You must be logged in to like a comment.");

      const { data } = await API.post(
        `/discussions/${id}/comment/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOriginalComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, likes: data.likes, likedBy: data.likedBy } : c))
      );
    } catch (err) {
      console.error("Liking comment error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to like comment.");
    }
  };

  if (loading)
    return <p className="text-center mt-5 md:mt-10 text-gray-600 text-base md:text-lg">Loading discussion...</p>;
  if (!discussion && !passcodeRequired)
    return <p className="text-center mt-5 md:mt-10 text-red-500 text-base md:text-lg">Discussion not found.</p>;

  if (passcodeRequired) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-5 md:ml-64">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">This is a Private Discussion</h2>
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-5 md:ml-64">
      {error && (
        <div className="mb-4 p-2 md:p-3 bg-red-100 text-red-700 rounded-md text-center text-sm md:text-base">
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">{discussion.title}</h2>
          <p className="text-gray-600 mb-4 text-sm md:text-base">{discussion.description}</p>
          <p className="text-xs md:text-sm text-blue-600 mb-4">
            Category: <span className="font-semibold">{discussion.category}</span> | By:{" "}
            <Link
              to={`/profile/${discussion.author?.username || "unknown"}`}
              className="font-semibold hover:underline"
            >
              {discussion.author?.username || "Unknown"}
            </Link>{" "}
            | Created:{" "}
            <span className="font-semibold">
              {discussion.createdAt ? new Date(discussion.createdAt).toLocaleString() : "Unknown"}
            </span>{" "}
            | Views: <span className="font-semibold">{discussion.views || 0}</span>
          </p>

          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 md:mb-6 space-y-2 sm:space-y-0">
            {/* Upvote/Downvote Button */}
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
                {(discussion.upvotes || 0) - (discussion.downvotes || 0)}
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

            {/* Bookmark Button */}
            <motion.div
              className={`flex items-center rounded-full bg-gray-100 shadow-sm text-sm md:text-base ${
                isBookmarking ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
              } ${
                discussion.isBookmarked ? "bg-yellow-100 text-yellow-700" : "text-gray-700"
              }`}
              whileHover={{ scale: isBookmarking ? 1 : 1.05 }}
              whileTap={{ scale: isBookmarking ? 1 : 0.95 }}
            >
              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
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
                <span>{discussion.bookmarkCount || 0}</span>
              </button>
            </motion.div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 md:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-sm md:text-base"
            placeholder="Write a comment..."
            rows="3"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComment}
            disabled={commenting}
            className={`w-full flex items-center justify-center px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-md transition-colors duration-200 text-sm md:text-base ${
              commenting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {commenting ? "Posting..." : "Post Comment"}
          </motion.button>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto mt-4 md:mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">Comments</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 md:px-3 md:py-1 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          >
            <option value="latest">Latest</option>
            <option value="mostLiked">Popular</option>
            <option value="earliest">Earliest</option>
          </select>
        </div>

        <div className="max-h-[50vh] md:max-h-[calc(100vh-24rem)] overflow-y-auto border rounded-lg p-3 md:p-4 bg-white shadow-md">
          {sortedComments.length > 0 ? (
            sortedComments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border-b py-2 md:py-3"
              >
                <p className="text-gray-700 text-sm md:text-base">{c.text}</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1">
                  <p className="text-xs md:text-sm text-gray-500">
                    By:{" "}
                    <Link
                      to={`/profile/${c.user?.username || "unknown"}`}
                      className="hover:underline"
                    >
                      {c.user?.username || "Unknown"}
                    </Link>{" "}
                    | {new Date(c.createdAt).toLocaleString()}
                  </p>
                  {/* Comment Like Button */}
                  <motion.div
                    className={`flex items-center rounded-full bg-gray-100 shadow-sm text-sm md:text-base ${
                      userId && c.likedBy?.includes(userId)
                        ? "bg-pink-100 text-pink-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: userId ? 1.05 : 1 }}
                    whileTap={{ scale: userId ? 0.95 : 1 }}
                  >
                    <button
                      onClick={() => handleCommentLike(c._id)}
                      disabled={!userId}
                      className="flex items-center px-2 py-1 md:px-3 md:py-2"
                    >
                      <svg
                        className="h-3 w-3 md:h-4 md:w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{c.likes || 0}</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 text-center text-sm md:text-base">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center mt-6 md:mt-8 space-x-4">
        <Link
          to={`/profile/${location.state?.fromProfile || discussion.author?.username || "unknown"}`}
          state={{ activeTab: location.state?.activeTab || "discussion" }}
          className="text-blue-600 hover:underline font-semibold text-sm md:text-base"
        >
          ← Back to Profile
        </Link>
        <Link to="/" className="text-blue-600 hover:underline font-semibold text-sm md:text-base">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default DiscussionPage;