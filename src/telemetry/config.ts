import type { Region, CloudProvider } from './types';

export const REGIONS: Record<Region, { name: string; coords: [number, number]; country: string }> = {
  'us-east': { name: 'US East (N. Virginia)', coords: [-77.5, 38.9], country: 'US' },
  'us-west': { name: 'US West (Oregon)', coords: [-123.0, 44.0], country: 'US' },
  'eu-west': { name: 'EU West (Ireland)', coords: [-8.2, 53.4], country: 'IE' },
  'eu-central': { name: 'EU Central (Frankfurt)', coords: [8.6, 50.1], country: 'DE' },
  'asia-pacific': { name: 'Asia Pacific (Tokyo)', coords: [139.7, 35.7], country: 'JP' },
  'south-america': { name: 'South America (São Paulo)', coords: [-46.6, -23.5], country: 'BR' },
};

export const SERVER_FLEET: Array<{
  id: string;
  hostname: string;
  region: Region;
  provider: CloudProvider;
  type: 'edge' | 'origin' | 'database' | 'cache';
}> = [
  // Edge servers (CDN)
  { id: 'edge-nyc-01', hostname: 'edge-nyc-01.beecarbon.io', region: 'us-east', provider: 'edge', type: 'edge' },
  { id: 'edge-sfo-01', hostname: 'edge-sfo-01.beecarbon.io', region: 'us-west', provider: 'edge', type: 'edge' },
  { id: 'edge-dub-01', hostname: 'edge-dub-01.beecarbon.io', region: 'eu-west', provider: 'edge', type: 'edge' },
  { id: 'edge-fra-01', hostname: 'edge-fra-01.beecarbon.io', region: 'eu-central', provider: 'edge', type: 'edge' },
  { id: 'edge-tyo-01', hostname: 'edge-tyo-01.beecarbon.io', region: 'asia-pacific', provider: 'edge', type: 'edge' },
  { id: 'edge-gru-01', hostname: 'edge-gru-01.beecarbon.io', region: 'south-america', provider: 'edge', type: 'edge' },
  
  // Origin servers
  { id: 'origin-aws-01', hostname: 'origin-aws-01.beecarbon.io', region: 'us-east', provider: 'aws', type: 'origin' },
  { id: 'origin-gcp-01', hostname: 'origin-gcp-01.beecarbon.io', region: 'eu-west', provider: 'gcp', type: 'origin' },
  
  // Databases
  { id: 'db-pg-primary', hostname: 'db-pg-primary.beecarbon.io', region: 'eu-central', provider: 'self-hosted', type: 'database' },
  { id: 'db-pg-replica', hostname: 'db-pg-replica.beecarbon.io', region: 'us-east', provider: 'self-hosted', type: 'database' },
  
  // Cache
  { id: 'cache-redis-01', hostname: 'cache-redis-01.beecarbon.io', region: 'eu-central', provider: 'self-hosted', type: 'cache' },
];
