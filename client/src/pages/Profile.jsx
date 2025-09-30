import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", gender: "", photoUrl: "" });
  const [saved, setSaved] = useState("");

  const initial = useMemo(
    () => ({
      name: user?.name || "",
      email: user?.email || "",
      gender: user?.gender || "",
      photoUrl: user?.photoUrl || "",
    }),
    [user]
  );

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
      await updateProfile({
        name: form.name,
        email: form.email,
        gender: form.gender,
        photoUrl: form.photoUrl,
      });
      setSaved("Profile updated successfully");
    } catch (_) {
      // error handled in context state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-900">Your Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <form
          onSubmit={onSubmit}
          className="space-y-6 bg-white border border-blue-100 rounded-2xl p-8 shadow-xl"
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <img
              src={
                form.photoUrl ||
                "https://ui-avatars.com/api/?name=" + (form.name || "User")
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow-md"
            />
            
          </div>

          {/* Name */}
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

          {/* Email */}
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

          {/* Gender */}
         

          {/* Alerts */}
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

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-60"
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
