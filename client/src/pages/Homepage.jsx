import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom"; // Hook imported successfully
import api from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

// --- Heroicons for Dashboard Stats ---
import { 
  TrophyIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/solid';

const Homepage = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  // 1. Initialize the useNavigate hook
  const navigate = useNavigate();

  // Fetched dashboard stats
  const [summary, setSummary] = useState({ totalAssessments: 0, totalCorrect: 0, totalWrong: 0, avgTimeSec: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/results/summary");
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
    { title: "Tests Taken", value: String(summary.totalAssessments || 0), Icon: TrophyIcon, color: "blue" },
    { title: "Correct Answers", value: String(summary.totalCorrect || 0), Icon: CheckCircleIcon, color: "orange" },
    { title: "Wrong Answers", value: String(summary.totalWrong || 0), Icon: XCircleIcon, color: "blue" },
    { title: "Avg Time Spent", value: fmtAvg(summary.avgTimeSec || 0), Icon: ClockIcon, color: "orange" },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardHover = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
      transition: { duration: 0.3 }
    }
  };

  // 2. Remove the old placeholder function
  // const navigateTo = (path) => { console.log(`Navigating to ${path}`); };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">N</span>
              </div>
              <span className="text-2xl font-black text-blue-900">NeuroQuiz</span>
            </div>

            {/* Navigation Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05, brightness: 1.1 }}
                whileTap={{ scale: 0.95 }}
                // 3. Replace navigateTo with the actual navigate function
                onClick={() => navigate('/practice')} 
                className="px-8 py-3 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-300"
              >
                Practice Now
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, brightness: 1.1 }}
                whileTap={{ scale: 0.95 }}
                // 3. Replace navigateTo with the actual navigate function
                onClick={() => navigate('/assessment')}
                className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300"
              >
                Take Assessment
              </motion.button>
            </div>

            {/* Profile Menu (Increased Size to w-12 h-12) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 hover:border-orange-400 transition-colors duration-300"
              >
                <img
                  src={user?.photoUrl || "https://i.pravatar.cc/150"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-blue-100 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-blue-100">
                      <div className="flex items-center gap-3">
                        <img src={user?.photoUrl || "https://i.pravatar.cc/80"} alt="avatar" className="w-10 h-10 rounded-full border" />
                        <div>
                          <div className="text-blue-900 font-semibold">{user?.name || "User"}</div>
                          <div className="text-blue-700 text-xs">{user?.email}</div>
                          {user?.gender ? <div className="text-blue-700 text-xs capitalize">{user.gender}</div> : null}
                        </div>
                      </div>
                    </div>
                    <button 
                      // 3. Replace navigateTo with the actual navigate function
                      onClick={() => navigate('/results')}
                      className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 transition-colors duration-200"
                    >
                      📊 Previous Results
                    </button>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 transition-colors duration-200"
                    >
                      👤 Profile
                    </button>
                    <button 
                      // 3. Replace navigateTo with the actual navigate function
                      onClick={() => navigate('/logout')}
                      className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-50 transition-colors duration-200"
                    >
                      🚪 Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4 flex space-x-3">
            <motion.button 
              whileHover={{ scale: 1.02, brightness: 1.1 }}
              whileTap={{ scale: 0.98 }}
              // 3. Replace navigateTo with the actual navigate function
              onClick={() => navigate('/practice')}
              className="flex-1 px-4 py-3 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-300 text-center"
            >
              Practice Now
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, brightness: 1.1 }}
              whileTap={{ scale: 0.98 }}
              // 3. Replace navigateTo with the actual navigate function
              onClick={() => navigate('/assessment')}
              className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 text-center"
            >
              Take Assessment
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-blue-900 leading-tight mb-6">
                Test Your Skills,
                <br />
                <span className="text-orange-500">Boost Your Mind</span>
              </h1>
              <p className="text-xl text-blue-700 mb-8 leading-relaxed">
                Challenge yourself with our interactive quizzes designed to enhance your cognitive abilities and track your progress over time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2, brightness: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  // 3. Replace navigateTo with the actual navigate function
                  onClick={() => navigate('/assessment')}
                  className="px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-blue-600 transition-all duration-300"
                >
                  Take Assessment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2, brightness: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  // 3. Replace navigateTo with the actual navigate function
                  onClick={() => navigate('/results')}
                  className="px-8 py-4 bg-white text-blue-500 font-bold text-lg rounded-2xl shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                >
                  See Previous Results
                </motion.button>
              </div>
            </div>

            {/* Image */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Quiz Learning"
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">🧠</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-blue-900 mb-4">
              Your Learning Dashboard
            </h2>
            <p className="text-lg text-blue-700">
              Track your progress and see how you're improving
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {dashboardStats.map((stat, index) => {
              const Icon = stat.Icon; // Destructure the Icon component
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover="hover"
                  className={`bg-gradient-to-br ${
                    stat.color === 'blue' 
                      ? 'from-blue-50 to-blue-100 border-blue-200' 
                      : 'from-orange-50 to-orange-100 border-orange-200'
                  } border rounded-2xl p-6 text-center cursor-pointer`}
                  {...cardHover}
                >
                  {/* Icon rendering */}
                  <div className={`flex justify-center mb-3 ${
                    stat.color === 'blue' ? 'text-blue-600' : 'text-orange-500'
                  }`}>
                    <Icon className="w-10 h-10" /> 
                  </div>
                  <div className={`text-3xl font-black mb-2 ${
                    stat.color === 'blue' ? 'text-blue-900' : 'text-orange-600'
                  }`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-blue-700">
                    {stat.title}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              // 3. Replace navigateTo with the actual navigate function
              onClick={() => navigate('/results')}
              className="px-8 py-3 bg-white text-blue-500 font-bold text-lg rounded-xl shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
            >
              See More Results
            </motion.button>
          </div>
        </div>
      </section>

      {/* Practice CTA Banner */}
      <section className="bg-gradient-to-r from-orange-100 via-blue-50 to-orange-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            {/* Image */}
            <div className="lg:w-1/2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Practice Learning"
                  className="w-full h-auto rounded-3xl shadow-2xl"
                />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">⚡</span>
                </div>
              </motion.div>
            </div>

            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-black text-blue-900 leading-tight mb-6">
                Want to Improve
                <br />
                <span className="text-orange-500">Your Skills?</span>
              </h2>
              <p className="text-xl text-blue-700 mb-8 leading-relaxed">
                Practice makes perfect! Try our interactive practice sessions to sharpen your abilities and boost your confidence.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2, brightness: 1.1 }}
                whileTap={{ scale: 0.95 }}
                // 3. Replace navigateTo with the actual navigate function
                onClick={() => navigate('/practice')}
                className="px-12 py-5 bg-orange-400 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-orange-500 hover:shadow-2xl transition-all duration-300"
              >
                Practice Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 text-blue-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">N</span>
                </div>
                <span className="text-2xl font-black text-blue-900">NeuroQuiz</span>
              </div>
              <p className="text-blue-700 leading-relaxed mb-4">
                Enhance your cognitive abilities through interactive quizzes and assessments designed to challenge and improve your mental agility.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    // 3. Replace navigateTo with the actual navigate function
                    onClick={() => navigate('/practice')}
                    className="text-blue-700 hover:text-orange-500 transition-all duration-200"
                  >
                    Practice Tests
                  </motion.button>
                </li>
                <li>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    // 3. Replace navigateTo with the actual navigate function
                    onClick={() => navigate('/assessment')}
                    className="text-blue-700 hover:text-orange-500 transition-all duration-200"
                  >
                    Assessments
                  </motion.button>
                </li>
                <li>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    // 3. Replace navigateTo with the actual navigate function
                    onClick={() => navigate('/results')}
                    className="text-blue-700 hover:text-orange-500 transition-all duration-200"
                  >
                    Results History
                  </motion.button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    // 3. Replace navigateTo with the actual navigate function
                    onClick={() => navigate('/help')}
                    className="text-blue-700 hover:text-orange-500 transition-all duration-200"
                  >
                    Help Center
                  </motion.button>
                </li>
                <li>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    // 3. Replace navigateTo with the actual navigate function
                    onClick={() => navigate('/contact')}
                    className="text-blue-700 hover:text-orange-500 transition-all duration-200"
                  >
                    Contact Us
                  </motion.button>
                </li>
                <li>
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    // 3. Replace navigateTo with the actual navigate function
                    onClick={() => navigate('/privacy')}
                    className="text-blue-700 hover:text-orange-500 transition-all duration-200"
                  >
                    Privacy Policy
                  </motion.button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-200 mt-8 pt-8 text-center">
            <p className="text-blue-700">
              © 2024 NeuroQuiz. All rights reserved. Built for cognitive enhancement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;