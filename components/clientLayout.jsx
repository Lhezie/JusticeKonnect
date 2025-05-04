import React, { useState } from "react";
import { ClientNavBar } from "./clientNavBar";
import { ClientSideBarContent } from "./clientSideBarContent";
import { TbMessageFilled } from "react-icons/tb";
import { ChatWindow } from "./chatWindow";

export function ClientLayout({ children, clientId, lawyerId }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <div className="h-screen flex flex-col relative bg-blue-50">
      <div className="fixed top-0 w-full z-50">
        <ClientNavBar />
      </div>
      <div className="flex-1 flex pt-16">
        <aside className="hidden md:block w-1/4 bg-blue-100 p-4">
          <ClientSideBarContent />
        </aside>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
        <button
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-4 right-4 text-5xl text-blue-500"
        >
          <TbMessageFilled aria-label="Chat" />
        </button>
        {isChatOpen && (
          <ChatWindow
            clientId={clientId}
            lawyerId={lawyerId}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
