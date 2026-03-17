import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/solid";

// ── Typewriter (kept, no API deps) ──────────────────────────────
const TypewriterText = ({ texts }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentIndex];
    const handleTyping = () => {
      if (!isDeleting && charIndex < text.length) {
        setCurrentText(text.substring(0, charIndex + 1));
        setCharIndex(c => c + 1);
      } else if (isDeleting && charIndex > 0) {
        setCurrentText(text.substring(0, charIndex - 1));
        setCharIndex(c => c - 1);
      } else if (!isDeleting && charIndex === text.length) {
        setTimeout(() => setIsDeleting(true), 1400);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setCurrentIndex(i => (i + 1) % texts.length);
      }
    };
    const timer = setTimeout(handleTyping, isDeleting ? 45 : 95);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentIndex, texts]);

  return (
    <span className="relative">
      <span style={{ color: "#D97706" }}>{currentText}</span>
      <span className="animate-pulse" style={{ color: "#D97706" }}>|</span>
    </span>
  );
};

// ── Floating orb background ──────────────────────────────────────
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { w: 600, h: 600, top: "-15%", left: "-10%", color: "rgba(99,102,241,0.07)", dur: "18s" },
      { w: 500, h: 500, top: "40%",  left: "60%",  color: "rgba(236,72,153,0.05)", dur: "22s" },
      { w: 400, h: 400, top: "70%",  left: "5%",   color: "rgba(217,119,6,0.05)",  dur: "16s" },
      { w: 300, h: 300, top: "15%",  left: "75%",  color: "rgba(16,185,129,0.05)", dur: "20s" },
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
          animation: `floatOrb ${orb.dur} ease-in-out infinite alternate`,
          animationDelay: `${i * 2.5}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes floatOrb {
        0%   { transform: translate(0, 0) scale(1); }
        100% { transform: translate(30px, 20px) scale(1.06); }
      }
    `}</style>
  </div>
);

// ── Noise texture overlay ─────────────────────────────────────────
const NoiseOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.02]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "128px",
    }}
  />
);

// ── Section card data ─────────────────────────────────────────────
const SECTIONS = [
  {
    to: "/debate",
    emoji: "⚔️",
    label: "Debates",
    tagline: "Take a stand. Defend it.",
    desc: "Structured head-to-head arguments on the topics that divide us. Pick your side and make your case.",
    accent: "#6366F1",
    bg: "rgba(99,102,241,0.05)",
    border: "rgba(99,102,241,0.18)",
    hoverBorder: "#6366F1",
    stat: "1,200+ debates",
  },
  {
    to: "/discussion",
    emoji: "💬",
    label: "Discussions",
    tagline: "Think out loud, together.",
    desc: "Open-ended conversations where every perspective matters. No sides — just ideas flowing freely.",
    accent: "#10B981",
    bg: "rgba(16,185,129,0.05)",
    border: "rgba(16,185,129,0.18)",
    hoverBorder: "#10B981",
    stat: "3,400+ threads",
  },
  {
    to: "/blog",
    emoji: "✍️",
    label: "Blogs",
    tagline: "Write. Publish. Inspire.",
    desc: "Long-form thoughts, essays, and stories from voices across the community. Read deeply or write boldly.",
    accent: "#EC4899",
    bg: "rgba(236,72,153,0.05)",
    border: "rgba(236,72,153,0.18)",
    hoverBorder: "#EC4899",
    stat: "800+ articles",
  },
];

// ── How it works steps ────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Create an account", body: "Sign up in seconds. No gatekeeping — your voice belongs here from day one." },
  { n: "02", title: "Pick your arena",   body: "Step into Debates for structured arguments, Discussions for open thought, or Blogs for deep dives." },
  { n: "03", title: "Engage & grow",     body: "Comment, upvote, follow thinkers you respect, and watch your perspective sharpen with every exchange." },
];

