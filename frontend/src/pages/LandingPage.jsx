import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col">
            {/* Navbar */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-600">LMS Platform</div>
                    <nav className="flex items-center gap-6">
                        {user ? (
                            <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                My Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-blue-700 transition-colors">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-6 text-center bg-slate-50 border-b border-slate-200">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        The Simple Learning <br />
                        <span className="text-blue-600">Management System</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                        A robust platform designed for efficient knowledge transfer and progress tracking.
                        Empowering learners to grow and managers to lead.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all text-lg shadow-lg shadow-blue-600/20">
                            Create Account
                        </Link>
                        <a href="#features" className="w-full sm:w-auto text-slate-600 font-semibold hover:text-slate-900 px-8 py-3 translate-x-0">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 container mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">Core Capabilities</h2>
                    <p className="text-slate-500 mt-2">Everything you need to manage education effectively.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Structured Modules</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Organize content into logical units with video resources, notes, and assessments.
                        </p>
                    </div>
                    <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Progress Tracking</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Real-time monitoring of module completion and performance across the platform.
                        </p>
                    </div>
                    <div className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Notes & QA</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            In-player notes system and direct channel for student-teacher communication.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-xl font-bold text-blue-600">LMS Platform</div>
                    <div className="text-slate-500 text-sm">
                        &copy; 2026 LMS Platform. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-slate-600">
                        <Link to="/login" className="hover:text-blue-600">Login</Link>
                        <Link to="/register" className="hover:text-blue-600">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
