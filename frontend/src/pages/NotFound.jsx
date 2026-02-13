import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-900">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl text-slate-600 mb-8">Page not found</p>
            <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;
