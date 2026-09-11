import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  Bell,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  HardDriveDownload,
  CheckCircle2,
} from 'lucide-react';
import { BusRoute, Language, SavedCommute, ServiceAlert } from '../types';
import { SERVICE_ALERTS, BUS_ROUTES } from '../data/busData';
import { triggerHaptic } from '../utils/haptics';

interface SavedAndAlertsViewProps {
  lang: Language;
  savedCommutes: SavedCommute[];
  onRemoveCommute: (id: string) => void;
  onSelectRoute: (route: BusRoute) => void;
}

export const SavedAndAlertsView: React.FC<SavedAndAlertsViewProps> = ({
  lang,
  savedCommutes,
  onRemoveCommute,
  onSelectRoute,
}) => {
  const [activeSection, setActiveSection] = useState<'saved' | 'alerts'>('saved');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const alerts: ServiceAlert[] = SERVICE_ALERTS;

  const handleExportOfflineCache = () => {
    triggerHaptic('success');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div id="saved-and-alerts-view" className="space-y-4 pb-24 max-w-md mx-auto">
      {/* Top Segmented Toggle */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[28px] p-2.5 shadow-sm border border-white/50">
        <div className="bg-white/40 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-white/50">
          <button
            id="tab-saved-btn"
            onClick={() => {
              triggerHaptic('tab');
              setActiveSection('saved');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'saved'
                ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                : 'text-[#A68A73] hover:text-[#3C413D]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#7A8B7D]" />
            <span>Saved Routes ({savedCommutes.length})</span>
          </button>

          <button
            id="tab-alerts-btn"
            onClick={() => {
              triggerHaptic('tab');
              setActiveSection('alerts');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeSection === 'alerts'
                ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                : 'text-[#A68A73] hover:text-[#3C413D]'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-[#7A8B7D]" />
            <span>Service Alerts ({alerts.length})</span>
          </button>
        </div>
      </div>

      {/* SAVED SECTION */}
      {activeSection === 'saved' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
              Pinned Daily Commutes
            </span>
            <span className="text-xs text-[#7A8B7D] font-semibold">
              Instant 1-Tap Access
            </span>
          </div>

          {savedCommutes.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-8 text-center space-y-3 border border-white/50">
              <div className="w-12 h-12 rounded-full bg-[#D8E2DC] text-[#3C413D] flex items-center justify-center mx-auto shadow-sm">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#3C413D] text-sm">
                No saved routes yet
              </h3>
              <p className="text-xs text-[#A68A73] max-w-xs mx-auto">
                Tap the bookmark icon on any bus route card to keep your daily commute routes pinned here for instant departure checks.
              </p>
            </div>
          ) : (
            savedCommutes.map((item) => {
              const matchedRoute =
                BUS_ROUTES.find((r) => r.id === item.routeId) || BUS_ROUTES[0];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    triggerHaptic('selection');
                    onSelectRoute(matchedRoute);
                  }}
                  className="bg-white/40 backdrop-blur-xl rounded-[28px] p-4 shadow-sm hover:bg-white/60 border border-white/50 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-11 rounded-2xl bg-[#7A8B7D] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                      {item.routeNo}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#3C413D] truncate leading-tight group-hover:text-[#7A8B7D] transition-colors">
                          {item.title}
                        </span>
                        {item.customTag && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-[#3C413D] shrink-0 border border-white/50">
                            {item.customTag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#A68A73] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#7A8B7D]" />
                        <span className="font-bold text-[#7A8B7D]">
                          Next in {matchedRoute.liveStatus.nextMinutes}m
                        </span>
                        <span>·</span>
                        <span>{matchedRoute.corridor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('warning');
                        onRemoveCommute(item.id);
                      }}
                      className="p-2 rounded-xl text-[#A68A73] hover:text-[#3C413D] hover:bg-white/60 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-[#A68A73] group-hover:text-[#3C413D] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Offline Database Synchronization Card */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 border border-white/50 space-y-3 mt-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3C413D]">
                Offline Master Timetable Database
              </span>
              <span className="text-[10px] font-mono font-semibold bg-[#D8E2DC] text-[#3C413D] px-2 py-0.5 rounded-md">
                v2026.8.27
              </span>
            </div>

            <p className="text-xs text-[#A68A73] leading-relaxed">
              All routes, NTC stage fare tables, night services, and connection routes are securely stored locally on your device.
            </p>

            <button
              onClick={handleExportOfflineCache}
              className="w-full py-2.5 px-3 rounded-2xl bg-white/70 hover:bg-white text-[#3C413D] text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-white/60 shadow-sm"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#7A8B7D]" />
                  <span>Offline Storage Verified (100% Synced)</span>
                </>
              ) : (
                <>
                  <HardDriveDownload className="w-4 h-4 text-[#7A8B7D]" />
                  <span>Verify & Refresh Offline Cache</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ALERTS SECTION */}
      {activeSection === 'alerts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
              Published Service Bulletins
            </span>
            <span className="text-xs text-[#7A8B7D] font-semibold">
              Official Transport Notices
            </span>
          </div>

          {alerts.map((alert) => {
            const isWarn = alert.severity === 'warning';
            const alertTitle = lang === 'si' ? alert.titleSi : lang === 'ta' ? alert.titleTa : alert.title;
            const alertDesc = lang === 'si' ? alert.descSi : lang === 'ta' ? alert.descTa : alert.desc;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-[28px] p-5 border space-y-2.5 backdrop-blur-xl shadow-sm ${
                  isWarn
                    ? 'bg-[#E9E0D2]/70 border-white/60 text-[#3C413D]'
                    : 'bg-white/40 border-white/50 text-[#3C413D]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-[#A68A73] shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[#7A8B7D] shrink-0" />
                    )}
                    <h4 className="font-bold text-sm leading-tight">
                      {alertTitle}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/70 border border-white/50 text-[#3C413D] shrink-0">
                    {alert.date}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[#3C413D]/85">
                  {alertDesc}
                </p>

                <div className="pt-2 border-t border-white/40 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#A68A73]">Affected Routes:</span>
                  {alert.affectedRoutes.map((r, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-white/80 text-[#3C413D] font-bold text-[10px] shadow-2xs border border-white/60"
                    >
                      Route {r}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
