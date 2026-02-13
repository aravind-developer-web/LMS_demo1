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

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-blue-600">LMS Platform</h1>
                    {user && (
                        <div className="mt-2 text-xs text-slate-500">
                            Logged in as: <span className="font-semibold">{user.username}</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {filteredLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`block px-4 py-2 rounded transition-colors ${location.pathname === link.path
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
