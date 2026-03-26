'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hello, traveler. Where are you dreaming of going next?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "That sounds wonderful! I'm searching our premium destinations to match your request..."
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[340px] h-[480px] glass-strong rounded-[24px] overflow-hidden flex flex-col shadow-2xl relative"
          >
            {/* Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between bg-[rgba(108,99,255,0.1)]">
              <div className="flex items-center gap-2 text-white font-semibold flex-1">
                <Bot className="w-5 h-5 text-[var(--accent-light)]" />
                <span className="text-sm tracking-wide">AI Concierge</span>
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
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'ai' ? 'bg-[var(--accent-light)] text-white' : 'glass text-white'}`}>
                    {msg.sender === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3 text-sm rounded-2xl ${
                    msg.sender === 'ai' 
                      ? 'glass text-gray-200 rounded-tl-sm' 
                      : 'bg-[var(--accent)] text-white/90 rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[rgba(255,255,255,0.1)]">
              <div className="relative">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for recommendations..."
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-[var(--accent-light)] focus:bg-[rgba(255,255,255,0.08)] transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputVal.trim()}
                  className="absolute right-1.5 top-1.5 p-1.5 text-[var(--accent-light)] hover:text-white disabled:opacity-50 transition-colors bg-[rgba(255,255,255,0.05)] rounded-full hover:bg-[rgba(255,255,255,0.15)]"
                >
                  <Send className="w-4 h-4" />
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
        className="w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(108,99,255,0.5)] border border-[rgba(255,255,255,0.2)]"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-light)] animate-pulse-soft"></div>
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-md"></div>
        <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform" />
      </motion.button>
    </div>
  );
}
