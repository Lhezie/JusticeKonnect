// components/assignedLawyers.jsx
import React, { useEffect, useState } from 'react';
import { TbMessageFilled } from "react-icons/tb";
import UseAuthProvider from "../store/authProvider";

export default function AssignedLawyers({ onOpenChat, compact = false }) {
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseApproved, setCaseApproved] = useState(false);
  const { user } = UseAuthProvider();
  
  useEffect(() => {
    async function fetchAssignedLawyer() {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Make API call to get assigned lawyer (single lawyer, not multiple)
        const response = await fetch('/api/client/case-lawyer', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set case approval status
        setCaseApproved(data.case?.status === 'APPROVED');
        
        // Set lawyer data if available
        if (data.success && data.lawyer) {
          setLawyer({
            id: data.lawyer.id,
            userId: data.lawyer.id,
            fullName: data.lawyer.name,
            email: data.lawyer.email,
            specialty: data.lawyer.specialty,
            organization: data.lawyer.organization || null,
            caseStatus: data.case?.status || null,
            caseTitle: data.case?.title || null
          });
        } else {
          setLawyer(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assigned lawyer:", err);
        setError("Failed to load your assigned lawyer. Please try again later.");
        setLoading(false);
      }
    }
    
    fetchAssignedLawyer();
  }, [user]);
  
  if (loading) {
    return (
      <div className={`mt-${compact ? '2' : '6'}`}>
        <h2 className="text-md md:text-lg font-semibold">Your Lawyer</h2>
        <div className="mt-2 p-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`mt-${compact ? '2' : '6'}`}>
        <h2 className="text-md md:text-lg font-semibold">Your Lawyer</h2>
        <div className="mt-2 p-4 bg-red-50 text-red-600 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-500 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // If no lawyer is assigned yet
  if (!lawyer) {
    return (
      <div className={`mt-${compact ? '2' : '6'}`}>
        <h2 className="text-md md:text-lg font-semibold">Your Lawyer</h2>
        <div className="mt-2 p-4 text-center text-gray-500 bg-white rounded-lg shadow">
          No lawyer assigned yet. Submit a case to be assigned a lawyer.
        </div>
      </div>
    );
  }
  
  return (
    <div className={`mt-${compact ? '2' : '6'}`}>
      <h2 className="text-md md:text-lg font-semibold">Your Lawyer</h2>
      <div className="mt-2 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{lawyer.fullName}</h3>
            <p className="text-sm text-gray-600">{lawyer.specialty}</p>
            {lawyer.organization && (
              <p className="text-xs text-gray-500 mt-1">{lawyer.organization}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{lawyer.email}</p>
            
            {lawyer.caseTitle && (
              <p className="text-xs mt-2">
                Case: {lawyer.caseTitle}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  lawyer.caseStatus === 'APPROVED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lawyer.caseStatus}
                </span>
              </p>
            )}
          </div>
          
          {/* Only show chat button if case is approved */}
          {caseApproved && (
            <button
              onClick={() => onOpenChat(lawyer.userId)}
              className="text-blue-500 hover:text-blue-700 flex flex-col items-center"
              title="Chat with lawyer"
            >
              <TbMessageFilled size={24} />
              <span className="text-xs">Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}