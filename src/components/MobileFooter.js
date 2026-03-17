// src/components/MobileFooter.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ChatAlt2Icon,
  UsersIcon,
  BookOpenIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

// ─────────────────────────────────────────────────────────────────
// ✅ ZERO API CALLS in MobileFooter.
//
// Root cause of the duplicate /me invocation:
//   Both Navbar AND MobileFooter were independently fetching /users/profile/me
//   on mount. Because both are always mounted, every page load triggered two
//   identical Lambda calls just to learn the same username.
//
// Fix strategy — read from localStorage, not from the API:
//   Navbar already fetches /me once and has the username. We simply store it
//   in localStorage under "username" after the Navbar fetch resolves.
//   MobileFooter reads it from localStorage — synchronously, zero network.
//
//   This is safe because:
//   • localStorage is synchronous and always available
//   • The username never changes mid-session (users can't rename themselves)
//   • On logout, Navbar clears both "token" and "username" from localStorage
//   • MobileFooter listens to the "storage" event to react to cross-tab
//     login/logout changes
// ─────────────────────────────────────────────────────────────────

const MobileFooter = () => {
  // ✅ Read both values synchronously from localStorage — no useEffect, no fetch
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));
  const location = useLocation();

  // ✅ Re-sync if localStorage changes (e.g. Navbar finishes its /me fetch and
  // writes the username, or the user logs out from another tab).
  // The "storage" event fires when localStorage is mutated from ANY tab/component
  // other than the current one. For same-component writes (Navbar in same tab),
  // we use a custom "auth-change" event dispatched by Navbar after login/logout.
  useEffect(() => {
    const sync = () => {
      setUsername(localStorage.getItem("username") || "");
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    // Cross-tab changes (standard Web API)
    window.addEventListener("storage", sync);
    // Same-tab changes dispatched by Navbar (see Navbar.jsx)
    window.addEventListener("auth-change", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-change", sync);
    };
  }, []);

  // ✅ Also re-sync on every route change — catches the case where the user
  // logged in on /login and navigated here before the storage event fired.
  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const profileHref = isAuthenticated && username ? `/profile/${username}` : "/login";

  const iconVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    hover: { scale: 1.2, color: "#2563eb", transition: { duration: 0.2 } },
  };

  const NAV_ITEMS = [
    { to: "/",           icon: <HomeIcon className="h-6 w-6" />,         label: "Home"        },
    { to: "/discussion", icon: <ChatAlt2Icon className="h-6 w-6" />,     label: "Discussions" },
    { to: "/debate",     icon: <UsersIcon className="h-6 w-6" />,        label: "Debates"     },
    { to: "/blog",       icon: <BookOpenIcon className="h-6 w-6" />,     label: "Blogs"       },
    { to: profileHref,   icon: <UserCircleIcon className="h-6 w-6" />,   label: "Profile"     },
  ];

  return (
    <motion.div
      className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
        {NAV_ITEMS.map((item) => (
          <motion.div
            key={item.to}
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Link to={item.to} className="flex flex-col items-center text-gray-600">
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(MobileFooter);