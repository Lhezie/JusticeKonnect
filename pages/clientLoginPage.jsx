"use client"; // Ensures client-side rendering

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import Image from "next/image";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";


export default function ClientLoginPage() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route to highlight the correct tab

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // yup validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
     .email("Invalid email address")
     .required("Email is required"),
    password: Yup.string()
     .min(8, "Password must be at least 8 characters long")
     .required("Password is required"),
  });

  // Formik
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [errors, setErrors] = useState({});

  // Formik FormikBag

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle Form Submit
  const handleSubmit = async (values, {setSubmitting}) => {
    try {
      const response = await axios.post('/api/auth/clientlogin', values, { withCredentials: true, });
      toast.success("Login Successful! Redirecting...");

      setTimeout(() => {
        router.push("/clientDashboard"); // Redirect to dashboard after login
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed! Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex justify-center items-center min-h-screen h-fit px-4">
                <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
                    {/* LOGO */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                            <Image src="/LogoOnee.png" width={96} height={96} alt="Logo" className="object-contain" />
                        </div>
                    </div>

                    {/* TABS WITH ACTIVE UNDERLINE */}
                    <div className="flex justify-between mb-4 text-lg font-semibold relative border-b border-gray-300">
                        <button
                            onClick={() => router.push("/clientRegisterPage")}
                            className={`w-1/2 text-center pb-2 relative ${pathname === "/clientRegisterPage" ? "text-black font-bold" : "text-gray-500"}`}
                        >
                            SIGN UP
                            {pathname === "/clientRegisterPage" && <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />}
                        </button>

                        <button
                            onClick={() => router.push("/clientLoginPage")}
                            className={`w-1/2 text-center pb-2 relative ${pathname === "/clientLoginPage" ? "text-black font-bold" : "text-gray-500"}`}
                        >
                            LOGIN
                            {pathname === "/clientLoginPage" && <div className="absolute bottom-0 left-0 w-full h-1 bg-black" />}
                        </button>
                    </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                <FaEnvelope className="text-gray-600 mr-3" />
                <Field
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="bg-transparent outline-none w-full inputblack"
                />
              </div>
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />

              <div className="relative flex items-center bg-gray-100 p-3 rounded-md shadow-md">
                <FaLock className="text-gray-600 mr-3" />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="bg-transparent outline-none w-full inputblack"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-400 text-white p-3 rounded-md font-semibold"
              >
                {isSubmitting ? "Logging In..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>
        </div>
            </div>
        </div>
    );
}
