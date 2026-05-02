"use client";

import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

interface CameraState {
  camera_zone: string;
  face_detected: boolean;
  timestamp?: string;
}

const Dashboard = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    camera_zone: "Workstation",
    face_detected: false
  });

  useEffect(() => {
    const client = mqtt.connect('ws://localhost:9001');

    client.on('connect', () => {
      console.log('Connected to MQTT via WebSockets');
      client.subscribe('lab/security/camera');
    });

    client.on('message', (topic, message) => {
      if (topic === 'lab/security/camera') {
        const data = JSON.parse(message.toString());
        setCameraState(data);
        
        // Reset state after 10 seconds if no further detection
        setTimeout(() => {
          setCameraState(prev => ({ ...prev, face_detected: false }));
        }, 10000);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="min-h-screen p-8 md:p-12 scrollbar-hide">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Lab Dashboard
        </h1>
        <p className="text-gray-400 mt-4 text-lg">Real-time monitoring and security overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Security Card */}
        <div 
          className={`bg-white rounded-[32px] p-8 shadow-2xl transition-all duration-500 transform ${
            cameraState.face_detected 
              ? 'ring-4 ring-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)] scale-[1.02]' 
              : 'hover:scale-[1.01]'
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <span className="text-5xl">🛡️</span>
            <div className="flex items-center space-x-2">
              {cameraState.face_detected ? (
                <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                  Authorized Presence
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Scanning...
                </span>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2">Workstation Vision</h3>
          <p className="text-slate-500 text-sm mb-6 uppercase tracking-tight">Zone: {cameraState.camera_zone}</p>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${
              cameraState.face_detected ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Status</span>
                <span className={`font-bold ${cameraState.face_detected ? 'text-red-600' : 'text-slate-400'}`}>
                  {cameraState.face_detected ? 'DETECTION ACTIVE' : 'NO TARGET'}
                </span>
              </div>
            </div>
            
            {cameraState.face_detected && (
              <p className="text-xs text-red-400 italic text-center">
                Last detected at: {new Date().toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Placeholder for other cards */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-center border-dashed">
          <p className="text-white/20 font-medium">Add more sensors...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
