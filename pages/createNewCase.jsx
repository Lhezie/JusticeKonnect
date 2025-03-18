import React from "react";
import ClientLayout from "../components/clientLayout";
import { IoIosArrowDropleft } from "react-icons/io";
import { Button, SelectInput } from "../components/clientComponent";
import issueTypeProvider from "../store/useIssueTypeProvider";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// validation schema
const validationSchema = Yup.object().shape({
  issueType: Yup.string().required("Issue Type is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  zipCode: Yup.string().required("Zip Code is required"),
  country: Yup.string().required("Country is required"),
  caseDescription: Yup.string().required("Case Description is required"),
  additionalInfo: Yup.mixed()
    .required("A PDF file is required")
    .test("fileType", "Only PDF files are allowed", (value) => {
      return value && value.type === "application/pdf";
    })
    .test("fileSize", "PDF file must be less than 5MB", (value) => {
      return value && value.size <= 5 * 1024 * 1024;
    }),
});

//Handle form submission
const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    const formData = new FormData();
    formData.append("issueType", values.issueType);
    formData.append("address", values.address);
    formData.append("city", values.city);
    formData.append("zipCode", values.zipCode);
    formData.append("country", values.country);
    formData.append("caseDescription", values.caseDescription);
    formData.append("additionalInfo", values.additionalInfo);

    await axios.post("http://localhost:5000/api/upload", formData, {
      withCredentials: true,
    });

    toast.success("Submitted successfully!");
    resetForm();
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Case submission failed! Please try again."
    );
  }
  setSubmitting(false);
};

const CreateNewCase = () => {
  const { issueTypes } = issueTypeProvider();
  return (
    <div>
      <ToastContainer />
      <ClientLayout>
        <div className="pt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="font-bold text-lg">
              <IoIosArrowDropleft />
            </div>
            <div>Submit a New Case</div>
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
            {({ formik, isSubmitting, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Issue Type */}
                <SelectInput
                  label="Issue Type"
                  name="issueType"
                  options={issueTypes}
                  formik={formik}
                  className="h-[38px]"
                />
                <ErrorMessage
                  name="issueType"
                  component="div"
                  className="text-red-500 text-sm"
                />

                <div className="md:flex w-full gap-3">
                   {/* Address */}
                <div className="w-full">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    className="h-[38px] w-full px-2  p-[6px] placeholder:text-sm shadow-md rounded-md text-black placeholder:text-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 "
                  />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* City */}
                <div className="text-sm w-full pt-4 md:pt-0">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className=" h-[38px] w-full   p-[6px] placeholder:text-sm shadow-md rounded-md text-black placeholder:text-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
               </div>

                {/* Zip Code */}
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip Code"
                  className=" h-[38px] w-full md:w-1/2 p-[6px] placeholder:text-sm shadow-md rounded-md text-black placeholder:text-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ErrorMessage
                  name="zipCode"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* Country */}
                <div>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    className="h-[38px] w-full md:w-1/2 p-[6px] placeholder:text-sm shadow-md rounded-md text-black placeholder:text-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Case Description */}
                <textarea
                  name="caseDescription"
                  placeholder="Summarize the Issue"
                  className="w-full h-32 md:w-1/2 p-[6px] placeholder:text-sm shadow-md rounded-md text-black placeholder:text-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ErrorMessage
                  name="caseDescription"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/*handling file upload*/}
                <div>
                <input
                  type="file"
                  name="additionalInfo"
                  accept="application/pdf"
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    setFieldValue("additionalInfo", file);
                  }}
                  className=" h-[38px] w-full md:w-1/2 p-[6px] placeholder:text-sm shadow-md rounded-md text-black placeholder:text-black bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <ErrorMessage
                  name="additionalInfo"
                  component="div"
                  className="text-red-500 text-sm"
                />
                </div>


                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={formik.isSubmitting} // Pass Formik's isSubmitting state
                  disabled={formik.isSubmitting}
                  className="w-full bg-blue-400 text-white p-3 rounded-md font-semibold"
                >
                  Submit Case
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </ClientLayout>
    </div>
  );
};

export default CreateNewCase;
