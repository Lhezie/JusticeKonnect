// pages/pendingCases.jsx
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAuthProvider from "../store/authProvider";
import { LawyerLayout } from "../components/LawyerLayout"; // Fixed import with correct casing
import { useRouter } from "next/navigation";
import Loader from "../components/loader";

export default function PendingCases() {
  const { user } = UseAuthProvider();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending cases
  useEffect(() => {
    if (!user) {
      // Redirect if no user
      router.push('/lawyerLoginPage');
      return;
    }

    async function fetchPendingCases() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/lawyer/pending-cases', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Important for sending cookies
        });

        // Handle 404 (API not implemented)
        if (response.status === 404) {
          // Use mock data for development/testing
          setCases([
            {
              id: 101,
              title: "Property Dispute",
              description: "Dispute over property boundaries in residential area",
              issueType: "Property",
              createdAt: new Date().toISOString(),
              client: {
                name: "Alex Williams",
                email: "alex@example.com",
                phone: "555-1234"
              }
            },
            {
              id: 102,
              title: "Contract Breach",
              description: "Client claims breach of service contract by vendor",
              issueType: "Contract",
              createdAt: new Date().toISOString(),
              client: {
                name: "Sarah Miller",
                email: "sarah@example.com",
                phone: "555-5678"
              }
            }
          ]);
          setLoading(false);
          return;
        }

        // Parse response body
        const data = await response.json();

        // Handle different response scenarios
        if (!response.ok) {
          throw new Error(
            data.message || 
            `API returned ${response.status}: ${response.statusText}`
          );
        }

        // Check if data has the expected format
        setCases(data.cases || []);
      } catch (error) {
        console.error("Error fetching pending cases:", error);
        
        // Set specific error message
        setError(
          error.message || 
          "Failed to load pending cases. Please try again later."
        );

        // Show toast notification
        toast.error(
          error.message || 
          "Failed to load pending cases. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPendingCases();
  }, [user, router]);

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

      // Handle 404 (API not implemented)
      if (response.status === 404) {
        // Simulate successful response for development
        toast.success("Case approved successfully (Development mode)");
        setCases(prevCases => prevCases.filter(c => c.id !== caseId));
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API returned ${response.status}`);
      }

      toast.success("Case approved successfully");
      
      // Update local state
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
    } catch (error) {
      console.error("Error approving case:", error);
      toast.error(error.message || "Failed to approve case");
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

      // Handle 404 (API not implemented)
      if (response.status === 404) {
        // Simulate successful response for development
        toast.success("Case rejected (Development mode)");
        setCases(prevCases => prevCases.filter(c => c.id !== caseId));
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API returned ${response.status}`);
      }

      toast.success("Case rejected");
      
      // Update local state
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
    } catch (error) {
      console.error("Error rejecting case:", error);
      toast.error(error.message || "Failed to reject case");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Error state
  if (error) {
    return (
      <LawyerLayout>
        <div className="p-6 text-center">
          <h1 className="text-xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </LawyerLayout>
    );
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
                        Submitted on {formatDate(pendingCase.createdAt)}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      Pending Review
                    </span>
                  </div>
          
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Client Information</h3>
                    <p><span className="font-medium">Name:</span> {pendingCase.client.name}</p>
                    <p><span className="font-medium">Email:</span> {pendingCase.client.email}</p>
                    <p><span className="font-medium">Phone:</span> {pendingCase.client.phone}</p>
                  </div>
          
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Case Details</h3>
                    <p><span className="font-medium">Issue Type:</span> {pendingCase.issueType}</p>
                    <p className="text-gray-700">{pendingCase.description}</p>
                  </div>
          
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