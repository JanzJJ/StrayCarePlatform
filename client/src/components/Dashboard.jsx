/**
 * ═════════════════════════════════════════════════════════════════════════════
 * DASHBOARD COMPONENT (Dashboard.jsx)
 *
 */

import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import {
  AlertCircle,
  Stethoscope,
  Heart,
  BookOpen,
  ArrowRight,
  PawPrint,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/**
 * Dashboard Component
 * Main landing page with feature overview
 * No props required - displays same for all users
 */
export default function Dashboard() {
  /**
  
   */
  const features = [
    {
      title: "Report a Stray Dog",
      description:
        "Help us locate and rescue stray dogs in your area. Report sightings with location details and photos to connect them with care.",
      icon: AlertCircle,
      image:
        "https://images.unsplash.com/photo-1532598735201-8932203d3004?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJheSUyMGRvZyUyMHJlc2N1ZSUyMGhlYXJ0d2FybWluZ3xlbnwxfHx8fDE3NzAxMjcyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      link: "/report",
      gradient: "from-orange-600 to-amber-600",
      iconBg: "from-orange-500 to-orange-700",
    },
    {
      title: "Health Detection",
      description:
        "Upload photos of dogs with potential skin conditions. Our AI-powered system helps identify diseases to provide timely veterinary care.",
      icon: Stethoscope,
      image:
        "https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBkb2clMjBoZWFsdGglMjBjYXJlfGVufDF8fHx8MTc3MDEyNzIzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      link: "/disease-detection",
      gradient: "from-amber-600 to-yellow-600",
      iconBg: "from-amber-500 to-amber-700",
    },
    {
      title: "Adoption Platform",
      description:
        "Find your perfect companion! Browse through profiles of rescued dogs looking for their forever homes and make a difference.",
      icon: Heart,
      image:
        "https://images.unsplash.com/photo-1591911949558-2b0b620d545a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBhZG9wdGlvbiUyMGhhcHB5JTIwZmFtaWx5fGVufDF8fHx8MTc3MDEyMTc0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      link: "/adoption",
      gradient: "from-rose-600 to-pink-600",
      iconBg: "from-rose-500 to-pink-700",
    },
    {
      title: "Information Centre",
      description:
        "Access comprehensive guides on dog care, health tips, adoption processes, and how to help stray animals in your community.",
      icon: BookOpen,
      image:
        "https://images.unsplash.com/photo-1761486691774-5493fdaa3ed1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBjYXJlJTIwaW5mb3JtYXRpb258ZW58MXx8fHwxNzY5NTE1MTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      link: "/information",
      gradient: "from-teal-600 to-cyan-600",
      iconBg: "from-teal-500 to-cyan-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Hero Section with Beautiful Dog Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1596078858332-42e51b6824b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZyUyMGZhbWlseSUyMGhvbWUlMjBsb3ZlfGVufDF8fHx8MTc3MDEyNzIzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 via-amber-900/70 to-orange-900/80"></div>
        </div>

        {/* Floating Elements */}
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
            {/* Welcome Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-white font-medium">
                Welcome to Stay Care Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight"
            >
              Your Journey to
              <br />
              <span className="bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                Save Lives Starts Here
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto text-gray-200 leading-relaxed"
            >
              Access powerful tools to report strays, detect health issues,
              adopt companions, and learn how to make a lasting impact
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <a
                href="#features"
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105 no-underline"
              >
                <span>Explore Features</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/adoption"
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 no-underline"
              >
                <Heart className="h-5 w-5" />
                <span>Adopt Now</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
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

      {/* Features Section */}
      {/* ─────────────────────────────────────────────────────────────
          FEATURES CARDS GRID
          Displays all 4 main features from the features array.
          
          
          ───────────────────────────────────────────────────────────*/}
      <div id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-6 shadow-lg">
              <PawPrint className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Our Platform Features
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Comprehensive tools and resources to support stray dogs and
              connect them with loving communities
            </p>
          </motion.div>

          {/* Feature Cards */}
          {/* ─────────────────────────────────────────────────────────────
           
              ───────────────────────────────────────────────────────────*/}
          <div className="space-y-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } items-center gap-0 bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group`}
                >
                  {/* ─────────────────────────────────────────────────────────────
                     
                      ───────────────────────────────────────────────────────────*/}
                  <div className="lg:w-1/2 h-80 lg:h-96 w-full relative overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
                    ></div>
                  </div>

              
                  <div className="lg:w-1/2 p-8 lg:p-12">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconBg} mb-6 shadow-lg`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold mb-4 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    <Link
                      to={feature.link}
                      className={`inline-flex items-center space-x-2 bg-gradient-to-r ${feature.gradient} hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-1 group/btn no-underline`}
                    >
                      <span>Get Started</span>
                      <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500">
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
          className="relative max-w-5xl mx-auto text-center"
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
            <Heart className="h-10 w-10 text-white fill-white" />
          </motion.div>

     
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
            Ready to Make a Real Difference?
          </h2>
          <p className="text-xl lg:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join our community of animal lovers and help give stray dogs the
            care and love they deserve
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/report"
              className="inline-flex items-center space-x-2 bg-white text-orange-600 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 no-underline"
            >
              <AlertCircle className="h-5 w-5" />
              <span>Report a Stray</span>
            </Link>
            <Link
              to="/adoption"
              className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 no-underline"
            >
              <Heart className="h-5 w-5" />
              <span>Find Your Friend</span>
            </Link>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
          >
        
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
