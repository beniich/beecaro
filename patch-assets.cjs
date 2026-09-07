const fs = require('fs');
let content = fs.readFileSync('src/features/assets/AssetsManager.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

// We replace the initialization
content = content.replace(
  "const [assets, setAssets] = useState<Asset[]>(mockAssets);",
  "const [assets, setAssets] = useState<Asset[]>([]);\n\n  useEffect(() => {\n    fetch('/api/assets')\n      .then(r => r.json())\n      .then(data => setAssets(data))\n      .catch(console.error);\n  }, []);"
);

fs.writeFileSync('src/features/assets/AssetsManager.tsx', content);
