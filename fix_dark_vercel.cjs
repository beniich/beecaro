const fs = require('fs');
const css = fs.readFileSync('src/index.css', 'utf8');

const newDarkVercelTheme = `

/* 
 * ============================================================================
 * Vercel-like Global UI/UX Transformation for Dashboard DARK Mode 
 * Requested: Absolute black background, cream white text, ZERO other colors.
 * ============================================================================
 */
html.dark .vercel-ui,
.vercel-ui.dark {
  --bg-base: #000000 !important;
  --bg-surface: #000000 !important;
  --text-primary: #f5f5f5 !important;
  --text-secondary: #a1a1aa !important;
  --border-color: #222222 !important;
  background-color: #000000 !important;
  color: #f5f5f5 !important;
}

/* Base resets for cards and backgrounds */
html.dark .vercel-ui .bg-white,
html.dark .vercel-ui [class*="bg-slate-"],
html.dark .vercel-ui [class*="bg-gray-"],
html.dark .vercel-ui [class*="bg-zinc-"],
html.dark .vercel-ui [class*="bg-neutral-"],
html.dark .vercel-ui [class*="dark:bg-"] {
  background-color: #000000 !important;
}

/* Typography (High Contrast / Cream White) */
html.dark .vercel-ui [class*="text-slate-"],
html.dark .vercel-ui [class*="text-gray-"],
html.dark .vercel-ui [class*="text-zinc-"],
html.dark .vercel-ui [class*="text-neutral-"],
html.dark .vercel-ui .text-black,
html.dark .vercel-ui .text-white,
html.dark .vercel-ui [class*="dark:text-"] {
  color: #f5f5f5 !important;
}

/* Typography (Muted) for secondary text */
html.dark .vercel-ui .text-slate-400,
html.dark .vercel-ui .text-slate-500,
html.dark .vercel-ui .text-gray-400,
html.dark .vercel-ui .text-gray-500,
html.dark .vercel-ui .dark\\:text-slate-400,
html.dark .vercel-ui .dark\\:text-slate-500 {
  color: #a1a1aa !important;
}

/* Eliminate all other text colors (force Cream White) */
html.dark .vercel-ui [class*="text-orange-"],
html.dark .vercel-ui [class*="text-green-"],
html.dark .vercel-ui [class*="text-emerald-"],
html.dark .vercel-ui [class*="text-red-"],
html.dark .vercel-ui [class*="text-blue-"],
html.dark .vercel-ui [class*="text-indigo-"],
html.dark .vercel-ui [class*="text-cyan-"],
html.dark .vercel-ui [class*="text-amber-"],
html.dark .vercel-ui [class*="text-yellow-"],
html.dark .vercel-ui [class*="text-teal-"],
html.dark .vercel-ui [class*="text-[#ff9a00]"],
html.dark .vercel-ui [class*="text-brand-"] {
  color: #f5f5f5 !important;
}

/* Eliminate all other background colors (force Absolute Black) */
html.dark .vercel-ui [class*="bg-orange-"],
html.dark .vercel-ui [class*="bg-green-"],
html.dark .vercel-ui [class*="bg-emerald-"],
html.dark .vercel-ui [class*="bg-red-"],
html.dark .vercel-ui [class*="bg-blue-"],
html.dark .vercel-ui [class*="bg-indigo-"],
html.dark .vercel-ui [class*="bg-cyan-"],
html.dark .vercel-ui [class*="bg-amber-"],
html.dark .vercel-ui [class*="bg-yellow-"],
html.dark .vercel-ui [class*="bg-teal-"],
html.dark .vercel-ui [class*="bg-[#ff9a00]"],
html.dark .vercel-ui [class*="bg-brand-"] {
  background-color: #000000 !important;
  color: #f5f5f5 !important;
  border: 1px solid #222222 !important;
}

/* Icons (SVGs) - force Cream White */
html.dark .vercel-ui svg,
html.dark .vercel-ui .lucide {
  color: #f5f5f5 !important;
  stroke: #f5f5f5 !important;
}

html.dark .vercel-ui svg[fill="none"] {
  fill: none !important;
}

html.dark .vercel-ui svg:not([fill="none"]) {
  fill: #f5f5f5 !important;
}

/* Borders */
html.dark .vercel-ui [class*="border-slate-"],
html.dark .vercel-ui [class*="border-gray-"],
html.dark .vercel-ui [class*="dark:border-"] {
  border-color: #222222 !important;
}

/* Eliminate colored borders */
html.dark .vercel-ui [class*="border-orange-"],
html.dark .vercel-ui [class*="border-green-"],
html.dark .vercel-ui [class*="border-emerald-"],
html.dark .vercel-ui [class*="border-red-"],
html.dark .vercel-ui [class*="border-blue-"],
html.dark .vercel-ui [class*="border-indigo-"],
html.dark .vercel-ui [class*="border-cyan-"],
html.dark .vercel-ui [class*="border-amber-"],
html.dark .vercel-ui [class*="border-yellow-"],
html.dark .vercel-ui [class*="border-teal-"],
html.dark .vercel-ui [class*="border-[#ff9a00]"],
html.dark .vercel-ui [class*="border-brand-"] {
  border-color: #222222 !important;
}

/* Specific elements like dividers */
html.dark .vercel-ui hr,
html.dark .vercel-ui [class*="divide-slate-"] > :not([hidden]) ~ :not([hidden]),
html.dark .vercel-ui [class*="divide-gray-"] > :not([hidden]) ~ :not([hidden]) {
  border-color: #222222 !important;
}

/* Neutral Hover states - strictly Dark Gray */
html.dark .vercel-ui [class*="hover:bg-"]:hover {
  background-color: #111111 !important;
  color: #f5f5f5 !important;
}

/* Shadows removal for that flat vercel look */
html.dark .vercel-ui [class*="shadow"] {
  box-shadow: none !important;
  border: 1px solid #222222 !important;
}

/* Specific fix for elements missing background */
html.dark .vercel-ui.min-h-screen,
html.dark body {
  background-color: #000000 !important;
}
`;

fs.writeFileSync('src/index.css', css + newDarkVercelTheme, 'utf8');
console.log('Fixed Dark Mode CSS');
