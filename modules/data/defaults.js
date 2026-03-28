// Default seed data — used when no persisted state is found on boot.

export const DEFAULTS = {
  deals: [
    { id: 'd1', name: 'QuantumVault Corp', stage: 'Negotiation', value: 4200000, probability: 72, owner: 'ARIA-7', dueDate: '2026-04-15', sector: 'FinTech' },
    { id: 'd2', name: 'NeuraSynth Labs', stage: 'Proposal', value: 1850000, probability: 45, owner: 'ZETA-3', dueDate: '2026-05-02', sector: 'BioTech' },
    { id: 'd3', name: 'Helix Dynamics', stage: 'Closed Won', value: 6750000, probability: 100, owner: 'ARIA-7', dueDate: '2026-03-01', sector: 'Defense' },
    { id: 'd4', name: 'OmegaStream Media', stage: 'Discovery', value: 920000, probability: 28, owner: 'KAPPA-9', dueDate: '2026-06-20', sector: 'Media' },
    { id: 'd5', name: 'CryptoNexus AG', stage: 'Negotiation', value: 3100000, probability: 61, owner: 'ZETA-3', dueDate: '2026-04-28', sector: 'Crypto' },
  ],
  contracts: [
    { id: 'c1', client: 'Helix Dynamics', type: 'Master Service Agreement', value: 6750000, status: 'Active', signed: '2026-03-01', expires: '2027-03-01', riskScore: 12 },
    { id: 'c2', client: 'QuantumVault Corp', type: 'NDA + PoC', value: 0, status: 'Pending', signed: null, expires: '2026-04-30', riskScore: 34 },
    { id: 'c3', client: 'AeroGrid Systems', type: 'SaaS Subscription', value: 480000, status: 'Active', signed: '2025-11-15', expires: '2026-11-15', riskScore: 8 },
    { id: 'c4', client: 'NovaTerra Inc', type: 'Consulting Retainer', value: 240000, status: 'Expiring', signed: '2025-04-01', expires: '2026-04-01', riskScore: 55 },
  ],
  tasks: [
    { id: 't1', title: 'Finalize QuantumVault term sheet', priority: 'Critical', status: 'In Progress', assignee: 'ARIA-7', dueDate: '2026-04-10', tags: ['deal', 'legal'] },
    { id: 't2', title: 'Deploy NeuraSynth sandbox environment', priority: 'High', status: 'Blocked', assignee: 'ZETA-3', dueDate: '2026-04-05', tags: ['tech', 'demo'] },
    { id: 't3', title: 'Threat model review for CryptoNexus API', priority: 'High', status: 'Open', assignee: 'KAPPA-9', dueDate: '2026-04-12', tags: ['security'] },
    { id: 't4', title: 'Q2 pipeline forecast presentation', priority: 'Medium', status: 'In Progress', assignee: 'ARIA-7', dueDate: '2026-04-18', tags: ['strategy'] },
    { id: 't5', title: 'Renew NovaTerra retainer agreement', priority: 'Critical', status: 'Open', assignee: 'ZETA-3', dueDate: '2026-04-01', tags: ['legal', 'renewal'] },
    { id: 't6', title: 'OmegaStream market analysis', priority: 'Low', status: 'Open', assignee: 'KAPPA-9', dueDate: '2026-05-15', tags: ['research'] },
  ],
  envData: {
    threatLevel: 'ELEVATED',
    systemIntegrity: 97.4,
    quantumCoherence: 84.2,
    activeNodes: 1847,
    anomalyScore: 23,
    networkLatency: 12,
    dataIngestionRate: 4.7,
    regions: ['NA-EAST', 'EU-WEST', 'APAC-SOUTH'],
  },
  activityLog: [
    { id: 'a1', ts: Date.now() - 5 * 60000,  type: 'deal',     message: 'Helix Dynamics deal marked CLOSED WON — $6.75M',          severity: 'success' },
    { id: 'a2', ts: Date.now() - 12 * 60000, type: 'threat',   message: 'Anomaly spike detected on APAC-SOUTH node cluster',        severity: 'warn' },
    { id: 'a3', ts: Date.now() - 28 * 60000, type: 'system',   message: 'Quantum coherence recalibrated to 84.2%',                  severity: 'info' },
    { id: 'a4', ts: Date.now() - 45 * 60000, type: 'contract', message: 'NovaTerra contract flagged: 34 days to expiry',            severity: 'warn' },
    { id: 'a5', ts: Date.now() - 71 * 60000, type: 'ai',       message: 'ARIA-7 completed pipeline analysis — 5 insights generated', severity: 'info' },
  ],
  settings: {
    voiceEnabled: false, // off by default to avoid jarring first load
    selectedTab: 'dashboard',
    theme: 'quantum-dark',
    animationSpeed: 1.0,
  },
};
