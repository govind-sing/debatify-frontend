// src/components/Navbar.js
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ChatAlt2Icon,
  PencilIcon,
  UserIcon,
  SearchIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  BookmarkIcon,
  ChatIcon
} from "@heroicons/react/outline";
import API from "../api/axiosInstance";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({ username: "", isAuthenticated: false });
  const [searchState, setSearchState] = useState({ query: "", results: [], isOpen: false });
  const [notificationState, setNotificationState] = useState({
    items: [],
    isOpen: false,
    unreadCount: 0
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const navbarRef = useRef(null);
  const lastNotificationIdRef = useRef(null);
  const hasVibrated = useRef(false);
  const hasFetched = useRef(false);
  const debounceTimer = useRef(null);

  // ✅ Store username in a ref so fetchNotifications doesn't need it as a dep.
  // Root cause of double /me + double /notifications:
  //   1. initAuth() sets userData → userData.username changes
  //   2. getRedirectPath depends on userData.username → recreates on username change
  //   3. fetchNotifications depends on getRedirectPath → recreates too
  //   4. useEffect([userData.isAuthenticated, fetchNotifications]) sees new
  //      fetchNotifications reference → re-fires → calls /notifications again
  //   5. That effect also re-calls the block that fetches /me (in old versions)
  //
  // Fix: store username in a ref. getRedirectPath reads from the ref — always
  // current, never a stale closure — but never listed as a useCallback dep.
  // This breaks the recreation chain entirely.
  const usernameRef = useRef("");

  const buttonVariants = useMemo(() => ({
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20, duration: 0.3 }
    }
  }), []);

  const formatNotificationMessage = useCallback((notif) => {
    const actor = notif.user?.username || "Someone";
    const targetTitle = notif.target?.title || "Untitled";
    const targetType = notif.target?.type || "post";
    switch (notif.type) {
      case "follow":       return `${actor} followed you`;
      case "unfollow":     return `${actor} unfollowed you`;
      case "upvote":       return `${actor} upvoted your ${targetType} "${targetTitle}"`;
      case "downvote":     return `${actor} downvoted your ${targetType} "${targetTitle}"`;
      case "comment":      return `${actor} commented "${notif.comment?.text || "something"}" on your ${targetType} "${targetTitle}"`;
      case "comment_like": return `${actor} liked your comment at ${targetType} "${targetTitle}"`;
      default:             return notif.message || "New notification";
    }
  }, []); // ✅ no deps — pure switch on notif fields

  const getRedirectPath = useCallback((notif) => {
    // ✅ Read username from ref — always current, never a dep
    const username = usernameRef.current;
    switch (notif.type) {
      case "follow":
      case "unfollow": return `/profile/${username}`;
      case "upvote":
      case "downvote":
      case "comment":
      case "comment_like":
        return notif.target?.type === "debate"     ? `/debatepage/${notif.target?.id}` :
               notif.target?.type === "discussion" ? `/discussionpage/${notif.target?.id}` :
               notif.target?.type === "blog"       ? `/blogpage/${notif.target?.id}` : "/";
      default: return "/";
    }
  }, []); // ✅ no deps — reads ref, never stale

  // ✅ fetchNotifications is now fully stable — deps are [] effectively,
  // because both formatNotificationMessage and getRedirectPath are also stable.
  // It will NEVER recreate between renders, so the notification effect fires
  // exactly once after auth resolves and never again.
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await API.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      const formattedNotifications = res.data
        .map(notif => ({
          ...notif,
          message: formatNotificationMessage(notif),
          redirectTo: getRedirectPath(notif),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const latestId = formattedNotifications[0]?._id;
      if (lastNotificationIdRef.current !== latestId) {
        setNotificationState(prev => ({
          ...prev,
          items: formattedNotifications,
          unreadCount: formattedNotifications.filter(n => !n.read).length
        }));
        lastNotificationIdRef.current = latestId;
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Error fetching notifications:", err);
    }
  }, [formatNotificationMessage, getRedirectPath]); // both stable → fetchNotifications is stable

  // ✅ Single combined init effect — runs exactly once on mount.
  // Fetches /me once, sets userData AND usernameRef, then fetches /notifications once.
  // No separate notification effect needed — doing it sequentially here means
  // we never risk the notification effect re-firing due to a dep change.
  useEffect(() => {
    if (hasFetched.current) return; // StrictMode double-invoke guard
    hasFetched.current = true;

    const token = localStorage.getItem("token");
    if (!token) return;

    const init = async () => {
      try {
        const res = await API.get("/users/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000)
        });
        // ✅ Write to ref FIRST, before setting state, so fetchNotifications
        // reads the correct username when called immediately after
        usernameRef.current = res.data.username;
        setUserData({ username: res.data.username, isAuthenticated: true });
        // ✅ Call fetchNotifications directly here — not via a dependent effect.
        // This guarantees exactly 1 /notifications call total.
        await fetchNotifications();
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUserData({ username: "", isAuthenticated: false });
      }
    };

    init();
  }, [fetchNotifications]); // fetchNotifications is stable so this effect runs once

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchState(prev => ({ ...prev, isOpen: false }));
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationState(prev => ({ ...prev, isOpen: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsNavbarOpen(false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    if (isMobile) setIsNavbarOpen(false);
  }, [location.pathname, isMobile]);

  const handleSearch = useCallback((query) => {
    setSearchState(prev => ({ ...prev, query }));
    clearTimeout(debounceTimer.current);

    if (!query.trim()) {
      setSearchState(prev => ({ ...prev, results: [], isOpen: false }));
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const { data } = await API.get(`/users/search?query=${encodeURIComponent(query)}`, {
          signal: AbortSignal.timeout(5000)
        });
        setSearchState(prev => ({ ...prev, results: data, isOpen: data.length > 0 }));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error searching users:", error);
          setSearchState(prev => ({ ...prev, results: [] }));
        }
      }
    }, 300);
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      await API.put("/notifications/mark-read", {}, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });
      setNotificationState(prev => ({
        ...prev,
        items: prev.items.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    const opening = !notificationState.isOpen;
    setNotificationState(prev => ({ ...prev, isOpen: opening }));
    if (opening) {
      fetchNotifications();
      if (notificationState.unreadCount > 0 && !hasVibrated.current) {
        hasVibrated.current = true;
        markNotificationsAsRead();
      }
    }
  }, [notificationState.isOpen, notificationState.unreadCount, fetchNotifications, markNotificationsAsRead]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    usernameRef.current = "";
    setUserData({ username: "", isAuthenticated: false });
    navigate("/login");
  }, [navigate]);

  const getNotificationGroup = (date) => {
    const today = new Date();
    const diffDays = Math.ceil((today - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "Today";
    if (diffDays <= 2) return "Yesterday";
    if (diffDays <= 7) return "This week";
    if (diffDays <= 30) return "This month";
    return "Older";
  };

  const groupedNotifications = useMemo(() => {
    return notificationState.items.reduce((acc, notif) => {
      const group = getNotificationGroup(notif.createdAt);
      acc[group] = acc[group] || [];
      acc[group].push(notif);
      return acc;
    }, {});
  }, [notificationState.items]);

  const groupOrder = ["Today", "Yesterday", "This week", "This month", "Older"];

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsNavbarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-100 hover:bg-gray-200"
          aria-label="Open navigation menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      )}
      <nav
        ref={navbarRef}
        className={`fixed top-0 left-0 h-full bg-white text-black flex flex-col shadow-lg z-50 transition-all duration-300 ${
          isMobile ? (isNavbarOpen ? "w-full" : "hidden") : "w-64"
        } ${isMobile ? "mb-16" : ""}`}
      >
        {isMobile && (
          <button
            onClick={() => setIsNavbarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            aria-label="Close navigation menu"
          >
            <XIcon className="h-6 w-6" />
          </button>
        )}
        <div className="p-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Debatify
          </Link>
        </div>
        <div className="flex-1 space-y-4 p-4">
          {!userData.isAuthenticated && (
            <motion.div variants={buttonVariants} initial="hidden" animate="visible">
              <Link
                to="/login"
                className="w-full text-left p-2 rounded-lg text-black hover:bg-gray-200 transition-colors duration-200"
              >
                Login / Register
              </Link>
            </motion.div>
          )}

          <div className="relative" ref={searchRef}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 text-black transition-colors duration-200"
            >
              <SearchIcon className="h-6 w-6 text-blue-600" />
              <input
                type="text"
                value={searchState.query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder=" Search users..."
                className="bg-transparent focus:outline-none w-full text-black placeholder-gray-500 text-lg font-medium"
                aria-label="Search users by username"
              />
            </motion.div>
            {searchState.isOpen && searchState.results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 left-0 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 border border-gray-200"
              >
                {searchState.results.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user.username}`}
                    onClick={() => setSearchState(prev => ({ ...prev, query: "", isOpen: false }))}
                    className="block px-4 py-2 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-colors duration-200 text-black border-b border-gray-200 last:border-b-0"
                  >
                    <h3 className="text-gray-800 font-semibold">{user.username}</h3>
                    <p className="text-gray-600 text-sm truncate">
                      {user.bio ? user.bio.substring(0, 30) + "..." : "No bio available"}
                    </p>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-blue-500">Role: {user.role || "User"}</span>
                      <span className="text-gray-500">
                        Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg ${
                  isActive ? "bg-gray-200 text-blue-600" : "text-black hover:bg-gray-100"
                } transition-colors duration-200`
              }
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-lg font-medium">Home</span>
            </NavLink>
          </motion.div>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible">
            <NavLink
              to="/debate"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg ${
                  isActive ? "bg-gray-200 text-blue-600" : "text-black hover:bg-gray-100"
                } transition-colors duration-200`
              }
            >
              <ChatAlt2Icon className="h-6 w-6" />
              <span className="text-lg font-medium">Debates</span>
            </NavLink>
          </motion.div>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible">
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg ${
                  isActive ? "bg-gray-200 text-blue-600" : "text-black hover:bg-gray-100"
                } transition-colors duration-200`
              }
            >
              <PencilIcon className="h-6 w-6" />
              <span className="text-lg font-medium">Blogs</span>
            </NavLink>
          </motion.div>

          <motion.div variants={buttonVariants} initial="hidden" animate="visible">
            <NavLink
              to="/discussion"
              className={({ isActive }) =>
                `flex items-center space-x-2 p-2 rounded-lg ${
                  isActive ? "bg-gray-200 text-blue-600" : "text-black hover:bg-gray-100"
                } transition-colors duration-200`
              }
            >
              <ChatIcon className="h-6 w-6" />
              <span className="text-lg font-medium">Discussion</span>
            </NavLink>
          </motion.div>

          {userData.isAuthenticated && (
            <motion.div variants={buttonVariants} initial="hidden" animate="visible">
              <NavLink
                to="/bookmarks"
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded-lg ${
                    isActive ? "bg-gray-200 text-blue-600" : "text-black hover:bg-gray-100"
                  } transition-colors duration-200`
                }
              >
                <BookmarkIcon className="h-6 w-6" />
                <span className="text-lg font-medium">Bookmarks</span>
              </NavLink>
            </motion.div>
          )}

          {userData.isAuthenticated && (
            <motion.div variants={buttonVariants} initial="hidden" animate="visible">
              <div className="relative" ref={notificationRef}>
                <motion.button
                  onClick={toggleNotifications}
                  className="flex items-center space-x-2 p-2 rounded-lg text-black hover:bg-gray-100 transition-colors duration-200 w-full"
                  animate={notificationState.unreadCount > 0 && !hasVibrated.current ? { x: [0, 5, -5, 0] } : {}}
                  transition={notificationState.unreadCount > 0 && !hasVibrated.current ? { duration: 0.5, ease: "easeInOut" } : {}}
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="text-lg font-medium">Notifications</span>
                  {notificationState.unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {notificationState.unreadCount}
                    </span>
                  )}
                </motion.button>
                {notificationState.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-20 bottom-[-25vh] transform -translate-y-1/2 ml-2 w-96 bg-white rounded-lg shadow-lg max-h-[80vh] overflow-y-auto z-50"
                  >
                    {notificationState.items.length > 0 ? (
                      groupOrder.map((group) =>
                        groupedNotifications[group] ? (
                          <div key={group}>
                            <h3 className="px-4 py-2 text-sm font-semibold text-gray-600 sticky top-0 bg-white">
                              {group}
                            </h3>
                            {groupedNotifications[group].map((notif) => (
                              <div
                                key={notif._id}
                                className={`px-4 py-3 border-b border-gray-200 ${
                                  !notif.read ? "bg-gray-50" : ""
                                } hover:bg-gray-100`}
                              >
                                <p className="text-sm text-gray-800">{notif.message}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null
                      )
                    ) : (
                      <p className="px-4 py-3 text-gray-500 text-sm">No notifications yet.</p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {userData.isAuthenticated && userData.username && (
            <motion.div variants={buttonVariants} initial="hidden" animate="visible">
              <NavLink
                to={`/profile/${userData.username}`}
                className={({ isActive }) =>
                  `flex items-center space-x-2 p-2 rounded-lg ${
                    isActive ? "bg-gray-200 text-blue-600" : "text-black hover:bg-gray-100"
                  } transition-colors duration-200`
                }
              >
                <UserIcon className="h-6 w-6" />
                <span className="text-lg font-medium">Profile</span>
              </NavLink>
            </motion.div>
          )}
        </div>
        {userData.isAuthenticated && (
          <div className="p-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="w-full text-left p-2 rounded-lg text-black hover:bg-gray-200 transition-colors duration-200"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
            >
              Logout
            </motion.button>
          </div>
        )}
      </nav>
    </>
  );
};

export default React.memo(Navbar);