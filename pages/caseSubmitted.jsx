// pages/caseSubmitted.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientLayout } from "../components/clientLayout";
import UseAuthProvider from "../store/authProvider";
import Loader from "../components/loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CaseAssignmentStatus from '../components/caseAssignmentStatus';

export default function CaseSubmitted() {
  const router = useRouter();
  const { user } = UseAuthProvider();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get case ID from URL or localStorage
    const caseId = new URLSearchParams(window.location.search).get('id') || 
                   localStorage.getItem('lastSubmittedCaseId');
    
    if (!caseId) {
      // No case ID, redirect to dashboard
      router.push('/clientDashboard');
      return;
    }
    
    async function fetchCaseDetails() {
      try {
        const response = await fetch(`/api/cases/${caseId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        setCaseData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching case details:', error);
        toast.error('Failed to load case details');
        setLoading(false);
      }
    }
    
    fetchCaseDetails();
  }, [router]);
  
  if (!user || loading) {
    return <Loader />;
  }
  
  return (
    <ClientLayout clientId={user?.id}>
      <div className="p-6">
        <ToastContainer />
        
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h1 className="text-xl font-bold text-green-800 mb-2">Case Submitted Successfully!</h1>
          <p className="text-green-700">
            Your case has been successfully submitted and is being processed.
          </p>
        </div>
        
        {caseData && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Case Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Case Type:</p>
                <p className="font-medium">{caseData.issueType}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Submitted On:</p>
                <p className="font-medium">
                  {new Date(caseData.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <p className="text-gray-600">Description:</p>
                <p className="mt-1">{caseData.description}</p>
              </div>
            </div>
            
            <CaseAssignmentStatus caseData={caseData} />
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/clientDashboard')}
            className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500"
          >
            Return to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/appointment')}
            className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500"
          >
            Schedule Appointment
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}