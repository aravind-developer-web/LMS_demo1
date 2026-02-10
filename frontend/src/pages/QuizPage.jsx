import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/quiz/${id}/`);
            setQuiz(response.data);
        } catch (error) {
            console.error("Failed to load quiz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, answerId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post(`/quiz/${id}/submit/`, { answers });
            setResult(response.data);
        } catch (error) {
            console.error("Failed to submit quiz", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary font-black uppercase tracking-widest text-[10px]">Initializing Neural Validation...</p>
        </div>
    );

    if (!quiz) return <div className="p-20 text-center font-black uppercase tracking-widest text-red-500">Validation Node Missing</div>;

    if (result) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 animate-in">
                <Card className="glass-dark rounded-[48px] p-12 text-center border-white/5 shadow-3xl overflow-hidden relative">
                    <div className={`absolute top-0 left-0 w-full h-2 ${result.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="mb-10 flex justify-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${result.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {result.passed ? <CheckCircle size={48} /> : <XCircle size={48} />}
                        </div>
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-4">
                        {result.passed ? "Precision Confirmed" : "Integrity Fault"}
                    </h2>
                    <p className="text-slate-400 text-xl font-medium mb-12 italic leading-relaxed">
                        Your structural mastery has been evaluated at <span className="text-white font-black">{Math.round(result.score)}%</span> accuracy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate(`/modules/${id}`)} className="h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px]">
                            Review Module Node
                        </Button>
                        {!result.passed ? (
                            <Button onClick={() => window.location.reload()} className="h-14 px-8 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest text-[10px]">
                                Reboot Validation
                            </Button>
                        ) : (
                            <Button onClick={() => navigate('/dashboard')} className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px]">
                                Return to Command
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in pb-32">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/modules/${id}`)} className="p-0 text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[10px] mb-4">
                        &larr; Abort Validation
                    </Button>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase">{quiz.title}</h1>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Required Precision: {quiz.passing_score}%</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-full">
                    <span className="text-primary font-black text-[10px] uppercase tracking-widest italic">Live Telemetry Active</span>
                </div>
            </div>

            <div className="space-y-8">
                {quiz.questions.map((q, index) => (
                    <Card key={q.id} className="glass-dark rounded-[40px] border-white/5 overflow-hidden group">
                        <div className="p-10 space-y-8">
                            <div className="flex gap-6">
                                <span className="text-4xl font-black text-white/5 italic">0{index + 1}</span>
                                <h3 className="text-xl font-black tracking-tight leading-tight uppercase">
                                    {q.text}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.answers.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(q.id, option.id)}
                                        className={`flex items-center p-6 rounded-3xl border transition-all duration-500 text-left group/opt
                                            ${answers[q.id] === option.id
                                                ? 'bg-primary border-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                                                : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-4 transition-all
                                            ${answers[q.id] === option.id ? 'bg-white border-white' : 'border-white/20 group-hover/opt:border-primary'}`}
                                        >
                                            {answers[q.id] === option.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <span className={`text-sm font-bold uppercase tracking-tight ${answers[q.id] === option.id ? 'text-white' : 'text-slate-400'}`}>
                                            {option.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end pt-12">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                    className="h-20 px-16 rounded-[32px] bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-[0.2em] shadow-3xl transition-all hover:scale-105 active:scale-95 disabled:opacity-20 translate-y-[-2px]"
                >
                    {submitting ? 'TRANSMITTING...' : 'Commit Validation'}
                </Button>
            </div>
        </div>
    );
};

export default QuizPage;
