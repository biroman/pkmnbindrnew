import { useState, useEffect } from "react";
import {
  Wrench,
  Clock,
  Heart,
  ArrowRight,
  Sparkles,
  Cloud,
} from "lucide-react";

const UnderDevelopment = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Animated Logo/Icon */}
        <div className="relative">
          <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
            <img
              src="/logo.png"
              alt="Pokemon Binder Logo"
              className="h-18 w-18 object-contain animate-pulse"
              onError={(e) => {
                // Fallback to Wrench icon if logo fails to load
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "block";
              }}
            />
            <Wrench className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-pulse hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            We're Building Something
            <span className="block text-blue-600 dark:text-blue-400">
              Amazing
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
            Pokemon Binder is currently under development. We're crafting an
            incredible experience for all of you.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg min-h-[140px] flex flex-col justify-center">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
              Current Time
            </h3>
            <p className="text-xl font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap min-w-[120px]">
              {formatTime(currentTime)}
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg min-h-[140px] flex flex-col justify-center">
            <Cloud className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
              Security
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
              Adding possibility to store your collection in the cloud.
            </p>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg min-h-[140px] flex flex-col justify-center">
            <Heart className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 whitespace-nowrap">
              Progress
            </h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/5 animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
              60% Complete
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What's Coming
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Better user experience
                </span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Real-time Card Value Tracking
                </span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Collection Statistics & Analytics
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Share your collection with friends
                </span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Secure User Authentication
                </span>
              </div>
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <ArrowRight className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Modern, Responsive Design
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-gray-200/30 dark:border-gray-700/30">
          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            © 2025 Pokemon Binder. Currently in development.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 whitespace-nowrap">
            Status: Development Mode • Last updated:{" "}
            {currentTime.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default UnderDevelopment;
