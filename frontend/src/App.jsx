import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MyNotes from './pages/MyNotes';
import TeamAnalytics from './pages/manager/TeamAnalytics';
import ManagerIntelligenceDashboard from './pages/manager/ManagerIntelligenceDashboard';
import AssignmentPage from './pages/AssignmentPage';
import ModulePlayer from './pages/ModulePlayer';
import BroadcastPlayer from './pages/BroadcastPlayer';
import QuizPage from './pages/QuizPage';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminModuleList from './pages/admin/AdminModuleList';
import AdminModuleCreate from './pages/admin/AdminModuleCreate';
import AdminModuleEdit from './pages/admin/AdminModuleEdit';
import AdminAssignments from './pages/admin/AdminAssignments';
import StudentQuizList from './pages/StudentQuizList';
import StudentAssignmentList from './pages/StudentAssignmentList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';

// Role-based Dashboard Wrapper
function DashboardRouter({ type }) {
  const { user } = useAuth();

  // If specific view requested, show it if authorized
  if (type === 'analytics' && (user?.role === 'manager' || user?.role === 'admin')) {
    return <ManagerDashboard />;
  }
  if (type === 'learning') {
    return <Dashboard />;
  }

  // Default behavior: Redirect based on role
  if (user?.role === 'manager' || user?.role === 'admin') {
    return <ManagerDashboard />;
  }

  return <Dashboard />;
}

// Redirect logged-in users away from auth pages
function AuthGuard({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
          <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/dashboard/learning" element={<DashboardRouter type="learning" />} />
            <Route path="/dashboard/analytics" element={<DashboardRouter type="analytics" />} />
            <Route path="/dashboard/intelligence" element={<ManagerIntelligenceDashboard />} />
            <Route path="/modules/:id" element={<ModulePlayer />} />
            <Route path="/broadcast/:id" element={<BroadcastPlayer />} />
            <Route path="/modules/:id/quiz" element={<QuizPage />} />
            <Route path="/modules/:id/assignment" element={<AssignmentPage />} />
            <Route path="/my-notes" element={<MyNotes />} />
            <Route path="/quizzes" element={<StudentQuizList />} />
            <Route path="/assignments" element={<StudentAssignmentList />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/modules" element={<AdminModuleList />} />
            <Route path="/admin/modules/create" element={<AdminModuleCreate />} />
            <Route path="/admin/modules/:id/edit" element={<AdminModuleEdit />} />
            <Route path="/admin/assignments" element={<AdminAssignments />} />

            {/* Add more routes here */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
