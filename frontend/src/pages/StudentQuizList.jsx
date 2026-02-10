import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileText, ArrowRight, BrainCircuit, CheckCircle, Clock } from 'lucide-react';

const StudentQuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await api.get('/quiz/');
                setQuizzes(response.data);
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase flex items-center gap-3">
                        <FileText className="text-blue-500" size={32} /> Knowledge Validation
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium max-w-xl">Verify your neural retention through precision testing protocols.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {quizzes.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <BrainCircuit size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No active validation protocols</p>
                    </div>
                ) : (
                    quizzes.map(q => (
                        <Card key={q.id} className="group flex flex-col md:flex-row justify-between items-center p-6 bg-[#030712] border-white/5 hover:border-blue-500/30 transition-all duration-300">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                        Quiz Protocol
                                    </span>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">ID: QZ-{q.id}</span>
                                </div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-blue-500 transition-colors">{q.title}</h3>
                                <div className="flex gap-4 mt-3">
                                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                        <BrainCircuit size={12} /> {q.questions_count} Questions
                                    </span>
                                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> Min Score: {q.passing_score}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 md:mt-0 pl-0 md:pl-6 border-l-0 md:border-l border-white/5">
                                <Link to={`/modules/${q.module}/quiz`}>
                                    <Button
                                        className="rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 border border-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                                    >
                                        Initiate Test <ArrowRight size={14} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentQuizList;
