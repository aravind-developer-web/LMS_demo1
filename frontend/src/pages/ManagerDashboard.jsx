import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
    Users, Activity, Clock, CheckCircle, AlertCircle, TrendingUp,
    ChevronRight, Search, Zap, Filter, MessageSquare, AlertTriangle,
    Target, LineChart, Layout, Play, FileText, BarChart3, ArrowRight,
    Trophy, MoreVertical, Send, ShieldAlert, ZapIcon, X, Plus, Monitor
} from 'lucide-react';
import {
    LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const ManagerDashboard = () => {
    const [teamSummary, setTeamSummary] = useState(null);
    const [learners, setLearners] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [diagnosticLearners, setDiagnosticLearners] = useState([]);
    const [selectedLearner, setSelectedLearner] = useState(null);
    const [learnerDetail, setLearnerDetail] = useState(null);
    const [activeTab, setActiveTab] = useState('timeline');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [newBroadcast, setNewBroadcast] = useState({ title: '', url: '', is_video: true });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [summaryRes, learnersRes, broadcastsRes, diagRes] = await Promise.all([
                api.get('/analytics/manager/team-summary/'),
                api.get('/analytics/manager/learners/'),
                api.get('/management/broadcasts/'),
                api.get('/management/learners/')
            ]);
            setTeamSummary(summaryRes.data);
            setLearners(learnersRes.data);
            setBroadcasts(broadcastsRes.data);
            setDiagnosticLearners(diagRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateBroadcast = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/management/broadcasts/', newBroadcast);
            setBroadcasts([res.data, ...broadcasts]);
            setShowBroadcastModal(false);
            setNewBroadcast({ title: '', url: '', is_video: true });
            alert("Broadcast signal transmission successful.");
        } catch (error) {
            alert("Failed to initiate broadcast.");
        }
    };

    const handleDeleteBroadcast = async (id) => {
        if (!confirm("Terminate this broadcast signal?")) return;
        try {
            await api.delete(`/management/broadcasts/${id}/`);
            setBroadcasts(broadcasts.filter(b => b.id !== id));
        } catch (error) {
            alert("Failed to terminate broadcast.");
        }
    };

    const handleRemoveLearner = async (id) => {
        if (!confirm("Unlink this learner from the neural matrix?")) return;
        try {
            await api.delete(`/management/learners/${id}/`);
            setDiagnosticLearners(diagnosticLearners.filter(l => l.id !== id));
            alert("Learner unlinked successfully.");
        } catch (error) {
            alert("De-linking protocol failed.");
        }
    };

    // ... (rest of helper functions)

    const handleLearnerClick = async (learner) => {
        setSelectedLearner(learner);
        setLearnerDetail(null); // Clear previous detail
        try {
            const res = await api.get(`/analytics/manager/${learner.id}/details/`);
            setLearnerDetail(res.data);
        } catch (error) {
            console.error("Error fetching learner details:", error);
        }
    };

    const handleAction = async (learnerId, actionType) => {
        const description = prompt(`Enter details for ${actionType}:`);
        if (!description) return;
        try {
            await api.post('/analytics/manager/record-action/', {
                learner_id: learnerId,
                action_type: actionType,
                description
            });
            alert("Action recorded successfully.");
        } catch (error) {
            alert("Failed to record action.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617]">
            <Zap className="w-12 h-12 text-primary animate-pulse" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-8 space-y-8 pb-32">
            {/* SECTION 1 — TEAM ACTIVITY SNAPSHOT (TOP BAR) */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: "Active Learners (24h)", value: teamSummary?.active_24h, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", hint: "Users with session pulses in last 24h" },
                    { label: "Inactive (>72h)", value: teamSummary?.inactive_72h, icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10", hint: "Stale nodes with no recent telemetry" },
                    { label: "Avg Focus (min)", value: teamSummary?.avg_focus_mins, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", hint: "Rolling 7-day average focus per user" },
                    { label: "Quiz Accuracy", value: `${teamSummary?.avg_accuracy}%`, icon: Target, color: "text-green-400", bg: "bg-green-400/10", hint: "Average success across all attempts" },
                    { label: "Completion Rate", value: `${teamSummary?.assignment_rate}%`, icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-400/10", hint: "Assignment submission vs baseline" },
                    { label: "Learners At Risk", value: teamSummary?.at_risk_count, icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", hint: "High-probability dropout indicators" },
                ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl border border-white/5 bg-white/5 space-y-2 group transition-all hover:border-primary/30 relative overflow-hidden`}>
                        <div className="flex items-center justify-between">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-2xl font-bold">{stat.value}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>

                        {/* Interactive Tooltip-style Hint */}
                        <div className="absolute inset-0 bg-primary/90 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white leading-relaxed">{stat.hint}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* RESTORED COMMAND CENTER ACTIONS */}
            <div className="flex gap-4">
                <Button
                    onClick={() => setShowBroadcastModal(true)}
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                    <Send className="mr-2 w-4 h-4" /> Initiate Global Broadcast
                </Button>
                <div className="flex-1 flex items-center gap-4 bg-white/5 border border-white/5 px-6 rounded-2xl overflow-hidden">
                    <Zap className="text-yellow-500 animate-pulse" size={18} />
                    <marquee className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        System Status: Optimal :: Knowledge Stream Active :: Security Clearance: Level 4 :: Monitoring {diagnosticLearners.length} Neural Nodes Across Sector Delta
                    </marquee>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SECTION 7: BROADCAST ARCHIVE & INTEL LINKS */}
                <Card className="bg-white/5 border-white/5 h-fit pb-6">
                    <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-md font-bold text-primary flex items-center gap-2 uppercase tracking-tighter italic">
                            <Monitor className="w-4 h-4" /> Knowledge Transmissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {broadcasts.map((bc) => (
                            <div key={bc.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-sm text-slate-200 uppercase tracking-tight">{bc.title}</h4>
                                    <button onClick={() => handleDeleteBroadcast(bc.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-slate-500 font-mono uppercase truncate max-w-[150px]">{bc.url}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${bc.is_video ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                        {bc.is_video ? 'Stream' : 'Asset'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {broadcasts.length === 0 && (
                            <div className="text-center py-12 opacity-20 italic text-[10px] uppercase font-black tracking-widest">No Active Signals</div>
                        )}
                    </CardContent>
                </Card>

                {/* SECTION 8: NODE DIAGNOSTICS (TEAM ROSTER MANAGEMENT) */}
                <Card className="lg:col-span-2 bg-[#030712] border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="p-6 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black text-white italic uppercase tracking-tighter">Node Diagnostics</CardTitle>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Authenticated Matrix Roster</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Users size={20} />
                        </div>
                    </CardHeader>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {diagnosticLearners.map((l) => (
                            <div key={l.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 text-sm">
                                        {l.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{l.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-mono">{l.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveLearner(l.id)}
                                    className="p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            {/* SECTION 2 — LEARNER TRACKING TABLE (CORE VIEW) */}
            <Card className="lg:col-span-2 bg-white/5 border-white/5 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-primary" />
                        Live Learner Intelligence Matrix
                    </CardTitle>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by Name..."
                            className="bg-[#0f172a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Learner</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4">Focus (7d)</th>
                                <th className="px-6 py-4">Quiz Avg</th>
                                <th className="px-6 py-4">Velocity</th>
                                <th className="px-6 py-4">Risk</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {learners.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())).map((learner) => (
                                <tr key={learner.id} className="hover:bg-white/5 cursor-pointer transition-colors group" onClick={() => handleLearnerClick(learner)}>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-slate-200 group-hover:text-primary transition-colors">{learner.name}</div>
                                            <div className="text-[10px] text-slate-500">ID: {learner.id}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-slate-400 font-mono">
                                        {learner.last_active ? new Date(learner.last_active).toLocaleString() : 'PENDING'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">{learner.focus_time_7d}m</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full" style={{ width: `${learner.quiz_avg}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-mono">{learner.quiz_avg}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${learner.velocity === 'Improving' ? 'text-green-400' :
                                            learner.velocity === 'Declining' ? 'text-red-400' : 'text-slate-500'
                                            }`}>
                                            {learner.velocity === 'Improving' ? <TrendingUp size={10} /> : <Activity size={10} />}
                                            {learner.velocity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ${learner.risk_level === 'High' ? 'bg-red-400/20 text-red-400' :
                                            learner.risk_level === 'Medium' ? 'bg-orange-400/20 text-orange-400' : 'bg-green-400/20 text-green-400'
                                            }`}>
                                            {learner.risk_level} Risk
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase ${learner.action_needed === 'Yes' ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                                            {learner.action_needed === 'Yes' ? 'INTERVENTION' : 'STABLE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* SECTION 5 — RISK DETECTION ENGINE */}
            <Card className="bg-white/5 border-white/5 flex flex-col">
                <CardHeader className="p-6 border-b border-white/5">
                    <CardTitle className="text-md font-bold text-red-500 flex items-center gap-2 uppercase tracking-tighter italic">
                        Anomaly Flag Center
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {learners.filter(l => l.risk_level === 'High').map(l => (
                        <div key={l.id} className="p-4 bg-red-400/5 border border-red-400/10 rounded-2xl space-y-3 group hover:bg-red-400/10 transition-colors">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-red-200">{l.name}</h4>
                                <span className="text-[9px] bg-red-400/20 text-red-400 px-2 py-0.5 rounded font-black tracking-widest">CRITICAL</span>
                            </div>
                            <p className="text-[10px] text-red-300/70 leading-relaxed uppercase">Stagnant node detected. Risk score exceeds threshold due to repeated failure patterns or prolonged inactivity period.</p>
                            <div className="flex gap-2">
                                <Button size="sm" className="h-7 text-[9px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white border-none px-4" onClick={() => handleAction(l.id, 'remind')}>Remind</Button>
                                <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase tracking-widest border-red-400/20 text-red-400 hover:bg-red-400/10 px-4" onClick={() => handleLearnerClick(l)}>Details</Button>
                            </div>
                        </div>
                    ))}
                    {learners.filter(l => l.risk_level === 'High').length === 0 && (
                        <div className="text-center py-20 flex flex-col items-center gap-4 opacity-30">
                            <CheckCircle size={32} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Risk Anomalies</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* SECTION 3 — INDIVIDUAL LEARNER DETAIL (DRILL-DOWN MODAL) */}
            {selectedLearner && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8 active-modal">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-6xl rounded-[40px] shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedLearner.name}</h2>
                                    <div className="flex gap-4 mt-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">UNIT TELEMETRY DETAILS</p>
                                        <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 rounded">{selectedLearner.current_module}</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-full w-12 h-12 p-0 hover:bg-white/10 text-white" onClick={() => setSelectedLearner(null)}><X size={24} /></Button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Side: Quality Trends (SECTION 4) */}
                            <div className="w-80 border-r border-white/5 p-8 bg-white/[0.02] space-y-8 overflow-y-auto custom-scrollbar">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Section 4 Metrics</h3>
                                {learnerDetail ? (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-white/5 rounded-3xl border border-primary/20 shadow-lg shadow-primary/5 space-y-4">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement Score</p>
                                                <p className="text-3xl font-black italic text-primary">{learnerDetail.quality.engagement}</p>
                                            </div>
                                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${Math.min(learnerDetail.quality.engagement * 10, 100)}%` }}></div>
                                            </div>
                                            <p className="text-[8px] text-slate-500 italic">Derived from sessions + focus + notes</p>
                                        </div>

                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Knowledge Stability</p>
                                            <div className="flex items-end gap-2 leading-none">
                                                <p className="text-2xl font-black italic text-green-400">{learnerDetail.quality.stability}%</p>
                                                <span className="text-[8px] font-bold text-slate-600 mb-1 uppercase">Variance Match</span>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Learning Velocity</p>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-primary" />
                                                <p className="text-xl font-bold uppercase italic text-white">{learnerDetail.quality.velocity}</p>
                                            </div>
                                        </div>

                                        {/* SECTION 6 — MANAGER ACTION CENTER */}
                                        <div className="pt-8 space-y-4 border-t border-white/10">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Action Center</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Button size="sm" className="text-[9px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 h-10 justify-start px-4" onClick={() => handleAction(selectedLearner.id, 'remind')}><Send className="w-3 h-3 mr-3" /> Send Remittance</Button>
                                                <Button size="sm" className="text-[9px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 h-10 justify-start px-4" onClick={() => handleAction(selectedLearner.id, 'flag')}><ShieldAlert className="w-3 h-3 mr-3" /> Flag Security</Button>
                                                <Button size="sm" className="text-[9px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 h-10 justify-start px-4" onClick={() => handleAction(selectedLearner.id, 'assign')}><Plus className="w-3 h-3 mr-3" /> Reassign Node</Button>
                                                <Button size="sm" className="text-[9px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 h-10 justify-start px-4" onClick={() => handleAction(selectedLearner.id, 'comment')}><MessageSquare className="w-3 h-3 mr-3" /> Log Commentary</Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-4">
                                        {[1, 2, 3].map(n => <div key={n} className="h-24 bg-white/5 rounded-3xl animate-pulse"></div>)}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Tabbed Details */}
                            <div className="flex-1 flex flex-col bg-white/[0.01]">
                                <div className="flex border-b border-white/5 px-8">
                                    {['timeline', 'quizzes', 'assignments', 'notes'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {tab}
                                            {activeTab === tab && <div className="absolute bottom-0 left-8 right-8 h-1 bg-primary shadow-[0_-4px_10px_rgba(59,130,246,0.5)]"></div>}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                    {!learnerDetail ? (
                                        <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20">
                                            <Zap className="w-12 h-12 animate-spin-slow" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Syncing Telemetry...</p>
                                        </div>
                                    ) : (
                                        <div className="max-w-4xl mx-auto">
                                            {activeTab === 'timeline' && (
                                                <div className="space-y-8 relative">
                                                    <div className="absolute left-[3px] top-2 bottom-0 w-px bg-white/5"></div>
                                                    {learnerDetail.timeline.map((session, i) => (
                                                        <div key={i} className="relative pl-10 group">
                                                            <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary border-2 border-[#0f172a] z-10 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] space-y-3 group-hover:bg-white/[0.05] transition-colors">
                                                                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                    <span>{new Date(session.start).toLocaleString()}</span>
                                                                    <span className="bg-white/5 px-2 py-1 rounded">Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                                                                </div>
                                                                <p className="text-sm font-bold text-white uppercase italic tracking-tight">Synchronized Focus Session <span className="text-primary">:: active</span></p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {learnerDetail.timeline.length === 0 && (
                                                        <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10 italic text-slate-600">No session telemetry traced.</div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'quizzes' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {learnerDetail.quizzes.map((quiz, i) => (
                                                        <div key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px] flex flex-col gap-6 group hover:border-primary/20 transition-all">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-1">
                                                                    <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">{quiz.title}</h4>
                                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(quiz.timestamp).toLocaleDateString()}</p>
                                                                </div>
                                                                <Trophy className={`w-5 h-5 ${quiz.passed ? 'text-yellow-500' : 'text-slate-700'}`} />
                                                            </div>
                                                            <div className="flex items-baseline gap-2">
                                                                <div className={`text-4xl font-black italic ${quiz.passed ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {quiz.score}%
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{quiz.passed ? 'Validated' : 'Failure Trace'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {learnerDetail.quizzes.length === 0 && <div className="col-span-2 text-center py-20 opacity-20 italic">No quiz attempts logged.</div>}
                                                </div>
                                            )}

                                            {activeTab === 'assignments' && (
                                                <div className="space-y-6">
                                                    {learnerDetail.assignments.map((ass, i) => (
                                                        <div key={i} className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                                                            <div className="flex items-center gap-8">
                                                                <div className={`p-4 rounded-[24px] ${ass.status === 'graded' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                    <FileText size={28} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{ass.title}</h4>
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Assigned: {new Date(ass.assigned).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col items-end gap-3">
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${ass.status === 'graded' ? 'bg-green-500 text-black' : 'bg-blue-500 text-white'}`}>
                                                                    {ass.status}
                                                                </span>
                                                                {ass.grade && <div className="text-3xl font-black italic text-white leading-none">{ass.grade}/100</div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {learnerDetail.assignments.length === 0 && <div className="text-center py-20 opacity-20 italic">No assigned assets detected.</div>}
                                                </div>
                                            )}

                                            {activeTab === 'notes' && (
                                                <div className="text-center py-24 flex flex-col items-center gap-8">
                                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                                                        <MessageSquare size={48} />
                                                    </div>
                                                    <div className="max-w-md space-y-4">
                                                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Interaction Engagement Trace</h4>
                                                        <p className="text-[11px] text-slate-600 leading-relaxed italic">Synchronized note engagement data is currently under verification. Trace logging for collaborative assets will be visible upon security clearance.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BROADCAST INITIATION MODAL */}
            {showBroadcastModal && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-[200] flex items-center justify-center p-8">
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Initiate Broadcast</h2>
                            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-white" onClick={() => setShowBroadcastModal(false)}><X size={20} /></Button>
                        </div>
                        <form onSubmit={handleInitiateBroadcast} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signal Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Enter broadcast title..."
                                    value={newBroadcast.title}
                                    onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target URL / Asset Link</label>
                                <input
                                    type="url"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="https://..."
                                    value={newBroadcast.url}
                                    onChange={(e) => setNewBroadcast({ ...newBroadcast, url: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Signal Type:</label>
                                <button
                                    type="button"
                                    onClick={() => setNewBroadcast({ ...newBroadcast, is_video: true })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newBroadcast.is_video ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}
                                >
                                    Video Stream
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewBroadcast({ ...newBroadcast, is_video: false })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!newBroadcast.is_video ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}
                                >
                                    Intel Link
                                </button>
                            </div>
                            <Button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-primary/20">
                                Transmit Signal
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
