import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 text-center space-y-8 p-6">
                <div className="w-24 h-24 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-center mx-auto animate-float">
                    <Sparkles size={48} className="text-primary" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-8xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">404</h1>
                    <p className="text-xl font-bold uppercase tracking-widest text-slate-500">Signal Lost</p>
                    <p className="max-w-md mx-auto text-slate-400 font-medium">The neural node you are attempting to access does not exist or has been decommissioned.</p>
                </div>

                <div className="pt-8">
                    <Link to="/">
                        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            Re-establish Link <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

