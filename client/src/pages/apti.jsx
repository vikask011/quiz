import { useState, useEffect, useRef } from "react";
import { mixedQuestions } from "../assets/dataset/quiz-data.js";
import mygif from "../assets/images/firework.gif";

const Apti = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState("very_easy");
  const [difficultyProgress, setDifficultyProgress] = useState({
    very_easy: 0,
    easy: 0,
    moderate: 0,
    difficult: 0,
  });
  const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [practiceEnded, setPracticeEnded] = useState(false);

  const shakeRef = useRef(null);
  const burstRef = useRef(null);
  const flashRef = useRef(null);
  const flyingTextRef = useRef(null);

  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);

  useEffect(() => {
    let interval = null;
    if (questionStartTime && !isAnswered && !practiceEnded) {
      interval = setInterval(() => {
        setCurrentQuestionTime(Date.now() - questionStartTime);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [questionStartTime, isAnswered, practiceEnded]);

  useEffect(() => {
    if (!practiceEnded) {
      loadNextQuestion();
    }
  }, []);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      very_easy: "bg-green-100 text-green-800 border-green-300",
      easy: "bg-blue-100 text-blue-800 border-blue-300",
      moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
      difficult: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[difficulty];
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      very_easy: "Very Easy",
      easy: "Easy",
      moderate: "Moderate",
      difficult: "Difficult",
    };
    return labels[difficulty];
  };

  const getNextDifficulty = () => {
    const progress = difficultyProgress;

    if (progress.very_easy < 2) return "very_easy";
    if (progress.easy < 2) return "easy";
    if (progress.moderate < 2) return "moderate";
    return "difficult";
  };

  const loadNextQuestion = () => {
    const difficulty = getNextDifficulty();
    const questionsPool = mixedQuestions[difficulty];

    const availableQuestions = questionsPool.filter(
      (q) => !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) {
      setPracticeEnded(true);
      setShowResults(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const nextQuestion = availableQuestions[randomIndex];

    setCurrentQuestion(nextQuestion);
    setCurrentDifficulty(difficulty);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setUsedQuestions((prev) => new Set([...prev, nextQuestion.id]));
    setQuestionStartTime(Date.now());
    setCurrentQuestionTime(0);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;

    const timeTaken = Date.now() - questionStartTime;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestion.correct;

    setQuestionHistory((prev) => [
      ...prev,
      {
        questionNumber,
        question: currentQuestion.question,
        selectedAnswer: currentQuestion.options[answerIndex],
        correctAnswer: currentQuestion.options[currentQuestion.correct],
        isCorrect,
        timeTaken,
        difficulty: currentDifficulty,
      },
    ]);

    if (isCorrect) {
      triggerCorrectEffects();
      setDifficultyProgress((prev) => ({
        ...prev,
        [currentDifficulty]: prev[currentDifficulty] + 1,
      }));
    } else {
      triggerWrongEffects();
      setTimeout(() => {
        setShowExplanation(true);
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    setQuestionNumber((prev) => prev + 1);
    loadNextQuestion();
  };

  const handleEndPractice = () => {
    setPracticeEnded(true);
    setShowResults(true);
  };

  const handleUnderstood = () => {
    setShowExplanation(false);
    setQuestionNumber((prev) => prev + 1);
    loadNextQuestion();
  };

  

  const triggerFlash = (type) => {
    if (flashRef.current) {
      flashRef.current.className = `screen-flash ${
        type === "success" ? "flash-success" : "flash-error"
      }`;
      flashRef.current.style.display = "block";
      setTimeout(() => {
        if (flashRef.current) {
          flashRef.current.style.display = "none";
          flashRef.current.className = "screen-flash";
        }
      }, 500);
    }
  };

  const triggerFlyingText = (text, type) => {
    if (flyingTextRef.current) {
      flyingTextRef.current.textContent = text;
      flyingTextRef.current.className = `flying-text ${
        type === "success" ? "text-success" : "text-error"
      }`;
      flyingTextRef.current.style.display = "block";
      setTimeout(() => {
        if (flyingTextRef.current) {
          flyingTextRef.current.style.display = "none";
        }
      }, 4000);
    }
  };

  const triggerShake = () => {
    if (shakeRef.current) {
      shakeRef.current.style.animation = "shake-wrong 0.8s ease-in-out";
      setTimeout(() => {
        if (shakeRef.current) {
          shakeRef.current.style.animation = "";
        }
      }, 800);
    }
  };

  const ResultsScreen = () => {
    const totalQuestions = questionHistory.length;
    const correctAnswers = questionHistory.filter((q) => q.isCorrect).length;
    const totalTime = questionHistory.reduce((sum, q) => sum + q.timeTaken, 0);
    const averageTime = totalTime / totalQuestions;
    const accuracy = (correctAnswers / totalQuestions) * 100;

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

    const getRecommendations = () => {
      const recommendations = [];

      difficultyAccuracy.forEach((stat) => {
        if (stat.accuracy < 50 && stat.total > 0) {
          recommendations.push(
            `Focus more on ${stat.difficulty.replace("_", " ")} level questions`
          );
        }
        if (stat.avgTime > averageTime * 1.5 && stat.total > 0) {
          recommendations.push(
            `Work on speed for ${stat.difficulty.replace("_", " ")} questions`
          );
        }
      });

      if (recommendations.length === 0) {
        recommendations.push(
          "Great job! Keep practicing to maintain your performance"
        );
      }

      return recommendations;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                {accuracy >= 80
                  ? "Outstanding Performance!"
                  : accuracy >= 60
                  ? "Good Job!"
                  : "Keep Learning!"}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-blue-600">
                    {totalQuestions}
                  </div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div className="bg-green-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-green-600">
                    {correctAnswers}
                  </div>
                  <div className="text-gray-600">Correct</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-purple-600">
                    {accuracy.toFixed(1)}%
                  </div>
                  <div className="text-gray-600">Accuracy</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl text-center transform hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-orange-600">
                    {formatTime(averageTime)}
                  </div>
                  <div className="text-gray-600">Avg Time</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
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
                          <span
                            className={`font-bold ${
                              stat.accuracy >= 70
                                ? "text-green-600"
                                : stat.accuracy >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {stat.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stat.accuracy >= 70
                                ? "bg-green-500"
                                : stat.accuracy >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
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

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {getRecommendations().map((rec, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg border border-blue-200"
                      >
                        <p className="text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Performance Insights
                    </h4>
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
                      <p>• Total Practice Time: {formatTime(totalTime)}</p>
                      <p>
                        • Questions per Minute:{" "}
                        {(totalQuestions / (totalTime / 60000)).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Detailed History
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questionHistory.map((q, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        q.isCorrect
                          ? "border-green-500 bg-green-50 hover:bg-green-100"
                          : "border-red-500 bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">
                          Q{q.questionNumber}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              q.difficulty === "very_easy"
                                ? "bg-green-100 text-green-800"
                                : q.difficulty === "easy"
                                ? "bg-blue-100 text-blue-800"
                                : q.difficulty === "moderate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {q.difficulty.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600 font-mono">
                            {formatTime(q.timeTaken)}
                          </span>
                          <span
                            className={`text-lg ${
                              q.isCorrect ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {q.isCorrect ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2 font-medium">
                        {q.question}
                      </div>
                      <div className="text-xs text-gray-600">
                        Your answer:{" "}
                        <span
                          className={`font-semibold ${
                            q.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {q.selectedAnswer}
                        </span>
                        {!q.isCorrect && (
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

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start New Practice
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div
        ref={burstRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ display: "none" }}
      >
        <div className="burst-container">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`burst-particle burst-${i % 5}`}></div>
          ))}
        </div>
      </div>

      <div
        ref={flashRef}
        className="screen-flash"
        style={{ display: "none" }}
      ></div>

      <div
        ref={flyingTextRef}
        className="flying-text"
        style={{ display: "none" }}
      ></div>

      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white shadow-lg p-6 flex flex-col border-r border-gray-200">
          <button
            onClick={handleEndPractice}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors text-sm font-medium"
          >
            <span className="mr-2">←</span> Back to Selection
          </button>

          {/* Topic Card */}
         

          {/* Current Level */}
          <div className={`rounded-xl p-4 mb-6 border-2 ${getDifficultyColor(currentDifficulty)}`}>
            <div className="text-xs font-semibold mb-1 opacity-80">Current Level</div>
            <div className="text-xl font-bold">{getDifficultyLabel(currentDifficulty)}</div>
            
          </div>

          {/* Time Elapsed */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center text-gray-600 mb-2">
              <span className="mr-2">⏱</span>
              <span className="text-sm font-semibold">Time Elapsed</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {formatTime(currentQuestionTime)}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center text-gray-600 mb-2">
              <span className="mr-2">📊</span>
              <span className="text-sm font-semibold">Progress</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {questionHistory.length} of {questionHistory.length + 1} answered
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(questionHistory.length / (questionHistory.length + 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Question {questionNumber} of {questionNumber}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Difficulty: {getDifficultyLabel(currentDifficulty)}
              </p>
            </div>
            <button
              onClick={handleEndPractice}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md"
            >
              Submit Assessment
            </button>
          </div>

          {/* Question Card */}
          <div ref={shakeRef} className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative border border-gray-200">
            <div className="text-2xl font-semibold text-gray-800 mb-8">
              {currentQuestion.question}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((option, index) => {
                let buttonClass =
                  "p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 relative flex items-center ";

                if (isAnswered) {
                  if (index === currentQuestion.correct) {
                    buttonClass +=
                      "bg-green-50 border-green-400 text-green-800";
                  } else if (
                    index === selectedAnswer &&
                    index !== currentQuestion.correct
                  ) {
                    buttonClass +=
                      "bg-red-50 border-red-400 text-red-800";
                  } else {
                    buttonClass += "bg-gray-50 border-gray-200 text-gray-400";
                  }
                } else {
                  buttonClass +=
                    "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 cursor-pointer";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={isAnswered}
                  >
                    {isAnswered && index === currentQuestion.correct ? (
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">
                        ✓
                      </span>
                    ) : isAnswered && index === selectedAnswer && index !== currentQuestion.correct ? (
                      <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">
                        ✗
                      </span>
                    ) : (
                      <span className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3 flex-shrink-0"></span>
                    )}
                    <span>
                      <span className="font-bold text-blue-600 mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {isAnswered && !showExplanation && selectedAnswer === currentQuestion.correct && (
              <img
                src={mygif}
                alt="celebration"
                className="absolute -top-10 -right-10 w-32 h-32 pointer-events-none"
              />
            )}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-white animate-slide-in-up mb-6">
              <div className="flex items-center mb-4">
                
                <h3 className="text-lg font-bold text-black">Explanation</h3>
              </div>
              <div className="text-gray-700 text-base leading-relaxed">
                {currentQuestion.explanation}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Question {questionNumber} of {questionNumber}
            </div>
            {isAnswered && (
              <button
                onClick={showExplanation ? handleUnderstood : handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg flex items-center"
              >
                Next Question →
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake-wrong {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-15px); }
          20% { transform: translateX(15px); }
          30% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          50% { transform: translateX(-8px); }
          60% { transform: translateX(8px); }
          70% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
          90% { transform: translateX(-2px); }
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes screen-flash {
          0% { opacity: 0; }
          50% { opacity: 0.3; }
          100% { opacity: 0; }
        }

        @keyframes fly-to-center {
          0% {
            transform: translateX(-100vw) translateY(-100px) scale(0.8);
            opacity: 0;
          }
          30% {
            transform: translateX(-50vw) translateY(-150px) scale(1);
            opacity: 1;
          }
          70% {
            transform: translateX(-50vw) translateY(-150px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(-100vw) translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes particle-burst {
          0% {
            opacity: 1;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out;
        }

        .burst-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .burst-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: particle-burst 1.5s ease-out;
        }

        .burst-0 {
          background: #ff6b6b;
          transform: translate(0px, -50px);
        }
        .burst-1 {
          background: #4ecdc4;
          transform: translate(35px, -35px);
        }
        .burst-2 {
          background: #45b7d1;
          transform: translate(50px, 0px);
        }
        .burst-3 {
          background: #f9ca24;
          transform: translate(35px, 35px);
        }
        .burst-4 {
          background: #6c5ce7;
          transform: translate(0px, 50px);
        }

        .screen-flash {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 45;
          animation: screen-flash 0.5s ease-out;
        }

        .flash-success {
          background: radial-gradient(
            circle,
            rgba(34, 197, 94, 0.3) 0%,
            transparent 70%
          );
        }

        .flash-error {
          background: radial-gradient(
            circle,
            rgba(239, 68, 68, 0.3) 0%,
            transparent 70%
          );
        }

        .flying-text {
          position: fixed;
          top: 10%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2.5rem;
          font-weight: bold;
          pointer-events: none;
          z-index: 45;
          animation: fly-to-center 8s ease-in-out;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
        }

        .text-success {
          color: #22c55e;
          text-shadow: 2px 2px 4px rgba(34, 197, 94, 0.3);
        }

        .text-error {
          color: #ef4444;
          text-shadow: 2px 2px 4px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Apti;