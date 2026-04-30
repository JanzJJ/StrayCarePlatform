/**
 * INFORMATION HUB ROUTES
 
 * Endpoints for discovering resources and services related to dog care
 
 * Features:
 * - Find registered welfare organizations in StrayCare system
 * - Find veterinary clinics via Google Maps API
 * - Find pet shops via Google Maps API
 * - Location-based search

 * Use Cases:
 * - Users can contact welfare organizations for help
 * - Find nearest vets for emergency situations
 * - Find pet supplies and care services
 * - Build a community directory of dog care resources

 * Data Sources:
 * 1. StrayCare Database: Registered welfare organizations
 * 2. Google Maps API: Vets and pet shops in specified cities
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// PUBLIC ROUTES (No Authentication Required) 
/**
 * GET /api/hub/organizations
 * Retrieve all registered welfare organizations
 * Returns: Array of organization profiles
 * Data Includes:
 * - organizationName: Name of organization
 * - location: Organization's location
 * - servicesOffered: What services they provide
 * - contactDetails: How to contact them
 * - email: Organization's email address
 * NOTE: Password is explicitly excluded from response
 * 
 * Used for: Organization directory, help resources
 */
router.get("/organizations", async (req, res) => {
  try {
    // Find all users with 'organization' role
    // .select('-password') ensures we don't accidentally expose passwords
    const orgs = await User.find({ role: "organization" }).select("-password");
    res.status(200).json(orgs);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Server error fetching organizations" });
  }
});

/**
 * GET /api/hub/services
 * Search for veterinary clinics or pet shops using Google Maps
 * Query Parameters (required):
 * - type: "vet" (veterinary clinic) or "shop" (pet shop)
 * - city: City name (e.g., "Colombo", "Galle")

 * How It Works:
 * 1. Constructs search query: "veterinary clinic in Colombo, Sri Lanka"
 * 2. Calls Google Places Text Search API
 * 3. Returns results with locations, ratings, contact info
 * 
 * Returns: Array of place results from Google Maps
 * Each result includes:
 * - name: Business name
 * - formatted_address: Full address
 * - rating: Google rating
 * - phone_number: Contact phone
 * - opening_hours: Business hours
 * - geometry: Latitude/longitude coordinates
 * 
 * Environment Variable Required:
 * - GOOGLE_MAPS_API_KEY: Google Cloud API key with Places API enabled
 * 
 * Example Queries:
 * - /api/hub/services?type=vet&city=Colombo
 * - /api/hub/services?type=shop&city=Galle
 * 
 * Used for: Finding nearby vets and pet shops
 */
router.get("/services", async (req, res) => {
  try {
    // Extract search parameters from query string
    const { type, city } = req.query;

    // Construct search query for Google Maps API
    // Format: "veterinary clinic in Colombo, Sri Lanka"
    // or "pet shop in Colombo, Sri Lanka"
    const searchQuery = `${type === "vet" ? "veterinary clinic" : "pet shop"} in ${city}, Sri Lanka`;
    
    // Get Google Maps API key from environment
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Call Google Places Text Search API
    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`,
    );
    
    // Parse JSON response from Google
    const data = await googleResponse.json();

    // Check for API errors (but ZERO_RESULTS is acceptable)
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google API Error: ${data.status}`);
    }

    // Return search results to client
    res.status(200).json(data.results);
  } catch (error) {
    console.error("Error fetching from Google Maps:", error);
    res
      .status(500)
      .json({ message: "Error fetching services from Google Maps" });
  }
});

module.exports = router;
