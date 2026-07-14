import { Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './providers';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import PayrollPage from './pages/PayrollPage';
import DocumentsPage from './pages/DocumentsPage';
import ExpensesPage from './pages/ExpensesPage';
import PerformancePage from './pages/PerformancePage';
import ContributionsPage from './pages/ContributionsPage';
import TrainingPage from './pages/TrainingPage';
import RecruitmentPage from './pages/RecruitmentPage';
import RecognitionPage from './pages/RecognitionPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TeamPage from './pages/TeamPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CopilotPage from './pages/CopilotPage';
import OnboardingPage from './pages/OnboardingPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="h-full flex flex-col">
          {children}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/attendance" element={<AppLayout><AttendancePage /></AppLayout>} />
        <Route path="/leave" element={<AppLayout><LeavePage /></AppLayout>} />
        <Route path="/payroll" element={<AppLayout><PayrollPage /></AppLayout>} />
        <Route path="/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
        <Route path="/expenses" element={<AppLayout><ExpensesPage /></AppLayout>} />
        <Route path="/performance" element={<AppLayout><PerformancePage /></AppLayout>} />
        <Route path="/contributions" element={<AppLayout><ContributionsPage /></AppLayout>} />
        <Route path="/training" element={<AppLayout><TrainingPage /></AppLayout>} />
        <Route path="/recruitment" element={<AppLayout><RecruitmentPage /></AppLayout>} />
        <Route path="/recognition" element={<AppLayout><RecognitionPage /></AppLayout>} />
        <Route path="/announcements" element={<AppLayout><AnnouncementsPage /></AppLayout>} />
        <Route path="/team" element={<AppLayout><TeamPage /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
        <Route path="/copilot" element={<AppLayout><CopilotPage /></AppLayout>} />
        <Route path="/onboarding" element={<AppLayout><OnboardingPage /></AppLayout>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Providers>
  );
}
