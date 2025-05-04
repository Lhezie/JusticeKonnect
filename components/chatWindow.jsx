// components/chatWindow.jsx
import React, { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";
import { useChatStore } from "../store/chatStore";
import { TbSend } from "react-icons/tb";
import { chatService } from "../utils/chatService";

export function ChatWindow({ clientId, lawyerId, onClose }) {
  const { messages, loadMessages, sendMessage } = useChatStore();
  const [client, setClient] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockClient, setIsMockClient] = useState(false);

  useEffect(() => {
    let unmounted = false;
    let messageHandler = null;
    
    async function initChat() {
      try {
        setLoading(true);
        
        // 1. Load messages from database first
        await loadMessages({ clientId, lawyerId });
        
        // 2. Initialize Twilio client
        const currentUserId = clientId; // The current user's ID
        const twilioClient = await chatService.getClient(currentUserId);
        
        if (unmounted) return;
        
        setClient(twilioClient);
        setIsMockClient(twilioClient.isMock);
        
        // 3. Get or create conversation
        const chatConversation = await chatService.getConversation(
          twilioClient,
          clientId,
          lawyerId
        );
        
        if (unmounted) return;
        
        setConversation(chatConversation);
        
        // 4. Join the conversation if needed
        try {
          await chatConversation.join();
        } catch (err) {
          // Already joined or using mock client, ignore
          console.log("Join conversation result:", err);
        }
        
        // 5. Load message history
        if (!twilioClient.isMock) {
          const messagePage = await chatConversation.getMessages();
          setLocalMessages(messagePage.items || []);
          
          // 6. Set up message listener
          messageHandler = (msg) => {
            setLocalMessages((prev) => [...prev, msg]);
          };
          
          chatConversation.on("messageAdded", messageHandler);
        } else {
          // Using mock client, load messages from database
          setLocalMessages(
            messages.map(msg => ({
              author: msg.senderId.toString(),
              body: msg.content,
              dateCreated: new Date(msg.createdAt),
              index: msg.id
            }))
          );
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Chat initialization error:", err);
        if (!unmounted) {
          setError("Failed to initialize chat. Please try again later.");
          setLoading(false);
        }
      }
    }
    
    initChat();
    
    return () => {
      unmounted = true;
      
      // Remove message listener
      if (conversation && messageHandler) {
        conversation.removeListener("messageAdded", messageHandler);
      }
      
      // Shut down Twilio client
      if (client && !client.isMock) {
        client.shutdown();
      }
    };
  }, [clientId, lawyerId, loadMessages, messages]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    
    try {
      // 1. Store message in database first
      await sendMessage({
        senderId: parseInt(clientId),
        receiverId: parseInt(lawyerId),
        content: draft.trim(),
      });
      
      // 2. Send through Twilio if available
      if (conversation && !isMockClient) {
        await conversation.sendMessage(draft.trim());
      } else {
        // Using mock client, update local state
        const mockMessage = {
          author: clientId.toString(),
          body: draft.trim(),
          dateCreated: new Date(),
          index: Date.now()
        };
        
        setLocalMessages(prev => [...prev, mockMessage]);
      }
      
      setDraft("");
    } catch (err) {
      console.error("Error sending message:", err);
      
      // Show error but don't clear draft so user can retry
      alert("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-blue-100 text-blue-500">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button onClick={onClose} aria-label="Close chat">
              <TbX size={20} />
            </button>
          </div>
          <div className="flex-1 p-3 flex items-center justify-center">
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-blue-100 text-blue-500">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button onClick={onClose} aria-label="Close chat">
              <TbX size={20} />
            </button>
          </div>
          <div className="flex-1 p-3 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-blue-100 text-blue-500">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button onClick={onClose} aria-label="Close chat">
            <TbX size={20} />
          </button>
        </div>
        
        {isMockClient && (
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs">
            Using local messaging (Twilio unavailable)
          </div>
        )}
        
        <div className="flex-1 p-3 overflow-y-auto bg-blue-50 space-y-2">
          {localMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            localMessages.map((msg, idx) => (
              <div
                key={msg.index || idx}
                className={`p-2 rounded ${
                  msg.author === clientId.toString()
                    ? "bg-blue-100 self-end ml-auto"
                    : "bg-gray-100 self-start mr-auto"
                } max-w-[80%]`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {msg.author === clientId.toString() ? 'You' : 'Lawyer'}
                </div>
                <div>{msg.body}</div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 bg-blue-50 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="bg-white flex-1 border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={handleSend}
            aria-label="Send message"
            className="text-blue-500"
          >
            <TbSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}