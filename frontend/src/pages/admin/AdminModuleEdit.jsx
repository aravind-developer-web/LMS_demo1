import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Save, Layers, Clock, Zap } from 'lucide-react';

const AdminModuleEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 30,
        difficulty: 'beginner',
        priority: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchModule();
    }, [id]);

    const fetchModule = async () => {
        try {
            const response = await api.get(`/modules/${id}/`);
            setFormData({
                title: response.data.title,
                description: response.data.description,
                duration: response.data.duration,
                difficulty: response.data.difficulty,
                priority: 0 // API might not return this if not in serializer, defaults to 0
            });
        } catch (error) {
            console.error("Failed to fetch module", error);
            alert("Failed to load module data");
            navigate('/admin/modules');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/modules/${id}/`, formData);
            alert("Module updated successfully");
            navigate('/admin/modules');
        } catch (error) {
            console.error("Failed to update module", error);
            alert("Failed to update module");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-muted-foreground hover:text-white" onClick={() => navigate('/admin/modules')}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground italic uppercase">Modify Node Configuration</h1>
                    <p className="text-muted-foreground text-sm font-medium">Update parameters for module {id}.</p>
                </div>
            </div>

            <Card className="bg-[#030712] border-white/5 rounded-[32px] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-primary w-full" />
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Layers size={12} /> Module Title
                            </label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="h-14 bg-white/5 border-white/5 rounded-2xl focus:ring-primary focus:border-primary text-lg font-bold placeholder:text-slate-700"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Zap size={12} /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-4 border border-white/5 rounded-2xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] text-white font-medium resize-none placeholder:text-slate-700"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Clock size={12} /> Est. Duration (MIN)
                                </label>
                                <Input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    required
                                    className="h-14 bg-white/5 border-white/5 rounded-2xl focus:ring-primary focus:border-primary font-bold"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Zap size={12} /> Complexity Tier
                                </label>
                                <div className="relative">
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full h-14 px-4 border border-white/5 rounded-2xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary appearance-none text-white font-bold uppercase tracking-wide"
                                    >
                                        <option value="beginner" className="bg-slate-900">Beginner Tier</option>
                                        <option value="intermediate" className="bg-slate-900">Intermediate Tier</option>
                                        <option value="advanced" className="bg-slate-900">Advanced Tier</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <ArrowLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-sm"
                            >
                                {saving ? 'Saving Changes...' : 'Update Module'} <Save className="ml-3" size={18} />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminModuleEdit;

