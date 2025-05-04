// pages/createNewCase.jsx
"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClientLayout } from "../components/clientLayout";
import { IoIosArrowDropleft } from "react-icons/io";
import { Button, SelectInput } from "../components/clientComponent";
import useIssueTypeProvider from "../store/useIssueTypeProvider";
import { useRouter } from "next/navigation";
import UseAuthProvider from "../store/authProvider";
import { useEffect } from "react";

export default function CreateNewCase() {
  const router = useRouter();
  const { issueTypes = [] } = useIssueTypeProvider();
  const { user, loading } = UseAuthProvider();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to submit a case");
      router.push("/clientLoginPage");
    }
  }, [user, loading, router]);

  const validationSchema = Yup.object().shape({
    issueType: Yup.string().required("Issue Type is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    zipCode: Yup.string().required("Zip Code is required"),
    country: Yup.string().required("Country is required"),
    caseDescription: Yup.string().required("Case Description is required"),
    additionalInfo: Yup.mixed()
      .required("A PDF file is required")
      .test(
        "fileType",
        "Only PDF files are allowed",
        (file) => file?.type === "application/pdf"
      )
      .test(
        "fileSize",
        "PDF must be less than 5MB",
        (file) => file?.size <= 5 * 1024 * 1024
      ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const {
      issueType,
      address,
      city,
      zipCode,
      country,
      caseDescription,
      additionalInfo,
    } = values;

    // guard against missing file
    if (!additionalInfo) {
      toast.error("Please select a PDF before submitting.");
      setSubmitting(false);
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast.error("You must be logged in to submit a case.");
      router.push("/clientLoginPage");
      setSubmitting(false);
      return;
    }

    console.log("🚀 submitting values:", values);

    const formData = new FormData();
    formData.append("issueType", issueType);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("zipCode", zipCode);
    formData.append("country", country);
    formData.append("caseDescription", caseDescription);
    formData.append("additionalInfo", additionalInfo); // this is the File

    try {
      // Check for token (debug only)
      const cookies = document.cookie;
      console.log("Cookies available:", cookies.includes("token"));
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Important: include credentials
      });
      
      if (res.status === 401) {
        toast.error("Authentication failed. Please log in again.");
        router.push("/clientLoginPage");
        setSubmitting(false);
        return;
      }
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed");

      toast.success("Submitted successfully!");
      resetForm();
      document.getElementById("fileInput").value = "";
      
      // Redirect to dashboard after successful submission
      router.push('/clientDashboard?refresh=true');
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "An error occurred during submission");
    } finally {
      setSubmitting(false);
    }
  };

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <ClientLayout>
        <div className="pt-6 text-sm">
          <div className="flex items-center gap-2 mb-4">
            <IoIosArrowDropleft className="text-lg font-bold" />
            Submit a New Case
          </div>

          <Formik
            initialValues={{
              issueType: "",
              address: "",
              city: "",
              zipCode: "",
              country: "",
              caseDescription: "",
              additionalInfo: null,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                {/* Issue Type */}
                <SelectInput
                  label="Issue Type"
                  name="issueType"
                  placeholder="Select Issue Type"
                  options={issueTypes.map((t) => ({
                    value: t.value,
                    label: t.label,
                  }))}
                />
                <ErrorMessage
                  name="issueType"
                  component="div"
                  className="text-red-500 text-xs"
                />

                {/* Address / City */}
                <div className="md:flex gap-3">
                  <div className="w-full">
                    <Field
                      name="address"
                      placeholder="Address"
                      className="px-4 h-[38px] w-full rounded-md bg-gray-200 focus:ring-2 focus:ring-blue-400"
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                  <div className="w-full">
                    <Field
                      name="city"
                      placeholder="City"
                      className="px-4 h-[38px] w-full rounded-md bg-gray-200 focus:ring-2 focus:ring-blue-400"
                    />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                </div>

                {/* Zip / Country */}
                <div className="md:flex gap-3">
                  <div className="w-full">
                    <Field
                      name="zipCode"
                      placeholder="Zip Code"
                      className="px-4 h-[38px] w-full rounded-md bg-gray-200 focus:ring-2 focus:ring-blue-400"
                    />
                    <ErrorMessage
                      name="zipCode"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                  <div className="w-full">
                    <Field
                      name="country"
                      placeholder="Country"
                      className="px-4 h-[38px] w-full rounded-md bg-gray-200 focus:ring-2 focus:ring-blue-400"
                    />
                    <ErrorMessage
                      name="country"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Field
                    as="textarea"
                    name="caseDescription"
                    placeholder="Summarize the Issue"
                    className="px-4 w-full h-32 rounded-md bg-gray-200 focus:ring-2 focus:ring-blue-400"
                  />
                  <ErrorMessage
                    name="caseDescription"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <input
                    id="fileInput"
                    name="additionalInfo"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setFieldValue("additionalInfo", e.currentTarget.files[0])
                    }
                    className="px-4 h-[38px] w-full rounded-md bg-gray-200 focus:ring-2 focus:ring-blue-400"
                  />
                  <ErrorMessage
                    name="additionalInfo"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Submit Button */}
                <button
                  className="bg-blue-400 text-white p-3 rounded-xl font-semibold w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting…" : "Submit Case"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </ClientLayout>
    </div>
  );
}