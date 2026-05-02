"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronLeft, Sparkles, Command } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Neural Interface Active. Systems ready for command input. How can I assist with lab operations?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Connection to AI Core interrupted.' }]);
    } finally {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500); // Small delay for UX
    }
  };

  return (
    <div className="min-h-screen animated-bg p-4 md:p-10 flex flex-col items-center">
      
      {/* Header Area */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/" className="glass-card p-3 rounded-2xl text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <ChevronLeft size={18} /> Back
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <h2 className="text-lg font-black text-white tracking-tighter uppercase">AI Neural Core</h2>
            <p className="text-xs font-bold text-purple-400 tracking-widest">v4.0.2 SECURE</p>
          </div>
          <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Bot size={28} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Chat Bento Container */}
      <div className="w-full max-w-4xl flex-1 flex flex-col glass-card rounded-[40px] p-2 overflow-hidden bg-white/[0.02]">
        
        {/* Messages Space */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`flex items-end gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-3 rounded-2xl shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                </div>
                <div 
                  className={`p-6 rounded-[28px] shadow-xl text-sm md:text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600/20 text-blue-50 border border-blue-500/30 rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/5 p-6 rounded-[28px] rounded-tl-none flex gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Communicate with Smart Lab Core..."
              className="w-full bg-slate-950/40 border border-white/10 text-white p-6 rounded-[32px] pr-20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 backdrop-blur-3xl transition-all placeholder:text-slate-600 font-medium"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-800 text-white p-4 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 group-hover:shadow-purple-500/25"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex justify-center gap-6 mt-4 opacity-40">
            <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
              <Command size={10} /> Shift Enter for line
            </span>
            <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
              Encrypted Channel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
