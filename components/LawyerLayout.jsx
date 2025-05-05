// components/LawyerLayout.jsx
import React, { useState } from "react";
import { LawyerNavBar } from "./lawyerNavBar";
import { LawyerSideBarContent } from "./lawyerSideBarContent";
import { TbMessageFilled } from "react-icons/tb";
import { ChatWindow } from "./chatWindow";
import { ClientChatList } from "./clientChatList";
import { TbX } from "react-icons/tb";

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
            className="fixed bottom-4 right-4 text-5xl text-blue-500"
            aria-label="Chat"
          >
            <TbMessageFilled />
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
                  <TbX size={20} />
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