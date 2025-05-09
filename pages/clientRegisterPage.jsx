// pages/clientRegisterPage.jsx
// "use client"; // Ensure client-side rendering
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { BiSolidPhoneCall } from "react-icons/bi";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

export default function ClientRegisterPage() {
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
  });

  // Handle Form Submission
  // Inside ClientRegisterPage component
const handleRegister = async (values, { setSubmitting, resetForm }) => {
  try {
    await axios.post(
      "/api/auth/clientregister", // `
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // 
      }
    );

    toast.success("Registration Successful! Redirecting...");
    resetForm();
    setTimeout(() => router.push("/clientLoginPage"), 2000);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Registration Failed! Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div>
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
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
          <div className="flex justify-between mb-4 text-lg font-semibold border-b border-gray-300 relative">
            <button
              onClick={() => router.push("/clientRegisterPage")}
              className={`w-1/2 text-center pb-2 ${
                pathname === "/clientRegisterPage"
                  ? "text-black font-bold"
                  : "text-gray-500"
              }`}
            >
              SIGN UP
              {pathname === "/clientRegisterPage" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />
              )}
            </button>
            <button
              onClick={() => router.push("/clientLoginPage")}
              className={`w-1/2 text-center pb-2 ${
                pathname === "/clientLoginPage"
                  ? "text-black font-bold"
                  : "text-gray-500"
              }`}
            >
              LOGIN
              {pathname === "/clientLoginPage" && (
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

                {/* Submit Button */}
                <button
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-400 text-white p-3 rounded-md font-semibold"
                >
                  {isSubmitting ? "Registering..." : "Sign Up"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
