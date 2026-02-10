import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { CheckCircle, ChartBar, BookOpen, Clock, Shield, Users, ArrowRight, PlayCircle, Lock as LockIcon, Sparkles, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

const LandingPage = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-primary/30 overflow-x-hidden">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="text-2xl font-black tracking-tighter flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                            <BookOpen size={22} />
                        </div>
                        <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">LMS</span>
                    </div>
                    <nav className="hidden lg:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
                        <a href="#ecosystem" className="hover:text-primary transition-colors">Ecosystem</a>
                        <a href="#features" className="hover:text-primary transition-colors">Capability</a>
                        <a href="#program" className="hover:text-primary transition-colors">Academy</a>
                    </nav>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard">
                                    <Button className="rounded-full px-8 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all font-black uppercase tracking-widest text-[10px]">
                                        Command Center <Zap className="ml-2" size={14} />
                                    </Button>
                                </Link>
                                <div className="h-8 w-px bg-white/10 mx-2" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Node</span>
                                    <span className="text-xs font-bold text-white uppercase">{user.username}</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Login</Link>
                                <Link to="/register">
                                    <Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-500 text-white border-none font-bold shadow-xl shadow-blue-600/20">
                                        Join Enterprise
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 container mx-auto text-center z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 mb-8 animate-in">
                    <Sparkles size={14} className="animate-spin-slow" />
                    Neural Progress V3.5 Active
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 md:mb-10 leading-[1.05] animate-in">
                    Learning Management <br />
                    <span className="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent italic">System</span>
                </h1>
                <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 md:mb-16 font-medium leading-relaxed animate-in" style={{ animationDelay: '0.1s' }}>
                    The unified intelligence platform where Learner growth meets Managerial precision.
                    Reconnecting the missing links between training and performance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-24 md:mb-32 animate-in" style={{ animationDelay: '0.2s' }}>
                    <Link to="/register" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 text-base md:text-lg font-black rounded-2xl bg-white text-black hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10">
                            Establish Connection <ArrowRight className="ml-3 h-5 w-5" />
                        </Button>
                    </Link>
                    <a href="#ecosystem">
                        <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-slate-300 font-bold">
                            View Ecosystem
                        </Button>
                    </a>
                </div>

                {/* Ecosystem Showcase Section */}
                <div id="ecosystem" className="pt-32 pb-48 grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
                    {/* Learner Ecosystem Card */}
                    <Card className="bg-[#1e293b]/40 backdrop-blur-3xl border-white/5 rounded-[48px] overflow-hidden group hover:border-primary/50 transition-all duration-700 shadow-2xl">
                        <div className="p-12 space-y-8 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                            <div className="w-16 h-16 bg-primary/20 rounded-[20px] flex items-center justify-center text-primary shadow-xl shadow-primary/20 border border-primary/20 group-hover:scale-110 transition-transform">
                                <Users size={32} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Learner <br /> Intelligence</h3>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                                    Personal progress tracking, skill validation, and cinematic learning experiences.
                                </p>
                            </div>
                            <ul className="space-y-4 pt-4">
                                {['Skill Matrix Visualization', 'Personal Note Intelligence', 'Module Progress Sync'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <div className="h-1 w-1 bg-primary rounded-full" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/dashboard" className="block pt-6">
                                <Button className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all">
                                    Enter Learner Node <ChevronRight className="ml-2" size={18} />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Manager Ecosystem Card */}
                    <Card className="bg-[#1e293b]/40 backdrop-blur-3xl border-white/5 rounded-[48px] overflow-hidden group hover:border-blue-500/50 transition-all duration-700 shadow-2xl">
                        <div className="p-12 space-y-8 relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
                            <div className="w-16 h-16 bg-blue-500/20 rounded-[20px] flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/20 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                <ChartBar size={32} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Managerial <br /> Oversight</h3>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-xs">
                                    Team velocity analytics, curriculum management, and predictive success metrics.
                                </p>
                            </div>
                            <ul className="space-y-4 pt-4">
                                {['Unit Velocity Heartbeat', 'Stuck Learner Detection', 'Curriculum Deployment'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <div className="h-1 w-1 bg-blue-500 rounded-full" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/dashboard" className="block pt-6">
                                <Button className="w-full h-16 rounded-2xl bg-blue-600 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                                    Enter Control Center <ChevronRight className="ml-2" size={18} />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Global Status Bar */}
                <div className="w-full h-px bg-white/5 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-[#020617] border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
                        Unified Data Stream Active
                    </div>
                </div>
            </section>

            {/* Capability Cards */}
            <section id="features" className="py-32 relative z-10 border-t border-white/5 bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Enterprise Infrastructure</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium italic">
                            Everything is NOT missing. Precision-engineered stability is here.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { icon: <Zap className="text-yellow-400" />, title: "Instant Deployment", desc: "Launch new modules and assign tracks across your global team in seconds." },
                            { icon: <ChartBar className="text-blue-500" />, title: "Predictive Analytics", desc: "Identify stuck learners before they fall behind with AI-driven insights." },
                            { icon: <ShieldCheck className="text-green-500" />, title: "Skill Validation", desc: "Rigorous quizzes and deep-form assignments for absolute certainty." }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-blue-500/50 transition-all">
                                <div className="bg-[#0f172a] p-10 rounded-[22px] h-full space-y-6 flex flex-col items-center text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold italic uppercase tracking-tighter">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Training Program Section */}
            <section id="program" className="py-32 container mx-auto px-6 relative z-10">
                <div className="bg-[#1e293b]/50 border border-white/10 rounded-[48px] p-8 md:p-16 flex flex-col lg:flex-row gap-20 items-center overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-blue-600/10 blur-[100px] pointer-events-none" />
                    <div className="flex-1 space-y-8 relative z-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                            Neural Intelligence Masterclass
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">GenAI <br /> Professional Track</h2>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed">
                            Master LLM architectures, RAG implementation, and Vector databases
                            in our most rigorous certification program yet.
                        </p>
                        <div className="space-y-4">
                            {[
                                { t: "Transformer Mechanics", d: "Attention, Embeddings & Latency" },
                                { t: "Advanced RAG", d: "Hybrid Search & Re-ranking" },
                                { t: "Agentic Workflows", d: "AutoGPT, LangGraph & Tool Use" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:translate-x-2">
                                    <div className="h-12 w-12 shrink-0 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-black text-sm">{i + 1}</div>
                                    <div>
                                        <p className="font-bold text-lg uppercase tracking-tight">{item.t}</p>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/register">
                            <Button className="mt-6 h-16 px-12 rounded-2xl bg-white text-black hover:bg-slate-200 font-black uppercase tracking-widest text-xs transition-transform hover:scale-105 shadow-xl shadow-white/5">
                                Start Training Now
                            </Button>
                        </Link>
                    </div>
                    <div className="flex-1 w-full lg:max-w-md relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-[32px] blur-3xl -z-10 animate-pulse" />
                        <Card className="bg-black/60 backdrop-blur-3xl rounded-[40px] border border-white/10 p-10 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-500">Fleet Data Feed</h4>
                                    <p className="text-xl font-black italic uppercase tracking-tighter text-white">Live Status</p>
                                </div>
                                <span className="bg-blue-500/10 text-blue-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-500/20">Active</span>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { id: 1, title: "Transformer Logic", progress: 30, enrollments: 120 },
                                    { id: 2, title: "Vector Ops", progress: 60, enrollments: 95 },
                                    { id: 3, title: "RAG Stability", progress: 90, enrollments: 70 }
                                ].map((mod) => (
                                    <div key={mod.id} className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase italic text-slate-300">{mod.title}</span>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <Users size={12} /> {mod.enrollments} Units
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${mod.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Branding & Footer */}
            <footer className="py-20 border-t border-white/5 bg-black/40 z-10 relative">
                <div className="container mx-auto px-6 flex flex-col gap-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div className="space-y-6">
                            <div className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white">
                                    <BookOpen size={20} />
                                </div>
                                <span>LMS</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Restoration of intellectual flow through high-performance engineering.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black uppercase tracking-widest text-xs text-white">Ecosystem</h4>
                            <div className="flex flex-col gap-3 text-sm font-bold text-slate-500">
                                <Link to="/dashboard" className="hover:text-white transition-colors">Learner Node</Link>
                                <Link to="/dashboard" className="hover:text-white transition-colors">Management Control</Link>
                                <a href="#" className="hover:text-white transition-colors">Academy Feed</a>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="font-black uppercase tracking-widest text-xs text-white">Security</h4>
                            <div className="flex flex-col gap-3 text-sm font-bold text-slate-500">
                                <a href="#" className="hover:text-white transition-colors">Neural Encryption</a>
                                <a href="#" className="hover:text-white transition-colors">Skill Validation</a>
                                <a href="#" className="hover:text-white transition-colors">Protocol Status</a>
                            </div>
                        </div>
                        <div className="space-y-6 text-right hidden lg:block">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em] block">Restored Node</span>
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.8em] block">v2026.4.2</span>
                        </div>
                    </div>
                    <div className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] border-t border-white/5 pt-12 text-center">
                        © 2026 Rythu Mitra Intelligence LMS. Engineered for elite performance.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
