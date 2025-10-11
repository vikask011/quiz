import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResultDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`https://quiz-woad-pi.vercel.app/api/results/${id}`);
        setResult(data.result);
      } catch (_) {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const accuracy = useMemo(() => {
    if (!result) return 0;
    return result.totalQuestions ? (result.correct / result.totalQuestions) * 100 : 0;
  }, [result]);

  const fmt = (sec) => {
    if (!sec || sec <= 0) return "0.0s";
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  const downloadPdf = async () => {
    try {
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Palette
      const blue = [37, 99, 235];
      const orange = [249, 115, 22];
      const green = [22, 163, 74];
      const red = [220, 38, 38];
      const slate = [30, 41, 59];

      // Header banner
      pdf.setFillColor(...blue);
      pdf.roundedRect(20, 20, pageWidth - 40, 80, 12, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.text('NeuroQuiz — Marks Card', pageWidth / 2, 65, { align: 'center' });
      pdf.setFillColor(...orange);
      pdf.circle(pageWidth - 60, 40, 6, 'F');

      // User card
      const userTop = 120;
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(20, userTop, pageWidth - 40, 90, 10, 10, 'F');
      pdf.setDrawColor(230, 236, 245);
      pdf.roundedRect(20, userTop, pageWidth - 40, 90, 10, 10, 'S');

      const initials = (user?.name || 'User').split(/\s+/).map(w => w[0]?.toUpperCase() || '').slice(0,2).join('');
      pdf.setFillColor(...orange);
      pdf.circle(50, userTop + 45, 22, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text(initials || 'U', 50, userTop + 50, { align: 'center' });

      pdf.setTextColor(...slate);
      pdf.setFontSize(12);
      pdf.text(`Name: ${user?.name || ''}`, 90, userTop + 30);
      pdf.text(`Email: ${user?.email || ''}`, 90, userTop + 50);
      pdf.text(`Test Date: ${new Date(result.createdAt).toLocaleString()}`, 90, userTop + 70);

      // Summary cards
      const cardsTop = userTop + 110;
      const gap = 16;
      const cardW = (pageWidth - 40 - gap * 3) / 4;
      const metrics = [
        { label: 'Total', value: String(result.totalQuestions), color: blue },
        { label: 'Correct', value: String(result.correct), color: green },
        { label: 'Wrong', value: String(result.wrong), color: red },
        { label: 'Avg Time', value: `${(result.avgTimeSec || 0).toFixed(2)}s`, color: orange },
      ];
      let x = 20;
      metrics.forEach(m => {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x, cardsTop, cardW, 90, 10, 10, 'F');
        pdf.setDrawColor(230, 236, 245);
        pdf.roundedRect(x, cardsTop, cardW, 90, 10, 10, 'S');
        pdf.setFillColor(...m.color);
        pdf.roundedRect(x, cardsTop, cardW, 10, 10, 10, 'F');
        pdf.setTextColor(...slate);
        pdf.setFontSize(12);
        pdf.text(m.label, x + 12, cardsTop + 32);
        pdf.setFontSize(22);
        pdf.setTextColor(...m.color);
        pdf.text(m.value, x + 12, cardsTop + 64);
        x += cardW + gap;
      });

      // Divider
      let y = cardsTop + 120;
      pdf.setDrawColor(230, 236, 245);
      pdf.line(20, y, pageWidth - 20, y);
      y += 24;

      pdf.setTextColor(...slate);
      pdf.setFontSize(12);
      pdf.text(`Total Questions: ${result.totalQuestions}`, 40, y); y += 18;
      pdf.text(`Correct: ${result.correct}`, 40, y); y += 18;
      pdf.text(`Wrong: ${result.wrong}`, 40, y); y += 18;
      pdf.text(`Average Time per Question: ${(result.avgTimeSec || 0).toFixed(2)}s`, 40, y); y += 28;

      // AI Summary Section (if available)
      if (result.aiSummary && String(result.aiSummary).trim()) {
        pdf.addPage();
        let sy = 40;
        const purple = [147, 51, 234];
        pdf.setFillColor(...purple);
        pdf.roundedRect(20, sy, pageWidth - 40, 50, 10, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.text('AI Performance Summary', pageWidth / 2, sy + 32, { align: 'center' });
        sy += 70;
        pdf.setTextColor(...slate);
        pdf.setFontSize(12);
        const lines = pdf.splitTextToSize(String(result.aiSummary), pageWidth - 80);
        lines.forEach((line) => {
          if (sy > pageHeight - 60) {
            pdf.addPage();
            sy = 40;
          }
          pdf.text(line, 40, sy);
          sy += 16;
        });
      }

      // Questions section
      pdf.setFontSize(16);
      pdf.setTextColor(...blue);
      pdf.text("Question Review:", 40, y); y += 20;
      pdf.setFontSize(12);
      (result.questions || []).forEach((q, idx) => {
        const maxWidth = pageWidth - 80;
        const lineHeight = 14;

        // Question number & text
        pdf.setTextColor(...slate);
        pdf.text(`Q${q.questionNumber}: ${q.question}`, 40, y, { maxWidth });
        y += lineHeight;

        // Selected answer
        pdf.setTextColor(...(q.isCorrect ? green : red));
        pdf.text(`Your answer: ${q.selectedAnswer}`, 60, y, { maxWidth });
        y += lineHeight;

        // Correct answer if wrong
        if (!q.isCorrect) {
          pdf.setTextColor(...green);
          pdf.text(`Correct answer: ${q.correctAnswer}`, 60, y, { maxWidth });
          y += lineHeight;
        }

        y += 8;

        // Page break
        if (y > pageHeight - 80) {
          pdf.addPage();
          y = 40;
        }
      });

      // Footer
      pdf.setFillColor(...blue);
      pdf.roundedRect(20, pageHeight - 40, pageWidth - 40, 10, 6, 6, 'F');

      const stamp = new Date(result?.createdAt || Date.now()).toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const name = user?.name ? user.name.replace(/\s+/g, '_') : 'user';
      pdf.save(`report_${name}_${stamp}.pdf`);

    } catch (e) {
      console.error('Failed to generate report:', e);
      alert('Failed to generate report');
    }
  };

  if (loading) return <div className="p-6 text-blue-700">Loading...</div>;
  if (!result) return <div className="p-6 text-red-600">Result not found.</div>;

  const handleGenerate = async () => {
    try {
      setGenError("");
      setGenLoading(true);
      const { data } = await api.post(`https://quiz-woad-pi.vercel.app/api/results/${id}/summary`);
      setResult((prev) => ({ ...prev, aiSummary: data.summary }));
    } catch (e) {
      setGenError(e?.response?.data?.message || 'Failed to generate AI summary');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900">Result Details</h1>
          <button onClick={downloadPdf} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Download Report</button>
        </div>

        <div className="space-y-6">
          {/* Header info */}
          <div className="flex items-center gap-4">
            <img src={user?.photoUrl || "data:image/jpeg;base64,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"} alt="avatar" className="w-14 h-14 rounded-full border" />
            <div>
              <div className="text-blue-900 font-semibold">{user?.name || "User"}</div>
              <div className="text-blue-700 text-sm">{user?.email}</div>
              {user?.gender ? <div className="text-blue-700 text-xs capitalize">{user.gender}</div> : null}
              <div className="text-blue-700 text-xs">Test Date: {new Date(result.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600">{result.totalQuestions}</div>
              <div className="text-blue-900">Questions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600">{result.correct}</div>
              <div className="text-blue-900">Correct</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-600">{result.wrong}</div>
              <div className="text-blue-900">Wrong</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-600">{fmt(result.avgTimeSec)}</div>
              <div className="text-blue-900">Avg Time</div>
            </div>
          </div>

          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <div className="text-blue-900 font-semibold">Accuracy: {accuracy.toFixed(1)}%</div>
          </div>

          {/* AI Summary */}
          <div className="bg-white border border-purple-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-purple-800">AI Performance Summary</h2>
              {!result.aiSummary && (
                <button
                  onClick={handleGenerate}
                  disabled={genLoading}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${genLoading ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                  {genLoading ? 'Generating...' : 'Generate Summary'}
                </button>
              )}
            </div>
            {genError ? (
              <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{genError}</div>
            ) : result.aiSummary ? (
              <div className="whitespace-pre-wrap text-blue-900">{result.aiSummary}</div>
            ) : (
              <div className="text-blue-700 text-sm">No AI summary yet. Click Generate Summary.</div>
            )}
          </div>

          {/* Questions */}
          <div className="bg-white border border-blue-100 rounded-xl p-4">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Question Review</h2>
            <div className="space-y-3">
              {(result.questions || []).map((q, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${q.isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                  <div className="flex justify-between">
                    <div className="font-semibold text-blue-900">Q{q.questionNumber}</div>
                    <div className={`font-semibold ${q.isCorrect ? "text-green-600" : "text-red-600"}`}>{q.isCorrect ? "Correct" : "Wrong"}</div>
                  </div>
                  <div className="text-blue-800 mt-1">{q.question}</div>
                  <div className="text-sm text-blue-700 mt-1">Your answer: <span className={q.isCorrect ? "text-green-700" : "text-red-700"}>{q.selectedAnswer}</span></div>
                  {!q.isCorrect && (
                    <div className="text-sm text-blue-700">Correct answer: <span className="text-green-700">{q.correctAnswer}</span></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
