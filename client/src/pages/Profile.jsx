import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", gender: "", photoUrl: "" });
  const [saved, setSaved] = useState("");

  const initial = useMemo(() => ({
    name: user?.name || "",
    email: user?.email || "",
    gender: user?.gender || "",
    photoUrl: user?.photoUrl || "",
  }), [user]);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const onChange = (e) => {
    if (error) clearError();
    setSaved("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: form.name, email: form.email, gender: form.gender, photoUrl: form.photoUrl });
      setSaved("Profile updated successfully");
    } catch (_) {
      // error handled in context state
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Your Profile</h1>

        <form onSubmit={onSubmit} className="space-y-6 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <img src={form.photoUrl || "https://i.pravatar.cc/80"} alt="avatar" className="w-16 h-16 rounded-full border" />
              <input
                name="photoUrl"
                value={form.photoUrl}
                onChange={onChange}
                className="flex-1 px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Paste image URL or leave blank"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {[
                "https://i.pravatar.cc/150?img=1",
                "https://i.pravatar.cc/150?img=5",
                "https://i.pravatar.cc/150?img=10",
                "https://i.pravatar.cc/150?img=15",
              ].map((u) => (
                <button key={u} type="button" onClick={() => setForm({ ...form, photoUrl: u })} className="border rounded-lg p-1">
                  <img src={u} alt="suggestion" className="w-12 h-12 rounded" />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}
          {saved && (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
              {saved}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Toast */}
        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {saved}
          </div>
        )}
      </div>
    </div>
  );
}
