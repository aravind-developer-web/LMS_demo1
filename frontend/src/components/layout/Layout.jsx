import React, { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    BookOpen,
    MessageSquare,
    BarChart3,
    LogOut,
    Menu,
    X,
    User,
    Settings,
    ChevronRight,
    Search,
    Sparkles,
    FileText,
    ClipboardList,
    BrainCircuit
} from 'lucide-react';
import NeuralOracle from '../ai/NeuralOracle';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
    >
        <Icon size={20} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
        {!collapsed && <span className="font-medium">{label}</span>}
        {active && !collapsed && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </Link>
);

const Layout = () => {
    const { user, logout, loading } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const isManager = user?.role === 'manager' || user?.role === 'admin';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 relative z-20 ${collapsed ? 'w-20' : 'w-72'
                    }`}
            >
                {/* ... (Existing Sidebar Content - Kept Same) ... */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        {!collapsed && (
                            <>
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                    <BookOpen size={18} />
                                </div>
                                <span>LMS Enterprise</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors mx-auto"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {/* Reusing Links Logic */}
                    {isManager ? (
                        <div className="py-4 space-y-2">
                            {!collapsed && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Command Center</p>}
                            <SidebarLink to="/dashboard/intelligence" icon={BrainCircuit} label="Neural Intelligence" active={location.pathname === '/dashboard/intelligence'} collapsed={collapsed} />
                            <SidebarLink to="/dashboard/analytics" icon={BarChart3} label="Team Analytics" active={location.pathname === '/dashboard/analytics'} collapsed={collapsed} />
                            <div className="pt-4">
                                {!collapsed && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Vault</p>}
                                <SidebarLink to="/my-notes" icon={MessageSquare} label="Neural Notes" active={location.pathname === '/my-notes'} collapsed={collapsed} />
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-2">
                            {!collapsed && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Intelligence</p>}
                            <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} collapsed={collapsed} />
                            <SidebarLink to="/my-notes" icon={MessageSquare} label="Personal Notes" active={location.pathname === '/my-notes'} collapsed={collapsed} />
                            <SidebarLink to="/quizzes" icon={FileText} label="Quizzes" active={location.pathname === '/quizzes'} collapsed={collapsed} />
                            <SidebarLink to="/assignments" icon={ClipboardList} label="Assignments" active={location.pathname === '/assignments'} collapsed={collapsed} />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border mt-auto bg-muted/20">
                    <Link to="/profile" className={`flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-white/5 transition-colors cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                            <User size={20} />
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{user.username}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user.role}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={(e) => { e.preventDefault(); logout(); }} className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-auto">
                                <LogOut size={18} />
                            </button>
                        )}
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="relative bg-card w-4/5 max-w-xs h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                    <BookOpen size={18} />
                                </div>
                                <span>LMS Mobile</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-secondary rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {/* Mobile Links (Same as Desktop but always expanded) */}
                            {isManager ? (
                                <>
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Command Center</p>
                                    <SidebarLink to="/dashboard/intelligence" icon={BrainCircuit} label="Neural Intelligence" active={location.pathname === '/dashboard/intelligence'} collapsed={false} />
                                    <SidebarLink to="/dashboard/analytics" icon={BarChart3} label="Team Analytics" active={location.pathname === '/dashboard/analytics'} collapsed={false} />
                                    <SidebarLink to="/my-notes" icon={MessageSquare} label="Neural Notes" active={location.pathname === '/my-notes'} collapsed={false} />
                                </>
                            ) : (
                                <>
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Intelligence</p>
                                    <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} collapsed={false} />
                                    <SidebarLink to="/my-notes" icon={MessageSquare} label="Personal Notes" active={location.pathname === '/my-notes'} collapsed={false} />
                                    <SidebarLink to="/quizzes" icon={FileText} label="Quizzes" active={location.pathname === '/quizzes'} collapsed={false} />
                                    <SidebarLink to="/assignments" icon={ClipboardList} label="Assignments" active={location.pathname === '/assignments'} collapsed={false} />
                                </>
                            )}
                        </div>

                        <div className="mt-auto border-t border-border pt-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold">{user.username}</p>
                                    <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive hover:text-white transition-colors">
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden border-b border-border p-4 flex justify-between items-center bg-card sticky top-0 z-10">
                    <div className="flex items-center gap-2 font-bold">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <BookOpen size={18} />
                        </div>
                        <span>LMS Enterprise</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-secondary rounded-lg active:scale-95 transition-transform">
                        <Menu size={20} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-in pb-24 md:pb-8" id="main-content">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Neural Oracle for Learners */}
            {!isManager && <NeuralOracle />}
        </div>
    );
};

export default Layout;
