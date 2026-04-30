/**
 * ═════════════════════════════════════════════════════════════════════════════
 * REPORTING PAGE COMPONENT (ReportingPage.jsx)
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * Multi-step stray dog reporting system where users can report stray dogs
 * they've encountered by providing location, photos, condition details, and
 * contact information for follow-up rescue operations.
 * 
 * KEY FEATURES:
 * 1. GOOGLE MAPS INTEGRATION
 *    
 * 2. MULTI-STEP FORM WIZARD
 *  
 * 3. PHOTO UPLOAD
 *   
 * 
 * 4. HEALTH ASSESSMENT

 * 5. REPORT TRACKING
 *  
 * 
 * 6. REPORTER INFORMATION
 *   
 * 
 * API ENDPOINTS:
 * GET    /api/reports                  - Fetch all reports
 * POST   /api/reports/create           - Submit new report
 * GET    /api/reports/:id              - Get report details
 * PATCH  /api/reports/:id              - Update report status
 * DELETE /api/reports/:id              - Delete report
 * 
 * MAPS & LOCATIONS:
 
 * ═════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  AlertCircle,
  Info,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Users,
  Ban,
  Navigation as NavIcon,
  Landmark,
  FileText,
  HelpCircle,
  Phone,
  ExternalLink,
  User,
  Clock,
  MapPin,
  Crosshair,
} from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  InfoWindow,
} from "@react-google-maps/api";

const libraries = ["places"]; // Required for the search bar to work

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
};

const sriLankaCenter = { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka

/**
 * ReportingPage Component
 * Multi-step form for reporting stray dogs with map-based location selection
 */
