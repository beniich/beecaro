const fs = require('fs');

let api = fs.readFileSync('src/services/api.ts', 'utf8');

const newMethods = `
  // Fetch all buildings
  async getBuildings(): Promise<any[]> {
    try {
      const response = await fetch(\`\${getApiBaseUrl()}/api/buildings\`, {
        signal: AbortSignal.timeout(2500)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch(e) {}
    return [];
  },

  // Fetch telemetry
  async getTelemetryNodes(): Promise<any[]> {
    try {
      const response = await fetch(\`\${getApiBaseUrl()}/api/telemetry\`, {
        signal: AbortSignal.timeout(2500)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch(e) {}
    return [];
  },
`;

api = api.replace(
  "  // Fetch all assets",
  newMethods + "\n  // Fetch all assets"
);

fs.writeFileSync('src/services/api.ts', api);
