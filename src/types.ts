export type Language = 'en' | 'si' | 'ta';

export type BusType = 'NORMAL' | 'SEMI-LUX' | 'AC' | 'EXPRESSWAY' | 'SLTB';

export type CrowdStatus = 'Seats' | 'Busy' | 'Standing' | 'Full' | 'Bookable';

export interface RouteStop {
  name: string;
  nameSi?: string;
  nameTa?: string;
  fare: number | string; // e.g. 50 or "—"
  min: number;
  connects?: string[];
  isStageBoundary?: boolean;
}

export interface StageFareItem {
  stage: number;
  to: string;
  normal: number;
  semi: number;
  ac: number;
}

export interface BusRoute {
  id: string;
  number: string;
  name: string;
  nameSi: string;
  nameTa: string;
  type: BusType;
  corridor: string;
  origin: string;
  destination: string;
  via: string;
  distanceKm: number;
  peakHeadway: string;
  offPeakHeadway: string;
  firstBus: string;
  lastBus: string;
  nightService: string;
  isNightRoute?: boolean;
  stopsOutbound: RouteStop[];
  stopsInbound: RouteStop[];
  departuresOutbound: string[];
  departuresInbound: string[];
  stageFares: StageFareItem[];
  liveStatus: {
    nextMinutes: number;
    crowd: CrowdStatus;
    speedKmh: number;
    currentNearStop: string;
    hasGps: boolean;
  };
  notes?: string;
}

export interface TripStep {
  type: 'BUS' | 'WALK' | 'TRANSFER';
  routeNo?: string;
  routeType?: BusType;
  title: string;
  meta: string;
  timeMin: number;
  fare?: number;
  stopsCount?: number;
}

export interface TripPlan {
  id: string;
  origin: string;
  destination: string;
  totalTimeMin: number;
  totalFare: number;
  transferCount: number;
  badge: string;
  badgeType: 'fast' | 'direct' | 'budget' | 'express';
  steps: TripStep[];
}

export interface SavedCommute {
  id: string;
  title: string;
  customTag: string;
  routeId: string;
  routeNo: string;
  origin: string;
  destination: string;
  direction: 'out' | 'in';
  targetArrivalStop?: string;
  createdAt: number;
}

export interface ServiceAlert {
  id: string;
  title: string;
  titleSi: string;
  titleTa: string;
  desc: string;
  descSi: string;
  descTa: string;
  date: string;
  severity: 'info' | 'warning' | 'urgent';
  affectedRoutes: string[];
}

export interface StopBoardItem {
  id: string;
  routeNo: string;
  routeId: string;
  dest: string;
  destSi: string;
  destTa: string;
  type: BusType;
  dueTime: string;
  dueMinutes: number;
  crowd: CrowdStatus;
  platform?: string;
}

export interface HapticConfig {
  vibrationEnabled: boolean;
  audioTickEnabled: boolean;
  audioVolume: number;
  intensity: 'soft' | 'crisp' | 'heavy';
}

export interface FocusState {
  active: boolean;
  totalDurationSeconds: number;
  remainingSeconds: number;
  soundscape: 'none' | 'train' | 'rain' | 'binaural' | 'zen';
  soundPlaying: boolean;
  targetStopName: string;
  wakeAlarmTriggered: boolean;
}
