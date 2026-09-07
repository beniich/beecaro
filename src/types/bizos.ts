export type NavigationPage = 
  | 'home'
  | 'features'
  | 'solutions'
  | 'solutions-vitalai'
  | 'solutions-inboxai'
  | 'solutions-meetai'
  | 'solutions-callcopilot'
  | 'solutions-exitready'
  | 'solutions-more'
  | 'beecarbonat-pub'
  | 'integrations'
  | 'pricing'
  | 'customers'
  | 'workspace'
  | 'spaceflow'
  | 'mission-control'
  | 'god-mode'
  | 'threat-matrix'
  | 'sustainability-matrix'
  | 'neural-engine'
  | 'energy-nexus'
  | 'fleet-command'
  | 'database-monitor'
  | 'predictive-core'
  | 'traffic-hub'
  | 'cloud-pulse'
  | 'audit-vault'
  | 'privacy'
  | 'terms'
  | 'security'
  | 'lighting'
  | 'water'
  | 'waste'
  | 'assets'
  | 'scanner'
  | 'qr-generator'
  | 'spaces'
  | 'work-orders'
  | 'maintenance'
  | 'market'
  | 'air-quality'
  | 'impact'
  | 'team-ops'
  | 'intervenants'
  | 'env-impact'
  | 'esg-copilot'
  | 'bim-3d'
  | 'digital-twin'
  | 'predictive-ai'
  | 'occupants-care'
  | 'bee-roots'
  | 'success-stories'
  | 'careers'
  | 'partner-portal'
  | 'cmms-beecarbonat'
  | 'erp-integration'
  | 'google-sheets'
  | 'analytics-dashboard'
  | 'genai-assistant'
  | 'security-access'
  | 'system-config'
  | 'settings'
  | 'grafana'
  | 'diagnostics'
  | 'pwa-manifest';

export interface UserSession {
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  photoURL?: string;
  loginTime: string;
}

export interface BiometricState {
  hrvBaseline: number; // in ms, e.g. 42
  hrv?: number;
  recoveryScore: number; // in %, e.g. 38
  cognitiveLoad: 'Optimal' | 'Elevated' | 'Overloaded' | 'Deep Rest';
  stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  wearableConnected: 'Apple Watch' | 'Oura Ring' | 'Whoop' | 'None';
  batteryLevel: number;
  lastSyncTime: string;
  recommendedAction: string;
}

export type IntegrationCategory = 'All' | 'Communication' | 'CRM' | 'Productivity' | 'Finance' | 'Analytics';

export interface IntegrationApp {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  logo: string;
  isPopular?: boolean;
  connected?: boolean;
  colorBorder?: string;
  dataFlowRate?: string;
  capabilities: string[];
}

export interface EmailItem {
  id: string;
  sender: string;
  senderInitials: string;
  email: string;
  subject: string;
  snippet: string;
  fullBody?: string;
  time: string;
  category: 'High Priority' | 'AI Summarized' | 'Newsletter' | 'System';
  tag?: string;
  isRead?: boolean;
  sentiment?: 'Frustrated' | 'Positive' | 'Neutral' | 'Urgent';
  suggestedReply?: string;
}

export interface TranscriptItem {
  id: string;
  speaker: string;
  speakerRole: string;
  speakerInitials: string;
  avatarColor: string;
  time: string;
  text: string;
  actionItem?: {
    title: string;
    assignee: string;
    dueDate: string;
    confidence: number;
  };
}

export interface ArchitectureNode {
  id: 'core' | 'sales' | 'hr' | 'finance' | 'ops';
  title: string;
  label: string;
  icon: string;
  color: string;
  text: string;
  metrics: string;
  connectedNodes: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnually: number;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}
