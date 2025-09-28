import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResultDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/results/${id}`);
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
      const blue = [37, 99, 235]; // #2563eb
      const orange = [249, 115, 22]; // #f97316
      const green = [22, 163, 74]; // #16a34a
      const red = [220, 38, 38]; // #dc2626
      const slate = [30, 41, 59]; // #1e293b

      // Header banner
      pdf.setFillColor(...blue);
      pdf.roundedRect(20, 20, pageWidth - 40, 80, 12, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.text('NeuroQuiz — Marks Card', pageWidth / 2, 65, { align: 'center' });
      // Decorative dot
      pdf.setFillColor(...orange);
      pdf.circle(pageWidth - 60, 40, 6, 'F');

      // User card
      const userTop = 120;
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(20, userTop, pageWidth - 40, 90, 10, 10, 'F');
      pdf.setDrawColor(230, 236, 245);
      pdf.roundedRect(20, userTop, pageWidth - 40, 90, 10, 10, 'S');
      // Avatar circle with initials
      const initials = (user?.name || 'User').split(/\s+/).map(w => w[0]?.toUpperCase() || '').slice(0,2).join('');
      pdf.setFillColor(...orange);
      pdf.circle(50, userTop + 45, 22, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text(initials || 'U', 50, userTop + 50, { align: 'center' });
      // User text
      pdf.setTextColor(...slate);
      pdf.setFontSize(12);
      pdf.text(`Name: ${user?.name || ''}`, 90, userTop + 30);
      pdf.text(`Email: ${user?.email || ''}`, 90, userTop + 50);
      pdf.text(`Test Date: ${new Date(result.createdAt).toLocaleString()}`, 90, userTop + 70);

      // Summary cards row
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
        // card
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x, cardsTop, cardW, 90, 10, 10, 'F');
        pdf.setDrawColor(230, 236, 245);
        pdf.roundedRect(x, cardsTop, cardW, 90, 10, 10, 'S');
        // accent bar
        pdf.setFillColor(...m.color);
        pdf.roundedRect(x, cardsTop, cardW, 10, 10, 10, 'F');
        // text
        pdf.setTextColor(...slate);
        pdf.setFontSize(12);
        pdf.text(m.label, x + 12, cardsTop + 32);
        pdf.setFontSize(22);
        pdf.setTextColor(...m.color);
        pdf.text(m.value, x + 12, cardsTop + 64);
        x += cardW + gap;
      });

      // Divider and simple summary lines (as requested)
      const linesTop = cardsTop + 120;
      pdf.setDrawColor(230, 236, 245);
      pdf.line(20, linesTop, pageWidth - 20, linesTop);
      pdf.setTextColor(...slate);
      pdf.setFontSize(12);
      let ly = linesTop + 24;
      pdf.text(`Total Questions: ${result.totalQuestions}`, 40, ly); ly += 18;
      pdf.text(`Correct: ${result.correct}`, 40, ly); ly += 18;
      pdf.text(`Wrong: ${result.wrong}`, 40, ly); ly += 18;
      pdf.text(`Average Time per Question: ${(result.avgTimeSec || 0).toFixed(2)}s`, 40, ly);

      // Footer ribbon
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
            <img src={user?.photoUrl || "https://i.pravatar.cc/80"} alt="avatar" className="w-14 h-14 rounded-full border" />
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
