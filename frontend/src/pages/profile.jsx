// src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react";
import { User, Mail, Phone, MapPin, Settings, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser, getToken, isAuthenticated, setUser as saveUser } from "../utils/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);   // avoid redirect before check
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", village: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 1) check storage AFTER mount (prevents immediate redirect flicker)
    const u = getUser();
    const token = getToken();

    if (!u || !token) {
      // optional: log for debugging
      console.warn("Profile redirect: user or token missing", { u, token });
      setLoading(false);
      navigate("/auth/login", { replace: true });
      return;
    }

    setUser(u);
    setForm({ name: u?.name || "", phone: u?.phone || "", village: u?.village || "" });
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg text-neutral-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null; // navigate already triggered

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // local preview (you can swap to backend upload later)
    const preview = URL.createObjectURL(file);
    const updated = { ...user, avatar: preview };
    setUser(updated);
    saveUser(updated, getToken()); // keep token as-is
  };

  return (
    <div className="flex justify-center p-8">
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Cover banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-cyan-500" />

        {/* Avatar */}
        <div className="-mt-16 flex justify-center relative">
          <button onClick={handleAvatarClick} className="relative group" title="Change avatar">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-900 shadow-lg object-cover"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* User Info */}
        <div className="text-center mt-4 px-6">
          <h1 className="text-2xl font-bold text-emerald-500">{user.name}</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Farmer</p>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6">
          <InfoCard icon={<Mail />} label="Email" value={user.email} />
          <InfoCard icon={<Phone />} label="Phone" value={user.phone} />
          <InfoCard icon={<MapPin />} label="Village" value={user.village} />
          <InfoCard icon={<User />} label="Account ID" value={user._id || "—"} />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pb-6">
          <button
            className="px-5 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
            onClick={() => setShowEdit(true)}
          >
            Edit Profile
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition flex items-center gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <Modal title="Edit Profile" onClose={() => setShowEdit(false)}>
          <div className="space-y-4">
            <LabeledInput
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <LabeledInput
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <LabeledInput
              label="Village"
              value={form.village}
              onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white"
                onClick={() => {
                  const updated = { ...user, ...form };
                  setUser(updated);
                  saveUser(updated, getToken());
                  setShowEdit(false);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 shadow-sm">
      <div className="text-emerald-500">{icon}</div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-base font-medium break-all">{value || "—"}</p>
      </div>
    </div>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-neutral-500">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
