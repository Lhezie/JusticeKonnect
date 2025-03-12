import React from "react";

// 🔄 Custom Loader Component
const ButtonLoader = () => {
  return (
    <span className="loading loading-spinner text-primary"></span>
  );
};


const Button = ({
  children,
  onClick,
  className,
  icon: Icon,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <button
      className={`h-12 rounded-xl px-4 flex items-center justify-center gap-2 
         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
    >
      {isLoading ? <ButtonLoader /> : Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};


export { Button, ButtonLoader };
