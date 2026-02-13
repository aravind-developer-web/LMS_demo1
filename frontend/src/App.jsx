import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MyNotes from './pages/MyNotes';
import AssignmentPage from './pages/AssignmentPage';
import ModulePlayer from './pages/ModulePlayer';
import QuizPage from './pages/QuizPage';
import LandingPage from './pages/LandingPage';
import StudentQuizList from './pages/StudentQuizList';
import StudentAssignmentList from './pages/StudentAssignmentList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'manager' || user?.role === 'admin') {
    return <ManagerDashboard />;
  }
  return <Dashboard />;
}

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

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/modules/:id" element={<ModulePlayer />} />
            <Route path="/modules/:id/quiz" element={<QuizPage />} />
            <Route path="/modules/:id/assignment" element={<AssignmentPage />} />
            <Route path="/my-notes" element={<MyNotes />} />
            <Route path="/quizzes" element={<StudentQuizList />} />
            <Route path="/assignments" element={<StudentAssignmentList />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
