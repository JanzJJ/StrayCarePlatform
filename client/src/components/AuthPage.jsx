import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  PawPrint,
  Building2,
  Clock,
  Briefcase,
  FileText,
  AlertCircle,
  Shield, // Added Shield icon for Admin
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("user"); // "user" | "organization" | "admin"
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // User Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupCity, setSignupCity] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Organization Signup form state
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgTelephone, setOrgTelephone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgOpeningHours, setOrgOpeningHours] = useState("");
  const [orgServices, setOrgServices] = useState("");
  const [orgOther, setOrgOther] = useState("");
  const [orgPassword, setOrgPassword] = useState("");
  const [orgConfirmPassword, setOrgConfirmPassword] = useState("");
  const [orgAgreeToTerms, setOrgAgreeToTerms] = useState(false);

  // Admin Signup form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminAgreeToTerms, setAdminAgreeToTerms] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

  // --- API CALL: LOGIN ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API CALL: GOOGLE SIGN-IN ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        ).then((res) => res.json());

        const response = await fetch("http://localhost:5001/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            googleId: userInfo.sub,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (onLogin) onLogin(data.user);
        } else {
          setErrorMsg(data.message);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Google Sign-In failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setErrorMsg("Google Sign-In was cancelled or failed.");
    },
  });

  // --- API CALL: INDIVIDUAL SIGNUP ---
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!agreeToTerms)
      return setErrorMsg("Please agree to the terms and conditions");
    if (signupPassword !== signupConfirmPassword)
      return setErrorMsg("Passwords do not match");

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "individual",
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          city: signupCity,
          phone: signupPhone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API CALL: ORGANIZATION SIGNUP ---
  const handleOrgSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!orgAgreeToTerms)
      return setErrorMsg("Please agree to the terms and conditions");
    if (orgPassword !== orgConfirmPassword)
      return setErrorMsg("Passwords do not match");

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "organization",
          organizationName: orgName,
          email: orgEmail,
          password: orgPassword,
          location: orgAddress,
          contactDetails: orgTelephone,
          servicesOffered: orgServices,
          openingHours: orgOpeningHours,
          otherDetails: orgOther,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API CALL: ADMIN SIGNUP ---
  const handleAdminSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!adminAgreeToTerms)
      return setErrorMsg("Please agree to the terms and conditions");
    if (adminPassword !== adminConfirmPassword)
      return setErrorMsg("Passwords do not match");
    if (!adminCode) return setErrorMsg("Admin Code is required");

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "admin",
          email: adminEmail,
          password: adminPassword,
          adminCode: adminCode, // Send the secret code to backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (onLogin) onLogin(data.user);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${forgotEmail}`);
    setShowForgotPassword(false);
    setForgotEmail("");
  };

  const ErrorBanner = () => {
    if (!errorMsg) return null;
    return (
      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
        <p className="text-red-700 font-medium">{errorMsg}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col items-center justify-center p-4 md:p-8 m-0 absolute top-0 left-0 right-0">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-10 mt-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-full shadow-2xl">
                <PawPrint className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent tracking-tight">
              Stay Care
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto font-medium">
              Join our mission to rescue, rehabilitate, and rehome stray dogs
              across Sri Lanka
            </p>
          </div>
        </div>

        {/* Main Auth Container */}
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 mb-12 relative z-10 w-full">
          {showForgotPassword ? (
            /* Forgot Password Form */
            <div className="p-8 md:p-12">
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Forgot Password?
                  </h2>
                  <p className="text-lg text-gray-600">
                    Enter your email to receive a password reset link
                  </p>
                </div>
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-center text-base bg-transparent border-none text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="flex border-b-2 border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-5 text-center text-lg font-bold transition-all bg-transparent border-none cursor-pointer ${
                    isLogin
                      ? "text-orange-600 border-b-4 border-orange-500 bg-orange-50/30"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{
                    borderBottom: isLogin ? "3px solid #f97316" : "none",
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMsg("");
                  }}
                  className={`flex-1 py-5 text-center text-lg font-bold transition-all bg-transparent border-none cursor-pointer ${
                    !isLogin
                      ? "text-orange-600 border-b-4 border-orange-500 bg-orange-50/30"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{
                    borderBottom: !isLogin ? "3px solid #f97316" : "none",
                  }}
                >
                  Sign Up
                </button>
              </div>

              <div className="p-8 md:p-12">
                {isLogin ? (
                  /* Login Form */
                  <form
                    onSubmit={handleLoginSubmit}
                    className="max-w-xl mx-auto space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome Back!
                      </h2>
                      <p className="text-lg text-gray-500">
                        Sign in to continue your mission
                      </p>
                    </div>

                    <ErrorBanner />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 bg-white"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Remember me
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-semibold bg-transparent border-none cursor-pointer p-0"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 mt-4 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 border-none cursor-pointer"
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => loginWithGoogle()}
                      className="w-full py-4 text-base bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-semibold text-gray-700 flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </button>
                  </form>
                ) : (
                  /* Sign Up Form */
                  <div className="max-w-2xl mx-auto">
                    {/* Account Type Toggle - UPDATED FOR ADMIN */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                        Account Type
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          type="button"
                          className={`py-4 px-2 border-2 rounded-xl font-semibold text-sm transition-all bg-white flex flex-col items-center justify-center ${
                            accountType === "user"
                              ? "border-orange-500 text-orange-600 bg-orange-50/50 shadow-sm"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setAccountType("user");
                            setErrorMsg("");
                          }}
                        >
                          <User className="h-6 w-6 mb-2" />
                          Individual
                        </button>
                        <button
                          type="button"
                          className={`py-4 px-2 border-2 rounded-xl font-semibold text-sm transition-all bg-white flex flex-col items-center justify-center ${
                            accountType === "organization"
                              ? "border-orange-500 text-orange-600 bg-orange-50/50 shadow-sm"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setAccountType("organization");
                            setErrorMsg("");
                          }}
                        >
                          <Building2 className="h-6 w-6 mb-2" />
                          Organization
                        </button>
                        <button
                          type="button"
                          className={`py-4 px-2 border-2 rounded-xl font-semibold text-sm transition-all bg-white flex flex-col items-center justify-center ${
                            accountType === "admin"
                              ? "border-orange-500 text-orange-600 bg-orange-50/50 shadow-sm"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setAccountType("admin");
                            setErrorMsg("");
                          }}
                        >
                          <Shield className="h-6 w-6 mb-2" />
                          Admin
                        </button>
                      </div>
                    </div>

                    <ErrorBanner />

                    {/* Conditional Rendering based on accountType */}
                    {accountType === "user" ? (
                      // --- INDIVIDUAL SIGNUP ---
                      <form onSubmit={handleSignupSubmit} className="space-y-5">
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Create Account
                          </h2>
                          <p className="text-lg text-gray-500">
                            Join our community of animal lovers
                          </p>
                        </div>
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Email */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                                required
                              />
                            </div>
                          </div>
                          {/* Phone */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="tel"
                                value={signupPhone}
                                onChange={(e) => setSignupPhone(e.target.value)}
                                placeholder="+94 77 123 4567"
                                className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                              />
                            </div>
                          </div>
                        </div>
                        {/* City */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={signupCity}
                              onChange={(e) => setSignupCity(e.target.value)}
                              placeholder="e.g., Colombo"
                              className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={signupPassword}
                                onChange={(e) =>
                                  setSignupPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={signupConfirmPassword}
                                onChange={(e) =>
                                  setSignupConfirmPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-gray-800"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        {/* Terms */}
                        <div className="flex items-start pt-2">
                          <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded mt-0.5"
                            required
                          />
                          <label className="ml-2 text-sm text-gray-600">
                            I agree to the{" "}
                            <span className="text-orange-600 font-semibold cursor-pointer">
                              Terms
                            </span>{" "}
                            and{" "}
                            <span className="text-orange-600 font-semibold cursor-pointer">
                              Privacy Policy
                            </span>
                          </label>
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-4 mt-2 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                        >
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                      </form>
                    ) : accountType === "organization" ? (
                      // --- ORGANIZATION SIGNUP ---
                      <form
                        onSubmit={handleOrgSignupSubmit}
                        className="space-y-5"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Organization Account
                          </h2>
                          <p className="text-lg text-gray-500">
                            Register your organization
                          </p>
                        </div>
                        {/* Org Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Organization Name
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={orgName}
                              onChange={(e) => setOrgName(e.target.value)}
                              placeholder="Organization Name"
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>
                        {/* Address */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Address
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={orgAddress}
                              onChange={(e) => setOrgAddress(e.target.value)}
                              placeholder="Full Address"
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Telephone */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Telephone
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="tel"
                                value={orgTelephone}
                                onChange={(e) =>
                                  setOrgTelephone(e.target.value)
                                }
                                placeholder="+94 77 123 4567"
                                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                                required
                              />
                            </div>
                          </div>
                          {/* Email */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="email"
                                value={orgEmail}
                                onChange={(e) => setOrgEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        {/* Services */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Services Provided
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <textarea
                              value={orgServices}
                              onChange={(e) => setOrgServices(e.target.value)}
                              placeholder="Describe your services..."
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 min-h-[100px]"
                              required
                            />
                          </div>
                        </div>
                        {/* Hours */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Opening Hours
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={orgOpeningHours}
                              onChange={(e) =>
                                setOrgOpeningHours(e.target.value)
                              }
                              placeholder="e.g., Mon-Fri 9AM-5PM"
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>
                        {/* Other */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Other Details (Optional)
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                            <textarea
                              value={orgOther}
                              onChange={(e) => setOrgOther(e.target.value)}
                              placeholder="Any additional information..."
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 min-h-[100px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={orgPassword}
                                onChange={(e) => setOrgPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={orgConfirmPassword}
                                onChange={(e) =>
                                  setOrgConfirmPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        {/* Terms */}
                        <div className="flex items-start pt-2">
                          <input
                            type="checkbox"
                            checked={orgAgreeToTerms}
                            onChange={(e) =>
                              setOrgAgreeToTerms(e.target.checked)
                            }
                            className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded mt-0.5"
                            required
                          />
                          <label className="ml-2 text-sm text-gray-600">
                            I agree to the{" "}
                            <span className="text-orange-600 font-semibold cursor-pointer">
                              Terms
                            </span>{" "}
                            and{" "}
                            <span className="text-orange-600 font-semibold cursor-pointer">
                              Privacy Policy
                            </span>
                          </label>
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-4 mt-2 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                        >
                          {isLoading
                            ? "Creating Account..."
                            : "Create Organization Account"}
                        </button>
                      </form>
                    ) : (
                      // --- ADMIN SIGNUP ---
                      <form
                        onSubmit={handleAdminSignupSubmit}
                        className="space-y-5"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Create Admin Account
                          </h2>
                          <p className="text-lg text-gray-500">
                            Register as a system administrator
                          </p>
                        </div>
                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              placeholder="admin@staycare.com"
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={adminPassword}
                                onChange={(e) =>
                                  setAdminPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type={showPassword ? "text" : "password"}
                                value={adminConfirmPassword}
                                onChange={(e) =>
                                  setAdminConfirmPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        {/* Admin Code */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Admin Registration Code
                          </label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={adminCode}
                              onChange={(e) => setAdminCode(e.target.value)}
                              placeholder="Enter the secret admin code"
                              className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-orange-500"
                              required
                            />
                          </div>
                        </div>
                        {/* Terms */}
                        <div className="flex items-start pt-2">
                          <input
                            type="checkbox"
                            checked={adminAgreeToTerms}
                            onChange={(e) =>
                              setAdminAgreeToTerms(e.target.checked)
                            }
                            className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded mt-0.5"
                            required
                          />
                          <label className="ml-2 text-sm text-gray-600">
                            I agree to the{" "}
                            <span className="text-orange-600 font-semibold cursor-pointer">
                              Terms
                            </span>{" "}
                            and{" "}
                            <span className="text-orange-600 font-semibold cursor-pointer">
                              Privacy Policy
                            </span>
                          </label>
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-4 mt-2 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                        >
                          {isLoading
                            ? "Creating Admin..."
                            : "Create Admin Account"}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
