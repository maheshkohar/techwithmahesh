import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { ServicesPage } from './components/ServicesPage';
import { ServiceHistoryPage } from './components/ServiceHistoryPage';
import { MilestonesPage } from './components/MilestonesPage';
import { VendorsPage } from './components/VendorsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SettingsPage } from './components/SettingsPage';
import { Spinner } from './components/ui';

function AppRoutes() {
  const { path, navigate } = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Public routes
  if (path === '/' || path === '') {
    return <LandingPage />;
  }
  if (path === '/login') {
    if (user) { navigate('/dashboard'); return null; }
    return <AuthPage mode="login" />;
  }
  if (path === '/register') {
    if (user) { navigate('/dashboard'); return null; }
    return <AuthPage mode="register" />;
  }

  // Protected routes
  if (!user) {
    navigate('/login');
    return null;
  }

  // Dashboard routes
  if (path === '/dashboard') {
    return <DashboardLayout title="Dashboard"><DashboardOverview /></DashboardLayout>;
  }
  if (path === '/projects') {
    return <DashboardLayout title="Projects"><ProjectsPage /></DashboardLayout>;
  }
  if (path.startsWith('/projects/')) {
    const projectId = path.split('/')[2];
    return <DashboardLayout title="Project Details"><ProjectDetailPage projectId={projectId} /></DashboardLayout>;
  }
  if (path === '/services') {
    return <DashboardLayout title="Services"><ServicesPage /></DashboardLayout>;
  }
  if (path === '/service-history') {
    return <DashboardLayout title="Service History"><ServiceHistoryPage /></DashboardLayout>;
  }
  if (path === '/milestones') {
    return <DashboardLayout title="Milestones"><MilestonesPage /></DashboardLayout>;
  }
  if (path === '/vendors') {
    return <DashboardLayout title="Vendors"><VendorsPage /></DashboardLayout>;
  }
  if (path === '/notifications') {
    return <DashboardLayout title="Notifications"><NotificationsPage /></DashboardLayout>;
  }
  if (path === '/settings') {
    return <DashboardLayout title="Settings"><SettingsPage /></DashboardLayout>;
  }

  // Fallback
  navigate('/dashboard');
  return null;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </RouterProvider>
  );
}
