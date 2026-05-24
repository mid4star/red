import { Timestamp } from 'firebase/firestore';

export type UserRole = 'ADMIN' | 'RANGER' | 'RESEARCHER' | 'MANAGER';

export interface User {
  id?: string; // Firebase Auth UID
  employeeId: string;
  name: string;
  nameAr: string;
  role: UserRole;
  reserveId: string; // The assigned reserve ID
  reserve?: string;
  reserveAr?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  certifications: string[];
  allowedSections?: string[];
  createdAt: Timestamp;
}

export interface Patrol {
  id?: string;
  code: string;
  zone: string;
  zoneAr: string;
  status: 'ACTIVE' | 'COMPLETED' | 'STANDBY' | 'EMERGENCY';
  officer: string; // User ID or Name
  vessel: string; // Vessel ID or Name
  startTime: Timestamp;
  endTime?: Timestamp;
  routeCoordinates: { lat: number; lng: number }[];
  incidentsReported: number;
}

export interface Observation {
  id?: string;
  code: string;
  type: 'CORAL' | 'FAUNA' | 'THREAT' | 'WEATHER';
  location: string;
  locationAr: string;
  observerId: string;
  observerName: string;
  date: Timestamp;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  score: number; // Vulnerability or Quality score
  indicators: { name: string; nameAr: string; value: number }[];
}

export interface Violation {
  id?: string;
  code: string;
  type: 'POACHING' | 'POLLUTION' | 'UNAUTHORIZED_ENTRY' | 'CORAL_DAMAGE';
  typeAr: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  location: string;
  locationAr: string;
  date: Timestamp;
  reportedBy: string; // User ID
  fineAmount?: number;
  description: string;
}

export interface FleetVessel {
  id?: string;
  code: string; // e.g. V-102
  name: string;
  nameAr: string;
  type: 'PATROL' | 'RESEARCH' | 'RESCUE';
  status: 'ACTIVE' | 'MAINTENANCE' | 'MISSION';
  fuelLevel: number;
  engineHours: number;
  healthScore: number;
  lastServiceDate: Timestamp;
}

export interface DataZone {
  id?: string;
  code: string; // Z-01
  name: string;
  nameAr: string;
  type: 'WATER_QUALITY' | 'REEF_HEALTH' | 'METEOROLOGY' | 'BIODIVERSITY';
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL';
  reportCount: number;
  lastEntry: Timestamp;
  qualityScore: number;
}

// ─── MEDIA CENTER SCHEMAS ────────────────────────────────────────────────────

export interface NewsArticle {
  id?: string;
  title: string;
  titleAr: string;
  content: string; // HTML from Rich Text Editor
  contentAr: string;
  category: 'NEWS' | 'EVENT' | 'REPORT' | 'REGULATION';
  date: Timestamp;
  authorId: string;
  authorName: string;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface ReserveProfile {
  id?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  location: string;
  locationAr: string;
  area: number; // in sq km
  establishedYear: number;
  imageUrl?: string;
  status: 'OPEN' | 'CLOSED' | 'RESTRICTED';
}

export interface OpenDataDocument {
  id?: string;
  title: string;
  titleAr: string;
  type: 'ACADEMIC' | 'REPORT' | 'DATASET' | 'GUIDELINE';
  fileUrl: string;
  fileSize: number; // in bytes
  uploadDate: Timestamp;
  uploaderId: string;
  status: 'PUBLIC' | 'ARCHIVED';
}

export interface VisitorGuideSection {
  id?: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  order: number;
  links?: { n: string; nAr: string }[];
}

export interface HomepageSettings {
  id?: string; // singleton, e.g., 'home-config'
  heroTitle: string;
  heroTitleAr: string;
  heroSubtitle: string;
  heroSubtitleAr: string;
  announcements: { id: string; text: string; textAr: string; link?: string; active: boolean }[];
}

export interface MarineSpecies {
  id?: string;
  name: string;
  nameAr: string;
  type: string;
  typeAr?: string;
  imageUrl?: string;
  status: string;
  statusAr?: string;
  description?: string;
  descriptionAr?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface MapLocation {
  id?: string;
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  type: string;
  typeAr?: string;
  status: string;
  statusAr?: string;
  description?: string;
  descriptionAr?: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

