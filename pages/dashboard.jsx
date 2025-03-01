import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Dashboard = () => {
  
    const formik = useFormik({
    initialValues: { caseTitle: '', caseDescription: '' },
    validationSchema: Yup.object({
      caseTitle: Yup.string().required('Case Title is required'),
      caseDescription: Yup.string().required('Case Description is required'),
    }),
    onSubmit: (values) => {
      console.log('Form Data:', values);
    },
  });

  const caseOverviewData = [
    { label: 'Submitted Cases', count: 10, active: true },
    { label: 'Cases Under Review', count: 5, active: false },
    { label: 'Approved Cases', count: 4, active: false },
  ];

  const testimonials = [
    { id: 1, text: 'I am glad I came in contact with Justice Connect...', author: 'Jane Doe, 41 Abuja', avatar: 'https://via.placeholder.com/50' },
    { id: 2, text: 'I am glad I came in contact with Justice Connect...', author: 'Jane Doe, 41 Abuja', avatar: 'https://via.placeholder.com/50' },
    { id: 3, text: 'I am glad I came in contact with Justice Connect...', author: 'Jane Doe, 41 Abuja', avatar: 'https://via.placeholder.com/50' },
  ];

  const quickActions = [
    { label: 'Submit a New Case', primary: true },
    { label: 'Schedule Appointment' },
    { label: 'Send Message' },
    { label: 'Make a Call' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl font-bold">Hi, John Doe</h1>
      <p className="text-gray-500">Tue Jan 24, 2025</p>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Case Overview</h2>
        <div className="grid grid-cols-3 gap-4  mt-2 justify-center">
          {caseOverviewData.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg text-center flex flex-col items-center justify-center transition-all duration-300 ${
                item.active ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              <p className="text-lg font-medium">{item.label}</p>
              <p className="text-3xl font-bold">{item.count}</p>
            </div>
          ))}
        </div>
      </div>


      <div className="mt-6">
        <h2 className="text-lg font-semibold">Testimonials</h2>
        <div className="flex gap-4 overflow-x-auto mt-2">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="p-4 bg-gray-200 rounded-lg min-w-[200px]">
              <p className="italic">{testimonial.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={testimonial.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-sm text-gray-700">{testimonial.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`p-3 rounded-lg ${action.primary ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Example with Formik + Yup */}
      <form onSubmit={formik.handleSubmit} className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Submit New Case</h3>

        {/* <div className="mt-4">
          <label className="block">Case Title</label>
          <input
            type="text"
            name="caseTitle"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.caseTitle}
            className="border p-2 w-full rounded"
          />
          {formik.touched.caseTitle && formik.errors.caseTitle && (
            <p className="text-red-500 text-sm">{formik.errors.caseTitle}</p>
          )}
        </div> */}

        {/* <div className="mt-4">
          <label className="block">Case Description</label>
          <textarea
            name="caseDescription"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.caseDescription}
            className="border p-2 w-full rounded"
          />
          {formik.touched.caseDescription && formik.errors.caseDescription && (
            <p className="text-red-500 text-sm">{formik.errors.caseDescription}</p>
          )}
        </div> */}

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded w-full"
        >
          Submit Case
        </button>
      </form>
    </div>
  );
};

export default Dashboard;
