import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Users, BookOpen, CheckCircle, AlertCircle, TrendingUp, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Search, Zap, X, Plus, Video, Link as LinkIcon, Send, Layers } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { toast } from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, bg, trend }) => (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group hover:border-primary/50">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                <p className="text-4xl font-extrabold mt-2 group-hover:scale-105 transition-transform origin-left">{value}</p>
                {trend && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {trend > 0 ? (
                            <div className="flex items-center gap-1 text-green-500 text-[10px] font-black italic">
                                <ArrowUpRight size={14} /> +{trend}%
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-500 text-[10px] font-black italic">
                                <ArrowDownRight size={14} /> {trend}%
                            </div>
                        )}
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">VS PREV</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [teamStats, setTeamStats] = useState(null);
    const [stuckLearners, setStuckLearners] = useState([]);
    const [moduleStats, setModuleStats] = useState([]);
    const [velocityData, setVelocityData] = useState(null);
    const [learners, setLearners] = useState([]);
    const [notices, setNotices] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    // User Management State
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPass, setNewUserPass] = useState('');

    // Course Management State
    const [modules, setModules] = useState([]);
    const [showCreateModule, setShowCreateModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newModuleDesc, setNewModuleDesc] = useState('');

    const [activeModuleForResource, setActiveModuleForResource] = useState(null);
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');

    const [activeModuleForAssign, setActiveModuleForAssign] = useState(null);
    const [selectedLearnerForAssign, setSelectedLearnerForAssign] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        // Helper to fetch and set state independently
        const safeFetch = async (endpoint, setter) => {
            try {
                const res = await api.get(endpoint);
                setter(res.data);
            } catch (error) {
                console.warn(`Failed to fetch from ${endpoint}`, error);
            }
        };

        await Promise.all([
            safeFetch('/analytics/team-stats/', setTeamStats),
            safeFetch('/analytics/stuck-learners/', setStuckLearners),
            safeFetch('/analytics/module-stats/', setModuleStats),
            safeFetch('/analytics/team-velocity/', setVelocityData),
            safeFetch('/auth/learners/', setLearners),
            safeFetch('/management/notices/', setNotices),
            safeFetch('/analytics/recent-activity/', setRecentActivity),
            safeFetch('/modules/', setModules)
        ]);
        setLoading(false);
    };

    const handleAddUser = async () => {
        try {
            await api.post('/auth/learners/', {
                username: newUserName,
                email: newUserEmail,
                password: newUserPass
            });
            toast.success('Unit Integrated Successfully');
            setShowAddUser(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPass('');
            fetchAllData();
        } catch (err) {
            toast.error('Integration Failed');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Terminate this unit session?')) return;
        try {
            await api.delete(`/auth/learners/${id}/`);
            toast.success('Unit Decommissioned');
            fetchAllData();
        } catch (err) {
            toast.error('Decommission Failed');
        }
    };

    const handleIssueCert = async (learnerId, moduleId) => {
        try {
            await api.post('/management/certifications/', {
                learner: learnerId,
                module: moduleId,
                certificate_id: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            });
            toast.success('Validation Certificate Issued');
        } catch (err) {
            toast.error('Validation Failed');
        }
    };

    const handleCreateModule = async () => {
        try {
            await api.post('/modules/', {
                title: newModuleTitle,
                description: newModuleDesc,
                duration: 0,
                difficulty: 'intermediate'
            });
            toast.success('Course Module Initialized');
            setShowCreateModule(false);
            setNewModuleTitle('');
            setNewModuleDesc('');
            // Refresh modules
            const res = await api.get('/modules/');
            setModules(res.data);
            fetchAllData(); // Update stats too
        } catch (err) {
            toast.error('Initialization Failed');
        }
    };

    const handleAddResource = async () => {
        if (!activeModuleForResource) return;
        try {
            await api.post(`/modules/${activeModuleForResource}/resources/`, {
                title: newResourceTitle,
                type: 'video',
                url: newResourceUrl,
                module: activeModuleForResource
            });
            toast.success('Neural Resource Linked');
            setActiveModuleForResource(null);
            setNewResourceTitle('');
            setNewResourceUrl('');
        } catch (err) {
            toast.error('Linkage Failed');
        }
    };

    const handleAssignModule = async () => {
        if (!activeModuleForAssign || !selectedLearnerForAssign) return;
        try {
            await api.post(`/modules/${activeModuleForAssign}/assign/`, {
                learner_id: selectedLearnerForAssign
            });
            toast.success('Directive Assigned to Unit');
            setActiveModuleForAssign(null);
            setSelectedLearnerForAssign('');
        } catch (err) {
            toast.error('Assignment Failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
                    <p className="text-primary font-black uppercase tracking-widest text-[10px]">Analyzing Team Intelligence Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in pb-20">
            {/* Elite Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter italic text-foreground uppercase">Command Oversight</h1>
                    <p className="text-muted-foreground mt-2 text-xl font-medium max-w-xl">Real-time telemetry and structural skill validation across all active units.</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 px-6 py-3 rounded-[24px] shadow-2xl h-14 flex items-center gap-4">
                        <Clock className="text-primary" size={20} />
                        <span className="font-black italic text-sm uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* High-Precision Summary Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Units", value: teamStats?.summary?.total_learners || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", trend: 12 },
                    { label: "Pending Reviews", value: teamStats?.summary?.assignments_pending || 0, icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-400/10", trend: 0 },
                    { label: "Total Validations", value: teamStats?.summary?.total_completions || 0, icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", trend: 8 },
                    { label: "Average Precision", value: `${(teamStats?.summary?.avg_quiz_score || 0).toFixed(1)}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", trend: 5 },
                ].map((stat, i) => (
                    <div key={i} className="premium-card bg-[#030712] border-white/5 p-8 flex flex-col justify-between group h-40">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{stat.label}</p>
                                <p className="text-4xl font-black italic tracking-tighter group-hover:text-primary transition-colors">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {stat.label === "Pending Reviews" ? (
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Action Required</span>
                            ) : (
                                <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Live Telemetry</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Feed & Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="bg-[#030712] border-white/5 rounded-[48px] shadow-3xl overflow-hidden p-0 h-full">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Live Operations Feed</h2>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">REAL-TIME INTERACTION LOG</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                Online
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentActivity && recentActivity.length > 0 ? (
                                    recentActivity.map((act, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${act.type === 'quiz' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'}`}>
                                                    {act.type === 'quiz' ? <CheckCircle size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black text-white uppercase tracking-wide">{act.user}</span>
                                                        <span className="text-[9px] text-white/40 uppercase tracking-widest">via {act.type === 'quiz' ? 'Neural Validation' : 'Direct Protocol'}</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{act.title}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xs font-black uppercase tracking-wide ${act.type === 'quiz' && act.status.includes('Passed') ? 'text-green-500' : 'text-white'}`}>{act.status}</p>
                                                <p className="text-[9px] text-white/20 font-mono mt-1">{new Date(act.time).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-white/20 text-xs font-black uppercase tracking-widest">No Recent Telemetry</div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    {/* Intelligence Control Panel (Moved/Resized) */}
                    <Card className="bg-[#030712] border-white/5 rounded-[48px] shadow-3xl overflow-hidden p-0 flex flex-col h-full">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black italic tracking-tighter uppercase">Command</h2>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">BROADCASTS</p>
                            </div>
                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                <Zap size={18} />
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 border-b border-white/5 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {notices.map((n) => (
                                    <div key={n.id} className="p-4 rounded-2xl bg-black border border-white/10 group hover:border-primary/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-black text-[10px] uppercase tracking-widest text-white italic">{n.title}</h4>
                                            {n.is_alert && <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">CRITICAL</span>}
                                        </div>
                                        <p className="text-[9px] text-white/40 line-clamp-2">{n.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02]">
                            <Button className="w-full h-12 rounded-[18px] bg-primary text-white font-black uppercase tracking-[0.2em] text-[9px] shadow-2xl shadow-primary/40 hover:scale-[1.02] transition-transform">
                                INITIATE BROADCAST
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Unit Management Hub */}
                <Card className="bg-[#030712] border-white/5 rounded-[48px] shadow-3xl overflow-hidden p-0 flex flex-col h-[600px]">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Unit Management</h2>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">ADMINISTRATIVE OVERSIGHT</p>
                        </div>
                        <Button
                            onClick={() => setShowAddUser(!showAddUser)}
                            className="bg-primary hover:bg-primary/80 text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest"
                        >
                            {showAddUser ? 'CANCEL' : 'INTEGRATE NEW UNIT'}
                        </Button>
                    </div>

                    {showAddUser && (
                        <div className="p-8 bg-primary/5 border-b border-white/5 space-y-4 animate-in slide-in-from-top-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    className="bg-black border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/50"
                                    placeholder="USERNAME"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                />
                                <input
                                    className="bg-black border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/50"
                                    placeholder="EMAIL"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    className="bg-black border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/50"
                                    placeholder="PASSWORD"
                                    value={newUserPass}
                                    onChange={(e) => setNewUserPass(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAddUser} className="w-full h-12 bg-white text-black font-black uppercase text-[10px]">EXECUTE INTEGRATION</Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-white/5">
                            {learners.map((l) => (
                                <div key={l.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-white/40">
                                            {l.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase italic tracking-tight">{l.username}</p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{l.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => handleDeleteUser(l.id)}
                                            className="h-10 w-10 p-0 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Intelligence Control Panel */}
                <Card className="bg-[#030712] border-white/5 rounded-[48px] shadow-3xl overflow-hidden p-0 flex flex-col h-[600px]">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Global Intelligence</h2>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">COMMAND BROADCASTS</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <Zap size={24} />
                        </div>
                    </div>

                    <div className="p-8 bg-primary/5 border-b border-white/5">
                        <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mb-4">ACTIVE DIRECTIVES</p>
                        <div className="space-y-4">
                            {notices.map((n) => (
                                <div key={n.id} className="p-4 rounded-2xl bg-black border border-white/10 group hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-white italic">{n.title}</h4>
                                        {n.is_alert && <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">CRITICAL</span>}
                                    </div>
                                    <p className="text-[9px] text-white/40 line-clamp-2">{n.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 mt-auto bg-white/[0.02]">
                        <Button className="w-full h-16 rounded-[24px] bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/40 hover:scale-[1.02] transition-transform">
                            INITIATE BROADCAST <ArrowUpRight className="ml-2" size={18} />
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Tactical Course Management */}
            <Card className="bg-[#030712] border-white/5 rounded-[48px] shadow-3xl overflow-hidden p-0 flex flex-col min-h-[500px]">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Tactical Course Deployment</h2>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">INSTRUCTIONAL INFRASTRUCTURE</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModule(!showCreateModule)}
                        className="bg-primary hover:bg-primary/80 text-white rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest"
                    >
                        {showCreateModule ? 'CANCEL PROTOCOL' : 'INITIALIZE NEW PROTOCOL'}
                    </Button>
                </div>

                {showCreateModule && (
                    <div className="p-10 bg-primary/5 border-b border-white/5 space-y-6 animate-in slide-in-from-top-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">Protocol Designator (Title)</label>
                                <input
                                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-primary/50 transition-all"
                                    placeholder="E.G. ADVANCED FIELD TACTICS"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 block">Operational Brief (Description)</label>
                                <textarea
                                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-medium text-white/80 outline-none focus:border-primary/50 transition-all resize-none h-24"
                                    placeholder="Describe the learning objectives..."
                                    value={newModuleDesc}
                                    onChange={(e) => setNewModuleDesc(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreateModule} className="w-full h-14 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-white/90">
                            Execute Launch
                        </Button>
                    </div>
                )}

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {modules.map(mod => (
                        <div key={mod.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-2xl bg-white/5 text-white/40 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                    <Layers size={20} />
                                </div>
                                <div className="px-3 py-1 rounded bg-white/5 text-[9px] font-black text-white/30 uppercase tracking-widest">
                                    ID: {mod.id.toString().padStart(4, '0')}
                                </div>
                            </div>

                            <h3 className="text-lg font-black italic uppercase tracking-tight text-white/90 mb-2 truncate">{mod.title}</h3>
                            <p className="text-xs text-white/40 line-clamp-2 mb-6 h-8">{mod.description}</p>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => setActiveModuleForResource(activeModuleForResource === mod.id ? null : mod.id)}
                                    className={`w-full h-10 justify-start px-4 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${activeModuleForResource === mod.id ? 'bg-primary text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                >
                                    <Video size={14} className="mr-2" />
                                    {activeModuleForResource === mod.id ? 'Cancel Link' : 'Link Video Resource'}
                                </Button>

                                {activeModuleForResource === mod.id && (
                                    <div className="p-4 rounded-xl bg-black border border-white/10 space-y-3 animate-in fade-in zoom-in-95">
                                        <input
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-[10px] text-white outline-none focus:border-primary"
                                            placeholder="Resource Title"
                                            value={newResourceTitle}
                                            onChange={(e) => setNewResourceTitle(e.target.value)}
                                        />
                                        <input
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-[10px] text-white outline-none focus:border-primary"
                                            placeholder="YouTube URL"
                                            value={newResourceUrl}
                                            onChange={(e) => setNewResourceUrl(e.target.value)}
                                        />
                                        <Button onClick={handleAddResource} size="sm" className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-white text-[9px] font-black uppercase">
                                            Confirm Link
                                        </Button>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setActiveModuleForAssign(activeModuleForAssign === mod.id ? null : mod.id)}
                                    className={`w-full h-10 justify-start px-4 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${activeModuleForAssign === mod.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                                >
                                    <Send size={14} className="mr-2" />
                                    {activeModuleForAssign === mod.id ? 'Cancel Assign' : 'Assign to Unit'}
                                </Button>

                                {activeModuleForAssign === mod.id && (
                                    <div className="p-4 rounded-xl bg-black border border-white/10 space-y-3 animate-in fade-in zoom-in-95">
                                        <select
                                            className="w-full bg-transparent border-b border-white/10 p-2 text-[10px] text-white outline-none focus:border-blue-500 [&>option]:bg-black"
                                            value={selectedLearnerForAssign}
                                            onChange={(e) => setSelectedLearnerForAssign(e.target.value)}
                                        >
                                            <option value="">SELECT UNIT</option>
                                            {learners.map(l => (
                                                <option key={l.id} value={l.id}>{l.username.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        <Button onClick={handleAssignModule} size="sm" className="w-full bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white text-[9px] font-black uppercase">
                                            Confirm Directive
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Knowledge Node Diagnostics */}
            <Card className="bg-[#030712] border-white/5 rounded-[48px] shadow-3xl overflow-hidden p-0">
                <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-1">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Node Diagnostics</h2>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Structural mastery across knowledge segments</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="text"
                                placeholder="FILTER STRUCTURAL NODES..."
                                className="w-full h-14 pl-16 pr-8 rounded-2xl border border-white/5 bg-black focus:ring-2 ring-primary/20 transition-all outline-none font-black text-[10px] uppercase tracking-widest text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {moduleStats.map((mod) => (
                        <div key={mod.title} className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 group hover:border-primary/50 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="font-black text-2xl leading-none uppercase italic group-hover:text-primary transition-colors">{mod.title}</h4>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Units</span>
                                        <span className="text-2xl font-black italic">{mod.enrollments}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                                        <span>Mastery Precision</span>
                                        <span className="text-primary italic">{Math.round(mod.success_rate)}%</span>
                                    </div>
                                    <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                            style={{ width: `${mod.success_rate}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest italic">Stable Node</div>
                                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest">v{mod.id || '1'}.0</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ManagerDashboard;
