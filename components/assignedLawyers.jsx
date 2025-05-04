// components/assignedLawyers.jsx - simplified version
import React, { useEffect, useState } from 'react';
import { TbMessageFilled } from "react-icons/tb";

export default function AssignedLawyers({ onOpenChat }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false to avoid spinner
  
  // Use mock data for now until API is implemented
  useEffect(() => {
    // Mock data for development
    const mockLawyers = [
      {
        id: 1,
        userId: 101,
        fullName: "Jane Smith, Esq.",
        email: "jane.smith@example.com",
        specialty: "Family Law",
        cases: [{ id: 1, title: "Custody Case" }]
      },
      {
        id: 2,
        userId: 102,
        fullName: "John Doe, Esq.",
        email: "john.doe@example.com",
        specialty: "Criminal Law",
        cases: [{ id: 2, title: "Property Dispute" }]
      }
    ];
    
    // Simulate API fetch
    setTimeout(() => {
      setLawyers(mockLawyers);
      setLoading(false);
    }, 500);
  }, []);
  
  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="text-md md:text-lg font-semibold">Your Lawyers</h2>
        <div className="mt-2 p-4 text-center">Loading...</div>
      </div>
    );
  }
  
  if (lawyers.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-md md:text-lg font-semibold">Your Lawyers</h2>
        <div className="mt-2 p-4 text-center text-gray-500">
          No lawyers assigned to your cases yet.
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <h2 className="text-md md:text-lg font-semibold">Your Lawyers</h2>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {lawyers.map(lawyer => (
          <div 
            key={lawyer.id}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{lawyer.fullName}</h3>
                <p className="text-sm text-gray-600">{lawyer.specialty}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {lawyer.cases.length} {lawyer.cases.length === 1 ? 'case' : 'cases'} assigned
                </p>
              </div>
              <button
                onClick={() => onOpenChat(lawyer.userId)}
                className="text-blue-500 hover:text-blue-700"
                title="Chat with lawyer"
              >
                <TbMessageFilled size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}