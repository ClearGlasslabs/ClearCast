// Pluggable AI intent engine.
// To add a new intent: push an entry into INTENT_REGISTRY before the 'default' fallback.
//
// Each intent:
//   name     — unique string identifier
//   patterns — array of RegExp tested against the raw query string
//   resolve  — (query, state) => IntentResponse
//
// IntentResponse: { type: 'text'|'kpi'|'alert'|'list', text: string, payload?: any }

export const INTENT_REGISTRY = [
  {
    name: 'pipeline',
    patterns: [/pipeline/i, /deals?/i, /revenue/i, /forecast/i, /closing/i],
    resolve(query, state) {
      const { deals } = state;
      const open = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
      const totalValue = open.reduce((s, d) => s + d.value, 0);
      const weightedValue = open.reduce((s, d) => s + d.value * d.probability / 100, 0);
      const closingSoon = open.filter(d => {
        const days = (new Date(d.dueDate) - Date.now()) / 86400000;
        return days >= 0 && days <= 30;
      });
      return {
        type: 'list',
        text: `Pipeline analysis: ${open.length} active deals, face value $${(totalValue / 1e6).toFixed(2)}M, weighted $${(weightedValue / 1e6).toFixed(2)}M. ${closingSoon.length} deal(s) closing within 30 days.`,
        payload: {
          kpis: [
            { label: 'Active Deals',    value: open.length },
            { label: 'Face Value',      value: `$${(totalValue / 1e6).toFixed(2)}M` },
            { label: 'Weighted Value',  value: `$${(weightedValue / 1e6).toFixed(2)}M` },
            { label: 'Closing ≤30 days', value: closingSoon.length },
          ],
          items: closingSoon.map(d => `${d.name} — ${d.stage} — $${(d.value / 1e6).toFixed(2)}M (${d.probability}% prob)`),
        },
      };
    },
  },

  {
    name: 'threats',
    patterns: [/threat/i, /anomal/i, /security/i, /risk/i, /attack/i],
    resolve(query, state) {
      const { envData, contracts } = state;
      const highRisk = contracts.filter(c => c.riskScore >= 50);
      return {
        type: 'alert',
        text: `Threat level: ${envData.threatLevel}. Anomaly score: ${envData.anomalyScore}/100. System integrity: ${envData.systemIntegrity}%. ${highRisk.length} contract(s) flagged high-risk.`,
        payload: {
          threatLevel: envData.threatLevel,
          anomalyScore: envData.anomalyScore,
          systemIntegrity: envData.systemIntegrity,
          highRiskContracts: highRisk.map(c => `${c.client} (risk: ${c.riskScore})`),
        },
      };
    },
  },

  {
    name: 'environment',
    patterns: [/environment/i, /system/i, /node/i, /network/i, /latency/i, /ingestion/i],
    resolve(query, state) {
      const e = state.envData;
      return {
        type: 'kpi',
        text: `System environment nominal. ${e.activeNodes.toLocaleString()} active nodes across ${e.regions.length} regions. Latency: ${e.networkLatency}ms. Ingestion: ${e.dataIngestionRate} GB/s. Quantum coherence: ${e.quantumCoherence}%.`,
        payload: {
          kpis: [
            { label: 'Active Nodes', value: e.activeNodes.toLocaleString() },
            { label: 'Regions',      value: e.regions.join(', ') },
            { label: 'Latency',      value: `${e.networkLatency}ms` },
            { label: 'Ingestion',    value: `${e.dataIngestionRate} GB/s` },
            { label: 'Coherence',    value: `${e.quantumCoherence}%` },
          ],
          items: [],
        },
      };
    },
  },

  {
    name: 'surveillance',
    patterns: [/surveillance/i, /monitor/i, /watch/i, /region/i, /geographic/i, /sensor/i],
    resolve(query, state) {
      const { envData } = state;
      const alerts = envData.anomalyScore > 30
        ? ['Elevated anomaly score — review APAC-SOUTH cluster']
        : [];
      return {
        type: 'list',
        text: `Surveillance grid active across ${envData.regions.length} zones: ${envData.regions.join(', ')}. ${alerts.length > 0 ? alerts[0] : 'All arrays nominal.'}`,
        payload: {
          kpis: [
            { label: 'Zones', value: envData.regions.length },
            { label: 'Status', value: alerts.length ? 'ALERT' : 'NOMINAL' },
          ],
          items: [...envData.regions.map(r => `${r} — ONLINE`), ...alerts],
        },
      };
    },
  },

  {
    name: 'tasks',
    patterns: [/tasks?/i, /overdue/i, /blocked/i, /assignee/i, /todo/i, /backlog/i],
    resolve(query, state) {
      const { tasks } = state;
      const overdue  = tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate) < new Date());
      const blocked  = tasks.filter(t => t.status === 'Blocked');
      const critical = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Done');
      return {
        type: 'list',
        text: `Task intelligence: ${tasks.length} total. ${overdue.length} overdue. ${blocked.length} blocked. ${critical.length} critical open item(s).`,
        payload: {
          kpis: [
            { label: 'Total',    value: tasks.length },
            { label: 'Overdue',  value: overdue.length },
            { label: 'Blocked',  value: blocked.length },
            { label: 'Critical', value: critical.length },
          ],
          // Deduplicate: show critical first, then remaining overdue
          items: [
            ...critical.map(t => `🔴 [CRITICAL] ${t.title} — ${t.assignee}`),
            ...overdue.filter(t => t.priority !== 'Critical').map(t => `⚠ [OVERDUE] ${t.title} — ${t.assignee}`),
          ],
        },
      };
    },
  },

  {
    name: 'contracts',
    patterns: [/contract/i, /agreement/i, /expir/i, /renew/i, /legal/i, /rfp/i],
    resolve(query, state) {
      const { contracts } = state;
      const expiring = contracts.filter(c => {
        if (!c.expires) return false;
        const days = (new Date(c.expires) - Date.now()) / 86400000;
        return days >= 0 && days <= 90;
      });
      const totalValue = contracts.reduce((s, c) => s + c.value, 0);
      return {
        type: 'list',
        text: `Contract intelligence: ${contracts.length} agreements, total value $${(totalValue / 1e6).toFixed(2)}M. ${expiring.length} expiring within 90 days.`,
        payload: {
          kpis: [
            { label: 'Agreements',     value: contracts.length },
            { label: 'Total Value',    value: `$${(totalValue / 1e6).toFixed(2)}M` },
            { label: 'Expiring <90d',  value: expiring.length },
          ],
          items: expiring.map(c => `${c.client} — ${c.type} — expires ${c.expires} (risk: ${c.riskScore})`),
        },
      };
    },
  },

  // Default fallback — always matches last
  {
    name: 'default',
    patterns: [/.*/],
    resolve(query, state) {
      return {
        type: 'text',
        text: `Query received. NEXUS OMEGA processed "${query}". No specific intent matched. Available: pipeline · threats · environment · surveillance · tasks · contracts.`,
        payload: null,
      };
    },
  },
];

/**
 * Resolve a natural-language query against the intent registry.
 * Returns the first matching intent's structured response.
 * @param {string} query
 * @param {object} state
 * @returns {{ intent: string, type: string, text: string, payload: any }}
 */
export function resolveQuery(query, state) {
  for (const intent of INTENT_REGISTRY) {
    if (intent.name === 'default') continue;
    if (intent.patterns.some(re => re.test(query))) {
      return { intent: intent.name, ...intent.resolve(query, state) };
    }
  }
  const fallback = INTENT_REGISTRY.find(i => i.name === 'default');
  return { intent: 'default', ...fallback.resolve(query, state) };
}
