import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const LearnerDashboard = () => {
    const { user } = useAuth();
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [modulesRes, progressRes] = await Promise.all([
                    api.get('/modules/'),
                    api.get('/progress/')
                ]);
                setModules(modulesRes.data);

                const progressMap = {};
                if (Array.isArray(progressRes.data)) {
                    progressRes.data.forEach(p => {
                        progressMap[p.module] = p;
                    });
                }
                setProgress(progressMap);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your learning dashboard...</div>;

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Welcome Back, {user?.username}</h1>
                <p className="text-slate-600">Track your progress and continue your learning modules below.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => {
                    const moduleProgress = progress[module.id];
                    const progressPercentage = moduleProgress?.progress_percentage || 0;

                    return (
                        <div key={module.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                            <div className="p-6 flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{module.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{module.description}</p>

                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 border-t border-slate-200">
                                <Link
                                    to={`/modules/${module.id}`}
                                    className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                                >
                                    {progressPercentage > 0 ? 'Continue Module' : 'Start Module'}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {modules.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">No learning modules available at this time.</p>
                </div>
            )}
        </div>
    );
};

export default LearnerDashboard;
