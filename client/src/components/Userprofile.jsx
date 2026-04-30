import { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Award,
  TrendingUp,
  Heart,
  AlertCircle,
  Stethoscope,
  Trophy,
  Star,
  Calendar,
  Gift,
  MapPin,
  Dog,
  Clock,
  Home,
  Phone,
  Check,
  Edit,
  Mail,
  Lock,
  Trash2,
  User,
  Settings,
  ChevronRight,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:5001/api/users";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function getActionLabel(actionStatus) {
  switch (actionStatus) {
    case "Permanently Adopted":
      return "Permanently Adopted";
    case "Temporarily Adopted":
      return "Temporarily Sheltered";
    case "Contacted Welfare Organizations":
      return "Contacted Welfare Org";
    case "Urgent Help Needed":
      return "Urgent Help Needed";
    default:
      return actionStatus || "Pending";
  }
}

function getActionColor(actionStatus) {
  switch (actionStatus) {
    case "Permanently Adopted":
      return "bg-green-100 text-green-700 border-green-300";
    case "Temporarily Adopted":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "Contacted Welfare Organizations":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Urgent Help Needed":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

function getStatusDot(actionStatus) {
  switch (actionStatus) {
    case "Permanently Adopted":
      return "bg-green-500";
    case "Temporarily Adopted":
      return "bg-yellow-500";
    case "Contacted Welfare Organizations":
      return "bg-blue-500";
    case "Urgent Help Needed":
      return "bg-red-500";
    default:
      return "bg-orange-500";
  }
}

function getCategoryColor(category) {
  switch (category) {
    case "adoption":
      return "from-rose-400 to-pink-500";
    case "report":
      return "from-amber-400 to-orange-500";
    case "health":
      return "from-teal-400 to-cyan-500";
    case "community":
      return "from-purple-400 to-indigo-500";
    default:
      return "from-gray-400 to-gray-500";
  }
}

function getCategoryIcon(category) {
  switch (category) {
    case "adoption":
      return Heart;
    case "report":
      return AlertCircle;
    case "health":
      return Stethoscope;
    case "community":
      return Star;
    default:
      return Award;
  }
}

// ─── Component ────────────────────────────────────────────────────────────

export function UserProfile({ userEmail, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ── Data state ──────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Form state ──────────────────────────────────────────────────────────
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // ── Fetch profile ───────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/profile");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to load profile");
      }
      const data = await res.json();
      setProfileData(data);
      setFormValues({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Sync formValues with profileData whenever it changes ────────────────
  useEffect(() => {
    if (profileData) {
      setFormValues({
        name: profileData.user.name || "",
        email: profileData.user.email || "",
        phone: profileData.user.phone || "",
        address: profileData.user.address || "",
      });
    }
  }, [profileData]);

  // ── Derived display values ───────────────────────────────────────────────
  const totalPoints = profileData?.user.rewardPoints ?? 0;
  const level = Math.floor(totalPoints / 500) + 1;
  const pointsToNextLevel = level * 500 - totalPoints;
  const progress = ((totalPoints % 500) / 500) * 100;
  const displayName = profileData?.user.name || userEmail.split("@")[0];

  const pointsBreakdownDisplay = [
    {
      category: "Adoptions",
      points: profileData?.user.pointsBreakdown?.adoptions ?? 0,
      color: "from-rose-400 to-pink-500",
      icon: Heart,
    },
    {
      category: "Reports",
      points: profileData?.user.pointsBreakdown?.reports ?? 0,
      color: "from-amber-400 to-orange-500",
      icon: AlertCircle,
    },
    {
      category: "Health Checks",
      points: profileData?.user.pointsBreakdown?.healthChecks ?? 0,
      color: "from-teal-400 to-cyan-500",
      icon: Stethoscope,
    },
    {
      category: "Community",
      points: profileData?.user.pointsBreakdown?.community ?? 0,
      color: "from-purple-400 to-indigo-500",
      icon: Star,
    },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const clearFeedback = () => {
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    clearFeedback();
    try {
      const res = await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: formValues.name,
          phone: formValues.phone,
          address: formValues.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");
      setSaveSuccess("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setSaveError("Please fill in both password fields");
      return;
    }
    setSaving(true);
    clearFeedback();
    try {
      const res = await apiFetch("/profile/password", {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setSaveSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeToPermanent = async (reportId) => {
    clearFeedback();
    try {
      const res = await apiFetch(`/profile/temp-dog/${reportId}/adopt`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upgrade failed");
      fetchProfile();
      setSaveSuccess(
        `Congratulations! You earned +${data.pointsAwarded} points for permanently adopting this dog!`,
      );
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    clearFeedback();
    try {
      const res = await apiFetch("/profile", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete account");
      }
      localStorage.removeItem("token");
      onClose();
    } catch (err) {
      setSaveError(err.message);
      setShowDeleteConfirm(false);
    }
  };

  // ── Tab config ───────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "reports", label: "My Reports", icon: AlertCircle },
    { id: "sheltered", label: "Sheltered Dogs", icon: Home },
    { id: "account", label: "Account", icon: Settings },
  ];

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
          <p className="text-gray-600 font-medium">Loading your profile…</p>
        </div>
      </motion.div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-gray-800 font-semibold">Failed to load profile</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={fetchProfile}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-4xl font-bold text-orange-500">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                <Trophy className="h-5 w-5 text-yellow-900" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                {displayName}
              </h2>
              <p className="text-white/90 mb-3">
                {profileData?.user.email || userEmail}
              </p>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 flex items-center space-x-2">
                  <Award className="h-4 w-4 text-yellow-300" />
                  <span className="text-white font-semibold">
                    Level {level}
                  </span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                  <span className="text-white font-semibold">
                    {totalPoints} Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/90">
                Progress to Level {level + 1}
              </span>
              <span className="text-sm font-semibold text-white">
                {pointsToNextLevel} points needed
              </span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-white rounded-full shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* ── Tab navigation ──────────────────────────────────────────────── */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Global feedback banner ───────────────────────────────────────── */}
        <AnimatePresence>
          {(saveSuccess || saveError) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-6 py-3 text-sm font-medium ${
                saveSuccess
                  ? "bg-green-50 text-green-700 border-b border-green-200"
                  : "bg-red-50 text-red-700 border-b border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{saveSuccess || saveError}</span>
                <button
                  onClick={clearFeedback}
                  className="ml-4 opacity-60 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ────────────────── OVERVIEW TAB ────────────────── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                {/* Stats summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <Dog className="h-8 w-8 text-green-600" />
                      <span className="text-3xl font-bold text-green-800">
                        {profileData?.stats.totalAdopted ?? 0}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-700">
                      Adopted Dogs
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <Home className="h-8 w-8 text-yellow-600" />
                      <span className="text-3xl font-bold text-yellow-800">
                        {profileData?.stats.tempSheltered ?? 0}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-yellow-700">
                      Temp. Sheltered
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                      <span className="text-3xl font-bold text-orange-800">
                        {profileData?.stats.totalReports ?? 0}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-orange-700">
                      Total Reports
                    </p>
                  </div>
                </div>

                {/* Points breakdown */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Points Breakdown
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pointsBreakdownDisplay.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.category}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-3 shadow-md`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {item.category}
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            {item.points}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-800">
                      Recent Achievements
                    </h3>
                  </div>

                  {(profileData?.achievements || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No achievements yet — start reporting stray dogs!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(profileData?.achievements || []).map((achievement, index) => {
                        const Icon = getCategoryIcon(achievement.category);
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all flex items-start space-x-4"
                          >
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${getCategoryColor(achievement.category)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                            >
                              <Icon className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-gray-800">
                                  {achievement.title}
                                </h4>
                                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  +{achievement.points} pts
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {achievement.description}
                              </p>
                              {achievement.date && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(
                                    achievement.date,
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* How to earn points */}
                <div className="mt-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Gift className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-800">
                      How to Earn Points
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: Heart,
                        color: "text-green-500",
                        label: "Permanently adopt a dog",
                        pts: 500,
                      },
                      {
                        icon: Home,
                        color: "text-yellow-500",
                        label: "Temporarily shelter a dog",
                        pts: 200,
                      },
                      {
                        icon: AlertCircle,
                        color: "text-amber-500",
                        label: "Report a stray",
                        pts: 100,
                      },
                      {
                        icon: Phone,
                        color: "text-blue-500",
                        label: "Contact welfare org",
                        pts: 50,
                      },
                      {
                        icon: Stethoscope,
                        color: "text-teal-500",
                        label: "Health detection",
                        pts: 50,
                      },
                      {
                        icon: Star,
                        color: "text-purple-500",
                        label: "Facilitate adoption",
                        pts: 300,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="bg-white rounded-lg p-3 border border-orange-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-5 w-5 ${item.color}`} />
                              <span className="text-sm font-medium text-gray-700">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-orange-600 font-bold">
                              +{item.pts}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ────────────────── MY REPORTS TAB ────────────────── */}
            {activeTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    My Reported Dogs
                  </h3>
                  <p className="text-gray-600">
                    Track all the stray dogs you've reported and their current
                    status.
                  </p>
                </div>

                {(profileData?.reports || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Dog className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      You haven't reported any dogs yet.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start making a difference by reporting stray dogs in need!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(profileData?.reports || []).map((dog) => (
                      <div
                        key={dog._id}
                        className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg p-3">
                              <Dog className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-1">
                                Report #{dog._id.slice(-6).toUpperCase()}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {dog.location?.address || "Location not specified"}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                Reported on{" "}
                                {new Date(dog.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full mt-1 ${getStatusDot(dog.actionStatus)}`}
                          />
                        </div>

                        {dog.dogDetails?.description && (
                          <p className="text-sm text-gray-600 mb-3 pl-12">
                            {dog.dogDetails.description}
                          </p>
                        )}

                        <div className="pl-12">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(dog.actionStatus)}`}
                          >
                            {getActionLabel(dog.actionStatus)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ────────────────── SHELTERED DOGS TAB ────────────────── */}
            {activeTab === "sheltered" && (
              <motion.div
                key="sheltered"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Temporarily Sheltered Dogs
                  </h3>
                  <p className="text-gray-600">
                    Dogs currently under your temporary care. You can upgrade
                    them to permanent adoption anytime!
                  </p>
                </div>

                {(profileData?.tempShelteredDogs || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      You're not currently sheltering any dogs.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      When you temporarily shelter a dog, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(profileData?.tempShelteredDogs || []).map((dog) => (
                      <div
                        key={dog._id}
                        className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg p-3 shadow-md">
                              <Home className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-1">
                                Report #{dog._id.slice(-6).toUpperCase()}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {dog.location?.address || "Location not specified"}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                Sheltering since{" "}
                                {new Date(dog.updatedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            In Progress
                          </div>
                        </div>

                        {dog.dogDetails?.description && (
                          <div className="bg-white rounded-lg p-3 mb-4 border border-yellow-200">
                            <p className="text-sm text-gray-700">
                              {dog.dogDetails.description}
                            </p>
                          </div>
                        )}

                        <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                          <div className="flex items-start space-x-3 mb-3">
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-1">
                                Ready for Permanent Adoption?
                              </h5>
                              <p className="text-sm text-gray-600">
                                If you'd like to permanently adopt this dog,
                                click below. You'll earn +500 bonus points!
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUpgradeToPermanent(dog._id)}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md flex items-center justify-center space-x-2"
                          >
                            <Heart className="h-5 w-5" />
                            <span>Upgrade to Permanent Adoption</span>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ────────────────── ACCOUNT TAB ────────────────── */}
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                {/* Header row */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Account Settings
                    </h3>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditMode(false);
                            if (profileData) {
                              setFormValues({
                                name: profileData.user.name || "",
                                email: profileData.user.email || "",
                                phone: profileData.user.phone || "",
                                address: profileData.user.address || "",
                              });
                            }
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">
                    Manage your personal information and account settings.
                  </p>
                </div>

                {/* Personal information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Personal Information
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Full Name",
                        key: "name",
                        type: "text",
                        icon: User,
                        disabled: false,
                      },
                      {
                        label: "Email Address",
                        key: "email",
                        type: "email",
                        icon: Mail,
                        disabled: true,
                      },
                      {
                        label: "Phone Number",
                        key: "phone",
                        type: "tel",
                        icon: Phone,
                        disabled: false,
                      },
                      {
                        label: "Address",
                        key: "address",
                        type: "text",
                        icon: MapPin,
                        disabled: false,
                      },
                    ].map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={field.type}
                              value={formValues[field.key]}
                              onChange={(e) =>
                                setFormValues((prev) => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))
                              }
                              disabled={!editMode || field.disabled}
                              className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg ${
                                editMode && !field.disabled
                                  ? "bg-white focus:outline-none focus:border-orange-500"
                                  : "bg-gray-50 cursor-not-allowed"
                              }`}
                            />
                          </div>
                          {field.key === "email" && editMode && (
                            <p className="text-xs text-gray-400 mt-1">
                              Email cannot be changed here — contact support.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Change password */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          placeholder="Enter current password"
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          placeholder="Min. 8 characters"
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={
                        saving ||
                        !passwordForm.currentPassword ||
                        !passwordForm.newPassword
                      }
                      className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <span>Update Password</span>
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Danger Zone
                  </h4>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. All
                    your data, reports, and points will be permanently removed.
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                      <p className="font-semibold text-red-800 mb-3">
                        ⚠️ Are you sure you want to delete your account?
                      </p>
                      <p className="text-sm text-red-600 mb-4">
                        This action cannot be undone. All your data will be
                        permanently deleted.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                        >
                          Yes, Delete My Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
