"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { useAuth } from "@/config/authcontext"
import io from "socket.io-client"
import toast from "react-hot-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ChatPage() {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) {
      console.log("Unauthenticated route")
      return
    }

    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: `Bearer ${token}` },
    })

    socketRef.current.on("receiveMessage", (message) => {
      console.log("Received message:", message)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: message.id,
          content: message.content,
          timestamp: message.timestamp,
          sender: message.documentId,
        },
      ])
    })

    socketRef.current.on("errorMessage", (error) => {
      console.error("WebSocket error:", error)
      toast.error(error.message || "WebSocket error occurred")
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    };
  }, [token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && socketRef.current) {
      const localMessage = {
        timestamp: Date.now(),
        content: input,
        sender: user.id,
      }
      setMessages((prevMessages) => [...prevMessages, localMessage])

      socketRef.current.emit("sendMessage", {
        content: input,
        sender: user.id,
      })

      setInput("")
    }
  }

  return (
    (<div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-600 to-indigo-800">
      <div
        className="w-full max-w-2xl h-[80vh] flex flex-col bg-gray-900 rounded-lg shadow-2xl overflow-hidden z-20 border border-gray-700">
        <div
          className="bg-gray-800 p-4 text-white font-semibold text-lg border-b border-gray-700">Chat Room</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.timestamp}
              className={`flex items-start space-x-2 ${message.sender === user.id ? "justify-start" : "justify-end"}`}>
              {message.sender === user.id && (<Avatar className="w-8 h-8 mt-1">
                <AvatarFallback
                  className={`${message.sender === user.id ? "bg-violet-500" : "bg-indigo-500"} text-white text-xs`}>
                  {message.sender === user.id ? "U" : "S"}
                </AvatarFallback>
              </Avatar>)}
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === user.id ? "bg-violet-600 text-white" : "bg-indigo-600 text-white"
                } shadow-md transition-all duration-300 hover:shadow-lg`}>
                <div className="text-sm">{message.content}</div>
                <div className="text-xs opacity-75 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
              {message.sender !== user.id && (<Avatar className="w-8 h-8 mt-1">
                <AvatarFallback
                  className={`${message.sender === user.id ? "bg-violet-500" : "bg-indigo-500"} text-white text-xs`}>
                  {message.sender === user.id ? "U" : "S"}
                </AvatarFallback>
              </Avatar>)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300" />
            <button
              type="submit"
              className="bg-violet-500 text-white rounded-full p-2 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
              disabled={!input.trim()}>
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>)
  );
}

