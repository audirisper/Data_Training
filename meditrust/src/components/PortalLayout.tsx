import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Pill,
  LayoutDashboard,
  Users,
  UserRound,
  FileText,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Home
} from 'lucide-react';
import { DataStore } from '../dataStore';

interface PortalLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function IdentityAvatar({ name, sizePx = 40 }: { name: string; sizePx?: number }) {
  return (
    <div
      className="rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shrink-0 select-none text-sm"
      style={{ width: sizePx, height: sizePx }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function PortalLayout({ currentView, onNavigate, onLogout, children }: PortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = DataStore.getNotifications();
  const unreadCount = notifications.filter(n => n.unread).length;

  const isAdmin = DataStore.getIsAdminSession();
  const currentDoctor = DataStore.getCurrentDoctor();
  const currentAdmin = DataStore.getCurrentAdmin();
  const displayName = isAdmin ? (currentAdmin?.fullName || 'System Administrator') : (currentDoctor?.fullName || 'Your Profile');
  const displayRole = isAdmin ? 'Admin Portal' : (currentDoctor?.specialty || 'Complete your profile');

  const menuItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { view: 'patients', label: 'Patients', icon: <Users className="w-5 h-5" /> },
    { view: 'doctors', label: 'Doctors', icon: <UserRound className="w-5 h-5" /> },
    { view: 'prescriptions', label: 'Prescriptions', icon: <FileText className="w-5 h-5" /> },
    { view: 'appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
    { view: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { view: 'admin', label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  const navigate = (view: string) => {
    onNavigate(view);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-page flex font-sans text-heading antialiased">
      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-heading/40 z-30 md:hidden"
        />
      )}

      {/* Persistent Sidebar (fixed off-canvas drawer on mobile, static column on desktop) */}
      <aside
        className={`${collapsed ? 'md:w-20' : 'md:w-64'} w-64 shrink-0 bg-card border-r border-line min-h-screen flex flex-col justify-between transition-all duration-300 fixed md:static inset-y-0 left-0 z-40 transform shadow-[8px_0_32px_-16px_rgba(44,49,56,0.10)] ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-line">
            <div className="flex items-center gap-3 overflow-hidden select-none">
              <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0 shadow-md shadow-heading/20 animate-glow-pulse">
                <Pill className="w-5 h-5" />
              </div>
              {!collapsed && (
                <span className="font-extrabold text-base tracking-tight text-heading whitespace-nowrap">
                  MediTrust <span className="text-secondary">AI</span>
                </span>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileNavOpen(false)}
              className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body transition-colors md:hidden"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body hover:text-heading transition-colors hidden md:block"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <motion.button
                  key={item.view}
                  onClick={() => navigate(item.view)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full flex items-center gap-4 px-4 py-3.5 rounded-[24px] font-semibold text-sm transition-colors ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-body hover:bg-page hover:text-heading'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/15"
                    />
                  )}
                  <span className={`relative ${isActive ? 'text-primary' : 'text-body/60'}`}>{item.icon}</span>
                  {!collapsed && <span className="relative whitespace-nowrap">{item.label}</span>}
                </motion.button>
              );
            })}

            <div className="border-t border-line my-4"></div>

            {/* Notifications tab with counter */}
            <motion.button
              onClick={() => navigate('notifications')}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center justify-between px-4 py-3.5 rounded-[24px] font-semibold text-sm transition-colors ${
                currentView === 'notifications'
                  ? 'text-primary font-bold'
                  : 'text-body hover:bg-page hover:text-heading'
              }`}
            >
              {currentView === 'notifications' && (
                <motion.span
                  layoutId="nav-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/15"
                />
              )}
              <div className="relative flex items-center gap-4">
                <span className={`${currentView === 'notifications' ? 'text-primary' : 'text-body/60'}`}>
                  <Bell className="w-5 h-5" />
                </span>
                {!collapsed && <span className="whitespace-nowrap">Notifications</span>}
              </div>
              {!collapsed && unreadCount > 0 && (
                <span className="relative bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Settings Link */}
            <motion.button
              onClick={() => navigate('settings')}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center gap-4 px-4 py-3.5 rounded-[24px] font-semibold text-sm transition-colors ${
                currentView === 'settings'
                  ? 'text-primary font-bold'
                  : 'text-body hover:bg-page hover:text-heading'
              }`}
            >
              {currentView === 'settings' && (
                <motion.span
                  layoutId="nav-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-primary/12 to-secondary/12 border border-primary/15"
                />
              )}
              <span className={`relative ${currentView === 'settings' ? 'text-primary' : 'text-body/60'}`}>
                <Settings className="w-5 h-5" />
              </span>
              {!collapsed && <span className="relative whitespace-nowrap">Settings</span>}
            </motion.button>
          </nav>
        </div>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-line">
          <div className="flex items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-3 min-w-0">
              <IdentityAvatar name={displayName} />
              {!collapsed && (
                <div className="text-left leading-none min-w-0">
                  <div className="text-sm font-bold text-heading truncate">{displayName}</div>
                  <div className="text-[10px] font-semibold text-body/60 mt-1 uppercase tracking-wider truncate">
                    {displayRole}
                  </div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={onLogout}
                className="p-2 rounded-[20px] text-body/60 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Sign Out"
                id="btn-sidebar-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 min-h-screen flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-card/80 backdrop-blur-xl border-b border-line flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 shrink-0 sticky top-0 z-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2.5 rounded-[20px] border border-line text-body hover:text-primary hover:bg-page transition-all shrink-0 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Back to Home — returns to the landing page without ending the session */}
          <motion.button
            onClick={() => onNavigate('landing')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-[20px] border border-line text-body hover:text-primary hover:border-primary/40 hover:bg-page transition-colors shrink-0 font-semibold text-sm"
            id="btn-back-to-home"
          >
            <Home className="w-4 h-4" /> Back to Home
          </motion.button>
          <motion.button
            onClick={() => onNavigate('landing')}
            whileTap={{ scale: 0.94 }}
            className="sm:hidden p-2.5 rounded-[20px] border border-line text-body hover:text-primary hover:bg-page transition-colors shrink-0"
            aria-label="Back to Home"
          >
            <Home className="w-4 h-4" />
          </motion.button>

          {/* Search bar */}
          <div className="bg-page border border-line px-4 py-2.5 rounded-[24px] flex items-center gap-3 flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <Search className="w-4 h-4 text-body/60 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, doctors, or prescriptions..."
              className="bg-transparent text-sm w-full min-w-0 focus:outline-none placeholder-body/50"
            />
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <motion.button
              onClick={() => navigate('notifications')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              className="p-2.5 rounded-[20px] border border-line text-body hover:text-primary hover:bg-page transition-colors relative shrink-0"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            </motion.button>

            {/* Profile Dropdown Indicator */}
            <div className="flex items-center gap-3 border-l border-line pl-3 sm:pl-6">
              <IdentityAvatar name={displayName} />
              <div className="text-left hidden sm:block leading-none">
                <div className="text-sm font-bold text-heading">{displayName}</div>
                <div className="text-[10px] font-semibold text-body/60 mt-1 uppercase tracking-wider">
                  {displayRole}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* View Component Render Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-page">
          {children}
        </main>
      </div>
    </div>
  );
}
