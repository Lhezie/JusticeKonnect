// pages/pendingCases.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";
import { LawyerLayout } from "../components/lawyerLayout";
import { useRouter } from "next/navigation";
import Loader from "../components/loader";

export default function PendingCases() {
  const { user } = UseAuthProvider();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending cases
  useEffect(() => {
    if (!user) return;

    async function fetchPendingCases() {
      try {
        const response = await fetch('/api/lawyer/pending-cases', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        setCases(data.cases || []);
      } catch (error) {
        console.error("Error fetching pending cases:", error);
        toast.error("Failed to load pending cases");
      } finally {
        setLoading(false);
      }
    }

    fetchPendingCases();
  }, [user]);

  // Handle case approval
  const handleApproveCase = async (caseId) => {
    try {
      const response = await fetch('/api/lawyer/approve-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      toast.success("Case approved successfully");
      
      // Update local state
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
    } catch (error) {
      console.error("Error approving case:", error);
      toast.error("Failed to approve case");
    }
  };

  // Handle case rejection
  const handleRejectCase = async (caseId) => {
    try {
      const response = await fetch('/api/lawyer/reject-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      toast.success("Case rejected");
      
      // Update local state
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
    } catch (error) {
      console.error("Error rejecting case:", error);
      toast.error("Failed to reject case");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <LawyerLayout>
      <div className="p-6">
        <ToastContainer />
        <h1 className="text-xl font-bold mb-6">Pending Cases</h1>

        {cases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No pending cases found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {cases.map((pendingCase) => (
              <div key={pendingCase.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold">{pendingCase.title}</h2>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(pendingCase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      Pending Review
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Client Information</h3>
                    <p><span className="font-medium">Name:</span> {pendingCase.client.user.fullName}</p>
                    <p><span className="font-medium">Email:</span> {pendingCase.client.user.email}</p>
                    <p><span className="font-medium">Location:</span> {pendingCase.city}, {pendingCase.country}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Case Description</h3>
                    <p className="text-gray-700">{pendingCase.description}</p>
                  </div>

                  {pendingCase.additionalInfo && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Additional Documents</h3>
                      <a 
                        href={`/uploads/${pendingCase.additionalInfo}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        View Document
                      </a>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => handleRejectCase(pendingCase.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveCase(pendingCase.id)}
                      className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LawyerLayout>
  );
}