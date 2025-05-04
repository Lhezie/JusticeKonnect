// components/caseAssignmentStatus.jsx
import React from 'react';

export default function CaseAssignmentStatus({ caseData }) {
  if (!caseData) {
    return null;
  }
  
  // Determine status
  const status = caseData.status || 'pending';
  const assignedLawyer = caseData.lawyer?.user?.fullName || 'Not assigned';
  
  // Status color
  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-blue-100 text-blue-800'
  };
  
  const colorClass = statusColors[status] || statusColors.pending;
  
  return (
    <div className="mt-2 p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Case Status</h3>
      
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Assigned Lawyer:</span>
          <span className="font-medium">{assignedLawyer}</span>
        </div>
        
        {caseData.lawyer?.user?.email && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Lawyer Email:</span>
            <span className="text-sm">{caseData.lawyer.user.email}</span>
          </div>
        )}
        
        {caseData.lawyer?.specialty && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Specialty:</span>
            <span className="text-sm">{caseData.lawyer.specialty}</span>
          </div>
        )}
      </div>
    </div>
  );
}