import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
    Monitor, Play, ExternalLink, ArrowLeft, Zap,
    Maximize2, PlayCircle, X
} from 'lucide-react';
import { getEmbedUrl } from '../utils/videoUtils';

const BroadcastPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [broadcasts, setBroadcasts] = useState([]);
    const [activeBroadcast, setActiveBroadcast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [watchTime, setWatchTime] = useState(0);

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    useEffect(() => {
        if (broadcasts.length > 0) {
            const found = broadcasts.find(b => b.id.toString() === id);
            setActiveBroadcast(found || broadcasts[0]);
        }
    }, [id, broadcasts]);

    useEffect(() => {
        const timer = setInterval(() => {
            setWatchTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchBroadcasts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/management/broadcasts/');
            setBroadcasts(res.data);
        } catch (error) {
            console.error("Failed to fetch broadcasts", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] gap-4">
            <Zap className="text-primary animate-pulse" size={48} />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Tuning Frequency...</p>
        </div>
    );

    if (!activeBroadcast) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] gap-6">
            <X className="text-red-500" size={48} />
            <h2 className="text-2xl font-black uppercase tracking-tighter text-red-500">Signal Terminated</h2>
            <Button onClick={() => navigate('/dashboard')} variant="outline">Return to Dashboard</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex flex-col gap-8 animate-in">
            {/* Elite Top Navigation Bar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] pl-0 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/20 group-hover:text-primary">
                            <ArrowLeft size={14} />
                        </div>
                        Return to Node
                    </Button>
                    <div className="h-4 w-px bg-white/10" />
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Broadcast Stream</h1>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Satellite Link: 0x{activeBroadcast.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => setIsCinemaMode(!isCinemaMode)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isCinemaMode ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                    >
                        <Monitor size={18} />
                    </Button>
                </div>
            </div>

            {/* Main Application Interface Grid */}
            <div className={`grid gap-8 transition-all duration-700 ${isCinemaMode ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-[380px_1fr]'}`}>

                {/* Lateral Sidebar (Signals) */}
                {!isCinemaMode && (
                    <div className="flex flex-col gap-6 animate-in">
                        <div className="premium-card bg-[#030712]/60 backdrop-blur-3xl border-white/5 flex flex-col h-[700px] p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Incoming Signals</h3>
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {broadcasts.map((bc) => (
                                    <button
                                        key={bc.id}
                                        onClick={() => navigate(`/broadcast/${bc.id}`)}
                                        className={`w-full group text-left p-6 rounded-[32px] border transition-all duration-500 relative overflow-hidden
                                            ${activeBroadcast.id === bc.id ? 'bg-primary border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all
                                                ${activeBroadcast.id === bc.id ? 'bg-white/20' : 'bg-black/40 border border-white/5 group-hover:border-primary/50'}`}>
                                                <PlayCircle size={16} />
                                            </div>
                                            <div className="flex-1 truncate">
                                                <p className={`font-black uppercase tracking-tighter text-xs ${activeBroadcast.id === bc.id ? 'text-white' : 'text-slate-200'}`}>{bc.title}</p>
                                                <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${activeBroadcast.id === bc.id ? 'text-white/60' : 'text-slate-500'}`}>Stream Source</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cinematic Core - Content Display */}
                <div className={`flex flex-col gap-8 transition-all duration-700 ${isCinemaMode ? 'max-w-6xl mx-auto w-full' : ''}`}>
                    <div className="premium-card bg-[#030712]/60 backdrop-blur-3xl border-white/5 min-h-[700px] flex flex-col relative overflow-hidden group/player p-8">

                        {/* Status Bar */}
                        <div className="flex items-center justify-between mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    <Zap size={10} /> Wideband Signal
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">FREQ: 2.4 GHz</span>
                            </div>
                            {activeBroadcast.url && (
                                <a href={activeBroadcast.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                    Source Trace <ExternalLink size={12} />
                                </a>
                            )}
                        </div>

                        {/* Player Container */}
                        <div className="flex-1 flex flex-col">
                            {getEmbedUrl(activeBroadcast.url) ? (
                                <div className="flex-1 flex flex-col h-full space-y-8">
                                    <div className="flex-1 w-full bg-black rounded-[2.5rem] overflow-hidden shadow-3xl border border-white/10 relative">
                                        <iframe
                                            src={getEmbedUrl(activeBroadcast.url)}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">{activeBroadcast.title}</h2>
                                        <p className="text-lg text-white/40 font-medium italic leading-relaxed max-w-4xl">
                                            Incoming broadcast signal from the Unified Command Platform. Authorized for all personnel.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in">
                                    <div className="w-32 h-32 bg-primary/20 rounded-[40px] flex items-center justify-center mb-10 border border-primary/20 shadow-2xl shadow-primary/20">
                                        <ExternalLink size={48} className="text-primary" />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">{activeBroadcast.title}</h2>
                                    <p className="text-xl text-white/40 font-medium mb-12 max-w-md mx-auto">External link detected. Please follow the encrypted bridge to access content.</p>
                                    <a href={activeBroadcast.url} target="_blank" rel="noreferrer">
                                        <Button size="lg" className="h-16 px-12 rounded-3xl bg-white text-black hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest shadow-2xl">
                                            Open External Node <ExternalLink size={20} className="ml-3" />
                                        </Button>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Intelligence Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="premium-card bg-primary/5 p-8 border border-primary/10">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Transmission Info</h4>
                            <p className="text-sm font-bold text-white/60 leading-relaxed uppercase italic">Global broadcast signals are archived for 24 hours. Ensure your neural node is calibrated for optimal retention.</p>
                        </div>
                        <div className="premium-card p-8 border border-white/5">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Telemetry Sync</h4>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                Engagement: <span className="text-primary italic">{watchTime}s Detected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastPlayer;
