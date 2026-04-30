import { useState, useEffect } from "react";
import {
  Stethoscope,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
  Wifi,
  WifiOff,
  Star,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────

function getSeverityColor(severity) {
  switch (severity) {
    case "Low":
      return "bg-green-100 text-green-800 border-green-300";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "High":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Critical":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function getSeverityIcon(severity) {
  switch (severity) {
    case "Low":
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    case "Moderate":
    case "High":
      return <AlertTriangle className="h-6 w-6 text-orange-600" />;
    case "Critical":
      return <AlertTriangle className="h-6 w-6 text-red-600" />;
    default:
      return <Info className="h-6 w-6 text-gray-600" />;
  }
}

// ─── Component ────────────────────────────────────────────────────────────

export function DiseaseDetectionPage() {
  const [uploadedImages, setUploadedImages] = useState([]); // preview URLs
  const [uploadedFile, setUploadedFile] = useState(null); // actual File object
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null); // { serviceOnline, modelLoaded }

  // ── Check if Flask microservice is online on page load ──────────────────
  useEffect(() => {
    const checkService = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/disease-detection/status",
        );
        const data = await res.json();
        setServiceStatus(data);
      } catch {
        setServiceStatus({ serviceOnline: false, modelLoaded: false });
      }
    };
    checkService();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Keep only the first file — model works on one image at a time
    const file = files[0];
    setUploadedFile(file);
    setUploadedImages([URL.createObjectURL(file)]);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setResults(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("image", uploadedFile);

      const res = await fetch(
        "http://localhost:5001/api/disease-detection/analyze",
        {
          method: "POST",
          headers: {
            // Do NOT set Content-Type here — browser sets it with the boundary
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Analysis failed (${res.status})`);
      }

      setResults(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      console.error("[Disease Detection Error]", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedImages([]);
    setUploadedFile(null);
    setResults(null);
    setError(null);
    setIsProcessing(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-800">
            Skin Disease Detection
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Our AI system helps identify potential skin conditions in dogs to
            provide timely care and treatment
          </p>
        </div>

        {/* ── Service status banner ────────────────────────────────────────── */}
        {serviceStatus !== null && (
          <div
            className={`flex items-center space-x-3 px-5 py-3 rounded-xl mb-6 border ${
              serviceStatus.serviceOnline
                ? serviceStatus.modelLoaded
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-yellow-50 border-yellow-200 text-yellow-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {serviceStatus.serviceOnline ? (
              <Wifi className="h-5 w-5 flex-shrink-0" />
            ) : (
              <WifiOff className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">
              {!serviceStatus.serviceOnline
                ? "Detection service is offline. Please start the Flask microservice."
                : !serviceStatus.modelLoaded
                  ? "Service online but model not loaded. Run python download_model.py in the service folder."
                  : "Detection service is online and ready."}
            </span>
          </div>
        )}

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl mb-3 text-gray-800">How It Works</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Our AI-powered detection system analyses images of dogs to
                identify common skin diseases and conditions. This provides
                preliminary assessments to help you understand if veterinary
                attention may be needed.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Important Guidelines:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {[
                    "Upload clear, well-lit photographs of the affected area",
                    "Ensure the skin condition is clearly visible in the image",
                    "Avoid blurry or low-quality images for best results",
                    "This is not a replacement for professional veterinary diagnosis",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span
                        className={
                          tip.startsWith("This") ? "font-semibold" : ""
                        }
                      >
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Upload section ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl mb-6 text-gray-800 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-green-500" />
            Upload Image
          </h2>

          {uploadedImages.length === 0 ? (
            <label className="block">
              <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </label>
          ) : (
            <div>
              {/* Image preview */}
              <div className="relative inline-block mb-6 group">
                <img
                  src={uploadedImages[0]}
                  alt="Uploaded"
                  className="w-64 h-64 object-cover rounded-lg shadow-md"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={
                    isProcessing ||
                    (serviceStatus && !serviceStatus.serviceOnline)
                  }
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Stethoscope className="h-5 w-5" />
                  )}
                  <span>{isProcessing ? "Analysing..." : "Analyse Image"}</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Processing state ─────────────────────────────────────────────── */}
        {isProcessing && (
          <div className="bg-white rounded-2xl shadow-lg p-12 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-pulse">
                <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
              </div>
              <h3 className="text-2xl mb-2 text-gray-800">
                AI Model is Detecting…
              </h3>
              <p className="text-gray-600">
                Analysing image for skin conditions and diseases
              </p>
              <div className="mt-6 max-w-md mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ animation: "progress 5s ease-in-out forwards" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────────────────── */}
        {error && !isProcessing && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-red-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">
                  Detection Failed
                </h3>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {results && !isProcessing && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-200">
              <h2 className="text-2xl mb-6 text-gray-800 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                Detection Results
              </h2>

              {/* Disease name + description */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">
                      Detected Condition:
                    </p>
                    <h3 className="text-3xl text-gray-800">
                      {results.disease}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* Severity badge */}
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getSeverityColor(results.severity)}`}
                    >
                      {getSeverityIcon(results.severity)}
                      {results.severity} Severity
                    </span>
                    {/* Confidence */}
                    <span className="text-sm text-gray-500">
                      Confidence: <strong>{results.confidence}%</strong>
                    </span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Model confidence</span>
                    <span>{results.confidence}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${results.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {results.description}
                  </p>
                </div>
              </div>

              {/* Points awarded */}
              {results.pointsAwarded && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center space-x-3">
                  <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <p className="text-amber-800 text-sm font-medium">
                    You earned <strong>+{results.pointsAwarded} points</strong>{" "}
                    for using health detection!
                  </p>
                </div>
              )}

              {/* Medical disclaimer */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-semibold mb-1">
                      Medical Disclaimer
                    </p>
                    <p className="text-amber-700 text-sm">
                      This is an automated assessment and should not replace
                      professional veterinary diagnosis. Please consult with a
                      licensed veterinarian for proper treatment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Human contagion warning */}
              {results.contagiousToHumans ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-semibold mb-1">
                        ⚠️ Human Safety Warning
                      </p>
                      <p className="text-red-700 text-sm font-medium mb-2">
                        This condition CAN be transmitted to humans. Please take
                        the following precautions:
                      </p>
                      <ul className="text-red-700 text-sm space-y-1 ml-4">
                        <li>• Wear gloves when handling the affected dog</li>
                        <li>
                          • Wash hands thoroughly with soap and water after
                          contact
                        </li>
                        <li>• Avoid touching your face before washing hands</li>
                        <li>
                          • Keep children and immunocompromised individuals away
                          from the dog
                        </li>
                        <li>
                          • Consult a veterinarian immediately for proper
                          treatment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-semibold mb-1">
                        ✓ Safe for Human Contact
                      </p>
                      <p className="text-green-700 text-sm font-medium">
                        {results.humanSafetyMessage} Basic hygiene like washing
                        hands after handling any animal is still recommended.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Next steps ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl mb-6 text-gray-800 flex items-center">
                <Info className="h-6 w-6 mr-2 text-purple-500" />
                Recommended Next Steps
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    num: 1,
                    color: "purple",
                    title: "Consult a Veterinarian",
                    text: "Schedule an appointment with a licensed veterinarian for professional diagnosis and treatment plan.",
                  },
                  {
                    num: 2,
                    color: "blue",
                    title: "Document Symptoms",
                    text: "Keep track of when symptoms started, any changes in behaviour, and how the condition progresses.",
                  },
                  {
                    num: 3,
                    color: "green",
                    title: "Prevent Scratching",
                    text: "Use an Elizabethan collar if necessary to prevent the dog from scratching and worsening the condition.",
                  },
                  {
                    num: 4,
                    color: "orange",
                    title: "Isolate if Contagious",
                    text: "If the condition is contagious, keep the affected dog separated from other animals until treated.",
                  },
                ].map(({ num, color, title, text }) => (
                  <div key={num} className={`bg-${color}-50 rounded-lg p-6`}>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span
                        className={`bg-${color}-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2`}
                      >
                        {num}
                      </span>
                      {title}
                    </h3>
                    <p className="text-gray-700 text-sm">{text}</p>
                  </div>
                ))}
              </div>

              {/* Emergency signs */}
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Emergency Warning Signs
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Seek immediate veterinary care if you notice:
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  {[
                    "Rapid spreading of the affected area",
                    "Signs of severe pain or distress",
                    "Open wounds, bleeding, or discharge",
                    "Fever, lethargy, or loss of appetite",
                  ].map((sign) => (
                    <li key={sign} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to   { width: 95%; }
        }
      `}</style>
    </div>
  );
}
