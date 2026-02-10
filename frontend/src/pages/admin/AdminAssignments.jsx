import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, UserMinus, ClipboardList, User, Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAssignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedModule, setSelectedModule] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignmentsRes, modulesRes] = await Promise.all([
                api.get('/assignments/'),
                api.get('/modules/')
            ]);
            setAssignments(assignmentsRes.data);
            setModules(modulesRes.data);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assignments/', {
                user: selectedUser,
                module: selectedModule
            });
            alert("Assignment directive issued!");
            fetchData();
            setSelectedUser('');
            setSelectedModule('');
        } catch (error) {
            console.error("Assignment failed", error);
            alert("Failed to assign module. Ensure User ID is correct.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase flex items-center gap-3">
                        <ClipboardList className="text-primary" size={32} /> Assignment Directives
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Issue training protocols to specific units.</p>
                </div>
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-muted-foreground hover:text-white" onClick={() => navigate('/admin')}>
                    <ArrowLeft size={20} />
                </Button>
            </div>

            <Card className="bg-[#030712] border-white/5 rounded-[32px] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-blue-400 w-full" />
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-2">
                        <Plus className="text-primary" size={20} /> Issue New Directive
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={12} /> Target User ID
                            </label>
                            <Input
                                placeholder="Enter Unit ID"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                required
                                className="h-12 bg-white/5 border-white/5 rounded-xl focus:ring-primary focus:border-primary font-bold"
                            />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Layers size={12} /> Training Module
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full h-12 px-4 border border-white/5 rounded-xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-white font-bold text-sm"
                                    value={selectedModule}
                                    onChange={(e) => setSelectedModule(e.target.value)}
                                    required
                                >
                                    <option value="" className="bg-slate-900">Select Protocol</option>
                                    {modules.map(m => (
                                        <option key={m.id} value={m.id} className="bg-slate-900">{m.title}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ArrowLeft size={16} className="-rotate-90" />
                                </div>
                            </div>
                        </div>
                        <Button type="submit" className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 w-full md:w-auto">
                            Execute Assign
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Active Protocols</h2>
                <div className="grid gap-4">
                    {assignments.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-[24px] border border-dashed border-white/10">
                            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No active directives found</p>
                        </div>
                    ) : (
                        assignments.map(a => (
                            <div key={a.id} className="p-6 rounded-[24px] bg-[#030712] border border-white/5 flex flex-col md:flex-row justify-between items-center group hover:border-primary/30 transition-all duration-300">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol: {a.module_title || `Module ${a.module}`}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="font-bold text-white">Unit ID: {a.user}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                        <span className={`uppercase font-black text-[10px] tracking-wider ${a.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`}>{a.status}</span>
                                    </div>
                                </div>
                                {/* Future: Add revoke button */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAssignments;

