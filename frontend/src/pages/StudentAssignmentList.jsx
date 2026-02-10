import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ClipboardList, ArrowRight, Code, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const StudentAssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/assignments/learner/my-assignments/');
            setAssignments(response.data);

            console.log('[Assignments] Loaded:', response.data);
        } catch (err) {
            console.error("[Assignments] Failed to fetch:", err);
            setError(err.response?.data?.error || 'Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusParams = (status, submissionStatus) => {
        if (submissionStatus === 'pending' || submissionStatus === 'reviewed') {
            return {
                color: 'text-yellow-500',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20',
                label: 'Under Review',
                icon: Clock
            };
        }

        switch (status) {
            case 'completed':
                return {
                    color: 'text-green-500',
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/20',
                    label: 'Completed',
                    icon: CheckCircle
                };
            case 'in_progress':
                return {
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    label: 'In Progress',
                    icon: Clock
                };
            case 'available':
                return {
                    color: 'text-purple-500',
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/20',
                    label: 'Available',
                    icon: Code
                };
            case 'overdue':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    label: 'Overdue',
                    icon: AlertCircle
                };
            default:
                return {
                    color: 'text-slate-500',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-500/20',
                    label: 'Pending',
                    icon: Code
                };
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-500 font-black uppercase tracking-widest text-[10px]">Loading Assignments...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase flex items-center gap-3">
                        <ClipboardList className="text-purple-500" size={32} /> Practical Directives
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium max-w-xl">Execute practical applications to demonstrate competency.</p>
                </div>

                <Button
                    onClick={fetchAssignments}
                    disabled={loading}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <Card className="p-6 bg-red-500/5 border-red-500/20">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={24} />
                        <div>
                            <h3 className="font-bold text-red-400">Failed to Load Assignments</h3>
                            <p className="text-sm text-slate-400">{error}</p>
                        </div>
                        <Button onClick={fetchAssignments} className="ml-auto">
                            Retry
                        </Button>
                    </div>
                </Card>
            )}

            {/* Assignment Grid */}
            <div className="grid gap-4">
                {!loading && !error && assignments.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <Code size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                            No assignments are currently active for your learning tracks.
                        </p>
                        <p className="text-slate-600 text-xs mt-2">
                            Assignments will appear here when modules with assignment prompts are available.
                        </p>
                    </div>
                ) : (
                    assignments.map(a => {
                        const style = getStatusParams(a.status, a.submission_status);
                        const StatusIcon = style.icon;

                        return (
                            <Card key={a.id || a.module} className="group flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-[#030712] border-white/5 hover:border-purple-500/30 transition-all duration-300">
                                <div className="flex-1 min-w-0 w-full md:w-auto">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded ${style.bg} ${style.color} text-[9px] font-black uppercase tracking-widest border ${style.border} flex items-center gap-1`}>
                                            <StatusIcon size={10} />
                                            {style.label}
                                        </span>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                            {a.type === 'open_access' ? 'OPEN ACCESS' : `ASN-${a.id}`}
                                        </span>
                                        {a.due_date && (
                                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                                                Due: {new Date(a.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-purple-500 transition-colors">
                                        {a.module_title}
                                    </h3>
                                    {a.module_description && (
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{a.module_description}</p>
                                    )}

                                    <div className="flex gap-4 mt-3 flex-wrap">
                                        {a.assigned_at && (
                                            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                                <Clock size={12} /> Assigned: {new Date(a.assigned_at).toLocaleDateString()}
                                            </span>
                                        )}
                                        {a.assigned_by && (
                                            <span className="text-xs text-slate-500 font-bold">
                                                By: {a.assigned_by}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4 md:mt-0 pl-0 md:pl-6 border-l-0 md:border-l border-white/5 w-full md:w-auto">
                                    <Link to={`/modules/${a.module}/assignment`} className="w-full md:w-auto">
                                        <Button
                                            className="w-full md:w-auto rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 border border-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                                        >
                                            {a.status === 'completed' ? 'Review Submission' :
                                                a.submission_status !== 'not_submitted' ? 'View Submission' :
                                                    'Execute Task'}
                                            <ArrowRight size={14} className="ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StudentAssignmentList;
