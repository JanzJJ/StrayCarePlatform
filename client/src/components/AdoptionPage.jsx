/**
 * ═════════════════════════════════════════════════════════════════════════════
 * ADOPTION PAGE COMPONENT (AdoptionPage.jsx)
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * Main adoption platform interface where users can:
 * 1. BROWSE available dogs for adoption
 * 2. FILTER by breed, age, location, status
 * 3. REQUEST adoption for a dog
 * 4. CONFIRM adoption requests via email
 * 5. LIST their own dogs for adoption (organizations)
 * 
 * KEY FEATURES:
 * 1. DOG LISTINGS
 *    - Display all adoptable dogs in grid/list format
 *    - Each card shows: photo, name, breed, age, location, status
 *    - Click to view full details modal
 * 
 * 2. SEARCH & FILTER
 *    - Search by dog name
 *    - Filter by: breed, age range, location (Sri Lankan cities), status
 *    - Real-time filtering (useMemo optimization)
 *    - Filter pills with clear all option
 * 
 * 3. ADOPTION REQUEST WORKFLOW
 *    - User selects dog → Modal with adoption form
 *    - Requires: requester name, email, contact
 *    - Prevents users from adopting their own listed dogs
 *    - Email confirmation to requester
 *    - Confirmation email from organization
 * 
 * 4. LIST A DOG (Organizations)
 *    - Modal form to add new adoptable dog
 *    - Upload photos (multiple)
 *    - Fill: name, breed, age, gender, location, description
 *    - Lister contact info (name, email, phone)
 *    - Creates listing linked to user account
 * 
 * 5. STATISTICS DASHBOARD
 *    - Total dogs in system
 *    - Available for adoption
 *    - Successfully adopted
 *    - Pending adoption requests
 * 
 * STATE MANAGEMENT:
 * • dogs: Array of all dog listings from backend
 * • counts: Statistics object {totalDogs, availableDogs, successfullyAdopted, pendingRequests}
 * • Search/Filter states: searchQuery, selectedBreed, selectedAge, selectedLocation, selectedStatus
 * • Modal states: showListDogModal, showDetailModal, showRequestConfirmation, showConfirmationEmail
 * • Form states: Dog details, photo uploads, requester details, lister details
 * 
 * API ENDPOINTS:
 * GET    /api/adoption                      - Fetch all dog listings
 * GET    /api/adoption/counts               - Fetch adoption statistics
 * POST   /api/adoption/create               - Create new dog listing
 * POST   /api/adoption/request              - Submit adoption request
 * PATCH  /api/adoption/confirm/:id          - Confirm adoption request
 * DELETE /api/adoption/:id                  - Delete dog listing
 * 
 * FILTERING LOGIC:
 * • Breed filter: "All" vs specific breed match
 * • Age filter: Age ranges (puppy/young/adult/senior)
 * • Location filter: Sri Lankan cities list
 * • Status filter: Available, Adopted, Pending
 * • Search: Case-insensitive name matching
 * • Combined: All filters applied with AND logic (useMemo)
 * 
 * ADOPTION REQUEST WORKFLOW:
 * 1. User clicks "Adopt" on dog card
 * 2. Modal shows dog details + adoption form
 * 3. User fills requester info (name, email, contact)
 * 4. System prevents self-adoption (checks if requester owns dog listing)
 * 5. Submit request → API creates adoption_request record
 * 6. Email sent to requester confirming request
 * 7. Organization receives notification
 * 8. Organization can confirm/reject request
 * 9. Status changes to "Adopted" when confirmed
 * 
 * STYLING:
 * • Tailwind CSS with consistent orange/amber theme
 * • Responsive grid: 1-2 columns mobile, 3-4 desktop
 * • Modal overlays with backdrop blur
 * • Loading spinners and error messages
 * • Hover effects on cards and buttons
 * 
 * ═════════════════════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useEffect } from "react";
import {
  Heart,
  MapPin,
  Calendar,
  Bone,
  Filter,
  Search,
  CheckCircle,
  Clock,
  PawPrint,
  Plus,
  X,
  Upload,
  Camera,
  User,
  Mail,
  Phone,
  Info,
  AlertCircle,
} from "lucide-react";

/**
 * AdoptionPage Component
 * Main interface for dog adoption workflow
 * Displays listings, handles searches, adoption requests, and dog listings
 */
