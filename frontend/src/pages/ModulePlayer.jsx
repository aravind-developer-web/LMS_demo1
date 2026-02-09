import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle, BookOpen, FileText, Video, Lock, ExternalLink, ArrowLeft, ChevronRight, Zap, PlayCircle, Maximize2, Monitor, Layout, Columns, ArrowRight } from 'lucide-react';
import NotesPanel from '../components/module/NotesPanel';
import QAPanel from '../components/module/QAPanel';

const ModulePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [progress, setProgress] = useState(null);
    const [activeResource, setActiveResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [watchTime, setWatchTime] = useState(0);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [activeTab, setActiveTab] = useState('notes');

    useEffect(() => {
        fetchModuleData();
    }, [id]);

    // Heartbeat: Sync watch time every 15 seconds if it's a video
    useEffect(() => {
        let interval;
        if (activeResource?.type === 'video' && watchTime > 0) {
            interval = setInterval(async () => {
                try {
                    await api.post(`/modules/${id}/resources/${activeResource.id}/update-progress/`, {
                        watch_time: watchTime,
                        last_position: 0
                    });
                } catch (e) {
                    console.error("Heartbeat sync failed", e);
                }
            }, 15000);
        }
        return () => clearInterval(interval);
    }, [activeResource, watchTime, id]);

    // Simulated watch time increment
    useEffect(() => {
        let timer;
        if (activeResource?.type === 'video') {
            timer = setInterval(() => {
                setWatchTime(prev => prev + 1);
            }, 1000);
        } else {
            setWatchTime(0);
        }
        return () => clearInterval(timer);
    }, [activeResource]);

    const fetchModuleData = async () => {
        try {
            setLoading(true);
            const [moduleRes, progressRes, submissionRes] = await Promise.all([
                api.get(`/modules/${id}/`),
                api.get(`/modules/${id}/progress/`),
                api.get(`/assignments/modules/${id}/submissions/`).catch(() => ({ data: [] }))
            ]);
            setModule(moduleRes.data);
            setProgress(progressRes.data);
            setSubmissions(submissionRes.data);
            if (moduleRes.data.resources?.length > 0) {
                setActiveResource(moduleRes.data.resources[0]);
            }
        } catch (error) {
            console.error("Failed to load module", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResourceClick = async (resource) => {
        setActiveResource(resource);
        try {
            await api.post(`/modules/${id}/resources/${resource.id}/complete/`);
            const progressRes = await api.get(`/modules/${id}/progress/`);
            setProgress(progressRes.data);
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        return match && match[1] ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1` : null;
    };

    const handleQuizStart = () => {
        navigate(`/modules/${id}/quiz`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary font-black uppercase tracking-widest text-[10px]">Synchronizing Neural Sub-System...</p>
        </div>
    );

    if (!module) return <div className="p-20 text-center font-black uppercase tracking-widest text-red-500">Node Corruption Detected</div>;

    const allResourcesDone = module?.resources.every(res =>
        progress?.resources_progress?.find(rp => rp.resource_id === res.id)?.completed
    );

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col gap-6 animate-in">
            {/* Elite Top Navigation Bar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 text-muted-foreground hover:text-foreground font-black uppercase tracking-widest text-[10px] pl-0 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/20 group-hover:text-primary">
                            <ArrowLeft size={14} />
                        </div>
                        Terminate Session
                    </Button>
                    <div className="h-4 w-px bg-white/10" />
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">{module.title}</h1>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Intelligence Tracking Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Efficiency</span>
                        <span className="text-xs font-black text-primary italic">{Math.round((progress?.resources_progress?.filter(r => r.completed).length / module.resources.length) * 100)}%</span>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => setIsCinemaMode(!isCinemaMode)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isCinemaMode ? 'bg-primary border-primary text-primary-foreground' : 'bg-white/5 border-white/5 text-muted-foreground hover:text-white'}`}
                    >
                        <Monitor size={18} />
                    </Button>
                </div>
            </div>

            {/* Main Application Interface Grid */}
            <div className={`grid gap-8 transition-all duration-700 ${isCinemaMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[380px_1fr]'}`}>

                {/* Curriculum Rail - Hidden in Cinema Mode */}
                {!isCinemaMode && (
                    <div className="flex flex-col gap-6 animate-in">
                        <div className="premium-card bg-card/40 backdrop-blur-2xl border-white/5 flex flex-col h-[700px]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Knowledge Map</h3>
                                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${(progress?.resources_progress?.filter(r => r.completed).length / module.resources.length) * 100}%` }} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {module.resources.map((res, idx) => {
                                    const isComp = progress?.resources_progress?.find(rp => rp.resource_id === res.id)?.completed;
                                    const isAct = activeResource?.id === res.id;
                                    return (
                                        <button
                                            key={res.id}
                                            onClick={() => handleResourceClick(res)}
                                            className={`w-full group text-left p-5 rounded-3xl border transition-all duration-500 relative overflow-hidden
                                                ${isAct ? 'bg-primary border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                        >
                                            {isAct && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />}
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all
                                                    ${isAct ? 'bg-white/20' : 'bg-black/40 border border-white/5 group-hover:border-primary/50'}`}>
                                                    {isComp ? <CheckCircle size={16} className={isAct ? 'text-white' : 'text-primary'} /> : (res.type === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />)}
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <p className={`font-black uppercase tracking-tighter text-xs ${isAct ? 'text-white' : 'text-white/80'}`}>{res.title}</p>
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isAct ? 'text-white/60' : 'text-white/30'}`}>{res.type}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cinematic Core - Content Display */}
                <div className={`flex flex-col gap-8 transition-all duration-700 ${isCinemaMode ? 'max-w-6xl mx-auto w-full' : ''}`}>
                    <div className="premium-card bg-slate-950/60 backdrop-blur-3xl border-white/5 min-h-[700px] flex flex-col relative overflow-hidden group/player">

                        {/* Status Bar */}
                        <div className="flex items-center justify-between mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    <Zap size={10} /> Live Data Feed
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Resource ID: 0x{activeResource?.id}</span>
                            </div>
                            {activeResource?.url && (
                                <a
                                    href={activeResource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                                >
                                    Direct Intelligence Link <ExternalLink size={12} />
                                </a>
                            )}
                        </div>

                        {/* Player/Renderer Container */}
                        <div className="flex-1 flex flex-col">
                            {activeResource?.type === 'video' && getEmbedUrl(activeResource.url) ? (
                                <div className="flex-1 flex flex-col h-full space-y-8">
                                    <div className="flex-1 w-full bg-black rounded-[2.5rem] overflow-hidden shadow-3xl border border-white/10 relative group/video">
                                        <iframe
                                            src={getEmbedUrl(activeResource.url)}
                                            title={activeResource.title}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">{activeResource.title}</h2>
                                        <p className="text-lg text-white/60 font-medium italic leading-relaxed max-w-4xl">
                                            "{activeResource.description || "Intelligence session in progress. Maintain focus for optimal neural retention."}"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in">
                                    <div className="w-32 h-32 bg-primary/20 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl shadow-primary/20 border border-primary/20 group-hover/player:scale-110 transition-transform duration-700">
                                        {activeResource?.type === 'pdf' ? <FileText size={48} className="text-primary" /> : <BookOpen size={48} className="text-primary" />}
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">{activeResource?.title || "Initialize Connection"}</h2>
                                    <p className="text-xl text-white/40 font-medium mb-12 max-w-md mx-auto">Accessing secure external node for high-precision resource hydration.</p>
                                    {activeResource?.url && (
                                        <Button asChild size="lg" className="h-16 px-12 rounded-3xl bg-white text-black hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest shadow-2xl group/btn">
                                            <a href={activeResource.url} target="_blank" rel="noreferrer">
                                                Open Document Node <ExternalLink size={20} className="ml-3 group-hover/btn:rotate-12 transition-transform" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Intelligence Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="premium-card bg-primary/5 hover:bg-primary/10 transition-colors">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Neural Feedback</h4>
                            <p className="text-sm font-bold text-white/70 leading-relaxed uppercase italic">Every structural node completion enhances your global engineering rank. Stay engaged with the tracker to avoid stale-state alerts.</p>
                        </div>
                        <div className="premium-card">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Activity Log</h4>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                Session Syncing: <span className="text-primary italic">{watchTime}s Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!isCinemaMode && (
                    <div className="w-full flex-shrink-0 animate-in delay-200 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <div className="flex bg-black/40 border border-white/5 rounded-t-2xl overflow-hidden mb-px">
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-primary/20 text-primary shadow-[inset_0_-2px_0_0_rgba(var(--primary))]' : 'bg-transparent text-white/20 hover:bg-white/5 hover:text-white/60'}`}
                                >
                                    Archive / Notes
                                </button>
                                <button
                                    onClick={() => setActiveTab('qa')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'qa' ? 'bg-primary/20 text-primary shadow-[inset_0_-2px_0_0_rgba(var(--primary))]' : 'bg-transparent text-white/20 hover:bg-white/5 hover:text-white/60'}`}
                                >
                                    Neural Net / Q&A
                                </button>
                            </div>
                            <div className="premium-card bg-black/40 border-white/5 h-[500px] flex flex-col p-0 overflow-hidden rounded-t-none">
                                {activeTab === 'notes' ? <NotesPanel moduleId={id} /> : <QAPanel moduleId={id} />}
                            </div>
                        </div>

                        {/* Directives Section (Quiz & Assignment) */}
                        <div className="space-y-4">
                            {module.has_assignment && (
                                <div className="premium-card bg-purple-500/5 border-purple-500/20 p-6 rounded-3xl relative overflow-hidden group hover:bg-purple-500/10 transition-colors">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all" />
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2 flex items-center gap-2">
                                        <FileText size={10} /> Active Directive
                                    </h4>
                                    <p className="text-sm font-bold text-white mb-4 italic">Manager Assignment Pending Analysis</p>
                                    <Button
                                        onClick={() => navigate(`/modules/${id}/assignment`)}
                                        className="w-full h-10 bg-purple-500 hover:bg-purple-400 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-purple-500/20"
                                    >
                                        Engage Protocol <ArrowRight size={12} className="ml-2" />
                                    </Button>
                                </div>
                            )}

                            {module.has_quiz && (
                                <div className="premium-card bg-blue-500/5 border-blue-500/20 p-6 rounded-3xl relative overflow-hidden group hover:bg-blue-500/10 transition-colors">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all" />
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2 flex items-center gap-2">
                                        <CheckCircle size={10} /> Neural Validation
                                    </h4>
                                    <p className="text-sm font-bold text-white mb-4 italic">Knowledge Check Available</p>
                                    <Button
                                        onClick={handleQuizStart}
                                        className="w-full h-10 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-blue-500/20"
                                    >
                                        Initiate Scan <Maximize2 size={12} className="ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ModulePlayer;
