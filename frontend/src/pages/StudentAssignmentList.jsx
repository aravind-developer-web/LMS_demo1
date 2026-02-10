import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ClipboardList, ArrowRight, Code, Clock, CheckCircle } from 'lucide-react';

const StudentAssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/assignments/');
                setAssignments(response.data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const getStatusParams = (status) => {
        switch (status) {
            case 'completed': return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Completed' };
            case 'submitted': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Under Review' };
            default: return { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Pending' };
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
            </div>

            <div className="grid gap-4">
                {assignments.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <Code size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No active directives found</p>
                    </div>
                ) : (
                    assignments.map(a => {
                        const style = getStatusParams(a.status);
                        return (
                            <Card key={a.id} className="group flex flex-col md:flex-row justify-between items-center p-6 bg-[#030712] border-white/5 hover:border-purple-500/30 transition-all duration-300">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded ${style.bg} ${style.color} text-[9px] font-black uppercase tracking-widest border ${style.border}`}>
                                            {style.label}
                                        </span>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">ID: ASN-{a.id}</span>
                                    </div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-purple-500 transition-colors">{a.module_title || `Module ${a.module}`}</h3>

                                    <div className="flex gap-4 mt-3">
                                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                            <Clock size={12} /> Assumed: {new Date(a.created_at || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-4 md:mt-0 pl-0 md:pl-6 border-l-0 md:border-l border-white/5">
                                    <Link to={`/modules/${a.module}/assignment`}>
                                        <Button
                                            className="rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 border border-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                                        >
                                            {a.status === 'completed' ? 'Review Submission' : 'Execute Task'} <ArrowRight size={14} className="ml-2" />
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
