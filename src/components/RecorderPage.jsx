import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Copy, Sparkles, Trash2, Clock, Globe, Cpu, AlertCircle, CheckCircle2, Zap, RefreshCcw, Send } from 'lucide-react';
import { enrichText } from '../services/aiEnrichService';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const WAVE_BARS = 32;

export default function RecorderPage({ settings, saveToHistory }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [status, setStatus] = useState('idle'); // idle | connecting | recording | processing | error
  const [errorMsg, setErrorMsg] = useState('');
  const [waveLevels, setWaveLevels] = useState(Array(WAVE_BARS).fill(4));
  const [recordDuration, setRecordDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [postProcessing, setPostProcessing] = useState(false);
  const [enrichedText, setEnrichedText] = useState('');

  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');
  const isRecordingRef = useRef(false);
  const enrichmentRef = useRef(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    return () => stopRecording();
  }, []);

  useEffect(() => {
    if (enrichedText && enrichmentRef.current) {
      enrichmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [enrichedText]);

  const startWaveAnimation = (analyser) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      const levels = Array.from({ length: WAVE_BARS }, (_, i) => {
        const idx = Math.floor((i / WAVE_BARS) * dataArray.length * 0.4);
        const val = dataArray[idx] / 255;
        return Math.max(4, val * 64);
      });
      setWaveLevels(levels);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopWaveAnimation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setWaveLevels(Array(WAVE_BARS).fill(4));
  };

  const startTimer = () => {
    setRecordDuration(0);
    timerRef.current = setInterval(() => {
      setRecordDuration(d => d + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(1, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    if (!settings.deepgramKey) {
      setErrorMsg('Please enter your Deepgram API key in Settings first.');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const nativeSampleRate = audioCtx.sampleRate;

      const model = settings.deepgramModel || 'nova-2';
      const language = settings.language || 'en-US';
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=${model}&language=${language}&encoding=linear16&sample_rate=${nativeSampleRate}&channels=1&interim_results=true&smart_format=true&punctuate=true`;

      const ws = new WebSocket(wsUrl, ['token', settings.deepgramKey]);
      wsRef.current = ws;

      ws.onopen = () => {
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);

        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const float32 = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(float32.length);
            for (let i = 0; i < float32.length; i++) {
              int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
            }
            ws.send(int16.buffer);
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
        isRecordingRef.current = true;
        setStatus('recording');
        setIsRecording(true);
        startWaveAnimation(analyser);
        startTimer();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const alt = data?.channel?.alternatives?.[0];
          if (!alt) return;
          if (data.is_final) {
            if (alt.transcript) {
              setTranscript(prev => (prev ? prev + ' ' + alt.transcript : alt.transcript).trim());
              setInterimText('');
            }
          } else {
            setInterimText(alt.transcript || '');
          }
        } catch (e) {}
      };

      ws.onerror = (e) => {
        console.error('Deepgram WebSocket Error:', e);
        setErrorMsg('Connection failed. This usually means the API key is invalid or your network is blocking the connection.');
        setStatus('error');
        stopRecording();
      };

      ws.onclose = (e) => {
        console.log('Deepgram WebSocket Closed:', e.code, e.reason);
        if (isRecordingRef.current) {
          setErrorMsg(`Connection closed (Code: ${e.code}). Please verify your Deepgram credits.`);
          setStatus('error');
          stopRecording();
        }
      };
    } catch (err) {
      setErrorMsg(err.name === 'NotAllowedError' ? 'Mic access denied.' : err.message || 'Failed to start.');
      setStatus('error');
    }
  }, [settings]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
    wsRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    stopWaveAnimation();
    stopTimer();
    if (transcriptRef.current?.trim()) saveToHistory(transcriptRef.current);
    setIsRecording(false);
    setInterimText('');
    setStatus('idle');
  }, [saveToHistory]);

  const handleEnrich = async () => {
    if (!transcript.trim()) return;
    setPostProcessing(true);
    setEnrichedText('');
    setErrorMsg('');
    try {
      const result = await enrichText(transcript);
      if (!result) throw new Error("No data fetched");
      setEnrichedText(result);
    } catch (err) {
      setErrorMsg("Failed to fetch enriched data. Please check your connection.");
    } finally {
      setPostProcessing(false);
    }
  };

  const wordCount = (transcript + interimText).trim() ? (transcript + interimText).trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
          )}
          <button
            onClick={() => isRecording ? stopRecording() : startRecording()}
            disabled={status === 'connecting'}
            className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
              isRecording 
                ? "bg-rose-500 hover:bg-rose-600 scale-110" 
                : "bg-primary-500 hover:bg-primary-600 hover:scale-105",
              status === 'connecting' && "opacity-50 cursor-not-allowed"
            )}
          >
            {status === 'connecting' ? (
              <RefreshCcw className="w-10 h-10 text-white animate-spin" />
            ) : isRecording ? (
              <Square className="w-10 h-10 text-white fill-current" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            {isRecording && <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
            <span className={cn("text-lg font-bold tracking-tight", isRecording ? "text-rose-500" : "text-slate-400")}>
              {status === 'recording' ? `Recording ${formatDuration(recordDuration)}` : status === 'connecting' ? 'Connecting...' : 'Ready to record'}
            </span>
          </div>
          <p className="text-sm text-slate-500 italic max-w-xs mx-auto">
            {isRecording ? 'Click to stop and save' : 'Capture your thoughts instantly with high-fidelity speech recognition.'}
          </p>
        </div>
      </div>

      {/* Waveform */}
      <div className="h-16 flex items-center justify-center space-x-1 px-4">
        {waveLevels.map((h, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full bg-primary-500/40 transition-all duration-75",
              isRecording && "bg-primary-500"
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {errorMsg && (
        <div className="glass bg-rose-500/10 border-rose-500/20 p-4 rounded-xl flex items-center space-x-3 text-rose-500 animate-in shake duration-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Transcript Card */}
      <div className="glass-card p-0 overflow-hidden group shadow-2xl shadow-primary-500/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Transcript</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-500">
             <span className="px-2 py-0.5 bg-slate-800 rounded-md">{wordCount} words</span>
             <span className="px-2 py-0.5 bg-slate-800 rounded-md uppercase tracking-tighter">{settings.language || 'en-US'}</span>
          </div>
        </div>
        
        <div className="p-8 min-h-[300px] relative">
          {!transcript && !interimText ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-40">
              <Mic className="w-12 h-12 mb-4" />
              <p className="text-sm">Speak to begin transcription...</p>
            </div>
          ) : (
            <div className="text-xl leading-relaxed text-slate-200">
              <span>{transcript}</span>
              <span className="text-primary-400 opacity-80">{interimText && ` ${interimText}`}</span>
              {isRecording && <span className="inline-block w-1.5 h-6 ml-1 bg-primary-500 rounded-full animate-[pulse_0.8s_infinite] align-middle" />}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
               onClick={() => {
                 navigator.clipboard.writeText(transcript + ' ' + interimText);
                 setCopied(true);
                 setTimeout(() => setCopied(false), 2000);
               }}
               disabled={!transcript && !interimText}
               className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors text-sm font-medium"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
               onClick={() => { setTranscript(''); setInterimText(''); }}
               className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleEnrich}
            disabled={!transcript.trim() || postProcessing}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:opacity-30 rounded-lg shadow-lg shadow-primary-500/20 text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {postProcessing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{postProcessing ? 'Enhancing...' : 'AI Enrich'}</span>
          </button>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">AI Enrich (Hybrid: Wikipedia + AI)</span>
        </div>
      </div>

      {/* AI Enriched Output Card */}
      {(enrichedText || postProcessing) && (
        <div 
          ref={enrichmentRef}
          className="animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto w-full pt-4"
        >
          <div className="glass-card border-primary-500/20 bg-primary-500/5 relative overflow-hidden group p-0">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Sparkles className="w-32 h-32 text-primary-500" />
            </div>
            
            <div className="p-4 border-b border-primary-500/10 flex items-center space-x-3 bg-primary-500/5">
              <div className="p-1.5 bg-primary-500/20 rounded-lg">
                <Cpu className="w-4 h-4 text-primary-500" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Enriched Output</h3>
            </div>

            <div className="p-8">
              {postProcessing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <RefreshCcw className="w-8 h-8 text-primary-500 animate-spin" />
                  <p className="text-primary-400 font-medium animate-pulse">Synthesizing Enhanced Insight...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 text-lg text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {enrichedText}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(enrichedText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied to Clipboard' : 'Copy Enrichment'}</span>
                    </button>
                    <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      Grok-Powered Enhancements
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'ASR Engine', value: `Deepgram ${settings.deepgramModel || 'nova-2'}`, icon: Zap },
          { label: 'Language', value: settings.language || 'English', icon: Globe },
          { label: 'Post-Process', value: settings.grokKey ? settings.postProcessMode : 'Disabled', icon: Sparkles }
        ].map((item, idx) => (
          <div key={idx} className="glass rounded-xl p-4 flex items-center space-x-3">
             <div className="p-2 bg-white/5 rounded-lg text-primary-400">
               <item.icon className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</p>
               <p className="text-sm font-medium text-slate-300">{item.value}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
