import { useState, useEffect, useRef } from "react";
import { percentageQuestions } from "../assets/dataset/quiz-data.js";
import mygif from "../assets/images/firework.gif";

const Apti = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  //   const [isAnsweredCorrect, setIsAnsweredCorrect] = useState(false);
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

  //   const confettiRef = useRef(null);
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
      very_easy: "bg-green-100 text-green-800 border-green-200",
      easy: "bg-blue-100 text-blue-800 border-blue-200",
      moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
      difficult: "bg-red-100 text-red-800 border-red-200",
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
    const questionsPool = percentageQuestions[difficulty];

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
    // Logic to handle the next question
    setQuestionNumber((prev) => prev + 1);
    loadNextQuestion();
  };

  const handleEndPractice = () => {
    // Logic to end the practice
    setPracticeEnded(true);
    setShowResults(true);
  };

  const handleUnderstood = () => {
    // Logic to handle when the user understands the explanation
    setShowExplanation(false);
    loadNextQuestion();
  };

  const triggerCorrectEffects = () => {
    // Confetti burst
    // triggerConfetti();
    // Particle burst effect
    // triggerBurst();
    // Screen flash
    triggerFlash("success");
    // Flying congratulatory text
    triggerFlyingText("Excellent!", "success");
  };

  const triggerWrongEffects = () => {
    // Shake effect
    triggerShake();
    // Screen flash
    // triggerFlash("error");
    // Flying text showing correct answer
    const correctAnswer = currentQuestion.options[currentQuestion.correct];
    triggerFlyingText(`Correct Answer is: ${correctAnswer}`, "error");
  };

  //   const triggerConfetti = () => {
  //     if (confettiRef.current) {
  //       confettiRef.current.style.display = "block";
  //       confettiRef.current.style.animation = "confetti-burst 2s ease-out";
  //       setTimeout(() => {
  //         if (confettiRef.current) {
  //           confettiRef.current.style.display = "none";
  //           confettiRef.current.style.animation = "";
  //         }
  //       }, 2000);
  //     }
  //   };

  //   const triggerBurst = () => {
  //     if (burstRef.current) {
  //       burstRef.current.style.display = "block";
  //       burstRef.current.style.animation = "particle-burst 1.5s ease-out";
  //       setTimeout(() => {
  //         if (burstRef.current) {
  //           burstRef.current.style.display = "none";
  //           burstRef.current.style.animation = "";
  //         }
  //       }, 1500);
  //     }
  //   };

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
      <div className="relative z-10 container mx-auto mt-10 px-4 py-8">
        <div className="max-w-6xl mx-auto flex align-center justify-center">
          <div className="bg-white/65 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 h-120 overflow-y-scroll">
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
                      className="bg-white p-3 rounded-lg border-1 border-blue-500"
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
                    className={`p-4 rounded-lg border-1 transition-all hover:shadow-md ${
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
    <div>
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8 animate-fade-in">
          <div>
            <h1
              className="text-4xl font-mono font-bold text-gray-800 mb-2 animate-slide-in-left mt-4"
              style={{ paddingLeft: "20vw" }}
            >
              Aptitude: <span className="text-blue-600">Percentage</span>
            </h1>
          </div>

          <div className="flex flex-col items-end space-y-3 animate-slide-in-right">
            <div
              className={`px-4 py-2 rounded-xl border-2 font-semibold text-m transition-all duration-300 transform hover:scale-105 ${getDifficultyColor(
                currentDifficulty
              )}`}
            >
              {getDifficultyLabel(currentDifficulty)}
            </div>

            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-gray-200">
              <div className="text-xl font-mono font-bold text-gray-700">
                Duration: {formatTime(currentQuestionTime)}
              </div>
              {/* <div className="text-xs text-gray-500 text-center">
                Current Question
              </div> */}
            </div>
          </div>
        </div>

        <div className="relative max-w-4xl -mt-6 font-mono mx-auto flex flex-col items-center justify-center">
          <div
            ref={shakeRef}
            className="bg-white/25 w-[70%] backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-gray-200"
          >
            <div className="text-2xl font-semibold text-gray-800 mb-6 leading-relaxed">
              <span className="text-blue-600 font-bold">{questionNumber}.</span>{" "}
              {currentQuestion.question}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                let buttonClass =
                  "p-4 rounded-xl border-2 text-left font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg ";

                if (isAnswered) {
                  if (index === currentQuestion.correct) {
                    buttonClass +=
                      "bg-green-100 border-green-400 text-green-800 shadow-green-200 shadow-lg glow-green-once";
                  } else if (
                    index === selectedAnswer &&
                    index !== currentQuestion.correct
                  ) {
                    buttonClass +=
                      "bg-red-100 border-red-400 text-red-800 shadow-red-200 shadow-lg animate-pulse-red";
                  } else {
                    buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
                  }
                } else {
                  buttonClass +=
                    "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={isAnswered}
                  >
                    <span className="font-bold text-blue-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {isAnswered && !showExplanation && (
              <>
                <img
                  src={mygif}
                  alt="celebration"
                  className="absolute -top-10 -left-10 pointer-events-none"
                />
                <div className="flex justify-center animate-fade-in">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Next Question →
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="ml-110 mb-6">
            <button
              onClick={handleEndPractice}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              End Practice
            </button>
          </div>

          {showExplanation && (
            <div className="absolute top-0 w-full h-[80%] bg-orange-50/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-orange-200 animate-slide-in-up flex flex-col items-center justify-center">
              <div className="flex items-center mb-4 w-full">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <h3 className="text-xl font-bold text-orange-800">
                  Step-by-Step Solution
                </h3>
              </div>

              <div className="text-gray-700 text-lg mb-6 w-full leading-relaxed bg-white/70 p-4 rounded-xl">
                {currentQuestion.explanation}
              </div>

              <div className="flex w-full justify-end">
                <button
                  onClick={handleUnderstood}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  I Understood ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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

        @keyframes shake-wrong {
          0%,
          100% {
            transform: translateX(0);
          }
          10% {
            transform: translateX(-15px);
          } /* Start strong */
          20% {
            transform: translateX(15px);
          }
          30% {
            transform: translateX(-12px);
          } /* Weaken */
          40% {
            transform: translateX(12px);
          }
          50% {
            transform: translateX(-8px);
          } /* Continue weakening */
          60% {
            transform: translateX(8px);
          }
          70% {
            transform: translateX(-5px);
          } /* Almost done */
          80% {
            transform: translateX(5px);
          }
          90% {
            transform: translateX(-2px);
          } /* Gentle finish */
        }

        @keyframes glow-green-once {
          0% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.8),
              0 0 30px rgba(34, 197, 94, 0.6);
          }
          100% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
          }
        }

        @keyframes pulse-red {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes confetti-burst {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
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

        @keyframes screen-flash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
          }
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

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out;
        }

        .animate-glow-green {
          animation: glow-green 2s ease-in-out infinite;
        }

        .animate-pulse-red {
          animation: pulse-red 1s ease-in-out infinite;
        }

        .confetti-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }

        .confetti-0 {
          background: #ff6b6b;
          left: 10%;
          animation-delay: 0s;
        }

        .confetti-1 {
          background: #4ecdc4;
          left: 20%;
          animation-delay: 0.2s;
        }

        .confetti-2 {
          background: #45b7d1;
          left: 30%;
          animation-delay: 0.4s;
        }

        .confetti-3 {
          background: #f9ca24;
          left: 40%;
          animation-delay: 0.6s;
        }

        .confetti-4 {
          background: #6c5ce7;
          left: 50%;
          animation-delay: 0.8s;
        }

        .confetti-5 {
          background: #e17055;
          left: 15%;
          animation-delay: 0.1s;
        }

        .confetti:nth-child(5n + 1) {
          left: 60%;
          animation-delay: 1s;
        }
        .confetti:nth-child(5n + 2) {
          left: 70%;
          animation-delay: 1.2s;
        }
        .confetti:nth-child(5n + 3) {
          left: 80%;
          animation-delay: 1.4s;
        }
        .confetti:nth-child(5n + 4) {
          left: 90%;
          animation-delay: 1.6s;
        }
        .confetti:nth-child(5n + 5) {
          left: 95%;
          animation-delay: 1.8s;
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
