import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MailIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline";

const Support = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const { name, email, message } = form;
    const subject = encodeURIComponent("Support Request from " + name);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoUrl = `mailto:debatify08@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  }, [form]);

  const faqs = [
    {
      question: "How do I create a Debate, Discussion, or Blog?",
      answer:
        "To create a Debate, Discussion, or Blog, log in to your account, navigate to the respective section, click on 'Start a Debate/Discussion/Blog', fill out the form with the details, and submit.",
    },
    {
      question: "Can I vote or comment without logging in?",
      answer:
        "No, you need to be logged in to vote or comment on Debates, Discussions, or Blogs. Please log in or register to participate.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "You can change your password anytime from your Profile Settings.If you've forgotten your password, use the Forgot password option on the login page to reset it.For further assistance, feel free to contact us at debatify08@gmail.com."
    },
    {
      question: "Why can’t I see some Debates, Discussions, or Blogs?",
      answer:
        "If you can’t see Debates, Discussions, or Blogs, ensure you’re logged in. If the issue persists, there may be no content available, or there might be a server issue. Contact support for help.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col">
      <div className="lg:ml-64 flex-1">
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
            Get <span className="text-yellow-300">Support</span> for Debates, Discussions, and Blogs
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
                Please complete the email in your email client.
              </p>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                If your email client doesn't open, please send an email to debatify08@gmail.com with your message.
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-700"
                >
                  Send Message
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
              href="mailto:debatify08@gmail.com"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              debatify08@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
