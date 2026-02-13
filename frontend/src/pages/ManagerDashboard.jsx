import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ManagerDashboard = () => {
    const [stats, setStats] = useState({ total_learners: 0, total_completions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading management data...</div>;

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Manager Overview</h1>
                <p className="text-slate-600">Basic platform statistics and learner metrics.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-center">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Learners</h2>
                    <p className="text-5xl font-black text-blue-600">{stats.total_learners}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-center">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Module Completions</h2>
                    <p className="text-5xl font-black text-green-600">{stats.total_completions}</p>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
