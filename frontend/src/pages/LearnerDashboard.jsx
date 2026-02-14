import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Link } from 'react-router-dom';

const LearnerDashboard = () => {
    const { user } = useAuth();
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState({});
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [modulesRes, progressRes, broadcastsRes] = await Promise.all([
                api.get('/modules/'),
                api.get('/modules/my-progress/').catch(() => ({ data: [] })),
                api.get('/management/broadcasts/').catch(() => ({ data: [] }))
            ]);
            setModules(modulesRes.data);
            setBroadcasts(broadcastsRes.data);

            const progressMap = {};
            if (progressRes.data && Array.isArray(progressRes.data)) {
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

    // Loading State with Skeleton
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                {/* Header Skeleton */}
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-96"></div>
                </div>

                {/* Metrics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                        </div>
                    ))}
                </div>

                {/* Module Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-[28px] p-6 animate-pulse">
                            <div className="h-10 w-10 bg-gray-100 rounded-2xl mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
                            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty State - No Modules
    if (modules.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Modules Available</h2>
                <p className="text-gray-500 mb-8">
                    Your learning curriculum is currently empty. Contact your manager to get started with your professional development.
                </p>
                <Link to="/profile" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all">
                    View Profile
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="heading-h1 mb-1">Welcome back, {user?.username}</h1>
                    <p className="text-gray-500 font-medium">Your enterprise learning vectors are synchronized.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="label-caps bg-gray-100 px-3 py-1 rounded-full border border-gray-200/50">Lvl 4 Associate</span>
                </div>
            </header>

            {/* Premium Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(() => {
                    const totalModules = modules.length;
                    const completedModules = Object.values(progress).filter(p => p.status === 'completed').length;
                    const inProgressModules = Object.values(progress).filter(p => p.status === 'in_progress').length;
                    const completionRate = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                    const iconColorMap = {
                        blue: 'bg-blue-50 text-blue-600 border-blue-100/50',
                        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
                        purple: 'bg-purple-50 text-purple-600 border-purple-100/50',
                        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                    };

                    return [
                        { label: 'Completion Rate', value: `${completionRate}%`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'blue' },
                        { label: 'Total Modules', value: totalModules, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253', color: 'indigo' },
                        { label: 'In Progress', value: inProgressModules, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'purple' },
                        { label: 'Completed', value: completedModules, icon: 'M5 13l4 4L19 7', color: 'emerald' }
                    ].map((stat, i) => (
                        <div key={i} className="metric-card group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${iconColorMap[stat.color]} group-hover:scale-110 transition-transform shadow-soft`} aria-hidden="true">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{stat.value}</div>
                            <div className="label-caps text-[10px]">{stat.label}</div>
                        </div>
                    ));
                })()}
            </div>

            {/* Hero Section: Continue Learning */}
            <section className="hero-card bg-gradient-to-br from-white to-gray-50/50 border-gray-100 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-100/20 rounded-full blur-2xl -ml-24 -mb-24" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100/50">
                            Active Stream
                        </div>
                        <h2 className="heading-h2">Next Up: Core Systems Protocol</h2>
                        <div className="space-y-3 max-w-md">
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span className="uppercase tracking-widest">Mastery Level: 42%</span>
                                <span>12m Remaining</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[42%] transition-all duration-1000 shadow-sm" />
                            </div>
                        </div>
                        <button className="btn-primary group-hover:px-8 transition-all">
                            Synchronize & Resume
                        </button>
                    </div>
                    <div className="w-full md:w-80 h-48 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200/50 shadow-soft relative transition-transform group-hover:scale-105">
                        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-sm rounded-2xl" />
                        <svg className="w-16 h-16 text-blue-600 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
            </section>

            {/* Secondary Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Modules Grid */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Structured Curriculum Navigation */}
                    <div className="space-y-12">
                        {[1, 2, 3, 4].map((weekNum) => {
                            const weekModules = modules.filter(m => m.week === weekNum);
                            if (weekModules.length === 0) return null;

                            return (
                                <section key={weekNum} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Week {weekNum}: Scientific Protocols</h2>
                                        <div className="h-px flex-1 bg-gray-100" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                            {weekModules.filter(m => progress[m.id]?.status === 'completed').length} / {weekModules.length} Sync'd
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {weekModules.map((module) => {
                                            const modProgress = progress[module.id];
                                            const isCompleted = modProgress?.status === 'completed';
                                            const isInProgress = modProgress?.status === 'in_progress';

                                            return (
                                                <Link
                                                    key={module.id}
                                                    to={`/modules/${module.id}`}
                                                    className="group bg-white border border-gray-100 rounded-[28px] p-6 hover:border-blue-200 transition-all shadow-soft hover:shadow-strong active:scale-[0.98] relative overflow-hidden"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <span className="text-xs font-bold">{module.id}</span>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-colors ${isCompleted ? 'bg-green-50 text-green-600 border-green-100' :
                                                            isInProgress ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-gray-50 text-gray-400 border-gray-100'
                                                            }`}>
                                                            {isCompleted ? 'Synchronized' : isInProgress ? 'Active' : 'Standby'}
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{module.title}</h3>
                                                    <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6 line-clamp-2">
                                                        {module.description}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {module.difficulty} protocol
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                            &rarr;
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar Failsafe */}
                                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                                                            style={{ width: isCompleted ? '100%' : isInProgress ? '50%' : '0%' }}
                                                        />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnerDashboard;
