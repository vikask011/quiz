import { useState, useEffect } from "react";
import { mixedQuestions } from "../assets/dataset/quiz-data.js";
import api from "../lib/api";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";
import { Clock, BarChart3, Sparkles } from "lucide-react";

const ADAPTIVE_CONFIG = {
  very_easy: { next: "easy", correctToAdvance: 2, prev: null },
  easy: { next: "moderate", correctToAdvance: 2, prev: "very_easy" },
  moderate: { next: "difficult", correctToAdvance: 2, prev: "easy" },
  difficult: { next: "difficult", correctToAdvance: 2, prev: "moderate" },
};

const DIFFICULTY_SEQUENCE = ["very_easy", "easy", "moderate", "difficult"];
const MAX_QUESTIONS = 30;

const AdaptiveAssess = () => {
  const { user } = useAuth();
  const [currentDifficulty, setCurrentDifficulty] = useState("very_easy");
  const [askedQuestions, setAskedQuestions] = useState({
    very_easy: [],
    easy: [],
    moderate: [],
    difficult: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [correctTrack, setCorrectTrack] = useState({
    very_easy: 0,
    easy: 0,
    moderate: 0,
    difficult: 0,
  });

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
    if (!testEnded && !currentQuestion) {
      askNextQuestion("very_easy");
    }
  }, []);

  const pickQuestion = (difficulty, alreadyAsked) => {
    const pool = mixedQuestions[difficulty].filter(
      (q, idx) => !alreadyAsked.includes(idx)
    );
    if (pool.length === 0) return null;
    const randIdx = Math.floor(Math.random() * pool.length);
    const origIdx = mixedQuestions[difficulty].findIndex(
      (q) => q === pool[randIdx]
    );
    return { ...pool[randIdx], difficulty, poolIndex: origIdx };
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const askNextQuestion = (difficulty) => {
    if (questionHistory.length >= MAX_QUESTIONS) {
      setTestEnded(true);
      setShowResults(true);
      return;
    }
    const askedIdxs = askedQuestions[difficulty];
    const questionObj = pickQuestion(difficulty, askedIdxs);
    if (!questionObj) {
      const prev = ADAPTIVE_CONFIG[difficulty].prev;
      if (prev) return askNextQuestion(prev);
      setTestEnded(true);
      setShowResults(true);
      return;
    }
    setCurrentDifficulty(difficulty);
    setCurrentQuestion(questionObj);
    setQuestionNumber(questionHistory.length + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuestionStartTime(Date.now());
    setCurrentQuestionTime(0);
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

  const handleAnswerSelect = (answerIndex) => {
    const timeTaken = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correct-1;
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    setAskedQuestions((prev) => ({
      ...prev,
      [currentDifficulty]: [
        ...prev[currentDifficulty],
        currentQuestion.poolIndex,
      ],
    }));

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
        difficulty: currentDifficulty,
      },
    ]);

    setCorrectTrack((prev) => {
      const upd = { ...prev };
      if (isCorrect) upd[currentDifficulty] = prev[currentDifficulty] + 1;
      return upd;
    });
  };

  const handleNextQuestion = () => {
    if (!isAnswered) return;

    let nextDifficulty = currentDifficulty;
    const lastQuestion = questionHistory[questionHistory.length - 1];
    const lastCorrect = lastQuestion?.isCorrect || false;

    if (lastCorrect) {
      if (
        ADAPTIVE_CONFIG[currentDifficulty].next &&
        correctTrack[currentDifficulty] >=
          ADAPTIVE_CONFIG[currentDifficulty].correctToAdvance
      ) {
        nextDifficulty = ADAPTIVE_CONFIG[currentDifficulty].next;
      }
    } else {
      const prevDifficulty = ADAPTIVE_CONFIG[currentDifficulty].prev;
      if (prevDifficulty) nextDifficulty = prevDifficulty;
    }

    askNextQuestion(nextDifficulty);
  };

  const handleSubmitTest = () => {
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
    const [aiSummary, setAiSummary] = useState("");
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState("");

    const accuracy = (correctAnswers / totalQuestions) * 100;
    const difficultyAccuracy = DIFFICULTY_SEQUENCE.map((difficulty) => {
      const questionsAtLevel = questionHistory.filter(
        (q) => q.difficulty === difficulty
      );
      const correctAtLevel = questionsAtLevel.filter((q) => q.isCorrect).length;
      const totalAtLevel = questionsAtLevel.length;
      const avgTimeAtLevel =
        totalAtLevel > 0
          ? questionsAtLevel.reduce((sum, q) => sum + q.timeTaken, 0) /
            totalAtLevel
          : 0;

      return {
        difficulty,
        total: totalAtLevel,
        correct: correctAtLevel,
        accuracy: totalAtLevel > 0 ? (correctAtLevel / totalAtLevel) * 100 : 0,
        avgTime: avgTimeAtLevel,
      };
    });

    // Save results to backend
    useEffect(() => {
      const saveResults = async () => {
        if (submitted) return;
        try {
          const payload = {
            totalQuestions,
            correct: correctAnswers,
            wrong: totalQuestions - correctAnswers,
            avgTimeSec: averageTime / 1000,
            questions: questionHistory.map((q) => ({
              questionNumber: q.questionNumber,
              question: q.question,
              selectedAnswer: q.selectedAnswer,
              correctAnswer: q.correctAnswer,
              isCorrect: q.isCorrect,
            })),
          };
          const { data } = await api.post(
            "https://quiz-woad-pi.vercel.app/api/results",
            payload
          );
          setSavedId(data.result._id);
          setSubmitted(true);
        } catch (e) {
          setPostError(e?.response?.data?.message || "Failed to save results");
        }
      };
      saveResults();
    }, []);

    const handleGenerateSummary = async () => {
      if (!savedId) {
        setSummaryError("Please wait for results to be saved first");
        return;
      }
      try {
        setSummaryError("");
        setLoadingSummary(true);
        const { data } = await api.post(
          `https://quiz-woad-pi.vercel.app/api/results/${savedId}/summary`
        );
        setAiSummary(data.summary);
      } catch (e) {
        setSummaryError(
          e?.response?.data?.message || "Failed to generate AI summary"
        );
      } finally {
        setLoadingSummary(false);
      }
    };

    const downloadPdf = async () => {
      try {
        const pdf = new jsPDF({
          orientation: "p",
          unit: "pt",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const blue = [37, 99, 235];
        const orange = [249, 115, 22];
        const green = [22, 163, 74];
        const red = [220, 38, 38];
        const slate = [30, 41, 59];
        const purple = [147, 51, 234];

        // Header
        pdf.setFillColor(...blue);
        pdf.roundedRect(20, 20, pageWidth - 40, 80, 12, 12, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(22);
        pdf.text("NeuroQuiz — Marks Card", pageWidth / 2, 65, {
          align: "center",
        });
        pdf.setFillColor(...orange);
        pdf.circle(pageWidth - 60, 40, 6, "F");

        // User info card
        const userTop = 120;
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(20, userTop, pageWidth - 40, 90, 10, 10, "F");
        pdf.setDrawColor(230, 236, 245);
        pdf.roundedRect(20, userTop, pageWidth - 40, 90, 10, 10, "S");

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

        // Metrics cards
        const wrongAnswers = totalQuestions - correctAnswers;
        const avgSec = totalQuestions ? averageTime / 1000 : 0;

        const cardsTop = userTop + 110;
        const gap = 16;
        const cardW = (pageWidth - 40 - gap * 3) / 4;
        const metrics = [
          { label: "Total", value: String(totalQuestions), color: blue },
          { label: "Correct", value: String(correctAnswers), color: green },
          { label: "Wrong", value: String(wrongAnswers), color: red },
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

        let y = cardsTop + 120;
        pdf.setDrawColor(230, 236, 245);
        pdf.line(20, y, pageWidth - 20, y);
        y += 24;

        pdf.setTextColor(...slate);
        pdf.setFontSize(12);
        pdf.text(`Total Questions: ${totalQuestions}`, 40, y);
        y += 18;
        pdf.text(`Correct: ${correctAnswers}`, 40, y);
        y += 18;
        pdf.text(`Wrong: ${wrongAnswers}`, 40, y);
        y += 18;
        pdf.text(`Average Time per Question: ${avgSec.toFixed(2)}s`, 40, y);
        y += 28;

        // AI Summary Section (if available)
        if (aiSummary && String(aiSummary).trim()) {
          pdf.addPage();
          let sy = 40;
          pdf.setFillColor(...purple);
          pdf.roundedRect(20, sy, pageWidth - 40, 50, 10, 10, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(18);
          pdf.text("AI Performance Summary", pageWidth / 2, sy + 32, {
            align: "center",
          });
          sy += 70;
          pdf.setTextColor(...slate);
          pdf.setFontSize(12);
          const lines = pdf.splitTextToSize(String(aiSummary), pageWidth - 80);
          lines.forEach((line) => {
            if (sy > pageHeight - 60) {
              pdf.addPage();
              sy = 40;
            }
            pdf.text(line, 40, sy);
            sy += 16;
          });
        }

        // Questions section - start on new page if needed
        if (aiSummary) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(...blue);
        pdf.text("Question Review:", 40, y);
        y += 20;
        pdf.setFontSize(12);
        questionHistory.forEach((q) => {
          const maxWidth = pageWidth - 80;
          const lineHeight = 14;

          pdf.setTextColor(...slate);
          pdf.text(`Q${q.questionNumber}: ${q.question}`, 40, y, {
            maxWidth,
          });
          y += lineHeight;

          pdf.setTextColor(...(q.isCorrect ? green : red));
          pdf.text(`Your answer: ${q.selectedAnswer}`, 60, y, { maxWidth });
          y += lineHeight;

          if (!q.isCorrect) {
            pdf.setTextColor(...green);
            pdf.text(`Correct answer: ${q.correctAnswer}`, 60, y, {
              maxWidth,
            });
            y += lineHeight;
          }

          y += 8;

          if (y > pageHeight - 80) {
            pdf.addPage();
            y = 40;
          }
        });

        // Footer
        pdf.setFillColor(...blue);
        pdf.roundedRect(20, pageHeight - 40, pageWidth - 40, 10, 6, 6, "F");

        const stamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:T]/g, "-");
        const name = user?.name ? user.name.replace(/\s+/g, "_") : "user";
        pdf.save(`report_${name}_${stamp}.pdf`);
      } catch (e) {
        console.error("Failed to generate report:", e);
        alert("Failed to generate report");
      }
    };

    return (
      <div className="relative z-10 mx-auto container mt-4 md:mt-10 px-2 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto flex align-center justify-center">
          <div
            id="report-card"
            className="bg-white/65 rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200 h-[90vh] md:h-120 overflow-y-scroll w-full"
          >
            <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-4 md:mb-8">
              Test Results
            </h1>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <button
                onClick={downloadPdf}
                className="font-semibold px-4 md:px-6 py-2 rounded-lg text-sm md:text-base bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              >
                Download Report
              </button>
              {savedId && (
                <a
                  href={`https://quiz-jmux.vercel.app/results/${savedId}`}
                  className="font-semibold px-4 md:px-6 py-2 rounded-lg text-sm md:text-base bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200 inline-block text-center"
                >
                  View Detailed Report
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <div className="bg-blue-50 p-3 sm:p-4 md:p-6 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {totalQuestions}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">
                  Questions
                </div>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 md:p-6 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">
                  Correct
                </div>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 md:p-6 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {accuracy.toFixed(1)}%
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">
                  Accuracy
                </div>
              </div>
              <div className="bg-orange-50 p-3 sm:p-4 md:p-6 rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {formatTime(averageTime)}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">
                  Avg Time
                </div>
              </div>
            </div>

            {postError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm text-center">
                {postError}
              </div>
            )}

            {/* AI Summary Section */}
            <div className="bg-white border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <h2 className="text-lg sm:text-xl font-bold text-purple-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  To view summary go to results section
                </h2>
              </div>
              {summaryError ? (
                <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
                  {summaryError}
                </div>
              ) : aiSummary ? (
                <div className="whitespace-pre-wrap text-gray-800 text-sm">
                  {aiSummary}
                </div>
              ) : (
                <div className="text-gray-600 text-sm text-center">
                  {savedId ? (
                    "No AI summary yet. Click Generate Summary to get personalized feedback."
                  ) : (
                    <a
                      href="https://quiz-jmux.vercel.app/results"
                      className="inline-block mt-2 font-semibold px-6 py-2 rounded-lg text-sm md:text-base bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                    >
                      Previous Results
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                  Difficulty Analysis
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {difficultyAccuracy.map((stat, index) => (
                    <div key={index} className="bg-white p-3 md:p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold capitalize text-xs sm:text-sm md:text-base">
                          {stat.difficulty.replace("_", " ")}
                        </span>
                        <span className="font-bold text-gray-700 text-xs sm:text-sm md:text-base">
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

              <div className="bg-blue-50 rounded-xl p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                  Performance Summary
                </h3>
                <div className="bg-white p-3 md:p-4 rounded-lg">
                  <div className="text-xs md:text-sm text-gray-600 space-y-1 md:space-y-2">
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

            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
                Question Review
              </h2>
              <div className="space-y-3 md:space-y-4 max-h-80 md:max-h-96 overflow-y-auto">
                {questionHistory.map((q, index) => (
                  <div
                    key={index}
                    className={`p-3 md:p-4 rounded-lg border ${
                      q.isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">
                        Q{q.questionNumber}
                      </span>
                      <div className="flex items-center space-x-2 md:space-x-4">
                        <span className="text-xs md:text-sm text-gray-600">
                          {formatTime(q.timeTaken)}
                        </span>
                        <span
                          className={`text-base md:text-lg ${
                            q.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {q.isCorrect ? "✓" : "✗"}
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

            <div className="flex justify-center mt-6 md:mt-8">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 md:px-8 py-2 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base"
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
    return (
      <ResultsScreen
        questionHistory={questionHistory}
        user={user}
        submitted={submitted}
        setSubmitted={setSubmitted}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg md:text-xl font-semibold text-gray-600">
          Loading Test...
        </div>
      </div>
    );
  }

  const getAnsweredCount = () => questionHistory.length;
  const allAnswered = questionHistory.length >= MAX_QUESTIONS;
  const remainingToSubmit = Math.max(0, MAX_QUESTIONS - questionHistory.length);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row h-screen">
        <div className="md:hidden bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <span className="text-sm font-medium">← Back</span>
            </button>
            <button
              onClick={allAnswered ? handleSubmitTest : undefined}
              disabled={!allAnswered}
              className={`font-semibold px-4 py-2 rounded-lg transition-all duration-300 shadow-lg text-sm ${
                allAnswered
                  ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
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
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center mb-0.5">
                <Clock className="w-3 h-3 text-gray-600 mr-1" />
                <span className="text-xs font-medium text-gray-700">Time</span>
              </div>
              <div className="text-sm font-bold text-gray-800">
                {formatTime(currentQuestionTime)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <div className="flex items-center mb-0.5">
                <BarChart3 className="w-3 h-3 text-gray-600 mr-1" />
                <span className="text-xs font-medium text-gray-700">
                  Progress
                </span>
              </div>
              <div className="text-sm font-bold text-gray-800">
                {getAnsweredCount()}/{MAX_QUESTIONS}
              </div>
            </div>
            {currentQuestion?.aptitudeConcept ? (
              <div
                className={`rounded-lg p-2 w-94 border-2 ${getDifficultyColor(
                  currentDifficulty
                )}`}
              >
                <div className="text-xs flex flex-row font-medium mb-0.5">
                  Aptitude Concept:{" "}
                  <span className="text-sm pl-2 font-bold capitalize leading-tight">
                    {currentQuestion?.aptitudeConcept}
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="hidden md:block md:w-1/4 bg-gradient-to-b from-blue-50 to-purple-50 border-r border-gray-200 p-6 overflow-y-scroll">
          <div className="mb-8">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">🎯</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 -mt-1">Problems</h2>
                <p className="text-sm text-gray-600">Timed assessment</p>
              </div>
            </div>

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

            <div
              className={`rounded-2xl p-4 mb-4 shadow-sm border-2 ${getDifficultyColor(
                currentDifficulty
              )}`}
            >
              <div className="text-lg font-medium mb-1">
                Current Level -{" "}
                <span className="text-lg font-bold capitalize">
                  {currentDifficulty.replace("_", " ")}
                </span>
              </div>
            </div>

            {currentQuestion?.aptitudeConcept ? (
              <div
                className={`rounded-2xl p-4 mb-4 shadow-sm border-2 ${getDifficultyColor(
                  currentDifficulty
                )}`}
              >
                <div className="text-lg font-medium mb-1">
                  Aptitutde Concept -{" "}
                  <span className="text-lg font-bold capitalize">
                    {currentQuestion?.aptitudeConcept}
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {getAnsweredCount()} of {MAX_QUESTIONS} answered
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(getAnsweredCount() / MAX_QUESTIONS) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4 flex flex-col">
          <div className="hidden md:block bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Question {questionNumber} of {MAX_QUESTIONS}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {!allAnswered && (
                  <span className="text-sm text-gray-500">
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

          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-300 mt-4 md:mt-8">
                <div className="mb-6 md:mb-8">
                  <div className="text-base sm:text-lg md:text-xl font-medium text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                  {currentQuestion.options.map((option, index) => {
                    let buttonClass =
                      "w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 ";
                    if (isAnswered && index === selectedAnswer) {
                      buttonClass +=
                        "bg-blue-50 border-blue-400 text-blue-800 shadow-md";
                    } else if (!isAnswered) {
                      buttonClass +=
                        "bg-white border-gray-300 text-gray-700 hover:bg-blue-25 hover:border-blue-300 shadow-sm hover:shadow-md";
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
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 mr-3 md:mr-4 flex items-center justify-center flex-shrink-0 ${
                              isAnswered && index === selectedAnswer
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isAnswered && index === selectedAnswer && (
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
          </div>

          <div className="bg-white border-t border-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <div className="text-xs md:text-sm text-gray-600">
                Question {questionNumber} of {MAX_QUESTIONS}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                  !isAnswered
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {questionNumber >= MAX_QUESTIONS
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

export default AdaptiveAssess;
