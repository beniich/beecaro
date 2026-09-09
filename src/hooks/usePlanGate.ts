import { useAuth } from '../contexts/AuthContext';

export type PlanFeature = 
  | 'workspace'
  | 'work-orders' 
  | 'team-ops'
  | 'spaces'
  | 'assets'
  | 'scanner'
  | 'bee-roots'
  | 'settings'
  | 'success-stories'
  | 'pricing'
  | 'solutions-vitalai'
  | 'solutions-inboxai'
  | 'solutions-meetai'
  | 'solutions-callcopilot'
  | 'lighting'
  | 'water'
  | 'waste'
  | 'maintenance'
  | 'env-impact'
  | 'market'
  | 'air-quality'
  | 'occupants-care'
  | 'esg-copilot'
  | 'bim-3d'
  | 'grafana'
  | 'mission-control'
  | 'god-mode'
  | 'predictive-ai'
  | 'diagnostics'
  | 'erp-integration'
  | 'google-sheets'
  | 'analytics-dashboard'
  | 'genai-assistant'
  | 'security-access'
  | 'api-keys'
  | 'system-config'
  | 'threat-matrix'
  | 'neural-engine'
  | 'energy-nexus'
  | 'fleet-command'
  | 'database-monitor'
  | 'predictive-core'
  | 'sustainability-matrix'
  | 'traffic-hub'
  | 'cloud-pulse'
  | 'audit-vault';

export const FREE_TIER_PAGES: string[] = [
  'workspace',
  'assets',
  'work-orders',
  'pricing',
  'settings',
  'solutions-vitalai',
  'solutions-inboxai',
  'solutions-meetai',
  'solutions-callcopilot',
  'home',
  'features',
  'customers',
  'integrations',
  'privacy',
  'terms',
  'security',
  'api-keys',
  'beecarbonat-pub'
];

export const usePlanGate = () => {
  const { profile, isFreePlan, isProPlan, isEnterprisePlan } = useAuth();

  const plan = profile?.plan || 'FREE';
  const isPremium = isProPlan || isEnterprisePlan;
  
  const canAccess = (feature: PlanFeature | string): boolean => {
    if (isPremium) return true;
    return FREE_TIER_PAGES.includes(feature as string);
  };

  return {
    plan,
    isFree: !isPremium,
    isPro: isProPlan,
    isEnterprise: isEnterprisePlan,
    isPremium,
    canAccess
  };
};
