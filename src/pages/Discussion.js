import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axiosInstance";
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, LockClosedIcon } from "@heroicons/react/outline";

// ── Floating orb background ──────────────────────────────────────
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { w: 500, h: 500, top: "-10%", left: "-8%",  color: "rgba(16,185,129,0.07)",  dur: "18s" },
      { w: 400, h: 400, top: "35%",  left: "62%",  color: "rgba(99,102,241,0.05)",  dur: "22s" },
      { w: 350, h: 350, top: "65%",  left: "4%",   color: "rgba(59,130,246,0.05)",  dur: "16s" },
    ].map((orb, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: orb.w,
          height: orb.h,
          top: orb.top,
          left: orb.left,
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: `floatOrbDis ${orb.dur} ease-in-out infinite alternate`,
          animationDelay: `${i * 2.5}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes floatOrbDis {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(25px, 18px) scale(1.05); }
      }
    `}</style>
  </div>
);

// ── Category color map ───────────────────────────────────────────
const CATEGORY_COLORS = {
  default:     { bg: "rgba(16,185,129,0.08)",  text: "#10B981", border: "rgba(16,185,129,0.2)" },
  technology:  { bg: "rgba(59,130,246,0.08)",  text: "#3B82F6", border: "rgba(59,130,246,0.2)" },
  science:     { bg: "rgba(99,102,241,0.08)",  text: "#6366F1", border: "rgba(99,102,241,0.2)" },
  politics:    { bg: "rgba(239,68,68,0.08)",   text: "#EF4444", border: "rgba(239,68,68,0.2)"  },
  philosophy:  { bg: "rgba(168,85,247,0.08)",  text: "#A855F7", border: "rgba(168,85,247,0.2)" },
  society:     { bg: "rgba(236,72,153,0.08)",  text: "#EC4899", border: "rgba(236,72,153,0.2)" },
  sports:      { bg: "rgba(245,158,11,0.08)",  text: "#F59E0B", border: "rgba(245,158,11,0.2)" },
};
const getCategoryStyle = (cat = "") => CATEGORY_COLORS[cat.toLowerCase()] || CATEGORY_COLORS.default;

// ── Sort button ──────────────────────────────────────────────────
const SortBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
    style={
      active
        ? { background: "linear-gradient(135deg, #10B981, #3B82F6)", color: "#fff", boxShadow: "0 2px 12px rgba(16,185,129,0.25)" }
        : { background: "rgba(0,0,0,0.04)", color: "#5E5A74", border: "1px solid rgba(0,0,0,0.07)" }
    }
  >
    {children}
  </button>
);

// ── View toggle pill ─────────────────────────────────────────────
const ViewToggle = ({ viewMode, onAll, onFollowing }) => (
  <div
    className="inline-flex rounded-xl p-1 gap-1"
    style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
  >
    {[
      { label: "All Discussions", mode: "all",       onClick: onAll },
      { label: "Following",       mode: "following", onClick: onFollowing },
    ].map(({ label, mode, onClick }) => (
      <button
        key={mode}
        onClick={onClick}
        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
        style={
          viewMode === mode
            ? { background: "#fff", color: "#1A1830", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }
            : { color: "#8B87A3" }
        }
      >
        {label}
      </button>
    ))}
  </div>
);

