import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import api from '../services/api';

const ModulePlayer = () => {
    const { id } = useParams();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const fetchModuleData = async () => {
            try {
                const response = await api.get(`/modules/${id}/`);
                setModule(response.data);

                const videos = response.data.resources?.filter(r => r.type === 'video') || [];
                if (videos.length > 0) setActiveVideo(videos[0]);

                const notesRes = await api.get(`/notes/list/?module=${id}`);
                setNotes(notesRes.data || []);
            } catch (error) {
                console.error("Failed to fetch module details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModuleData();
    }, [id]);

    const handleSaveNote = async () => {
        if (!note.trim()) return;
        try {
            const res = await api.post('/notes/create/', {
                module: id,
                content: note
            });
            setNotes([res.data, ...notes]);
            setNote('');
        } catch (error) {
            console.error("Failed to save note", error);
        }
    };

    const markComplete = async () => {
        try {
            await api.patch(`/progress/${id}/`, { status: 'completed' });
        } catch (error) {
            console.error("Failed to mark complete", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading module resources...</div>;
    if (!module) return <div className="p-8 text-center text-red-500">Module not found.</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
                    <p className="text-sm text-slate-600">Module Player & Resource Center</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={markComplete} className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition-colors text-sm">
                        Mark as Complete
                    </button>
                    <Link to={`/modules/${id}/quiz`} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors text-sm">
                        Quiz
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-black aspect-video rounded-lg overflow-hidden shadow-lg border border-slate-200">
                        {activeVideo ? (
                            <ReactPlayer
                                url={activeVideo.url}
                                width="100%"
                                height="100%"
                                controls
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                No video selected
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">About this Module</h2>
                        <p className="text-slate-700">{module.description}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Module Notes</h2>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Type your notes here..."
                            className="w-full h-32 p-3 border border-slate-300 rounded text-sm mb-3 outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button onClick={handleSaveNote} className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700">
                            Save Note
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Resources</h2>
                        <div className="space-y-2">
                            {module.resources?.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setActiveVideo(v)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${activeVideo?.id === v.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    {v.title} ({v.type})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulePlayer;
