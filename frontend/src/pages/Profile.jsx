import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
    const { user, logout } = useAuth();

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            <header className="text-center py-10">
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-200 flex items-center justify-center mb-6 border-4 border-white shadow-md">
                    <span className="text-3xl font-bold text-slate-500">
                        {user?.username?.charAt(0).toUpperCase()}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{user?.username}</h1>
                <p className="text-slate-500 mt-1 uppercase tracking-widest text-xs font-bold">{user?.role} Account</p>
            </header>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100 text-slate-800">
                            {user?.email || 'No email registered'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Role & Permissions</label>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100 text-slate-800 uppercase text-sm font-semibold">
                            {user?.role}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">User Identifier</label>
                        <div className="p-3 bg-slate-50 rounded border border-slate-100 text-slate-500 font-mono text-xs">
                            ID: {user?.id || '0000'}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Sign Out
                    </button>
                    <button
                        className="w-full bg-white text-slate-600 border border-slate-300 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                        onClick={() => alert("Password change feature is currently in maintenance.")}
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
