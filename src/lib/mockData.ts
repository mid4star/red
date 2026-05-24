// Mock data for the Red Sea system to ensure the UI works without a live DB
export const MOCK_DASHBOARD_DATA = {
  stats: {
    patrolsThisMonth: 42,
    violationsActive: 12,
    monitoringSurveys: 8,
    fuelConsumption: '2,450L',
  },
  alerts: [
    { id: 1, type: 'VIOLATION', severity: 'HIGH', message: 'Illegal fishing vessel detected near Northern Islands', time: '10m ago' },
    { id: 2, type: 'FLEET', severity: 'LOW', message: 'Vessel Amwaj 4 requires routine engine service', time: '1h ago' },
  ],
  vessels: [
    { name: 'Amwaj 1', status: 'ACTIVE', type: 'Patrol', lastLocation: 'Gebel Elba' },
    { name: 'Amwaj 2', status: 'DOCK', type: 'Research', lastLocation: 'Wadi El Gemal' },
    { name: 'Sarkha', status: 'ACTIVE', type: 'Fast Response', lastLocation: 'Northern Islands' },
  ]
};

export const MOCK_RESERVES = [
  { id: 1, name: 'Northern Islands', coordinates: [27.7128, 34.2131], status: 'OPEN' },
  { id: 2, name: 'Wadi El Gemal', coordinates: [24.4167, 35.0833], status: 'RESTRICTED' },
  { id: 3, name: 'Gebel Elba', coordinates: [22.1833, 36.3333], status: 'OPEN' },
  { id: 4, name: 'Coral Reef Protectorate', coordinates: [27.2, 33.8], status: 'OPEN' }
];

export const MOCK_STAFF = [
  { id: 'ST-001', name: 'Ahmed Ali', role: 'ADMIN', reserve: 'Northern Islands', status: 'ACTIVE' },
  { id: 'ST-002', name: 'Sarah Hassan', role: 'MONITOR', reserve: 'Wadi El Gemal', status: 'ON_LEAVE' },
  { id: 'ST-003', name: 'Mohamed Said', role: 'RESEARCHER', reserve: 'Gebel Elba', status: 'ACTIVE' },
];

export const MOCK_VIOLATIONS = [
  { id: 'V-2026-001', vessel: 'Al-Jareh', type: 'Illegal Fishing', severity: 'HIGH', status: 'NEW', location: 'Northern Islands' },
  { id: 'V-2026-002', vessel: 'Nemo 4', type: 'Speeding', severity: 'MEDIUM', status: 'IN_PROGRESS', location: 'Gebel Elba' },
  { id: 'V-2026-003', vessel: 'Unknown', type: 'Trash Dumping', severity: 'LOW', status: 'RESOLVED', location: 'Wadi El Gemal' },
];
