import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle, BookOpen, FileText, Video, Lock, ExternalLink, ArrowLeft, ChevronRight, Zap, PlayCircle, Maximize2, Monitor, Layout, Columns, ArrowRight } from 'lucide-react';
import NotesPanel from '../components/module/NotesPanel';
import QAPanel from '../components/module/QAPanel';
import { getEmbedUrl } from '../utils/videoUtils';
import Telemetry from '../utils/telemetry';

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
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModuleData();
    }, [id]);

    // Unified Heartbeat: Sync watch time every 15 seconds
    useEffect(() => {
        if (!activeResource) return;

        const heartbeat = setInterval(async () => {
            try {
                // Pulse sync via Unified Telemetry Wrapper
                await Telemetry.track(id, activeResource.id, {
                    duration_delta: 15,
                    watch_time: watchTime,
                    completed: activeResource.type === 'video' ? watchTime > 30 : true
                });

                // Refresh local progress state
                const progressRes = await api.get(`/modules/${id}/progress/`);
                setProgress(progressRes.data);
            } catch (error) {
                console.error('[Telemetry] Sync failed', error);
            }
        }, 15000);

        return () => clearInterval(heartbeat);
    }, [activeResource, watchTime, id]);

    // Simulated watch time increment
    useEffect(() => {
        if (!activeResource || activeResource.type !== 'video') return;

        const timer = setInterval(() => {
            setWatchTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [activeResource]);

    const fetchModuleData = async () => {
        try {
            setLoading(true);
            setError(null);

            // CRITICAL: Validate auth token exists before attempting fetch
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.warn('[ModulePlayer] No auth token found, redirecting to login');
                navigate('/login');
                return;
            }

            console.log(`[ModulePlayer] Fetching module ${id} with valid token`);

            // 1. Fetch Module Data (Critical)
            let moduleData = null;
            try {
                const res = await api.get(`/modules/${id}/`);
                moduleData = res.data;
                setModule(moduleData);
            } catch (err) {
                console.error('[ModulePlayer] Critical: Failed to load module data', err);
                throw err; // Re-throw to trigger main error screen
            }

            // 2. Fetch Progress (Non-Critical)
            try {
                const res = await api.get(`/modules/${id}/progress/`);
                setProgress(res.data);
            } catch (err) {
                console.warn('[ModulePlayer] Warning: Failed to load progress', err);
                // Don't block
            }

            // 3. Fetch Submissions (Non-Critical)
            try {
                const res = await api.get(`/assignments/modules/${id}/submissions/`);
                setSubmissions(res.data);
            } catch (err) {
                // Ignore
                setSubmissions([]);
            }

            console.log(`[ModulePlayer] Successfully loaded module: ${moduleData.title}`);

            // Log assignment status for debugging
            if (moduleData.is_assigned === false) {
                console.log(`[ModulePlayer] Module not assigned: ${moduleData.assignment_message}`);
            }

            if (moduleData.resources?.length > 0) {
                setActiveResource(moduleData.resources[0]);
            } else {
                console.warn('[ModulePlayer] Module has no resources');
            }

        } catch (error) {
            // Auth errors (401/403/404 with auth) are handled by API interceptor
            // which will force logout and redirect
            // If we reach here, it's a real resource issue (module doesn't exist, etc.)
            console.error('[ModulePlayer] Module fetch error:', error);

            const errorMessage = error.response?.status === 404
                ? 'Module Not Found'
                : error.response?.data?.detail || 'Failed to load module data. Please try again.';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResourceClick = async (resource) => {
        // Reset local watch time for the new resource
        setWatchTime(0);
        setActiveResource(resource);

        try {
            // Signal immediate focus transition
            await Telemetry.track(id, resource.id, {
                completed: resource.type !== 'video' // Non-videos complete on engagement
            });
            const progressRes = await api.get(`/modules/${id}/progress/`);
            setProgress(progressRes.data);
        } catch (error) {
            console.error("[Telemetry] Focus switch failed", error);
        }
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

    if (error) return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-6 p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="text-center space-y-2 max-w-md">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-red-500">
                    {error === 'Module Not Found' ? 'Module Not Found' : 'Module Load Failed'}
                </h2>
                <p className="text-muted-foreground">
                    {error === 'Module Not Found'
                        ? 'The requested knowledge node could not be located in the archives.'
                        : error}
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => fetchModuleData()} className="bg-primary hover:bg-primary/90">
                    Retry Connection
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        </div >
    );

    if (!module) return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-6 p-8">
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-yellow-500">No Module Data</h2>
                <p className="text-muted-foreground max-w-md">The requested module could not be found or contains no data.</p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="bg-primary hover:bg-primary/90">
                Return to Dashboard
            </Button>
        </div>
    );

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

            {/* Assignment Status Info Banner - For Manager Tracking Info Only */}
            {module.is_assigned === false && module.assignment_message && (
                <div className="premium-card bg-blue-500/5 border-blue-500/20 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 mb-1">Open Learning Mode</h3>
                            <p className="text-sm text-white/60 font-medium">You can access all content freely. Progress tracking is managed by your administrator.</p>
                        </div>
                    </div>
                </div>
            )}



            {/* Main Application Interface Grid */}
            <div className={`grid gap-6 md:gap-8 transition-all duration-700 ${isCinemaMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-[380px_1fr]'}`}>

                {/* Curriculum Rail - Hidden in Cinema Mode */}
                {!isCinemaMode && (
                    <div className="flex flex-col gap-6 animate-in">
                        <div className="premium-card bg-card/40 backdrop-blur-2xl border-white/5 flex flex-col h-[700px]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Knowledge Map</h3>
                                    <p className="text-[9px] font-bold text-primary uppercase mt-1">Matrix Active</p>
                                </div>
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
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isAct ? 'text-white/60' : 'text-white/30'}`}>{res.type}</p>
                                                        {isComp && <span className={`text-[8px] font-black uppercase ${isAct ? 'text-white/40' : 'text-primary/60'}`}>• Verified</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/20">
                                    <span>Telemetry Status</span>
                                    <span className="text-primary">Optimized</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Syncing with Neural Core...</p>
                                </div>
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
