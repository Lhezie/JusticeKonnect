"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import useAuth from "../store/authProvider.jsx";  // 

export default function ClientLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);  // 
  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  // Handle form submit
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      //  POST to your login API (cookies are set server-side)
      const { data } = await axios.post(
        "https://justicekonnectapp.onrender.com/api/auth/clientlogin",
        values,
        {
          withCredentials: true,  //  Accepted cookies in the(e.g sessionUserId)

        }
      );

      // Save user and token into Zustand store
      setAuth({ user: data.user });

      toast.success("Login Successful! Redirecting...");
      setTimeout(() => router.push("/clientDashboard"), 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed! Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen px-4">
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
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
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

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-400 text-white p-3 rounded-md font-semibold"
                >
                  {isSubmitting ? "Logging In..." : "Log In"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
