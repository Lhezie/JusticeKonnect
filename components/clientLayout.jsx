// components/clientLayout.jsx
import React, { useState } from "react";
import { ClientNavBar } from "./clientNavBar";
import { ClientSideBarContent } from "./clientSideBarContent";
import { TbMessageFilled } from "react-icons/tb";
import { ChatWindow } from "./chatWindow";
import AssignedLawyers from "./assignedLawyers";
import { TbX } from "react-icons/tb";

export function ClientLayout({ children, clientId }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedLawyerId, setSelectedLawyerId] = useState(null);
  
  const handleOpenChat = (lawyerId) => {
    setSelectedLawyerId(lawyerId);
    setIsChatOpen(true);
  };
  
  return (
    <div className="h-screen flex flex-col relative bg-blue-50">
      <div className="fixed top-0 w-full z-50">
        <ClientNavBar />
      </div>
      <div className="flex-1 flex pt-16">
        <aside className="hidden md:block w-1/4 bg-blue-100 p-4">
          <ClientSideBarContent />
        </aside>
        <main className="flex-1 p-4 overflow-auto">
          {children}
          
          {/* Show assigned lawyers if clientId is provided */}
          {clientId && (
            <AssignedLawyers onOpenChat={handleOpenChat} />
          )}
        </main>
        
        {/* Chat button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-4 right-4 text-5xl text-blue-500"
          >
            <TbMessageFilled aria-label="Chat" />
          </button>
        )}
        
        {/* Chat window */}
        {isChatOpen && selectedLawyerId && (
          <ChatWindow
            clientId={clientId}
            lawyerId={selectedLawyerId}
            onClose={() => {
              setIsChatOpen(false);
              setSelectedLawyerId(null);
            }}
          />
        )}
        
        {/* Lawyer selection for chat */}
        {isChatOpen && !selectedLawyerId && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-blue-100 text-blue-500">
                <h2 className="text-lg font-semibold">Select Lawyer</h2>
                <button onClick={() => setIsChatOpen(false)} aria-label="Close">
                  <TbX size={20} />
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto">
                <AssignedLawyers 
                  onOpenChat={(lawyerId) => {
                    setSelectedLawyerId(lawyerId);
                  }} 
                  compact={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}