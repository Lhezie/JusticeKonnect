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

const SelectInput = ({
  name,
  value,
  label,
  placeholder = "Select an Option",
  options = [],
  error,
  required = true,
  className= "",
  formik,
}) => {
  return (
    <div className="flex flex-col space-y-1 pt-6 relative">
      {label && <label className="font-medium">{label}</label>}
      <select
        name={name}
        value={value.value[name]}
        onChange={(e)=> formik.setFieldValue (name, e.target.value)}
        required={required}
        className={` w-full md:w-1/2 p-2 shadow-md rounded-md text-black placeholder:text-black bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      >  
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className=" absolute right-5 text-red-500 text-sm">{error}</p>}
    </div>
  )
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
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};


export { Button, ButtonLoader, SelectInput, InputField };
