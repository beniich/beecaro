const fs = require('fs');

let content = fs.readFileSync('src/features/cmms/WorkOrdersManager.tsx', 'utf8');

// Replace mockTickets with a state
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

const stateAndEffect = `
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/workorders')
      .then(res => res.json())
      .then(data => {
        // Map backend schema to UI format temporarily
        const mapped = data.map((t: any) => ({
          id: t.ticketNumber,
          desc: t.title,
          priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          status: t.status.replace('_', ' ').replace(/\\b\\w/g, (l: string) => l.toUpperCase()),
          assignee: t.assignedTechnician ? t.assignedTechnician.name : 'Unassigned',
          due: new Date(t.slaDeadline).toLocaleDateString(),
          asset: t.assetId,
          category: t.category,
          completedAt: t.status === 'closed' || t.status === 'resolved' ? new Date().toISOString() : null
        }));
        setTickets(mapped);
      })
      .catch(console.error);
  }, []);
`;

// Replace `const mockTickets = [...]`
content = content.replace(
  /const mockTickets = \[[\s\S]*?\];/m,
  stateAndEffect
);

// Replace `mockTickets.map` with `tickets.map`
content = content.replace(/mockTickets\.map/g, 'tickets.map');

fs.writeFileSync('src/features/cmms/WorkOrdersManager.tsx', content);
