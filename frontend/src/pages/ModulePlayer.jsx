import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const ModulePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);
    const [saving, setSaving] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Tracking State
    const [videoProgress, setVideoProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const focusTimerRef = useRef(0);
    const lastActivityRef = useRef(Date.now());

    useEffect(() => {
        const startSession = async () => {
            try {
                // Initial ping to start session
                const res = await api.post('/analytics/session/ping/', { module_id: id });
                setSessionId(true); // just a flag that it started
            } catch (e) {
                console.error("Session Initialization Failed");
            }
        };

        fetchModuleData();
        startSession();

        // Focus Tracking Heartbeat (Every 10s)
        const heartbeatInterval = setInterval(() => {
            if (sessionId) {
                api.post(`/analytics/session/ping/`, {
                    module_id: id
                }).catch(e => console.warn("Heartbeat dropped"));
            }
        }, 10000);

        return () => {
            clearInterval(heartbeatInterval);
        };
    }, [id, sessionId]);

    const fetchModuleData = async () => {
        try {
            const [modRes, notesRes] = await Promise.all([
                api.get(`/modules/${id}/`),
                api.get(`/notes/module/${id}/`).catch(() => ({ data: { content: '' } }))
            ]);
            console.log('🎥 Module Data:', modRes.data);
            console.log('🎥 Video URL:', modRes.data.video_url);
            setModule(modRes.data);
            setNotes(notesRes.data.content || '');
        } catch (error) {
            console.error("Error fetching module:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoProgress = (state) => {
        // state.played is 0-1
        const pct = state.played * 100;
        setVideoProgress(pct);
        setDuration(state.loadedSeconds); // Approximate

        // Send updates every 5% or so? For now let's rely on interval or just send it?
        // Actually, let's send it every 10 seconds via the heartbeat loop if we want, OR
        // send it here but throttled.
        // For simplicity compliance with the prompt "Send progress update every 10 seconds",
        // we can do it in the heartbeat, BUT we also need to send exact video progress.

        // Let's debounce/throttle this call ideally, but for now let's just update local state
        // and have a separate interval send the video progress.

        // Actually, the prompt says "In ModulePlayer: Send progress update every 10 seconds... Use POST /api/progress/video-update/"
        // So let's add that to the interval above or a new one.
    };

    // New effect for video progress sync
    useEffect(() => {
        const videoInterval = setInterval(() => {
            if (videoProgress > 0 && module?.video_url) {
                // Extract video ID again or store it
                let videoId = '';
                try {
                    const url = new URL(module.video_url);
                    videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                } catch (e) { }

                if (videoId) {
                    api.post('/analytics/progress/video-update/', {
                        video_id: videoId,
                        module_id: id,
                        watched_seconds: (videoProgress / 100) * (duration || 300), // approx
                        total_seconds: duration || 300
                    }).catch(e => { });
                }
            }
        }, 10000);
        return () => clearInterval(videoInterval);
    }, [videoProgress, duration, module, id]);


    const handleVideoEnded = () => {
        setVideoProgress(100);
        // Immediately sync completion
        let videoId = '';
        try {
            const url = new URL(module.video_url);
            videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        } catch (e) { }

        if (videoId) {
            api.post('/analytics/progress/video-update/', {
                video_id: videoId,
                module_id: id,
                watched_seconds: duration || 300,
                total_seconds: duration || 300
            });
        }
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            await api.post(`/notes/module/${id}/save/`, { content: notes });
            showToast("Digital notes synchronized successfully.", "success");
        } catch (error) {
            showToast("Failed to synchronize notes.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleComplete = async () => {
        try {
            await api.post(`/progress/complete-module/`, { module_id: id });
            showToast("Module achievement recorded!", "success");
            setTimeout(() => navigate('/dashboard'), 1000); // Delay to show toast
        } catch (error) {
            showToast("Failed to record completion.", "error");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Initializing Studio Interface...</p>
        </div>
    );
    if (!module) return <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest">Signal Lost: Module Not Found</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group">
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{module.title}</h1>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-tight mt-0.5">Course Module ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate(`/modules/${id}/assignment`)}
                        className="bg-white text-gray-900 border border-gray-200 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        Access Protocol
                    </button>
                    <button
                        onClick={handleComplete}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98] flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Complete Session
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                {/* Visual Content Hub */}
                <div className="space-y-6">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
                        {(() => {
                            console.log('🎥 Module Data:', module);
                            console.log('🎥 Video URL:', module?.video_url);

                            if (!module?.video_url) {
                                return (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 italic p-12 text-center bg-gray-900">
                                        <div className="space-y-3">
                                            <svg className="w-10 h-10 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            <p className="text-xs font-medium uppercase tracking-wider">No video URL available</p>
                                        </div>
                                    </div>
                                );
                            }

                            // Extract YouTube video ID from URL
                            let videoId = '';
                            try {
                                const url = new URL(module.video_url);
                                videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
                                console.log('📺 YouTube Video ID:', videoId);
                            } catch (e) {
                                console.error('Error parsing video URL:', e);
                            }

                            if (!videoId) {
                                return <div className="w-full h-full flex items-center justify-center text-white">Invalid video URL</div>;
                            }

                            // Use iframe instead of ReactPlayer
                            const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
                            console.log('🎬 Embed URL:', embedUrl);

                            return (
                                <iframe
                                    src={embedUrl}
                                    title="Module Video"
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            );
                        })()}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/20"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </span>
                            Curriculum Overview
                        </h2>
                        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed font-normal">
                            {module.description}
                        </div>
                    </div>
                </div>

                {/* Analysis & Workspace */}
                <div className="space-y-6 h-full font-sans">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[480px] h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Executive Workspace</h3>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-tight">Active Analysis Mode</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </div>
                        </div>
                        <textarea
                            className="flex-1 w-full p-5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:bg-white outline-none transition-all resize-none text-sm font-normal leading-relaxed text-gray-800 placeholder:text-gray-400"
                            placeholder="Synthesize your module findings here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleSaveNotes}
                            disabled={saving}
                            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                            {saving ? 'Synchronizing...' : 'Save Workspace'}
                        </button>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Module Protocol</h4>
                        <ul className="space-y-3">
                            {[
                                "Synthesize curriculum primary stream",
                                "Document executive observations",
                                "Record session accomplishment"
                            ].map((step, i) => (
                                <li key={i} className="flex items-center gap-3 text-xs font-medium text-gray-400">
                                    <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-blue-500 border border-gray-700">{i + 1}</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
};

export default ModulePlayer;
