// pages/createNewCase.jsx
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ClientLayout } from "../components/clientLayout";
import UseAuthProvider from "../store/authProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function CreateNewCase() {
  const { user } = UseAuthProvider();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      issueType: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Case title is required"),
      description: Yup.string().required("Case description is required"),
      issueType: Yup.string().required("Issue type is required"),
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      zipCode: Yup.string().required("Zip code is required"),
      country: Yup.string().required("Country is required"),
    }),
    onSubmit: async (values) => {
      if (!user) {
        toast.error("You must be logged in to create a case");
        return;
      }
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Skip file upload for now and just create the case
        console.log("Creating case with values:", values);
        
        // Create case with current timestamps and skip file upload
        const response = await fetch("/api/cases/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            additionalInfo: fileUpload ? fileUpload.name : "",
            clientId: user?.id || null
          }),
        });
        
        // Parse the response
        let responseData;
        try {
          const textResponse = await response.text();
          // Try to parse as JSON, but handle non-JSON responses
          responseData = textResponse ? JSON.parse(textResponse) : {};
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          responseData = { message: "Invalid server response" };
        }
        
        if (!response.ok) {
          console.error("Error response:", response.status, responseData);
          throw new Error(responseData.message || `Server error: ${response.status}`);
        }
        
        console.log("Case created successfully:", responseData);
        
        toast.success("Case created successfully!");
        setTimeout(() => {
          router.push("/clientDashboard");
        }, 2000);
        
      } catch (error) {
        console.error("Error creating case:", error);
        const errorMessage = error.message || "Failed to create case";
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
      setFileUpload(file);
    }
  };

  return (
    <ClientLayout clientId={user?.id}>
      <div className="p-4">
        <ToastContainer />
        <h1 className="text-xl font-bold mb-4">Create New Case</h1>
        
        {submitError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p className="font-bold">Error</p>
            <p>{submitError}</p>
            <p className="text-sm mt-2">Please try again or contact support if the problem persists.</p>
          </div>
        )}
        
        <form onSubmit={formik.handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="title">Case Title</label>
            <input
              type="text"
              id="title"
              name="title"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="issueType">Issue Type</label>
            <select
              id="issueType"
              name="issueType"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.issueType}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            >
              <option value="">Select Issue Type</option>
              <option value="property_theft">Property Theft</option>
              <option value="domestic_violence">Domestic Violence</option>
              <option value="contract_dispute">Contract Dispute</option>
              <option value="employment_issue">Employment Issue</option>
              <option value="other">Other</option>
            </select>
            {formik.touched.issueType && formik.errors.issueType && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.issueType}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="description">Case Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            ></textarea>
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.address}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.city}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
              {formik.touched.city && formik.errors.city && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.city}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="zipCode">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.zipCode}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
              {formik.touched.zipCode && formik.errors.zipCode && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.zipCode}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.country}
                className="w-full p-2 border border-gray-300 rounded bg-white"
              />
              {formik.touched.country && formik.errors.country && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.country}</p>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="fileUpload">
              Supporting Documents (Optional)
            </label>
            <p className="text-xs text-amber-600 mb-2">
              Note: File upload is temporarily disabled. Files will be linked by name only.
            </p>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
            />
            {fileUpload && (
              <p className="text-sm text-gray-600 mt-1">
                Selected file: {fileUpload.name} ({Math.round(fileUpload.size / 1024)} KB)
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded transition`}
          >
            {isSubmitting ? "Submitting..." : "Submit Case"}
          </button>
        </form>
      </div>
    </ClientLayout>
  );
}