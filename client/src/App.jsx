import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import all your pages and components
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
  const [user, setUser] = useState(() => {
    const loggedInUser = localStorage.getItem("user");
    return loggedInUser ? JSON.parse(loggedInUser) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // FIX: Safely check for "admin" regardless of if it's stored as "Admin" or "admin"
  const isAdmin =
    user &&
    ((user.role && user.role.toLowerCase() === "admin") ||
      (user.user &&
        user.user.role &&
        user.user.role.toLowerCase() === "admin"));

  // Safely grab the role to pass to Navigation
  const currentRole = (user?.role || user?.user?.role)?.toLowerCase() || "user";

  return (
    <BrowserRouter>
      {/* Navigation Bar */}
      <Navigation
        isAuthenticated={!!user}
        userEmail={user?.email || user?.user?.email}
        accountType={currentRole} // Passed safely in lowercase
        onLogout={handleLogout}
      />

      <Routes>
        {/* Welcome Page */}
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

        {/* Auth Page */}
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

        {/* Admin Dashboard: Protected! Only Admins allowed */}
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

        {/* Regular Dashboard Page: Protected! */}
        <Route
          path="/dashboard"
          element={
            user ? (
              // If an admin tries to go to the regular dashboard, kick them to the admin dashboard
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

        {/* Reporting Page: Protected! */}
        <Route
          path="/report"
          element={user ? <ReportingPage /> : <Navigate to="/auth" />}
        />

        {/* Adoption Page: Protected! */}
        <Route
          path="/adoption"
          element={user ? <AdoptionPage /> : <Navigate to="/auth" />}
        />

        {/* Information Centre Page: Protected! */}
        <Route
          path="/information"
          element={user ? <InformationCentre /> : <Navigate to="/auth" />}
        />

        {/* Disease Detection Page: Protected! */}
        <Route
          path="/disease-detection"
          element={user ? <DiseaseDetectionPage /> : <Navigate to="/auth" />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
