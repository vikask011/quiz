import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Results() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("https://quiz-woad-pi.vercel.app/api/results/history?limit=50");
        setHistory(data.history || []);
      } catch (_) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmtDate = (d) => new Date(d).toLocaleString();
  const fmtAvg = (sec) => {
    if (!sec || sec <= 0) return "0.0s";
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Previous Results</h1>

        {loading ? (
          <div className="text-blue-700">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-blue-700">No results yet. Take an assessment to see history here.</div>
        ) : (
          <div className="space-y-4">
            {history.map((r, idx) => (
              <button onClick={() => navigate(`/results/${r._id}`)} key={idx} className="w-full text-left bg-white border border-blue-100 rounded-xl p-4 shadow-sm flex justify-between items-center hover:bg-blue-50">
                <div>
                  <div className="text-blue-900 font-semibold">{fmtDate(r.createdAt)}</div>
                  <div className="text-blue-700 text-sm">
                    Questions: {r.totalQuestions} • Correct: {r.correct} • Wrong: {r.wrong}
                  </div>
                </div>
                <div className="text-blue-800 font-semibold">Avg: {fmtAvg(r.avgTimeSec)} →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
