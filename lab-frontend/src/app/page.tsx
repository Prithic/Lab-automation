"use client";

import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Shield, 
  Thermometer, 
  Droplets, 
  Lightbulb, 
  Bot,
  Send,
  Zap,
  Activity,
  Cpu,
  Navigation
} from 'lucide-react';

const sparkData = [
  { value: 40 }, { value: 30 }, { value: 45 }, { value: 35 }, 
  { value: 55 }, { value: 40 }, { value: 50 }
];

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const Dashboard = () => {
  const [cameraState, setCameraState] = useState({
    face_detected: false,
    distance: 1.4,
    zone: "Workstation"
  });
  const [lights, setLights] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Neural core synchronized. Ready for commands.' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001');
    client.on('connect', () => client.subscribe('lab/security/camera'));
    client.on('message', (topic, message) => {
      if (topic === 'lab/security/camera') {
        const data = JSON.parse(message.toString());
        setCameraState(prev => ({ ...prev, ...data }));
      }
    });
    return () => { client.end(); };
  }, []);

  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    const msg = aiInput.trim();
    setAiInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network refraction error. AI unreachable.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/50 rounded-[32px] p-6 relative overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-white/20 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-10 scrollbar-hide">
      
      {/* Vibrant Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter text-white drop-shadow-lg uppercase">
            Lab <span className="font-black italic text-emerald-400">OS</span>
          </h1>
          <p className="text-xs font-bold tracking-[0.4em] text-white/40 uppercase mt-3">Advanced Infrastructure Layer</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-full px-5 py-2 flex items-center gap-2.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Core Stable</span>
          </div>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-8 auto-rows-[minmax(190px,auto)] max-w-[1700px] mx-auto">
        
        {/* Radar (2x2) */}
        <div className="md:col-span-2 md:row-span-2">
          <GlassCard className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start z-10">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Shield size={22} className={cameraState.face_detected ? "text-red-400" : "text-emerald-400"} />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Security Radar</span>
            </div>

            <div className="flex flex-col items-center justify-center py-12 relative z-10">
              <motion.div 
                animate={{ scale: cameraState.face_detected ? [1, 1.02, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <span className="text-[10rem] font-light tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {cameraState.distance.toFixed(1)}<span className="text-3xl ml-2 opacity-20">m</span>
                </span>
              </motion.div>
              {cameraState.face_detected && (
                <div className="absolute inset-0 bg-red-500/10 blur-[80px] -z-10 rounded-full animate-pulse"></div>
              )}
            </div>

            <div className="flex justify-between items-end z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Detection Zone</span>
                <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{cameraState.zone}</span>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-2.5 rounded-2xl border border-emerald-500/20">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 tracking-[0.2em] uppercase">Tracking Live</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* AI Assistant (2x3) */}
        <div className="md:col-span-2 md:row-span-3">
          <GlassCard className="h-full p-0 flex flex-col bg-white/[0.02] border-white/[0.05]">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Bot size={20} className="text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">Neural Assistant</span>
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500/40"></div>
                <div className="h-2 w-2 rounded-full bg-emerald-500/20"></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-gradient-to-b from-transparent to-emerald-950/5">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[24px] text-sm leading-relaxed drop-shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-[0_10px_20px_-5px_rgba(5,150,105,0.4)]' 
                      : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-none backdrop-blur-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-5 rounded-[24px] rounded-tl-none flex gap-2 border border-white/10">
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-white/5 border-t border-white/10">
              <div className="relative group">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                  placeholder="Intercept system..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-5 text-sm focus:outline-none focus:bg-white/10 focus:border-emerald-500/50 transition-all placeholder:text-white/20"
                />
                <button 
                  onClick={handleAiSend}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-emerald-400 hover:text-white transition-colors"
                >
                  <Send size={22} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Temp (1x1) */}
        <div className="md:col-span-1 md:row-span-1">
          <GlassCard className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Thermometer size={20} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Temperature</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-6xl font-light tracking-tight text-white drop-shadow-lg">24<span className="text-xl ml-1 text-emerald-400 font-medium opacity-50">°C</span></span>
            </div>
            <div className="h-12 w-full opacity-50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Humidity (1x1) */}
        <div className="md:col-span-1 md:row-span-1">
          <GlassCard className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Droplets size={20} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Humidity</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-6xl font-light tracking-tight text-white drop-shadow-lg">42<span className="text-xl ml-1 text-blue-400 font-medium opacity-50">%</span></span>
            </div>
            <div className="h-12 w-full opacity-50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Controls (2x1) */}
        <div className="md:col-span-2 md:row-span-1">
          <GlassCard className="h-full flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4 block">System Relays</span>
            <div className="grid grid-cols-2 gap-6 flex-1">
              <motion.button 
                whileTap={{ scale: 0.96 }}
                onClick={() => setLights(!lights)}
                className={`flex items-center justify-between p-6 rounded-[28px] border transition-all duration-500 ${
                  lights ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)]' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${lights ? 'text-emerald-400' : 'text-white/20'}`}>Main Array</span>
                  <span className="text-lg font-bold text-white tracking-tight drop-shadow-md">Lab Lights</span>
                </div>
                <Lightbulb size={26} className={lights ? 'text-emerald-400' : 'text-white/20'} />
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-between p-6 rounded-[28px] border bg-white/5 border-white/5 opacity-30 cursor-not-allowed"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-white/20">Aux Unit</span>
                  <span className="text-lg font-bold text-white tracking-tight">Exhaust</span>
                </div>
                <Zap size={26} className="text-white/20" />
              </motion.button>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
