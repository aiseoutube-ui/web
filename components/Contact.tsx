
import React, { useRef, useEffect, useState } from 'react';
import type { ContactContent } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";

declare const gsap: any;

// --- CONFIGURACIÓN BACKEND ---
// IMPORTANTE: Reemplaza esta URL con la que obtuviste al hacer Deploy en Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqkiT7sAGfJSRzSUQcxZT3uqc9iU0djuYhDV-6loDg2fv0zTB3PLSI4lmJpIbcs6yp/exec"; 

// --- AUDIO UTILS (Helpers for PCM conversion & Resampling) ---

// Downsampling Function: Converts incoming browser audio (e.g., 44.1k/48k) to Gemini's required 16k
function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
    if (outputRate === inputRate) {
        return buffer;
    }
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        // Use average value of skipped samples (simple anti-aliasing)
        let accum = 0, count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = count > 0 ? accum / count : 0;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

interface ContactProps {
  content: ContactContent;
}

// --- TOOLS DEFINITION ---

const updateProjectInfoTool: FunctionDeclaration = {
    name: "updateProjectInfo",
    description: "Updates the contact form fields based on the conversation.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The user's name or company name." },
            email: { type: Type.STRING, description: "The user's email address." },
            phone: { type: Type.STRING, description: "The user's phone number." },
            budget_extracted: { type: Type.STRING, description: "Any budget or investment figures mentioned (e.g. '5k', 'high end')." },
            project_vision: { type: Type.STRING, description: "The description of what they want to build." },
            isComplete: { type: Type.BOOLEAN, description: "Set to true ONLY when Name, Email, and Project Vision are collected." }
        },
    }
};

const rejectLeadTool: FunctionDeclaration = {
    name: "rejectLead",
    description: "Ends the conversation immediately if the user is wasting time, rude, or refuses to provide mandatory info.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            reason: { type: Type.STRING, description: "Reason for rejection." }
        }
    }
};

const openCalendarTool: FunctionDeclaration = {
    name: "openCalendar",
    description: "Opens the scheduling interface UI on the user's screen. Use this when the user explicitly asks to book a meeting, OR when you have collected all their info and want to propose a meeting as the next step.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            intent: { type: Type.STRING, description: "Short context on why they are booking (e.g. 'Project Discovery', 'Intro Call')." }
        }
    }
};

