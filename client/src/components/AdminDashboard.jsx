import { useState, useEffect } from "react";
import {
  Users,
  PawPrint,
  MapPin,
  Heart,
  TrendingUp,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  X,
  Shield,
  Loader2,
} from "lucide-react";

export function AdminDashboard() {
  // ─── UI STATE ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // ─── FILTER STATE ───────────────────────────────────────────────────────
  const [adoptionFilter, setAdoptionFilter] = useState("All");
  const [reportFilter, setReportFilter] = useState("All");
  const [accountTypeFilter, setAccountTypeFilter] = useState("All");

  // ─── MODAL STATE ────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState("report");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  // ─── DATA STATE ─────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── FETCH DATA ON MOUNT ────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://straycareplatform.onrender.com/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch dashboard data. Make sure you are an admin.",
        );
      }

      const data = await response.json();
      setUsers(data.users || []);
      setReports(data.reports || []);
      setAdoptions(data.adoptions || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ─── DELETE ACTION ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      alert("Please provide a reason for deletion");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let url = "";

      if (deleteType === "adoption") {
        url = `https://straycareplatform.onrender.com/api/admin/adoptions/${itemToDelete._id}`;
      } else if (deleteType === "report") {
        url = `https://straycareplatform.onrender.com/api/admin/reports/${itemToDelete._id}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete item.");

      fetchDashboardData();
      alert(`Item has been successfully deleted.\nReason: ${deleteReason}`);
    } catch (err) {
      console.error(err);
      alert("Error deleting item. See console.");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleteReason("");
    }
  };

  // ─── HELPER FUNCTIONS ───────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      // Report Statuses
      case "Permanently Adopted":
        return "bg-green-100 text-green-700";
      case "Temporarily Adopted":
        return "bg-yellow-100 text-yellow-700";
      case "Contacted Welfare Organizations":
        return "bg-blue-100 text-blue-700";
      case "Urgent Help Needed":
        return "bg-red-100 text-red-700";

      // Adoption Statuses
      case "Adopted":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Available":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    return status || "Unknown";
  };

  // ─── CALCULATED STATISTICS ──────────────────────────────────────────────
  const totalAdoptions = adoptions.filter((a) => a.status === "Adopted").length;
  const pendingAdoptions = adoptions.filter(
    (a) => a.status === "Pending",
  ).length;
  const totalReports = reports.length;
  const urgentReports = reports.filter(
    (r) => r.actionStatus === "Urgent Help Needed",
  ).length;
  const permanentlyAdopted = reports.filter(
    (r) => r.actionStatus === "Permanently Adopted",
  ).length;
  const temporaryAdopted = reports.filter(
    (r) => r.actionStatus === "Temporarily Adopted",
  ).length;
  const activeUsersTotal = users.length;

  // ─── FILTER LOGIC ───────────────────────────────────────────────────────
  const filteredAdoptions = adoptions.filter((adoption) => {
    const q = searchQuery.toLowerCase();
    const dogNameMatch = (adoption.dogDetails?.name || "")
      .toLowerCase()
      .includes(q);
    const adopterMatch = (adoption.currentRequest?.requesterName || "")
      .toLowerCase()
      .includes(q);
    const filterMatch =
      adoptionFilter === "All" || adoption.status === adoptionFilter;
    return (dogNameMatch || adopterMatch) && filterMatch;
  });

  const filteredReports = reports.filter((report) => {
    const q = searchQuery.toLowerCase();
    const locMatch = (report.location?.address || "").toLowerCase().includes(q);
    const descMatch = (report.dogDetails?.description || "")
      .toLowerCase()
      .includes(q);

    const filterMatch =
      reportFilter === "All" || report.actionStatus === reportFilter;
    return (locMatch || descMatch) && filterMatch;
  });

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (user.name || user.organizationName || "")
      .toLowerCase()
      .includes(q);
    const emailMatch = (user.email || "").toLowerCase().includes(q);
    const accountMatch =
      accountTypeFilter === "All" ||
      user.role === accountTypeFilter.toLowerCase();
    return (nameMatch || emailMatch) && accountMatch;
  });

  // ─── LOADING & ERROR SCREENS ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Dashboard Data...
          </h2>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-orange-500" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage users, adoptions, reports, and monitor statistics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Access Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 min-w-30 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "overview"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="h-5 w-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("adoptions")}
            className={`flex-1 min-w-30 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "adoptions"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart className="h-5 w-5 inline mr-2" />
            Adoptions
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 min-w-30 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "reports"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MapPin className="h-5 w-5 inline mr-2" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 min-w-30 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "users"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Users
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* OVERVIEW TAB */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5 opacity-75" />
                </div>
                <p className="text-green-100 text-sm mb-1">Total Adoptions</p>
                <p className="text-4xl font-bold">{totalAdoptions}</p>
              </div>

              <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="h-8 w-8" />
                  <Clock className="h-5 w-5 opacity-75" />
                </div>
                <p className="text-yellow-100 text-sm mb-1">
                  Pending Adoptions
                </p>
                <p className="text-4xl font-bold">{pendingAdoptions}</p>
              </div>

              <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <MapPin className="h-8 w-8" />
                  <TrendingUp className="h-5 w-5 opacity-75" />
                </div>
                <p className="text-blue-100 text-sm mb-1">Total Reports</p>
                <p className="text-4xl font-bold">{totalReports}</p>
              </div>

              <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white transform transition hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="h-8 w-8" />
                  <Info className="h-5 w-5 opacity-75" />
                </div>
                <p className="text-red-100 text-sm mb-1">Urgent Reports</p>
                <p className="text-4xl font-bold">{urgentReports}</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {permanentlyAdopted}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Permanently Adopted (Reports)
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {temporaryAdopted}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Temporarily Sheltered (Reports)
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {activeUsersTotal}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">Total Active Users</p>
              </div>
            </div>

            {/* Quick Activity Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-orange-500" />
                Recent System Reports
              </h2>
              <div className="space-y-3">
                {reports.slice(0, 3).map((report) => (
                  <div
                    key={report._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {report.dogDetails?.breed === "Unknown"
                            ? "Unknown Breed"
                            : report.dogDetails?.breed || "Unknown Breed"}{" "}
                          reported
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.actionStatus)}`}
                    >
                      {report.actionStatus || "Pending"}
                    </span>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No reports recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* ADOPTIONS TAB */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === "adoptions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search adoptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={adoptionFilter}
                    onChange={(e) => setAdoptionFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="All">All Status</option>
                    <option value="Adopted">Adopted</option>
                    <option value="Pending">Pending</option>
                    <option value="Available">Available</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Dog Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Adopter
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAdoptions.map((adoption) => (
                      <tr key={adoption._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {adoption.dogDetails?.name || "Unnamed"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {adoption.dogDetails?.breed}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {adoption.currentRequest?.requesterName || "N/A"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(adoption.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(adoption.status)}`}
                          >
                            {getStatusLabel(adoption.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedAdoption(adoption)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType("adoption");
                                setItemToDelete(adoption);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdoptions.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No adoptions found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* REPORTS TAB */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Permanently Adopted">
                      Permanently Adopted
                    </option>
                    <option value="Temporarily Adopted">
                      Temporarily Sheltered
                    </option>
                    <option value="Contacted Welfare Organizations">
                      Org. Contacted
                    </option>
                    <option value="Urgent Help Needed">
                      Urgent Help Needed
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Dog Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report._id} className="hover:bg-gray-50">
                        {/* CLEANER DOG DETAILS DISPLAY */}
                        <td className="px-6 py-4">
                          <p
                            className="text-xs text-gray-500 truncate max-w-62.5"
                            title={report.dogDetails?.description}
                          >
                            {report.dogDetails?.description ||
                              "No description provided"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p
                            className="text-sm text-gray-900 truncate max-w-50"
                            title={report.location?.address}
                          >
                            {report.location?.address || "Coordinates Only"}
                          </p>
                          {!report.location?.address &&
                            report.location?.lat && (
                              <p className="text-xs text-gray-400">
                                {report.location.lat.toFixed(4)},{" "}
                                {report.location.lng.toFixed(4)}
                              </p>
                            )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.actionStatus)}`}
                          >
                            {getStatusLabel(report.actionStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteType("report");
                                setItemToDelete(report);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredReports.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No reports found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* USERS TAB */}
        {/* ───────────────────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Individual">Individual</option>
                    <option value="Organization">Organization</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Points
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {user.name || user.organizationName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "organization"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {user.rewardPoints}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MODALS */}
      {/* ───────────────────────────────────────────────────────────────── */}

      {/* Adoption Detail Modal */}
      {selectedAdoption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-orange-500 to-amber-500 text-white p-6 rounded-t-2xl flex justify-between">
              <h2 className="text-2xl font-bold">Adoption Record</h2>
              <button
                onClick={() => setSelectedAdoption(null)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(selectedAdoption, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-orange-500 to-amber-500 text-white p-6 rounded-t-2xl flex justify-between">
              <h2 className="text-2xl font-bold">Report Data</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {selectedReport.media && selectedReport.media.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Media
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedReport.media.map((file, index) =>
                      file.fileType === "image" ? (
                        <img
                          key={index}
                          src={`https://straycareplatform.onrender.com/${file.url.replace(/\\/g, "/")}`}
                          alt={`Report media ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div
                          key={index}
                          className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center shadow-md"
                        >
                          <p className="text-gray-500 text-sm font-medium">
                            Video File
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dog & Location Info */}
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">
                    Dog & Location Details
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Breed:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedReport.dogDetails?.breed !== "Unknown"
                        ? selectedReport.dogDetails?.breed
                        : "Not Specified"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Condition:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedReport.dogDetails?.condition || "Not specified"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Description:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedReport.dogDetails?.description}
                    </span>
                  </p>

                  <p className="text-sm text-gray-600 mb-1">
                    Address:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedReport.location?.address || "Coordinates Only"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Lat:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedReport.location?.lat}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Lng:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedReport.location?.lng}
                    </span>
                  </p>
                </div>

                {/* Status & Contact Info */}
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">
                    Status & Contacts
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Current Status:{" "}
                    <span className="font-medium text-orange-600">
                      {selectedReport.actionStatus}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Reported On:{" "}
                    <span className="font-medium text-gray-900">
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </span>
                  </p>

                  {/* Show Adopter if it exists */}
                  {selectedReport.adopterDetails?.name && (
                    <div className="mt-3 bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-green-800 font-bold mb-1">
                        PERMANENT ADOPTER
                      </p>
                      <p className="text-sm text-gray-800">
                        Name: {selectedReport.adopterDetails.name}
                      </p>
                      <p className="text-sm text-gray-800">
                        Contact: {selectedReport.adopterDetails.contact}
                      </p>
                    </div>
                  )}

                  {/* Show Temp Guardian if it exists */}
                  {selectedReport.tempGuardianDetails?.name && (
                    <div className="mt-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-800 font-bold mb-1">
                        TEMP GUARDIAN
                      </p>
                      <p className="text-sm text-gray-800">
                        Name: {selectedReport.tempGuardianDetails.name}
                      </p>
                      <p className="text-sm text-gray-800">
                        Contact: {selectedReport.tempGuardianDetails.contact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-t-2xl flex justify-between">
              <h2 className="text-2xl font-bold">User Data</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(selectedUser, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <AlertTriangle className="mr-2" /> Confirm Deletion
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-red-600 font-medium">
                Warning: This action cannot be undone. You are permanently
                deleting this {deleteType}.
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Deletion <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g., Duplicate entry, Spam..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!deleteReason.trim()}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
