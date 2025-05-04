// utils/chatService.js
import { Client as ConversationsClient } from "@twilio/conversations";

// Cache for Twilio clients
const twilioClients = new Map();

export const chatService = {
  // Get or create a Twilio client
  getClient: async (identity) => {
    // Check cache first
    if (twilioClients.has(identity)) {
      return twilioClients.get(identity);
    }
    
    try {
      // Fetch token
      const tokenRes = await fetch(`/api/twilio/token?identity=${identity}`);
      if (!tokenRes.ok) throw new Error("Failed to fetch Twilio token");
      
      const tokenData = await tokenRes.json();
      
      // Check if token is from mock API
      if (tokenData._isMock) {
        return {
          isMock: true,
          getConversationByUniqueName: (name) => {
            throw new Error("Mock client: conversation not found");
          },
          createConversation: ({ uniqueName, friendlyName }) => {
            return {
              uniqueName,
              friendlyName,
              join: async () => {},
              getMessages: async () => ({ items: [] }),
              on: (event, callback) => {},
              sendMessage: async (content) => {}
            };
          }
        };
      }
      
      // Create real Twilio client
      const client = await ConversationsClient.create(tokenData.token);
      
      // Cache the client
      twilioClients.set(identity, client);
      
      return client;
    } catch (error) {
      console.error("Failed to initialize Twilio client:", error);
      
      // Return a mock client as fallback
      return {
        isMock: true,
        getConversationByUniqueName: (name) => {
          throw new Error("Mock client: conversation not found");
        },
        createConversation: ({ uniqueName, friendlyName }) => {
          return {
            uniqueName,
            friendlyName,
            join: async () => {},
            getMessages: async () => ({ items: [] }),
            on: (event, callback) => {},
            sendMessage: async (content) => {}
          };
        }
      };
    }
  },
  
  // Get or create a conversation between two users
  getConversation: async (client, clientId, lawyerId) => {
    const conversationName = `chat_${clientId}_${lawyerId}`;
    
    try {
      // Try to get existing conversation
      return await client.getConversationByUniqueName(conversationName);
    } catch (err) {
      // Conversation doesn't exist, create it
      console.log("Creating new conversation:", conversationName);
      
      return await client.createConversation({
        uniqueName: conversationName,
        friendlyName: "Client-Lawyer Chat"
      });
    }
  }
};