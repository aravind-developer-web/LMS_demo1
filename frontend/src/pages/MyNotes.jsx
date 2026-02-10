import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, FileText, Calendar, ArrowRight, BookOpen, Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const MyNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotes();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchNotes, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/notes/list/');
            setNotes(response.data);
            setLastUpdated(new Date());

            console.log('[Notes] Loaded:', response.data.length, 'notes');
        } catch (err) {
            console.error("[Notes] Failed to fetch:", err);
            setError(err.response?.data?.error || 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.module_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDataAge = () => {
        if (!lastUpdated) return null;
        const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    if (loading && !lastUpdated) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Accessing Knowledge Journal...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-12 animate-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase text-foreground flex items-center gap-3">
                        <Sparkles className="text-primary" size={32} /> Knowledge Journal
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg font-medium">A centralized repository of your insights and architectural observations.</p>

                    {lastUpdated && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <Clock size={12} />
                            <span>Last synced {getDataAge()}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 items-center w-full md:w-auto">
                    <Button
                        onClick={fetchNotes}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </Button>

                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH YOUR INSIGHTS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-6 rounded-2xl border border-border bg-card focus:ring-2 ring-primary/20 transition-all outline-none font-black text-xs uppercase tracking-widest"
                        />
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="p-6 bg-red-500/5 border-red-500/20">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={24} />
                        <div>
                            <h3 className="font-bold text-red-400">Failed to Load Notes</h3>
                            <p className="text-sm text-slate-400">{error}</p>
                        </div>
                        <Button onClick={fetchNotes} className="ml-auto">
                            Retry
                        </Button>
                    </div>
                </Card>
            )}

            {/* Notes Grid */}
            {!error && filteredNotes.length === 0 ? (
                <div className="text-center py-32 bg-card/40 backdrop-blur-xl rounded-[40px] border-2 border-dashed border-border flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 border border-border opacity-20">
                        <FileText size={48} />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Journal Empty</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-medium opacity-60 uppercase text-[10px] tracking-widest leading-relaxed">
                        {searchTerm ? `No data matched your query: "${searchTerm}"` : "You haven't initialized any journaling nodes yet. Start a session and contribute your findings."}
                    </p>
                    <Button onClick={() => navigate('/dashboard')} className="mt-8 rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        Initialize Session
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNotes.map(note => (
                        <Card key={note.id} className="group border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[32px] overflow-hidden flex flex-col h-[420px] bg-card relative">
                            {/* Accent Decoration */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary group-hover:h-2 transition-all" />

                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Module Source</CardDescription>
                                        <CardTitle className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors italic uppercase line-clamp-1 h-7">
                                            {note.module_title}
                                        </CardTitle>
                                    </div>
                                    <div className="p-3 bg-secondary rounded-2xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <BookOpen size={20} />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="px-8 flex-1 overflow-hidden relative group/content">
                                <div className="text-sm font-medium text-foreground/70 leading-relaxed whitespace-pre-wrap font-serif italic text-lg opacity-80 group-hover:opacity-100 transition-opacity line-clamp-6">
                                    "{note.content}"
                                </div>
                                {/* Gradient Fade for long notes */}
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
                            </CardContent>

                            <div className="p-8 pt-0 mt-auto">
                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                            <Clock size={14} />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest">
                                            <p className="text-foreground">{new Date(note.updated_at).toLocaleDateString()}</p>
                                            <p className="opacity-50">Last Synchronized</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate(`/modules/${note.module}`)}
                                        className="h-12 w-12 rounded-2xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all group/btn"
                                    >
                                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyNotes;
