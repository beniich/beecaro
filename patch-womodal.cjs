const fs = require('fs');
let content = fs.readFileSync('src/components/WorkOrderModal.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { api } from '../services/api';"
);

content = content.replace(
  "const [buildingId, setBuildingId] = useState(preselectedAsset?.buildingId || mockBuildings[0].id);",
  `const [buildings, setBuildings] = useState<any[]>(mockBuildings);
  const [buildingId, setBuildingId] = useState(preselectedAsset?.buildingId || mockBuildings[0].id);

  useEffect(() => {
    api.getBuildings().then(data => {
      if (data && data.length > 0) {
        setBuildings(data);
        if (!preselectedAsset) {
          setBuildingId(data[0].id);
        }
      }
    });
  }, [preselectedAsset]);`
);

content = content.replace(
  "const bld = mockBuildings.find(b => b.id === buildingId) || mockBuildings[0];",
  "const bld = buildings.find(b => b.id === buildingId) || buildings[0];"
);

content = content.replace(
  "{mockBuildings.map(b => (",
  "{buildings.map(b => ("
);

fs.writeFileSync('src/components/WorkOrderModal.tsx', content);
