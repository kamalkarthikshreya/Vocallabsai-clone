import React, { useState } from 'react';
import { Shield, Zap, Cpu, Globe, Key, Eye, EyeOff, Save, CheckCircle2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DEEPGRAM_MODELS = [
  { value: 'nova-2', label: 'Nova 2 (Best Quality)' },
  { value: 'nova', label: 'Nova' },
  { value: 'enhanced', label: 'Enhanced' },
  { value: 'whisper-large', label: 'Whisper Large' },
];

const GROK_MODELS = [
  { value: 'grok-beta', label: 'Grok Beta' },
  { value: 'grok-vision-beta', label: 'Grok Vision' },
];

const LANGUAGES = [
  { value: 'en-US', label: '🇺🇸 English (US)' },
  { value: 'en-GB', label: '🇬🇧 English (UK)' },
  { value: 'hi', label: '🇮🇳 Hindi' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'de', label: '🇩🇪 German' },
  { value: 'ja', label: '🇯🇵 Japanese' },
];

const POST_PROCESS_MODES = [
  { value: 'grammar', label: '✏️ Grammar & Spelling' },
  { value: 'spelling', label: '🔤 Spelling Only' },
  { value: 'translate', label: '🌐 Translate' },
  { value: 'hinglish', label: '🇮🇳 Hinglish → English' },
];

export default function SettingsPage({ settings, setSettings }) {
  const [saved, setSaved] = useState(false);
  const [showDeepgramKey, setShowDeepgramKey] = useState(false);
  const [showGrokKey, setShowGrokKey] = useState(false);

  const update = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Configuration</h1>
        <p className="text-slate-400 text-lg">Fine-tune your ASR and AI post-processing parameters.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* Deepgram Section */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Deepgram ASR</h2>
                <p className="text-sm text-slate-500">Authentication and Model selection</p>
              </div>
            </div>
            <a href="https://console.deepgram.com" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
              Get Key
            </a>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">API Key</label>
              <div className="relative group">
                <input
                  type={showDeepgramKey ? 'text' : 'password'}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all placeholder:text-slate-700"
                  placeholder="Enter your Deepgram API key"
                  value={settings.deepgramKey || ''}
                  onChange={e => update('deepgramKey', e.target.value)}
                />
                <button
                  onClick={() => setShowDeepgramKey(!showDeepgramKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showDeepgramKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Decoding Model</label>
                <select
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
                  value={settings.deepgramModel || 'nova-2'}
                  onChange={e => update('deepgramModel', e.target.value)}
                >
                  {DEEPGRAM_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
               </div>
               <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Language</label>
                <select
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none cursor-pointer"
                  value={settings.language || 'en-US'}
                  onChange={e => update('language', e.target.value)}
                >
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
               </div>
            </div>
          </div>
        </div>

        {/* AI Section */}
        <div className="glass-card">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Grok (xAI) Post-Processing</h2>
              <p className="text-sm text-slate-500">xAI LLM enhancements (Optional)</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Groq API Key</label>
              <div className="relative group">
                <input
                  type={showGrokKey ? 'text' : 'password'}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 pr-12 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-700"
                  placeholder="Paste your Grok key for AI features"
                  value={settings.grokKey || ''}
                  onChange={e => update('grokKey', e.target.value)}
                />
                <button
                  onClick={() => setShowGrokKey(!showGrokKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showGrokKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">LLM Model</label>
                <select
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                  value={settings.grokModel || 'grok-beta'}
                  onChange={e => update('grokModel', e.target.value)}
                >
                  {GROK_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
               </div>
               <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Process Mode</label>
                <select
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                  value={settings.postProcessMode || 'grammar'}
                  onChange={e => update('postProcessMode', e.target.value)}
                >
                  {POST_PROCESS_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
        <p className="text-xs text-slate-500 max-w-sm">
          Settings are persisted in your local session. For security, never share your API keys or commit them to source control.
        </p>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-all shadow-xl whitespace-nowrap",
            saved 
              ? "bg-emerald-500 text-white" 
              : "bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20"
          )}
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{saved ? 'Changes Saved' : 'Apply Settings'}</span>
        </button>
      </div>
    </div>
  );
}
