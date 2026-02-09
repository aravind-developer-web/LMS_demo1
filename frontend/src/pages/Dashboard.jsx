import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Clock, BookOpen, GraduationCap, Trophy, ArrowRight, Zap, Layout, Monitor, ExternalLink } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModulesAndProgress();
    }, []);

    const fetchModulesAndProgress = async () => {
        try {
            const [modulesRes, progressRes] = await Promise.all([
                api.get('/modules/'),
                api.get('/modules/my-progress/').catch(() => ({ data: [] }))
            ]);
            setModules(modulesRes.data);

            // Convert progress array to lookup object
            const progressMap = {};
            if (progressRes.data && Array.isArray(progressRes.data)) {
                progressRes.data.forEach(p => {
                    progressMap[p.module] = p;
                });
            }
            setProgress(progressMap);
        } catch (error) {
            console.error("Failed to fetch modules", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-muted/50 text-muted-foreground border-border';
        }
    };

    const completedCount = Object.values(progress).filter(p => p.progress_percentage >= 100).length;
    const progressPercentage = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;
    const inProgressModules = Object.values(progress).filter(p => p.progress_percentage > 0 && p.progress_percentage < 100);
    const lastActive = modules.find(m => progress[m.id]?.progress_percentage > 0 && progress[m.id]?.progress_percentage < 100) || modules[0];

    const [showAddModal, setShowAddModal] = useState(false);
    const [personalIntel, setPersonalIntel] = useState(() => {
        const saved = localStorage.getItem('personal_intel');
        return saved ? JSON.parse(saved) : [];
    });
    const [newLink, setNewLink] = useState({ title: '', url: '' });

    const handleAddIntel = (e) => {
        e.preventDefault();
        const updated = [...personalIntel, { ...newLink, id: Date.now() }];
        setPersonalIntel(updated);
        localStorage.setItem('personal_intel', JSON.stringify(updated));
        setShowAddModal(false);
        setNewLink({ title: '', url: '' });
    };

    if (loading) return (
        // ... existing loading UI ...
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Synchronizing your progress...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 animate-in">
            {/* Header: Command Center Intelligence */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="absolute -top-24 -left-20 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter text-foreground italic uppercase">Neural Node</h1>
                    <p className="text-muted-foreground mt-2 text-xl font-medium max-w-xl">Welcome back, {user?.first_name || user?.username}. Your intellectual velocity is currently optimal.</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="rounded-[20px] bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-500 font-black uppercase tracking-widest text-[10px] h-14 px-8 shadow-2xl shadow-primary/10 group"
                    >
                        <Zap size={16} className="mr-2 group-hover:animate-pulse" /> Establish Intel Link
                    </Button>
                    <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-[24px] shadow-2xl h-14">
                        <Zap className="text-primary animate-pulse" size={20} />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Intel Multiplier</span>
                            <span className="font-black italic text-sm text-primary">X{1.2 + (completedCount * 0.1)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-[24px] shadow-2xl h-14">
                        <Clock className="text-orange-500" size={20} />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Streak</span>
                            <span className="font-black italic text-sm">12 DAYS</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-950/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-[24px] shadow-2xl h-14">
                        <Trophy className="text-yellow-500" size={20} />
                        <span className="font-black italic text-sm">{completedCount} Modules Certified</span>
                    </div>
                </div>
            </div>

            {/* Cinematic Hero: Intelligence Resumption */}
            {lastActive && (
                <div className="relative overflow-hidden rounded-[48px] bg-[#030712] border border-white/5 p-12 md:p-16 text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:bg-primary/20 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] -ml-48 -mb-48" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="space-y-6 text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                                <Monitor size={14} className="text-primary" /> Active Knowledge Session
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none italic uppercase">{lastActive?.title || "Begin Your Journey"}</h2>
                            <p className="max-w-2xl text-slate-400 text-lg font-medium leading-relaxed">
                                Accelerate your progress on this intellectual track. High-precision engagement is being tracked for managerial review.
                            </p>
                            <Link to={`/modules/${lastActive?.id}`}>
                                <Button size="lg" className="h-16 px-12 mt-6 rounded-[24px] bg-white text-black hover:bg-primary hover:text-white font-black shadow-2xl transition-all duration-500 group/btn uppercase tracking-widest">
                                    Continue Stream <ArrowRight size={20} className="ml-3 group-hover/btn:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                        </div>

                        <div className="w-full md:w-80 space-y-6 bg-white/5 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10">
                            <div className="flex justify-between text-[10px] font-black opacity-60 uppercase tracking-[0.4em]">
                                <span>Sync Progress</span>
                                <span className="text-primary">{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="h-5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-center gap-3 py-2 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Encryption Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Intel Grid: Knowledge & Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">

                {/* Curriculum Stack */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <Layout size={20} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter italic uppercase">Intelligence Tracks</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {modules.map((module) => {
                            const moduleProgress = progress[module.id];
                            const progressPct = moduleProgress?.progress_percentage || 0;
                            const status = progressPct >= 100 ? 'completed' : progressPct > 0 ? 'in_progress' : 'not_started';

                            // Extract YouTube thumbnail if available
                            const firstVideoResource = module.resources?.find(r => r.type === 'video');
                            const videoId = firstVideoResource?.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?\&]v=)|youtu\.be\/)([^"\&?\/ ]{11})/)?.[1];
                            const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

                            return (
                                <Link key={module.id} to={`/modules/${module.id}`}>
                                    <Card className="group premium-card bg-[#030712] border-white/5 hover:border-primary/50 transition-all duration-700 overflow-hidden p-0">
                                        <div className="flex h-32 md:h-28">
                                            {thumbnail && (
                                                <div className="w-48 h-full relative overflow-hidden flex-shrink-0 hidden md:block">
                                                    <img src={thumbnail} alt={module.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                                    <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:scale-125 transition-transform" size={32} />
                                                </div>
                                            )}
                                            <div className={`w-2 transition-all duration-700 ${status === 'completed' ? 'bg-green-500' : status === 'in_progress' ? 'bg-primary' : 'bg-slate-800'} group-hover:w-4`} />
                                            <div className="flex-1 p-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                                                        <span className={`px-2.5 py-1 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest border border-white/5 ${getStatusStyles(status)}`}>
                                                            {status.replace('_', ' ')}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                                                            {module.resources?.length || 0} Resources
                                                        </span>
                                                        {module.difficulty && (
                                                            <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-500 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">
                                                                {module.difficulty}
                                                            </span>
                                                        )}
                                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">NODE::0X{module.id}7F</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black tracking-tight uppercase truncate italic group-hover:text-primary transition-colors">{module.title}</h3>
                                                    {progressPct > 0 && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                                                            </div>
                                                            <span className="text-[9px] font-black text-primary">{Math.round(progressPct)}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="hidden md:flex flex-col items-end">
                                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Duration</span>
                                                        <span className="text-xs font-black text-white/60">{module.duration ? `${module.duration} min` : 'Variable'}</span>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-500">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Personal Vault Overlay */}
                    {personalIntel.length > 0 && (
                        <div className="pt-12 space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 px-4">Local Intelligence Vault</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {personalIntel.map((intel) => (
                                    <a
                                        key={intel.id}
                                        href={intel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group p-8 rounded-[40px] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 transition-all duration-700 shadow-2xl h-44 flex flex-col justify-between relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                                        <div className="space-y-4 relative z-10">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                                <ExternalLink size={18} />
                                            </div>
                                            <h4 className="font-black text-xl uppercase italic group-hover:text-blue-400 transition-colors truncate">{intel.title}</h4>
                                        </div>
                                        <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                            External Intelligence Node <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lateral Sidebar Intelligence */}
                <div className="space-y-12">
                    {/* Neural Competency Matrix */}
                    <div className="premium-card bg-[#030712] p-10 space-y-8 border-white/5">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Neural Matrix</h3>
                            <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">Global Rank: ALPHA</p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { skill: "Core Engine", val: progressPercentage + 15, color: "bg-primary" },
                                { skill: "Systems Integration", val: 45, color: "bg-purple-500" },
                                { skill: "Neural Safety", val: 30, color: "bg-red-500" },
                                { skill: "Deployment Mastery", val: 20, color: "bg-blue-400" }
                            ].map((s, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                                        <span>{s.skill}</span>
                                        <span className="text-white/80 italic">{Math.round(s.val)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${s.color} transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${s.val}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievement Archive */}
                    <div className="premium-card bg-gradient-to-br from-primary/10 to-transparent p-10 flex items-center gap-8 border-primary/10 group cursor-default">
                        <div className="w-20 h-20 bg-primary/20 rounded-[30px] flex items-center justify-center border border-primary/20 text-primary shadow-2xl group-hover:scale-110 transition-transform duration-700">
                            <Trophy size={40} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Node Master</h4>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Precision Excellence Unlocked</p>
                            <div className="flex gap-1.5 mt-3">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-2.5 h-1 rounded-full bg-primary/30" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
