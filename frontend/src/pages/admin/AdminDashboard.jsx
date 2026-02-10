import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, CheckCircle, Plus, Activity, Zap, Shield, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_learners: 0,
        completed_modules_count: 0,
        passed_quizzes_count: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/analytics/team/');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const data = [
        { name: 'Completed Modules', value: stats.completed_modules_count },
        { name: 'Passed Quizzes', value: stats.passed_quizzes_count },
    ];

    const COLORS = ['#3b82f6', '#10b981'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Loading Command Center...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 animate-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div className="absolute -top-24 -left-20 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter text-foreground italic uppercase">Command Center</h1>
                    <p className="text-muted-foreground mt-2 text-xl font-medium max-w-xl">Oversee ecosystem performance and deploy new directives.</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <Button
                        onClick={() => navigate('/admin/modules/create')}
                        className="rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-14 px-8 shadow-2xl shadow-primary/20 group transition-all"
                    >
                        <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> New Module
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/modules')}
                        className="rounded-[20px] border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-14 px-8"
                    >
                        Manage Modules
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="premium-card bg-[#030712] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Total Learners</CardTitle>
                        <Users className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic tracking-tighter text-white">{stats.total_learners}</div>
                        <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={12} /> Active Units
                        </p>
                    </CardContent>
                </Card>
                <Card className="premium-card bg-[#030712] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Modules Completed</CardTitle>
                        <BookOpen className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic tracking-tighter text-white">{stats.completed_modules_count}</div>
                        <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest flex items-center gap-1">
                            <Zap size={12} /> Knowledge Sync
                        </p>
                    </CardContent>
                </Card>
                <Card className="premium-card bg-[#030712] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Quizzes Passed</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic tracking-tighter text-white">{stats.passed_quizzes_count}</div>
                        <p className="text-[10px] font-bold text-green-500 mt-2 uppercase tracking-widest flex items-center gap-1">
                            <Shield size={12} /> Verified Skills
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#030712] border-white/5 rounded-[32px] overflow-hidden p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight">
                            <LayoutDashboard className="text-blue-500" size={24} /> Completion Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-[#030712] border-white/5 rounded-[32px] overflow-hidden p-6">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight">
                            <Activity className="text-purple-500" size={24} /> Engagement Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

