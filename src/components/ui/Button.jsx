import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  onClick,
  className = "",
  disabled = false,
  ...props
}) => {
  const variantClasses = {
    primary: "bg-blue-700 hover:bg-blue-800 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-black",
    info: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1",
    large: "px-4 py-2 text-lg",
  };

  return (
    <button
      className={`${variantClasses[variant]} ${
        sizeClasses[size]
      } rounded font-medium transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
