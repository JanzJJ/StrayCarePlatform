import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  AlertCircle,
  Stethoscope,
  Home as HomeIcon,
  BookOpen,
  LogOut,
  User,
  PawPrint,
  ClipboardList,
  Shield, // Added for Admin icon
} from "lucide-react";
import { useState } from "react";
import { UserProfile } from "./Userprofile";

export default function Navigation({
  isAuthenticated,
  userEmail,
  onLogout,
  accountType = "user",
}) {
  // ─────────────────────────────────────────────────────────────
  // useLocation gives the current URL path.
  // This is used to highlight the active navigation link.
  // ─────────────────────────────────────────────────────────────
  const location = useLocation();

  // Controls whether the user profile modal is open or closed.
  const [showProfile, setShowProfile] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Navigation links for normal individual users.
  // Each item stores the route path, display label, and icon component.
  // ─────────────────────────────────────────────────────────────
  const userNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { path: "/report", label: "Report Stray", icon: AlertCircle },
    { path: "/disease-detection", label: "Health Check", icon: Stethoscope },
    { path: "/adoption", label: "Adopt", icon: Heart },
    { path: "/information", label: "Info Centre", icon: BookOpen },
  ];

  // ─────────────────────────────────────────────────────────────
  // Navigation links for organization accounts.
  // Organizations currently see similar pages, but the dashboard icon
  // is different to represent organization management.
  // ─────────────────────────────────────────────────────────────
  const orgNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: ClipboardList },
    { path: "/report", label: "Report Stray", icon: AlertCircle },
    { path: "/disease-detection", label: "Health Check", icon: Stethoscope },
    { path: "/adoption", label: "Adopt", icon: Heart },
    { path: "/information", label: "Info Centre", icon: BookOpen },
  ];

  // ─────────────────────────────────────────────────────────────
  // Admin navigation is limited to the admin panel only.
  // This keeps the admin interface simple and role-specific.
  // ─────────────────────────────────────────────────────────────
  const adminNavItems = [
    { path: "/admin", label: "Admin Panel", icon: Shield },
  ];

  // ─────────────────────────────────────────────────────────────
  // Select the correct navigation menu based on the logged-in user's role.
  // Default is the normal user menu.
  // ─────────────────────────────────────────────────────────────
  let navItems = userNavItems;
  if (accountType === "organization") navItems = orgNavItems;
  if (accountType === "admin") navItems = adminNavItems;

  // Show only the first part of the email before @ in the navbar.
  const displayEmail = userEmail ? userEmail.split("@")[0] : null;

  return (
    <>
      {/* Main sticky navigation bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Logo links back to the home page */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <PawPrint className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                StrayCare
              </span>
            </Link>

            <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-4">
              {/* Show navigation links only after the user is authenticated */}
              {isAuthenticated && (
                <>
                  {/* Desktop navigation links */}
                  <div className="hidden md:flex space-x-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md"
                              : "text-gray-700 hover:bg-orange-50"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="hidden lg:inline">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* User menu section with profile button and logout button */}
                  <div className="flex items-center space-x-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200">
                    {/* Opens the user profile modal */}
                    <button
                      onClick={() => setShowProfile(true)}
                      className="flex items-center space-x-2 hover:bg-orange-50 rounded-lg px-2 sm:px-3 py-2 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <div className="bg-orange-100 rounded-full p-1.5 sm:p-2">
                        {accountType === "admin" ? (
                          <Shield className="h-5 w-5 text-orange-700" />
                        ) : (
                          <User className="h-5 w-5 text-orange-700" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 hidden sm:inline truncate max-w-[120px]">
                        {displayEmail || "My Profile"}
                      </span>
                    </button>

                    {/* Calls the logout function passed from the parent component */}
                    <button
                      onClick={onLogout}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-md text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline font-semibold">
                        Logout
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* Show Sign In button only when the user is not authenticated */}
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* User profile modal appears when showProfile is true */}
      {showProfile && (
        <UserProfile
          userEmail={userEmail || ""}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
