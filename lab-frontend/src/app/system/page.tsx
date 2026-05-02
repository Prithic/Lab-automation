import React from 'react';

const SystemPage = () => {
  const addOns = [
    {
      id: 1,
      title: "Node-RED Automation Engine",
      description: "Visual automation builder and rule engine.",
      icon: "🟥",
      actionLabel: "Open Dashboard",
      actionUrl: "http://localhost:1880",
    },
    {
      id: 2,
      title: "Mosquitto MQTT Core",
      description: "Local message broker for ESP32 telemetry.",
      icon: "📡",
      details: "TCP: 1883, WS: 9001",
    },
    {
      id: 3,
      title: "FastAPI Data Historian",
      description: "SQLite database manager and REST API.",
      icon: "🐍",
      actionLabel: "API Docs",
      actionUrl: "http://localhost:8000/docs",
    }
  ];

  return (
    <div className="min-h-screen p-8 md:p-12 scrollbar-hide">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          System Add-ons & Services
        </h1>
        <p className="text-gray-400 mt-4 text-lg">Manage and monitor your lab infrastructure core services.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {addOns.map((addon) => (
          <div 
            key={addon.id}
            className="bg-white rounded-[32px] p-8 shadow-2xl transform transition-all hover:scale-[1.02] hover:shadow-cyan-500/10"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl">{addon.icon}</span>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Running</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3">{addon.title}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {addon.description}
            </p>

            {addon.actionUrl ? (
              <a 
                href={addon.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.98]"
              >
                {addon.actionLabel}
              </a>
            ) : (
              <div className="bg-slate-100 p-4 rounded-2xl text-center border border-slate-200">
                <span className="text-slate-500 text-sm font-mono">{addon.details}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemPage;
