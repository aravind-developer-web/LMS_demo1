import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ManagerDashboard from './ManagerDashboard';
import LearnerDashboard from './LearnerDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    // Debug logging
    console.log('🔍 Dashboard - User Object:', user);
    console.log('🔍 Dashboard - User Role:', user?.role);
    console.log('🔍 Dashboard - Is Manager?', user?.role === 'manager' || user?.role === 'admin');

    if (user?.role === 'manager' || user?.role === 'admin') {
        console.log('✅ Rendering Manager Dashboard');
        return <ManagerDashboard />;
    }

    console.log('✅ Rendering Learner Dashboard');
    return <LearnerDashboard />;
};

export default Dashboard;
