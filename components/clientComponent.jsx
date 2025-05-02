import React from "react";
import { Field, ErrorMessage } from "formik";


// 🔄 Custom Loader Component
const ButtonLoader = () => {
  return <span className="loading loading-spinner text-primary"></span>;
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


const SelectInput = ({
  name,
  label,
  placeholder = "Select an Option",
  options = [],
  required = true,
  className = "",
}) => {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="flex flex-col space-y-1 pt-6">
      {label && <label className="font-medium">{label}</label>}
      <div className="relative w-full md:w-1/2">
        <Field
          as="select"
          name={name}
          required={required}
          className={`appearance-none w-full p-2 shadow-md rounded-md text-black bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className} pr-8`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black' width='24px' height='24px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            backgroundSize: "1rem",
          }}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {safeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field>
      </div>
      <ErrorMessage name={name} component="div" className="text-red-500 text-xm" />
    </div>
  );
};





const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = "",
}) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="font-medium">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export { Button, ButtonLoader, SelectInput, InputField };
