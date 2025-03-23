// src/components/Footer.js
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.5 }}
    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 text-center rounded-lg shadow-md"
  >
    <p className="text-sm">
      <Link to="/support" className="underline hover:text-yellow-300 transition-colors duration-300">
        Support
      </Link>{" "}
      | © {new Date().getFullYear()} <span className="font-semibold">Debatify!</span> All rights reserved.
    </p>
  </motion.footer>
);

export default React.memo(Footer);