export default function ReportingPage() {
  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);

  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // UI States
  const [step, setStep] = useState("map");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Backend Data States
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    green: 0,
    yellow: 0,
    blue: 0,
    red: 0,
  });

  // Form States
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Media States
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [currentAction, setCurrentAction] = useState(null);

  const [showReporterModal, setShowReporterModal] = useState(false);
  const [showReportDetailModal, setShowReportDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [hoveredReport, setHoveredReport] = useState(null);

  const [reporterDetails, setReporterDetails] = useState({
    name: "",
    contact: "",
    address: "",
  });

  const [statusQuestions, setStatusQuestions] = useState([
    { id: "injured", question: "Is the dog injured?", answer: null },
    { id: "age", question: "Is this a puppy (under 1 year)?", answer: null },
    {
      id: "collar",
      question: "Is the dog wearing a collar or tag?",
      answer: null,
    },
  ]);

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    fetchLiveReports();
  }, []);

  const fetchLiveReports = async () => {
    try {
      const [reportsRes, summaryRes] = await Promise.all([
        fetch("https://straycareplatform.onrender.com/api/reports"),
        fetch("https://straycareplatform.onrender.com/api/reports/summary"),
      ]);
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (error) {
      console.error("Failed to fetch map data:", error);
    }
  };

  // --- GOOGLE MAPS LOGIC ---
  const onLoadMap = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmountMap = useCallback(function callback() {
    mapRef.current = null;
  }, []);

  // 1. Handle clicking the map to drop a pin
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Reverse Geocode to get the address name
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const address =
        status === "OK" && results[0]
          ? results[0].formatted_address
          : "Selected Location";
      setSelectedLocation({ lat, lng, address });
      setSearchQuery(address);
    });
  };

  // 2. Handle the Search Bar (Autocomplete)
  const onLoadAutocomplete = (auto) => setAutocomplete(auto);
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;

        setSelectedLocation({ lat, lng, address });
        setSearchQuery(address);

        // Pan the map to the searched location
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
      }
    }
  };

  // 3. Handle Live GPS Location
  const useLiveLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const address =
              status === "OK" && results[0]
                ? results[0].formatted_address
                : "My Current Location";
            setSelectedLocation({ lat, lng, address });
            setSearchQuery(address);

            if (mapRef.current) {
              mapRef.current.panTo({ lat, lng });
              mapRef.current.setZoom(16);
            }
            setIsLoading(false);
          });
        },
        () => {
          setErrorMsg(
            "Failed to get your location. Please check your browser permissions.",
          );
          setIsLoading(false);
        },
      );
    } else {
      setErrorMsg("Geolocation is not supported by this browser.");
    }
  };

  // --- FORM LOGIC ---
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setErrorMsg("");

    if (photoFiles.length + files.length > 5) {
      return setErrorMsg("Maximum upload limit exceeded (5 files max).");
    }

    const existingVideos = photoFiles.filter((f) =>
      f.type.startsWith("video/"),
    ).length;
    const newVideos = files.filter((f) => f.type.startsWith("video/")).length;
    if (existingVideos + newVideos > 1) {
      return setErrorMsg("Only 1 video is allowed.");
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoFiles([...photoFiles, ...files]);
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const updateStatusAnswer = (id, answer) => {
    setStatusQuestions(
      statusQuestions.map((q) => (q.id === id ? { ...q, answer } : q)),
    );
  };

  const handleActionNext = () => {
    if (currentAction === "adopt" || currentAction === "temporary") {
      setShowReporterModal(true);
    } else {
      handleSubmitReport();
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedLocation) return;
    setIsLoading(true);
    setErrorMsg("");

    const actionMap = {
      adopt: "Permanently Adopted",
      temporary: "Temporarily Adopted",
      contact: "Contacted Welfare Organizations",
      none: "Urgent Help Needed",
    };

    const formData = new FormData();
    formData.append(
      "location",
      JSON.stringify({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address:
          selectedLocation.address + (landmark ? ` (Near: ${landmark})` : ""),
      }),
    );

    formData.append(
      "dogDetails",
      JSON.stringify({
        description: description || "No description provided.",
        condition: JSON.stringify(statusQuestions),
      }),
    );

    formData.append("actionStatus", actionMap[currentAction]);

    if (currentAction === "adopt")
      formData.append("adopterDetails", JSON.stringify(reporterDetails));
    else if (currentAction === "temporary")
      formData.append("tempGuardianDetails", JSON.stringify(reporterDetails));

    photoFiles.forEach((file) => formData.append("media", file));

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to submit a report.");

      const response = await fetch("https://straycareplatform.onrender.com/api/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setShowReporterModal(false);
        setStep("complete");
        fetchLiveReports();
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      setErrorMsg(
        error.message || "Failed to submit report. Ensure backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("map");
    setSelectedLocation(null);
    setSearchQuery("");
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setDescription("");
    setLandmark("");
    setCurrentAction(null);
    setReporterDetails({ name: "", contact: "", address: "" });
    setStatusQuestions(statusQuestions.map((q) => ({ ...q, answer: null })));
  };

  // Maps Backend Actions to standard Google Maps Marker Icon Colors
  const getMarkerIconUrl = (action) => {
    switch (action) {
      case "Permanently Adopted":
        return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
      case "Temporarily Adopted":
        return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
      case "Contacted Welfare Organizations":
        return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
      case "Urgent Help Needed":
        return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
      default:
        return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    }
  };

  // Add this missing function back!
  const getMarkerColor = (action) => {
    switch (action) {
      case "Permanently Adopted":
        return "bg-green-500";
      case "Temporarily Adopted":
        return "bg-yellow-500";
      case "Contacted Welfare Organizations":
        return "bg-blue-500";
      case "Urgent Help Needed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusSummary = (statusString) => {
    try {
      const status = JSON.parse(statusString);
      const injured = status.find((q) => q.id === "injured");
      const age = status.find((q) => q.id === "age");
      const issues = [];
      if (injured?.answer === "yes") issues.push("Injured");
      if (age?.answer === "yes") issues.push("Puppy");
      return issues.length > 0 ? issues.join(", ") : "Status Unknown";
    } catch (error) {
      console.error(error); // Fixed: Now the error variable is actually being used!
      return "Status Unknown";
    }
  };

  const getFilteredReports = () => {
    let filtered = [...reports];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (timeFilter === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      filtered = filtered.slice(0, 1);
    } else if (timeFilter === "today") {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= today);
    } else if (timeFilter === "week") {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= weekAgo);
    } else if (timeFilter === "month") {
      filtered = filtered.filter((r) => new Date(r.createdAt) >= monthAgo);
    }

    if (statusFilter !== "all") {
      const statusMap = {
        adopt: "Permanently Adopted",
        temporary: "Temporarily Adopted",
        contact: "Contacted Welfare Organizations",
        none: "Urgent Help Needed",
      };
      filtered = filtered.filter(
        (r) => r.actionStatus === statusMap[statusFilter],
      );
    }

    return filtered;
  };

  const filteredReports = getFilteredReports();

  if (loadError)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading maps. Please check your API key.
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center max-w-4xl mx-auto">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-6 shadow-lg">
            <MapPin className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-800 font-bold">
            Report a Stray Dog
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Help us locate and rescue stray dogs in need. Your report can save a
            life.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-orange-500 transition-transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-gray-800 text-center mb-1">
              {summary.total}
            </div>
            <div className="text-gray-500 text-sm text-center font-medium">
              Total Reports
            </div>
          </div>
          <div
            className={`bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500 transition-transform hover:-translate-y-1 cursor-pointer ${statusFilter === "adopt" ? "ring-2 ring-green-400" : ""}`}
            onClick={() =>
              setStatusFilter(statusFilter === "adopt" ? "all" : "adopt")
            }
          >
            <div className="text-4xl font-bold text-gray-800 text-center mb-1">
              {summary.green}
            </div>
            <div className="text-gray-500 text-sm text-center font-medium">
              Permanently Adopted
            </div>
            {statusFilter === "adopt" && (
              <div className="text-xs text-green-600 text-center font-bold mt-1">
                Filtered
              </div>
            )}
          </div>
          <div
            className={`bg-white rounded-xl shadow-md p-5 border-t-4 border-yellow-500 transition-transform hover:-translate-y-1 cursor-pointer ${statusFilter === "temporary" ? "ring-2 ring-yellow-400" : ""}`}
            onClick={() =>
              setStatusFilter(
                statusFilter === "temporary" ? "all" : "temporary",
              )
            }
          >
            <div className="text-4xl font-bold text-gray-800 text-center mb-1">
              {summary.yellow}
            </div>
            <div className="text-gray-500 text-sm text-center font-medium">
              Temporarily Adopted
            </div>
            {statusFilter === "temporary" && (
              <div className="text-xs text-yellow-600 text-center font-bold mt-1">
                Filtered
              </div>
            )}
          </div>
          <div
            className={`bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-500 transition-transform hover:-translate-y-1 cursor-pointer ${statusFilter === "contact" ? "ring-2 ring-blue-400" : ""}`}
            onClick={() =>
              setStatusFilter(statusFilter === "contact" ? "all" : "contact")
            }
          >
            <div className="text-4xl font-bold text-gray-800 text-center mb-1">
              {summary.blue}
            </div>
            <div className="text-gray-500 text-sm text-center font-medium">
              Org. Contacted
            </div>
            {statusFilter === "contact" && (
              <div className="text-xs text-blue-600 text-center font-bold mt-1">
                Filtered
              </div>
            )}
          </div>
          <div
            className={`bg-white rounded-xl shadow-md p-5 border-t-4 border-red-500 transition-transform hover:-translate-y-1 cursor-pointer ${statusFilter === "none" ? "ring-2 ring-red-400" : ""}`}
            onClick={() =>
              setStatusFilter(statusFilter === "none" ? "all" : "none")
            }
          >
            <div className="text-4xl font-bold text-gray-800 text-center mb-1">
              {summary.red}
            </div>
            <div className="text-gray-500 text-sm text-center font-medium">
              Urgent Help Needed
            </div>
            {statusFilter === "none" && (
              <div className="text-xs text-red-600 text-center font-bold mt-1">
                Filtered
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="font-bold text-gray-800">Time Period</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All Time" },
                  { key: "recent", label: "Most Recent" },
                  { key: "today", label: "Today" },
                  { key: "week", label: "Last 7 Days" },
                  { key: "month", label: "Last 30 Days" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTimeFilter(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all border-none cursor-pointer ${
                      timeFilter === key
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-gray-600">
                <span className="font-bold text-gray-800">
                  {filteredReports.length}
                </span>{" "}
                of {reports.length} reports
              </div>
              {(timeFilter !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setTimeFilter("all");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 border-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {(timeFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active Filters:</span>
              {timeFilter !== "all" && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {timeFilter === "recent"
                    ? "Most Recent"
                    : timeFilter === "today"
                      ? "Today"
                      : timeFilter === "week"
                        ? "Last 7 Days"
                        : "Last 30 Days"}
                </span>
              )}
              {statusFilter !== "all" && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusFilter === "adopt"
                      ? "bg-green-100 text-green-700"
                      : statusFilter === "temporary"
                        ? "bg-yellow-100 text-yellow-700"
                        : statusFilter === "contact"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {statusFilter === "adopt"
                    ? "Permanently Adopted"
                    : statusFilter === "temporary"
                      ? "Temporarily Adopted"
                      : statusFilter === "contact"
                        ? "Org. Contacted"
                        : "Urgent Help Needed"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div
              className={`flex items-center ${step !== "complete" ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${["map", "upload", "details", "action", "complete"].includes(step) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                1
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-bold text-gray-800">Location</p>
              </div>
            </div>
            {step !== "complete" && (
              <ChevronRight className="h-5 w-5 text-gray-300 mx-2" />
            )}

            <div
              className={`flex items-center ${step !== "complete" ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${["upload", "details", "action", "complete"].includes(step) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                2
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-bold text-gray-800">Photos</p>
              </div>
            </div>
            {step !== "complete" && (
              <ChevronRight className="h-5 w-5 text-gray-300 mx-2" />
            )}

            <div
              className={`flex items-center ${step !== "complete" ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${["details", "action", "complete"].includes(step) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                3
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-bold text-gray-800">Details</p>
              </div>
            </div>
            {step !== "complete" && (
              <ChevronRight className="h-5 w-5 text-gray-300 mx-2" />
            )}

            <div
              className={`flex items-center ${step !== "complete" ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${["action", "complete"].includes(step) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                4
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-bold text-gray-800">Action</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Map Selection */}
        {step === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Container */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl text-gray-800 font-bold flex items-center">
                    <MapPin className="h-6 w-6 mr-2 text-orange-500" />
                    Select Location on Map
                  </h2>
                  <button
                    onClick={useLiveLocation}
                    disabled={isLoading}
                    className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 border-none cursor-pointer"
                  >
                    <Crosshair className="h-4 w-4 mr-2" />
                    Use Live Location
                  </button>
                </div>

                {/* REAL GOOGLE MAP */}
                <div className="w-full h-125 rounded-xl overflow-hidden border-2 border-gray-200">
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={
                        selectedLocation
                          ? {
                              lat: selectedLocation.lat,
                              lng: selectedLocation.lng,
                            }
                          : sriLankaCenter
                      }
                      zoom={selectedLocation ? 15 : 7}
                      onClick={handleMapClick}
                      onLoad={onLoadMap}
                      onUnmount={onUnmountMap}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                      }}
                    >
                      {/* Show previously reported dogs */}
                      {filteredReports.map((report) => (
                        <Marker
                          key={report._id}
                          position={{
                            lat: report.location.lat,
                            lng: report.location.lng,
                          }}
                          icon={getMarkerIconUrl(report.actionStatus)}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportDetailModal(true);
                          }}
                          onMouseOver={() => setHoveredReport(report)}
                          onMouseOut={() => setHoveredReport(null)}
                        >
                          {hoveredReport?._id === report._id && (
                            <InfoWindow
                              position={{
                                lat: report.location.lat,
                                lng: report.location.lng,
                              }}
                            >
                              <div className="p-1 max-w-50">
                                <p className="font-bold text-sm mb-1">
                                  {report.location.address}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Status:{" "}
                                  {getStatusSummary(
                                    report.dogDetails.condition,
                                  )}
                                </p>
                              </div>
                            </InfoWindow>
                          )}
                        </Marker>
                      ))}

                      {/* Show the pin the user just dropped */}
                      {selectedLocation && (
                        <Marker
                          position={{
                            lat: selectedLocation.lat,
                            lng: selectedLocation.lng,
                          }}
                          animation={window.google.maps.Animation.DROP}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      Loading Map...
                    </div>
                  )}
                </div>

                {selectedLocation && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center text-orange-800">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="font-semibold">
                        Selected: {selectedLocation.address}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Search & Legend */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-xl mb-4 text-gray-800 font-bold flex items-center">
                  <NavIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Search Location
                </h3>

                {isLoaded && (
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder="Search for a city or street..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </Autocomplete>
                )}

                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-amber-600 mr-2 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Search above, use your live location, or click anywhere on
                      the map to drop a pin for the report.
                    </p>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="mt-6 p-5 bg-gray-50 border border-gray-100 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">
                    Map Legend
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm font-medium">
                      <img
                        src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        alt="green"
                        className="w-5 h-5 mr-3"
                      />
                      <span className="text-gray-700">Permanently Adopted</span>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <img
                        src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                        alt="yellow"
                        className="w-5 h-5 mr-3"
                      />
                      <span className="text-gray-700">Temporarily Adopted</span>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <img
                        src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        alt="blue"
                        className="w-5 h-5 mr-3"
                      />
                      <span className="text-gray-700">
                        Contacted Welfare Org
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      <img
                        src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        alt="red"
                        className="w-5 h-5 mr-3"
                      />
                      <span className="text-gray-700">Urgent Help Needed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {step === "upload" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl mb-6 text-gray-800 flex items-center font-bold">
              <Camera className="h-6 w-6 mr-2 text-orange-500" />
              Upload Photos or Videos
            </h2>

            {photoPreviews.length === 0 ? (
              <label htmlFor="dogPhotos" className="block cursor-pointer">
                <div className="border-3 border-dashed border-orange-300 rounded-2xl p-16 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <Upload className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-800 font-bold text-lg mb-2">
                    Click to upload photos or videos
                  </p>
                  <p className="text-gray-500">
                    Max 5 files (Only 1 video allowed)
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Supports: JPG, PNG, MP4
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="dogPhotos"
                />
              </label>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {photoFiles[index].type.startsWith("video/") ? (
                        <video
                          src={preview}
                          className="w-full h-40 object-cover rounded-xl shadow-md"
                        />
                      ) : (
                        <img
                          src={preview}
                          alt="Upload"
                          className="w-full h-40 object-cover rounded-xl shadow-md"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-none cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <label
                  htmlFor="dogPhotosAdd"
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  <span>Add More Files</span>
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="dogPhotosAdd"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {step === "details" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl mb-6 text-gray-800 font-bold flex items-center">
              <FileText className="h-6 w-6 mr-2 text-orange-500" />
              Dog Details & Status
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the dog's appearance, behavior..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors resize-none"
                rows={4}
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nearby Landmarks (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near ABC School..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <h3 className="text-lg mb-4 text-gray-800 font-bold flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-orange-500" />
                Dog Status Assessment
              </h3>
              <div className="space-y-4">
                {statusQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-5 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <p className="font-semibold text-gray-800 mb-3">
                      {question.question}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateStatusAnswer(question.id, "yes")}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer border-none ${question.answer === "yes" ? "bg-green-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => updateStatusAnswer(question.id, "no")}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer border-none ${question.answer === "no" ? "bg-red-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"}`}
                      >
                        No
                      </button>
                      <button
                        onClick={() =>
                          updateStatusAnswer(question.id, "notSure")
                        }
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all cursor-pointer border-none ${question.answer === "notSure" ? "bg-gray-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"}`}
                      >
                        Not Sure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Action Selection */}
        {step === "action" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl mb-6 text-gray-800 font-bold flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-orange-500" />
              What action are you taking?
            </h2>

            <div className="space-y-4">
              <button
                onClick={() => setCurrentAction("adopt")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${currentAction === "adopt" ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"}`}
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-green-600" /> Permanently
                  Adopt / Take Home
                </h3>
                <p className="text-sm text-gray-600 mt-2 pl-7">
                  I will take this dog home and provide permanent care.
                </p>
              </button>

              <button
                onClick={() => setCurrentAction("temporary")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${currentAction === "temporary" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/50"}`}
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-yellow-600" /> Temporary
                  Care (Foster)
                </h3>
                <p className="text-sm text-gray-600 mt-2 pl-7">
                  I can provide temporary shelter while finding a permanent
                  solution.
                </p>
              </button>

              <button
                onClick={() => setCurrentAction("contact")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${currentAction === "contact" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"}`}
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" /> Contact
                  Animal Welfare
                </h3>
                <p className="text-sm text-gray-600 mt-2 pl-7">
                  I will contact an organization to rescue this dog.
                </p>
              </button>

              <button
                onClick={() => setCurrentAction("none")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${currentAction === "none" ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50"}`}
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" /> Urgent
                  Help Needed
                </h3>
                <p className="text-sm text-gray-600 mt-2 pl-7">
                  I cannot provide assistance but want to drop a pin so others
                  can help.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && (
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 shadow-lg shadow-green-200">
              <Check className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Report Submitted!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for helping stray dogs in need. Your report has been
              added to the live map.
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg cursor-pointer border-none"
            >
              Report Another Dog
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step !== "complete" && (
          <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
            <button
              onClick={() => {
                if (step === "upload") setStep("map");
                if (step === "details") setStep("upload");
                if (step === "action") setStep("details");
              }}
              disabled={step === "map"}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-colors border-none cursor-pointer ${
                step === "map"
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <ChevronLeft className="h-5 w-5" /> <span>Back</span>
            </button>

            <button
              onClick={() => {
                if (step === "map" && selectedLocation) setStep("upload");
                else if (step === "upload") setStep("details");
                else if (step === "details") setStep("action");
                else if (step === "action" && currentAction) handleActionNext();
              }}
              disabled={
                (step === "map" && !selectedLocation) ||
                (step === "action" && !currentAction) ||
                isLoading
              }
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-colors border-none cursor-pointer ${
                (step === "map" && !selectedLocation) ||
                (step === "action" && !currentAction)
                  ? "bg-gray-200 text-gray-400"
                  : "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-amber-600"
              }`}
            >
              <span>
                {isLoading
                  ? "Submitting..."
                  : step === "action"
                    ? "Submit Report"
                    : "Continue"}
              </span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Reporter Details Modal */}
      {showReporterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Contact Details
            </h3>
            <p className="text-gray-500 mb-6">
              Please provide your details since you selected to temporarily or
              permanently adopt.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={reporterDetails.name}
                onChange={(e) =>
                  setReporterDetails({
                    ...reporterDetails,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Contact Number"
                value={reporterDetails.contact}
                onChange={(e) =>
                  setReporterDetails({
                    ...reporterDetails,
                    contact: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Address / City"
                value={reporterDetails.address}
                onChange={(e) =>
                  setReporterDetails({
                    ...reporterDetails,
                    address: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowReporterModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer border-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={
                  !reporterDetails.name ||
                  !reporterDetails.contact ||
                  !reporterDetails.address ||
                  isLoading
                }
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer border-none disabled:opacity-50 shadow-md transition-colors"
              >
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail View Modal */}
      {showReportDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowReportDetailModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full border-none cursor-pointer transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-orange-500" />
              Report Details
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-gray-800 font-medium">
                  {selectedReport.location.address}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Status Assesment
                </p>
                <p className="text-gray-800 font-medium">
                  {getStatusSummary(selectedReport.dogDetails.condition)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Current Action Taken
                </p>
                <p className="font-bold flex items-center mt-1">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${getMarkerColor(selectedReport.actionStatus)}`}
                  ></span>
                  {selectedReport.actionStatus}
                </p>
              </div>
              {selectedReport.dogDetails.description &&
                selectedReport.dogDetails.description !==
                  "No description provided." && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-gray-800">
                      {selectedReport.dogDetails.description}
                    </p>
                  </div>
                )}
            </div>

            {/* Display Photos if they exist */}
            {selectedReport.media && selectedReport.media.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-3">
                  Attached Media
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReport.media.map((item, idx) =>
                    item.fileType === "video" ? (
                      <video
                        key={idx}
                        src={item.url.startsWith("http") ? item.url : `https://straycareplatform.onrender.com/${item.url}`}

                        className="w-full h-24 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        key={idx}
                        src={item.url.startsWith("http") ? item.url : `https://straycareplatform.onrender.com/${item.url}`}
                        alt="Dog"
                        className="w-full h-24 object-cover rounded-lg shadow-sm"
                      />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
