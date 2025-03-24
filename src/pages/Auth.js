import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axiosInstance";

const Auth = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", identifier: "" });
  const [otp, setOtp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [isVerifyMode, setIsVerifyMode] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // New state for forgot password
  const [forgotEmail, setForgotEmail] = useState(""); // New state for email input
  const [message, setMessage] = useState(""); // For displaying messages
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      try {
        const endpoint = isLogin ? "/auth/login" : "/auth/signup";
        const payload = isLogin
          ? { identifier: form.identifier, password: form.password }
          : { username: form.username, email: form.email, password: form.password };
        const { data } = await API.post(endpoint, payload);
        if (!isLogin) {
          setEmailForOtp(form.email);
          setIsOtpSent(true);
          setMessage("OTP sent to your email for verification.");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("name", data.username || "User");
          window.dispatchEvent(new Event("storageUpdate"));
          setSuccess(true);
          setTimeout(() => navigate("/"), 1500);
        }
      } catch (error) {
        console.error("Error in authentication:", error.response?.data || error.message);
        if (error.response?.status === 401 && error.response?.data?.message === "Please verify your email first") {
          setEmailForOtp(form.identifier);
          setIsVerifyMode(true);
          setMessage("Please verify your email first.");
        } else {
          setMessage(error.response?.data?.message || "Authentication failed!");
        }
      } finally {
        setLoading(false);
      }
    },
    [form, isLogin, navigate]
  );

  const handleRequestOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      await API.post("/auth/request-verification-otp", { identifier: form.identifier });
      setEmailForOtp(form.identifier);
      setIsOtpSent(true);
      setIsVerifyMode(false);
      setMessage("OTP sent to your email for verification.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      await API.post("/auth/verify-email", { email: emailForOtp, otp });
      const { data } = await API.post("/auth/login", {
        identifier: emailForOtp,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.username || "User");
      window.dispatchEvent(new Event("storageUpdate"));
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("OTP verification or login error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "OTP Verification or Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    if (!forgotEmail) {
      setMessage("Please enter your email.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await API.post("/auth/request-password-reset", { email: forgotEmail });
      setEmailForOtp(forgotEmail);
      setIsOtpMode(true);
      setIsForgotPassword(false);
      setMessage("OTP sent to your email for password reset.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage("");
    try {
      await API.post("/auth/reset-password", { email: emailForOtp, otp, newPassword: form.password });
      setSuccess(true);
      setTimeout(() => {
        setIsOtpMode(false);
        setSuccess(false);
        setForm({ username: "", email: "", password: "", identifier: "" });
        setOtp("");
        setForgotEmail("");
        navigate("/"); // Redirect to home or reset to login
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Password Reset Failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setForm({ username: "", email: "", password: "", identifier: "" });
    setMessage("");
    setIsForgotPassword(false);
    setForgotEmail("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm sm:max-w-md md:ml-64"
      >
        {message && <p className="text-red-500 text-center mb-4">{message}</p>}
        {success ? (
          <div className="text-green-500 text-center">
            <p>Success! Redirecting...</p>
          </div>
        ) : isOtpSent ? (
          <>
            <h2 className="text-xl font-bold text-gray-800">Verify OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className="w-full px-3 py-2 border rounded-xl mt-4"
            />
            <button
              onClick={handleVerifyOtp}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </>
        ) : isOtpMode ? (
          <>
            <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className="w-full px-3 py-2 border rounded-xl mt-4"
            />
            <input
              type="password"
              placeholder="New Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl mt-4"
            />
            <button
              onClick={handleResetPassword}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded-xl"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <p
              className="text-center text-blue-500 cursor-pointer mt-4"
              onClick={() => {
                setIsOtpMode(false);
                setForgotEmail("");
                setOtp("");
              }}
            >
              Back to Login
            </p>
          </>
        ) : isVerifyMode ? (
          <>
            <h2 className="text-xl font-bold text-gray-800">Verify Your Email</h2>
            <p className="text-sm text-gray-600 mt-2">Your email is not verified. Please enter your email or username to receive an OTP.</p>
            <input
              type="text"
              name="identifier"
              placeholder="Enter your email or username"
              value={form.identifier}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl mt-4"
              required
            />
            <button
              onClick={handleRequestOtp}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-xl"
              disabled={loading || !form.identifier}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <p
              className="text-center text-yellow-500 cursor-pointer mt-4"
              onClick={() => setIsVerifyMode(false)}
            >
              Back to Login
            </p>
          </>
        ) : isForgotPassword ? (
          <>
            <h2 className="text-xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-sm text-gray-600 mt-2">Enter your email to receive a password reset OTP.</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl mt-4"
            />
            <button
              onClick={handleSendResetOtp}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-xl"
              disabled={loading || !forgotEmail}
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
            <p
              className="text-center text-yellow-500 cursor-pointer mt-4"
              onClick={() => setIsForgotPassword(false)}
            >
              Back to Login
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-4">
              {isLogin ? "Welcome Back" : "Create Account"}
              <span className="text-yellow-400">!</span>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Enter your email or username"
                    value={form.identifier}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-xl"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-xl"
              >
                {loading ? "Processing..." : isLogin ? "Login" : "Register"}
              </button>
            </form>
            <p className="text-center text-yellow-500 cursor-pointer mt-4" onClick={toggleMode}>
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </p>
            {isLogin && (
              <p
                className="text-center text-blue-500 cursor-pointer mt-2"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot Password?
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;