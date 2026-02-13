import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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

    if (loading) return <div className="p-8 text-center text-slate-500">Loading available quizzes...</div>;

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Available Quizzes</h1>
                <p className="text-slate-600">Test your knowledge on the modules you've completed.</p>
            </header>

            <div className="space-y-4">
                {quizzes.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                        <p className="text-slate-500">No quizzes are currently available.</p>
                    </div>
                ) : (
                    quizzes.map(q => (
                        <div key={q.id} className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{q.title}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-slate-500">
                                    <span>{q.questions_count} Questions</span>
                                    <span>{q.passing_score}% Passing Score</span>
                                </div>
                            </div>
                            <Link to={`/modules/${q.module}/quiz`} className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition-colors">
                                Attempt Quiz
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentQuizList;
