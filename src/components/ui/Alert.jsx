import { CheckCircle, AlertTriangle, Shield } from "lucide-react";

const Alert = ({ alert, onClose }) => {
  if (!alert) return null;

  const bgColor = {
    success:
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
  }[alert.type];

  const textColor = {
    success: "text-green-800 dark:text-green-200",
    error: "text-red-800 dark:text-red-200",
    info: "text-blue-800 dark:text-blue-200",
  }[alert.type];

  const icon = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertTriangle className="h-4 w-4" />,
    info: <Shield className="h-4 w-4" />,
  }[alert.type];

  return (
    <div className={`border rounded-lg p-3 ${bgColor}`}>
      <div className={`flex items-center ${textColor}`}>
        {icon}
        <span className="ml-2 text-sm">{alert.message}</span>
      </div>
    </div>
  );
};

export default Alert;
