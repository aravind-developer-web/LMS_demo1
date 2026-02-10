import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Shield, Key, Mail, CircuitBoard, LogOut, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in pb-20">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-[100px] pointer-events-none" />
                <div className="relative z-10 text-center py-10">
                    <div className="w-32 h-32 mx-auto rounded-full bg-[#030712] border-4 border-white/5 flex items-center justify-center mb-6 shadow-2xl relative group">
                        <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse" />
                        <User size={64} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{user?.username}</h1>
                    <p className="text-muted-foreground mt-2 font-medium tracking-widest uppercase text-sm">{user?.role} Unit</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-[#030712] border-white/5 rounded-[32px] overflow-hidden">
                    <CardHeader className="border-b border-white/5 p-8">
                        <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight">
                            <Shield className="text-blue-500" size={24} /> Identity Signature
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={12} /> Neural Address
                            </label>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold">
                                {user?.email || 'No email registered'}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Key size={12} /> Access Level
                            </label>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold uppercase">
                                {user?.role}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <CircuitBoard size={12} /> Node ID
                            </label>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 font-mono text-xs">
                                USER-UUID-0X{user?.id ? user.id.toString(16).toUpperCase().padStart(8, '0') : '0000'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="bg-[#030712] border-white/5 rounded-[32px] overflow-hidden">
                        <CardHeader className="border-b border-white/5 p-8">
                            <CardTitle className="flex items-center gap-3 text-xl font-black italic uppercase tracking-tight">
                                <Key className="text-purple-500" size={24} /> Security Protocols
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <Button
                                onClick={() => toast.error('PROTOCOL RESTRICTED: Demo Account Locked')}
                                variant="outline"
                                className="w-full h-14 justify-between bg-white/5 border-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl"
                            >
                                Change Password <ArrowRight size={16} />
                            </Button>
                            <Button
                                onClick={() => toast.success('2FA STATUS: Active (Simulated)')}
                                variant="outline"
                                className="w-full h-14 justify-between bg-white/5 border-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-xl"
                            >
                                Two-Factor Auth <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded">Disabled</span>
                            </Button>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={logout}
                        className="w-full h-16 rounded-[24px] bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white font-black uppercase tracking-widest shadow-xl transition-all"
                    >
                        Terminate Session <LogOut className="ml-3" size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
