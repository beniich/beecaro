import { Request, Response } from 'express';
import { stores } from '../db/memoryStore';
import { pool } from '../../db/index';

export const getGrafanaOverview = (req: Request, res: Response) => {
  const isPgConnected = !!process.env.MY_NEON_DB_URL;
  res.json({
    status: 'operational',
    engine: 'Grafana Telemetry v11.4-BeeCarbonat',
    uptimeSeconds: Math.floor(process.uptime()),
    datasources: [
      { id: 'ds-pg', name: 'PostgreSQL Neon DB', type: 'postgres', status: isPgConnected ? 'connected' : 'simulated', latencyMs: 14 },
      { id: 'ds-firestore', name: 'Google Cloud Firestore', type: 'firestore', status: 'connected', latencyMs: 22 },
      { id: 'ds-prom', name: 'Prometheus BMS Gateway', type: 'prometheus', status: 'connected', latencyMs: 5 },
      { id: 'ds-loki', name: 'Grafana Loki Log Collector', type: 'loki', status: 'connected', latencyMs: 8 },
      { id: 'ds-mqtt', name: 'MQTT / LoRaWAN IoT Ingestion', type: 'mqtt', status: 'connected', latencyMs: 12 }
    ],
    metricsSummary: {
      totalIngestionRateRps: 1840,
      activeSensors: stores.telemetryStore.length * 12 + 148,
      activeAlertsCount: 3,
      systemHealth: 99.8,
      dataPointsStored: 2458900
    }
  });
};

export const getGrafanaMetrics = (req: Request, res: Response) => {
  const now = Date.now();
  const count = 30;
  const series = [];
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 1000).toISOString().slice(11, 19);
    const noise = (Math.sin(i * 0.4) + 1) * 10;
    series.push({
      timestamp,
      time: timestamp,
      cpuUsage: +(35 + Math.sin(i * 0.5) * 15 + Math.random() * 5).toFixed(1),
      memoryPoolMb: +(420 + Math.cos(i * 0.3) * 40 + Math.random() * 10).toFixed(0),
      networkRps: +(1200 + Math.sin(i * 0.8) * 350 + Math.random() * 80).toFixed(0),
      chillerPowerKw: +(140 + Math.sin(i * 0.2) * 25 + Math.random() * 5).toFixed(1),
      lightingPowerKw: +(28 + Math.cos(i * 0.4) * 8 + Math.random() * 2).toFixed(1),
      solarOutputKw: +(95 + Math.sin(i * 0.3) * 40 + Math.random() * 5).toFixed(1),
      waterFlowLpm: +(32 + Math.sin(i * 0.6) * 6 + Math.random() * 2).toFixed(1),
      waterPressureBar: +(4.1 + Math.sin(i * 0.3) * 0.2 + (Math.random() * 0.1)).toFixed(2),
      chillerTempC: +(18.2 + Math.sin(i * 0.2) * 1.5 + (Math.random() * 0.3)).toFixed(1),
      co2IntensityGpkwh: +(185 + Math.sin(i * 0.4) * 20 + Math.random() * 5).toFixed(0),
      workOrderVelocity: +(4 + (i % 3) + Math.floor(Math.random() * 2))
    });
  }
  res.json({
    timeRange: req.query.range || 'last-30m',
    interval: '1m',
    series
  });
};

