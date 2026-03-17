import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { UserRemoveIcon, CogIcon, PencilIcon, CameraIcon, LockClosedIcon, XIcon } from "@heroicons/react/outline";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_BASE_URL = API.defaults.baseURL.replace("/api", "");
const DEFAULT_AVATAR = "https://res.cloudinary.com/doqk3n7wo/image/upload/v1758427453/samples/animals/kitten-playing.gif";

function getToken() {
  return localStorage.getItem("token");
}

// ── Tab accent colors ─────────────────────────────────────────────
const TAB_META = {
  debate:     { color: "#6366F1", bg: "rgba(99,102,241,0.07)",   border: "rgba(99,102,241,0.2)",   label: "Debates",     emoji: "⚔️" },
  discussion: { color: "#10B981", bg: "rgba(16,185,129,0.07)",   border: "rgba(16,185,129,0.2)",   label: "Discussions", emoji: "💬" },
  blogs:      { color: "#EC4899", bg: "rgba(236,72,153,0.07)",   border: "rgba(236,72,153,0.2)",   label: "Blogs",       emoji: "✍️" },
};

// ── Modal wrapper ─────────────────────────────────────────────────
const Modal = ({ title, onClose, accentColor = "#6366F1", children }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
      >
        {/* accent top bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, #A855F7)` }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: "#1A1830", fontFamily: "'Sora', sans-serif" }}>{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100">
              <XIcon className="h-4 w-4" style={{ color: "#8B87A3" }} />
            </button>
          </div>
          {children}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── User list modal (followers / following) ───────────────────────
const UserListModal = ({ title, users, onClose, onUserClick, accentColor }) => (
  <Modal title={title} onClose={onClose} accentColor={accentColor}>
    {users.length > 0 ? (
      <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {users.map(u => (
          <li
            key={u._id}
            onClick={() => onUserClick(u.username)}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-slate-50"
          >
            <img
              src={u.profilePicture ? `${BACKEND_BASE_URL}${u.profilePicture}` : DEFAULT_AVATAR}
              alt={u.username}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              style={{ border: `2px solid ${accentColor}30` }}
              onError={e => e.target.src = DEFAULT_AVATAR}
            />
            <span className="text-sm font-semibold" style={{ color: "#1A1830" }}>{u.username}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-center text-sm py-8" style={{ color: "#A09DB8" }}>Nothing here yet.</p>
    )}
    <button onClick={onClose} className="w-full mt-5 py-2.5 rounded-xl text-sm font-bold transition-all"
      style={{ background: accentColor, color: "#fff" }}>Close</button>
  </Modal>
);

// ── Post card ─────────────────────────────────────────────────────
const PostCard = ({ item, accentColor, accentBg, accentBorder, onClick, onDelete, isOwn, excerpt }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="relative cursor-pointer rounded-2xl p-4 transition-all duration-200"
      style={{
        background: "#fff",
        border: `1px solid rgba(0,0,0,0.07)`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
      }}
    >
      {/* accent strip */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full" style={{ background: accentColor, opacity: 0.4 }} />

      <div className="pl-3">
        <h3 className="text-sm font-bold leading-snug mb-1.5 pr-6" style={{ color: "#1A1830", fontFamily: "'Sora', sans-serif" }}>
          {item.title || "Untitled"}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#8B87A3" }}>
          {excerpt || "—"}
        </p>
      </div>

      {isOwn && (
        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 text-xs font-bold"
            style={{ color: "#A09DB8" }}
          >⋯</button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-7 w-28 rounded-xl overflow-hidden z-20"
                style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
              >
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full px-3 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-red-50"
                  style={{ color: "#EF4444" }}
                >
                  🗑 Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

// ── Stat pill ─────────────────────────────────────────────────────
const StatPill = ({ value, label, onClick, color }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center px-5 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
    style={{ background: `${color}08`, border: `1px solid ${color}20` }}
  >
    <span className="text-2xl font-extrabold" style={{ color, fontFamily: "'DM Mono', monospace" }}>{value}</span>
    <span className="text-xs font-medium mt-0.5" style={{ color: "#8B87A3" }}>{label}</span>
  </button>
);

// ── Input field ───────────────────────────────────────────────────
const ModalInput = ({ type = "text", value, onChange, placeholder, accentColor, rows }) => {
  const props = {
    value, onChange, placeholder,
    className: "w-full rounded-xl text-sm transition-all duration-200 focus:outline-none",
    style: { background: "#F8F7FF", border: "1px solid rgba(0,0,0,0.1)", color: "#1A1830", padding: "12px 14px" },
    onFocus: e => { e.target.style.borderColor = accentColor; e.target.style.boxShadow = `0 0 0 3px ${accentColor}18`; },
    onBlur:  e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none"; },
  };
  return rows
    ? <textarea {...props} rows={rows} maxLength={100} />
    : <input {...props} type={type} />;
};

// ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const validTabs = ["debate", "discussion", "blogs"];
  const initialTab = (() => {
    const section = new URLSearchParams(location.search).get("section");
    return validTabs.includes(section) ? section : "debate";
  })();

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [createdDebates, setCreatedDebates] = useState([]);
  const [createdBlogs, setCreatedBlogs] = useState([]);
  const [createdDiscussions, setCreatedDiscussions] = useState([]);
  const [profileError, setProfileError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChangeBioModal, setShowChangeBioModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeProfilePictureModal, setShowChangeProfilePictureModal] = useState(false);
  const [newBio, setNewBio] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);

  const tokenRef = useRef(getToken());
  const token = tokenRef.current;
  const settingsRef = useRef(null);

  useEffect(() => {
    const section = new URLSearchParams(location.search).get("section");
    if (validTabs.includes(section)) {
      setActiveTab(prev => prev !== section ? section : prev);
    }
  }, [location.search]); // eslint-disable-line

  useEffect(() => {
    const handleClickOutside = e => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettingsMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = tab => {
    setActiveTab(tab);
    navigate(`${location.pathname}?section=${tab}`, { replace: true });
  };

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await API.get("/users/profile/me", { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch { return null; }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    const res = await API.get(`/users/profile/${username}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  }, [username, token]);

  const fetchCreatedDebates = useCallback(async () => {
    const res = await API.get(`/users/profile/${username}/debates`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [username, token]);

  const fetchCreatedBlogs = useCallback(async () => {
    const res = await API.get(`/users/profile/${username}/blogs`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [username, token]);

  const fetchCreatedDiscussions = useCallback(async () => {
    const res = await API.get(`/users/profile/${username}/discussions`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [username, token]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setUser(null);
    setProfileError("");
    try {
      const [currentUserData, userData, debatesData, blogsData, discussionsData] = await Promise.all([
        fetchCurrentUser(),
        fetchProfile(),
        fetchCreatedDebates(),
        fetchCreatedBlogs(),
        fetchCreatedDiscussions(),
      ]);
      setCurrentUser(currentUserData);
      setUser(userData);
      setCreatedDebates(debatesData);
      setCreatedBlogs(blogsData);
      setCreatedDiscussions(discussionsData);
      setNewBio(userData.bio || "");
      const followers = Array.isArray(userData.followers) ? userData.followers : [];
      const followings = Array.isArray(userData.followings) ? userData.followings : [];
      if (currentUserData) {
        setIsFollowing(followers.some(f => String(f._id) === String(currentUserData._id)));
        setIsFollower(followings.some(f => String(f._id) === String(currentUserData._id)));
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Error fetching profile data");
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUser, fetchProfile, fetchCreatedDebates, fetchCreatedBlogs, fetchCreatedDiscussions]);

  useEffect(() => { fetchAllData(); }, [username, fetchAllData]);

  const handleDeleteDebate = async id => {
    try {
      await API.delete(`/debates/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCreatedDebates(p => p.filter(d => d._id !== id));
    } catch (err) { setProfileError(err.response?.data?.message || "Error deleting"); }
  };
  const handleDeleteDiscussion = async id => {
    try {
      await API.delete(`/discussions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCreatedDiscussions(p => p.filter(d => d._id !== id));
    } catch (err) { setProfileError(err.response?.data?.message || "Error deleting"); }
  };
  const handleDeleteBlog = async id => {
    try {
      await API.delete(`/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCreatedBlogs(p => p.filter(b => b._id !== id));
    } catch (err) { setProfileError(err.response?.data?.message || "Error deleting"); }
  };

  const handleChangeBio = async () => {
    if (newBio.length > 100) { setProfileError("Bio cannot exceed 100 characters."); return; }
    try {
      await API.put("/users/profile/update-bio", { bio: newBio }, { headers: { Authorization: `Bearer ${token}` } });
      setShowChangeBioModal(false);
      fetchAllData();
    } catch (err) { setProfileError(err.response?.data?.message || "Error updating bio"); }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) { setProfileError("Please provide both passwords"); return; }
    try {
      await API.put("/auth/profile/change-password", { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      setShowChangePasswordModal(false);
      setOldPassword(""); setNewPassword(""); setProfileError("");
      alert("Password changed successfully");
    } catch (err) { setProfileError(err.response?.data?.message || "Error changing password"); }
  };

  const handleChangeProfilePicture = async () => {
    if (!newProfilePicture) { setProfileError("Please select a file."); return; }
    const formData = new FormData();
    formData.append("profilePicture", newProfilePicture);
    try {
      await API.put("/users/profile/update-profile-picture", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setShowChangeProfilePictureModal(false);
      setNewProfilePicture(null);
      fetchAllData();
    } catch (err) { setProfileError(err.response?.data?.message || "Error updating picture"); }
  };

  const handleFollow = async () => {
    if (!token) { alert("Please log in to follow!"); return navigate("/login"); }
    try {
      if (isFollowing) {
        await API.post(`/users/profile/${username}/unfollow`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsFollowing(false);
        setUser(prev => ({ ...prev, followers: prev.followers.filter(f => f._id !== currentUser._id) }));
      } else {
        await API.post(`/users/profile/${username}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsFollowing(true);
        setUser(prev => ({ ...prev, followers: [...prev.followers, currentUser] }));
      }
    } catch (err) { setProfileError(err.response?.data?.message || "Error"); }
  };

  const handleProfileClick = uname => {
    setShowFollowers(false); setShowFollowing(false);
    navigate(`/profile/${uname}?section=${activeTab}`);
  };

  const isOwnProfile = currentUser && user && currentUser._id === user._id;
  const totalPosts = createdDebates.length + createdDiscussions.length + createdBlogs.length;
  const followButtonText = isFollowing ? "Unfollow" : isFollower ? "Follow Back" : "Follow";
  const tab = TAB_META[activeTab];
  const profilePicSrc = user?.profilePicture || DEFAULT_AVATAR;

  // active tab items
  const activeItems = activeTab === "debate" ? createdDebates : activeTab === "discussion" ? createdDiscussions : createdBlogs;
  const activeCount = activeItems.length;

  if (loading) return (
    <div className="min-h-screen md:ml-64 flex items-center justify-center" style={{ background: "#F8F7FF" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 rounded-full border-2 border-t-transparent"
        style={{ borderColor: "rgba(99,102,241,0.2)", borderTopColor: "#6366F1" }} />
    </div>
  );

  return (
    <div
      className="min-h-screen md:ml-64"
      style={{ background: "#F8F7FF", fontFamily: "'Sora', 'DM Sans', sans-serif", color: "#1A1830" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* error banner */}
      <AnimatePresence>
        {profileError && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-3"
            style={{ background: "#fff", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", boxShadow: "0 8px 24px rgba(239,68,68,0.12)" }}>
            ⚠ {profileError}
            <button onClick={() => setProfileError("")}><XIcon className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ HERO BANNER ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ background: "#F8F7FF" }}>
        {/* decorative mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", width: 600, height: 600, top: "-20%", left: "-5%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", width: 400, height: 400, top: "10%", right: "0%", background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-14 pb-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">

            {/* avatar block */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex-shrink-0"
            >
              {/* ring decorations */}
              <div className="absolute -inset-2 rounded-full opacity-20"
                style={{ background: "conic-gradient(from 0deg, #6366F1, #EC4899, #10B981, #6366F1)" }} />
              <div className="absolute -inset-1 rounded-full" style={{ background: "#F8F7FF" }} />
              <img
                src={profilePicSrc}
                alt={user?.username}
                className="relative w-36 h-36 rounded-full object-cover"
                style={{ border: "3px solid #fff", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                onError={e => e.target.src = DEFAULT_AVATAR}
              />
              {isOwnProfile && (
                <button
                  onClick={() => setShowChangeProfilePictureModal(true)}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
                >
                  <CameraIcon className="h-4 w-4 text-white" />
                </button>
              )}
            </motion.div>

            {/* info block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 text-center md:text-left"
            >
              {/* username + settings */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3" ref={settingsRef}>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: "#1A1830" }}>
                  {user?.username || "—"}
                </h1>
                {isOwnProfile ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowSettingsMenu(o => !o)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                      style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}
                    >
                      <CogIcon className="h-5 w-5" style={{ color: "#5E5A74" }} />
                    </button>
                    <AnimatePresence>
                      {showSettingsMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-12 left-0 w-52 rounded-2xl overflow-hidden z-30"
                          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
                        >
                          {[
                            { icon: <PencilIcon className="h-4 w-4" />, label: "Change Bio",      action: () => { setShowChangeBioModal(true); setShowSettingsMenu(false); } },
                            { icon: <LockClosedIcon className="h-4 w-4" />, label: "Change Password", action: () => { setShowChangePasswordModal(true); setShowSettingsMenu(false); } },
                            { icon: <UserRemoveIcon className="h-4 w-4" />, label: "Log Out",         action: () => { localStorage.removeItem("token"); navigate("/login"); }, danger: true },
                          ].map((item, i) => (
                            <button
                              key={i}
                              onClick={item.action}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-slate-50"
                              style={{ color: item.danger ? "#EF4444" : "#3D3A52", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                            >
                              {item.icon} {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={handleFollow}
                    className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                    style={isFollowing
                      ? { background: "rgba(0,0,0,0.05)", color: "#5E5A74", border: "1px solid rgba(0,0,0,0.1)" }
                      : { background: "linear-gradient(135deg, #6366F1, #A855F7)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }
                    }
                  >
                    {followButtonText}
                  </button>
                )}
              </div>

              {/* bio */}
              <p className="text-sm max-w-sm mb-5 leading-relaxed" style={{ color: "#8B87A3", fontStyle: user?.bio ? "normal" : "italic" }}>
                {user?.bio || "No bio yet."}
              </p>

              {/* stats */}
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <StatPill value={totalPosts} label="Posts"     color="#6366F1" onClick={() => {}} />
                <StatPill value={user?.followers?.length || 0} label="Followers" color="#EC4899" onClick={() => setShowFollowers(true)} />
                <StatPill value={user?.followings?.length || 0} label="Following" color="#10B981" onClick={() => setShowFollowing(true)} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* bottom fade */}
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)" }} />
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* tab bar */}
        <div
          className="flex items-center gap-1 p-1.5 rounded-2xl mb-8"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", width: "fit-content" }}
        >
          {Object.entries(TAB_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={activeTab === key
                ? { background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }
                : { color: "#8B87A3" }
              }
            >
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
              {activeTab === key && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full ml-0.5"
                  style={{ background: meta.color, color: "#fff", fontSize: "10px" }}
                >
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* create button */}
        {isOwnProfile && (
          <div className="flex justify-end mb-5">
            <Link
              to={activeTab === "debate" ? "/createDebate" : activeTab === "discussion" ? "/createDiscussion" : "/createBlog"}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${tab.color}, #A855F7)`, color: "#fff", boxShadow: `0 4px 16px ${tab.color}30` }}
            >
              + New {tab.label.slice(0, -1)}
            </Link>
          </div>
        )}

        {/* posts grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: tab.bg, border: `1px solid ${tab.border}` }}>
                  {tab.emoji}
                </div>
                <p className="text-base font-bold" style={{ color: "#1A1830" }}>No {tab.label.toLowerCase()} yet</p>
                <p className="text-sm" style={{ color: "#A09DB8" }}>
                  {isOwnProfile ? `Create your first ${tab.label.slice(0, -1).toLowerCase()}!` : "Nothing posted yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeItems.map((item, i) => (
                  <PostCard
                    key={item._id}
                    item={item}
                    accentColor={tab.color}
                    accentBg={tab.bg}
                    accentBorder={tab.border}
                    isOwn={isOwnProfile}
                    excerpt={
                      activeTab === "debate" ? item.openingArgument :
                      activeTab === "discussion" ? item.description :
                      item.content
                    }
                    onClick={() => {
                      if (activeTab === "debate") navigate(`/debatepage/${item._id}`, { state: { fromProfile: username } });
                      else if (activeTab === "discussion") navigate(`/discussionpage/${item._id}`, { state: { fromProfile: username } });
                      else navigate(`/blogpage/${item._id}`, { state: { fromProfile: username } });
                    }}
                    onDelete={() => {
                      if (activeTab === "debate") handleDeleteDebate(item._id);
                      else if (activeTab === "discussion") handleDeleteDiscussion(item._id);
                      else handleDeleteBlog(item._id);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══ MODALS ═══════════════════════════════════════════════ */}
      {showFollowers && (
        <UserListModal title="Followers" users={user?.followers || []} onClose={() => setShowFollowers(false)}
          onUserClick={handleProfileClick} accentColor="#EC4899" />
      )}
      {showFollowing && (
        <UserListModal title="Following" users={user?.followings || []} onClose={() => setShowFollowing(false)}
          onUserClick={handleProfileClick} accentColor="#10B981" />
      )}

      {showChangeBioModal && (
        <Modal title="Change Bio" onClose={() => setShowChangeBioModal(false)} accentColor="#6366F1">
          <ModalInput
            value={newBio} onChange={e => setNewBio(e.target.value)}
            placeholder="Write something about yourself…" rows={4} accentColor="#6366F1"
          />
          <p className="text-xs mt-1.5 mb-4" style={{ color: "#A09DB8" }}>{newBio.length}/100 characters</p>
          <div className="flex gap-3">
            <button onClick={handleChangeBio} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)" }}>Save</button>
            <button onClick={() => setShowChangeBioModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(0,0,0,0.04)", color: "#5E5A74" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {showChangePasswordModal && (
        <Modal title="Change Password" onClose={() => { setShowChangePasswordModal(false); setOldPassword(""); setNewPassword(""); }} accentColor="#A855F7">
          <div className="space-y-3 mb-5">
            <ModalInput type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
              placeholder="Current password" accentColor="#A855F7" />
            <ModalInput type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password" accentColor="#A855F7" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleChangePassword} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #A855F7, #6366F1)" }}>Save</button>
            <button onClick={() => { setShowChangePasswordModal(false); setOldPassword(""); setNewPassword(""); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(0,0,0,0.04)", color: "#5E5A74" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {showChangeProfilePictureModal && (
        <Modal title="Update Profile Picture" onClose={() => setShowChangeProfilePictureModal(false)} accentColor="#EC4899">
          <label
            className="flex flex-col items-center justify-center w-full py-8 rounded-xl cursor-pointer transition-all duration-200 mb-5"
            style={{ background: "rgba(236,72,153,0.04)", border: "2px dashed rgba(236,72,153,0.25)" }}
          >
            <span className="text-3xl mb-2">🖼</span>
            <span className="text-sm font-semibold" style={{ color: "#EC4899" }}>
              {newProfilePicture ? newProfilePicture.name : "Click to choose a photo"}
            </span>
            <span className="text-xs mt-1" style={{ color: "#A09DB8" }}>PNG, JPG up to 5MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => setNewProfilePicture(e.target.files[0])} />
          </label>
          <div className="flex gap-3">
            <button onClick={handleChangeProfilePicture} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #EC4899, #A855F7)" }}>Upload</button>
            <button onClick={() => setShowChangeProfilePictureModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: "rgba(0,0,0,0.04)", color: "#5E5A74" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* footer */}
      <footer className="py-8 px-6 text-center text-xs mt-8"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#C4C0D8", background: "#fff" }}>
        © {new Date().getFullYear()} Debatify. Built for thinkers, arguers, and curious minds.
      </footer>
    </div>
  );
};

export default ProfilePage;