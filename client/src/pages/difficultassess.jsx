import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  Clock,
  CheckCircle,
  Circle,
  BarChart3,
  User,
  Calendar,
} from "lucide-react";

const DiffAssess = ({
  questionsData,
  assessmentTitle = "Aptitude Test",
  assessmentSubtitle = "Assessment",
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [totalTestTime, setTotalTestTime] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Test configuration
  const testConfig = {
    very_easy: 25,
    easy: 25,
    moderate: 25,
    difficult: 25,
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (testStartTime && !showResults) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - testStartTime);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStartTime, showResults]);

  // Initialize test
  useEffect(() => {
    generateTestQuestions();
    setTestStartTime(Date.now());
  }, []);

  useEffect(() => {
    // Start timing when question changes
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleQuestionNavigation = (questionIndex) => {
    // Save time spent on current question before switching
    if (questionStartTime && questionIndex !== currentQuestionIndex) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent,
      }));
    }
    setCurrentQuestionIndex(questionIndex);
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // const generateTestQuestions = () => {
  //   const selectedQuestions = [];

  //   Object.keys(testConfig).forEach((difficulty) => {
  //     const questionsPool = percentageQuestions[difficulty];
  //     const count = testConfig[difficulty];
  //     const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);
  //     const selected = shuffled.slice(0, count);
  //     selectedQuestions.push(...selected);
  //   });

  //   const shuffledTest = selectedQuestions.sort(() => Math.random() - 0.5);
  //   setTestQuestions(shuffledTest);
  // };

  const generateTestQuestions = () => {
    const selectedQuestions = [];

    Object.keys(testConfig).forEach((difficulty) => {
      // Change this line to use questionsData instead of percentageQuestions
      const questionsPool = questionsData[difficulty] || [];
      const count = Math.min(testConfig[difficulty], questionsPool.length);

      if (questionsPool.length > 0) {
        const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        selectedQuestions.push(...selected);
      }
    });

    const shuffledTest = selectedQuestions.sort(() => Math.random() - 0.5);
    setTestQuestions(shuffledTest);
  };

  const handleAnswerSelect = (answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (questionStartTime) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent,
      }));
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionStartTime) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent,
      }));
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    // Save time for current question before submitting
    if (questionStartTime) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + timeSpent,
      }));
    }

    setTotalTestTime(Date.now() - testStartTime);
    setShowResults(true);
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return "answered";
    if (index === currentQuestionIndex) return "current";
    return "unanswered";
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const ResultsScreen = () => {
    const questionHistory = testQuestions.map((question, index) => ({
      questionNumber: index + 1,
      question: question.question,
      selectedAnswer:
        answers[index] !== undefined
          ? question.options[answers[index]]
          : "Not Answered",
      correctAnswer: question.options[question.correct],
      isCorrect: answers[index] === question.correct,
      difficulty: question.difficulty || "moderate",
      timeTaken: questionTimes[index] || 0, // Add individual question time
    }));

    const totalQuestions = testQuestions.length;
    const correctAnswers = questionHistory.filter((q) => q.isCorrect).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const averageTime = totalQuestions > 0 ? totalTestTime / totalQuestions : 0;

    // Difficulty stats
    const difficultyStats = {
      very_easy: questionHistory.filter((q) => q.difficulty === "very_easy"),
      easy: questionHistory.filter((q) => q.difficulty === "easy"),
      moderate: questionHistory.filter((q) => q.difficulty === "moderate"),
      difficult: questionHistory.filter((q) => q.difficulty === "difficult"),
    };

    const difficultyAccuracy = Object.keys(difficultyStats).map((diff) => ({
      difficulty: diff,
      total: difficultyStats[diff].length,
      correct: difficultyStats[diff].filter((q) => q.isCorrect).length,
      accuracy:
        difficultyStats[diff].length > 0
          ? (difficultyStats[diff].filter((q) => q.isCorrect).length /
              difficultyStats[diff].length) *
            100
          : 0,
      avgTime:
        difficultyStats[diff].length > 0
          ? difficultyStats[diff].reduce((sum, q) => sum + q.timeTaken, 0) /
            difficultyStats[diff].length
          : 0,
    }));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Test Completed!
                </h1>
                <p className="text-gray-600">Here's your performance summary</p>
              </div>

              {/* ADD THIS DOWNLOAD BUTTON SECTION */}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {totalQuestions}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Total Questions
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {correctAnswers}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Correct Answers
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {accuracy.toFixed(1)}%
                  </div>
                  <div className="text-gray-700 font-medium">Accuracy</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatTime(averageTime)}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Avg Time/Question
                  </div>
                </div>
              </div>

              {/* Difficulty Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Difficulty Analysis
                  </h3>
                  <div className="space-y-4">
                    {difficultyAccuracy.map((stat, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold capitalize">
                            {stat.difficulty.replace("_", " ")}
                          </span>
                          <span className="font-bold text-gray-700">
                            {stat.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${stat.accuracy}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {stat.correct}/{stat.total} correct • Avg:{" "}
                          {formatTime(stat.avgTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Performance Summary
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        • Fastest Question:{" "}
                        {formatTime(
                          Math.min(...questionHistory.map((q) => q.timeTaken))
                        )}
                      </p>
                      <p>
                        • Slowest Question:{" "}
                        {formatTime(
                          Math.max(...questionHistory.map((q) => q.timeTaken))
                        )}
                      </p>
                      <p>• Total Test Time: {formatTime(totalTestTime)}</p>
                      <p>
                        • Questions per Minute:{" "}
                        {(totalQuestions / (totalTestTime / 60000)).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                  Question Review
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {questionHistory.map((q, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 ${
                        q.isCorrect
                          ? "border-green-300 bg-green-50"
                          : answers[index] !== undefined
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">
                          Q{q.questionNumber}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {formatTime(q.timeTaken)}
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              q.isCorrect
                                ? "text-green-600"
                                : answers[index] !== undefined
                                ? "text-red-600"
                                : "text-gray-400"
                            }`}
                          >
                            {q.isCorrect
                              ? "✓"
                              : answers[index] !== undefined
                              ? "✗"
                              : "-"}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {q.question}
                      </div>
                      <div className="text-xs text-gray-600">
                        Your answer:{" "}
                        <span
                          className={`font-semibold ${
                            q.isCorrect
                              ? "text-green-600"
                              : answers[index] !== undefined
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        >
                          {q.selectedAnswer}
                        </span>
                        {!q.isCorrect && answers[index] !== undefined && (
                          <span className="ml-2">
                            | Correct:{" "}
                            <span className="text-green-600 font-semibold">
                              {q.correctAnswer}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Take Test Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showResults) {
    return <ResultsScreen />;
  }

  if (testQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-600">
            Loading Test...
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Left Sidebar - 25% width */}
        <div className="w-1/4 bg-gradient-to-b from-blue-50 to-purple-50 border-r border-gray-200 p-6 pt-20 overflow-y-scroll">
          {/* Test Info */}
          <div className="mb-8">
            {/* <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Aptitude Test</h2>
                <p className="text-sm text-gray-600">Percentage Problems</p>
              </div>
            </div> */}
            <div className="flex items-start mb-4">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 -mt-1">
                  {assessmentTitle}
                </h2>
                <p className="text-sm text-gray-600">{assessmentSubtitle}</p>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Time Elapsed
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {getAnsweredCount()} of {testQuestions.length} answered
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (getAnsweredCount() / testQuestions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {testQuestions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                      status === "answered"
                        ? "bg-green-500 text-white shadow-md hover:bg-green-600"
                        : status === "current"
                        ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300"
                        : "bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">
              Instructions
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Answered
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Current
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                Not Answered
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - 75% width */}
        <div className="w-3/4 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Question {currentQuestionIndex + 1} of {testQuestions.length}
                </h1>
                <p className="text-gray-600 capitalize">
                  Difficulty: {currentQuestion.difficulty?.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={handleSubmitTest}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                {/* Question */}
                <div className="mb-8">
                  <div className="text-xl font-medium text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4 mb-8">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestionIndex] === index;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                          isSelected
                            ? "bg-blue-50 border-blue-400 text-blue-800 shadow-md"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-blue-25 hover:border-blue-300 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-semibold text-blue-600 mr-3">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm hover:shadow-md"
                }`}
              >
                ← Previous
              </button>

              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === testQuestions.length - 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentQuestionIndex === testQuestions.length - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffAssess;
