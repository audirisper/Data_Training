import React, { useState, useEffect } from 'react';
import { DataStore } from './dataStore';

// View Imports
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import PortalLayout from './components/PortalLayout';
import DashboardView from './components/DashboardView';
import PatientsView from './components/PatientsView';
import DoctorsView from './components/DoctorsView';
import PrescriptionView from './components/PrescriptionView';
import AppointmentsView from './components/AppointmentsView';
import AnalyticsView from './components/AnalyticsView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import AdminView from './components/AdminView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Always open on the landing page — signed-in users get a "Go to Dashboard"
  // CTA there instead of being dropped straight into the portal.
  const [currentView, setCurrentView] = useState('landing');
  const [activeEditId, setActiveEditId] = useState<string | undefined>(undefined);

  // Sync auth state (but not the current view) on startup, so a persisted
  // session still lands on the landing page first.
  useEffect(() => {
    // Ensure auth state is loaded but always land on the public landing page
    // first. Users who are already signed in will see the landing page and
    // can choose 'Go to Dashboard' or sign in — or if they sign-in via the
    // Login form we immediately navigate to the dashboard.
    setIsLoggedIn(DataStore.getIsLoggedIn());
    setCurrentView('landing');
  }, []);

  const handleLoginSuccess = () => {
    DataStore.setIsLoggedIn(true);
    DataStore.setIsAdminSession(false);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleAdminLoginSuccess = () => {
    DataStore.setIsLoggedIn(true);
    DataStore.setIsAdminSession(true);
    setIsLoggedIn(true);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    DataStore.setIsLoggedIn(false);
    DataStore.setIsAdminSession(false);
    setIsLoggedIn(false);
    setCurrentView('landing');
    setActiveEditId(undefined);
  };

  const handleNavigate = (view: string, editId?: string) => {
    setCurrentView(view);
    setActiveEditId(editId);
  };

  // The landing page is the true "home" — reachable at any time (even while
  // signed in, via the portal's Back to Home button) without ending the session.
  if (currentView === 'landing') {
    return (
      <LandingPage
        onNavigate={(v) => handleNavigate(v)}
        isLoggedIn={isLoggedIn}
        isAdminSession={DataStore.getIsAdminSession()}
      />
    );
  }

  // Render Authentication Flow
  if (!isLoggedIn) {
    switch (currentView) {
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigate={(v) => handleNavigate(v)}
          />
        );
      case 'admin-login':
        return (
          <AdminLogin
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onNavigate={(v) => handleNavigate(v)}
          />
        );
      case 'register':
        return <SignUp onNavigate={(v) => handleNavigate(v)} initialRole="doctor" />;
      case 'admin-register':
        return <SignUp onNavigate={(v) => handleNavigate(v)} initialRole="admin" />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={(v) => handleNavigate(v)} />;
      default:
        return <LandingPage onNavigate={(v) => handleNavigate(v)} isLoggedIn={false} isAdminSession={false} />;
    }
  }

  // Render Portal Shell Flow
  return (
    <PortalLayout
      currentView={currentView}
      onNavigate={(v) => handleNavigate(v)}
      onLogout={handleLogout}
    >
      {(() => {
        switch (currentView) {
          case 'patients':
            return <PatientsView />;
          case 'doctors':
            return <DoctorsView />;
          case 'prescriptions':
            return (
              <PrescriptionView
                editId={activeEditId}
                onNavigate={(v) => handleNavigate(v)}
              />
            );
          case 'appointments':
            return <AppointmentsView />;
          case 'analytics':
            return <AnalyticsView />;
          case 'notifications':
            return <NotificationsView onNavigate={(v) => handleNavigate(v)} />;
          case 'settings':
            return <SettingsView />;
          case 'admin':
            return <AdminView onNavigate={(v) => handleNavigate(v)} />;
          case 'dashboard':
          default:
            return <DashboardView onNavigate={(v, editId) => handleNavigate(v, editId)} />;
        }
      })()}
    </PortalLayout>
  );
}
