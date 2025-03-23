import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import CreateDiscussion from "./pages/CreateDiscussion";
import Navbar from "./components/Navbar";
import DiscussionPage from "./pages/DiscussionPage";
import Support from "./components/Support";
import DebateHub from "./pages/Debate";
import DiscussionHub from "./pages/Discussion";
import CreateDebate from "./pages/CreateDebate";
import DebatePage from "./pages/DebatePage";
import ProfilePage from "./pages/ProfilePage";
import Blog from "./pages/Blog";
import CreateBlog from "./pages/CreateBlog";
import Bookmark from "./components/Bookmark";
import BlogPage from "./pages/BlogPage";
import MobileFooter from "./components/MobileFooter";

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Auth />} />
          <Route path="createDiscussion" element={<CreateDiscussion />} />
          <Route path="discussionpage/:id" element={<DiscussionPage />} />
          <Route path="support" element={<Support />} />
          <Route path="debate" element={<DebateHub />} />
          <Route path="discussion" element={<DiscussionHub />} />
          <Route path="createDebate" element={<CreateDebate />} />
          <Route path="debatepage/:id" element={<DebatePage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="blog" element={<Blog />} />
          <Route path="createBlog" element={<CreateBlog />} />
          <Route path="blogpage/:id" element={<BlogPage />} />
          <Route path="bookmarks/" element={<Bookmark />} />
        </Route>
      </Routes>

      {/* Mobile Footer - Hamesha render hoga, sirf mobile screen pe dikhega */}
      <MobileFooter />
    </div>
  );
};

export default App;
