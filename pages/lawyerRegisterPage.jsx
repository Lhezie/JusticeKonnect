// pages/lawyerRegisterPage.jsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { BiSolidPhoneCall } from "react-icons/bi";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaIdCard } from "react-icons/fa";
import { MdOutlineBiotech, MdCategory } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

export default function LawyerRegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be 8 characters long")
      .matches(/[0-9]/, "Password requires a number")
      .matches(/[a-z]/, "Password requires a lowercase letter")
      .matches(/[A-Z]/, "Password requires an uppercase letter")
      .matches(/[^\w]/, "Password requires a symbol")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Invalid phone number")
      .required("Phone Number is required"),
    professionalId: Yup.string()
      .required("Professional ID is required"),
    licenseNumber: Yup.string()
      .required("License number is required"),
    organization: Yup.string(),
    specialty: Yup.string()
      .required("Specialty is required"),
    bio: Yup.string()
      .max(500, "Bio must be less than 500 characters")
  });

  // Handle Form Submission
  const handleRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(
        "/api/auth/lawyerregister",
        {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phoneNumber: values.phoneNumber,
          professionalId: values.professionalId,
          licenseNumber: values.licenseNumber,
          organization: values.organization,
          specialty: values.specialty,
          bio: values.bio
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Registration Successful! Redirecting...");
      resetForm();
      setTimeout(() => router.push("/lawyerLoginPage"), 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration Failed! Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const specialties = [
    { value: "", label: "Select your specialty" },
    { value: "criminal", label: "Criminal Law" },
    { value: "family", label: "Family Law" },
    { value: "corporate", label: "Corporate Law" },
    { value: "intellectual", label: "Intellectual Property" },
    { value: "real_estate", label: "Real Estate" },
    { value: "tax", label: "Tax Law" },
    { value: "immigration", label: "Immigration" },
    { value: "human_rights", label: "Human Rights" },
    { value: "other", label: "Other" }
  ];

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-white">
          {/* LOGO */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
              <Image
                src="/LogoOnee.png"
                width={96}
                height={96}
                alt="Logo"
                className="object-contain"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-4">Lawyer Registration</h2>

          {/* TABS */}
          <div className="flex justify-between mb-4 text-lg font-semibold border-b border-gray-300 relative">
            <button
              onClick={() => router.push("/lawyerRegisterPage")}
              className={`w-1/2 text-center pb-2 ${
                pathname === "/lawyerRegisterPage"
                  ? "text-black font-bold"
                  : "text-gray-500"
              }`}
            >
              SIGN UP
              {pathname === "/lawyerRegisterPage" && (
                <div className="absolute bottom-0 left-0 w-1/2 h-1 bg-black" />
              )}
            </button>
            <button
              onClick={() => router.push("/lawyerLoginPage")}
              className={`w-1/2 text-center pb-2 ${
                pathname === "/lawyerLoginPage"
                  ? "text-black font-bold"
                  : "text-gray-500"
              }`}
            >
              LOGIN
              {pathname === "/lawyerLoginPage" && (
                <div className="absolute bottom-0 right-0 w-1/2 h-1 bg-black" />
              )}
            </button>
          </div>

          {/* FORM */}
          <Formik
            initialValues={{
              fullName: "",
              email: "",
              password: "",
              confirmPassword: "",
              phoneNumber: "",
              professionalId: "",
              licenseNumber: "",
              organization: "",
              specialty: "",
              bio: ""
            }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-3">
                {/* Full Name */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaUser className="text-gray-600 mr-3" />
                  <Field
                    name="fullName"
                    placeholder="Full Name"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Email */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaEnvelope className="text-gray-600 mr-3" />
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Password */}
                <div className="relative flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaLock className="text-gray-600 mr-3" />
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="bg-transparent outline-none w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Confirm Password */}
                <div className="relative flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaLock className="text-gray-600 mr-3" />
                  <Field
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="bg-transparent outline-none w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Phone Number */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <BiSolidPhoneCall className="text-gray-600 mr-3" />
                  <Field
                    name="phoneNumber"
                    placeholder="Phone Number"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Professional ID */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaIdCard className="text-gray-600 mr-3" />
                  <Field
                    name="professionalId"
                    placeholder="Professional ID"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="professionalId"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* License Number */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaIdCard className="text-gray-600 mr-3" />
                  <Field
                    name="licenseNumber"
                    placeholder="License Number"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="licenseNumber"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Organization */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaBuilding className="text-gray-600 mr-3" />
                  <Field
                    name="organization"
                    placeholder="Organization (Optional)"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="organization"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Specialty */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <MdCategory className="text-gray-600 mr-3" />
                  <Field
                    as="select"
                    name="specialty"
                    className="bg-transparent outline-none w-full"
                  >
                    {specialties.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                </div>
                <ErrorMessage
                  name="specialty"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Bio */}
                <div className="flex bg-gray-100 p-3 rounded-md shadow-md">
                  <MdOutlineBiotech className="text-gray-600 mr-3 mt-1" />
                  <Field
                    as="textarea"
                    name="bio"
                    placeholder="Brief professional bio (Optional)"
                    className="bg-transparent outline-none w-full min-h-[80px] resize-none"
                  />
                </div>
                <ErrorMessage
                  name="bio"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Submit Button */}
                <button
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-400 text-white p-3 rounded-md font-semibold"
                >
                  {isSubmitting ? "Registering..." : "Sign Up as Lawyer"}
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="text-center mt-4">
            Already have an account? 
            <span 
              className="text-blue-400 ml-1 cursor-pointer"
              onClick={() => router.push("/lawyerLoginPage")}
            >
              Login!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}