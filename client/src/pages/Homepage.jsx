import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

// Heroicons for Dashboard Stats
import {
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  LightBulbIcon,
  ChartPieIcon,
  RocketLaunchIcon,
  BoltIcon,
  StarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

const Homepage = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetched dashboard stats
  const [summary, setSummary] = useState({
    totalAssessments: 0,
    totalCorrect: 0,
    totalWrong: 0,
    avgTimeSec: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(
          "https://quiz-mu-dun.vercel.app/api/results/summary"
        );
        setSummary(data.summary);
      } catch (_) {
        // ignore
      }
    };
    load();
  }, []);

  const fmtAvg = (sec) => {
    if (!sec || sec <= 0) return "0.0s";
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  const dashboardStats = [
    {
      title: "Tests Taken",
      value: String(summary.totalAssessments || 0),
      Icon: TrophyIcon,
      color: "purple",
      bg: "from-purple-100 to-pink-100",
    },
    {
      title: "Correct Answers",
      value: String(summary.totalCorrect || 0),
      Icon: CheckCircleIcon,
      color: "emerald",
      bg: "from-emerald-100 to-teal-100",
    },
    {
      title: "Wrong Answers",
      value: String(summary.totalWrong || 0),
      Icon: XCircleIcon,
      color: "rose",
      bg: "from-rose-100 to-orange-100",
    },
    {
      title: "Avg Time Spent",
      value: fmtAvg(summary.avgTimeSec || 0),
      Icon: ClockIcon,
      color: "indigo",
      bg: "from-indigo-100 to-blue-100",
    },
  ];

  const features = [
    {
      Icon: LightBulbIcon,
      title: "Cognitive Enhancement",
      description:
        "Scientifically designed quizzes to boost your mental agility and cognitive performance",
      color: "violet",
    },
    {
      Icon: ChartPieIcon,
      title: "Progress Tracking",
      description:
        "Visual analytics and detailed insights to monitor your learning journey",
      color: "emerald",
    },
    {
      Icon: RocketLaunchIcon,
      title: "Personalized Learning",
      description:
        "Adaptive assessments that match your skill level and learning pace",
      color: "rose",
    },
    {
      Icon: BoltIcon,
      title: "Instant Results",
      description:
        "Get immediate feedback and detailed explanations for every question",
      color: "amber",
    },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const cardHover = {
    hover: {
      y: -12,
      scale: 1.03,
      boxShadow: "0 25px 50px rgba(139, 92, 246, 0.1)",
      transition: { duration: 0.3 },
    },
  };

  const glowEffect = {
    hover: {
      boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-violet-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                NeuroQuiz
              </span>
            </motion.div>

            {/* Navigation Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/practice")}
                className="px-8 py-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold rounded-2xl hover:from-rose-500 hover:to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Practice Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/assessment/selection")}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-2xl hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Take Assessment
              </motion.button>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-3 border-gradient-to-r from-violet-300 to-pink-300 hover:from-violet-400 hover:to-pink-400 transition-all duration-300 shadow-lg p-1.5"
              >
                <img
                  src={
                    user?.photoUrl ||
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ8AAACUCAMAAAC6AgsRAAAAaVBMVEX///8uNDb7+/sDExcoLzHq6upUWFkrMTMAAADn5+gjKiwfJykVHiH09PQ8QUMcJCfNzs5zdnfFxsdFSksNGBvZ2tpMUVK4ubo0Ojytr6+anJ1laGmOkJFrbnDS1NQABg1/gYKipKVcX2HRbAoPAAAElElEQVR4nO2ci7aiMAxFBQqFtlB5CMhDkP//yMFxOV7nqrcNJXXNsL/grLRN0+TAbrex8a/g/sa2imfEp6rrcyI8wfK+qfaxbUEPnNLAKQQnlDoOJVwUdBpPtkXdiBo5MOI8QtjAz5FtaTNxlxTUeQYtks72MrvHWv4dui9BlHVl9bT46fA8dn8UDqNvT94pl2/VXZD5wZa8Kny9tF9DmNmRd5Tv1/YGZZUVeaGSuguhBYEZU5bnOGyPLS/6lpHfQShyqo5LnfDNp3jCzYPNz4nlEXHElHdiakf3DqWYaXDSDd8cwBRP3l49tdwJ8Y5Ir3c4rvARS96p1t19F2iCtQMbAZCHd4TdXCc132FIOTCCnI4LIU4pWHlAfR5OmZByoD6OkwJL2Pabq4QSQ16cQLLLBZpgPOcOoOz3W1+NcYXsgeouYPQUMmj45gBivJQ2fctYsv8wnklLzi9GBeN/eP7b5WB9OYa8j79/jwVQX4FToH56/Qetn0mJ1EOAvj8aHHnQ91uNNnFoIQtMWix5uwOof4DYgAn0UyCf8OTtDvr9K4Laxu90G1gS6/BecRO9FhFLkOdIB73+s4M+pDnqJGlhYcBwVm9zeKjN5xvNi7nq39AC92z84ciV5m/cSvQuVPXPeZrXVqZvV6JAvA8hFYHdIX+TvDvHIjlbVTcTpeGLOSuVYfoJDgl/zOW3fUi5zK27I25EVS9DwegNJkLeV58QuxtuvG/aMknquk6SvG1O8Se6nFw/OkT+p6zqxsbGxv+LG/s/Etu5SS5+2LFvp+AnprYfuwrz+eZG+zHxhOSMERUY40IUZXfyMSIZV2M9vPF0voIJLxmrte/maKwZh/bvCWd1t2bVlb2slVWhYhjXGiJFLdG3NX1H0nSNPrk/hhDX0DN4aN7UW5WwpvhzisDsJDNOPagp4jnEGw0e5UNgYuM9IiZjOTsjpnbeVxg1dJDPYllOeQWVRhpHa8mbN6EJR1sHnVaqsLwzeF5T3nydLIxgZTLrPRW4KBHu6Vp77wZZ4plwV0ksjzAHXBW6LdRpoAPcGH00f2s8gwO3YOStvfmuUAmrWVOc8M0VIWiFK4zNd4UDRhDxtP7ZvcEm/WIL7CKGUOgHkJgtSN9DHF15GWb4HMfTzDEuyEICR9d8ArPgwNE17wAtTHAKvUFdgru88wJreRfBFjo4WuY79OXVXOAJe3nnO0TjBMMtunBorn7HLbFgg/VpZBikwvQRjSLGwvHQsX+6I17pd0d2qvriFq/0u8N61QMSg7+AWqRPuUj1kYuDKyRXvUEiYkMfrZX1abtLjegjqs9MS/rYpm/Tt+l7qY8r67OT/xzV/OcDP5BZhvr9Yak+aJULaG33vwnU66vd0Ur9pz4KgX9iCYcmGl1exN7kDZ335S4b0PUNWtPWADuAmp8nZdgvOKnZoOxwBWp/WxgrfJpgDqn/eVKU421BXgL8MFGCNj/KQQOuqEQRSEUAdBPFjVh/E0p5htsC98Gwaq1KWTgt++p2n+bi8uNQ89IIF7JMl5uIoqzpc154ZilY3p8zU2ZFdw0MadvYWI9fhfNXEpU96GQAAAAASUVORK5CYII="
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-4 w-64 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-violet-100 py-3 z-50"
                  >
                    <div className="px-6 py-4 border-b border-violet-100">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            user?.photoUrl ||
                            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ8AAACUCAMAAAC6AgsRAAAAaVBMVEX///8uNDb7+/sDExcoLzHq6upUWFkrMTMAAADn5+gjKiwfJykVHiH09PQ8QUMcJCfNzs5zdnfFxsdFSksNGBvZ2tpMUVK4ubo0Ojytr6+anJ1laGmOkJFrbnDS1NQABg1/gYKipKVcX2HRbAoPAAAElElEQVR4nO2ci7aiMAxFBQqFtlB5CMhDkP//yMFxOV7nqrcNJXXNsL/grLRN0+TAbrex8a/g/sa2imfEp6rrcyI8wfK+qfaxbUEPnNLAKQQnlDoOJVwUdBpPtkXdiBo5MOI8QtjAz5FtaTNxlxTUeQYtks72MrvHWv4dui9BlHVl9bT46fA8dn8UDqNvT94pl2/VXZD5wZa8Kny9tF9DmNmRd5Tv1/YGZZUVeaGSuguhBYEZU5bnOGyPLS/6lpHfQShyqo5LnfDNp3jCzYPNz4nlEXHElHdiakf3DqWYaXDSDd8cwBRP3l49tdwJ8Y5Ir3c4rvARS96p1t19F2iCtQMbAZCHd4TdXCc132FIOTCCnI4LIU4pWHlAfR5OmZByoD6OkwJL2Pabq4QSQ16cQLLLBZpgPOcOoOz3W1+NcYXsgeouYPQUMmj45gBivJQ2fctYsv8wnklLzi9GBeN/eP7b5WB9OYa8j79/jwVQX4FToH56/Qetn0mJ1EOAvj8aHHnQ91uNNnFoIQtMWix5uwOof4DYgAn0UyCf8OTtDvr9K4Laxu90G1gS6/BecRO9FhFLkOdIB73+s4M+pDnqJGlhYcBwVm9zeKjN5xvNi7nq39AC92z84ciV5m/cSvQuVPXPeZrXVqZvV6JAvA8hFYHdIX+TvDvHIjlbVTcTpeGLOSuVYfoJDgl/zOW3fUi5zK27I25EVS9DwegNJkLeV58QuxtuvG/aMknquk6SvG1O8Se6nFw/OkT+p6zqxsbGxv+LG/s/Etu5SS5+2LFvp+AnprYfuwrz+eZG+zHxhOSMERUY40IUZXfyMSIZV2M9vPF0voIJLxmrte/maKwZh/bvCWd1t2bVlb2slVWhYhjXGiJFLdG3NX1H0nSNPrk/hhDX0DN4aN7UW5WwpvhzisDsJDNOPagp4jnEGw0e5UNgYuM9IiZjOTsjpnbeVxg1dJDPYllOeQWVRhpHa8mbN6EJR1sHnVaqsLwzeF5T3nydLIxgZTLrPRW4KBHu6Vp77wZZ4plwV0ksjzAHXBW6LdRpoAPcGH00f2s8gwO3YOStvfmuUAmrWVOc8M0VIWiFK4zNd4UDRhDxtP7ZvcEm/WIL7CKGUOgHkJgtSN9DHF15GWb4HMfTzDEuyEICR9d8ArPgwNE17wAtTHAKvUFdgru88wJreRfBFjo4WuY79OXVXOAJe3nnO0TjBMMtunBorn7HLbFgg/VpZBikwvQRjSLGwvHQsX+6I17pd0d2qvriFq/0u8N61QMSg7+AWqRPuUj1kYuDKyRXvUEiYkMfrZX1abtLjegjqs9MS/rYpm/Tt+l7qY8r67OT/xzV/OcDP5BZhvr9Yak+aJULaG33vwnU66vd0Ur9pz4KgX9iCYcmGl1exN7kDZ335S4b0PUNWtPWADuAmp8nZdgvOKnZoOxwBWp/WxgrfJpgDqn/eVKU421BXgL8MFGCNj/KQQOuqEQRSEUAdBPFjVh/E0p5htsC98Gwaq1KWTgt++p2n+bi8uNQ89IIF7JMl5uIoqzpc154ZilY3p8zU2ZFdw0MadvYWI9fhfNXEpU96GQAAAAASUVORK5CYII="
                          }
                          alt="avatar"
                          className="w-12 h-12 rounded-xl border-2 border-violet-200"
                        />
                        <div>
                          <div className="text-slate-800 font-bold text-lg">
                            {user?.name || "User"}
                          </div>
                          <div className="text-slate-600 text-sm">
                            {user?.email}
                          </div>
                          {user?.gender && (
                            <div className="text-violet-600 text-xs font-medium capitalize">
                              {user.gender}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <motion.button
                        whileHover={{
                          x: 5,
                          backgroundColor: "rgb(245 243 255)",
                        }}
                        onClick={() => navigate("/results")}
                        className="w-full text-left px-6 py-3 text-slate-700 font-medium flex items-center gap-3 transition-all duration-200"
                      >
                        <ChartBarIcon className="w-5 h-5 text-violet-500" />
                        Previous Results
                      </motion.button>
                      <motion.button
                        whileHover={{
                          x: 5,
                          backgroundColor: "rgb(245 243 255)",
                        }}
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-6 py-3 text-slate-700 font-medium flex items-center gap-3 transition-all duration-200"
                      >
                        <AcademicCapIcon className="w-5 h-5 text-violet-500" />
                        Profile Settings
                      </motion.button>
                      <motion.button
                        whileHover={{
                          x: 5,
                          backgroundColor: "rgb(254 242 242)",
                        }}
                        onClick={() => navigate("/logout")}
                        className="w-full text-left px-6 py-3 text-slate-700 font-medium flex items-center gap-3 transition-all duration-200"
                      >
                        <ArrowRightIcon className="w-5 h-5 text-rose-500 rotate-180" />
                        Logout
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4 flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/practice")}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
            >
              Practice Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/assessment/selection")}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
            >
              Assessment
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-100/50 via-white to-rose-100/50 py-10 px-4 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-violet-300 to-purple-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full opacity-20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col lg:flex-row items-center gap-16"
          >
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              {/* <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 font-bold rounded-full text-sm mb-4 border border-violet-200 flex flex-row items-center gap-2 w-fit mx-auto lg:mx-0">
                  <div>
                    <StarIcon className="w-4 h-4" />
                  </div>
                  <div>Enhance Your Mind Today</div>
                </span>
              </motion.div> */}

              <motion.h1
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-black leading-tight mb-8"
              >
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Test Your Skills,
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Boost Your Mind
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg"
              >
                Unlock your cognitive potential with our scientifically-designed
                quizzes and assessments. Track your progress and watch your mind
                grow stronger every day.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/assessment/selection")}
                  className="group px-10 py-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">Take Assessment</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/results")}
                  className="px-10 py-5 bg-white text-slate-700 font-black text-lg rounded-3xl shadow-xl border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all duration-300"
                >
                  View Results
                </motion.button>
              </motion.div>
            </div>

            {/* Hero Image */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                variants={floatingAnimation}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-white to-violet-50 rounded-3xl p-8 shadow-2xl border border-violet-100">
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Quiz Learning"
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />

                  {/* Floating elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <LightBulbIcon className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-violet-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-bold rounded-full text-sm border border-emerald-200 flex items-center gap-2 w-fit mx-auto">
                <ChartBarIcon className="w-4 h-4" />
                Your Progress Dashboard
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Track Your Learning Journey
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Monitor your progress with detailed analytics and celebrate your
              achievements
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          >
            {dashboardStats.map((stat, index) => {
              const Icon = stat.Icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover="hover"
                  className={`bg-gradient-to-br ${stat.bg} border border-white/50 rounded-3xl p-8 text-center cursor-pointer backdrop-blur-sm shadow-lg`}
                  {...cardHover}
                >
                  <motion.div
                    className={`flex justify-center mb-4 text-${stat.color}-600`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`p-3 bg-white/80 rounded-2xl shadow-sm`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </motion.div>
                  <div
                    className={`text-4xl font-black mb-3 text-${stat.color}-700`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-600">
                    {stat.title}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/results")}
              className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              View Detailed Analytics
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50/30 via-white to-rose-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Why Choose NeuroQuiz?
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Experience the perfect blend of science and technology designed to
              maximize your learning potential
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => {
              const FeatureIcon = feature.Icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover="hover"
                  className="bg-white/80 backdrop-blur-sm border border-violet-100 rounded-3xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                  {...cardHover}
                >
                  <motion.div
                    className={`flex justify-center mb-6 text-${feature.color}-600`}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`p-4 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 rounded-2xl shadow-sm`}
                    >
                      <FeatureIcon className="w-8 h-8" />
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Practice CTA Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-100/50 via-violet-100/30 to-purple-100/50 py-20 px-4 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-violet-300 to-purple-300 rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full opacity-10 blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col lg:flex-row items-center gap-16"
          >
            {/* Image */}
            <div className="lg:w-1/2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-br from-white to-rose-50 rounded-3xl p-8 shadow-2xl border border-rose-100">
                  <img
                    src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Practice Learning"
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <BoltIcon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 font-bold rounded-full text-sm border border-rose-200 flex items-center gap-2 w-fit mx-auto lg:mx-0">
                  <StarIcon className="w-4 h-4" />
                  Ready to Excel?
                </span>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-black leading-tight mb-8"
              >
                <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Ready to Improve
                </span>
                <br />
                <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Your Skills?
                </span>
              </motion.h2>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-600 mb-10 leading-relaxed"
              >
                Practice makes perfect! Join thousands of learners who've
                enhanced their cognitive abilities through our interactive
                practice sessions.
              </motion.p>

              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/practice")}
                className="group px-12 py-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Practicing Now
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-50 to-violet-50 border-t border-violet-100 text-slate-700 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <motion.div
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  NeuroQuiz
                </span>
              </motion.div>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                Enhance your cognitive abilities through scientifically-designed
                interactive quizzes and assessments that adapt to your learning
                style and pace.
              </p>
              <div className="flex space-x-4">
                {[
                  { Icon: StarIcon, color: "from-yellow-400 to-orange-400" },
                  {
                    Icon: LightBulbIcon,
                    color: "from-violet-400 to-purple-400",
                  },
                  { Icon: BoltIcon, color: "from-blue-400 to-cyan-400" },
                  {
                    Icon: RocketLaunchIcon,
                    color: "from-rose-400 to-pink-400",
                  },
                ].map(({ Icon, color }, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl shadow-lg flex items-center justify-center cursor-pointer`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-violet-600" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Practice", path: "/practice" },
                  { label: "Assessment", path: "/assessment/selection" },
                  { label: "Results", path: "/results" },
                  { label: "Profile", path: "/profile" },
                ].map((link, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-slate-600 hover:text-violet-600 font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                      {link.label}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-violet-600" />
                Resources
              </h3>
              <ul className="space-y-3">
                {["How It Works", "Learning Tips", "FAQ", "Support"].map(
                  (item, index) => (
                    <motion.li
                      key={index}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <a
                        href="#"
                        className="text-slate-600 hover:text-violet-600 font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <ArrowRightIcon className="w-4 h-4" />
                        {item}
                      </a>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-violet-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-600 font-medium">
                © 2025 NeuroQuiz. All rights reserved. Built with ❤️ for
                learners worldwide.
              </p>
              <div className="flex gap-6">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                  (item, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ y: -2 }}
                      className="text-slate-600 hover:text-violet-600 font-medium text-sm transition-all duration-200"
                    >
                      {item}
                    </motion.a>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;

// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from "react-router-dom"; // Hook imported successfully
// import api from "../lib/api";
// import { useAuth } from "../context/AuthContext.jsx";

// // --- Heroicons for Dashboard Stats ---
// import {
//   TrophyIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon
// } from '@heroicons/react/24/solid';

// const Homepage = () => {
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const { user } = useAuth();

//   // 1. Initialize the useNavigate hook
//   const navigate = useNavigate();

//   // Fetched dashboard stats
//   const [summary, setSummary] = useState({ totalAssessments: 0, totalCorrect: 0, totalWrong: 0, avgTimeSec: 0 });

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const { data } = await api.get("/api/results/summary");
//         setSummary(data.summary);
//       } catch (_) {
//         // ignore
//       }
//     };
//     load();
//   }, []);

//   const fmtAvg = (sec) => {
//     if (!sec || sec <= 0) return "0.0s";
//     if (sec < 60) return `${sec.toFixed(1)}s`;
//     const m = Math.floor(sec / 60);
//     const s = Math.round(sec % 60);
//     return `${m}m ${s}s`;
//   };

//   const dashboardStats = [
//     { title: "Tests Taken", value: String(summary.totalAssessments || 0), Icon: TrophyIcon, color: "blue" },
//     { title: "Correct Answers", value: String(summary.totalCorrect || 0), Icon: CheckCircleIcon, color: "orange" },
//     { title: "Wrong Answers", value: String(summary.totalWrong || 0), Icon: XCircleIcon, color: "blue" },
//     { title: "Avg Time Spent", value: fmtAvg(summary.avgTimeSec || 0), Icon: ClockIcon, color: "orange" },
//   ];

//   const fadeInUp = {
//     hidden: { opacity: 0, y: 40 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: "easeOut" }
//     }
//   };

//   const staggerContainer = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.2
//       }
//     }
//   };

//   const cardHover = {
//     hover: {
//       y: -8,
//       scale: 1.02,
//       boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
//       transition: { duration: 0.3 }
//     }
//   };

//   // 2. Remove the old placeholder function
//   // const navigateTo = (path) => { console.log(`Navigating to ${path}`); };

//   return (
//     <div className="min-h-screen bg-white">

//       {/* Navbar */}
//       <nav className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-20">

//             {/* Logo */}
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
//                 <span className="text-white font-black text-lg">N</span>
//               </div>
//               <span className="text-2xl font-black text-blue-900">NeuroQuiz</span>
//             </div>

//             {/* Navigation Buttons (Desktop) */}
//             <div className="hidden md:flex items-center space-x-4">
//               <motion.button
//                 whileHover={{ scale: 1.05, brightness: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 // 3. Replace navigateTo with the actual navigate function
//                 onClick={() => navigate('/practice')}
//                 className="px-8 py-3 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-300"
//               >
//                 Practice Now
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05, brightness: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 // 3. Replace navigateTo with the actual navigate function
//                 onClick={() => navigate('/assessment')}
//                 className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300"
//               >
//                 Take Assessment
//               </motion.button>
//             </div>

//             {/* Profile Menu (Increased Size to w-12 h-12) */}
//             <div className="relative">
//               <button
//                 onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
//                 className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 hover:border-orange-400 transition-colors duration-300"
//               >
//                 <img
//                   src={user?.photoUrl || "https://i.pravatar.cc/150"}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                 />
//               </button>

//               <AnimatePresence>
//                 {isProfileMenuOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-blue-100 py-2 z-50"
//                   >
//                     <div className="px-4 py-3 border-b border-blue-100">
//                       <div className="flex items-center gap-3">
//                         <img src={user?.photoUrl || "https://i.pravatar.cc/80"} alt="avatar" className="w-10 h-10 rounded-full border" />
//                         <div>
//                           <div className="text-blue-900 font-semibold">{user?.name || "User"}</div>
//                           <div className="text-blue-700 text-xs">{user?.email}</div>
//                           {user?.gender ? <div className="text-blue-700 text-xs capitalize">{user.gender}</div> : null}
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       // 3. Replace navigateTo with the actual navigate function
//                       onClick={() => navigate('/results')}
//                       className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 transition-colors duration-200"
//                     >
//                       📊 Previous Results
//                     </button>
//                     <button
//                       onClick={() => navigate('/profile')}
//                       className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 transition-colors duration-200"
//                     >
//                       👤 Profile
//                     </button>
//                     <button
//                       // 3. Replace navigateTo with the actual navigate function
//                       onClick={() => navigate('/logout')}
//                       className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 transition-colors duration-200"
//                     >
//                       🚪 Logout
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>

//           {/* Mobile Navigation */}
//           <div className="md:hidden pb-4 flex space-x-3">
//             <motion.button
//               whileHover={{ scale: 1.02, brightness: 1.1 }}
//               whileTap={{ scale: 0.98 }}
//               // 3. Replace navigateTo with the actual navigate function
//               onClick={() => navigate('/practice')}
//               className="flex-1 px-4 py-3 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-300 text-center"
//             >
//               Practice Now
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.02, brightness: 1.1 }}
//               whileTap={{ scale: 0.98 }}
//               // 3. Replace navigateTo with the actual navigate function
//               onClick={() => navigate('/assessment')}
//               className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 text-center"
//             >
//               Take Assessment
//             </motion.button>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Banner */}
//       <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             initial="hidden"
//             animate="visible"
//             variants={fadeInUp}
//             className="flex flex-col lg:flex-row items-center gap-12"
//           >
//             {/* Text Content */}
//             <div className="lg:w-1/2 text-center lg:text-left">
//               <h1 className="text-4xl md:text-6xl font-black text-blue-900 leading-tight mb-6">
//                 Test Your Skills,
//                 <br />
//                 <span className="text-orange-500">Boost Your Mind</span>
//               </h1>
//               <p className="text-xl text-blue-700 mb-8 leading-relaxed">
//                 Challenge yourself with our interactive quizzes designed to enhance your cognitive abilities and track your progress over time.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//                 <motion.button
//                   whileHover={{ scale: 1.05, y: -2, brightness: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   // 3. Replace navigateTo with the actual navigate function
//                   onClick={() => navigate('/assessment')}
//                   className="px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-blue-600 transition-all duration-300"
//                 >
//                   Take Assessment
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.05, y: -2, brightness: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   // 3. Replace navigateTo with the actual navigate function
//                   onClick={() => navigate('/results')}
//                   className="px-8 py-4 bg-white text-blue-500 font-bold text-lg rounded-2xl shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
//                 >
//                   See Previous Results
//                 </motion.button>
//               </div>
//             </div>

//             {/* Image */}
//             <div className="lg:w-1/2">
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.8, delay: 0.3 }}
//                 className="relative"
//               >
//                 <img
//                   src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
//                   alt="Quiz Learning"
//                   className="w-full h-auto rounded-3xl shadow-2xl"
//                 />
//                 <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
//                   <span className="text-white text-2xl">🧠</span>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Dashboard Stats */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//             className="text-center mb-12"
//           >
//             <h2 className="text-3xl md:text-4xl font-black text-blue-900 mb-4">
//               Your Learning Dashboard
//             </h2>
//             <p className="text-lg text-blue-700">
//               Track your progress and see how you're improving
//             </p>
//           </motion.div>

//           <motion.div
//             variants={staggerContainer}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
//           >
//             {dashboardStats.map((stat, index) => {
//               const Icon = stat.Icon; // Destructure the Icon component
//               return (
//                 <motion.div
//                   key={index}
//                   variants={fadeInUp}
//                   whileHover="hover"
//                   className={`bg-gradient-to-br ${
//                     stat.color === 'blue'
//                       ? 'from-blue-50 to-blue-100 border-blue-200'
//                       : 'from-orange-50 to-orange-100 border-orange-200'
//                   } border rounded-2xl p-6 text-center cursor-pointer`}
//                   {...cardHover}
//                 >
//                   {/* Icon rendering */}
//                   <div className={`flex justify-center mb-3 ${
//                     stat.color === 'blue' ? 'text-blue-600' : 'text-orange-500'
//                   }`}>
//                     <Icon className="w-10 h-10" />
//                   </div>
//                   <div className={`text-3xl font-black mb-2 ${
//                     stat.color === 'blue' ? 'text-blue-900' : 'text-orange-600'
//                   }`}>
//                     {stat.value}
//                   </div>
//                   <div className="text-sm font-semibold text-blue-700">
//                     {stat.title}
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>

//           <div className="text-center">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               // 3. Replace navigateTo with the actual navigate function
//               onClick={() => navigate('/results')}
//               className="px-8 py-3 bg-white text-blue-500 font-bold text-lg rounded-xl shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
//             >
//               See More Results
//             </motion.button>
//           </div>
//         </div>
//       </section>

//       {/* Practice CTA Banner */}
//       <section className="bg-gradient-to-r from-orange-100 via-blue-50 to-orange-100 py-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={fadeInUp}
//             className="flex flex-col lg:flex-row items-center gap-12"
//           >
//             {/* Image */}
//             <div className="lg:w-1/2 order-2 lg:order-1">
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.8 }}
//                 className="relative"
//               >
//                 <img
//                   src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
//                   alt="Practice Learning"
//                   className="w-full h-auto rounded-3xl shadow-2xl"
//                 />
//                 <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
//                   <span className="text-white text-2xl">⚡</span>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Text Content */}
//             <div className="lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
//               <h2 className="text-4xl md:text-5xl font-black text-blue-900 leading-tight mb-6">
//                 Want to Improve
//                 <br />
//                 <span className="text-orange-500">Your Skills?</span>
//               </h2>
//               <p className="text-xl text-blue-700 mb-8 leading-relaxed">
//                 Practice makes perfect! Try our interactive practice sessions to sharpen your abilities and boost your confidence.
//               </p>
//               <motion.button
//                 whileHover={{ scale: 1.05, y: -2, brightness: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 // 3. Replace navigateTo with the actual navigate function
//                 onClick={() => navigate('/practice')}
//                 className="px-12 py-5 bg-orange-400 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-orange-500 hover:shadow-2xl transition-all duration-300"
//               >
//                 Practice Now
//               </motion.button>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-white border-t border-blue-100 text-blue-900 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

//             {/* Brand */}
//             <div className="md:col-span-2">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
//                   <span className="text-white font-black text-lg">N</span>
//                 </div>
//                 <span className="text-2xl font-black text-blue-900">NeuroQuiz</span>
//               </div>
//               <p className="text-blue-700 leading-relaxed mb-4">
//                 Enhance your cognitive abilities through interactive quizzes and assessments designed to challenge and improve your mental agility.
//               </p>
//             </div>

//             {/* Quick Links */}
//             <div>
//               <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Links</h3>
//               <ul className="space-y-2">
//                 <li>
//                   <motion.button
//                     whileHover={{ scale: 1.02, x: 5 }}
//                     // 3. Replace navigateTo with the actual navigate function
//                     onClick={() => navigate('/practice')}
//                     className="text-blue-700 hover:text-orange-500 transition-all duration-200"
//                   >
//                     Practice Tests
//                   </motion.button>
//                 </li>
//                 <li>
//                   <motion.button
//                     whileHover={{ scale: 1.02, x: 5 }}
//                     // 3. Replace navigateTo with the actual navigate function
//                     onClick={() => navigate('/assessment')}
//                     className="text-blue-700 hover:text-orange-500 transition-all duration-200"
//                   >
//                     Assessments
//                   </motion.button>
//                 </li>
//                 <li>
//                   <motion.button
//                     whileHover={{ scale: 1.02, x: 5 }}
//                     // 3. Replace navigateTo with the actual navigate function
//                     onClick={() => navigate('/results')}
//                     className="text-blue-700 hover:text-orange-500 transition-all duration-200"
//                   >
//                     Results History
//                   </motion.button>
//                 </li>
//               </ul>
//             </div>

//             {/* Support */}
//             <div>
//               <h3 className="text-lg font-bold text-blue-900 mb-4">Support</h3>
//               <ul className="space-y-2">
//                 <li>
//                   <motion.button
//                     whileHover={{ scale: 1.02, x: 5 }}
//                     // 3. Replace navigateTo with the actual navigate function
//                     onClick={() => navigate('/help')}
//                     className="text-blue-700 hover:text-orange-500 transition-all duration-200"
//                   >
//                     Help Center
//                   </motion.button>
//                 </li>
//                 <li>
//                   <motion.button
//                     whileHover={{ scale: 1.02, x: 5 }}
//                     // 3. Replace navigateTo with the actual navigate function
//                     onClick={() => navigate('/contact')}
//                     className="text-blue-700 hover:text-orange-500 transition-all duration-200"
//                   >
//                     Contact Us
//                   </motion.button>
//                 </li>
//                 <li>
//                   <motion.button
//                     whileHover={{ scale: 1.02, x: 5 }}
//                     // 3. Replace navigateTo with the actual navigate function
//                     onClick={() => navigate('/privacy')}
//                     className="text-blue-700 hover:text-orange-500 transition-all duration-200"
//                   >
//                     Privacy Policy
//                   </motion.button>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <div className="border-t border-blue-200 mt-8 pt-8 text-center">
//             <p className="text-blue-700">
//               © 2024 NeuroQuiz. All rights reserved. Built for cognitive enhancement.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Homepage;
