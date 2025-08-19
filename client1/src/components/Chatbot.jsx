import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import chatService from "../services/chatService";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant for the Indore Illegal Construction & Encroachment Reporting System. How can I help you today?\n\n💡 You can ask me about:\n• How to report illegal construction\n• Checking complaint status\n• Understanding land parcel data\n• Dashboard features\n• Encroachment reporting process",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-hide label after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // Hide label when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowLabel(false);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.content);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: error.message || "AI is unavailable, please try later.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button with Label */}
      <div className="fixed bottom-20 left-6 z-50 flex items-center gap-3">
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MessageCircle size={24} />
        </motion.button>

        {/* Help Label */}
        <AnimatePresence>
          {showLabel && !isOpen && (
            <motion.div
              className="bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 cursor-pointer hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: [1, 1.02, 1],
              }}
              exit={{ opacity: 0, x: -10 }}
              transition={{
                duration: 0.3,
                delay: 0.5,
                scale: { duration: 2, repeat: 2, repeatType: "reverse" },
              }}
              onClick={() => setShowLabel(false)}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Need Help?
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ask me anything about reporting
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-38 left-6 z-50 w-96 h-[500px] bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Indore Construction System
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.type === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User size={12} />
                      ) : (
                        <Bot size={12} />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.type === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-md"
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                      <Bot
                        size={12}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </div>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-3 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-neutral-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
