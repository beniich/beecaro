const fs = require('fs');
let content = fs.readFileSync('src/features/digitaltwin/DigitalTwinViewer.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { api } from '../../services/api';"
);

content = content.replace(
  "const [selectedNode, setSelectedNode] = useState<TelemetryNode | null>(mockTelemetryNodes[0]);",
  `const [nodes, setNodes] = useState<TelemetryNode[]>(mockTelemetryNodes);
  const [selectedNode, setSelectedNode] = useState<TelemetryNode | null>(mockTelemetryNodes[0]);

  useEffect(() => {
    api.getTelemetryNodes().then(data => {
      if (data && data.length > 0) {
        setNodes(data);
        setSelectedNode(data[0]);
      }
    });
  }, []);`
);

content = content.replace(/mockTelemetryNodes\.filter/g, 'nodes.filter');
content = content.replace(/mockTelemetryNodes\.length/g, 'nodes.length');
content = content.replace(/mockTelemetryNodes\.map/g, 'nodes.map');

fs.writeFileSync('src/features/digitaltwin/DigitalTwinViewer.tsx', content);
