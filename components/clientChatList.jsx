// components/ClientChatList.jsx
import React, { useEffect, useState } from 'react';
import UseAuthProvider from "../store/authProvider";

export function ClientChatList({ onSelectClient }) {
  const { user } = UseAuthProvider();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user || user.role !== 'lawyer') return;
    
    async function fetchClients() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/lawyer/clients', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        setClients(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients. Please try again.');
        setLoading(false);
        
        // Use mock data in development for easier testing
        if (process.env.NODE_ENV === 'development') {
          setClients([
            {
              id: 101,
              fullName: "John Smith",
              email: "john@example.com",
              cases: 2
            },
            {
              id: 102,
              fullName: "Jane Doe",
              email: "jane@example.com",
              cases: 1
            }
          ]);
          setLoading(false);
        }
      }
    }
    
    fetchClients();
  }, [user]);
  
  if (loading) {
    return <div className="p-4 text-center">Loading clients...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!clients || clients.length === 0) {
    return <div className="p-4 text-center">No clients found.</div>;
  }
  
  return (
    <ul className="space-y-2">
      {clients.map(client => (
        <li 
          key={client.id}
          className="p-3 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          onClick={() => onSelectClient(client.id)}
        >
          <div className="font-medium">{client.fullName}</div>
          <div className="text-sm text-gray-600">{client.email}</div>
          <div className="text-xs mt-1">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {client.cases} {client.cases === 1 ? 'case' : 'cases'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}