import React, { useState } from 'react';
import { Bell, ShieldAlert, CheckCircle, Info, Trash2 } from 'lucide-react';
import { DataStore } from '../dataStore';
import { SystemNotification } from '../types';

interface NotificationsViewProps {
  onNavigate: (view: string) => void;
}

export default function NotificationsView({ onNavigate }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => DataStore.getNotifications());

  const handleMarkAllRead = () => {
    DataStore.markAllNotificationsRead();
    setNotifications(DataStore.getNotifications());
  };

  const handleDeleteNotif = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    DataStore.saveNotifications(updated);
    setNotifications(updated);
  };

  const handleActionClick = (view: string) => {
    if (view === 'prescriptions') {
      onNavigate('prescriptions');
    } else if (view === 'analytics') {
      onNavigate('analytics');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading">Notifications & Alerts</h1>
          <p className="text-sm text-body mt-1">Audit log of system telemetry, updates, and overrides.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2.5 rounded-[20px] border border-line hover:bg-page text-body text-xs font-bold inline-flex items-center gap-2 cursor-pointer bg-card w-fit"
        >
          Mark All As Read
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-card p-12 text-center text-body/60 font-bold rounded-[32px] border border-line/80">
            You have no notifications or alerts.
          </div>
        ) : (
          notifications.map((n) => {
            const isAlert = n.type === 'alert';
            const isSuccess = n.type === 'success';

            return (
              <div
                key={n.id}
                className={`p-6 rounded-[32px] border flex gap-4 items-start transition-all ${
                  n.unread
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-card border-line'
                }`}
              >
                {/* Icons */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isAlert
                      ? 'bg-red-50 text-red-600'
                      : isSuccess
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {isAlert ? <ShieldAlert className="w-5 h-5" /> : isSuccess ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-sm sm:text-base font-extrabold text-heading leading-tight">
                      {n.title}
                      {n.unread && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary" title="Unread"></span>
                      )}
                    </h3>
                    <span className="text-[10px] text-body/60 font-bold uppercase tracking-wider shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-body leading-relaxed font-semibold">{n.description}</p>

                  {/* Actions */}
                  {n.actionLabel && n.actionView && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleActionClick(n.actionView!)}
                        className={`px-4 py-2 rounded-[20px] text-xs font-bold transition-colors cursor-pointer ${
                          isAlert
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/10'
                            : 'bg-primary hover:bg-primary-hover text-white'
                        }`}
                      >
                        {n.actionLabel}
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteNotif(n.id)}
                  className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer shrink-0 mt-0.5"
                  title="Remove Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
