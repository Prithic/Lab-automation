"use client";

import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Sun, Cloud, Home, Camera, Settings, Menu, 
  Grid, Bell, User as UserIcon, Lock, Unlock,
  Lightbulb, Thermometer, Wind, Zap, 
  ShieldCheck, ArrowRight, Power, HelpCircle,
  MoreVertical, Search, Zap as Flash, Monitor,
  Droplets, Fan, Snowflake, Cpu, ChevronUp, ChevronDown, Bot
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
  const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);

  // Global Hardware States
  const [lights, setLights] = useState(Array(6).fill(false));
  const [fans, setFans] = useState(Array(4).fill(false));
  const [acs, setAcs] = useState(Array(2).fill(false));
  const [envData, setEnvData] = useState({ temperature: 24.2, humidity: 42, power: 4.28 });
  const [targetTemp, setTargetTemp] = useState(73);
  const [security, setSecurity] = useState({ presenceDetected: false, armed: false, locked: false });

  // MQTT Bridge
  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001');
    client.on('connect', () => {
      client.subscribe(['lab/telemetry/environment', 'lab/security/vision', 'lab/state/#']);
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

  // Universal Actuation
  const sendCommand = (topic: string, payload: any) => {
    if (mqttClient) {
      mqttClient.publish(topic, JSON.stringify(payload));
      console.log(`MQTT OUT: ${topic} ->`, payload);
    }
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

  const handleScene = (scene: string) => {
    sendCommand('lab/scene/set', { scene });
    if (scene === 'GOOD_NIGHT') {
      setLights(lights.map(() => false));
      setAcs([true, false]);
    }
  };

  const updateClimate = (delta: number) => {
    const newTemp = targetTemp + delta;
    setTargetTemp(newTemp);
    sendCommand('lab/climate/set', { target: newTemp });
  };

  const DeviceToggle = ({ icon: Icon, label, isOn, onToggle, colorClass }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOn ? colorClass : 'bg-slate-50 text-slate-300'}`}>
          <Icon size={16} className={isOn ? 'animate-pulse' : ''} />
        </div>
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <div 
        onClick={onToggle}
        className={`h-5 w-10 rounded-full relative cursor-pointer transition-colors duration-300 ${
          isOn ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <motion.div animate={{ x: isOn ? 22 : 2 }} className="absolute top-1 h-3 w-3 bg-white rounded-full shadow-sm" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#1a242f]">
      
      {/* Sidebar - Fully Functional Navigation */}
      <aside className="w-16 bg-white flex flex-col items-center py-4 border-r border-slate-200 hidden md:flex">
        <div className="sidebar-icon mb-6" onClick={() => router.push('/')}><Menu size={24} /></div>
        <div className="space-y-4 flex-1">
          <div className="sidebar-icon bg-slate-100 text-slate-900" onClick={() => router.push('/')}><Grid size={22} /></div>
          <div className="sidebar-icon" onClick={() => router.push('/ai')}><Bot size={22} /></div>
          <div className="sidebar-icon" onClick={() => router.push('/system')}><Monitor size={22} /></div>
          <div className="sidebar-icon"><Bell size={22} /></div>
          <div className="sidebar-icon"><Settings size={22} /></div>
        </div>
        <div className="mt-auto flex flex-col items-center gap-4">
          <div className="sidebar-icon" onClick={() => window.open('https://github.com/Prithic/Lab-automation', '_blank')}><HelpCircle size={22} /></div>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs cursor-pointer hover:scale-110 transition-transform">P</div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        <nav className="h-14 bg-slate-800/40 backdrop-blur-md flex items-center px-6 gap-8 border-b border-white/5">
          <div className="flex items-center gap-2 text-white cursor-pointer" onClick={() => router.push('/')}>
            <Home size={18} className="text-blue-400" />
            <span className="text-xs font-black uppercase tracking-widest">IOT LAB CORE</span>
          </div>
          <div className="hidden md:flex gap-6">
            <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer border-b-2 border-blue-500 pb-4 mt-4" onClick={() => router.push('/')}>Dashboard</span>
            <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer hover:text-white transition-colors pb-4 mt-4" onClick={() => router.push('/ai')}>AI Assistant</span>
            <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer hover:text-white transition-colors pb-4 mt-4" onClick={() => router.push('/system')}>System</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className={`h-2 w-2 rounded-full ${mqttClient ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${mqttClient ? 'text-emerald-400' : 'text-red-400'}`}>
              {mqttClient ? 'Live' : 'Offline'}
            </span>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              {users.map(user => (
                <div key={user.name} className="flex items-center gap-2 bg-white/5 p-1 pr-4 rounded-full border border-white/10 group cursor-pointer hover:bg-white/10 transition-colors">
                  <img src={user.img} alt={user.name} className="h-8 w-8 rounded-full border border-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white uppercase">{user.name}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${
                      security.presenceDetected ? 'text-emerald-400 animate-pulse' : 'text-white/40'
                    }`}>
                      {security.presenceDetected ? 'PERSON DETECTED' : 'SCANNING...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="ha-card py-2 px-4 bg-white/5 border-white/10 text-white flex items-center gap-2 hover:bg-white/10 cursor-help transition-colors">
                <Thermometer size={14} className="text-blue-400" />
                <span className="text-xs font-bold">{envData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="ha-card py-2 px-4 bg-white/5 border-white/10 text-white flex items-center gap-2 hover:bg-white/10 cursor-help transition-colors">
                <Flash size={14} className="text-amber-400" />
                <span className="text-xs font-bold">{envData.power.toFixed(2)}kW</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
            
            {/* Lights */}
            <div className="ha-card col-span-2 row-span-2">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2"><Lightbulb size={18} className="text-amber-400" /><span className="text-sm font-bold uppercase tracking-widest">Lab Lighting</span></div>
                <span className="text-[10px] font-bold text-slate-400">{lights.filter(l => l).length}/6 ON</span>
              </div>
              <div className="space-y-1">
                {lights.map((isOn, i) => (
                  <DeviceToggle key={i} icon={Lightbulb} label={`Light Row ${i + 1}`} isOn={isOn} onToggle={() => toggleDevice('light', i)} colorClass="bg-amber-100 text-amber-600" />
                ))}
              </div>
            </div>

            {/* Climate */}
            <div className="ha-card col-span-2 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2"><Snowflake size={18} className="text-blue-400" /><span className="text-sm font-bold uppercase tracking-widest">Climate Control</span></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {acs.map((isOn, i) => (
                  <motion.div key={i} whileTap={{ scale: 0.95 }} onClick={() => toggleDevice('ac', i)}
                    className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all duration-300 ${
                      isOn ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <Power size={20} /><span className="text-xs font-black uppercase tracking-widest">AC UNIT {i + 1}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="ha-card flex flex-col justify-between">
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-widest">Humidity</span>
                <Droplets size={14} className="text-blue-400" />
              </div>
              <div className="my-2 text-3xl font-light">{envData.humidity}<span className="text-xs opacity-50 ml-1">%</span></div>
              <div className="h-10 w-full opacity-30">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparkData}><Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
            </div>

            <div className="ha-card flex flex-col justify-between">
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-widest">Temp</span>
                <Thermometer size={14} className="text-orange-400" />
              </div>
              <div className="my-2 text-3xl font-light">{envData.temperature.toFixed(1)} <span className="text-xs opacity-50">°C</span></div>
              <div className="h-10 w-full opacity-30">
                <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparkData}><Area type="monotone" dataKey="val" stroke="#f97316" fill="#ffedd5" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
            </div>

            {/* Fans */}
            <div className="ha-card col-span-2 row-span-1">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2"><Wind size={18} className="text-blue-500" /><span className="text-sm font-bold uppercase tracking-widest">Fans</span></div>
                <span className="text-[10px] font-bold text-slate-400">{fans.filter(f => f).length}/4 ON</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6">
                {fans.map((isOn, i) => (
                  <DeviceToggle key={i} icon={Fan} label={`Fan ${i + 1}`} isOn={isOn} onToggle={() => toggleDevice('fan', i)} colorClass="bg-blue-100 text-blue-600" />
                ))}
              </div>
            </div>

            {/* Scene Buttons - Fully Functional */}
            <div className="grid grid-cols-3 col-span-2 gap-4">
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => handleScene('GOOD_NIGHT')} className="ha-card flex flex-col items-center justify-center gap-2 p-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <Cloud size={24} className="text-blue-500" /><span className="text-[10px] font-bold text-slate-600 text-center uppercase">Good Night</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => handleScene('ARRIVE_HOME')} className="ha-card flex flex-col items-center justify-center gap-2 p-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <Home size={24} className="text-amber-500" /><span className="text-[10px] font-bold text-slate-600 text-center uppercase">Arrive Home</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => handleScene('LEAVE_HOME')} className="ha-card flex flex-col items-center justify-center gap-2 p-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <ArrowRight size={24} className="text-indigo-500" /><span className="text-[10px] font-bold text-slate-600 text-center uppercase">Leave Lab</span>
              </motion.div>
            </div>

            {/* Thermostat Gauge - Interactive */}
            <div className="ha-card col-span-2 row-span-2 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 cursor-pointer transition-colors"><MoreVertical size={16} /></div>
              <div className="relative h-48 w-48 flex items-center justify-center">
                <svg className="h-full w-full rotate-[-90deg]">
                  <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="96" cy="96" r="88" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="552" strokeDashoffset={552 - (targetTemp - 60) * 10} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-light">{targetTemp}<span className="text-xl font-normal opacity-50 ml-1">°F</span></span>
                  <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest text-center">Target<br />Climate</div>
                </div>
              </div>
              <div className="flex gap-8 mt-6">
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateClimate(-1)} className="p-3 bg-slate-50 rounded-full text-blue-500 hover:bg-blue-50"><ChevronDown size={24} /></motion.button>
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateClimate(1)} className="p-3 bg-slate-50 rounded-full text-red-500 hover:bg-red-50"><ChevronUp size={24} /></motion.button>
              </div>
            </div>

            {/* Alarm */}
            <div className="ha-card col-span-2 row-span-1">
              <div className="flex justify-between items-start mb-6">
                <div><span className="text-sm font-bold block uppercase tracking-widest mb-1">Security Status</span><span className={`text-[10px] font-bold uppercase tracking-widest ${security.presenceDetected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`}>{security.presenceDetected ? 'PERSON DETECTED' : 'SCANNING...'}</span></div>
                <div className={`h-10 w-10 rounded-full border flex items-center justify-center transition-colors ${security.presenceDetected ? 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-50 border-slate-100 text-slate-300'}`}><ShieldCheck size={24} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => sendCommand('lab/security/control', { command: 'ARM' })} className="flex-1 py-2.5 px-3 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-red-600 transition-colors">ARM SYSTEM</button>
                <button onClick={() => sendCommand('lab/security/control', { command: 'LOCK' })} className="flex-1 py-2.5 px-3 border border-slate-200 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:bg-blue-50 transition-colors">LOCK LAB</button>
              </div>
            </div>

            {/* Consumption */}
            <div className="ha-card col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-4"><div className="p-4 bg-amber-50 rounded-2xl text-amber-500"><Flash size={28} /></div><div><span className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Consumption</span><span className="text-2xl font-bold text-slate-700 italic">{envData.power.toFixed(2)} <span className="text-xs font-medium opacity-50 tracking-normal not-italic">kWh</span></span></div></div>
              <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full"><ArrowRight size={14} className="text-emerald-500" /><span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Normal</span></div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