const Contact: React.FC<ContactProps> = ({ content }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const thankYouRef = useRef<HTMLDivElement>(null);
  const flashOverlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Form States - Added appointmentDate
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', appointmentDate: '' });
  const [honeypot, setHoneypot] = useState(''); // SPAM PROTECTION: Honeypot State
  const [errors, setErrors] = useState({ name: false, email: false, phone: false, message: false });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const lastAudioSentTimeRef = useRef<number>(0);
  
  // UI States
  const [isFocusing, setIsFocusing] = useState(false);
  const isFocusingRef = useRef(false);

  // AI Agent States (Live API)
  const [isAIMode, setIsAIMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSecureLoading, setIsSecureLoading] = useState(false);
  
  // Live Data Extraction States
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const readyToSubmitRef = useRef(false);
  const [showMobileForm, setShowMobileForm] = useState(false); 

  // Scheduling Modal State
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); 
  
  // Calendar Logic State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Message History
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  
  // Refs for Live API
  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  // Audio Nodes
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const isRecordingRef = useRef(false);
  const aiSpeakingRef = useRef(false);

  useEffect(() => { isFocusingRef.current = isFocusing; }, [isFocusing]);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { aiSpeakingRef.current = aiSpeaking; }, [aiSpeaking]);
  useEffect(() => { readyToSubmitRef.current = readyToSubmit; }, [readyToSubmit]);

  // Listen for Global Sasha Open Event
  useEffect(() => {
    const handleOpenSasha = () => {
        if (!isAIMode) {
            toggleAIMode();
            if (window.innerWidth >= 768 && sectionRef.current) {
                sectionRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    window.addEventListener('openSashaAI', handleOpenSasha);
    return () => window.removeEventListener('openSashaAI', handleOpenSasha);
  }, [isAIMode]);

  // Fetch Booked Slots when Modal Opens
  const fetchBookedSlots = async () => {
      try {
          const response = await fetch(GOOGLE_SCRIPT_URL);
          const data = await response.json();
          if (Array.isArray(data)) {
              setBookedSlots(data.map(String)); 
          }
      } catch (e) {
          console.error("Error fetching booked slots", e);
      }
  };

  useEffect(() => {
      if (showScheduler) {
          fetchBookedSlots();
          // Reset to current date on open
          setCurrentCalendarDate(new Date()); 
      }
  }, [showScheduler]);

  // --- GOOGLE SHEETS INTEGRATION (CORS BYPASS) ---
  const sendDataToSheets = async (data: any) => {
      if (!GOOGLE_SCRIPT_URL) {
          console.warn("Falta configurar la URL de Google Apps Script en Contact.tsx");
          return;
      }

      const payload = {
          nombre: data.name,
          email: data.email,
          telefono: data.phone,
          mensaje: data.message,
          fechaCita: data.appointmentDate || "N/A",
          confirmacion: data.confirmation || "No" 
      };

      try {
          await fetch(GOOGLE_SCRIPT_URL, {
              method: "POST",
              mode: "no-cors", 
              headers: {
                  "Content-Type": "text/plain"
              },
              body: JSON.stringify(payload)
          });
          console.log("Datos enviados a Google Sheets con éxito (Modo No-Cors)");
      } catch (error) {
          console.error("Error enviando datos a Sheets:", error);
      }
  };

  // --- CANVAS & PARTICLE SYSTEM ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const particles: any[] = [];
    const particleCount = window.innerWidth < 768 ? 60 : 140; 
    const connectionDistance = window.innerWidth < 768 ? 100 : 180;
    const mouseDistance = 150;

    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId: number;
    let audioLevel = 0;
    const dataArray = new Uint8Array(256);

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number; baseSize: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; 
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
      }
      update(excited: boolean, audioBoost: number) {
        const speedMult = (excited ? 3 : 1) + (audioBoost * 0.15); 
        this.x += this.vx * speedMult;
        this.y += this.vy * speedMult;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDistance - distance) / mouseDistance;
            this.x -= forceDirectionX * force * (excited ? 2 : 1);
            this.y -= forceDirectionY * force * (excited ? 2 : 1);
        }
        this.size = this.baseSize + (audioBoost * 0.08);
      }
      draw(audioBoost: number) {
        if (!ctx) return;
        const _isSpeaking = aiSpeakingRef.current;
        const _isRecording = isRecordingRef.current;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        if (_isSpeaking) ctx.fillStyle = `rgba(0, 255, 255, ${0.8 + audioBoost * 0.01})`; 
        else if (_isRecording) ctx.fillStyle = `rgba(255, 50, 50, ${0.8 + audioBoost * 0.01})`;
        else ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      
      const _isSpeaking = aiSpeakingRef.current;
      const _isRecording = isRecordingRef.current;
      const _isFocusing = isFocusingRef.current;

      let activeAnalyser = null;
      if (_isSpeaking && analyserRef.current) {
          activeAnalyser = analyserRef.current;
      } else if (_isRecording && inputAnalyserRef.current) {
          activeAnalyser = inputAnalyserRef.current;
      }

      if (activeAnalyser) {
          activeAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          audioLevel = sum / dataArray.length;
      } else {
          audioLevel *= 0.9;
      }
      
      const visualBoost = audioLevel * 1.2;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - (distance / connectionDistance);
            
            if (_isSpeaking) {
                ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.6 + (visualBoost * 0.03);
            } else if (_isRecording) {
                 ctx.strokeStyle = `rgba(255, 50, 50, ${opacity})`;
                 ctx.lineWidth = 0.6 + (visualBoost * 0.03);
            } else {
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.35})`;
                ctx.lineWidth = 0.6;
            }

            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        p.update(_isFocusing, visualBoost);
        p.draw(visualBoost);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });
    resizeObserver.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };
    
    sectionRef.current?.addEventListener('mousemove', handleMouseMove);
    return () => {
      resizeObserver.disconnect();
      sectionRef.current?.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); 

  // --- LIVE API SETUP ---
  const initializeAudioContexts = () => {
      if (!inputAudioContextRef.current) {
          inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
          inputAnalyserRef.current.fftSize = 256;
      }
      if (!outputAudioContextRef.current) {
          outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          analyserRef.current = outputAudioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          outputGainRef.current = outputAudioContextRef.current.createGain();
          outputGainRef.current.connect(outputAudioContextRef.current.destination);
      }
  };

  const disconnectLiveSession = () => {
      if (sessionRef.current) { 
          sessionRef.current.close(); 
          sessionRef.current = null; 
      }
      setIsConnected(false);
      stopRecording();
      setAiSpeaking(false);
      setIsProcessing(false);
      setIsRecording(false);
  };

  const connectToLiveAPI = async () => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return;

      initializeAudioContexts();
      clientRef.current = new GoogleGenAI({ apiKey });
      setIsSecureLoading(true); 
      
      const model = 'gemini-2.5-flash-native-audio-preview-09-2025';
      const config = {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
          },
          tools: [{ functionDeclarations: [updateProjectInfoTool, rejectLeadTool, openCalendarTool] }],
          systemInstruction: {
              parts: [{
                  text: `Eres Sasha, una Ejecutiva de Cuentas Senior en 'The Last Art'.
                  
                  TU OBJETIVO:
                  Calificar el lead y LLEVARLO AL CIERRE (Agendar cita).
                  
                  REGLAS DEL JUEGO:
                  1. Obtén Nombre, Email y Visión del Proyecto.
                  2. Sé breve y "al grano".
                  
                  LA ESTRATEGIA "CLOSER" (PROACTIVA):
                  - En cuanto el usuario te dé la información (Nombre, Email, Proyecto), NO te limites a despedirte.
                  - ANALIZA la información rápidamente.
                  - Di algo como: "Entendido. Dado el alcance/urgencia de tu proyecto, sugiero que agendemos una sesión directa con los directores ahora mismo."
                  - E INMEDIATAMENTE ejecuta la herramienta 'openCalendar'.
                  - NO preguntes "¿quieres agendar?", asume el cierre, ofrece la solución y abre el calendario.
                  
                  PERSONALIDAD:
                  - Profesional, eficiente, decisiva.
                  `
              }]
          }
      };

      try {
          const session = await clientRef.current.live.connect({
              model,
              config,
              callbacks: {
                  onopen: () => {
                      setIsConnected(true);
                      setIsSecureLoading(false);
                      if(outputAudioContextRef.current) {
                          nextStartTimeRef.current = outputAudioContextRef.current.currentTime + 0.1;
                      }
                      
                      setTimeout(() => {
                         if (sessionRef.current) {
                             sessionRef.current.sendRealtimeInput({
                                clientContent: {
                                    turns: [{ role: 'user', parts: [{ text: "Saluda como Sasha. Di: 'Hola, soy Sasha. Cuéntame sobre tu proyecto.' (Sé breve)." }] }],
                                    turnComplete: true
                                }
                             });
                         }
                      }, 500);
                  },
                  onmessage: async (msg: LiveServerMessage) => {
                      // --- HANDLE TOOL CALLS ---
                      if (msg.toolCall) {
                          const calls = msg.toolCall.functionCalls;
                          if (calls && calls.length > 0) {
                              calls.forEach(call => {
                                  if (call.name === 'updateProjectInfo') {
                                      const args = call.args as any;
                                      setFormData(prev => {
                                          let newMessage = args.project_vision || prev.message;
                                          if (args.budget_extracted) {
                                              if (!newMessage.includes(args.budget_extracted)) {
                                                  newMessage = `${newMessage} [Presupuesto: ${args.budget_extracted}]`.trim();
                                              }
                                          }
                                          return {
                                              name: args.name || prev.name,
                                              email: args.email || prev.email,
                                              phone: args.phone || prev.phone,
                                              message: newMessage,
                                              appointmentDate: prev.appointmentDate 
                                          };
                                      });
                                      
                                      if (args.isComplete) {
                                          setReadyToSubmit(true);
                                          if (window.innerWidth < 768) setShowMobileForm(true);
                                      }
                                  } else if (call.name === 'rejectLead') {
                                      setTimeout(() => {
                                          disconnectLiveSession();
                                          setIsAIMode(false);
                                      }, 4000);
                                  } else if (call.name === 'openCalendar') {
                                      disconnectLiveSession();
                                      setShowScheduler(true);
                                  }
                              });
                              session.sendToolResponse({
                                  functionResponses: calls.map(call => ({
                                      id: call.id, name: call.name, response: { result: "OK" }
                                  }))
                              });
                          }
                      }

                      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData;
                      if (audioData && outputAudioContextRef.current && outputGainRef.current) {
                          const ctx = outputAudioContextRef.current;
                          setIsProcessing(false);
                          
                          const now = ctx.currentTime;
                          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now + 0.05);

                          const arrayBuffer = base64ToArrayBuffer(audioData.data);
                          const rawInt16 = new Int16Array(arrayBuffer);
                          const float32 = new Float32Array(rawInt16.length);
                          for(let i=0; i<rawInt16.length; i++) float32[i] = rawInt16[i] / 32768;
                          
                          const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
                          audioBuffer.getChannelData(0).set(float32);

                          const source = ctx.createBufferSource();
                          source.buffer = audioBuffer;
                          source.connect(outputGainRef.current);
                          if(analyserRef.current) source.connect(analyserRef.current);
                          
                          if (lastAudioSentTimeRef.current > 0) {
                              const lat = Date.now() - lastAudioSentTimeRef.current;
                              setLatency(lat);
                              lastAudioSentTimeRef.current = 0;
                          }

                          setTimeout(() => {
                              setAiSpeaking(true);
                          }, Math.max(0, (nextStartTimeRef.current - ctx.currentTime) * 1000));

                          source.onended = () => {
                              activeSourcesRef.current.delete(source);
                              if (activeSourcesRef.current.size === 0) {
                                  setAiSpeaking(false);
                              }
                          };
                          source.start(nextStartTimeRef.current);
                          nextStartTimeRef.current += audioBuffer.duration;
                          activeSourcesRef.current.add(source);
                      }

                      if (msg.serverContent?.interrupted) {
                          activeSourcesRef.current.forEach(src => src.stop());
                          activeSourcesRef.current.clear();
                          nextStartTimeRef.current = 0;
                          setAiSpeaking(false);
                          setIsProcessing(false);
                      }
                  },
                  onclose: () => { setIsConnected(false); setIsProcessing(false); },
                  onerror: (err) => { console.error("Live API Error", err); setIsProcessing(false); setIsSecureLoading(false); }
              }
          });
          sessionRef.current = session;
      } catch (e) { setIsProcessing(false); setIsSecureLoading(false); }
  };

  const startRecording = async () => {
      if (!sessionRef.current || !inputAudioContextRef.current) return;
      try {
          await inputAudioContextRef.current.resume();
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setIsRecording(true);
          const ctx = inputAudioContextRef.current;
          const source = ctx.createMediaStreamSource(stream);
          inputSourceRef.current = source;
          
          if (inputAnalyserRef.current) {
              source.connect(inputAnalyserRef.current);
          }

          const inputSampleRate = ctx.sampleRate;
          const targetSampleRate = 16000;

          const processor = ctx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          processor.onaudioprocess = (e) => {
              if (!isRecordingRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              const downsampledData = downsampleBuffer(inputData, inputSampleRate, targetSampleRate);

              const pcm16 = floatTo16BitPCM(downsampledData);
              const base64Params = arrayBufferToBase64(pcm16.buffer);
              
              lastAudioSentTimeRef.current = Date.now();

              sessionRef.current.sendRealtimeInput({
                  media: { mimeType: "audio/pcm;rate=16000", data: base64Params }
              });
          };
          source.connect(processor);
          processor.connect(ctx.destination);
      } catch (e) { setIsRecording(false); }
  };

  const stopRecording = () => {
      setIsRecording(false);
      if (inputSourceRef.current) inputSourceRef.current.disconnect();
      if (processorRef.current) processorRef.current.disconnect();
      setIsProcessing(true);
  };

  const toggleAIMode = async () => {
      if (!isAIMode) {
          setIsAIMode(true);
          setReadyToSubmit(false);
          setFormData({ name: '', email: '', phone: '', message: '', appointmentDate: '' });
          await connectToLiveAPI();
      } else {
          disconnectLiveSession();
          setIsAIMode(false);
          setMessages([]);
          setShowMobileForm(false);
      }
  };

  const handleMicToggle = () => {
      if (isRecording) stopRecording();
      else startRecording();
  };
  
  // --- FORM LOGIC ---
  const validateField = (name: string, value: string) => {
    let hasError = false;
    if (name === 'name') hasError = value.trim() === '' || /\d/.test(value);
    else if (name === 'email') hasError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    else if (name === 'phone') hasError = false;
    else if (name === 'message') hasError = value.trim() === '';
    setErrors(prev => ({ ...prev, [name]: hasError }));
    return hasError;
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocusing(false);
    validateField(e.target.name, e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitted) return;

    // --- SPAM PROTECTION (HONEYPOT & RATE LIMIT) ---
    // 1. Honeypot check
    if (honeypot) {
        console.warn("Spam detected: Honeypot filled.");
        return; // Silently fail
    }

    // 2. Rate Limiting (5 minutes)
    const lastSubmissionTime = localStorage.getItem('last_submission_timestamp');
    if (lastSubmissionTime) {
        const timePassed = Date.now() - parseInt(lastSubmissionTime, 10);
        if (timePassed < 5 * 60 * 1000) { // 5 mins
            alert("Has enviado un mensaje recientemente. Por favor espera unos minutos.");
            return;
        }
    }

    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const messageError = validateField('message', formData.message);
    if (nameError || emailError || messageError) return;
    setIsSubmitted(true);
    
    // SEND TO GOOGLE SHEETS (SINGLE SOURCE OF TRUTH)
    // Now this sends the date too if one was selected
    sendDataToSheets({
        ...formData,
        confirmation: formData.appointmentDate ? "Si" : "No",
        appointmentDate: formData.appointmentDate || "N/A"
    });

    // Set Rate Limit Timestamp
    localStorage.setItem('last_submission_timestamp', Date.now().toString());

    const tl = gsap.timeline();
    tl.to(formContentRef.current, { opacity: 0, y: 50, duration: 0.6, ease: 'power3.in' })
    .to(flashOverlayRef.current, { opacity: 1, duration: 0.5, ease: 'power3.inOut' })
    .to(flashOverlayRef.current, { opacity: 0, duration: 0.5, ease: 'power3.out' })
    .set(formRef.current, { display: 'none' })
    .fromTo(thankYouRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .call(() => {
        if (isAIMode) {
             setTimeout(() => {
                 setIsAIMode(false);
                 setMessages([]);
                 setShowMobileForm(false);
                 setIsSubmitted(false);
             }, 2000);
        }
    });
  };

  const handleConfirmAppointment = () => {
      if (!selectedDate || !selectedTime) {
          alert("Por favor selecciona una fecha y hora para confirmar tu cita.");
          return;
      }

      const year = currentCalendarDate.getFullYear();
      const month = currentCalendarDate.getMonth() + 1; // 1-12 for formatting
      const formattedDate = `${year}-${month}-${selectedDate} ${selectedTime}`; // Matches GAS format

      // 1. UPDATE FORM STATE (Don't send yet)
      setFormData(prev => ({
          ...prev,
          appointmentDate: formattedDate
      }));

      // 2. CLOSE MODAL (Return to form for review)
      setShowScheduler(false);
      setSelectedDate(null);
      setSelectedTime(null);
      
      // 3. ENABLE MOBILE FORM TO SHOW THE DATA
      if (window.innerWidth < 768) setShowMobileForm(true);
      setReadyToSubmit(true); // Enable submit button
  };

  const getStatusColor = (val: string) => val && val.length > 2 ? 'bg-brand-accent shadow-[0_0_8px_#00FFFF]' : 'bg-white/10';
  const getStatusText = (val: string) => val && val.length > 2 ? 'text-brand-accent' : 'text-gray-500';

  // --- CALENDAR LOGIC HELPERS ---
  const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
      // 0 = Sunday, 1 = Monday... but we want Mon=0, Sun=6
      const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      return (day + 6) % 7;
  };

  const getMonthName = (date: Date) => {
      return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  return (
    <section 
      id="contact" 
      ref={sectionRef} 
      className={`relative bg-brand-primary overflow-hidden transition-all duration-500 ease-in-out ${
        isAIMode 
        ? 'fixed inset-0 z-[100] h-[100dvh] w-screen md:relative md:h-auto md:w-full md:inset-auto md:z-auto md:py-20' 
        : 'py-12 md:py-20 h-auto'
      }`}
    >
      {/* ... (Background layer code remains the same) ... */}
      <div className="absolute inset-0 z-0">
          <canvas ref={canvasRef} className="w-full h-full block" />
          
            {/* MOBILE LIVE HUD */}
            {isAIMode && !showMobileForm && (
                <div className="md:hidden absolute top-14 left-4 right-4 z-30 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 grid grid-cols-2 gap-2">
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${getStatusColor(formData.name)}`}></div>
                             <span className={`text-[10px] font-bold uppercase ${getStatusText(formData.name)}`}>Nombre</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${getStatusColor(formData.email)}`}></div>
                             <span className={`text-[10px] font-bold uppercase ${getStatusText(formData.email)}`}>Email</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${getStatusColor(formData.phone)}`}></div>
                             <span className={`text-[10px] font-bold uppercase ${getStatusText(formData.phone)}`}>Teléfono</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full transition-all duration-500 ${getStatusColor(formData.message)}`}></div>
                             <span className={`text-[10px] font-bold uppercase ${getStatusText(formData.message)}`}>Proyecto</span>
                         </div>
                    </div>
                </div>
            )}

            {/* STATUS & CONTROLS */}
            {isAIMode && (
                <div className={`
                    absolute z-30 pointer-events-none px-4
                    left-0 right-0 bottom-0 flex flex-col items-center justify-end pb-8 
                    md:inset-y-0 md:left-0 md:right-auto md:w-1/2 md:items-center md:justify-center md:pb-0
                `}>
                    <div className="mb-6 bg-black/60 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full shadow-lg pointer-events-auto">
                        <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full transition-colors duration-300 
                                ${isSecureLoading ? 'bg-white animate-ping' :
                                  isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#FF0000]' : 
                                  aiSpeaking ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00FFFF]' :
                                  isConnected ? 'bg-green-500 shadow-[0_0_10px_#00FF00]' : 'bg-gray-500'}`}>
                            </div>
                            <span className="text-white font-mono text-xs tracking-[0.2em] uppercase">
                                {isSecureLoading ? 'INICIANDO ENLACE SEGURO...' : 
                                 isRecording ? 'ESCUCHANDO...' : 
                                 (aiSpeaking ? 'HABLANDO...' : 
                                 (isProcessing ? 'ANALIZANDO...' : 'CONECTADO'))}
                                 {latency && <span className="ml-2 opacity-50">({latency}ms)</span>}
                            </span>
                        </div>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-6">
                        <button 
                            onClick={toggleAIMode} 
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 flex items-center justify-center transition-all"
                            aria-label="Salir"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/70">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <button 
                            onClick={handleMicToggle}
                            disabled={!isConnected && !isSecureLoading}
                            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-2xl transform hover:scale-105
                                ${!isConnected && !isSecureLoading
                                    ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                    : (isRecording 
                                        ? 'bg-red-500/20 border-red-500 shadow-[0_0_40px_rgba(255,0,0,0.4)] animate-pulse' 
                                        : 'bg-cyan-500/10 border-cyan-500/50 hover:bg-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.2)]')
                                }`}
                        >
                            <div className={`w-8 h-8 transition-colors duration-300 ${isRecording ? 'text-red-500' : 'text-cyan-400'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                </svg>
                            </div>
                        </button>

                         {readyToSubmit && (
                             <button onClick={() => setShowMobileForm(!showMobileForm)} className="md:hidden w-12 h-12 rounded-full bg-brand-accent/20 border border-brand-accent flex items-center justify-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-accent">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                             </button>
                         )}
                    </div>
                </div>
            )}
      </div>
      
      {/* FORM CONTENT LAYER */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center md:justify-end pointer-events-none">
        <div className={`
            w-full md:w-1/2 pointer-events-auto
            transition-all duration-700
            ${isAIMode 
                ? `fixed md:relative inset-0 md:inset-auto bg-black/90 md:bg-transparent pt-20 md:pt-0 ${showMobileForm ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:translate-y-0 md:opacity-100'}` 
                : 'mb-8 md:mb-0 opacity-100 translate-y-0'
            }
        `}>
            <div ref={containerRef} className="relative group w-full perspective-1000">
                <div className={`absolute -inset-[1px] bg-gradient-to-r from-brand-accent via-purple-600 to-brand-accent rounded-xl blur-sm transition-all duration-1000 ${isAIMode ? 'opacity-100 blur-md animate-pulse' : 'opacity-50 group-hover:opacity-80'}`}></div>
                
                <div className={`relative rounded-xl min-h-[600px] md:min-h-[620px] border shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-500
                    ${isAIMode 
                        ? 'bg-black/60 backdrop-blur-xl border-brand-accent/50 shadow-[0_0_30px_rgba(0,255,255,0.15)]' 
                        : 'bg-black/40 backdrop-blur-md border-white/5'
                    }
                `}>
                    
                    <div className={`p-6 md:p-12 transition-all duration-500 absolute inset-0 opacity-100 overflow-y-auto scrollbar-hide`}>
                        <div ref={formContentRef}>
                            <div className="flex justify-between items-start mb-6">
                                <p className={`font-mono text-xs tracking-widest uppercase border-b pb-3 inline-block transition-colors duration-500 ${isAIMode ? 'text-brand-accent border-brand-accent' : 'text-brand-accent border-brand-accent/10'}`}>
                                    {isAIMode ? '// EXTRACCIÓN DE DATOS EN VIVO' : '// Contacto Corporativo'}
                                </p>
                                
                                {!isAIMode && (
                                    <button onClick={toggleAIMode} className="relative group/btn flex items-center gap-3 bg-white/5 hover:bg-brand-accent/20 border border-brand-accent/30 hover:border-brand-accent rounded-full pl-1 pr-4 py-1 transition-all duration-300">
                                        <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/50 animate-pulse rounded-full"></div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-black relative z-10">
                                                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                            </svg>
                                        </div>
                                        <span className="text-brand-light text-xs font-bold uppercase tracking-wider group-hover/btn:text-brand-accent">
                                            Hablar con Sasha
                                        </span>
                                    </button>
                                )}
                                {isAIMode && (
                                    <button onClick={() => setShowMobileForm(false)} className="md:hidden text-white/50 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
                                {isAIMode ? (readyToSubmit ? 'Propuesta Lista.' : 'Analizando Visión...') : 'Hablemos del Futuro.'}
                            </h2>
                            
                            <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4 mt-6">
                                {/* HONEYPOT FIELD (Hidden) */}
                                <input 
                                    type="text" 
                                    name="website_honey" 
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    className="hidden" 
                                    tabIndex={-1} 
                                    autoComplete="off"
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isAIMode && formData.name ? 'text-brand-accent animate-pulse' : 'text-brand-light/70'}`}>Nombre</label>
                                        <input 
                                            type="text" name="name" id="name" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                            onFocus={() => setIsFocusing(true)} onBlur={handleBlur} 
                                            required placeholder="Tu nombre" 
                                            className={`w-full bg-white/5 border text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-accent/50 transition-all duration-500
                                                ${errors.name ? 'border-red-500' : 'border-white/10'}
                                                ${isAIMode && formData.name ? 'border-brand-accent/50 bg-brand-accent/5 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : ''}
                                            `} 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isAIMode && formData.email ? 'text-brand-accent animate-pulse' : 'text-brand-light/70'}`}>Email</label>
                                        <input 
                                            type="email" name="email" id="email" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                            onFocus={() => setIsFocusing(true)} onBlur={handleBlur} 
                                            required placeholder="nombre@empresa.com" 
                                            className={`w-full bg-white/5 border text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-accent/50 transition-all duration-500
                                                ${errors.email ? 'border-red-500' : 'border-white/10'}
                                                ${isAIMode && formData.email ? 'border-brand-accent/50 bg-brand-accent/5 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : ''}
                                            `} 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isAIMode && formData.phone ? 'text-brand-accent animate-pulse' : 'text-brand-light/70'}`}>Teléfono</label>
                                    <input 
                                        type="tel" name="phone" id="phone" 
                                        value={formData.phone} 
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                        onFocus={() => setIsFocusing(true)} onBlur={handleBlur} 
                                        placeholder="+51 999..." 
                                        className={`w-full bg-white/5 border text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-accent/50 transition-all duration-500
                                            ${errors.phone ? 'border-red-500' : 'border-white/10'}
                                            ${isAIMode && formData.phone ? 'border-brand-accent/50 bg-brand-accent/5 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : ''}
                                        `} 
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isAIMode && formData.message ? 'text-brand-accent animate-pulse' : 'text-brand-light/70'}`}>Visión del Proyecto y Presupuesto</label>
                                    <textarea 
                                        name="message" id="message" 
                                        value={formData.message} 
                                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                                        onFocus={() => setIsFocusing(true)} onBlur={handleBlur} 
                                        required rows={4} placeholder="Cuéntanos qué quieres lograr y tu inversión estimada..." 
                                        className={`w-full bg-white/5 border text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-accent/50 transition-all duration-500
                                            ${errors.message ? 'border-red-500' : 'border-white/10'}
                                            ${isAIMode && formData.message ? 'border-brand-accent/50 bg-brand-accent/5 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : ''}
                                        `}
                                    ></textarea>
                                </div>

                                {/* Appointment Display Block (Visible if date is selected) */}
                                {formData.appointmentDate && (
                                    <div 
                                        onClick={() => setShowScheduler(true)}
                                        className="bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-3 flex items-center gap-3 animate-pulse cursor-pointer hover:bg-brand-accent/20 transition-colors group/appoint"
                                    >
                                        <div className="bg-brand-accent p-2 rounded text-black group-hover/appoint:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                                                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-brand-accent uppercase tracking-wider font-bold">Cita Programada (Click para editar)</p>
                                            <p className="text-white text-sm font-bold">{formData.appointmentDate}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/50 group-hover/appoint:text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </div>
                                )}

                                <div className="pt-2 flex flex-col sm:flex-row gap-4 pb-4">
                                    <button 
                                        type="submit" 
                                        disabled={isAIMode && !readyToSubmit}
                                        className={`flex-1 font-bold uppercase tracking-widest text-xs py-3 rounded-lg transition-all duration-500
                                            ${isAIMode 
                                                ? (readyToSubmit ? 'bg-brand-accent text-black hover:scale-105 animate-pulse shadow-[0_0_20px_#00FFFF]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700') 
                                                : 'bg-brand-accent text-brand-primary hover:scale-105'
                                            }
                                        `}
                                    >
                                        {isAIMode ? (readyToSubmit ? 'Confirmar Propuesta' : 'Negociando...') : 'Enviar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div ref={thankYouRef} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 bg-[#0a0a0a] rounded-xl z-50 border border-brand-accent/50">
                    <div className="text-center"><h3 className="text-white text-2xl font-bold">Mensaje Recibido</h3></div>
                </div>
                <div ref={flashOverlayRef} className="absolute inset-0 bg-brand-accent pointer-events-none opacity-0 z-50 mix-blend-overlay rounded-xl"></div>
            </div>
        </div>
      </div>

      {/* SCHEDULING MODAL (THE "MAGIC HAND-OFF" UI) */}
      {showScheduler && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
            <div className="w-full max-w-4xl bg-[#0a0a0a] border border-brand-accent/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh]">
                
                {/* Left Side: Info */}
                <div className="w-full md:w-1/3 bg-brand-secondary/50 p-8 flex flex-col justify-between border-r border-white/5">
                    <div>
                        <p className="text-brand-accent text-xs font-mono tracking-widest uppercase mb-4">// AGENDANDO CON</p>
                        <h3 className="text-3xl font-bold text-white mb-2">Sasha AI</h3>
                        <p className="text-white/60 text-sm mb-8">Sesión de Estrategia Creativa</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/80">
                                <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-sm">30 Minutos</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <span className="text-sm">Google Meet / Zoom</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <p className="text-xs text-white/40">Datos confirmados:</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                             {formData.name && <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">{formData.name}</span>}
                             {formData.email && <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">{formData.email}</span>}
                        </div>
                    </div>
                </div>

                {/* Right Side: REAL DYNAMIC CALENDAR */}
                <div className="w-full md:w-2/3 p-4 md:p-8 overflow-y-auto bg-[#050505]">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold text-white capitalize">{getMonthName(currentCalendarDate)}</h4>
                        <button onClick={() => setShowScheduler(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                             <svg className="w-6 h-6 text-white/50 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Interactive Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4 text-center text-white/40 text-sm">
                        <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-8">
                         {/* Empty slots for days before the 1st of the month */}
                         {Array.from({ length: getFirstDayOfMonth(currentCalendarDate) }).map((_, i) => (
                             <div key={`empty-${i}`} className="aspect-square"></div>
                         ))}
                         
                         {/* Actual Days */}
                         {Array.from({ length: getDaysInMonth(currentCalendarDate) }).map((_, i) => {
                             const dayNum = i + 1;
                             return (
                                 <button 
                                    key={dayNum} 
                                    onClick={() => setSelectedDate(dayNum)}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all duration-300
                                       ${selectedDate === dayNum 
                                         ? 'bg-brand-accent text-black font-bold shadow-[0_0_15px_#00FFFF] scale-110' 
                                         : 'text-white/60 hover:bg-white/10 hover:text-white'
                                       }
                                 `}>
                                     {dayNum}
                                 </button>
                             );
                         })}
                    </div>

                    <h4 className="text-xl font-bold text-white mb-4">Horarios Disponibles</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {['09:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'].map(time => {
                            // Construct string to match GAS format: YYYY-M-D HH:MM AM/PM
                            // Note: We need to be careful with formatting to match exactly what is saved
                            const year = currentCalendarDate.getFullYear();
                            const month = currentCalendarDate.getMonth() + 1;
                            const dateStringToCheck = `${year}-${month}-${selectedDate} ${time}`; 
                            
                            const isTaken = bookedSlots.some(slot => slot === dateStringToCheck);
                            
                            return (
                                <button 
                                    key={time} 
                                    onClick={() => setSelectedTime(time)}
                                    disabled={!selectedDate || isTaken}
                                    className={`py-2 px-4 border rounded-lg text-sm transition-all duration-300 relative
                                        ${isTaken 
                                            ? 'border-red-900/50 bg-red-900/10 text-white/20 cursor-not-allowed line-through' 
                                            : selectedTime === time 
                                                ? 'border-brand-accent bg-brand-accent/10 text-brand-accent font-bold shadow-[0_0_10px_rgba(0,255,255,0.3)]' 
                                                : 'border-white/20 text-white/80 hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/5'
                                        }
                                    `}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <button 
                            onClick={handleConfirmAppointment} 
                            disabled={!selectedDate || !selectedTime}
                            className={`w-full py-3 font-bold uppercase tracking-widest rounded-lg transition-all duration-300
                                ${(!selectedDate || !selectedTime) 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-brand-accent text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                                }
                            `}
                        >
                            Guardar Fecha
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </section>
  );
};

export default Contact;
