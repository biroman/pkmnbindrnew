import { Check, X } from "lucide-react";
import {
  getPasswordStrength,
  getPasswordRequirements,
} from "../../utils/passwordValidation";

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }) => {
  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  // Only show required requirements to the user
  const requiredRequirements = requirements.filter((req) => req.required);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength meter */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Password Strength
          </span>
          <span className={`text-xs font-medium ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full ${
                level <= strength.score
                  ? strength.score <= 2
                    ? "bg-red-500"
                    : strength.score <= 3
                    ? "bg-yellow-500"
                    : strength.score <= 4
                    ? "bg-green-500"
                    : "bg-emerald-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist - only show required requirements */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Requirements:
        </span>
        {requiredRequirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-gray-400" />
            )}
            <span
              className={`text-xs ${
                req.met
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