// ── Discussion card — entire card is the link ────────────────────
const DiscussionCard = ({ discussion, index }) => {
  const catStyle = getCategoryStyle(discussion.category);
  const commentCount = discussion.comments?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      <Link
        to={`/discussionpage/${discussion._id}`}
        className="group block h-full rounded-2xl p-6 transition-all duration-300"
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = catStyle.text;
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.09)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
          e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)";
        }}
      >
        {/* category + lock */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}
          >
            {discussion.category || "Uncategorized"}
          </span>
          {discussion.isPrivate && (
            <span
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              style={{ background: "rgba(239,68,68,0.06)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <LockClosedIcon className="h-3 w-3" /> Private
            </span>
          )}
        </div>

        {/* title */}
        <h3
          className="text-base font-bold mb-2 leading-snug transition-colors duration-200 group-hover:text-emerald-600"
          style={{ color: "#1A1830", fontFamily: "'Sora', sans-serif" }}
        >
          {discussion.title || "Untitled Discussion"}
        </h3>

        {/* excerpt */}
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#8B87A3" }}>
          {discussion.description
            ? discussion.description.substring(0, 90) + "…"
            : "No description"}
        </p>

        {/* footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${catStyle.text}, #3B82F6)` }}
            >
              {(discussion.author?.username || "U")[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium" style={{ color: "#5E5A74" }}>
              {discussion.author?.username || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {commentCount > 0 && (
              <span className="text-xs font-medium" style={{ color: "#A09DB8" }}>
                💬 {commentCount}
              </span>
            )}
            <span className="text-xs font-semibold" style={{ color: catStyle.text }}>
              Join →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Main component ───────────────────────────────────────────────
const Discussion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewMode = new URLSearchParams(location.search).get("view") || "all";

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const discussionsPerPage = 9;

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = viewMode === "following" ? "/discussions/following" : "/discussions";
      const { data } = await API.get(endpoint);
      setDiscussions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    setCurrentPage(0);
    fetchDiscussions();
  }, [fetchDiscussions]);

  const filteredDiscussions = useMemo(() => {
    if (searchQuery.trim() === "") return discussions;
    const lowerQuery = searchQuery.toLowerCase();
    return discussions.filter((d) =>
      (d.title || "").toLowerCase().includes(lowerQuery) ||
      (d.description || "").toLowerCase().includes(lowerQuery) ||
      (d.category || "").toLowerCase().includes(lowerQuery) ||
      (d.author?.username || "").toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, discussions]);

  const showDropdown = isDropdownOpen && filteredDiscussions.length > 0 && searchQuery.trim() !== "";

  useEffect(() => {
    if (searchQuery.trim() === "") setIsDropdownOpen(false);
    else setIsDropdownOpen(filteredDiscussions.length > 0);
  }, [searchQuery, filteredDiscussions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedDiscussions = useMemo(() => {
    return [...discussions].sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "popularity") {
        const pa = (a.comments?.length || 0) + (a.upvotes?.length || 0) + (a.downvotes?.length || 0);
        const pb = (b.comments?.length || 0) + (b.upvotes?.length || 0) + (b.downvotes?.length || 0);
        return pb - pa;
      }
      return 0;
    });
  }, [discussions, sortBy]);

  const totalPages = Math.ceil(sortedDiscussions.length / discussionsPerPage);
  const paginatedDiscussions = sortedDiscussions.slice(
    currentPage * discussionsPerPage,
    (currentPage + 1) * discussionsPerPage
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredDiscussions.length > 0) {
      navigate(`/discussionpage/${filteredDiscussions[0]._id}`);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div
      className="min-h-screen md:ml-64"
      style={{ background: "#F8F7FF", fontFamily: "'Sora', 'DM Sans', sans-serif", color: "#1A1830" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ══ HERO HEADER ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 pt-16 pb-14 text-center" style={{ background: "#F8F7FF" }}>
        <FloatingOrbs />

        {/* grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          {/* badge */}
          <div
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)", color: "#10B981" }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              💬
            </motion.span>
            Conversations that matter
          </div>

          {/* headline */}
          <h1
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
            style={{ lineHeight: 1.08 }}
          >
            <span style={{ color: "#1A1830" }}>Discussion </span>
            <span
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #6366F1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hub
            </span>
          </h1>

          <p className="text-base md:text-lg mb-8 max-w-md mx-auto" style={{ color: "#8B87A3" }}>
            Share your thoughts, connect with others, and dive into meaningful conversations.
          </p>

          {/* actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            <Link
              to="/createDiscussion"
              className="px-7 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #10B981, #3B82F6)",
                color: "#fff",
                boxShadow: "0 0 28px rgba(16,185,129,0.25)",
              }}
            >
              + Start a Discussion
            </Link>
            <ViewToggle
              viewMode={viewMode}
              onAll={() => navigate("/discussion")}
              onFollowing={() => navigate("?view=following")}
            />
          </div>
        </motion.div>

        {/* search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 max-w-lg mx-auto mt-8"
          ref={dropdownRef}
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#A09DB8" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, author…"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                color: "#1A1830",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
              onFocus={e => { e.target.style.borderColor = "#10B981"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
              onBlur={e =>  { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)"; }}
            />
          </form>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute top-14 left-0 right-0 rounded-xl overflow-hidden z-50"
                style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxHeight: 320, overflowY: "auto" }}
              >
                {filteredDiscussions.map((d) => {
                  const cs = getCategoryStyle(d.category);
                  return (
                    <Link
                      key={d._id}
                      to={`/discussionpage/${d._id}`}
                      onClick={() => { setSearchQuery(""); setIsDropdownOpen(false); }}
                      className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-50 border-b last:border-0"
                      style={{ borderColor: "rgba(0,0,0,0.05)" }}
                    >
                      <div
                        className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: cs.bg, color: cs.text }}
                      >
                        {(d.title || "D")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1A1830" }}>
                          {d.title || "Untitled"}
                        </p>
                        <p className="text-xs truncate" style={{ color: "#A09DB8" }}>
                          {d.category || "Uncategorized"} · {d.author?.username || "Unknown"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ══ CONTENT AREA ═════════════════════════════════════════ */}
      <div className="px-6 pb-16 max-w-6xl mx-auto">

        {/* toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1A1830" }}>
              {viewMode === "following" ? "From People You Follow" : "Active Discussions"}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#A09DB8" }}>
              {sortedDiscussions.length} discussion{sortedDiscussions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              {["latest", "oldest", "popularity"].map((s) => (
                <SortBtn key={s} active={sortBy === s} onClick={() => setSortBy(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SortBtn>
              ))}
            </div>

            <div
              className="flex items-center gap-2 pl-3 ml-1"
              style={{ borderLeft: "1px solid rgba(0,0,0,0.08)" }}
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <ArrowLeftIcon className="h-4 w-4" style={{ color: "#5E5A74" }} />
              </button>
              <span className="text-sm font-medium tabular-nums" style={{ color: "#5E5A74", minWidth: 60, textAlign: "center" }}>
                {currentPage + 1} / {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.07)" }}
              >
                <ArrowRightIcon className="h-4 w-4" style={{ color: "#5E5A74" }} />
              </button>
            </div>
          </div>
        </div>

        {/* content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full border-2 border-t-transparent"
              style={{ borderColor: "rgba(16,185,129,0.2)", borderTopColor: "#10B981" }}
            />
            <p className="text-sm" style={{ color: "#A09DB8" }}>Loading discussions…</p>
          </div>
        ) : sortedDiscussions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              💬
            </div>
            <p className="text-lg font-bold" style={{ color: "#1A1830" }}>No discussions yet</p>
            <p className="text-sm" style={{ color: "#A09DB8" }}>Be the first to start a conversation!</p>
            <Link
              to="/createDiscussion"
              className="mt-2 px-6 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)", color: "#fff" }}
            >
              Start a Discussion →
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedDiscussions.map((discussion, index) => (
              <DiscussionCard key={discussion._id} discussion={discussion} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer
        className="py-8 px-6 text-center text-xs"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#C4C0D8", background: "#fff" }}
      >
        © {new Date().getFullYear()} Debatify. Built for thinkers, arguers, and curious minds.
      </footer>
    </div>
  );
};

export default Discussion;