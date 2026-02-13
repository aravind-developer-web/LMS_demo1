import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StudentAssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/assignments/learner/my-assignments/');
            setAssignments(response.data);
        } catch (err) {
            console.error("Failed to fetch assignments", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your assignments...</div>;

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Assignments</h1>
                <p className="text-slate-600">Complete tasks assigned to you by your instructors.</p>
            </header>

            <div className="space-y-4">
                {assignments.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                        <p className="text-slate-500">No assignments found.</p>
                    </div>
                ) : (
                    assignments.map(a => (
                        <div key={a.id || a.module} className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${a.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {a.status}
                                    </span>
                                    {a.due_date && <span className="text-xs text-orange-600 font-medium">Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{a.module_title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-1">{a.module_description}</p>
                            </div>
                            <Link to={`/modules/${a.module}/assignment`} className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition-colors">
                                {a.status === 'completed' ? 'View Work' : 'Submit Task'}
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentAssignmentList;
