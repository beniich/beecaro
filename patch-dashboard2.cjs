const fs = require('fs');
let content = fs.readFileSync('src/features/dashboard/ExecutiveDashboard.tsx', 'utf8');

content = content.replace(
  "import { \n  mockBuildings,",
  "import {\n  mockBuildings,"
);

// We've already added `const [buildings, setBuildings] = useState<any[]>(mockBuildings);` in the previous step.
// And `api.getBuildings().then(data => { if (data && data.length > 0) setBuildings(data); });`

// So we just need to make sure we replace all usages of mockBuildings except the initial state.
// Since we did this regex earlier:
// wait, the previous patch script failed? Let's check `git status` or just `cat src/features/dashboard/ExecutiveDashboard.tsx`

fs.writeFileSync('test-patch.cjs', 'console.log("ok");');
