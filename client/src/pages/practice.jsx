import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Practice = () => {
  const navigate = useNavigate();

  const [selectedPracticeType, setSelectedPracticeType] = useState('mixed');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');

  const difficultyLevels = [
    { id: 'very-easy', label: 'Very Easy', description: 'Perfect for beginners starting their journey', icon: '🌱' },
    { id: 'easy', label: 'Easy', description: 'Build confidence with simple concepts', icon: '⭐' },
    { id: 'moderate', label: 'Moderate', description: 'Challenge yourself with intermediate questions', icon: '🔥' },
    { id: 'difficult', label: 'Difficult', description: 'Master advanced concepts and complex problems', icon: '💎' }
  ];

  const questionOptions = ['5', '10', '15', '20', '25', '30'];

  const handleStartPractice = () => {
    if (selectedPracticeType === 'mixed') {
      navigate('/MixedPractice', { state: { numberOfQuestions } });
    } else {
      navigate(`/DifficultPractice?level=${selectedDifficulty}&questions=${numberOfQuestions}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const difficultyVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.4, staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Practice Mode</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your practice style and difficulty level to strengthen your skills
          </p>
        </motion.div>

        {/* Main Settings Card */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 md:p-10 mb-8">

          {/* Practice Type */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Practice Type</h3>
            <div className="space-y-4">
              {/* Difficulty-Based Practice */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedPracticeType === 'difficulty' ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25'
                }`}
                onClick={() => setSelectedPracticeType('difficulty')}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">🎯</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Difficulty-Based Practice</h4>
                    </div>
                    <p className="text-gray-600">Focus on a specific difficulty level to master concepts step by step</p>
                  </div>
                  <div className="ml-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPracticeType === 'difficulty' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                    }`}>
                      {selectedPracticeType === 'difficulty' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mixed Practice */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedPracticeType === 'mixed' ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25'
                }`}
                onClick={() => setSelectedPracticeType('mixed')}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">🔀</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Mixed Practice</h4>
                    </div>
                    <p className="text-gray-600">Random questions from all difficulty levels for comprehensive practice</p>
                  </div>
                  <div className="ml-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPracticeType === 'mixed' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                    }`}>
                      {selectedPracticeType === 'mixed' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Difficulty Level Selection */}
          <AnimatePresence>
            {selectedPracticeType === 'difficulty' && (
              <motion.div variants={difficultyVariants} initial="hidden" animate="visible" exit="hidden" className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Difficulty Level</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {difficultyLevels.map((level) => (
                    <motion.div
                      key={level.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedDifficulty === level.id ? 'border-orange-400 bg-orange-50 shadow-md' : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-25'
                      }`}
                      onClick={() => setSelectedDifficulty(level.id)}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{level.icon}</div>
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 mb-1">{level.label}</h5>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedDifficulty === level.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300 bg-white'
                        }`}>
                          {selectedDifficulty === level.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Number of Questions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Number of Questions</h3>
            <div className="relative">
              <select
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-semibold appearance-none cursor-pointer hover:border-blue-300 focus:border-blue-400 focus:outline-none transition-colors duration-300"
              >
                {questionOptions.map((option) => (
                  <option key={option} value={option}>{option} questions</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPractice}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex items-center"
            >
              Start Practice Session
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Practice;
