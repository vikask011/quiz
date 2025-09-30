import { useState, useEffect } from "react";
import { mixedQuestions } from "../assets/dataset/quiz-data.js";
import api from "../lib/api";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";

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
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);

  // Test configuration: 1 very easy, 3 easy, 3 moderate, 3 difficult = 10 total
  const testConfig = {
    very_easy: 8,
    easy: 7,
    moderate: 8,
    difficult: 7,
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

  // const generateTestQuestions = () => {
  //   const selectedQuestions = [];

  //   Object.keys(testConfig).forEach((difficulty) => {
  //     const questionsPool = mixedQuestions[difficulty];
  //     const count = testConfig[difficulty];

  //     // Shuffle and select required number of questions
  //     const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);
  //     const selected = shuffled.slice(0, count);

  //     selectedQuestions.push(...selected);
  //   });

  //   // Shuffle the final test questions
  //   const shuffledTest = selectedQuestions.sort(() => Math.random() - 0.5);
  //   setTestQuestions(shuffledTest);

  //   if (shuffledTest.length > 0) {
  //     setCurrentQuestion(shuffledTest[0]);
  //     setQuestionStartTime(Date.now());
  //     setCurrentQuestionTime(0);
  //   }
  // };

  const generateTestQuestions = () => {
    // console.log("=== Starting Test Generation ===");
    // console.log("Available difficulties:", Object.keys(mixedQuestions));

    const selectedQuestions = [];
    const errors = [];

    // Iterate through each difficulty level in testConfig
    Object.entries(testConfig).forEach(([difficulty, count]) => {
      const questionsPool = mixedQuestions[difficulty];

      console.log(`\n${difficulty}:`);
      console.log(`  Required: ${count}`);
      console.log(`  Available: ${questionsPool?.length || 0}`);

      // Validate questions pool exists and has questions
      if (
        !questionsPool ||
        !Array.isArray(questionsPool) ||
        questionsPool.length === 0
      ) {
        const error = `No questions available for difficulty: ${difficulty}`;
        console.error(`  ❌ ${error}`);
        errors.push(error);
        return;
      }

      // Check if we have enough questions
      if (questionsPool.length < count) {
        console.warn(
          `  ⚠️ Only ${questionsPool.length} questions available, need ${count}`
        );
      }

      // Create a shuffled copy and select questions
      const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);

      const selected = shuffled.slice(0, Math.min(count, questionsPool.length));

      // console.log(`  ✅ Selected: ${selected.length} questions`);

      // Add difficulty field if it doesn't exist
      const questionsWithDifficulty = selected.map((q) => ({
        ...q,
        difficulty: q.difficulty || difficulty,
      }));

      selectedQuestions.push(...questionsWithDifficulty);
    });

    // console.log(
    // `\n=== Total Selected: ${selectedQuestions.length} questions ===`
    // );

    // Show errors if any
    if (errors.length > 0) {
      console.error("Errors encountered:", errors);
      alert(`Failed to load questions:\n${errors.join("\n")}`);
    }

    // Shuffle all selected questions together
    const shuffledTest = selectedQuestions.sort(() => Math.random() - 0.5);

    // Log final distribution
    const distribution = {};
    shuffledTest.forEach((q) => {
      distribution[q.difficulty] = (distribution[q.difficulty] || 0) + 1;
    });
    // console.log("Final distribution:", distribution);

    setTestQuestions(shuffledTest);

    if (shuffledTest.length > 0) {
      setCurrentQuestion(shuffledTest[0]);
      setQuestionStartTime(Date.now());
      setCurrentQuestionTime(0);
    } else {
      console.error("No questions were generated!");
      alert("Failed to generate test. Please check console for details.");
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
        selectedIndex: answerIndex,
        isCorrect,
        timeTaken,
        difficulty: currentQuestion.difficulty || "moderate",
      },
    ]);
  };

  const handleNextQuestion = () => {
    const allAnswered =
      questionHistory.length === testQuestions.length &&
      testQuestions.length > 0;
    if (questionNumber >= testQuestions.length) {
      if (allAnswered) {
        setTestEnded(true);
        setShowResults(true);
      } else {
        // Jump to the first unanswered question
        const unansweredIdx = Array.from(
          { length: testQuestions.length },
          (_, i) => i
        ).find((i) => !questionHistory.find((q) => q.questionNumber === i + 1));
        if (unansweredIdx !== undefined) {
          goToQuestion(unansweredIdx);
        }
      }
      return;
    }

    setQuestionNumber((prev) => prev + 1);
    setCurrentQuestion(testQuestions[questionNumber]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuestionStartTime(Date.now());
    setCurrentQuestionTime(0);
  };

  const getAnsweredCount = () => questionHistory.length;

  const findHistoryEntry = (qIndex) =>
    questionHistory.find((q) => q.questionNumber === qIndex + 1);

  const getQuestionStatus = (qIndex) => {
    if (qIndex + 1 === questionNumber) return "current";
    return findHistoryEntry(qIndex) ? "answered" : "unanswered";
  };

  const goToQuestion = (qIndex) => {
    if (!testQuestions[qIndex]) return;
    setQuestionNumber(qIndex + 1);
    setCurrentQuestion(testQuestions[qIndex]);
    setSelectedAnswer(null);
    setIsAnswered(false);

    const entry = findHistoryEntry(qIndex);
    if (entry) {
      setSelectedAnswer(entry.selectedIndex ?? null);
      setIsAnswered(true);
    }

    setQuestionStartTime(Date.now());
    setCurrentQuestionTime(0);
  };

  const handlePrevQuestion = () => {
    if (questionNumber > 1) {
      goToQuestion(questionNumber - 2);
    }
  };

  const handleQuestionNavigation = (idx) => {
    goToQuestion(idx);
  };

  const handleSubmitTest = () => {
    const allAnswered =
      questionHistory.length === testQuestions.length &&
      testQuestions.length > 0;
    if (!allAnswered) return;
    setTestEnded(true);
    setShowResults(true);
  };

  const ResultsScreen = () => {
    const totalQuestions = questionHistory.length;
    const correctAnswers = questionHistory.filter((q) => q.isCorrect).length;
    const totalTime = questionHistory.reduce((sum, q) => sum + q.timeTaken, 0);
    const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;
    const [postError, setPostError] = useState("");
    const [savedId, setSavedId] = useState("");

    useEffect(() => {
      const postOnce = async () => {
        if (submitted) return;
        try {
          const { data } = await api.post("/api/results", {
            totalQuestions,
            correct: correctAnswers,
            wrong: Math.max(0, totalQuestions - correctAnswers),
            avgTimeSec: Number((averageTime / 1000).toFixed(2)),
            questions: questionHistory,
          });
          setSavedId(data?.result?._id || "");
          setPostError("");
        } catch (err) {
          setPostError(err?.response?.data?.message || "Failed to save result");
        } finally {
          setSubmitted(true);
        }
      };
      postOnce();
    }, [
      submitted,
      totalQuestions,
      correctAnswers,
      averageTime,
      questionHistory,
    ]);
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
          <div
            id="report-card"
            className="bg-white/65 rounded-2xl shadow-xl p-8 border border-gray-200 h-120 overflow-y-scroll"
          >
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
              Test Results
            </h1>
            <h6 className="text-md text-center text-gray-800 mb-8">
              (Note: To view completed questions and answers, please download
              the report card from the "Previous Results" section.)
            </h6>

            <div className="flex justify-center mb-4">
              <button
                onClick={async () => {
                  try {
                    const pdf = new jsPDF({
                      orientation: "p",
                      unit: "pt",
                      format: "a4",
                    });
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    // Access user details for the styled header

                    // Colors
                    const blue = [37, 99, 235]; // #2563eb
                    const orange = [249, 115, 22]; // #f97316
                    const green = [22, 163, 74]; // #16a34a
                    const red = [220, 38, 38]; // #dc2626
                    const slate = [30, 41, 59]; // #1e293b

                    // Header banner
                    pdf.setFillColor(...blue);
                    pdf.roundedRect(20, 20, pageWidth - 40, 80, 12, 12, "F");
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(22);
                    pdf.text("NeuroQuiz — Marks Card", pageWidth / 2, 65, {
                      align: "center",
                    });
                    pdf.setFillColor(...orange);
                    pdf.circle(pageWidth - 60, 40, 6, "F");

                    // User card
                    const userTop = 120;
                    pdf.setFillColor(255, 255, 255);
                    pdf.roundedRect(
                      20,
                      userTop,
                      pageWidth - 40,
                      90,
                      10,
                      10,
                      "F"
                    );
                    pdf.setDrawColor(230, 236, 245);
                    pdf.roundedRect(
                      20,
                      userTop,
                      pageWidth - 40,
                      90,
                      10,
                      10,
                      "S"
                    );

                    const initials = (user?.name || "User")
                      .split(/\s+/)
                      .map((w) => w[0]?.toUpperCase() || "")
                      .slice(0, 2)
                      .join("");
                    pdf.setFillColor(...orange);
                    pdf.circle(50, userTop + 45, 22, "F");
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFontSize(14);
                    pdf.text(initials || "U", 50, userTop + 50, {
                      align: "center",
                    });

                    pdf.setTextColor(...slate);
                    pdf.setFontSize(12);
                    const testDate = new Date().toLocaleString();
                    pdf.text(`Name: ${user?.name || ""}`, 90, userTop + 30);
                    pdf.text(`Email: ${user?.email || ""}`, 90, userTop + 50);
                    pdf.text(`Test Date: ${testDate}`, 90, userTop + 70);

                    // Compute metrics
                    const totalQuestions = questionHistory.length;
                    const correctAnswers = questionHistory.filter(
                      (q) => q.isCorrect
                    ).length;
                    const wrongAnswers = Math.max(
                      0,
                      totalQuestions - correctAnswers
                    );
                    const totalTime = questionHistory.reduce(
                      (s, q) => s + q.timeTaken,
                      0
                    );
                    const avgSec = totalQuestions
                      ? totalTime / totalQuestions / 1000
                      : 0;

                    // Summary cards row
                    const cardsTop = userTop + 110;
                    const gap = 16;
                    const cardW = (pageWidth - 40 - gap * 3) / 4;
                    const metrics = [
                      {
                        label: "Total",
                        value: String(totalQuestions),
                        color: blue,
                      },
                      {
                        label: "Correct",
                        value: String(correctAnswers),
                        color: green,
                      },
                      {
                        label: "Wrong",
                        value: String(wrongAnswers),
                        color: red,
                      },
                      {
                        label: "Avg Time",
                        value: `${avgSec.toFixed(2)}s`,
                        color: orange,
                      },
                    ];
                    let x = 20;
                    metrics.forEach((m) => {
                      pdf.setFillColor(255, 255, 255);
                      pdf.roundedRect(x, cardsTop, cardW, 90, 10, 10, "F");
                      pdf.setDrawColor(230, 236, 245);
                      pdf.roundedRect(x, cardsTop, cardW, 90, 10, 10, "S");
                      pdf.setFillColor(...m.color);
                      pdf.roundedRect(x, cardsTop, cardW, 10, 10, 10, "F");
                      pdf.setTextColor(...slate);
                      pdf.setFontSize(12);
                      pdf.text(m.label, x + 12, cardsTop + 32);
                      pdf.setFontSize(22);
                      pdf.setTextColor(...m.color);
                      pdf.text(m.value, x + 12, cardsTop + 64);
                      x += cardW + gap;
                    });

                    // Divider and lines
                    const linesTop = cardsTop + 120;
                    pdf.setDrawColor(230, 236, 245);
                    pdf.line(20, linesTop, pageWidth - 20, linesTop);
                    pdf.setTextColor(...slate);
                    pdf.setFontSize(12);
                    let ly = linesTop + 24;
                    pdf.text(`Total Questions: ${totalQuestions}`, 40, ly);
                    ly += 18;
                    pdf.text(`Correct: ${correctAnswers}`, 40, ly);
                    ly += 18;
                    pdf.text(`Wrong: ${wrongAnswers}`, 40, ly);
                    ly += 18;
                    pdf.text(
                      `Average Time per Question: ${avgSec.toFixed(2)}s`,
                      40,
                      ly
                    );

                    // Footer ribbon
                    pdf.setFillColor(...blue);
                    pdf.roundedRect(
                      20,
                      pageHeight - 40,
                      pageWidth - 40,
                      10,
                      6,
                      6,
                      "F"
                    );

                    const stamp = new Date()
                      .toISOString()
                      .slice(0, 19)
                      .replace(/[:T]/g, "-");
                    const name = user?.name
                      ? user.name.replace(/\s+/g, "_")
                      : "user";
                    pdf.save(`report_${name}_${stamp}.pdf`);
                  } catch (e) {
                    console.error("Failed to generate report:", e);
                    alert("Failed to generate report");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
              >
                Download Report
              </button>
            </div>

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

            {postError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm text-center">
                {postError}
              </div>
            )}
            {savedId && (
              <div className="mb-4 text-center">
                <a
                  href={`/results/${savedId}`}
                  className="text-blue-600 underline"
                >
                  View detailed report
                </a>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

  const allAnswered =
    questionHistory.length === testQuestions.length && testQuestions.length > 0;
  const remainingToSubmit = Math.max(
    0,
    testQuestions.length - questionHistory.length
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-1/4 bg-gradient-to-b from-blue-50 to-purple-50 border-r border-gray-200 p-6 pt-20 overflow-y-scroll">
          {/* Test Info */}
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 -mt-1">Problems</h2>
                <p className="text-sm text-gray-600">Timed assessment</p>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Time Elapsed
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {formatTime(currentQuestionTime)}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
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
              {testQuestions.map((_, idx) => {
                const status = getQuestionStatus(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuestionNavigation(idx)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                      status === "answered"
                        ? "bg-green-500 text-white shadow-md hover:bg-green-600"
                        : status === "current"
                        ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300"
                        : "bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {idx + 1}
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
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>Not
                Answered
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-3/4 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Question {questionNumber} of {testQuestions.length}
                </h1>
                <p className="text-gray-600 capitalize">
                  Difficulty:{" "}
                  {currentQuestion.difficulty?.replace("_", " ") || "moderate"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!allAnswered && (
                  <span className="text-sm text-gray-500 hidden md:inline-block">
                    Answer {remainingToSubmit} more to enable submit
                  </span>
                )}
                <button
                  onClick={allAnswered ? handleSubmitTest : undefined}
                  disabled={!allAnswered}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    allAnswered
                      ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Submit Test
                </button>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                <div className="mb-8">
                  <div className="text-xl font-medium text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {currentQuestion.options.map((option, index) => {
                    let buttonClass =
                      "w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ";
                    if (isAnswered && index === selectedAnswer) {
                      buttonClass +=
                        "bg-blue-50 border-blue-400 text-blue-800 shadow-md";
                    } else if (!isAnswered) {
                      buttonClass +=
                        "bg-white border-gray-200 text-gray-700 hover:bg-blue-25 hover:border-blue-300 shadow-sm hover:shadow-md";
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
                        <div className="flex items-center">
                          <div
                            className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                              isAnswered && index === selectedAnswer
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isAnswered && index === selectedAnswer && (
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
                disabled={questionNumber === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  questionNumber === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-sm hover:shadow-md"
                }`}
              >
                ← Previous
              </button>

              <div className="text-sm text-gray-600">
                Question {questionNumber} of {testQuestions.length}
              </div>

              <button
                onClick={isAnswered ? handleNextQuestion : undefined}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  !isAnswered
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {questionNumber >= testQuestions.length
                  ? allAnswered
                    ? "View Results"
                    : "Review Unanswered →"
                  : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assess;
