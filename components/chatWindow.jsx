import React, { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";
import { useChatStore } from "../store/chatStore";
import { TbSend } from "react-icons/tb";
import { Client as ConversationsClient } from "@twilio/conversations";

export function ChatWindow({ clientId, lawyerId, onClose }) {
  const { messages, loadMessages, sendMessage } = useChatStore();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unmounted = false;
    setLoading(true);

    async function initChat() {
      try {
        // 1. Load messages from API first
        await loadMessages({ clientId, lawyerId });

        // 2. Fetch token
        const tokenRes = await fetch(`/api/twilio/token?identity=${clientId}`);
        if (!tokenRes.ok) throw new Error("Failed to fetch Twilio token");
        const tokenData = await tokenRes.json();
        
        // Check if component is still mounted
        if (unmounted) return;

        // 3. Create Twilio client
        const twilioClient = await ConversationsClient.create(tokenData.token);
        setClient(twilioClient);

        // 4. Get or create conversation
        let conversationChannel;
        try {
          // First try to get existing conversation
          conversationChannel = await twilioClient.getConversationByUniqueName(
            `chat_${clientId}_${lawyerId}`
          );
        } catch (err) {
          // Conversation doesn't exist, create it
          // Note the method name change from createChannel to createConversation
          conversationChannel = await twilioClient.createConversation({
            uniqueName: `chat_${clientId}_${lawyerId}`,
            friendlyName: "Client-Lawyer Chat",
          });
        }

        if (unmounted) return;
        setChannel(conversationChannel);

        // 5. Join the conversation if needed
        try {
          await conversationChannel.join();
        } catch (err) {
          // Already joined, ignore
          console.log("Already joined conversation or error joining", err);
        }

        // 6. Set up message listeners
        const messagePage = await conversationChannel.getMessages();
        setLocalMessages(messagePage.items || []);

        // Listen for new messages
        conversationChannel.on("messageAdded", (msg) => {
          setLocalMessages((prev) => [...prev, msg]);
        });

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
      // Clean up Twilio client if needed
      if (client) {
        client.shutdown();
      }
    };
  }, [clientId, lawyerId, loadMessages]);

  const handleSend = async () => {
    if (draft.trim() && channel) {
      try {
        // Send through Twilio
        await channel.sendMessage(draft);
        
        // Also log in our database
        await sendMessage({
          senderId: parseInt(clientId),
          receiverId: parseInt(lawyerId),
          content: draft,
        });
        
        setDraft("");
      } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message. Please try again.");
      }
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
            <p className="text-red-500">{error}</p>
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
        <div className="flex-1 p-3 overflow-y-auto bg-blue-50 space-y-2">
          {localMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded ${
                msg.author === clientId
                  ? "bg-blue-100 self-end ml-auto"
                  : "bg-gray-100 self-start mr-auto"
              } max-w-[80%]`}
            >
              {msg.body}
            </div>
          ))}
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