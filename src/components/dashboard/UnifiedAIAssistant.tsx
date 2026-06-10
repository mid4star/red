'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, MicOff, Loader2, BarChart2, PieChart as PieChartIcon, Activity, Database, Sparkles, User as UserIcon } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';

interface ChartSeries {
  key: string;
  color: string;
  name?: string;
}

interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'area';
  data: any[];
  xAxisKey: string;
  series: ChartSeries[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chartConfig?: ChartConfig;
  sqlQuery?: string; // For debugging/transparency
}

export default function UnifiedAIAssistant({ lang }: { lang: string }) {
  const isArabic = lang === 'ar';
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load user session
  useEffect(() => {
    try {
      const raw = localStorage.getItem('active_user_session');
      if (raw) {
        const session = JSON.parse(raw);
        const name = isArabic ? (session.nameAr || session.name) : (session.name || 'User');
        setUserName(name);
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: isArabic 
              ? `أهلاً بك يا ${name} في المساعد الذكي الموحد. أنا متصل بجميع قواعد بيانات المنصة (الدوريات، المخالفات، المسوحات البيئية، والمزيد). كيف يمكنني مساعدتك اليوم؟`
              : `Welcome ${name} to the Unified AI Assistant. I am connected to all platform databases (Patrols, Violations, Surveys, etc.). How can I help you today?`
          }
        ]);
      }
    } catch (e) {}
  }, [isArabic]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = isArabic ? 'ar-EG' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, [isArabic]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome' && !m.content.startsWith('عذراً') && !m.content.startsWith('Sorry'))
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content, lang, userName, history })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        chartConfig: data.chartConfig,
        sqlQuery: data.sqlQuery
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isArabic ? 'عذراً، حدث خطأ أثناء الاتصال بقاعدة البيانات الذكية: ' + error.message : 'Sorry, an error occurred while connecting to the smart database: ' + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const renderChart = (config: ChartConfig) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.2)" />
              <XAxis dataKey={config.xAxisKey} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', border: 'none'}} />
              <Legend wrapperStyle={{fontSize: '12px', fontWeight: 600}} />
              {config.series.map((s, idx) => (
                <Bar key={s.key} dataKey={s.key} name={s.name || s.key} fill={s.color || COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={config.data} 
                dataKey={config.series[0]?.key} 
                nameKey={config.xAxisKey} 
                cx="50%" cy="50%" 
                outerRadius={80} 
                fill="#8884d8"
                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {config.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', border: 'none'}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={config.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.2)" />
              <XAxis dataKey={config.xAxisKey} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', border: 'none'}} />
              <Legend />
              {config.series.map((s, idx) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || COLORS[idx % COLORS.length]} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col border border-indigo-500/30 shadow-2xl bg-gradient-to-br from-th-surface via-th-surface to-indigo-900/10 backdrop-blur-2xl rounded-3xl overflow-hidden min-h-[450px] relative" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-th-border bg-th-surface2/50 backdrop-blur-md relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-xl blur opacity-50 animate-pulse" />
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl relative text-white shadow-lg">
            <Sparkles size={24} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-th-text dark:text-white flex items-center gap-2">
            {isArabic ? 'المساعد الذكي الموحد' : 'Unified AI Assistant'}
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 text-[10px] uppercase font-bold tracking-widest border border-indigo-500/30">
              Beta
            </span>
          </h2>
          <p className="text-xs font-semibold text-th-muted flex items-center gap-1.5 mt-0.5">
            <Database size={12} className="text-teal-500" />
            {isArabic ? 'متصل بجميع قواعد بيانات الأقسام' : 'Connected to all department databases'}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'user' 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              }`}>
                {msg.role === 'user' ? <UserIcon size={18} /> : <Bot size={20} />}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed prose prose-sm dark:prose-invert max-w-none ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm rtl:rounded-tl-sm rtl:rounded-tr-2xl'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm rtl:rounded-tr-sm rtl:rounded-tl-2xl'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="m-0 mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="m-0 mb-2 list-disc list-inside space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="m-0 mb-2 list-decimal list-inside space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="m-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-black text-indigo-700 dark:text-indigo-300" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Chart Rendering */}
                {msg.chartConfig && (
                  <div className="w-full mt-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md">
                    <div className="mb-4 flex items-center gap-2 text-indigo-500">
                      {msg.chartConfig.type === 'pie' ? <PieChartIcon size={18} /> : <BarChart2 size={18} />}
                      <span className="text-xs font-bold uppercase tracking-widest">{isArabic ? 'رسم بياني تحليلي' : 'Analytical Chart'}</span>
                    </div>
                    {renderChart(msg.chartConfig)}
                  </div>
                )}
                
                {/* Optional SQL Query Debug info */}
                {msg.sqlQuery && process.env.NODE_ENV === 'development' && (
                  <div className="w-full mt-1 p-3 bg-slate-950 rounded-xl text-slate-400 font-mono text-[10px] overflow-x-auto opacity-50 hover:opacity-100 transition-opacity">
                    {msg.sqlQuery}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex gap-4 ${isArabic ? '' : ''}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm rtl:rounded-tr-sm rtl:rounded-tl-2xl">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-th-border bg-th-surface/80 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className={`p-3 rounded-xl border ${isListening ? 'bg-rose-500/20 text-rose-500 border-rose-500/50 animate-pulse' : 'bg-th-surface2 text-th-muted hover:text-indigo-500 border-transparent hover:border-indigo-500/30'}`}
            onClick={toggleListening}
            title={isArabic ? 'إدخال صوتي' : 'Voice Input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>

          <div className="flex-1 relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isArabic ? (isListening ? 'جاري الاستماع...' : 'اسأل عن الدوريات، المخالفات، المسوحات...') : (isListening ? 'Listening...' : 'Ask about patrols, violations, surveys...')}
              className="w-full bg-th-surface2 border border-th-border rounded-2xl px-5 py-3.5 text-sm text-th-text placeholder:text-th-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
              disabled={isLoading || isListening}
            />
          </div>

          <Button 
            className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} className={isArabic ? 'rotate-180' : ''} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
