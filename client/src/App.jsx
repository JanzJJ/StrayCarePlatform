// Core React and routing imports
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Page and component imports
import WelcomeLandingPage from "./components/WelcomeLandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Navigation from "./components/Navigation";
import ReportingPage from "./components/ReportingPage";
import AdoptionPage from "./components/AdoptionPage";
import InformationCentre from "./components/InformationCentre";
import { DiseaseDetectionPage } from "./components/DiseasePrediction";
import { AdminDashboard } from "./components/AdminDashboard"; // <-- IMPORTANT: Import the new Admin Dashboard

export default function App() {
  // Initialize user state from localStorage (persist login across sessions)
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  

  // Handle successful login by updating user state
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Clear user data and logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Check if user has admin role (case-insensitive) from different possible locations in user object
  const isAdmin =
    user &&
    ((user.role && user.role.toLowerCase() === "admin") ||
      (user.user &&
        user.user.role &&
        user.user.role.toLowerCase() === "admin"));

  // Extract user role safely for passing to Navigation component
  const currentRole = (user?.role || user?.user?.role)?.toLowerCase() || "user";

  return (
    <BrowserRouter>
      {/* Navigation bar - passes authentication and role info */}
      <Navigation
        isAuthenticated={!!user}
        userEmail={user?.email || user?.user?.email}
        accountType={currentRole}
        onLogout={handleLogout}
      />

      {/* Main routes */}
      <Routes>
        {/* Home - redirects based on auth status and role */}
        <Route
          path="/"
          element={
            user ? (
              // If they are an admin, redirect home clicks to /admin, else /dashboard
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <WelcomeLandingPage
                onGetStarted={() => (window.location.href = "/auth")}
              />
            )
          }
        />

        {/* Authentication page */}
        <Route
          path="/auth"
          element={
            user ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <AuthPage onLogin={handleLoginSuccess} />
            )
          }
        />

        {/* Admin dashboard - admin only */}
        <Route
          path="/admin"
          element={
            user ? (
              isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        {/* User dashboard - protected route */}
        <Route
          path="/dashboard"
          element={
            user ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Dashboard />
              )
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        {/* Report submission page - protected route */}
        <Route
          path="/report"
          element={user ? <ReportingPage /> : <Navigate to="/auth" />}
        />

        {/* Pet adoption listing page - protected route */}
        <Route
          path="/adoption"
          element={user ? <AdoptionPage /> : <Navigate to="/auth" />}
        />

        {/* Information and resources center - protected route */}
        <Route
          path="/information"
          element={user ? <InformationCentre /> : <Navigate to="/auth" />}
        />

        {/* Disease detection/prediction page - protected route */}
        <Route
          path="/disease-detection"
          element={user ? <DiseaseDetectionPage /> : <Navigate to="/auth" />}
        />

        {/* Catch-all route - redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
