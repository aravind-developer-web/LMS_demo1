import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import {
    BrainCircuit,
    Activity,
    AlertTriangle,
    TrendingUp,
    Users,
    ChevronRight,
    Search,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

const CognitiveBadge = ({ state }) => {
    const styles = {
        "CRITICAL": "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse",
        "STRUGGLING": "bg-orange-500/10 text-orange-400 border-orange-500/30",
        "STABLE": "bg-green-500/10 text-green-400 border-green-500/30",
        "HIGH_VELOCITY": "bg-blue-500/10 text-blue-400 border-blue-500/30",
        "SKILL_READY": "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/20",
        "UNENGAGED": "bg-slate-500/20 text-slate-400 border-slate-500/30"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[state] || styles["UNENGAGED"]}`}>
            {state}
        </span>
    );
};

const RiskIndicator = ({ score }) => {
    const getColor = (s) => {
        if (s >= 70) return "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
        if (s >= 40) return "text-orange-500";
        if (s >= 20) return "text-yellow-500";
        return "text-green-500";
    };

    return (
        <div className="flex items-center gap-2">
            <Activity size={14} className={getColor(score)} />
            <span className={`text-xs font-bold ${getColor(score)}`}>{score}% Risk</span>
        </div>
    );
};

const ManagerIntelligenceDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchIntelligence();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchIntelligence, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchIntelligence = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/analytics/manager/intelligence-overview/');
            setData(response.data);
            setLastUpdated(new Date());

            console.log('[Intelligence] Data refreshed:', response.data);
        } catch (err) {
            console.error("[Intelligence] Failed to fetch:", err);
            setError(err.response?.data?.error || 'Failed to load intelligence data');
        } finally {
            setLoading(false);
        }
    };

    const filteredNodes = data?.nodes?.filter(node => {
        const matchesSearch = node.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'critical' && node.cognitive_state === 'CRITICAL') ||
            (filter === 'struggling' && node.cognitive_state === 'STRUGGLING') ||
            (filter === 'ready' && node.cognitive_state === 'SKILL_READY');
        return matchesSearch && matchesFilter;
    }) || [];

    const getDataAge = () => {
        if (!lastUpdated) return null;
        const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="space-y-8 animate-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <BrainCircuit className="text-primary" size={32} />
                        Neural Intelligence Engine
                    </h1>
                    <p className="text-slate-400 font-medium">Real-time cognitive state analysis and risk detection.</p>
                </div>

                <div className="flex gap-2 items-center">
                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 px-3 py-2 rounded-lg">
                            <Clock size={12} />
                            <span>Updated {getDataAge()}</span>
                        </div>
                    )}
                    <Button
                        onClick={fetchIntelligence}
                        disabled={loading}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </Button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search Neural Nodes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-secondary/50 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-64"
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
                            <h3 className="font-bold text-red-400">Intelligence System Error</h3>
                            <p className="text-sm text-slate-400">{error}</p>
                        </div>
                        <Button onClick={fetchIntelligence} className="ml-auto">
                            Retry
                        </Button>
                    </div>
                </Card>
            )}

            {/* Quick Stats Row */}
            {!loading && data && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-6 bg-red-500/5 border-red-500/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Critical Intervention</p>
                                <h3 className="text-3xl font-black text-white mt-2">
                                    {data.summary.critical}
                                </h3>
                            </div>
                            <AlertTriangle className="text-red-500" />
                        </div>
                    </Card>
                    <Card className="p-6 bg-orange-500/5 border-orange-500/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Struggling Nodes</p>
                                <h3 className="text-3xl font-black text-white mt-2">
                                    {data.summary.struggling}
                                </h3>
                            </div>
                            <Activity className="text-orange-500" />
                        </div>
                    </Card>
                    <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">High Velocity</p>
                                <h3 className="text-3xl font-black text-white mt-2">
                                    {data.summary.high_velocity}
                                </h3>
                            </div>
                            <TrendingUp className="text-blue-500" />
                        </div>
                    </Card>
                    <Card className="p-6 bg-purple-500/5 border-purple-500/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Skill Ready</p>
                                <h3 className="text-3xl font-black text-white mt-2">
                                    {data.summary.skill_ready}
                                </h3>
                            </div>
                            <BrainCircuit className="text-purple-500" />
                        </div>
                    </Card>
                </div>
            )}

            {/* Intelligence Table */}
            <Card className="overflow-hidden border-white/5 bg-[#030712]/50 backdrop-blur-xl">
                <div className="p-4 border-b border-white/5 flex gap-2">
                    {['all', 'critical', 'struggling', 'ready'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Node (Learner)</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognitive State</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocity (Completions/Day)</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Profile</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Signal</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500 animate-pulse">Scanning Neural Network...</td></tr>
                            ) : filteredNodes.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">
                                    {search || filter !== 'all'
                                        ? 'No learners match the current filters'
                                        : 'No learners detected. System is healthy but empty.'}
                                </td></tr>
                            ) : filteredNodes.map(node => (
                                <tr key={node.learner_id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                                                {node.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white">{node.name}</div>
                                                <div className="text-[10px] text-slate-500">{node.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <CognitiveBadge state={node.cognitive_state} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-white">{node.velocity}</span>
                                            <div className="h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min(node.velocity * 20, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <RiskIndicator score={node.risk_score} />
                                        {node.risk_factors.length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {node.risk_factors.map((f, i) => (
                                                    <span key={i} className="text-[9px] text-red-400 bg-red-500/10 px-1.5 rounded">{f}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                        {node.last_active ? new Date(node.last_active).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                                            Deep Scan <ChevronRight size={14} className="ml-1" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManagerIntelligenceDashboard;
