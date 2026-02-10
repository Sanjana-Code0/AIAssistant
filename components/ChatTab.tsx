
import React, { useState, useRef, useEffect } from 'react';
import { chatWithContext } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatTabProps {
  pageContent: string;
}

/**
 * ChatWindow & InputBar: Represents the "ShadowLight Chatbot (React UI)" from the diagram.
 */
export const ChatTab: React.FC<ChatTabProps> = ({ pageContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithContext(input, pageContent);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative font-sans">
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-0 animate-in fade-in duration-700 forwards" style={{ opacity: 1 }}>
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <span className="text-4xl animate-wave origin-bottom-right inline-block hover:animate-spin">👋</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">I'm ShadowLight</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[240px]">
              Ask me anything about this page. I can explain complex terms, find data, or help you navigate.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-md'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-1.5 items-center shadow-sm rounded-bl-none">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="relative shadow-lg rounded-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your query..."
            className="w-full rounded-2xl border-0 bg-gray-50 text-xs px-5 py-4 focus:ring-2 focus:ring-indigo-600 transition pr-14 font-medium placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90 transform translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
