import { Navigate, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Layout from './components/Layout';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectsPage from './pages/ProjectsPage';
import HomePage from './pages/HomePage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import AllTasksPage from "./pages/AllTasksPage.jsx";
import TaskDetailPage from "./pages/TaskDetailPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import ProfilePage from './pages/ProfilePage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AllProjectsPage from './pages/AllProjectsPage.jsx';
import AdminRequestsPage from './pages/AdminRequestsPage.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { Notifications } from "@mantine/notifications";
import AdminRoute from './components/AdminRoute';

const PrivateRoute = ({ children }) => {
    const auth = useAuth();
    return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <AuthProvider>
            <MantineProvider>
                <Notifications />
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
                        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailsPage /></PrivateRoute>} />
                        <Route path="/all-projects" element={<PrivateRoute><AllProjectsPage /></PrivateRoute>} />
                        <Route path="/tasks" element={<PrivateRoute><AllTasksPage /></PrivateRoute>} />
                        <Route path="/tasks/:id" element={<PrivateRoute><TaskDetailPage /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/registration" element={<RegistrationPage />} />
                        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                        <Route path="/admin/requests" element={<AdminRoute><AdminRequestsPage /></AdminRoute>} />
                    </Route>
                </Routes>
            </MantineProvider>
        </AuthProvider>
    );
}