export const getGrafanaAlerts = (req: Request, res: Response) => {
  res.json([
    {
      id: 'alt-01',
      title: 'CVC Tour Alpha - Surchauffe Compresseur',
      rule: 'chiller_temp_celsius > 24.0 for 5m',
      state: 'firing',
      severity: 'critical',
      source: 'BACnet Sensor Chiller-01',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      value: '26.4 °C',
      threshold: '24.0 °C',
      acknowledged: false
    },
    {
      id: 'alt-02',
      title: 'Secteur 4 Fluides - Anomalie Débit Détectée',
      rule: 'water_flow_liters_per_min > 35.0 for 3m',
      state: 'firing',
      severity: 'warning',
      source: 'HydroSync Sector 4',
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      value: '38.5 L/min',
      threshold: '35.0 L/min',
      acknowledged: true
    },
    {
      id: 'alt-03',
      title: 'Éclairage Parking Niveau -2 - Hors Limite Horaires',
      rule: 'lighting_consumption_kw > 5.0 between 23:00-06:00',
      state: 'pending',
      severity: 'info',
      source: 'DALI-2 Gateway Zone 5',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      value: '5.4 kW',
      threshold: '5.0 kW',
      acknowledged: false
    },
    {
      id: 'alt-04',
      title: 'Bilan Carbone Journalier - Dérive Scope 2',
      rule: 'grid_import_kwh_rate > target_threshold',
      state: 'normal',
      severity: 'info',
      source: 'CSRD Carbon Engine',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      value: 'Normal (185 g/kWh)',
      threshold: '220 g/kWh',
      acknowledged: true
    }
  ]);
};

export const getGrafanaLogs = (req: Request, res: Response) => {
  const levelFilter = (req.query.level as string) || 'all';
  const allLogs = [
    { id: 'log-1', timestamp: new Date(Date.now() - 12000).toISOString(), level: 'INFO', service: 'bms-gateway', message: 'BACnet/IP polling completed on 148 nodes (duration: 32ms)' },
    { id: 'log-2', timestamp: new Date(Date.now() - 24000).toISOString(), level: 'WARN', service: 'hydrosync', message: 'Pressure fluctuation on Sector 4 (Loop Cooling): 2.8 bar (nominal: 4.0 bar)' },
    { id: 'log-3', timestamp: new Date(Date.now() - 36000).toISOString(), level: 'INFO', service: 'dali-lighting', message: 'Circadian rhythm preset applied to Open Space Floor 2-10 (4000K, 75% lux)' },
    { id: 'log-4', timestamp: new Date(Date.now() - 52000).toISOString(), level: 'ERROR', service: 'cmms-engine', message: 'SLA Warning: WO-2026-0853 requires inspection technician sign-off within 2h' },
    { id: 'log-5', timestamp: new Date(Date.now() - 75000).toISOString(), level: 'INFO', service: 'postgres-sync', message: 'NeonDB PostgreSQL write-through sync successful: 12 table records committed' },
    { id: 'log-6', timestamp: new Date(Date.now() - 95000).toISOString(), level: 'INFO', service: 'gemini-ai', message: 'AI Diagnostic predictive model processed chiller vibration FFT matrix: HealthScore=94' },
    { id: 'log-7', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'DEBUG', service: 'mqtt-telemetry', message: 'LoRaWAN payload decoded for sensor node-pwr-03 (battery: 98%, rssi: -64dBm)' },
    { id: 'log-8', timestamp: new Date(Date.now() - 145000).toISOString(), level: 'INFO', service: 'esg-csrd', message: 'Hourly carbon accounting batch: Scope 1=0.4kg, Scope 2=12.2kg, Solar offset=34.8kg' }
  ];
  const filtered = levelFilter === 'all' 
     ? allLogs 
     : allLogs.filter((l: any) => l.level.toLowerCase() === levelFilter.toLowerCase());
  res.json(filtered);
};

export const postGrafanaQuery = async (req: Request, res: Response) => {
  const { query, type } = req.body;
  try {
    if (type === 'sql' && process.env.MY_NEON_DB_URL) {
      const client = await pool.connect();
      const sqlResult = await client.query(query || 'SELECT count(*) FROM assets');
      client.release();
      return res.json({
        success: true,
        type: 'sql',
        rows: sqlResult.rows,
        rowCount: sqlResult.rowCount
      });
    }
    // PromQL / Simulated query handler
    res.json({
      success: true,
      type: type || 'promql',
      resultType: 'matrix',
      result: [
        {
          metric: { __name__: query || 'building_power_consumption_kw', building: 'Spider Cybernetics Tower A', zone: 'West' },
          values: [
            [Date.now() - 60000, '142.4'],
            [Date.now() - 30000, '145.1'],
            [Date.now(), '143.8']
          ]
        }
      ]
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
