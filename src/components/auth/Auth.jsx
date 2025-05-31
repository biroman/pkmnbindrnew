import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ThemeToggle from "../ui/ThemeToggle";
import { BookOpen, ChartBar, Search, Share } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-500">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content Grid */}
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Branding/Info */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-40 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10 text-center">
            {/* Logo */}
            <div>
              <img
                src="/logo.png"
                alt="Pokemon Binder Logo"
                className="h-70 w-70 mx-auto object-contain"
                onError={(e) => {
                  // Fallback if logo fails to load
                  e.target.style.display = "none";
                }}
              />
            </div>

            <p className="text-lg lg:text-xl opacity-90 mb-8 max-w-md mx-auto leading-relaxed">
              Organize, track, and manage your Pokemon binder collection like
              never before.
            </p>

            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-red-400 flex-shrink-0" />
                <span className="text-white/90">
                  Digital binder collection management
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <ChartBar className="h-6 w-6 text-orange-400 flex-shrink-0" />
                <span className="text-white/90">
                  Real-time binder value tracking
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Share className="h-6 w-6 text-blue-400 flex-shrink-0" />
                <span className="text-white/90">
                  Share binders with friends
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex items-center justify-center p-4 lg:p-12 relative">
          {/* Mobile background decoration */}
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 blur-3xl"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {isLogin ? (
              <LoginForm onToggleMode={toggleMode} />
            ) : (
              <SignupForm onToggleMode={toggleMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
