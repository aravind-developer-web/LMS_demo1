import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, User, Brain } from 'lucide-react';
import { Button } from '../ui/Button';
import api from '../../services/api';

const KNOWLEDGE_BASE = [
    { keywords: ['hello', 'hi', 'hey'], response: "Greetings, Intelligence Unit. I am the Neural Oracle. How can I accelerate your learning trajectory today?" },
    { keywords: ['stuck', 'help', 'difficult'], response: "Struggle is the precursor to structural mastery. I suggest reviewing the core principles of GenAI in the 'Fundamentals' node. You've got this!" },
    { keywords: ['quiz', 'test', 'validation'], response: "Validation tiers are designed to confirm your precision. Ensure you've completed all video resources before initiating a neural check." },
    { keywords: ['assignment', 'research'], response: "Research nodes require deep focus. I've noted that high-performing units often take notes in the sidebar while processing external links." },
    { keywords: ['who are you', 'oracle'], response: "I am a cognitive layer integrated into the Neural Intelligence OS, dedicated to ensuring your intellectual velocity remains optimal." },
    { keywords: ['thank', 'thanks'], response: "Affirmation received. Continue your progression; mastery is inevitable." },
    { keywords: ['progress', 'how am i'], response: "Your telemetry looks promising. Check the 'Neural Matrix' on your dashboard for a visual breakdown of your mastery percentages across all sectors." },
];

const NeuralOracle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Neural Oracle Online. How can I assist your progression today?' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI Thinking
        // Call AI Backend
        api.post('/ai/chat/', {
            message: input,
            history: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', text: m.text }))
        }).then(res => {
            setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
        }).catch(err => {
            console.error(err);
            setMessages(prev => [...prev, { role: 'bot', text: "Neural Link Disrupted. I cannot reach the cognitive core at this moment." }]);
        });
    };

    return (
        <div className="fixed bottom-10 right-10 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-3xl bg-primary text-white shadow-3xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group animate-bounce-subtle"
                >
                    <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                    <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[400px] h-[600px] glass-dark rounded-[48px] border border-white/10 shadow-4xl flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10">
                    {/* Header */}
                    <div className="p-8 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic uppercase tracking-tighter">Neural Oracle</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cognitive Base Active</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-5 rounded-[28px] text-sm font-bold leading-relaxed
                                    ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none shadow-xl'
                                        : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'}`}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-white/[0.03] border-t border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="ASK THE ORACLE..."
                                className="w-full h-14 pl-6 pr-16 rounded-2xl bg-black border border-white/10 focus:border-primary/50 focus:ring-4 ring-primary/10 transition-all outline-none font-black text-[10px] uppercase tracking-widest text-white"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeuralOracle;
