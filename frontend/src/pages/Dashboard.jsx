import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ManagerDashboard from './ManagerDashboard';
import LearnerDashboard from './LearnerDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'manager' || user?.role === 'admin') {
        return <ManagerDashboard />;
    }

    return <LearnerDashboard />;
};

export default Dashboard;
