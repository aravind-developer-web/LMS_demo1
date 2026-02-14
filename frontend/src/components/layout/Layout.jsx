import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarLinks = [
        { name: 'Learning Dashboard', path: '/dashboard', roles: ['learner'] },
        { name: 'My Notes', path: '/my-notes', roles: ['learner'] },
        { name: 'Quizzes List', path: '/quizzes', roles: ['learner'] },
        { name: 'Assignments List', path: '/assignments', roles: ['learner'] },
        { name: 'Manager View', path: '/dashboard', roles: ['manager', 'admin'] },
    ];

    const filteredLinks = sidebarLinks.filter(link =>
        !link.roles || (user && link.roles.includes(user.role))
    );

    const isManagerLanding = user?.role === 'manager' && location.pathname === '/dashboard';

    return (
        <div className="flex h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
            {/* Sidebar - Hidden for Manager Control Tower */}
            {!isManagerLanding && (
                <aside className="w-64 bg-white border-r border-gray-100 flex flex-col z-20 shadow-subtle shrink-0">
                    <div className="p-8 pb-6">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-soft active:scale-95 transition-transform">L</div>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight">LMS <span className="text-blue-600">Pro</span></h1>
                        </div>

                        {user && (
                            <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100/50">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Network Node</div>
                                <div className="text-sm font-semibold text-gray-900 truncate">{user.username}</div>
                            </div>
                        )}
                    </div>

                    <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
                        <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Workspace</div>
                        {filteredLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-gray-100 text-gray-900 shadow-soft'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={`mr-3 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    </span>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all uppercase tracking-widest group"
                        >
                            <span>Terminate Session</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative h-screen">
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px] pointer-events-none" />
                <div className={`relative z-10 p-6 md:p-10 animate-fade-in ${isManagerLanding ? 'w-full' : ''}`}>
                    <div className={isManagerLanding ? 'w-full' : 'max-w-6xl mx-auto'}>
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
