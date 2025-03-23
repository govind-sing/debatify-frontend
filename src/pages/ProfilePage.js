import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import API from "../api/axiosInstance";
import { UserRemoveIcon, CogIcon, PencilIcon, CameraIcon, LockClosedIcon } from "@heroicons/react/outline";
import { motion } from "framer-motion";

// const BACKEND_BASE_URL = "http://0.0.0.0:5001";
const BACKEND_BASE_URL = API.defaults.baseURL.replace("/api", "");

function getToken() {
 const token = localStorage.getItem("token");
 return token;
}

const ProfilePage = () => {
 const { username } = useParams();
 const navigate = useNavigate();
 const location = useLocation();

 const queryParams = new URLSearchParams(location.search);
 const initialTab = queryParams.get("section") || "debate";

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
 const [showDeleteMenu, setShowDeleteMenu] = useState(null);

 const token = getToken();

 useEffect(() => {
 const queryParams = new URLSearchParams(location.search);
 const validTabs = ["debate", "discussion", "blogs"];
 const newTab = validTabs.includes(activeTab) ? activeTab : "debate";
 if (newTab !== queryParams.get("section")) {
 const searchParams = new URLSearchParams(location.search);
 searchParams.set("section", newTab);
 navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
 }
 }, [activeTab, navigate, location.pathname, location.search]);

 const fetchCurrentUser = useCallback(async () => {
 if (!token) return null;
 try {
 const res = await API.get("/users/profile/me", { headers: { Authorization: `Bearer ${token}` } });
 return res.data;
 } catch (err) {
 console.error("Error fetching current user:", err);
 return null;
 }
 }, [token]);

 const fetchProfile = useCallback(async () => {
 try {
 const res = await API.get(`/users/profile/${username}`, { headers: { Authorization: `Bearer ${token}` } });
 return res.data;
 } catch (err) {
 throw err;
 }
 }, [username, token]);

 const fetchCreatedDebates = useCallback(async () => {
 try {
 const res = await API.get(`/users/profile/${username}/debates`, { headers: { Authorization: `Bearer ${token}` } });
 return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 } catch (err) {
 throw err;
 }
 }, [username, token]);

 const fetchCreatedBlogs = useCallback(async () => {
 try {
 const res = await API.get(`/users/profile/${username}/blogs`, { headers: { Authorization: `Bearer ${token}` } });
 return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 } catch (err) {
 throw err;
 }
 }, [username, token]);

 const fetchCreatedDiscussions = useCallback(async () => {
 try {
 const res = await API.get(`/users/profile/${username}/discussions`, { headers: { Authorization: `Bearer ${token}` } });
 return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
 } catch (err) {
 throw err;
 }
 }, [username, token]);

 const fetchAllData = useCallback(async () => {
 setLoading(true);
 setUser(null);
 setCreatedDebates([]);
 setCreatedBlogs([]);
 setCreatedDiscussions([]);
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
 setIsFollowing(followers.some((f) => String(f._id) === String(currentUserData._id)));
 setIsFollower(followings.some((f) => String(f._id) === String(currentUserData._id)));
 }
 } catch (err) {
 console.error("Error fetching data:", err);
 setProfileError(err.response?.data?.message || "Error fetching profile data");
 } finally {
 setLoading(false);
 }
 }, [fetchCurrentUser, fetchProfile, fetchCreatedDebates, fetchCreatedBlogs, fetchCreatedDiscussions]);

 useEffect(() => {
 fetchAllData();
 }, [username, fetchAllData]);

 useEffect(() => {
 const intervalId = setInterval(async () => {
 try {
 const { data } = await API.get(`/users/profile/${username}`, { headers: { Authorization: `Bearer ${token}` } });
 const newUser = data;

 setUser((prevUser) => {
 if (!prevUser) return newUser;

 const prevFollowers = Array.isArray(prevUser.followers) ? prevUser.followers : [];
 const prevFollowings = Array.isArray(prevUser.followings) ? prevUser.followings : [];
 const newFollowers = Array.isArray(newUser.followers) ? newUser.followers : [];
 const newFollowings = Array.isArray(newUser.followings) ? newUser.followings : [];

 if (
 JSON.stringify(prevFollowers) !== JSON.stringify(newFollowers) ||
 JSON.stringify(prevFollowings) !== JSON.stringify(newFollowings)
 ) {
 setIsFollowing(newFollowers.some((f) => String(f._id) === String(currentUser?._id)));
 setIsFollower(newFollowings.some((f) => String(f._id) === String(currentUser?._id)));
 return { ...prevUser, followers: newFollowers, followings: newFollowings };
 }
 return prevUser;
 });
 } catch (error) {
 console.error("Error polling profile:", error);
 }
 }, 5000);

 return () => clearInterval(intervalId);
 }, [username, token, currentUser]);

 const handleDeleteDebate = async (debateId) => {
 try {
 await API.delete(`/debates/${debateId}`, { headers: { Authorization: `Bearer ${token}` } });
 setCreatedDebates(createdDebates.filter((deb) => deb._id !== debateId));
 setShowDeleteMenu(null);
 } catch (err) {
 setProfileError(err.response?.data?.message || "Error deleting debate");
 }
 };

 const handleDeleteDiscussion = async (discussionId) => {
 try {
 await API.delete(`/discussions/${discussionId}`, { headers: { Authorization: `Bearer ${token}` } });
 setCreatedDiscussions(createdDiscussions.filter((disc) => disc._id !== discussionId));
 setShowDeleteMenu(null);
 } catch (err) {
 setProfileError(err.response?.data?.message || "Error deleting discussion");
 }
 };

 const handleDeleteBlog = async (blogId) => {
 try {
 await API.delete(`/blogs/${blogId}`, { headers: { Authorization: `Bearer ${token}` } });
 setCreatedBlogs(createdBlogs.filter((blog) => blog._id !== blogId));
 setShowDeleteMenu(null);
 } catch (err) {
 setProfileError(err.response?.data?.message || "Error deleting blog");
 }
 };

 const handleChangeBio = async () => {
 if (newBio.length > 100) {
 setProfileError("Bio cannot exceed 100 characters.");
 return;
 }
 try {
 if (!token) throw new Error("No authentication token found");
 await API.put("/users/profile/update-bio", { bio: newBio }, { headers: { Authorization: `Bearer ${token}` } });
 setShowChangeBioModal(false);
 fetchAllData();
 } catch (err) {
 setProfileError(err.response?.data?.message || "Error updating bio");
 }
 };

 const handleChangePassword = async () => {
 try {
 console.log("Changing password with:", { oldPassword, newPassword });
 if (!oldPassword || !newPassword) {
 setProfileError("Please provide old and new passwords");
 return;
 }
 await API.put("/auth/profile/change-password", { oldPassword, newPassword }, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setShowChangePasswordModal(false);
 setOldPassword("");
 setNewPassword("");
 setProfileError("");
 alert("Password changed successfully");
 } catch (err) {
 console.error("Password change error:", err.response?.data);
 setProfileError(err.response?.data?.message || "Error changing password");
 }
 };

 const handleChangeProfilePicture = async () => {
 if (!newProfilePicture) {
 setProfileError("Please select a file to upload.");
 return;
 }
 const formData = new FormData();
 formData.append("profilePicture", newProfilePicture);
 try {
 await API.put("/users/profile/update-profile-picture", formData, { 
 headers: { 
 Authorization: `Bearer ${token}`,
 "Content-Type": "multipart/form-data"
 } 
 });
 setShowChangeProfilePictureModal(false);
 setNewProfilePicture(null);
 fetchAllData();
 } catch (err) {
 setProfileError(err.response?.data?.message || "Error updating profile picture");
 }
 };

 const handleLogOut = () => {
 localStorage.removeItem("token");
 navigate("/login");
 };

 const handleFollow = async () => {
 if (!token) {
 alert("You must be logged in to follow or unfollow!");
 return navigate("/login");
 }
 try {
 if (isFollowing) {
 await API.post(`/users/profile/${username}/unfollow`, {}, { headers: { Authorization: `Bearer ${token}` } });
 setIsFollowing(false);
 setUser((prevUser) => ({
 ...prevUser,
 followers: prevUser.followers.filter((f) => f._id !== currentUser._id),
 }));
 } else {
 await API.post(`/users/profile/${username}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } });
 setIsFollowing(true);
 setUser((prevUser) => ({
 ...prevUser,
 followers: [...prevUser.followers, currentUser],
 }));
 }
 } catch (err) {
 setProfileError(err.response?.data?.message || "Error following/unfollowing");
 }
 };

 const handleDebateClick = (debateId) =>
 navigate(`/debatepage/${debateId}`, { state: { activeTab: "debate", fromProfile: username } });
 const handleDiscussionClick = (discussionId) =>
 navigate(`/discussionpage/${discussionId}`, { state: { activeTab: "discussion", fromProfile: username } });
 const handleBlogClick = (blogId) =>
 navigate(`/blogpage/${blogId}`, { state: { activeTab: "blogs", fromProfile: username } });

 const handleProfileClick = (username) => {
 setShowFollowers(false);
 setShowFollowing(false);
 navigate(`/profile/${username}?section=${activeTab}`);
 };

 const isOwnProfile = currentUser && user && currentUser._id === user._id;
 const totalPosts = (createdDebates.length || 0) + (createdDiscussions.length || 0) + (createdBlogs.length || 0);
 const followButtonText = isFollowing ? "Unfollow" : isFollower ? "Follow Back" : "Follow";

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 md:ml-64 flex items-center justify-center">
 <span className="text-xl text-gray-800 animate-pulse">Loading profile...</span>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 md:ml-64 text-gray-800">
 {profileError && (
 <div className="max-w-4xl mx-auto px-6 mt-6">
 <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-lg animate-fade-in">{profileError}</div>
 </div>
 )}

 <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 shadow-lg">
 <div className="max-w-4xl mx-auto px-6">
 <div className="flex flex-col items-center md:flex-row md:items-start md:justify-center gap-8">
 <div className="relative group">
 <img
 src={
 user?.profilePicture
 ? `${BACKEND_BASE_URL}${user.profilePicture}`
 : `${BACKEND_BASE_URL}/images/default-avatar.png`
 }
 alt="profile"
 className="w-40 h-40 rounded-full object-cover border-4 border-white bg-gradient-to-r from-yellow-400 to-pink-500 p-1 group-hover:scale-110 transition-transform duration-300 shadow-xl transform hover:rotate-3"
 onError={(e) => (e.target.src = `${BACKEND_BASE_URL}/images/default-avatar.png`)}
 />
 {isOwnProfile && (
 <button
 onClick={() => setShowChangeProfilePictureModal(true)}
 className="absolute bottom-2 right-2 p-2 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors duration-200 shadow-md"
 >
 <CameraIcon className="h-6 w-6" />
 </button>
 )}
 </div>
 <div className="text-center md:text-left">
 <div className="flex items-center justify-center md:justify-start mb-4">
 <h1 className="text-4xl font-extrabold text-white drop-shadow-md">{user?.username || "Loading..."}</h1>
 {isOwnProfile ? (
 <button
 onClick={() => setShowSettingsMenu(!showSettingsMenu)}
 className="ml-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200"
 >
 <CogIcon className="h-6 w-6 text-white" />
 </button>
 ) : (
 <div className="ml-4 flex space-x-3">
 <button
 onClick={handleFollow}
 className={`px-5 py-2 rounded-full text-white font-semibold shadow-md ${
 isFollowing ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
 } transition-all duration-200 transform hover:scale-105`}
 >
 {followButtonText}
 </button>
 </div>
 )}
 </div>
 {showSettingsMenu && isOwnProfile && (
 <div className="absolute mt-2 w-56 bg-white rounded-xl shadow-xl z-10 border border-gray-200 animate-fade-in">
 <ul className="py-2">
 <li
 className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-gray-800"
 onClick={() => {
 setShowChangeBioModal(true);
 setShowSettingsMenu(false);
 }}
 >
 <PencilIcon className="h-5 w-5 mr-2" />
 Change Bio
 </li>
 <li
 className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-gray-800"
 onClick={() => {
 setShowChangePasswordModal(true);
 setShowSettingsMenu(false);
 }}
 >
 <LockClosedIcon className="h-5 w-5 mr-2" />
 Change Password
 </li>
 <li
 className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-gray-800"
 onClick={handleLogOut}
 >
 <UserRemoveIcon className="h-5 w-5 mr-2" />
 Log Out
 </li>
 </ul>
 </div>
 )}
 <div className="flex justify-center md:justify-start space-x-10 mb-6">
 <div className="flex items-center group cursor-pointer hover:text-yellow-300 transition-all duration-200">
 <span className="font-semibold text-xl group-hover:scale-110 transition-transform duration-200">
 {totalPosts}
 </span>
 <span className="text-gray-200 ml-2">Posts</span>
 </div>
 <div
 onClick={() => setShowFollowers(true)}
 className="flex items-center group cursor-pointer hover:text-yellow-300 transition-all duration-200"
 >
 <span className="font-semibold text-xl group-hover:scale-110 transition-transform duration-200">
 {user?.followers?.length || 0}
 </span>
 <span className="text-gray-200 ml-2">Followers</span>
 </div>
 <div
 onClick={() => setShowFollowing(true)}
 className="flex items-center group cursor-pointer hover:text-yellow-300 transition-all duration-200"
 >
 <span className="font-semibold text-xl group-hover:scale-110 transition-transform duration-200">
 {user?.followings?.length || 0}
 </span>
 <span className="text-gray-200 ml-2">Following</span>
 </div>
 </div>
 <p className="text-gray-100 italic bg-white bg-opacity-10 p-3 rounded-lg shadow-inner text-center max-w-md mx-auto max-h-24 overflow-y-auto">
 {user?.bio || "No bio yet."}
 </p>
 </div>
 </div>
 </div>
 </header>

 <div className="max-w-4xl mx-auto px-6 py-8">
 <div className="flex justify-center space-x-10 border-b border-gray-200 pb-4 bg-white rounded-t-xl shadow-md">
 {["debate", "discussion", "blogs"].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`relative px-6 py-2 text-sm font-semibold uppercase ${
 activeTab === tab ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
 } transition-all duration-300 ease-in-out`}
 >
 {tab}
 {activeTab === tab && (
 <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full transform scale-x-100 transition-transform duration-300 ease-in-out"></span>
 )}
 </button>
 ))}
 </div>

 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white p-6 rounded-b-xl shadow-md"
 >
 {isOwnProfile && (
 <div className="col-span-full flex justify-end mb-4">
 {activeTab === "debate" && (
 <Link
 to="/createDebate"
 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md"
 >
 Create Debate
 </Link>
 )}
 {activeTab === "discussion" && (
 <Link
 to="/createDiscussion"
 className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-md"
 >
 Create Discussion
 </Link>
 )}
 {activeTab === "blogs" && (
 <Link
 to="/createBlog"
 className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-md"
 >
 Create Blog
 </Link>
 )}
 </div>
 )}

 {activeTab === "debate" && (
 createdDebates.length > 0 ? (
 createdDebates.map((deb) => (
 <div
 key={deb._id}
 className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg relative h-32 overflow-hidden"
 onClick={(e) => {
 if (!e.target.closest(".delete-menu-button") && !e.target.closest(".delete-menu")) {
 handleDebateClick(deb._id);
 }
 }}
 >
 <div className="flex justify-between items-start h-full">
 <div className="flex-1 overflow-hidden">
 <h3 className="text-sm font-semibold text-gray-900 truncate">{deb.title || "Untitled Debate"}</h3>
 <p className="text-gray-600 text-xs mt-1 line-clamp-3">{deb.openingArgument || "No opening argument"}</p>
 </div>
 {isOwnProfile && (
 <div className="relative">
 <button
 className="delete-menu-button p-1 hover:bg-gray-200 rounded-full"
 onClick={(e) => {
 e.stopPropagation();
 setShowDeleteMenu(showDeleteMenu === deb._id ? null : deb._id);
 }}
 >
 <span className="text-gray-600 text-lg leading-none">⋯</span>
 </button>
 {showDeleteMenu === deb._id && (
 <div className="delete-menu absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
 <button
 className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteDebate(deb._id);
 }}
 >
 Delete
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ))
 ) : (
 <p className="col-span-3 text-center text-gray-500">No debates created yet.</p>
 )
 )}
 {activeTab === "discussion" && (
 createdDiscussions.length > 0 ? (
 createdDiscussions.map((disc) => (
 <div
 key={disc._id}
 className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg relative h-32 overflow-hidden"
 onClick={(e) => {
 if (!e.target.closest(".delete-menu-button") && !e.target.closest(".delete-menu")) {
 handleDiscussionClick(disc._id);
 }
 }}
 >
 <div className="flex justify-between items-start h-full">
 <div className="flex-1 overflow-hidden">
 <h3 className="text-sm font-semibold text-gray-900 truncate">{disc.title || "Untitled Discussion"}</h3>
 <p className="text-gray-600 text-xs mt-1 line-clamp-3">{disc.description || "No description"}</p>
 </div>
 {isOwnProfile && (
 <div className="relative">
 <button
 className="delete-menu-button p-1 hover:bg-gray-200 rounded-full"
 onClick={(e) => {
 e.stopPropagation();
 setShowDeleteMenu(showDeleteMenu === disc._id ? null : disc._id);
 }}
 >
 <span className="text-gray-600 text-lg leading-none">⋯</span>
 </button>
 {showDeleteMenu === disc._id && (
 <div className="delete-menu absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
 <button
 className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteDiscussion(disc._id);
 }}
 >
 Delete
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ))
 ) : (
 <p className="col-span-3 text-center text-gray-500">No discussions created yet.</p>
 )
 )}
 {activeTab === "blogs" && (
 createdBlogs.length > 0 ? (
 createdBlogs.map((blog) => (
 <div
 key={blog._id}
 className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-4 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg relative h-48 overflow-hidden"
 onClick={(e) => {
 if (!e.target.closest(".delete-menu-button") && !e.target.closest(".delete-menu")) {
 handleBlogClick(blog._id);
 }
 }}
 >
 <div className="flex justify-between items-start h-full flex-col">
 <div className="flex-1 w-full overflow-hidden">
 <h3 className="text-sm font-semibold text-gray-900 truncate">{blog.title || "Untitled Blog"}</h3>
 <p className="text-gray-600 text-xs mt-1 line-clamp-2">{blog.content || "No content"}</p>
 </div>
 {blog.fileUrl && blog.fileUrl.match(/\.(jpeg|jpg|png)$/i) && (
 <img
 src={`${BACKEND_BASE_URL}${blog.fileUrl}`}
 alt="Blog media"
 className="w-full h-20 object-cover rounded-lg mt-2 hover:opacity-90 transition -opacity duration-200 shadow-sm"
 />
 )}
 {isOwnProfile && (
 <div className="relative self-end mt-2">
 <button
 className="delete-menu-button p-1 hover:bg-gray-200 rounded-full"
 onClick={(e) => {
 e.stopPropagation();
 setShowDeleteMenu(showDeleteMenu === blog._id ? null : blog._id);
 }}
 >
 <span className="text-gray-600 text-lg leading-none">⋯</span>
 </button>
 {showDeleteMenu === blog._id && (
 <div className="delete-menu absolute bottom-5 right-3 mt-0 w-32 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
 <button
 className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteBlog(blog._id);
 }}
 >
 Delete
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ))
 ) : (
 <p className="col-span-3 text-center text-gray-500">No blogs yet.</p>
 )
 )}
 </motion.div>
 </div>

 {showFollowers && (
 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
 <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-fade-in border-t-4 border-blue-500">
 <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Followers</h2>
 {user?.followers?.length > 0 ? (
 <ul className="space-y-4">
 {user.followers.map((follower) => (
 <li
 key={follower._id}
 className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 shadow-sm"
 onClick={() => handleProfileClick(follower.username)}
 >
 <img
 src={
 follower.profilePicture
 ? `${BACKEND_BASE_URL}${follower.profilePicture}`
 : `${BACKEND_BASE_URL}/images/default-avatar.png`
 }
 alt={follower.username}
 className="w-12 h-12 rounded-full border-2 border-blue-300 shadow-sm"
 />
 <span className="text-sm font-semibold text-gray-900">{follower.username}</span>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-center text-gray-500">No followers yet.</p>
 )}
 <button
 onClick={() => setShowFollowers(false)}
 className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md"
 >
 Close
 </button>
 </div>
 </div>
 )}

 {showFollowing && (
 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
 <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-fade-in border-t-4 border-purple-500">
 <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Following</h2>
 {user?.followings?.length > 0 ? (
 <ul className="space-y-4">
 {user.followings.map((following) => (
 <li
 key={following._id}
 className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 shadow-sm"
 onClick={() => handleProfileClick(following.username)}
 >
 <img
 src={
 following.profilePicture
 ? `${BACKEND_BASE_URL}${following.profilePicture}`
 : `${BACKEND_BASE_URL}/images/default-avatar.png`
 }
 alt={following.username}
 className="w-12 h-12 rounded-full border-2 border-purple-300 shadow-sm"
 />
 <span className="text-sm font-semibold text-gray-900">{following.username}</span>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-center text-gray-500">Not following anyone yet.</p>
 )}
 <button
 onClick={() => setShowFollowing(false)}
 className="mt-6 w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-md"
 >
 Close
 </button>
 </div>
 </div>
 )}

 {showChangeBioModal && (
 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
 <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in border-t-4 border-blue-500">
 <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Change Bio</h2>
 <textarea
 value={newBio}
 onChange={(e) => setNewBio(e.target.value)}
 className="w-full p-4 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
 rows="4"
 placeholder="Enter your new bio..."
 maxLength={100}
 />
 <p className="text-sm text-gray-500 mt-1">{newBio.length}/100 characters</p>
 <div className="flex space-x-4 mt-6">
 <button
 onClick={handleChangeBio}
 className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md transform hover:scale-105"
 >
 Save
 </button>
 <button
 onClick={() => setShowChangeBioModal(false)}
 className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 {showChangePasswordModal && (
 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
 <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in border-t-4 border-purple-500">
 <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Change Password</h2>
 <input
 type="password"
 value={oldPassword}
 onChange={(e) => setOldPassword(e.target.value)}
 placeholder="Old Password"
 className="w-full p-4 mb-4 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
 />
 <input
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 placeholder="New Password"
 className="w-full p-4 mb-4 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
 />
 <div className="flex space-x-4 mt-6">
 <button
 onClick={handleChangePassword}
 className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-md transform hover:scale-105"
 >
 Save
 </button>
 <button
 onClick={() => {
 setShowChangePasswordModal(false);
 setOldPassword("");
 setNewPassword("");
 setProfileError("");
 }}
 className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 {showChangeProfilePictureModal && (
 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
 <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-fade-in border-t-4 border-purple-500">
 <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Change Profile Picture</h2>
 <input
 type="file"
 accept="image/*"
 onChange={(e) => setNewProfilePicture(e.target.files[0])}
 className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 shadow-sm"
 />
 <div className="flex space-x-4 mt-6">
 <button
 onClick={handleChangeProfilePicture}
 className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-200 shadow-md transform hover:scale-105"
 >
 Upload
 </button>
 <button
 onClick={() => setShowChangeProfilePictureModal(false)}
 className="flex-1 bg-gray- 200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-md"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default ProfilePage;