/**

 * WELCOME LANDING PAGE COMPONENT (WelcomeLandingPage.jsx)
 *
 */

// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import {
  Heart,
  PawPrint,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  MapPin,
} from "lucide-react";

/**
 * WelcomeLandingPage Component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onGetStarted - Callback invoked when user clicks "Get Started"
 *
 * RENDERS:
 * • Hero section with welcome message
 * • Platform benefits/statistics
 * • How-it-works workflow steps
 * • Feature highlights
 * • Final call-to-action
 */
export default function WelcomeLandingPage({ onGetStarted }) {
  // 1. Setup State for Real Data
  const [stats, setStats] = useState({
    totalReported: 0,
    totalRescued: 0,
    rescuedThisMonth: 0,
    happilyAdopted: 0,
  });

  // 2. Get current month dynamically (e.g., "April 2026")
  const currentMonthYear = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // 3. Fetch data on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // IMPORTANT: Ensure you create this public endpoint in your backend!
        const response = await fetch("http://localhost:5001/api/public/stats");
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalReported: data.totalReported || 0,
            totalRescued: data.totalRescued || 0,
            rescuedThisMonth: data.rescuedThisMonth || 0,
            happilyAdopted: data.happilyAdopted || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch public stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/*
          
          ───────────────────────────────────────────────────────────────*/}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1596078858332-42e51b6824b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZyUyMGZhbWlseSUyMGhvbWUlMjBsb3ZlfGVufDF8fHx8MTc3MDEyNzIzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-orange-900/85 via-amber-900/75 to-orange-900/85"></div>
        </div>

        {/* Floating Elements - Animated Background Decorations */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* ─────────────────────────────────────────────────────────────
                WELCOME BADGE
    
                ───────────────────────────────────────────────────────────*/}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-white font-medium">
                Welcome to Stay Care
              </span>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────────
                MAIN HEADING
                
                PURPOSE: Primary value proposition
            
                ───────────────────────────────────────────────────────────*/}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 text-white leading-tight"
            >
              Welcome to{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-linear-to-r from-white via-orange-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Stay Care
                </span>
                <span className="absolute inset-0 blur-xl bg-linear-to-r from-orange-300 to-amber-300 opacity-50"></span>
              </span>
            </motion.h1>

            {/* ─────────────────────────────────────────────────────────────
               
                ───────────────────────────────────────────────────────────*/}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto text-gray-200 leading-relaxed"
            >
              Join Sri Lanka's premier platform for stray dog welfare. Report,
              rescue, heal, and rehome dogs in need across the island.
            </motion.p>

            {/* ─────────────────────────────────────────────────────────────
               
                ───────────────────────────────────────────────────────────*/}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center space-x-2 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 border-none cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#about"
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 no-underline"
              >
                <span>Learn More</span>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SCROLL INDICATOR
          
            ───────────────────────────────────────────────────────────*/}
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STATISTICS SECTION
          
          ───────────────────────────────────────────────────────────*/}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Our Impact Across Sri Lanka
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Real numbers, real lives saved through community action and
              compassion
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-extrabold text-green-600 mb-3">
                {stats.totalReported.toLocaleString()}+
              </div>
              <div className="text-gray-800 text-xl font-bold mb-1">
                Total Dogs Reported
              </div>
              <div className="text-gray-500 text-sm">Community Reports</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg">
                <PawPrint className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-extrabold text-orange-600 mb-3">
                {stats.totalRescued.toLocaleString()}+
              </div>
              <div className="text-gray-800 text-xl font-bold mb-1">
                Total Dogs Rescued
              </div>
              <div className="text-gray-500 text-sm">Across Sri Lanka</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-amber-50 to-yellow-50 rounded-2xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-amber-500 to-yellow-600 rounded-full mb-6 shadow-lg">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-extrabold text-amber-600 mb-3">
                {stats.rescuedThisMonth.toLocaleString()}
              </div>
              <div className="text-gray-800 text-xl font-bold mb-1">
                Dogs Rescued This Month
              </div>
              <div className="text-gray-500 text-sm capitalize">
                {currentMonthYear}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-rose-50 to-pink-50 rounded-2xl p-10 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-rose-500 to-pink-600 rounded-full mb-6 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <div className="text-6xl font-extrabold text-rose-600 mb-3">
                {stats.happilyAdopted.toLocaleString()}+
              </div>
              <div className="text-gray-800 text-xl font-bold mb-1">
                Happily Adopted Dogs
              </div>
              <div className="text-gray-500 text-sm">Forever Homes Found</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div
        id="about"
        className="py-20 px-4 bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              About Stay Care
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Sri Lanka's comprehensive platform for stray dog welfare and
              community-driven rescue
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1532598735201-8932203d3004?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJheSUyMGRvZyUyMHJlc2N1ZSUyMGhlYXJ0d2FybWluZ3xlbnwxfHx8fDE3NzAxMjcyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Stray dog rescue"
                className="rounded-3xl shadow-2xl w-full object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600 font-medium">Active Platform</div>
              </div>
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-gray-800 mb-6">
                Transforming Lives, One Paw at a Time
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Stay Care is Sri Lanka's pioneering digital platform dedicated
                to stray dog welfare. We connect compassionate individuals,
                rescue organizations, and veterinary services to create a
                comprehensive ecosystem of care.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Through innovative technology including AI-powered health
                detection, interactive reporting maps, and a robust adoption
                platform, we're making it easier than ever to help dogs in need
                across the island.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Community-Driven
                    </h4>
                    <p className="text-gray-600">
                      Powered by thousands of caring Sri Lankans
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      AI-Powered Detection
                    </h4>
                    <p className="text-gray-600">
                      Advanced health screening for early intervention
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Island-Wide Network
                    </h4>
                    <p className="text-gray-600">
                      Connected rescue efforts across all provinces
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl mb-6 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-gray-800 mb-4">Vision</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                To create a Sri Lanka where no stray dog suffers from neglect,
                disease, or homelessness, by building safer, cleaner, and more
                compassionate communities through technology and collective
                community action.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-10 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl mb-6 shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-gray-800 mb-4">Mission</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                To provide a centralized digital platform that motivates and
                encourages people to help stray dogs in a safe, informed, and
                responsible way, equipping them with the right knowledge, tools,
                and connections to take meaningful and sustainable action.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-orange-500 via-amber-500 to-orange-500">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8"
          >
            <PawPrint className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl lg:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join thousands of compassionate Sri Lankans helping stray dogs find
            safety, health, and love
          </p>

          <button
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2 bg-white text-orange-600 hover:bg-gray-50 px-10 py-5 rounded-full font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-none cursor-pointer"
          >
            <span>Join Stay Care Today</span>
            <ArrowRight className="h-6 w-6" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
