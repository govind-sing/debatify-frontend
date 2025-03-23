import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MailIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline";

const Support = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting support request:", error);
      alert("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const faqs = [
    {
      question: "How do I create a Discussion?",
      answer:
        "To create a Discussion, log in to your account, click on 'Start a Discussion' from the homepage or navbar, fill out the form with your Discussion details, and submit.",
    },
    {
      question: "Can I vote or comment without logging in?",
      answer:
        "No, you need to be logged in to vote or comment on Discussions. Please log in or register to participate.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Password reset is not yet implemented. Please contact support at support@debatify.com, and we’ll assist you.",
    },
    {
      question: "Why can’t I see some Discussions?",
      answer:
        "If you can’t see Discussions, ensure you’re logged in. If the issue persists, there may be no Discussions available, or there might be a server issue. Contact support for help.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col">
      {/* Top Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-12 px-4 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block"
        >
          <MailIcon className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-gray-800">
          Get <span className="text-yellow-300">Support</span>
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto text-gray-600">
          We’re here to help! Reach out with your questions or concerns.
        </p>
      </motion.div>

      {/* FAQ Section */}
      <div className="px-4 py-8 sm:p-10 max-w-3xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-5"
            >
              <div className="flex items-start space-x-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="px-4 py-8 sm:p-10 max-w-3xl mx-auto w-full">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <MailIcon className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-semibold text-green-600">
              Message Sent Successfully!
            </p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              We’ll get back to you soon.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-28 resize-none"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                transition={{ duration: 0.3 }}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-md ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-600 hover:to-purple-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Contact Information */}
      <div className="px-4 py-8 sm:p-10 max-w-3xl mx-auto w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6"
        >
          Contact Us Directly
        </motion.h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Email us at{" "}
          <a
            href="mailto:support@debatify.com"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            support@debatify.com
          </a>{" "}
          or call us at{" "}
          <a
            href="tel:+1234567890"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            +1 (234) 567-890
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Support;