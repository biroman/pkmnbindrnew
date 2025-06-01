/**
 * Landing Page Component
 *
 * Welcome page for new visitors that provides options to:
 * 1. Try the app as a guest (anonymous with local storage)
 * 2. Sign in for cloud features
 * 3. Learn about the benefits of registration
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Play,
  Cloud,
  Users,
  Database,
  Share,
  ArrowRight,
  CheckCircle,
  Sparkles,
  HardDrive,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "../components/ui";

const Landing = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  // Redirect authenticated users to the app
  useEffect(() => {
    if (!loading && currentUser) {
      navigate("/app", { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const handleTryAsGuest = () => {
    setIsAnimating(true);
    // Add a small delay for animation
    setTimeout(() => {
      navigate("/app/binder");
    }, 500);
  };

  const handleSignIn = () => {
    navigate("/auth?mode=login");
  };

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
  };

  // Don't render anything while loading or for authenticated users
  if (loading || currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div
              className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
              <img
                src="/logo.png"
                alt="Pokemon Binder Logo"
                className="h-18 w-18 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "block";
                }}
              />
              <Database className="h-12 w-12 text-blue-600 dark:text-blue-400 hidden" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Pokemon Collection,
            <span className="block text-blue-600 dark:text-blue-400">
              Digitally Organized
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Create digital binders, track your cards, and manage your Pokemon
            collection like never before.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={handleTryAsGuest}
              size="lg"
              className={`bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg transition-all duration-300 ${
                isAnimating ? "scale-95 opacity-75" : "hover:scale-105"
              }`}
            >
              <Play className="h-5 w-5 mr-2" />
              Catch 'em All
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSignIn}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Sign In
              </Button>
              <span className="text-gray-400 dark:text-gray-500">or</span>
              <Button
                onClick={handleSignUp}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-all duration-300"
              >
                Sign Up Free
              </Button>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Guest Experience */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Use As Guest
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    No Sign-up Required
                  </Badge>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <HardDrive className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                    <span>Unlimited binders (stored locally)</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Database className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                    <span>Add as many cards as you want</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Sparkles className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                    <span>Full collection management</span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Data is stored locally in your
                    browser. No cloud sync or sharing features.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Registered Experience */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-800 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Sign Up for Cloud
                  </h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Free
                  </Badge>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Cloud className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Cloud storage</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <RefreshCw className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Sync across all devices</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Share className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Share collections with friends</span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Plus:</strong> Export features, advanced analytics,
                    see other users collections, and more coming soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need to Manage Your Collection
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Digital Binders
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create digital binders to organize your Pokemon cards by set,
                type, or any way you like.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Organization
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced search, filtering, and sorting options to find any card
                in your collection instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Share & Connect
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your favorite binders with friends and fellow collectors
                around the world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Pokemon collectors who are already organizing
            their collections digitally.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleTryAsGuest}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              Try Now - No Account Needed
            </Button>

            <Button
              onClick={handleSignUp}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg transition-all duration-300"
            >
              <Cloud className="h-5 w-5 mr-2" />
              Sign Up for Cloud Features
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
