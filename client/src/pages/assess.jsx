import { useState, useEffect } from "react";
import { percentageQuestions } from "../assets/dataset/quiz-data.js";

const Assess = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  //   const [usedQuestions, setUsedQuestions] = useState(new Set());
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);

  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);

  // Test configuration: 1 very easy, 3 easy, 3 moderate, 3 difficult = 10 total
  const testConfig = {
    very_easy: 1,
    easy: 3,
    moderate: 3,
    difficult: 3,
  };

  useEffect(() => {
    let interval = null;
    if (questionStartTime && !isAnswered && !testEnded) {
      interval = setInterval(() => {
        setCurrentQuestionTime(Date.now() - questionStartTime);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [questionStartTime, isAnswered, testEnded]);

  useEffect(() => {
    if (!testEnded) {
      generateTestQuestions();
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

  const generateTestQuestions = () => {
    const selectedQuestions = [];

    Object.keys(testConfig).forEach((difficulty) => {
      const questionsPool = percentageQuestions[difficulty];
      const count = testConfig[difficulty];

      // Shuffle and select required number of questions
      const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      selectedQuestions.push(...selected);
    });

    // Shuffle the final test questions
    const shuffledTest = selectedQuestions.sort(() => Math.random() - 0.5);
    setTestQuestions(shuffledTest);

    if (shuffledTest.length > 0) {
      setCurrentQuestion(shuffledTest[0]);
      setQuestionStartTime(Date.now());
      setCurrentQuestionTime(0);
    }
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
        difficulty: currentQuestion.difficulty || "moderate",
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (questionNumber >= testQuestions.length) {
      setTestEnded(true);
      setShowResults(true);
      return;
    }

    setQuestionNumber((prev) => prev + 1);
    setCurrentQuestion(testQuestions[questionNumber]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuestionStartTime(Date.now());
    setCurrentQuestionTime(0);
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

    return (
      <div className="relative z-10 mx-auto container mt-10 px-4 py-8">
        <div className="max-w-6xl mx-auto flex align-center justify-center">
          <div className="bg-white/65 rounded-2xl shadow-xl p-8 border border-gray-200 h-120 overflow-y-scroll">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
              Test Results
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {totalQuestions}
                </div>
                <div className="text-gray-600">Questions</div>
              </div>
              <div className="bg-green-50 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {accuracy.toFixed(1)}%
                </div>
                <div className="text-gray-600">Accuracy</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl text-center">
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

              <div className="bg-blue-50 rounded-xl p-6">
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
                    <p>• Total Test Time: {formatTime(totalTime)}</p>
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
                Question Review
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questionHistory.map((q, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      q.isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
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
                          className={`text-lg ${
                            q.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {q.isCorrect ? "✓" : "✗"}
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
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
              >
                Take Test Again
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          Loading Test...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Aptitude Test: <span className="text-blue-600">Percentage</span>
        </h1>

        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow border">
            <span className="text-sm text-gray-600">Question</span>
            <div className="text-xl font-bold text-gray-800">
              {questionNumber} / 10
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded-lg shadow border">
            <span className="text-sm text-gray-600">Time</span>
            <div className="text-xl font-bold text-gray-800">
              {formatTime(currentQuestionTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-xl font-medium text-gray-800 mb-6">
            <span className="text-blue-600 font-bold">{questionNumber}.</span>{" "}
            {currentQuestion.question}
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              let buttonClass =
                "p-4 rounded-xl border-2 text-left transition-all duration-300 ";

              if (isAnswered && index === selectedAnswer) {
                buttonClass += "bg-blue-100 border-blue-400 text-blue-800";
              } else if (!isAnswered) {
                buttonClass +=
                  "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
              } else {
                buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
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

          {isAnswered && (
            <div className="flex justify-center">
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
              >
                {questionNumber >= 10 ? "View Results" : "Next Question →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assess;
