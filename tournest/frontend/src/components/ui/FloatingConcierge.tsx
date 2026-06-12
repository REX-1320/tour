'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionPayload?: any; 
}

export default function FloatingConcierge() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your TourNest AI assistant. How can I help you today?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputVal.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputVal };
    const currMessages = [...messages, userMsg];
    setMessages(currMessages);
    setInputVal('');
    setLoading(true);

    try {
      const apiMessages = currMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'bot',
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: data.message,
          actionPayload: { action: data.results && data.results.length > 0 ? 'BOOK_DESTINATION' : '', places: data.results || [] }
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: "I couldn't reach my servers. Please try again."
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: "An error occurred fetching results."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Hidden button for layout trigger (Hack to open from other pages) */}
      <button id="global-chatbot-toggle" className="hidden" onClick={() => setIsOpen(true)}></button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[360px] h-[500px] max-h-[85vh] glass-strong rounded-[24px] overflow-hidden flex flex-col shadow-2xl relative border border-[rgba(255,255,255,0.15)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between bg-gradient-to-r from-[rgba(108,99,255,0.2)] to-[rgba(108,99,255,0.05)]">
              <div className="flex items-center gap-3 text-white font-semibold flex-1">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-[0_0_10px_var(--accent-glow)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">TourNest AI</h3>
                  <p className="text-[10px] text-[var(--success)] font-medium">● Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
              {messages.map(msg => (
                <div key={msg.id} className="flex flex-col">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.sender === 'ai' ? 'bg-[rgba(108,99,255,0.2)] text-[var(--accent-light)]' : 'glass text-white'}`}>
                      {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col gap-2">
                       <div className={`p-3 text-sm rounded-2xl whitespace-pre-line ${
                         msg.sender === 'ai' 
                           ? 'glass border border-[rgba(255,255,255,0.05)] text-gray-200 rounded-tl-none' 
                           : 'bg-[var(--accent)] text-white rounded-tr-none shadow-[0_4px_10px_var(--accent-glow)]'
                       }`}>
                         {msg.text}
                       </div>
                       
                       {/* Smart Booking Action Card */}
                       {msg.sender === 'ai' && msg.actionPayload?.action === 'BOOK_DESTINATION' && msg.actionPayload.places?.length > 0 && (
                          <div className="flex flex-col gap-2 mt-1">
                            {msg.actionPayload.places.map((place: any, idx: number) => (
                              <div key={place.id || idx} className="glass p-3 rounded-xl border border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                                <div className="flex flex-col max-w-[120px]">
                                   <span className="text-white text-xs font-bold truncate">{place.title}</span>
                                   <span className="text-text-muted text-[10px]">₹{place.price}</span>
                                </div>
                                <button 
                                  onClick={() => router.push('/destinations')} 
                                  className="bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white text-[10px] uppercase font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center"
                                >
                                  Book <Link2 className="w-3 h-3 ml-1" />
                                </button>
                              </div>
                            ))}
                          </div>
                       )}
                    </div>
                  </motion.div>
                </div>
              ))}
              {loading && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 self-start max-w-[85%]">
                    <div className="w-7 h-7 rounded-full bg-[rgba(108,99,255,0.2)] flex items-center justify-center shrink-0 mt-1 text-[var(--accent-light)]">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 text-sm rounded-2xl glass border border-[rgba(255,255,255,0.05)] text-gray-200 rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-light)]" />
                      <span className="text-xs text-text-muted">Analyzing intent...</span>
                    </div>
                 </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for recommendations..."
                  disabled={loading}
                  className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-[var(--accent-light)] transition-all placeholder:text-text-muted disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputVal.trim() || loading}
                  className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full flex items-center justify-center relative shadow-[0_8px_32px_var(--accent-glow)] border border-[rgba(255,255,255,0.2)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-light)]"></div>
        <Bot className={`w-8 h-8 text-white relative z-10 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`} />
        <X className={`w-8 h-8 text-white absolute z-10 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-0'}`} />
      </motion.button>
    </div>
  );
}