export default function AdoptionPage() {
  /**
   * ═════════════════════════════════════════════════════════════════
   * STATE MANAGEMENT
   * ═════════════════════════════════════════════════════════════════
   */
  
  // Current logged-in user (from localStorage)
  // Used to prevent users from adopting their own listed dogs
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
  /**
   * PRIMARY DATA STATE
   * • dogs: Array of all dog listings fetched from backend
   * • counts: Statistics object with adoption platform metrics
   *   - totalDogs: Total dogs in system
   *   - availableDogs: Dogs currently available for adoption
   *   - successfullyAdopted: Dogs already adopted
   *   - pendingRequests: Adoption requests awaiting organization response
   */
  const [dogs, setDogs] = useState([]);
  const [counts, setCounts] = useState({
    totalDogs: 0,
    availableDogs: 0,
    successfullyAdopted: 0,
    pendingRequests: 0,
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /**
   * FILTER STATES
   * Used for real-time filtering of dog listings
   * • searchQuery: Text search for dog name (case-insensitive)
   * • selectedBreed: Filter by dog breed ("All" for no filter)
   * • selectedAge: Filter by age range ("All" for no filter)
   * • selectedLocation: Filter by Sri Lankan city ("All" for no filter)
   * • selectedStatus: Filter by adoption status (Available/Adopted/Pending)
   */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("All");
  const [selectedAge, setSelectedAge] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  /**
   * MODAL CONTROL STATES
   * • showListDogModal: Toggle form to create new dog listing
   * • showDetailModal: Toggle dog detail view modal
   * • selectedDog: Currently selected dog (null when modal closed)
   */
  const [showListDogModal, setShowListDogModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);

  /**
   * ADOPTION REQUEST STATES
   * • showRequestConfirmation: Show confirmation before submitting adoption request
   * • requestedDogId: ID of dog being adopted (to prevent multiple requests)
   * • showConfirmationEmail: Show email confirmation after request submitted
   * • confirmedDog: Dog that was just adopted (for confirmation display)
   */
  const [showRequestConfirmation, setShowRequestConfirmation] = useState(false);
  const [requestedDogId, setRequestedDogId] = useState(null);
  const [showConfirmationEmail, setShowConfirmationEmail] = useState(false);
  const [confirmedDog, setConfirmedDog] = useState(null);

  /**
   * ADOPTION REQUESTER DETAILS
   * Information provided by user wanting to adopt:
   * • requesterName: Full name of adoption requester
   * • requesterEmail: Email for adoption confirmation
   * • requesterContact: Phone number for organization to contact
   */
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterContact, setRequesterContact] = useState("");

  /**
   * DOG LISTING FORM STATES
   * Used when organizations create new adoptable dog listings:
   
   * PHOTOS:
   * • dogPhotos: Array of File objects from upload
   * • photoPreviews: Data URLs for preview display
   * 
   * DOG DETAILS:
   * • dogName: Name of dog
   * • dogBreed: Breed from commonBreeds list
   * • dogAge: Age in years/months
   * • dogGender: "Male" or "Female"
   * • dogLocation: City from sriLankanCities list
   * • dogDescription: Long text description (behavior, health, etc)
   * 
   * LISTER DETAILS:
   * • listerName: Organization/person name
   * • listerEmail: Contact email
   * • listerPhone: Contact phone
   */
  const [dogPhotos, setDogPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [dogGender, setDogGender] = useState("Male");
  const [dogLocation, setDogLocation] = useState("");
  const [dogDescription, setDogDescription] = useState("");
  const [listerName, setListerName] = useState("");
  const [listerEmail, setListerEmail] = useState("");
  const [listerPhone, setListerPhone] = useState("");

  /**
   * CONFIGURATION DATA
   * Static arrays used for filter options and form dropdowns
   */
  
  /**
   * SRI LANKAN CITIES
   * Used for location filtering and listing creation
   * Covers all major cities across the island
   * Users filter dogs by these cities
   */
  const sriLankanCities = [
    "Colombo",
    "Kandy",
    "Galle",
    "Negombo",
    "Jaffna",
    "Matara",
    "Nuwara Eliya",
    "Trincomalee",
    "Anuradhapura",
    "Batticaloa",
    "Kurunegala",
    "Ratnapura",
    "Badulla",
    "Polonnaruwa",
    "Ampara",
    "Kalmunai",
    "Vavuniya",
    "Gampaha",
    "Kalutara",
    "Hambantota",
  ];

  /**
   * COMMON DOG BREEDS
   * Predefined list for breed filter and listing form
   * Includes popular breeds and "Mixed Breed" option
   * Users filter/search by these breeds
   */
  const commonBreeds = [
    "Mixed Breed",
    "Golden Retriever",
    "Labrador",
    "German Shepherd",
    "Beagle",
    "Poodle",
    "Husky",
    "Bulldog",
    "Rottweiler",
    "Dachshund",
    "Other",
  ];

  /**
   * ═════════════════════════════════════════════════════════════════
   * API FETCH FUNCTION
   * ═════════════════════════════════════════════════════════════════
   * 
   * PURPOSE:
   * Fetch all adoption listings and statistics from backend
   * Called on component mount and after listing/request submission
   * 
   * ENDPOINTS:
   * • GET /api/adoption → All dog listings
   * • GET /api/adoption/counts → Platform statistics
   * 
   * PARALLEL FETCHING:
   * Uses Promise.all to fetch both endpoints simultaneously
   * More efficient than sequential requests
   * 
   * RESPONSE HANDLING:
   * • If listings fetch succeeds: Update dogs array
   * • If counts fetch succeeds: Update counts object
   * • Errors logged but don't block UI (graceful degradation)
   * 
   * ERROR HANDLING:
   * Network errors logged to console
   * User not blocked from UI (data just doesn't load)
   */
  // --- 1. FETCH DATA FROM BACKEND ---
  const fetchAdoptionData = async () => {
    try {
      const [listingsRes, countsRes] = await Promise.all([
        fetch("https://straycareplatform.onrender.com/api/adoption"),
        fetch("https://straycareplatform.onrender.com/api/adoption/counts"),
      ]);

      if (listingsRes.ok) setDogs(await listingsRes.json());
      if (countsRes.ok) setCounts(await countsRes.json());
    } catch (error) {
      console.error("Failed to fetch adoption data", error);
    }
  };

  useEffect(() => {
    fetchAdoptionData();
  }, []);

  // --- 2. LIST A DOG ---
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (dogPhotos.length + files.length > 3) {
      return setErrorMsg("You can only upload up to 3 photos.");
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setDogPhotos([...dogPhotos, ...files]);
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setDogPhotos(dogPhotos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (
      !listerName ||
      !listerEmail ||
      !listerPhone ||
      !dogBreed ||
      !dogAge ||
      !dogLocation
    ) {
      setIsLoading(false);
      return setErrorMsg("Please complete all required fields.");
    }

    const formData = new FormData();
    formData.append(
      "dogDetails",
      JSON.stringify({
        name: dogName || "Unknown",
        breed: dogBreed,
        age: parseInt(dogAge),
        gender: dogGender,
        location: dogLocation,
        description: dogDescription,
      }),
    );

    formData.append(
      "listerDetails",
      JSON.stringify({
        name: listerName,
        email: listerEmail,
        contactNumber: listerPhone,
      }),
    );

    dogPhotos.forEach((file) => formData.append("media", file));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://straycareplatform.onrender.com/api/adoption", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setShowListDogModal(false);
        resetForm();
        fetchAdoptionData(); // Refresh list and counts
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to list dog. Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. ADOPTION ACTIONS ---
  const handleRequestAdoption = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://straycareplatform.onrender.com/api/adoption/${requestedDogId}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requesterName,
            requesterEmail,
            requesterContact,
          }),
        },
      );

      if (response.ok) {
        setShowRequestConfirmation(false);
        setRequestedDogId(null);
        setRequesterName("");
        setRequesterEmail("");
        setRequesterContact("");
        alert(
          "Adoption request submitted successfully! The lister will contact you soon.",
        );
        fetchAdoptionData();
        setShowDetailModal(false);
      } else {
        const data = await response.json();
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdoption = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://straycareplatform.onrender.com/api/adoption/${id}/confirm`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setConfirmedDog(selectedDog);
        setShowConfirmationEmail(true);
        setShowDetailModal(false);
        fetchAdoptionData();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to confirm adoption.");
    }
  };

  const handleCancelRequest = async (id) => {
    if (
      !window.confirm("Are you sure you want to cancel this adoption request?")
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://straycareplatform.onrender.com/api/adoption/${id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        alert("Request cancelled successfully.");
        setShowDetailModal(false);
        fetchAdoptionData();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel request.");
    }
  };

  const resetForm = () => {
    setDogPhotos([]);
    setPhotoPreviews([]);
    setDogName("");
    setDogBreed("");
    setDogAge("");
    setDogGender("Male");
    setDogLocation("");
    setDogDescription("");
    setListerName("");
    setListerEmail("");
    setListerPhone("");
    setErrorMsg("");
  };

  // --- FILTERS ---
  const breeds = useMemo(
    () => [
      "All",
      ...Array.from(new Set(dogs.map((d) => d.dogDetails.breed))).sort(),
    ],
    [dogs],
  );
  const locations = useMemo(
    () => [
      "All",
      ...Array.from(new Set(dogs.map((d) => d.dogDetails.location))).sort(),
    ],
    [dogs],
  );
  const ageRanges = ["All", "0-1 years", "2-3 years", "4-5 years", "6+ years"];
  const statusOptions = ["All", "Available", "Pending", "Adopted"]; // Changed Requested to Pending to match Backend

  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      const details = dog.dogDetails;
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch =
        (details.name && details.name.toLowerCase().includes(searchStr)) ||
        details.breed.toLowerCase().includes(searchStr);

      const matchesBreed =
        selectedBreed === "All" || details.breed === selectedBreed;
      const matchesLocation =
        selectedLocation === "All" || details.location === selectedLocation;
      const matchesStatus =
        selectedStatus === "All" || dog.status === selectedStatus;

      let matchesAge = true;
      if (selectedAge !== "All") {
        const age = details.age;
        if (selectedAge === "0-1 years") matchesAge = age <= 1;
        else if (selectedAge === "2-3 years") matchesAge = age >= 2 && age <= 3;
        else if (selectedAge === "4-5 years") matchesAge = age >= 4 && age <= 5;
        else if (selectedAge === "6+ years") matchesAge = age >= 6;
      }

      return (
        matchesSearch &&
        matchesBreed &&
        matchesAge &&
        matchesLocation &&
        matchesStatus
      );
    });
  }, [
    dogs,
    searchQuery,
    selectedBreed,
    selectedAge,
    selectedLocation,
    selectedStatus,
  ]);

  // Helper to format images from backend
 const getImageUrl = (dog) => {
  if (dog.media && dog.media.length > 0) {
    const url = dog.media[0].url;
    return url.startsWith("http") ? url : `https://straycareplatform.onrender.com/${url}`;
  }
  return "https://images.unsplash.com/photo-1724367269355-3fcfa12e99c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMGJyZWVkJTIwZG9nfGVufDF8fHx8MTc2OTUxNjY2OXww&ixlib=rb-4.1.0&q=80&w=1080";
};

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "Pending":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "Adopted":
        return "bg-gray-500 hover:bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Available":
        return <Heart className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Adopted":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center max-w-4xl mx-auto">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-500 rounded-full mb-6">
            <Heart className="h-10 w-10 text-white fill-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-800 font-bold">
            Adoption Platform
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-6">
            Find your perfect companion and give a rescued dog a forever home
          </p>

          {/* Statistics Cards (LIVE DATA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Dogs</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {counts.totalDogs}
                  </p>
                </div>
                <PawPrint className="h-10 w-10 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Available</p>
                  <p className="text-3xl font-bold text-green-600">
                    {counts.availableDogs}
                  </p>
                </div>
                <Heart className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {counts.pendingRequests}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-orange-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Adopted</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {counts.successfullyAdopted}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-pink-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setErrorMsg("");
                setShowListDogModal(true);
              }}
              className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg transition-colors border-none cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span className="font-bold">List a Dog for Adoption</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-xl text-gray-800 font-bold">Search & Filter</h2>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              >
                {breeds.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Age
              </label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              >
                {ageRanges.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-center text-gray-600">
            Showing{" "}
            <span className="font-bold text-pink-500">
              {filteredDogs.length}
            </span>{" "}
            of <span className="font-bold">{dogs.length}</span> dogs
          </div>
        </div>

        {/* Dog Listings */}
        {filteredDogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No dogs found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDogs.map((dog) => (
              <div
                key={dog._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow transform hover:-translate-y-1 duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(dog)}
                    alt={dog.dogDetails.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${getStatusStyle(dog.status)}`}
                    >
                      {getStatusIcon(dog.status)}
                      <span>{dog.status}</span>
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl mb-3 text-gray-800 font-bold">
                    {dog.dogDetails.name || "Unknown"}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Bone className="h-4 w-4 mr-2 text-pink-500" />
                      <span className="text-sm font-semibold">
                        {dog.dogDetails.breed}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                      <span className="text-sm font-semibold">
                        {dog.dogDetails.age}{" "}
                        {dog.dogDetails.age === 1 ? "year" : "years"} old
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                      <span className="text-sm font-semibold">
                        {dog.dogDetails.location}
                      </span>
                    </div>
                  </div>

                  <div className="inline-block mb-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${dog.dogDetails.gender === "Male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}
                    >
                      {dog.dogDetails.gender}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-2">
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setSelectedDog(dog);
                      setShowDetailModal(true);
                    }}
                    className="w-full py-3 rounded-xl font-bold transition-colors bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center space-x-2 border-none cursor-pointer"
                  >
                    <Info className="h-4 w-4" />
                    <span>View Details</span>
                  </button>

                  {/* Only show the button if the dog is Available AND the current user is NOT the lister */}
                  {dog.status === "Available" &&
                    dog.listerId !== currentUser.id &&
                    dog.listerId !== currentUser._id && (
                      <button
                        onClick={() => {
                          setErrorMsg("");
                          setRequestedDogId(dog._id);
                          setShowRequestConfirmation(true);
                        }}
                        className="w-full py-3 rounded-xl font-bold transition-colors bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center border-none cursor-pointer"
                      >
                        Request to Adopt
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Information Banner */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="bg-pink-100 rounded-full p-3">
              <Heart className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h3 className="text-xl mb-2 text-gray-800 font-bold">
                How Adoption Works
              </h3>
              <p className="text-gray-600 mb-4">
                When you click "Request to Adopt", an email will instantly be
                sent to the . The lister controls the dog's status and
                will manually mark them as "Adopted" once you both agree!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List Dog Modal */}
      {showListDogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-3xl p-6 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Plus className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">Register  a Dog for Adoption</h2>
              </div>
              <button
                onClick={() => {
                  setShowListDogModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors border-none cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitListing} className="p-8">
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" /> {errorMsg}
                </div>
              )}

              {/* Photos */}
              <div className="mb-8">
                <h3 className="text-lg text-gray-800 font-bold mb-4 flex items-center">
                  <Camera className="h-5 w-5 text-purple-500 mr-2" /> Dog Photos{" "}
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    (Max 3)
                  </span>
                </h3>
                {photoPreviews.length === 0 ? (
                  <label className="block cursor-pointer">
                    <div className="border-3 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:bg-purple-50 transition-colors">
                      <Upload className="h-10 w-10 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-700 font-bold">
                        Click to upload photos
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      {photoPreviews.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            className="w-full h-32 object-cover rounded-xl shadow-md"
                            alt="preview"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {photoPreviews.length < 3 && (
                      <label className="inline-flex items-center space-x-2 text-purple-500 font-bold cursor-pointer">
                        <Plus className="h-4 w-4" />
                        <span>Add More</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Dog Details */}
              <div className="border-t border-gray-100 pt-8 mb-8">
                <h3 className="text-lg text-gray-800 font-bold mb-6 flex items-center">
                  <PawPrint className="h-5 w-5 text-pink-500 mr-2" /> Dog
                  Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Dog Name
                    </label>
                    <input
                      type="text"
                      value={dogName}
                      onChange={(e) => setDogName(e.target.value)}
                      placeholder="e.g., Buddy"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Breed *
                    </label>
                    <select
                      value={dogBreed}
                      onChange={(e) => setDogBreed(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">Select Breed</option>
                      {commonBreeds.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Age (Years) *
                    </label>
                    <input
                      type="number"
                      value={dogAge}
                      onChange={(e) => setDogAge(e.target.value)}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="flex items-center space-x-6 pt-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="Male"
                          checked={dogGender === "Male"}
                          onChange={(e) => setDogGender(e.target.value)}
                          className="form-radio h-5 w-5 text-purple-500"
                        />
                        <span className="ml-2 font-semibold">Male</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="Female"
                          checked={dogGender === "Female"}
                          onChange={(e) => setDogGender(e.target.value)}
                          className="form-radio h-5 w-5 text-pink-500"
                        />
                        <span className="ml-2 font-semibold">Female</span>
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      value={dogLocation}
                      onChange={(e) => setDogLocation(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">Select City</option>
                      {sriLankanCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={dogDescription}
                      onChange={(e) => setDogDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Lister Details */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg text-gray-800 font-bold mb-6 flex items-center">
                  <User className="h-5 w-5 text-blue-500 mr-2" /> Your Contact
                  Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={listerName}
                      onChange={(e) => setListerName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={listerEmail}
                      onChange={(e) => setListerEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={listerPhone}
                      onChange={(e) => setListerPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowListDogModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl border-none cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dog Detail Modal (With Lister Controls) */}
      {showDetailModal && selectedDog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex justify-between z-10">
              <h2 className="text-2xl font-bold flex items-center">
                <Info className="h-6 w-6 mr-2" />{" "}
                {selectedDog.dogDetails.name || "Unknown"}'s Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 border-none cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8">
              <img
                src={getImageUrl(selectedDog)}
                className="w-full h-80 object-cover rounded-2xl shadow-md mb-8"
                alt="dog"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-purple-50 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <PawPrint className="h-5 w-5 text-purple-500 mr-2" /> Basic
                    Info
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-500">Name:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.dogDetails.name || "Unknown"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Breed:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.dogDetails.breed}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Age:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.dogDetails.age} years
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Gender:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.dogDetails.gender}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Location:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.dogDetails.location}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 text-blue-500 mr-2" /> Lister
                    Contact
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-500">Name:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.listerDetails.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span>{" "}
                      <span className="font-bold ml-2 break-all">
                        {selectedDog.listerDetails.email}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="font-bold ml-2">
                        {selectedDog.listerDetails.contactNumber}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedDog.dogDetails.description && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                    {selectedDog.dogDetails.description}
                  </p>
                </div>
              )}

              {/* LISTER CONTROLS: Show if status is Pending */}
              {/* LISTER CONTROLS: Show ONLY if status is Pending AND the logged-in user is the Lister! */}
              {selectedDog.status === "Pending" &&
                selectedDog.currentRequest &&
                (selectedDog.listerId === currentUser.id ||
                  selectedDog.listerId === currentUser._id) && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200 mb-8">
                    <h3 className="font-bold text-orange-800 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" /> Adoption Request
                      Details
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Someone wants to adopt this dog! If you listed this dog,
                      you can accept or deny the request here.
                    </p>
                    <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedDog.currentRequest.requesterName}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedDog.currentRequest.requesterEmail}
                      </p>
                      <p>
                        <strong>Contact:</strong>{" "}
                        {selectedDog.currentRequest.requesterContact}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirmAdoption(selectedDog._id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold border-none cursor-pointer flex justify-center items-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> Confirm
                        Adoption
                      </button>
                      <button
                        onClick={() => handleCancelRequest(selectedDog._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold border-none cursor-pointer flex justify-center items-center"
                      >
                        <X className="w-5 h-5 mr-2" /> Deny Request
                      </button>
                    </div>
                  </div>
                )}

              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl border-none cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Form Modal (For Adopters) */}
      {showRequestConfirmation && requestedDogId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
            <h2 className="text-2xl font-bold mb-2">Request to Adopt</h2>
            <p className="text-gray-500 mb-6">
              Enter your details so the lister can contact you.
            </p>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleRequestAdoption} className="space-y-4">
              <input
                type="text"
                placeholder="Your Full Name"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Your Phone Number"
                value={requesterContact}
                onChange={(e) => setRequesterContact(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                required
              />

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestConfirmation(false);
                    setErrorMsg("");
                  }}
                  className="flex-1 py-3 bg-gray-100 font-bold rounded-xl border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-pink-500 text-white font-bold rounded-xl border-none cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Success Email Modal */}
      {showConfirmationEmail && confirmedDog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Adoption Confirmed!
            </h2>
            <p className="text-gray-600 mb-8">
              We just sent confirmation emails to both you and the adopter.
              Thank you for using Stay Care to give{" "}
              {confirmedDog.dogDetails.name} a forever home!
            </p>
            <button
              onClick={() => setShowConfirmationEmail(false)}
              className="w-full py-4 bg-green-500 text-white font-bold rounded-xl border-none cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
