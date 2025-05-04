// components/lawyerLayout.jsx
import React, { useState } from "react";
import { LawyerNavBar } from "./lawyerNavBar";
import { LawyerSideBarContent } from "./lawyerSideBarContent";
import { TbMessageFilled } from "react-icons/tb";
import { ChatWindow } from "./chatWindow";

export function LawyerLayout({ children, lawyerId }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatClientId, setActiveChatClientId] = useState(null);
  
  const handleStartChat = (clientId) => {
    setActiveChatClientId(clientId);
    setIsChatOpen(true);
  };
  
  return (
    <div className="h-screen flex flex-col relative bg-blue-50">
      <div className="fixed top-0 w-full z-50">
        <LawyerNavBar />
      </div>
      <div className="flex-1 flex pt-16">
        <aside className="hidden md:block w-1/4 bg-blue-100 p-4">
          <LawyerSideBarContent />
        </aside>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
        
        {/* Chat Button - Only show if not already in a chat */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-4 right-4 text-5xl text-blue-500"
          >
            <TbMessageFilled aria-label="Chat" />
          </button>
        )}
        
        {/* Chat Window */}
        {isChatOpen && activeChatClientId && (
          <ChatWindow
            clientId={activeChatClientId}
            lawyerId={lawyerId}
            onClose={() => {
              setIsChatOpen(false);
              setActiveChatClientId(null);
            }}
          />
        )}
        
        {/* Chat Window Selection - when no client is selected yet */}
        {isChatOpen && !activeChatClientId && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-blue-100 text-blue-500">
                <h2 className="text-lg font-semibold">Select Client</h2>
                <button onClick={() => setIsChatOpen(false)} aria-label="Close">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto">
                <ClientChatList onSelectClient={handleStartChat} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component to display list of clients for chat
function ClientChatList({ onSelectClient }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch clients on component mount
  React.useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/lawyer/clients');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
          console.error('Failed to fetch clients');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchClients();
  }, []);
  
  if (loading) {
    return <div className="text-center py-4">Loading clients...</div>;
  }
  
  if (clients.length === 0) {
    return <div className="text-center py-4">No clients available for chat</div>;
  }
  
  return (
    <ul className="space-y-2">
      {clients.map(client => (
        <li 
          key={client.id}
          className="p-2 bg-gray-100 rounded-lg hover:bg-blue-100 cursor-pointer"
          onClick={() => onSelectClient(client.id)}
        >
          <div className="font-medium">{client.fullName}</div>
          <div className="text-sm text-gray-500">{client.email}</div>
        </li>
      ))}
    </ul>
  );
}