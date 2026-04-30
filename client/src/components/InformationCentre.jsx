import { useState, useEffect } from "react";
import {
  BookOpen,
  Syringe,
  Heart,
  Apple,
  MapPin,
  Phone,
  Mail,
  Clock,
  Search,
  Building2,
  Stethoscope,
  Users,
  AlertCircle,
  Calendar,
  Info,
  Shield,
  Filter,
} from "lucide-react";

export default function InformationCentre() {
  const [activeTab, setActiveTab] = useState("health");

  // States for fetching live data
  const [welfareOrgs, setWelfareOrgs] = useState([]);
  const [services, setServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [isOrgsLoading, setIsOrgsLoading] = useState(true);

  // Filters
  const [selectedPlaceType, setSelectedPlaceType] = useState("petshop");
  const [selectedCity, setSelectedCity] = useState("Colombo");
  const [welfareSearchQuery, setWelfareSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("General/Stray Dogs");

  const sriLankanCities = [
    "Colombo",
    "Kandy",
    "Galle",
    "Negombo",
    "Matara",
    "Jaffna",
    "Trincomalee",
    "Anuradhapura",
    "Nuwara Eliya",
  ];

  // --- 1. Fetch Welfare Orgs from MongoDB on load ---
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/hub/organizations",
        );
        if (response.ok) {
          const data = await response.json();
          setWelfareOrgs(data);
        }
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      } finally {
        setIsOrgsLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  // --- 2. Fetch Google Maps Services when City or Type changes ---
  useEffect(() => {
    if (activeTab !== "services") return; // Only fetch if they are looking at the services tab

    const fetchServices = async () => {
      setIsServicesLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/hub/services?type=${selectedPlaceType}&city=${selectedCity}`,
        );
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch Google Maps services", error);
      } finally {
        setIsServicesLoading(false);
      }
    };

    fetchServices();
  }, [selectedPlaceType, selectedCity, activeTab]);

  // Filter Welfare Orgs by Search Query
  const filteredWelfare = welfareOrgs.filter((org) => {
    const searchLower = welfareSearchQuery.toLowerCase();
    return (
      (org.organizationName &&
        org.organizationName.toLowerCase().includes(searchLower)) ||
      (org.location && org.location.toLowerCase().includes(searchLower)) ||
      (org.servicesOffered &&
        org.servicesOffered.toLowerCase().includes(searchLower))
    );
  });

  // --- Breed Static Info ---
  const breedOptions = [
    "General/Stray Dogs",
    "Golden Retriever",
    "Labrador",
    "German Shepherd",
  ];
  const breedHealthInfo = {
    "General/Stray Dogs": {
      vaccination: {
        puppy: [
          "DHPP at 6-8 weeks",
          "DHPP 2nd dose at 10-12 weeks",
          "DHPP 3rd dose + Rabies at 14-16 weeks",
        ],
        adult: [
          "Annual DHPP booster",
          "Rabies booster every 3 years",
          "Leptospirosis annually",
        ],
        specific: [
          "Anti-rabies is critical for stray dogs",
          "Deworming every 3 months",
          "Flea & tick prevention monthly",
        ],
      },
      nutrition: {
        puppyFood: "High-protein puppy formula, 3-4 small meals daily",
        adultFood: "Balanced adult dog food, 1-2 meals daily based on size",
        specialDiet: [
          "Rice and chicken for sensitive stomachs",
          "Coconut oil for skin health",
          "Avoid spicy or salty foods",
        ],
        portionGuide:
          "Feed 2-3% of body weight daily, adjust based on activity level",
      },
      healthCare: {
        commonIssues: [
          "Skin infections and mange",
          "Tick-borne diseases",
          "Malnutrition",
          "Dental problems",
          "Parasites",
        ],
        exercise: "Moderate - 30-60 minutes daily walks and play",
        grooming: "Weekly brushing, monthly baths, regular nail trimming",
        lifespan: "10-15 years with proper care",
      },
      importantInfo: {
        temperament:
          "Varies widely - often loyal, adaptable, and resilient once they trust you",
        size: "Varies - Small to Large (10-30 kg typically)",
        idealFor: "Anyone willing to provide love, care, and patience",
        specialNeeds: [
          "May need rehabilitation from trauma",
          "Socialization and trust-building",
          "Regular parasite control",
        ],
      },
    },
    "Golden Retriever": {
      vaccination: {
        puppy: [
          "DHPP at 6-8 weeks",
          "DHPP 2nd dose + Leptospirosis at 10-12 weeks",
          "DHPP 3rd dose + Rabies at 14-16 weeks",
        ],
        adult: [
          "Annual DHPP & Leptospirosis booster",
          "Rabies booster every 3 years",
        ],
        specific: [
          "Heart health monitoring recommended",
          "Cancer screening as they age",
          "Hip dysplasia screening",
        ],
      },
      nutrition: {
        puppyFood:
          "Large breed puppy formula (controlled calcium/phosphorus), 3-4 meals daily",
        adultFood: "Premium large breed adult food, 2 meals daily",
        specialDiet: ["Omega-3 for coat health", "Glucosamine for joints"],
        portionGuide:
          "3-4 cups daily for adults (55-75 lbs), adjust for activity",
      },
      healthCare: {
        commonIssues: [
          "Hip and elbow dysplasia",
          "Heart disease",
          "Cancer",
          "Eye problems (cataracts)",
          "Skin allergies",
        ],
        exercise: "High - 1-2 hours daily including swimming and fetch",
        grooming:
          "High - Daily brushing required, professional grooming every 6-8 weeks",
        lifespan: "10-12 years",
      },
      importantInfo: {
        temperament:
          "Friendly, intelligent, devoted, eager to please, gentle with children",
        size: "Large - 55-75 lbs (25-34 kg)",
        idealFor:
          "Active families with children, homes with yard space, patient owners",
        specialNeeds: [
          "Needs mental stimulation",
          "Regular swimming is beneficial",
          "Prone to separation anxiety",
        ],
      },
    },
    Labrador: {
      vaccination: {
        puppy: [
          "DHPP at 6-8 weeks",
          "DHPP 2nd dose + Leptospirosis at 10-12 weeks",
          "DHPP 3rd dose + Rabies at 14-16 weeks",
        ],
        adult: [
          "Annual DHPP & Leptospirosis booster",
          "Rabies booster every 3 years",
          "Optional: Bordetella for social dogs",
        ],
        specific: [
          "Obesity monitoring important",
          "Hip screening recommended",
          "Regular ear infection prevention",
        ],
      },
      nutrition: {
        puppyFood:
          "Large breed puppy formula, 3-4 meals daily (high risk of obesity)",
        adultFood: "Measured portions of large breed adult food, 2 meals daily",
        specialDiet: [
          "Weight management formula if needed",
          "Joint support supplements",
          "Avoid free-feeding - very food motivated",
        ],
        portionGuide:
          "3-4.5 cups daily for adults (55-80 lbs), strictly measure portions",
      },
      healthCare: {
        commonIssues: [
          "Hip and elbow dysplasia",
          "Obesity (major concern)",
          "Ear infections",
          "Eye problems",
          "Exercise-induced collapse",
        ],
        exercise:
          "Very High - 1-2 hours of vigorous exercise daily, loves water",
        grooming:
          "Moderate - Weekly brushing, sheds heavily twice yearly, regular ear cleaning",
        lifespan: "10-12 years",
      },
      importantInfo: {
        temperament:
          "Outgoing, even-tempered, gentle, agile, intelligent, friendly",
        size: "Large - 55-80 lbs (25-36 kg)",
        idealFor:
          "Very active families, hunters, outdoor enthusiasts, experienced dog owners",
        specialNeeds: [
          "Strict portion control",
          "High exercise requirements",
          "Mental stimulation essential",
          "Swimming opportunities beneficial",
        ],
      },
    },
    "German Shepherd": {
      vaccination: {
        puppy: [
          "DHPP at 6-8 weeks",
          "DHPP 2nd dose + Leptospirosis at 10-12 weeks",
          "DHPP 3rd dose + Rabies at 14-16 weeks",
        ],
        adult: [
          "Annual DHPP & Leptospirosis booster",
          "Rabies booster every 3 years",
          "May need additional vaccines for working dogs",
        ],
        specific: [
          "Hip dysplasia screening critical",
          "Bloat prevention measures",
          "Regular health monitoring",
        ],
      },
      nutrition: {
        puppyFood:
          "Large breed puppy formula with controlled growth rate, 3-4 meals daily",
        adultFood:
          "High-quality large breed food, 2 meals daily (bloat prevention)",
        specialDiet: [
          "Glucosamine and chondroitin for joints",
          "Sensitive stomach formula if needed",
          "Avoid single large meals",
        ],
        portionGuide:
          "3-4 cups daily for adults (50-90 lbs), split into 2 meals",
      },
      healthCare: {
        commonIssues: [
          "Hip and elbow dysplasia",
          "Degenerative myelopathy",
          "Bloat (gastric torsion)",
          "Skin allergies",
          "Pancreatic insufficiency",
        ],
        exercise:
          "Very High - 1-2 hours daily plus mental challenges, working activities ideal",
        grooming:
          "High - Brush 3-4 times weekly, sheds year-round, especially spring/fall",
        lifespan: "9-13 years",
      },
      importantInfo: {
        temperament:
          "Confident, courageous, intelligent, loyal, watchful, protective",
        size: "Large - 50-90 lbs (23-41 kg)",
        idealFor:
          "Active owners, those needing protection/working dogs, experienced handlers",
        specialNeeds: [
          "Extensive socialization needed",
          "Consistent training required",
          "Mental stimulation critical",
          "May have protective instincts",
        ],
      },
    },
  };

  const currentBreedInfo = breedHealthInfo[selectedBreed];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-6 shadow-lg">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-800 font-bold">
            Information Centre
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Your complete guide to dog health, live Google Maps services, and
            registered welfare organizations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="bg-white rounded-full p-2 shadow-lg inline-flex">
            <button
              onClick={() => setActiveTab("health")}
              className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === "health" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-none cursor-pointer" : "text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer"}`}
            >
              Dog Health & Care
            </button>
            <button
              onClick={() => setActiveTab("adoption")}
              className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === "adoption" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-none cursor-pointer" : "text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer"}`}
            >
              Adoption Guide
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === "services" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-none cursor-pointer" : "text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer"}`}
            >
              Find Services (Live)
            </button>
            <button
              onClick={() => setActiveTab("welfare")}
              className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === "welfare" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-none cursor-pointer" : "text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer"}`}
            >
              Welfare Organizations
            </button>
          </div>
        </div>

        {/* Tab 1: Dog Health & Care (Static Breed Content) */}
        {activeTab === "health" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">
                  Select Breed Details
                </h3>
              </div>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="px-4 py-2 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
              >
                {breedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Content Grids (Kept your exact design) */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-3 mr-4">
                  <Syringe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Vaccination Schedule
                  </h2>
                  <p className="text-gray-600">
                    Essential vaccinations for {selectedBreed}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-red-500" />
                    Puppy
                  </h3>
                  <div className="space-y-3">
                    {currentBreedInfo.vaccination.puppy.map((i, idx) => (
                      <p key={idx} className="text-sm font-medium">
                        ✓ {i}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    Adult
                  </h3>
                  <div className="space-y-3">
                    {currentBreedInfo.vaccination.adult.map((i, idx) => (
                      <p key={idx} className="text-sm font-medium">
                        ✓ {i}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-500" />
                    Specifics
                  </h3>
                  <div className="space-y-3">
                    {currentBreedInfo.vaccination.specific.map((i, idx) => (
                      <p key={idx} className="text-sm font-medium">
                        ! {i}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 mr-4">
                  <Apple className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Nutritional Info
                  </h2>
                  <p className="text-gray-600">Feeding guidelines</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-green-500" /> Guidelines
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-green-200">
                      <p className="font-bold">Puppy Stage</p>
                      <p className="text-sm">
                        {currentBreedInfo.nutrition.puppyFood}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-green-200">
                      <p className="font-bold">Adult Stage</p>
                      <p className="text-sm">
                        {currentBreedInfo.nutrition.adultFood}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-green-200">
                      <p className="font-bold">Portion Guide</p>
                      <p className="text-sm">
                        {currentBreedInfo.nutrition.portionGuide}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Apple className="h-5 w-5 mr-2 text-orange-500" /> Special
                    Needs
                  </h3>
                  <div className="space-y-3">
                    {currentBreedInfo.nutrition.specialDiet.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded-xl border border-amber-200 flex"
                        >
                          <span className="text-amber-500 mr-2 font-bold">
                            •
                          </span>
                          <p className="text-sm font-medium">{item}</p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 mr-4">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Health Care
                  </h2>
                  <p className="text-gray-600">Important health data</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> Common
                    Concerns
                  </h3>
                  <ul className="space-y-2">
                    {currentBreedInfo.healthCare.commonIssues.map(
                      (issue, idx) => (
                        <li
                          key={idx}
                          className="text-sm font-medium text-gray-700"
                        >
                          <span className="text-red-500 mr-2">•</span>
                          {issue}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-blue-500" />{" "}
                    Requirements
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Exercise:
                      </p>
                      <p className="text-sm">
                        {currentBreedInfo.healthCare.exercise}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Grooming:
                      </p>
                      <p className="text-sm">
                        {currentBreedInfo.healthCare.grooming}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Lifespan:
                      </p>
                      <p className="text-sm">
                        {currentBreedInfo.healthCare.lifespan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Find Services (LIVE GOOGLE MAPS FETCH) */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Search className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">
                  Search Live Services via Google Maps
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedPlaceType}
                  onChange={(e) => setSelectedPlaceType(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 font-bold"
                >
                  <option value="petshop">Pet Shops</option>
                  <option value="vet">Veterinary Clinics</option>
                </select>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 font-bold"
                >
                  {sriLankanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-gray-500 text-sm mt-3 flex items-center">
                <Info className="w-4 h-4 mr-1" /> Automatically fetches the top
                results directly from Google Places.
              </p>
            </div>

            {isServicesLoading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-pulse">
                <Search className="h-16 w-16 text-orange-300 mx-auto mb-4 animate-bounce" />
                <p className="text-gray-500 text-xl font-bold">
                  Scanning Google Maps...
                </p>
              </div>
            ) : services.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No services found matching your criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((place, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <div
                      className={`bg-gradient-to-r ${selectedPlaceType === "petshop" ? "from-orange-500 to-amber-500" : "from-blue-500 to-cyan-500"} p-4 text-white flex items-center`}
                    >
                      {selectedPlaceType === "petshop" ? (
                        <Building2 className="h-6 w-6 mr-2" />
                      ) : (
                        <Stethoscope className="h-6 w-6 mr-2" />
                      )}
                      <span className="font-bold">
                        {selectedPlaceType === "petshop"
                          ? "Pet Shop"
                          : "Vet Clinic"}
                      </span>
                      {place.rating && (
                        <span className="ml-auto bg-white/20 px-2 py-1 rounded-lg text-sm font-bold text-white shadow-sm">
                          ⭐ {place.rating}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {place.name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start text-gray-600">
                          <MapPin className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                          <p className="text-sm font-medium">
                            {place.formatted_address}
                          </p>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                          <p className="text-sm font-medium">
                            Based on {place.user_ratings_total || 0} Google
                            Reviews
                          </p>
                        </div>
                        {place.opening_hours && (
                          <div className="flex items-center text-green-600 bg-green-50 p-2 rounded-lg mt-4">
                            <Clock className="h-4 w-4 mr-2" />
                            <p className="text-sm font-bold">
                              {place.opening_hours.open_now
                                ? "Currently Open"
                                : "Currently Closed"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Animal Welfare Organizations (LIVE DB FETCH) */}
        {activeTab === "welfare" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-rose-500 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">
                  Registered Welfare Organizations
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by organization name, city, or services..."
                  value={welfareSearchQuery}
                  onChange={(e) => setWelfareSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500"
                />
              </div>
              <p className="text-gray-500 text-sm mt-3 flex items-center">
                <Info className="w-4 h-4 mr-1" /> These organizations are
                officially registered and verified on the StrayCare platform.
              </p>
            </div>

            {isOrgsLoading ? (
              <div className="text-center p-12">
                <p className="text-gray-500 font-bold">
                  Loading Organizations...
                </p>
              </div>
            ) : filteredWelfare.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-bold">
                  No registered organizations found matching your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredWelfare.map((org) => (
                  <div
                    key={org._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-5 text-white flex items-center">
                      <div className="bg-white/20 rounded-full p-3 mr-4">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {org.organizationName}
                        </h3>
                        <p className="text-sm font-medium opacity-90">
                          Official Registered Partner
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4 mb-5">
                        <div className="flex items-start text-gray-600">
                          <MapPin className="h-5 w-5 mr-3 text-rose-500" />
                          <p className="text-sm font-semibold pt-0.5">
                            {org.location}
                          </p>
                        </div>
                        <div className="flex items-start text-gray-600">
                          <Phone className="h-5 w-5 mr-3 text-rose-500" />
                          <p className="text-sm font-semibold pt-0.5 break-all">
                            {org.contactDetails}
                          </p>
                        </div>
                        <div className="flex items-start text-gray-600">
                          <Mail className="h-5 w-5 mr-3 text-rose-500" />
                          <p className="text-sm font-semibold pt-0.5 break-all">
                            {org.email}
                          </p>
                        </div>
                      </div>
                      {org.servicesOffered && (
                        <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-rose-600" />{" "}
                            Services Offered
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {org.servicesOffered
                              .split(",")
                              .map((service, index) => (
                                <span
                                  key={index}
                                  className="bg-rose-200 text-rose-800 px-3 py-1 rounded-lg text-xs font-bold shadow-sm"
                                >
                                  {service.trim()}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Adoption Guide (Static Guide) */}
        {activeTab === "adoption" && (
          <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-full p-3 mr-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    First-Time Adoption Guide
                  </h2>
                </div>
              </div>
              <div className="bg-pink-50 border-l-4 border-pink-500 p-6 rounded-xl">
                <p className="text-gray-700 font-medium">
                  Adopting a rescue dog is a rewarding experience. This guide
                  will help you understand how to safely approach, handle, and
                  care for your new furry friend.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                  <Shield className="mr-2" /> First Meeting Tips
                </h3>
                <ul className="space-y-3 font-medium text-gray-600">
                  <li>
                    ✓ Approach slowly and calmly without sudden movements.
                  </li>
                  <li>✓ Let the dog come to you; don't force interaction.</li>
                  <li>✓ Kneel or crouch down to appear less intimidating.</li>
                  <li>✓ Speak in a soft, gentle tone.</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                  <AlertCircle className="mr-2" /> What to Avoid
                </h3>
                <ul className="space-y-3 font-medium text-gray-600">
                  <li>✗ Don't stare directly into their eyes.</li>
                  <li>✗ Don't reach over their head; pet from the side.</li>
                  <li>✗ Don't hug or restrain them immediately.</li>
                  <li>✗ Don't wake a sleeping dog suddenly.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
