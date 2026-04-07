import React, { useState, useEffect, useCallback } from "react";
import config from "./config/apiConfig";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import RecorderPage from "./components/RecorderPage";
import SettingsPage from "./components/SettingsPage";
import HistoryPage from "./components/HistoryPage";

// Default settings
const DEFAULT_SETTINGS = {
  deepgramKey: config.DEEPGRAM_API_KEY,
  deepgramModel: config.DEFAULT_DEEPGRAM_MODEL,
  language: config.DEFAULT_LANGUAGE,
  grokKey: config.GROK_API_KEY,
  grokModel: "grok-beta",
  postProcessMode: "grammar",
  translateTo: "French",
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const stored = JSON.parse(raw);
    if (key === "vf_settings" && stored && typeof stored === "object" && !Array.isArray(stored)) {
      return {
        ...stored,
        deepgramKey: config.DEEPGRAM_API_KEY,
        grokKey: config.GROK_API_KEY,
      };
    }
    return stored;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [settings, setSettings] = useState(() =>
    loadFromStorage("vf_settings", DEFAULT_SETTINGS)
  );
  const [history, setHistory] = useState(() =>
    loadFromStorage("vf_history", [])
  );

  useEffect(() => {
    localStorage.setItem("vf_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("vf_history", JSON.stringify(history));
  }, [history]);

  const saveToHistory = useCallback(
    (text, meta = {}) => {
      if (!text.trim()) return;
      const entry = {
        id: Date.now(),
        text: text.trim(),
        timestamp: Date.now(),
        model: settings.deepgramModel,
        language: settings.language,
        ...meta,
      };
      setHistory((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [entry, ...safePrev].slice(0, 200);
      });
    },
    [settings.deepgramModel, settings.language]
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-primary-500/30">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-900/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === "recorder" && (
            <RecorderPage settings={settings} saveToHistory={saveToHistory} />
          )}
          {activeTab === "settings" && (
            <SettingsPage settings={settings} setSettings={setSettings} />
          )}
          {activeTab === "history" && (
            <HistoryPage history={history} setHistory={setHistory} />
          )}
        </div>
      </main>
    </div>
  );
}