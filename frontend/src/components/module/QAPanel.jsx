import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { MessageSquare, Send, User, Reply, ChevronDown, ChevronUp } from 'lucide-react';

const QAPanel = ({ moduleId }) => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedDiscussionId, setExpandedDiscussionId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        fetchDiscussions();
    }, [moduleId]);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/discussions/?module_id=${moduleId}`);
            setDiscussions(response.data);
        } catch (error) {
            console.error("Failed to fetch discussions", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        try {
            setSubmitting(true);
            const response = await api.post('/discussions/', {
                module_id: moduleId,
                title: newQuestion.substring(0, 50) + (newQuestion.length > 50 ? '...' : ''),
                content: newQuestion
            });
            setDiscussions([response.data, ...discussions]);
            setNewQuestion('');
        } catch (error) {
            console.error("Failed to post question", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePostReply = async (discussionId) => {
        if (!replyContent.trim()) return;

        try {
            setSubmitting(true);
            const response = await api.post('/replies/', {
                discussion_id: discussionId,
                content: replyContent
            });

            // Update local state
            setDiscussions(discussions.map(d => {
                if (d.id === discussionId) {
                    return {
                        ...d,
                        replies: [...(d.replies || []), response.data],
                        reply_count: (d.reply_count || 0) + 1
                    };
                }
                return d;
            }));

            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            console.error("Failed to post reply", error);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleDiscussion = (id) => {
        if (expandedDiscussionId === id) {
            setExpandedDiscussionId(null);
        } else {
            setExpandedDiscussionId(id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#030712]/40 backdrop-blur-3xl animate-in">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Neural Link / Q&A</h3>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Live
                </div>
            </div>

            {/* Discussion List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loading ? (
                    <div className="text-center p-10 text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">Syncing...</div>
                ) : discussions.length === 0 ? (
                    <div className="text-center p-10 text-white/20 text-xs font-black uppercase tracking-widest">No active neural threads</div>
                ) : (
                    discussions.map(discussion => (
                        <div key={discussion.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/10">
                            <div
                                className="cursor-pointer"
                                onClick={() => toggleDiscussion(discussion.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                        <User size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{discussion.user?.username || 'Unknown Node'}</span>
                                            <span className="text-[9px] font-bold text-white/20">{new Date(discussion.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-medium text-white/90 mt-1 leading-relaxed">{discussion.content}</p>

                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                                <MessageSquare size={12} />
                                                {discussion.reply_count} Replies
                                            </div>
                                            {expandedDiscussionId === discussion.id ? <ChevronUp size={12} className="text-white/40" /> : <ChevronDown size={12} className="text-white/40" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Replies Section */}
                            {expandedDiscussionId === discussion.id && (
                                <div className="mt-4 pt-4 border-t border-white/5 pl-4 ml-4 border-l">
                                    <div className="space-y-4 mb-4">
                                        {discussion.replies?.map(reply => (
                                            <div key={reply.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                                                    <User size={10} />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{reply.user?.username}</span>
                                                    <p className="text-xs text-white/70 mt-0.5">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={replyingTo === discussion.id ? replyContent : ''}
                                            onChange={(e) => {
                                                setReplyingTo(discussion.id);
                                                setReplyContent(e.target.value);
                                            }}
                                            placeholder="Transmit reply..."
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50 placeholder:text-white/20"
                                            onKeyDown={(e) => e.key === 'Enter' && handlePostReply(discussion.id)}
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handlePostReply(discussion.id)}
                                            disabled={submitting || (replyingTo === discussion.id && !replyContent.trim())}
                                            className="h-full aspect-square p-0 bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/20"
                                        >
                                            <Send size={12} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Post Question Area */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                <form onSubmit={handlePostQuestion} className="relative">
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Initiate new discussion thread..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-12 resize-none h-24 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20 text-white"
                        disabled={submitting}
                    />
                    <Button
                        type="submit"
                        disabled={submitting || !newQuestion.trim()}
                        className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-lg bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {submitting ? <div className="animate-spin w-3 h-3 border-2 border-white/50 border-t-white rounded-full" /> : <Send size={14} />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default QAPanel;
