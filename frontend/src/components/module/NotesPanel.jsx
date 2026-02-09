import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { Save, CheckCircle, Smartphone } from 'lucide-react';

const NotesPanel = ({ moduleId }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        fetchNotes();
        return () => clearTimeout(timeoutRef.current);
    }, [moduleId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/notes/${moduleId}/`);
            setNote(response.data.content || '');
            setLastSaved(response.data.updated_at);
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (content = note) => {
        try {
            setSaving(true);
            const response = await api.put(`/notes/${moduleId}/`, { content });
            setLastSaved(response.data.updated_at);
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const newContent = e.target.value;
        setNote(newContent);
        setSaving(true); // Indicate pending save

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            handleSave(newContent);
        }, 1500); // Auto-save after 1.5s
    };

    return (
        <div className="flex flex-col h-full bg-[#030712]/40 backdrop-blur-3xl animate-in">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Journal Node</h3>
                <div className="flex items-center gap-2">
                    {saving ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing...</span>
                    ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1">
                            <CheckCircle size={10} /> Synced
                        </span>
                    )}
                </div>
            </div>
            <div className="flex-1 p-0">
                <textarea
                    className="w-full h-full p-8 resize-none bg-transparent focus:outline-none text-lg font-medium italic leading-relaxed text-white/80 placeholder:text-white/10"
                    placeholder="Enter architectural insights..."
                    value={loading ? 'Synchronizing Archive...' : note}
                    onChange={handleChange}
                    disabled={loading}
                />
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.01] text-[9px] font-black text-white/20 uppercase tracking-widest text-center">
                {lastSaved ? `Last Neural Sync: ${new Date(lastSaved).toLocaleTimeString()}` : 'Buffer Empty'}
            </div>
        </div>
    );
};

export default NotesPanel;
