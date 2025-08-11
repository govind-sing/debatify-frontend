import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { motion } from "framer-motion";

const DebatePage = () => {
  const { id } = useParams();
  const [debate, setDebate] = useState(null);
  const [comment, setComment] = useState("");
  const [stance, setStance] = useState("");
  const [userStanceLocked, setUserStanceLocked] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [passcode, setPasscode] = useState("");
  const [passcodeRequired, setPasscodeRequired] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState(null);
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

  const fetchDebate = useCallback(
    async (enteredPasscodeParam = null) => {
      try {
        setLoading(true);
        setError(null);
        const passcodeToUse = enteredPasscodeParam || enteredPasscode;
        const url = passcodeToUse
          ? `/debates/${id}?passcode=${encodeURIComponent(passcodeToUse)}`
          : `/debates/${id}`;
        const { data } = await API.get(url);
        setDebate(data);
        setComments(data.comments || []);
        if (userId) {
          const userComments = data.comments.filter((c) => c.user?._id === userId);
          if (userComments.length > 0) {
            setUserStanceLocked(userComments[0].stance);
          }
        }
        if (enteredPasscodeParam) setEnteredPasscode(enteredPasscodeParam);
        setPasscodeRequired(false);
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setPasscodeRequired(true);
          if (enteredPasscodeParam) setError("Incorrect passcode. Please try again.");
        } else {
          setError(err.response?.data?.message || "Failed to load debate.");
        }
      } finally {
        setLoading(false);
      }
    },
    [id, enteredPasscode, userId]
  );

  useEffect(() => {
    fetchDebate();
  }, [fetchDebate]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const url = enteredPasscode
          ? `/debates/${id}?passcode=${encodeURIComponent(enteredPasscode)}&poll=true`
          : `/debates/${id}?poll=true`;
        const { data } = await API.get(url);
        const newDebate = data;

        setDebate((prev) => {
          if (
            prev.upvotes !== newDebate.upvotes ||
            prev.downvotes !== newDebate.downvotes ||
            prev.views !== newDebate.views ||
            prev.bookmarkCount !== newDebate.bookmarkCount ||
            JSON.stringify(prev.upvotedBy) !== JSON.stringify(newDebate.upvotedBy) ||
            JSON.stringify(prev.downvotedBy) !== JSON.stringify(newDebate.downvotedBy)
          ) {
            return {
              ...prev,
              upvotes: newDebate.upvotes || 0,
              downvotes: newDebate.downvotes || 0,
              views: newDebate.views || 0,
              bookmarkCount: newDebate.bookmarkCount || 0,
              upvotedBy: newDebate.upvotedBy || prev.upvotedBy,
              downvotedBy: newDebate.downvotedBy || prev.downvotedBy,
              isBookmarked: newDebate.isBookmarked,
            };
          }
          return prev;
        });

        const newComments = newDebate.comments || [];
        const existingCommentIds = new Set(comments.map((c) => c._id));
        const commentsToAdd = newComments.filter((c) => !existingCommentIds.has(c._id));
        if (commentsToAdd.length > 0) {
          setComments((prevComments) => [...prevComments, ...commentsToAdd]);
        }

        setComments((prevComments) =>
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
        console.error("Error polling debate:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, comments, enteredPasscode]);

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) return setError("Please enter a passcode.");
    fetchDebate(passcode);
  };

  const handleVote = async (voteType) => {
    try {
      setVoting(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to vote.");
        return;
      }
      const endpoint = voteType === "upvote" ? `/debates/${id}/upvote` : `/debates/${id}/downvote`;
      const { data } = await API.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      setDebate((prevDebate) => ({
        ...prevDebate,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        upvotedBy: data.upvotedBy || prevDebate.upvotedBy,
        downvotedBy: data.downvotedBy || prevDebate.downvotedBy,
      }));
    } catch (error) {
      console.error("Error voting:", error);
      setError(error.response?.data?.message || "Failed to vote.");
    } finally {
      setVoting(false);
    }
  };

  const handleBookmark = async () => {
    try {
      setBookmarking(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to bookmark.");
        return;
      }
      const { data } = await API.post(`/debates/${id}/bookmark`, {}, { headers: { Authorization: `Bearer ${token}` } });

      setDebate((prevDebate) => ({
        ...prevDebate,
        bookmarkCount: data.bookmarkCount,
        isBookmarked: data.isBookmarked,
      }));
    } catch (error) {
      console.error("Error bookmarking:", error);
      setError(error.response?.data?.message || "Failed to bookmark.");
    } finally {
      setBookmarking(false);
    }
  };

  const handleComment = async () => {
    try {
      setCommenting(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to comment.");
        return;
      }
      if (!comment.trim()) {
        setError("Comment cannot be empty.");
        return;
      }
      if (!stance && !userStanceLocked) {
        setError("Please select your stance.");
        return;
      }

      const finalStance = userStanceLocked || stance;
      const { data } = await API.post(
        `/debates/${id}/comment`,
        { text: comment, stance: finalStance },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = data.comments[data.comments.length - 1];
      setComments((prevComments) => [...prevComments, newComment]);
      setComment("");
      if (!userStanceLocked) setUserStanceLocked(finalStance);
    } catch (error) {
      console.error("Error commenting:", error);
      setError(error.response?.data?.message || "Failed to comment.");
    } finally {
      setCommenting(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to like a comment.");
        return;
      }
      const { data } = await API.post(
        `/debates/${id}/comment/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prevComments) =>
        prevComments.map((c) =>
          c._id === commentId ? { ...c, likes: data.likes, likedBy: data.likedBy } : c
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
      setError(error.response?.data?.message || "Failed to like comment.");
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "mostLiked") {
      return (b.likes || 0) - (a.likes || 0);
    } else if (sortBy === "earliest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading)
    return <p className="text-center mt-5 md:mt-10 text-gray-600 text-base md:text-lg">Loading debate...</p>;

  if (passcodeRequired) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-teal-50 to-blue-50 p-4 md:p-5 md:ml-64">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">This is a Private Debate</h2>
        <form
          onSubmit={handlePasscodeSubmit}
          className="bg-white shadow-lg rounded-lg p-4 md:p-6 w-full max-w-md"
        >
          <label className="block mb-2 text-gray-700 text-sm md:text-base">Enter Passcode:</label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full p-2 md:p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm md:text-base"
            required
          />
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
          >
            Submit
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-sm md:text-base">{error}</p>}
      </div>
    );
  }

  if (!debate)
    return <p className="text-center mt-5 md:mt-10 text-red-500 text-base md:text-lg">Debate not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-50 to-blue-50 md:ml-64">
      <div className="p-4 md:p-5 max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-2 md:p-3 bg-red-100 text-red-700 rounded-md text-center text-sm md:text-base">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-4 md:p-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">{debate.title}</h2>
            <p className="text-gray-600 mb-4 text-sm md:text-base">{debate.openingArgument}</p>
            <p className="text-xs md:text-sm text-teal-600 mb-4">
              Category: <span className="font-semibold">{debate.category}</span> | By:{" "}
              <Link
                to={`/profile/${debate.author?.username || "unknown"}`}
                className="font-semibold hover:underline"
              >
                {debate.author?.username || "Unknown"}
              </Link>{" "}
              | Created:{" "}
              <span className="font-semibold">
                {debate.createdAt ? new Date(debate.createdAt).toLocaleString() : "Unknown"}
              </span>{" "}
              | Views: <span className="font-semibold">{debate.viewsFormatted || debate.views || 0}</span>
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
                  {(debate.upvotes || 0) - (debate.downvotes || 0)}
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
                  bookmarking ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
                } ${
                  debate.isBookmarked ? "bg-yellow-100 text-yellow-700" : "text-gray-700"
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
                  <span>{debate.bookmarkCount || 0}</span>
                </button>
              </motion.div>
            </div>

            {!userStanceLocked && (
              <div className="mb-4">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                  Your Stance:
                </label>
                <div className="flex space-x-2 md:space-x-4">
                  <button
                    onClick={() => setStance("with")}
                    className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                      stance === "with" ? "bg-green-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    With
                  </button>
                  <button
                    onClick={() => setStance("against")}
                    className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${
                      stance === "against" ? "bg-red-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    Against
                  </button>
                </div>
              </div>
            )}
            {userStanceLocked && (
              <p className="text-xs md:text-sm text-gray-600 mb-4">
                Your stance is locked as: <span className="font-semibold">{userStanceLocked}</span>
              </p>
            )}

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 md:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2 text-sm md:text-base"
              placeholder="Write a comment..."
              rows="3"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComment}
              disabled={commenting}
              className={`w-full flex items-center justify-center px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-md transition-colors duration-200 text-sm md:text-base ${
                commenting ? "bg-teal-300 cursor-not-allowed" : "bg-teal-500 hover:bg-teal-600"
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

        <div className="mt-4 md:mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Comments</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 md:px-3 md:py-1 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm md:text-base"
            >
              <option value="latest">Latest</option>
              <option value="mostLiked">Popular</option>
              <option value="earliest">Earliest</option>
            </select>
          </div>

          <div className="max-h-[50vh] md:max-h-[calc(100vh-400px)] overflow-y-auto border rounded-lg p-3 md:p-4 bg-white shadow-md">
            {sortedComments.length > 0 ? (
              sortedComments.map((c, index) => (
                <motion.div
                  key={c._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-b py-2 md:py-3 ${c.stance === "with" ? "bg-green-50" : "bg-red-50"}`}
                >
                  <p className="text-gray-700 text-sm md:text-base">{c.text}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs md:text-sm text-gray-500">
                      By:{" "}
                      <Link
                        to={`/profile/${c.user?.username || "unknown"}`}
                        className="hover:underline"
                      >
                        {c.user?.username || "Unknown"}
                      </Link>{" "}
                      | {new Date(c.createdAt).toLocaleString()} | Stance: {c.stance}
                    </p>
                    {/* Comment Like Button */}
                    <motion.div
                      className={`flex items-center rounded-full bg-gray-100 shadow-sm text-sm md:text-base ${
                        userId && c.likedBy?.includes(userId)
                          ? "bg-orange-100 text-orange-700"
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

        <div className="text-center mt-6 md:mt-8">
          <Link to="/debate" className="text-teal-600 hover:underline font-semibold text-sm md:text-base">
            ← Back to Debate Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DebatePage;