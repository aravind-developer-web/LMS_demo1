import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const BroadcastPlayer = () => {
    const { id } = useParams();
    const [broadcast, setBroadcast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBroadcast = async () => {
            try {
                const res = await api.get(`/management/broadcasts/${id}/`);
                setBroadcast(res.data);
            } catch (error) {
                console.error("Failed to fetch broadcast", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBroadcast();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-slate-500">Connecting to broadcast stream...</div>;
    if (!broadcast) return <div className="p-12 text-center text-red-500">Broadcast signal lost.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <Link to="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 font-medium">
                    &larr; Back to Dashboard
                </Link>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-tighter">
                    Live Broadcast
                </span>
            </header>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-video bg-black relative">
                    {broadcast.link ? (
                        <iframe
                            className="w-full h-full"
                            src={broadcast.link.replace('watch?v=', 'embed/')}
                            title={broadcast.title}
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white italic p-12 text-center">
                            This broadcast does not have a video link attached.
                        </div>
                    )}
                </div>

                <div className="p-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{broadcast.title}</h1>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                        {broadcast.description || "No additional details provided for this broadcast."}
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 border-dashed">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-widest">Notice</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Broadcasts are recorded for compliance and quality assurance. If you experience technical difficulties, please contact system administration.
                </p>
            </div>
        </div>
    );
};

export default BroadcastPlayer;
