// src/components/Layout.js
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => (
  <>
    <Navbar />
    <main className="min-h-screen pb-20"> {/* pb-20 ensures footer won't overlap */}
      <Outlet />
    </main>
    <Footer />
  </>
);

export default React.memo(Layout);
