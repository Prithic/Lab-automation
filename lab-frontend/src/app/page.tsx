"use client";

import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Sun, Cloud, Home, Camera, Settings, Menu, 
  Grid, Bell, User as UserIcon, Lock, Unlock,
  Lightbulb, Thermometer, Wind, Zap, 
  ShieldCheck, ArrowRight, Power, HelpCircle,
  MoreVertical, Search, Zap as Flash, Monitor,
  Droplets, Fan, Snowflake, Cpu, ChevronUp, ChevronDown, Bot, Moon
} from 'lucide-react';

const sparkData = [
  { val: 24 }, { val: 24.2 }, { val: 24.1 }, { val: 24.3 }, { val: 24.2 }
];

const users = [
  { name: "Prithic", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prithic" },
  { name: "System", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bot" },
  { name: "Security", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guard" },
];

const Dashboard = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);

  const [lights, setLights] = useState(Array(6).fill(false));
  const [fans, setFans] = useState(Array(4).fill(false));
  const [acs, setAcs] = useState(Array(2).fill(false));
  const [envData, setEnvData] = useState({ temperature: 24.2, humidity: 42, power: 4.28 });
  const [targetTemp, setTargetTemp] = useState(73);
  const [security, setSecurity] = useState({ presenceDetected: false, armed: false, locked: false });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001');
    client.on('connect', () => {
      client.subscribe(['lab/telemetry/environment', 'lab/security/vision']);
      setMqttClient(client);
    });
    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (topic === 'lab/telemetry/environment') {
          setEnvData(prev => ({ ...prev, ...payload }));
        } else if (topic === 'lab/security/vision') {
          setSecurity(prev => ({ ...prev, presenceDetected: payload.presence === true }));
        }
      } catch (e) {}
    });
    return () => { client.end(); };
  }, []);

  const sendCommand = (topic: string, payload: any) => {
    if (mqttClient) mqttClient.publish(topic, JSON.stringify(payload));
  };

  const toggleDevice = (type: 'light' | 'fan' | 'ac', index: number) => {
    let newState = false;
    let topic = "";
    if (type === 'light') {
      const updated = [...lights]; updated[index] = !updated[index];
      newState = updated[index]; setLights(updated);
      topic = `lab/relay/light/${index + 1}`;
    } else if (type === 'fan') {
      const updated = [...fans]; updated[index] = !updated[index];
      newState = updated[index]; setFans(updated);
      topic = `lab/relay/fan/${index + 1}`;
    } else if (type === 'ac') {
      const updated = [...acs]; updated[index] = !updated[index];
      newState = updated[index]; setAcs(updated);
      topic = `lab/relay/ac/${index + 1}`;
    }
    sendCommand(topic, { state: newState ? "ON" : "OFF" });
  };

  const DeviceToggle = ({ icon: Icon, label, isOn, onToggle, colorClass }: any) => (
    <div className="flex items-center justify-between py-2.5 border-b border-black/5 dark:border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-all ${isOn ? colorClass : 'bg-black/5 dark:bg-white/5 text-slate-400'}`}>
          <Icon size={16} className={isOn ? 'animate-pulse' : ''} />
        </div>
        <span className="text-xs font-bold tracking-tight text-slate-700 dark:text-slate-200">{label}</span>
      </div>
      <div 
        onClick={onToggle}
        className={`h-5 w-10 rounded-full relative cursor-pointer transition-all duration-500 ${
          isOn ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-200 dark:bg-white/10'
        }`}
      >
        <motion.div animate={{ x: isOn ? 22 : 2 }} className="absolute top-1 h-3 w-3 bg-white rounded-full shadow-sm" />
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-20 bg-white/60 dark:bg-black/20 backdrop-blur-3xl flex flex-col items-center py-8 border-r border-black/5 dark:border-white/5 hidden md:flex">
        <div className="sidebar-icon mb-10 text-blue-600 dark:text-blue-400 bg-blue-500/10"><Menu size={24} /></div>
        <div className="space-y-6 flex-1">
          <div className="sidebar-icon !text-blue-600 dark:!text-blue-400 bg-blue-500/10"><Grid size={22} /></div>
          <div className="sidebar-icon" onClick={() => router.push('/ai')}><Bot size={22} /></div>
          <div className="sidebar-icon" onClick={() => router.push('/system')}><Monitor size={22} /></div>
          <div className="sidebar-icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </div>
          <div className="sidebar-icon"><Settings size={22} /></div>
        </div>
        <div className="mt-auto">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">P</div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        <nav className="h-16 bg-white/40 dark:bg-black/20 backdrop-blur-3xl flex items-center px-10 gap-10 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Cpu size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">LAB CORE</span>
          </div>
          <div className="hidden md:flex gap-8">
            <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase cursor-pointer border-b-2 border-blue-600 pb-5 mt-5">Dashboard</span>
            <span className="text-slate-400 dark:text-white/30 text-[10px] font-black tracking-[0.2em] uppercase cursor-pointer hover:text-blue-600 dark:hover:text-white transition-colors pb-5 mt-5">Automation</span>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full border border-black/5 dark:border-white/5">
              <div className={`h-2 w-2 rounded-full ${mqttClient ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${mqttClient ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {mqttClient ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-5">
              {users.map(user => (
                <div key={user.name} className="flex items-center gap-3 bg-white/60 dark:bg-white/5 p-1.5 pr-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:scale-105 transition-all cursor-pointer">
                  <img src={user.img} alt={user.name} className="h-10 w-10 rounded-xl border-2 border-white/20 shadow-md" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">{user.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${
                      security.presenceDetected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                    }`}>
                      {security.presenceDetected ? 'DETECTED' : 'SCANNING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="ha-card !py-3 !px-6 flex items-center gap-3">
                <Thermometer size={16} className="text-blue-500" />
                <span className="text-sm font-black text-slate-800 dark:text-white">{envData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="ha-card !py-3 !px-6 flex items-center gap-3">
                <Flash size={16} className="text-amber-500" />
                <span className="text-sm font-black text-slate-800 dark:text-white">{envData.power.toFixed(2)}kW</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8">
            
            {/* Lights */}
            <div className="ha-card col-span-2 row-span-2">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="p-2 bg-amber-500/10 rounded-lg"><Lightbulb size={20} className="text-amber-500" /></div>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Lab Lighting</span>
                </div>
                <div className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {lights.filter(l => l).length}/6 ON
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {lights.map((isOn, i) => (
                  <DeviceToggle key={i} icon={Lightbulb} label={`Light Row ${i + 1}`} isOn={isOn} onToggle={() => toggleDevice('light', i)} colorClass="bg-amber-500/20 text-amber-500" />
                ))}
              </div>
            </div>

            {/* Climate */}
            <div className="ha-card col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><Snowflake size={20} className="text-blue-500" /></div>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Climate</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5">
                {acs.map((isOn, i) => (
                  <motion.div key={i} whileTap={{ scale: 0.95 }} onClick={() => toggleDevice('ac', i)}
                    className={`p-5 rounded-2xl border flex flex-col gap-4 cursor-pointer transition-all duration-500 ${
                      isOn ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/40' : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-400'
                    }`}
                  >
                    <Power size={22} /><span className="text-[11px] font-black uppercase tracking-widest">UNIT {i + 1}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="ha-card flex flex-col justify-between">
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Humidity</span>
                <Droplets size={16} className="text-blue-500" />
              </div>
              <div className="my-3 text-4xl font-light text-slate-900 dark:text-white">{envData.humidity}<span className="text-lg opacity-30 ml-1">%</span></div>
              <div className="h-12 w-full opacity-40">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparkData}><Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
            </div>

            <div className="ha-card flex flex-col justify-between">
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest">Temp</span>
                <Thermometer size={16} className="text-orange-500" />
              </div>
              <div className="my-3 text-4xl font-light text-slate-900 dark:text-white">{envData.temperature.toFixed(1)} <span className="text-lg opacity-30">°C</span></div>
              <div className="h-12 w-full opacity-40">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparkData}><Area type="monotone" dataKey="val" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
            </div>

            {/* Fans */}
            <div className="ha-card col-span-2 row-span-1">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><Wind size={20} className="text-emerald-500" /></div>
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Ventilation</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fans.filter(f => f).length}/4 ON</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8">
                {fans.map((isOn, i) => (
                  <DeviceToggle key={i} icon={Fan} label={`Fan ${i + 1}`} isOn={isOn} onToggle={() => toggleDevice('fan', i)} colorClass="bg-emerald-500/20 text-emerald-500" />
                ))}
              </div>
            </div>

            {/* Alarm */}
            <div className="ha-card col-span-2 row-span-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-sm font-black block uppercase tracking-[0.2em] mb-2 text-slate-900 dark:text-white">Security</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${security.presenceDetected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`}>
                    {security.presenceDetected ? '• PERSON DETECTED' : '• SCANNING AREA'}
                  </span>
                </div>
                <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all ${
                  security.presenceDetected ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-300'
                }`}><ShieldCheck size={26} /></div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => sendCommand('lab/security/control', { command: 'ARM' })} className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg">ARM SYSTEM</button>
                <button onClick={() => sendCommand('lab/security/control', { command: 'LOCK' })} className="flex-1 py-3 px-4 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all">LOCK LAB</button>
              </div>
            </div>

            {/* Consumption */}
            <div className="ha-card col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-amber-500/10 rounded-2xl text-amber-500 shadow-inner"><Flash size={32} /></div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Live Consumption</span>
                  <span className="text-3xl font-black text-slate-800 dark:text-white italic tracking-tighter">
                    {envData.power.toFixed(2)} <span className="text-xs font-medium opacity-30 tracking-normal not-italic ml-1">kWh</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-2.5 rounded-2xl border border-emerald-500/20">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Normal</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
