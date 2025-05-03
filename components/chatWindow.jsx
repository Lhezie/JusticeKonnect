import React, { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";
import { useChatStore } from "../store/chatStore";
import { TbSend } from "react-icons/tb";

export function ChatWindow({ clientId, lawyerId, onClose }) {
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    // fetch token for this client
    fetch(`/api/twilio/token?identity=${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        return Conversations.Client.create(data.token);
      })
      .then((c) => {
        setClient(c);
        return c
          .getChannelByUniqueName(`chat_${clientId}_${lawyerId}`)
          .catch(() =>
            c.createChannel({
              uniqueName: `chat_${clientId}_${lawyerId}`,
              friendlyName: "Client-Lawyer Chat",
            })
          );
      })
      .then((ch) => {
        setChannel(ch);
        return ch.join().catch(() => {});
      })
      .then((ch) => {
        ch.getMessages().then((page) => setMessages(page.items));
        ch.on("messageAdded", (msg) => setMessages((prev) => [...prev, msg]));
      });
  }, [clientId, lawyerId]);

  const handleSend = () => {
    if (draft.trim() && channel) {
      channel.sendMessage(draft);
      setDraft("");
    }
  };

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
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded ${
                msg.author === clientId
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100 self-start"
              }`}
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

  <style jsx global>{`
    .fc .fc-toolbar-title {
      font-size: 0.75em;
      margin: 0px;
    }
  `}</style>;
}