// ─────────────────────────────────────────────────────────────────
const Home = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div
      className="min-h-screen md:ml-64 overflow-x-hidden"
      style={{
        background: "#FFFFFF",
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        color: "#1A1830",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
        style={{ background: "#F8F7FF" }}
      >
        <FloatingOrbs />
        <NoiseOverlay />

        {/* grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl mx-auto">
          {/* pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", color: "#D97706" }}
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            Where ideas clash and clarity emerges
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Sora', sans-serif", lineHeight: 1.08 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight"
          >
            <span style={{ color: "#1A1830" }}>Welcome to{" "}</span>
            <br className="hidden sm:block" />
            <span
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Debatify
            </span>
          </motion.h1>

          {/* typewriter sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl md:text-2xl mb-4 font-light"
            style={{ color: "#5E5A74" }}
          >
            Discover{" "}
            <TypewriterText texts={["Debates that ignite.", "Discussions that matter.", "Blogs that inspire."]} />
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "#8B87A3" }}
          >
            A community where every opinion has a stage, every argument has a challenger, and every reader leaves thinking differently.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/login"
              className="group relative px-8 py-3.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)", color: "white", boxShadow: "0 0 30px rgba(99,102,241,0.25)" }}
            >
              <span className="relative z-10">Get Started Free →</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #4F46E5, #9333EA)" }} />
            </Link>
            <Link
              to="/debate"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-black/5"
              style={{ border: "1px solid rgba(0,0,0,0.12)", color: "#5E5A74" }}
            >
              Explore without signing up
            </Link>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "#C4C0D8" }}
        >
          <span className="text-[10px] uppercase tracking-widest">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-0.5 h-8 rounded-full"
            style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.5), transparent)" }}
          />
        </motion.div>
      </section>

      {/* ══ SECTION CARDS ════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#A09DB8" }}>
              Three arenas. One community.
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A1830" }}>
              Pick your battlefield
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {SECTIONS.map((sec, i) => (
              <motion.div
                key={sec.to}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Link
                  to={sec.to}
                  className="group block h-full rounded-2xl p-6 transition-all duration-300"
                  style={{
                    background: sec.bg,
                    border: `1px solid ${sec.border}`,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = sec.hoverBorder}
                  onMouseLeave={e => e.currentTarget.style.borderColor = sec.border}
                >
                  <div className="text-4xl mb-4">{sec.emoji}</div>
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: sec.accent }}
                  >
                    {sec.stat}
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: "#1A1830" }}>
                    {sec.label}
                  </h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: sec.accent }}>
                    {sec.tagline}
                  </p>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "#8B87A3" }}>
                    {sec.desc}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 group-hover:gap-3"
                    style={{ color: sec.accent }}
                  >
                    Explore {sec.label} →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section
        className="py-20 px-6"
        style={{ background: "#F8F7FF", borderTop: "1px solid rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#A09DB8" }}>Simple by design</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A1830" }}>How Debatify works</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-5 left-full w-full h-px -translate-x-6"
                    style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.2), transparent)" }}
                  />
                )}
                <div
                  className="text-4xl font-extrabold mb-4 leading-none"
                  style={{ fontFamily: "'DM Mono', monospace", color: "rgba(99,102,241,0.12)" }}
                >
                  {step.n}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1830" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8B87A3" }}>{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MANIFESTO QUOTE ═════════════════════════════════════ */}
      <section className="py-24 px-6 text-center relative overflow-hidden" style={{ background: "#FFFFFF" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)" }}
        />
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <p
            className="text-2xl md:text-3xl font-light leading-relaxed mb-6"
            style={{ color: "#3D3A52", fontStyle: "italic" }}
          >
            "The strength of an argument is not in silencing opposition — it's in surviving it."
          </p>
          <footer className="text-xs uppercase tracking-widest" style={{ color: "#C4C0D8" }}>
            The Debatify Manifesto
          </footer>
        </motion.blockquote>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════ */}
      <section
        className="py-20 px-6 text-center"
        style={{ borderTop: "1px solid rgba(0,0,0,0.05)", background: "#F8F7FF" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1A1830" }}>
            Your perspective{" "}
            <span style={{ color: "#6366F1" }}>deserves an audience.</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: "#8B87A3" }}>
            Join thousands of thinkers already challenging assumptions, building arguments, and inspiring change.
          </p>
          <Link
            to="/login"
            className="inline-block px-10 py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6366F1, #A855F7)",
              color: "white",
              boxShadow: "0 0 40px rgba(99,102,241,0.2)",
            }}
          >
            Join Debatify — it's free
          </Link>
          <p className="mt-4 text-xs" style={{ color: "#C4C0D8" }}>
            Already a member?{" "}
            <Link to="/login" className="hover:text-indigo-500 transition-colors" style={{ color: "#A09DB8" }}>
              Sign in →
            </Link>
          </p>
        </motion.div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════ */}
      <footer
        className="py-8 px-6 text-center text-xs"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#C4C0D8", background: "#FFFFFF" }}
      >
        © {new Date().getFullYear()} Debatify. Built for thinkers, arguers, and curious minds.
      </footer>
    </div>
  );
};

export default Home;