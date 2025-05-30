const Card = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated:
      "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700",
    glass:
      "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
  };

  const classes = `
    rounded-xl transition-all duration-200
    ${variants[variant]}
    ${className}
  `.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
