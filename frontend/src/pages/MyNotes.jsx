import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MyNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await api.get('/notes/list/');
                setNotes(response.data);
            } catch (error) {
                console.error("Failed to fetch notes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your notes...</div>;

    return (
        <div className="space-y-10 animate-fade-in font-sans">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <h1 className="heading-h1 mb-3">Knowledge Journal</h1>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">Your centralized repository of cross-module architectural insights and tactical synchronization logs.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2 mr-4">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 shadow-sm" />)}
                    </div>
                    <span className="label-caps px-4 py-1.5 bg-gray-900 text-white rounded-xl shadow-soft">Collaborative Sync</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map((note) => (
                    <div key={note.id} className="relative bg-white border border-gray-100 rounded-3xl p-8 shadow-soft hover:shadow-intense transition-all duration-500 hover:-translate-y-1.5 group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 overflow-hidden" />
                        <div className="flex items-center justify-between mb-6">
                            <span className="label-caps tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/50">
                                {note.module_title}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-gray-900 group-hover:bg-gray-100 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </div>
                        </div>
                        <div className="relative">
                            <svg className="w-8 h-8 text-gray-100 absolute -top-4 -left-4 opacity-50 group-hover:text-blue-100 transition-colors" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8h6v-8h-6zm12 0v8h6v-8h-6z" /></svg>
                            <p className="text-gray-700 leading-relaxed font-medium italic relative z-10 pl-2">
                                {note.content}
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-gray-100 mr-2 shadow-inner" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saved Identity</span>
                            </div>
                            <time className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">
                                {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </time>
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-[24px] flex items-center justify-center text-gray-300 mb-6 shadow-soft">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 012.828 0L20 4.586a2 2 0 010 2.828l-9.414 9.414-4 1 1-4 9.414-9.414z"></path></svg>
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active journal entries detected.</p>
                    <p className="text-gray-400 text-sm mt-1">Initiate a learning vector to capture insights.</p>
                </div>
            )}
        </div>
    );
};

export default MyNotes;
