import {
  User,
  Lock,
  Shield,
  Info,
  Crown,
  Settings2,
  Share2,
  Image,
  Bell,
} from "lucide-react";

const SettingsNavigation = ({ activeSection, onSectionChange, isOwner }) => {
  const sections = [
    {
      id: "account",
      name: "Account",
      description: "Personal information, email, and account details",
      icon: User,
    },
    {
      id: "security",
      name: "Security",
      description: "Password and email verification settings",
      icon: Lock,
    },
    {
      id: "binder-preferences",
      name: "Binder Preferences",
      description: "Default settings for creating and displaying binders",
      icon: Settings2,
    },
    {
      id: "privacy-sharing",
      name: "Privacy & Sharing",
      description: "Control who can see and share your binders",
      icon: Share2,
    },
    {
      id: "display-themes",
      name: "Display & Themes",
      description: "Customize appearance and binder themes",
      icon: Image,
    },
    {
      id: "notifications",
      name: "Notifications",
      description: "Email and in-app notification preferences",
      icon: Bell,
    },
  ];

  // Add admin section for owners
  if (isOwner && isOwner()) {
    sections.push({
      id: "admin",
      name: "Administration",
      description: "Owner-only admin tools and system management",
      icon: Crown,
      special: true,
    });
  }

  return (
    <nav className="space-y-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Settings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize your Pokemon binder experience
        </p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
              isActive
                ? section.special
                  ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                  : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  isActive
                    ? section.special
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? section.special
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3
                    className={`text-sm font-medium ${
                      isActive
                        ? section.special
                          ? "text-purple-900 dark:text-purple-100"
                          : "text-blue-900 dark:text-blue-100"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {section.name}
                  </h3>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    isActive
                      ? section.special
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-blue-700 dark:text-blue-300"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {section.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsNavigation;
