// src/components/MobileFooter.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ChatAlt2Icon,
  UsersIcon,
  BookOpenIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";
import API from "../api/axiosInstance";

const MobileFooter = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await API.get("/users/profile/me");
        setUsername(data.username);
      } catch (err) {
        console.error("MobileFooter - Error fetching user profile:", err);
        setUsername("");
        localStorage.removeItem("token");
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate(isAuthenticated && username ? `/profile/${username}` : "/login");
  };

  const iconVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    hover: { scale: 1.2, color: "#2563eb", transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg md:hidden z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
        <motion.div variants={iconVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link to="/" className="flex flex-col items-center text-gray-600">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>
        </motion.div>

        <motion.div variants={iconVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link to="/discussion" className="flex flex-col items-center text-gray-600">
            <ChatAlt2Icon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Discussions</span>
          </Link>
        </motion.div>

        <motion.div variants={iconVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link to="/debate" className="flex flex-col items-center text-gray-600">
            <UsersIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Debates</span>
          </Link>
        </motion.div>

        <motion.div variants={iconVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link to="/blog" className="flex flex-col items-center text-gray-600">
            <BookOpenIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Blogs</span>
          </Link>
        </motion.div>

        <motion.div variants={iconVariants} initial="hidden" animate="visible" whileHover="hover">
          <Link
            to={isAuthenticated && username ? `/profile/${username}` : "/login"}
            onClick={handleProfileClick}
            className="flex flex-col items-center text-gray-600"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(MobileFooter);
