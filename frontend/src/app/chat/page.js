"use client";

import { useState, useRef, useEffect } from "react";
import { Send, LogOut } from "lucide-react";
import { useAuth } from "@/config/authcontext";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { storeMessages, retrieveMessages } from "@/config/utils";
import Loader from "@/components/ui/loader";

export default function ChatPage() {
  const { token, user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Load messages for the logged-in user
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !user.username) return; 
      try {
        const storedMessages = await retrieveMessages(user.username);
        if (storedMessages && storedMessages.length > 0) {
          setMessages(storedMessages);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load chat history");
      }
    };
    loadMessages();
  }, [user]);

  // Save messages for the logged-in user
  useEffect(() => {
    if (!user || !user.username) return;
    const saveMessages = async () => {
      try {
        await storeMessages(messages, user.username);
      } catch (error) {
        console.error("Failed to save messages:", error);
        toast.error("Failed to save chat history");
      }
    };
    saveMessages();
  }, [messages, user]);

  // WebSocket connection and message handling
  useEffect(() => {
    if (!token) {
      return; // Exit if the user is unauthenticated
    }

    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: `Bearer ${token}` },
    });

    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: message.id,
          content: message.content,
          timestamp: Date.now(),
          sender: message.documentId,
        },
      ]);
    });

    socketRef.current.on("errorMessage", (error) => {
      console.error("WebSocket error:", error);
      toast.error(error.message || "WebSocket error occurred");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      const localMessage = {
        id: Date.now(), // Use timestamp as a unique ID
        timestamp: Date.now(),
        content: input,
        sender: user.id,
      };
      setMessages((prevMessages) => [...prevMessages, localMessage]);

      socketRef.current.emit("sendMessage", {
        content: input,
        sender: user.id,
      });

      setInput("");
    }
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Graceful fallback if user data is not available
  if (!user || !user.username) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-3">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-gray-900 rounded-lg shadow-2xl bg-opacity-80 overflow-hidden z-20 border border-gray-700 mb-20 md:mb-0">
        {/* Header with Logout Button */}
        <div className="bg-gray-800 p-4 text-white font-semibold text-lg border-b border-gray-700 flex justify-between items-center">
          <span>Chat Room</span>
          <button
            onClick={logout}
            className="flex items-center text-base space-x-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-300 focus:outline-none"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sortedMessages.map((message) => (
            <div
              key={message?.id}
              className={`flex items-start space-x-2 ${
                message.sender === user?.id ? "justify-start" : "justify-end"
              }`}
            >
              {message.sender === user?.id && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback
                    className={`${
                      message.sender === user?.id ? "bg-violet-500" : "bg-indigo-800"
                    } text-white text-xs`}
                  >
                    U
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === user?.id
                    ? "bg-violet-500 text-white"
                    : "bg-indigo-800 text-white"
                } shadow-md transition-all duration-300 hover:shadow-lg`}
              >
                <div className="text-sm">{message?.content}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(message?.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {message.sender !== user?.id && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback
                    className={`${
                      message.sender === user?.id ? "bg-violet-500" : "bg-indigo-800"
                    } text-white text-xs`}
                  >
                    S
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
            />
            <button
              type="submit"
              className="bg-violet-500 text-white rounded-full p-2 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
              disabled={!input.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
