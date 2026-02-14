import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl shadow-gray-200/50 p-10 border border-gray-200/60">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-blue-500/20" role="img" aria-label="LMS Platform Logo">L</div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Enterprise Sign In</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Access your professional learning gateway</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="username">Corporate Identity</label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:bg-white outline-none transition-all placeholder:text-gray-300 text-sm"
                            placeholder="username@enterprise"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" htmlFor="password">Security Protocol</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 focus:bg-white outline-none transition-all placeholder:text-gray-300 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                    >
                        {loading ? 'Authenticating...' : 'Establish Session'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                    New associate? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register Identity</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
