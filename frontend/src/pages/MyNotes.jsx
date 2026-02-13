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
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Knowledge Journal</h1>
                <p className="text-slate-600">A collection of your insights and observations from various modules.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                    <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                            {note.module_title}
                        </div>
                        <p className="text-slate-700 italic border-l-4 border-slate-100 pl-4 py-1 mb-4">
                            "{note.content}"
                        </p>
                        <div className="text-xs text-slate-400">
                            Saved on: {new Date(note.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                    <p className="text-slate-500">You haven't saved any notes yet. Start learning and save notes within modules.</p>
                </div>
            )}
        </div>
    );
};

export default MyNotes;
