import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Circle,
  BarChart3,
  User,
  Calendar,
  Menu,
  X,
} from "lucide-react";

const DiffAssess = ({
  questionsData,
  assessmentTitle = "Aptitude Test",
  assessmentSubtitle = "Assessment",
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [totalTestTime, setTotalTestTime] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Progressive difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState("very_easy");
  const [difficultyProgress, setDifficultyProgress] = useState({
    very_easy: { correct: 0, total: 0 },
    easy: { correct: 0, total: 0 },
    moderate: { correct: 0, total: 0 },
    difficult: { correct: 0, total: 0, wrong: 0 },
  });
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [assessmentEnded, setAssessmentEnded] = useState(false);

  // Requirements for level progression
  const progressionRules = {
    very_easy: 3,
    easy: 3,
    moderate: 3,
    difficult: 3,
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (testStartTime && !showResults && !assessmentEnded) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - testStartTime);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStartTime, showResults, assessmentEnded]);

  // Initialize test
  useEffect(() => {
    setTestStartTime(Date.now());
    loadNextQuestion();
  }, []);

  useEffect(() => {
    if (currentQuestionIndex >= 0 && testQuestions[currentQuestionIndex]) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex]);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const loadNextQuestion = () => {
    const questionsPool = questionsData[currentDifficulty] || [];
    const availableQuestions = questionsPool.filter(
      (q) => !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) {
      handleAssessmentEnd();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const nextQuestion = {
      ...availableQuestions[randomIndex],
      difficulty: currentDifficulty,
    };

    setTestQuestions((prev) => [...prev, nextQuestion]);
    setUsedQuestions((prev) => new Set([...prev, nextQuestion.id]));
    setQuestionStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex) => {
    if (answers[currentQuestionIndex] !== undefined) return;

    const timeSpent = Date.now() - questionStartTime;
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));

    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestionIndex]: timeSpent,
    }));

    const newProgress = { ...difficultyProgress };
    newProgress[currentDifficulty].total += 1;

    if (isCorrect) {
      newProgress[currentDifficulty].correct += 1;
    } else if (currentDifficulty === "difficult") {
      newProgress[currentDifficulty].wrong += 1;
    }

    setDifficultyProgress(newProgress);

    setTimeout(() => {
      checkLevelTransition(newProgress, isCorrect);
    }, 500);
  };

  const checkLevelTransition = (progress, wasCorrect) => {
    let newDifficulty = currentDifficulty;

    if (currentDifficulty === "very_easy") {
      if (progress.very_easy.correct >= progressionRules.very_easy) {
        newDifficulty = "easy";
      }
    } else if (currentDifficulty === "easy") {
      if (progress.easy.correct >= progressionRules.easy) {
        newDifficulty = "moderate";
      }
    } else if (currentDifficulty === "moderate") {
      if (progress.moderate.correct >= progressionRules.moderate) {
        newDifficulty = "difficult";
      }
    } else if (currentDifficulty === "difficult") {
      if (progress.difficult.wrong >= progressionRules.difficult) {
        newDifficulty = "moderate";
        setDifficultyProgress((prev) => ({
          ...prev,
          difficult: { ...prev.difficult, wrong: 0 },
        }));
      }
    }

    if (newDifficulty !== currentDifficulty) {
      setCurrentDifficulty(newDifficulty);
    }
  };

  const handleNextQuestion = () => {
    if (answers[currentQuestionIndex] === undefined) {
      alert("Please select an answer before proceeding");
      return;
    }

    setShowExplanation(false);
    setCurrentQuestionIndex((prev) => prev + 1);
    loadNextQuestion();
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAssessmentEnd = () => {
    setTotalTestTime(Date.now() - testStartTime);
    setAssessmentEnded(true);
    setShowResults(true);
  };

  const handleSubmitTest = () => {
    const unanswered = testQuestions.filter(
      (_, index) => answers[index] === undefined
    ).length;

    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    handleAssessmentEnd();
  };

  const handleQuestionNavigation = (questionIndex) => {
    if (questionIndex <= currentQuestionIndex) {
      setCurrentQuestionIndex(questionIndex);
    }
  };

  const getQuestionStatus = (index) => {
    if (answers[index] !== undefined) return "answered";
    if (index === currentQuestionIndex) return "current";
    if (index < currentQuestionIndex) return "skipped";
    return "locked";
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      very_easy: "bg-green-100 text-green-800 border-green-300",
      easy: "bg-blue-100 text-blue-800 border-blue-300",
      moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
      difficult: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[difficulty] || colors.moderate;
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
      timeTaken: questionTimes[index] || 0,
    }));

    const totalQuestions = testQuestions.length;
    const correctAnswers = questionHistory.filter((q) => q.isCorrect).length;
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageTime = totalQuestions > 0 ? totalTestTime / totalQuestions : 0;

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 md:py-8">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100">
              <div className="text-center mb-6 md:mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Assessment Completed!
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Here's your performance summary
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl text-center border border-blue-200">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 md:mb-2">
                    {totalQuestions}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">
                    Total Questions
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl text-center border border-green-200">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 md:mb-2">
                    {correctAnswers}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">
                    Correct Answers
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl text-center border border-purple-200">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 md:mb-2">
                    {accuracy.toFixed(1)}%
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">
                    Accuracy
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl text-center border border-orange-200">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 md:mb-2">
                    {formatTime(averageTime)}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">
                    Avg Time/Question
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                    Difficulty Analysis
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {difficultyAccuracy.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 md:p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm md:text-base font-semibold capitalize">
                            {stat.difficulty.replace("_", " ")}
                          </span>
                          <span className="text-sm md:text-base font-bold text-gray-700">
                            {stat.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${stat.accuracy}%` }}
                          ></div>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600 mt-1">
                          {stat.correct}/{stat.total} correct • Avg:{" "}
                          {formatTime(stat.avgTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                    Performance Summary
                  </h3>
                  <div className="bg-white p-3 md:p-4 rounded-lg">
                    <div className="text-xs sm:text-sm text-gray-600 space-y-2">
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
                      <p className="mt-4 pt-4 border-t border-gray-200 font-semibold">
                        Highest Level Reached:{" "}
                        <span className="capitalize text-blue-600">
                          {currentDifficulty.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
                  Question Review
                </h2>
                <div className="space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
                  {questionHistory.map((q, index) => (
                    <div
                      key={index}
                      className={`p-3 md:p-4 rounded-lg md:rounded-xl border-2 ${
                        q.isCorrect
                          ? "border-green-300 bg-green-50"
                          : answers[index] !== undefined
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base font-semibold text-gray-800">
                            Q{q.questionNumber}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                              q.difficulty
                            )}`}
                          >
                            {q.difficulty.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                          <span className="text-xs md:text-sm text-gray-600">
                            {formatTime(q.timeTaken)}
                          </span>
                          <span
                            className={`text-base md:text-lg font-bold ${
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
                      <div className="text-xs md:text-sm text-gray-700 mb-2">
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  Take Assessment Again
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
          <div className="text-lg md:text-xl font-semibold text-gray-600">
            Loading Assessment...
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Mobile Top Bar - Only visible on mobile */}
        <div className="md:hidden bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-3 pt-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <span className="text-sm font-medium">← Back</span>
            </button>
            <button
              onClick={handleSubmitTest}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg text-sm"
            >
              Submit
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {/* Current Level */}
            <div
              className={`rounded-lg p-2 border-2 ${getDifficultyColor(
                currentDifficulty
              )}`}
            >
              <div className="text-xs font-medium mb-0.5">Level</div>
              <div className="text-sm font-bold capitalize leading-tight">
                {currentDifficulty.replace("_", " ")}
              </div>
            </div>
            {/* Timer */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center mb-0.5">
                <Clock className="w-3 h-3 text-gray-600 mr-1" />
                <span className="text-xs font-medium text-gray-700">Time</span>
              </div>
              <div className="text-sm font-bold text-gray-800">
                {formatTime(currentTime)}
              </div>
            </div>
            {/* Progress */}
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center mb-0.5">
                <BarChart3 className="w-3 h-3 text-gray-600 mr-1" />
                <span className="text-xs font-medium text-gray-700">
                  Progress
                </span>
              </div>
              <div className="text-sm font-bold text-gray-800">
                {getAnsweredCount()}/{testQuestions.length}
              </div>
            </div>
            {/* Apti concept */}
            {currentQuestion?.aptitudeConcept ? (
              <div
                className={`rounded-lg p-2 border-2 w-94 ${getDifficultyColor(
                  currentDifficulty
                )}`}
              >
                <div className="text-xs flex flex-row font-medium mb-0.5">
                  Aptitude Concept:{" "}
                  <span className="text-s pl-2 font-bold capitalize leading-tight">
                    {currentQuestion?.aptitudeConcept}
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block md:w-1/4 bg-gradient-to-b from-blue-50 to-purple-50 border-r border-gray-200 p-4 md:p-6 pt-16 md:pt-20 overflow-y-scroll h-full">
          <div className="mb-6 md:mb-8">
            <div className="flex items-start mb-4">
              <div className="w-8 h-5 md:w-10 md:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-bold text-gray-800 -mt-1">
                  {assessmentTitle}
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  {assessmentSubtitle}
                </p>
              </div>
            </div>
            {/* Current Difficulty */}
            <div
              className={`rounded-xl md:rounded-2xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm border-2 ${getDifficultyColor(
                currentDifficulty
              )}`}
            >
              <div className="text-xs md:text-sm font-medium mb-1">
                Current Level
              </div>
              <div className="text-base md:text-lg font-bold capitalize">
                {currentDifficulty.replace("_", " ")}
              </div>
              <div className="text-xs mt-2">
                {currentDifficulty === "very_easy" &&
                  `${difficultyProgress.very_easy.correct}/3 correct to advance`}
                {currentDifficulty === "easy" &&
                  `${difficultyProgress.easy.correct}/3 correct to advance`}
                {currentDifficulty === "moderate" &&
                  `${difficultyProgress.moderate.correct}/3 correct to advance`}
                {currentDifficulty === "difficult" &&
                  `${difficultyProgress.difficult.wrong}/3 wrong to go back`}
              </div>
            </div>
            {/*Apti concept*/}
            {currentQuestion?.aptitudeConcept ? (
              <div
                className={`rounded-xl md:rounded-2xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm border-2 ${getDifficultyColor(
                  currentDifficulty
                )}`}
              >
                <div className="text-xs md:text-sm font-medium mb-1">
                  Aptitude Concept
                </div>
                <div className="text-base md:text-lg font-bold capitalize">
                  {currentQuestion?.aptitudeConcept}
                </div>
              </div>
            ) : (
              <></>
            )}
            {/* Timer */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  Time Elapsed
                </span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-800">
                {formatTime(currentTime)}
              </div>
            </div>
            {/* Progress */}
            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-xs md:text-sm font-medium text-gray-700">
                  Progress
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-600 mb-2">
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
        </div>

        {/* Right Content */}
        <div className="w-full md:w-3/4 flex flex-col">
          {/* Header - Only visible on desktop */}
          <div className="hidden md:block bg-white border-b border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  Question {currentQuestionIndex + 1} of {testQuestions.length}
                </h1>
                <p className="text-sm md:text-base text-gray-600 capitalize">
                  Difficulty: {currentQuestion.difficulty?.replace("_", " ")}
                </p>
              </div>
              <button
                onClick={handleSubmitTest}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-4 sm:px-5 md:px-6 py-2 rounded-lg md:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base w-full sm:w-auto"
              >
                Submit Assessment
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 justify-center overflow-y-auto">
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-300">
                <div className="mb-6 md:mb-8">
                  <div className="text-base sm:text-lg md:text-xl font-medium text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestionIndex] === index;
                    const isAnswered =
                      answers[currentQuestionIndex] !== undefined;
                    const isCorrectAnswer = index === currentQuestion.correct;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={isAnswered}
                        className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 ${
                          isAnswered
                            ? isCorrectAnswer
                              ? "bg-green-100 border-green-400 text-green-800 shadow-md"
                              : isSelected
                              ? "bg-red-100 border-red-400 text-red-800 shadow-md"
                              : "bg-gray-50 border-gray-200 text-gray-500"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 mr-3 md:mr-4 flex items-center justify-center ${
                              isAnswered && isCorrectAnswer
                                ? "bg-green-500 border-green-500"
                                : isAnswered && isSelected
                                ? "bg-red-500 border-red-500"
                                : isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isAnswered && isCorrectAnswer && (
                              <span className="text-white text-xs md:text-sm">
                                ✓
                              </span>
                            )}
                            {isAnswered && isSelected && !isCorrectAnswer && (
                              <span className="text-white text-xs md:text-sm">
                                ✗
                              </span>
                            )}
                            {!isAnswered && isSelected && (
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-semibold text-blue-600 mr-2 md:mr-3 text-sm md:text-base">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="flex-1 text-sm md:text-base">
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Show explanation if wrong answer */}
            {answers[currentQuestionIndex] !== undefined &&
              answers[currentQuestionIndex] !== currentQuestion.correct &&
              currentQuestion.explanation && (
                <div className="mt-4 md:mt-6 bg-orange-50 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-orange-200 w-full max-w-4xl mx-auto">
                  <div className="flex items-center mb-2 md:mb-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2 md:mr-3">
                      <span className="text-white font-bold text-xs md:text-sm">
                        !
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-orange-800">
                      Explanation
                    </h3>
                  </div>
                  <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {currentQuestion.explanation}
                  </div>
                </div>
              )}
          </div>
          <div className="bg-white border-t border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <div className="text-xs sm:text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </div>

              {answers[currentQuestionIndex] !== undefined && (
                <div className="mt-1 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffAssess;

// import { useState, useEffect } from "react";
// import {
//   Clock,
//   CheckCircle,
//   Circle,
//   BarChart3,
//   User,
//   Calendar,
// } from "lucide-react";

// const DiffAssess = ({
//   questionsData,
//   assessmentTitle = "Aptitude Test",
//   assessmentSubtitle = "Assessment",
// }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [showExplanation, setShowExplanation] = useState(false);
//   const [answers, setAnswers] = useState({});
//   const [questionTimes, setQuestionTimes] = useState({});
//   const [questionStartTime, setQuestionStartTime] = useState(null);
//   const [showResults, setShowResults] = useState(false);
//   const [testQuestions, setTestQuestions] = useState([]);
//   const [totalTestTime, setTotalTestTime] = useState(0);
//   const [testStartTime, setTestStartTime] = useState(null);
//   const [currentTime, setCurrentTime] = useState(0);

//   // Progressive difficulty state
//   const [currentDifficulty, setCurrentDifficulty] = useState("very_easy");
//   const [difficultyProgress, setDifficultyProgress] = useState({
//     very_easy: { correct: 0, total: 0 },
//     easy: { correct: 0, total: 0 },
//     moderate: { correct: 0, total: 0 },
//     difficult: { correct: 0, total: 0, wrong: 0 },
//   });
//   const [usedQuestions, setUsedQuestions] = useState(new Set());
//   const [assessmentEnded, setAssessmentEnded] = useState(false);

//   // Requirements for level progression
//   const progressionRules = {
//     very_easy: 3, // Need 3 correct to move to easy
//     easy: 3, // Need 5 correct to move to moderate
//     moderate: 3, // Need 7 correct to move to difficult
//     difficult: 3, // After 3 wrong answers, go back to moderate
//   };

//   // Timer effect
//   useEffect(() => {
//     let interval = null;
//     if (testStartTime && !showResults && !assessmentEnded) {
//       interval = setInterval(() => {
//         setCurrentTime(Date.now() - testStartTime);
//       }, 1000);
//     }
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [testStartTime, showResults, assessmentEnded]);

//   // Initialize test
//   useEffect(() => {
//     setTestStartTime(Date.now());
//     loadNextQuestion();
//   }, []);

//   useEffect(() => {
//     if (currentQuestionIndex >= 0 && testQuestions[currentQuestionIndex]) {
//       setQuestionStartTime(Date.now());
//     }
//   }, [currentQuestionIndex]);

//   const formatTime = (milliseconds) => {
//     const seconds = Math.floor(milliseconds / 1000);
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const loadNextQuestion = () => {
//     const questionsPool = questionsData[currentDifficulty] || [];
//     const availableQuestions = questionsPool.filter(
//       (q) => !usedQuestions.has(q.id)
//     );

//     if (availableQuestions.length === 0) {
//       // No more questions available in current difficulty
//       handleAssessmentEnd();
//       return;
//     }

//     const randomIndex = Math.floor(Math.random() * availableQuestions.length);
//     const nextQuestion = {
//       ...availableQuestions[randomIndex],
//       difficulty: currentDifficulty,
//     };

//     setTestQuestions((prev) => [...prev, nextQuestion]);
//     setUsedQuestions((prev) => new Set([...prev, nextQuestion.id]));
//     setQuestionStartTime(Date.now());
//   };

//   const handleAnswerSelect = (answerIndex) => {
//     if (answers[currentQuestionIndex] !== undefined) return;

//     const timeSpent = Date.now() - questionStartTime;
//     const currentQuestion = testQuestions[currentQuestionIndex];
//     const isCorrect = answerIndex === currentQuestion.correct;

//     // Save answer
//     setAnswers((prev) => ({
//       ...prev,
//       [currentQuestionIndex]: answerIndex,
//     }));

//     // Save time
//     setQuestionTimes((prev) => ({
//       ...prev,
//       [currentQuestionIndex]: timeSpent,
//     }));

//     // Update difficulty progress
//     const newProgress = { ...difficultyProgress };
//     newProgress[currentDifficulty].total += 1;

//     if (isCorrect) {
//       newProgress[currentDifficulty].correct += 1;
//     } else if (currentDifficulty === "difficult") {
//       newProgress[currentDifficulty].wrong += 1;
//     }

//     setDifficultyProgress(newProgress);

//     // Check for level transitions after a delay
//     setTimeout(() => {
//       checkLevelTransition(newProgress, isCorrect);
//     }, 500);
//   };

//   const checkLevelTransition = (progress, wasCorrect) => {
//     let newDifficulty = currentDifficulty;

//     if (currentDifficulty === "very_easy") {
//       if (progress.very_easy.correct >= progressionRules.very_easy) {
//         newDifficulty = "easy";
//       }
//     } else if (currentDifficulty === "easy") {
//       if (progress.easy.correct >= progressionRules.easy) {
//         newDifficulty = "moderate";
//       }
//     } else if (currentDifficulty === "moderate") {
//       if (progress.moderate.correct >= progressionRules.moderate) {
//         newDifficulty = "difficult";
//       }
//     } else if (currentDifficulty === "difficult") {
//       if (progress.difficult.wrong >= progressionRules.difficult) {
//         newDifficulty = "moderate";
//         // Reset difficult wrong counter when going back
//         setDifficultyProgress((prev) => ({
//           ...prev,
//           difficult: { ...prev.difficult, wrong: 0 },
//         }));
//       }
//     }

//     if (newDifficulty !== currentDifficulty) {
//       setCurrentDifficulty(newDifficulty);
//     }
//   };

//   const handleNextQuestion = () => {
//     if (answers[currentQuestionIndex] === undefined) {
//       alert("Please select an answer before proceeding");
//       return;
//     }

//     // Hide explanation if it was showing
//     setShowExplanation(false);

//     setCurrentQuestionIndex((prev) => prev + 1);
//     loadNextQuestion();
//   };

//   const handlePrevQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex((prev) => prev - 1);
//     }
//   };

//   const handleAssessmentEnd = () => {
//     setTotalTestTime(Date.now() - testStartTime);
//     setAssessmentEnded(true);
//     setShowResults(true);
//   };

//   const handleSubmitTest = () => {
//     const unanswered = testQuestions.filter(
//       (_, index) => answers[index] === undefined
//     ).length;

//     if (unanswered > 0) {
//       const confirmSubmit = window.confirm(
//         `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
//       );
//       if (!confirmSubmit) return;
//     }

//     handleAssessmentEnd();
//   };

//   const handleQuestionNavigation = (questionIndex) => {
//     if (questionIndex <= currentQuestionIndex) {
//       setCurrentQuestionIndex(questionIndex);
//     }
//   };

//   const getQuestionStatus = (index) => {
//     if (answers[index] !== undefined) return "answered";
//     if (index === currentQuestionIndex) return "current";
//     if (index < currentQuestionIndex) return "skipped";
//     return "locked";
//   };

//   const getAnsweredCount = () => {
//     return Object.keys(answers).length;
//   };

//   const getDifficultyColor = (difficulty) => {
//     const colors = {
//       very_easy: "bg-green-100 text-green-800 border-green-300",
//       easy: "bg-blue-100 text-blue-800 border-blue-300",
//       moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
//       difficult: "bg-red-100 text-red-800 border-red-300",
//     };
//     return colors[difficulty] || colors.moderate;
//   };

//   const ResultsScreen = () => {
//     const questionHistory = testQuestions.map((question, index) => ({
//       questionNumber: index + 1,
//       question: question.question,
//       selectedAnswer:
//         answers[index] !== undefined
//           ? question.options[answers[index]]
//           : "Not Answered",
//       correctAnswer: question.options[question.correct],
//       isCorrect: answers[index] === question.correct,
//       difficulty: question.difficulty || "moderate",
//       timeTaken: questionTimes[index] || 0,
//     }));

//     const totalQuestions = testQuestions.length;
//     const correctAnswers = questionHistory.filter((q) => q.isCorrect).length;
//     const accuracy =
//       totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
//     const averageTime = totalQuestions > 0 ? totalTestTime / totalQuestions : 0;

//     const difficultyStats = {
//       very_easy: questionHistory.filter((q) => q.difficulty === "very_easy"),
//       easy: questionHistory.filter((q) => q.difficulty === "easy"),
//       moderate: questionHistory.filter((q) => q.difficulty === "moderate"),
//       difficult: questionHistory.filter((q) => q.difficulty === "difficult"),
//     };

//     const difficultyAccuracy = Object.keys(difficultyStats).map((diff) => ({
//       difficulty: diff,
//       total: difficultyStats[diff].length,
//       correct: difficultyStats[diff].filter((q) => q.isCorrect).length,
//       accuracy:
//         difficultyStats[diff].length > 0
//           ? (difficultyStats[diff].filter((q) => q.isCorrect).length /
//               difficultyStats[diff].length) *
//             100
//           : 0,
//       avgTime:
//         difficultyStats[diff].length > 0
//           ? difficultyStats[diff].reduce((sum, q) => sum + q.timeTaken, 0) /
//             difficultyStats[diff].length
//           : 0,
//     }));

//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
//         <div className="container mx-auto px-4">
//           <div className="max-w-6xl mx-auto">
//             <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
//               <div className="text-center mb-8">
//                 <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <BarChart3 className="w-10 h-10 text-white" />
//                 </div>
//                 <h1 className="text-4xl font-bold text-gray-800 mb-2">
//                   Assessment Completed!
//                 </h1>
//                 <p className="text-gray-600">Here's your performance summary</p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200">
//                   <div className="text-3xl font-bold text-blue-600 mb-2">
//                     {totalQuestions}
//                   </div>
//                   <div className="text-gray-700 font-medium">
//                     Total Questions
//                   </div>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200">
//                   <div className="text-3xl font-bold text-green-600 mb-2">
//                     {correctAnswers}
//                   </div>
//                   <div className="text-gray-700 font-medium">
//                     Correct Answers
//                   </div>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center border border-purple-200">
//                   <div className="text-3xl font-bold text-purple-600 mb-2">
//                     {accuracy.toFixed(1)}%
//                   </div>
//                   <div className="text-gray-700 font-medium">Accuracy</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center border border-orange-200">
//                   <div className="text-3xl font-bold text-orange-600 mb-2">
//                     {formatTime(averageTime)}
//                   </div>
//                   <div className="text-gray-700 font-medium">
//                     Avg Time/Question
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                 <div className="bg-gray-50 rounded-2xl p-6">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">
//                     Difficulty Analysis
//                   </h3>
//                   <div className="space-y-4">
//                     {difficultyAccuracy.map((stat, index) => (
//                       <div key={index} className="bg-white p-4 rounded-lg">
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="font-semibold capitalize">
//                             {stat.difficulty.replace("_", " ")}
//                           </span>
//                           <span className="font-bold text-gray-700">
//                             {stat.accuracy.toFixed(1)}%
//                           </span>
//                         </div>
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div
//                             className="h-2 rounded-full bg-blue-500"
//                             style={{ width: `${stat.accuracy}%` }}
//                           ></div>
//                         </div>
//                         <div className="text-sm text-gray-600 mt-1">
//                           {stat.correct}/{stat.total} correct • Avg:{" "}
//                           {formatTime(stat.avgTime)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="bg-blue-50 rounded-2xl p-6">
//                   <h3 className="text-xl font-bold text-gray-800 mb-4">
//                     Performance Summary
//                   </h3>
//                   <div className="bg-white p-4 rounded-lg">
//                     <div className="text-sm text-gray-600 space-y-2">
//                       <p>
//                         • Fastest Question:{" "}
//                         {formatTime(
//                           Math.min(...questionHistory.map((q) => q.timeTaken))
//                         )}
//                       </p>
//                       <p>
//                         • Slowest Question:{" "}
//                         {formatTime(
//                           Math.max(...questionHistory.map((q) => q.timeTaken))
//                         )}
//                       </p>
//                       <p>• Total Test Time: {formatTime(totalTestTime)}</p>
//                       <p>
//                         • Questions per Minute:{" "}
//                         {(totalQuestions / (totalTestTime / 60000)).toFixed(1)}
//                       </p>
//                       <p className="mt-4 pt-4 border-t border-gray-200 font-semibold">
//                         Highest Level Reached:{" "}
//                         <span className="capitalize text-blue-600">
//                           {currentDifficulty.replace("_", " ")}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-2xl p-6 mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
//                   <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
//                   Question Review
//                 </h2>
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {questionHistory.map((q, index) => (
//                     <div
//                       key={index}
//                       className={`p-4 rounded-xl border-2 ${
//                         q.isCorrect
//                           ? "border-green-300 bg-green-50"
//                           : answers[index] !== undefined
//                           ? "border-red-300 bg-red-50"
//                           : "border-gray-300 bg-gray-50"
//                       }`}
//                     >
//                       <div className="flex justify-between items-start mb-2">
//                         <div className="flex items-center gap-2">
//                           <span className="font-semibold text-gray-800">
//                             Q{q.questionNumber}
//                           </span>
//                           <span
//                             className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
//                               q.difficulty
//                             )}`}
//                           >
//                             {q.difficulty.replace("_", " ").toUpperCase()}
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-4">
//                           <span className="text-sm text-gray-600">
//                             {formatTime(q.timeTaken)}
//                           </span>
//                           <span
//                             className={`text-lg font-bold ${
//                               q.isCorrect
//                                 ? "text-green-600"
//                                 : answers[index] !== undefined
//                                 ? "text-red-600"
//                                 : "text-gray-400"
//                             }`}
//                           >
//                             {q.isCorrect
//                               ? "✓"
//                               : answers[index] !== undefined
//                               ? "✗"
//                               : "-"}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-sm text-gray-700 mb-2">
//                         {q.question}
//                       </div>
//                       <div className="text-xs text-gray-600">
//                         Your answer:{" "}
//                         <span
//                           className={`font-semibold ${
//                             q.isCorrect
//                               ? "text-green-600"
//                               : answers[index] !== undefined
//                               ? "text-red-600"
//                               : "text-gray-400"
//                           }`}
//                         >
//                           {q.selectedAnswer}
//                         </span>
//                         {!q.isCorrect && answers[index] !== undefined && (
//                           <span className="ml-2">
//                             | Correct:{" "}
//                             <span className="text-green-600 font-semibold">
//                               {q.correctAnswer}
//                             </span>
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="text-center">
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
//                 >
//                   Take Assessment Again
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (showResults) {
//     return <ResultsScreen />;
//   }

//   if (testQuestions.length === 0) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <div className="text-xl font-semibold text-gray-600">
//             Loading Assessment...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const currentQuestion = testQuestions[currentQuestionIndex];

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="flex h-screen">
//         {/* Left Sidebar */}
//         <div className="w-1/4 bg-gradient-to-b from-blue-50 to-purple-50 border-r border-gray-200 p-6 pt-20 overflow-y-scroll">
//           <div className="mb-8">
//             <div className="flex items-start mb-4">
//               <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h2 className="font-bold text-gray-800 -mt-1">
//                   {assessmentTitle}
//                 </h2>
//                 <p className="text-sm text-gray-600">{assessmentSubtitle}</p>
//               </div>
//             </div>

//             {/* Current Difficulty */}
//             <div
//               className={`rounded-2xl p-4 mb-4 shadow-sm border-2 ${getDifficultyColor(
//                 currentDifficulty
//               )}`}
//             >
//               <div className="text-sm font-medium mb-1">Current Level</div>
//               <div className="text-lg font-bold capitalize">
//                 {currentDifficulty.replace("_", " ")}
//               </div>
//               <div className="text-xs mt-2">
//                 {currentDifficulty === "very_easy" &&
//                   `${difficultyProgress.very_easy.correct}/3 correct to advance`}
//                 {currentDifficulty === "easy" &&
//                   `${difficultyProgress.easy.correct}/3 correct to advance`}
//                 {currentDifficulty === "moderate" &&
//                   `${difficultyProgress.moderate.correct}/3 correct to advance`}
//                 {currentDifficulty === "difficult" &&
//                   `${difficultyProgress.difficult.wrong}/3 wrong to go back`}
//               </div>
//             </div>

//             {/* Timer */}
//             <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
//               <div className="flex items-center mb-2">
//                 <Clock className="w-4 h-4 text-blue-600 mr-2" />
//                 <span className="text-sm font-medium text-gray-700">
//                   Time Elapsed
//                 </span>
//               </div>
//               <div className="text-2xl font-bold text-gray-800">
//                 {formatTime(currentTime)}
//               </div>
//             </div>

//             {/* Progress */}
//             <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
//               <div className="flex items-center mb-2">
//                 <BarChart3 className="w-4 h-4 text-green-600 mr-2" />
//                 <span className="text-sm font-medium text-gray-700">
//                   Progress
//                 </span>
//               </div>
//               <div className="text-sm text-gray-600 mb-2">
//                 {getAnsweredCount()} of {testQuestions.length} answered
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
//                   style={{
//                     width: `${
//                       (getAnsweredCount() / testQuestions.length) * 100
//                     }%`,
//                   }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Content */}
//         <div className="w-3/4 flex flex-col">
//           {/* Header */}
//           <div className="bg-white border-b border-gray-200 p-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-800">
//                   Question {currentQuestionIndex + 1} of {testQuestions.length}
//                 </h1>
//                 <p className="text-gray-600 capitalize">
//                   Difficulty: {currentQuestion.difficulty?.replace("_", " ")}
//                 </p>
//               </div>
//               <button
//                 onClick={handleSubmitTest}
//                 className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
//               >
//                 Submit Assessment
//               </button>
//             </div>
//           </div>
//           {/* Question Content */}
//           <div className="flex-1 p-6 justify-center overflow-y-auto">
//             <div className="relative max-w-4xl mx-auto">
//               <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
//                 <div className="mb-8">
//                   <div className="text-xl font-medium text-gray-800 leading-relaxed">
//                     {currentQuestion.question}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 mb-8">
//                   {currentQuestion.options.map((option, index) => {
//                     const isSelected = answers[currentQuestionIndex] === index;
//                     const isAnswered =
//                       answers[currentQuestionIndex] !== undefined;
//                     const isCorrectAnswer = index === currentQuestion.correct;

//                     return (
//                       <button
//                         key={index}
//                         onClick={() => handleAnswerSelect(index)}
//                         disabled={isAnswered}
//                         className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
//                           isAnswered
//                             ? isCorrectAnswer
//                               ? "bg-green-100 border-green-400 text-green-800 shadow-md"
//                               : isSelected
//                               ? "bg-red-100 border-red-400 text-red-800 shadow-md"
//                               : "bg-gray-50 border-gray-200 text-gray-500"
//                             : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer"
//                         }`}
//                       >
//                         <div className="flex items-center">
//                           <div
//                             className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
//                               isAnswered && isCorrectAnswer
//                                 ? "bg-green-500 border-green-500"
//                                 : isAnswered && isSelected
//                                 ? "bg-red-500 border-red-500"
//                                 : isSelected
//                                 ? "bg-blue-500 border-blue-500"
//                                 : "border-gray-300"
//                             }`}
//                           >
//                             {isAnswered && isCorrectAnswer && (
//                               <span className="text-white text-sm">✓</span>
//                             )}
//                             {isAnswered && isSelected && !isCorrectAnswer && (
//                               <span className="text-white text-sm">✗</span>
//                             )}
//                             {!isAnswered && isSelected && (
//                               <div className="w-2 h-2 bg-white rounded-full"></div>
//                             )}
//                           </div>
//                           <span className="font-semibold text-blue-600 mr-3">
//                             {String.fromCharCode(65 + index)}.
//                           </span>
//                           <span className="flex-1">{option}</span>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//             {/* Show explanation if wrong answer */}
//             {answers[currentQuestionIndex] !== undefined &&
//               answers[currentQuestionIndex] !== currentQuestion.correct &&
//               currentQuestion.explanation && (
//                 <div className="mt-6 bg-orange-50 rounded-2xl p-6 border-2 border-orange-200 w-full h-40">
//                   <div className="flex items-center mb-3">
//                     <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
//                       <span className="text-white font-bold text-sm">!</span>
//                     </div>
//                     <h3 className="text-lg font-bold text-orange-800">
//                       Explanation
//                     </h3>
//                   </div>
//                   <div className="text-gray-700 leading-relaxed">
//                     {currentQuestion.explanation}
//                   </div>
//                 </div>
//               )}
//           </div>
//           <div className="bg-white border-t border-gray-200 p-6">
//             <div className="flex justify-between items-center max-w-4xl mx-auto">
//               {/* <button
//                 onClick={handlePrevQuestion}
//                 disabled={currentQuestionIndex === 0}
//                 className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
//                   currentQuestionIndex === 0
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm hover:shadow-md"
//                 }`}
//               >
//                 ← Previous
//               </button> */}

//               <div className="text-sm text-gray-600">
//                 Question {currentQuestionIndex + 1} of {testQuestions.length}
//               </div>

//               {/* Empty div to maintain spacing */}
//               {/* <div className="w-32"></div> */}
//               {answers[currentQuestionIndex] !== undefined && (
//                 <div className="mt-1 flex justify-end">
//                   <button
//                     onClick={handleNextQuestion}
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                   >
//                     Next Question →
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DiffAssess;
