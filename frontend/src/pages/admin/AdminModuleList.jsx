import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Layers, Search, ArrowRight, Clock, Zap } from 'lucide-react';

const AdminModuleList = () => {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const response = await api.get('/modules/');
            setModules(response.data);
        } catch (error) {
            console.error("Failed to fetch modules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this module?")) return;
        try {
            await api.delete(`/modules/${id}/`);
            fetchModules();
        } catch (error) {
            console.error("Failed to delete module", error);
        }
    };

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
                        <Layers className="text-primary" size={32} /> Module Registry
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium max-w-xl">Architect the curriculum structure and manage learning nodes.</p>
                </div>
                <div className="relative z-10">
                    <Button
                        onClick={() => navigate('/admin/modules/create')}
                        className="rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20 group transition-all"
                    >
                        <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Create New Module
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {modules.map(module => (
                    <Card key={module.id} className="group flex flex-col md:flex-row justify-between items-center p-6 bg-[#030712] border-white/5 hover:border-primary/30 transition-all duration-300">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">ID: 0X{module.id}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                    {module.difficulty}
                                </span>
                            </div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase text-white group-hover:text-primary transition-colors">{module.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{module.description}</p>
                            <div className="flex gap-4 mt-3">
                                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                    <Clock size={12} /> {module.duration} mins
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4 md:mt-0 pl-0 md:pl-6 border-l-0 md:border-l border-white/5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/modules/${module.id}/edit`)}
                                className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <Edit size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                onClick={() => handleDelete(module.id)}
                            >
                                <Trash size={16} />
                            </Button>
                        </div>
                    </Card>
                ))}
                {modules.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/20">
                            <Layers size={32} />
                        </div>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No active nodes detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminModuleList;

