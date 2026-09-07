const fs = require('fs');

let content = fs.readFileSync('src/features/dashboard/ExecutiveDashboard.tsx', 'utf8');

// Replace mockBuildings import if possible, or just add local state for buildings.
content = content.replace(
  "const [assets, setAssets] = useState<Asset[]>([]);",
  "const [assets, setAssets] = useState<Asset[]>([]);\n  const [buildings, setBuildings] = useState<any[]>(mockBuildings);"
);

content = content.replace(
  "// Initial fetch of live records from backend database memory",
  `// Initial fetch of live records from backend database memory
    api.getBuildings().then(data => {
      if (data && data.length > 0) setBuildings(data);
    });`
);

// We need to replace references to mockBuildings inside the component to use `buildings`.
content = content.replace(/mockBuildings\.length/g, "buildings.length");
content = content.replace(/mockBuildings\.filter/g, "buildings.filter");
content = content.replace(/mockBuildings/g, "buildings"); // general fallback, but wait, `mockBuildings` is imported.

fs.writeFileSync('src/features/dashboard/ExecutiveDashboard.tsx', content);
