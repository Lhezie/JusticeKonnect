// pages/lawyerRegisterPage.jsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  BiSolidPhoneCall,
} from "react-icons/bi";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaBriefcase,
  FaCertificate,
} from "react-icons/fa";
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
    professionalId: Yup.string().required("Professional ID is required"),
    licenseNumber: Yup.string().required("License number is required"),
    organization: Yup.string().required("Organization name is required"),
    specialty: Yup.string().required("Specialty is required"),
    bio: Yup.string()
      .min(50, "Bio must be at least 50 characters")
      .required("Bio is required"),
  });

  // Handle Form Submission
  const handleRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        "./api/auth/lawyer/register",
        values,
        { withCredentials: true }
      );

      toast.success("Registration Successful! Please login to continue.");

      setTimeout(() => {
        router.push("/lawyerLoginPage");
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration Failed! Please try again."
      );
    }
    setSubmitting(false);
  };

  return (
    <div>
      <ToastContainer />
      <div
        className="relative min-h-screen bg-cover bg-center flex flex-col justify-center items-center px-4"
        style={{
          backgroundImage: 'url("/allGravel.png")',
        }}
      >
        {/* Optional overlay */}
        <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

        <div className="relative z-10 w-full max-w-md p-6 rounded-lg shadow-lg bg-white">
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

          {/* TABS */}
          <div className="flex justify-between mb-4 text-lg font-semibold relative border-b border-gray-300">
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
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
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
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
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
              organization: "",
              licenseNumber: "",
              specialty: "",
              bio: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleRegister}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Full Name */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaUser className="text-gray-600 mr-3" />
                  <Field
                    type="text"
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
                    type="email"
                    name="email"
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
                    type={showPassword ? "text" : "password"}
                    name="password"
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
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
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
                    type="text"
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
                    type="text"
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

                {/* Organization */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaBriefcase className="text-gray-600 mr-3" />
                  <Field
                    type="text"
                    name="organization"
                    placeholder="Organization Name"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
                <ErrorMessage
                  name="organization"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* License Number */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <FaCertificate className="text-gray-600 mr-3" />
                  <Field
                    type="text"
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

                {/* Specialty */}
                <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                  <Field
                    as="select"
                    name="specialty"
                    className="bg-transparent outline-none w-full py-2 px-1 text-gray-700"
                  >
                    <option value="" disabled selected className="">
                      Select your specialty
                    </option>
                    <option value="criminal">Criminal Law</option>
                    <option value="family">Family Law</option>
                    <option value="corporate">Corporate Law</option>
                    <option value="tax">Tax Law</option>
                    <option value="property">Property Law</option>
                    <option value="civil">Civil Litigation</option>
                    <option value="immigration">Immigration Law</option>
                    <option value="environmental">Environmental Law</option>
                    <option value="other">Other</option>
                  </Field>
                </div>
                <ErrorMessage
                  name="specialty"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Bio */}
                <div className="flex flex-col bg-gray-100 p-3 rounded-md shadow-md">
                  <Field
                    as="textarea"
                    name="bio"
                    placeholder="Professional Bio (min 50 characters)"
                    rows="4"
                    className="bg-transparent outline-none w-full resize-none"
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
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-md font-semibold transition-all"
                >
                  {isSubmitting ? "Registering..." : "Sign Up as Lawyer"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
