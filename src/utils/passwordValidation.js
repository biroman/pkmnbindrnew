// Password strength and validation utilities
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score - special character is bonus, not required
  if (checks.length) score++;
  if (checks.lowercase) score++;
  if (checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++; // Bonus point

  // Determine strength level (special char not required for "Strong")
  if (score === 0) return { score: 0, label: "", color: "" };
  if (score <= 2) return { score, label: "Weak", color: "text-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "text-yellow-500" };
  if (score >= 4)
    return {
      score,
      label: score === 5 ? "Very Strong" : "Strong",
      color: "text-green-500",
    };
  return { score, label: "Strong", color: "text-green-500" };
};

export const getPasswordRequirements = (password) => {
  return [
    {
      text: "At least 8 characters",
      met: password.length >= 8,
      required: true,
    },
    {
      text: "One lowercase letter (a-z)",
      met: /[a-z]/.test(password),
      required: true,
    },
    {
      text: "One uppercase letter (A-Z)",
      met: /[A-Z]/.test(password),
      required: true,
    },
    {
      text: "One number (0-9)",
      met: /\d/.test(password),
      required: true,
    },
    {
      text: "One special character (!@#$%^&*)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      required: true,
    },
  ];
};

// Enhanced password validation
export const validateStrongPassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  // Special character is now optional - removed from required validation
  return null;
};

// Check if password meets all required requirements (special char is optional)
export const isPasswordValid = (password) => {
  const requirements = getPasswordRequirements(password);
  return requirements.filter((req) => req.required).every((req) => req.met);
};
