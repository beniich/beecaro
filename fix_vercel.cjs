const fs = require('fs');

const css = fs.readFileSync('src/index.css', 'utf8');

// The block starts exactly at: "/* \n * Vercel-like Global UI/UX Transformation"
const marker = "/* \n * Vercel-like Global UI/UX Transformation";
const splitIndex = css.indexOf(marker);

if (splitIndex !== -1) {
  const newBaseCss = css.substring(0, splitIndex);
  
  const newVercelTheme = `/* 
 * Vercel-like Global UI/UX Transformation for Dashboard Light Mode 
 * Requested: Off-white background, black text, minimal Vercel style 
 * Conditions: Do NOT touch dark mode (:not(.dark)), do NOT touch website (only .vercel-ui)
 * strictly NO other colors (no orange, no green)
 */
.vercel-ui:not(.dark) {
  --bg-base: #fafafa !important;
  --bg-surface: #ffffff !important;
  --text-primary: #000000 !important;
  --text-secondary: #666666 !important;
  --border-color: #eaeaea !important;
  background-color: #fafafa !important;
  color: #000000 !important;
}

/* Base resets for cards and backgrounds */
.vercel-ui:not(.dark) .bg-white,
.vercel-ui:not(.dark) .bg-slate-50,
.vercel-ui:not(.dark) .bg-gray-50,
.vercel-ui:not(.dark) .bg-\\[\\#fafafa\\],
.vercel-ui:not(.dark) .bg-zinc-50 {
  background-color: #ffffff !important;
}

.vercel-ui:not(.dark) .bg-slate-100,
.vercel-ui:not(.dark) .bg-gray-100,
.vercel-ui:not(.dark) .bg-slate-200,
.vercel-ui:not(.dark) .bg-gray-200,
.vercel-ui:not(.dark) .bg-\\[\\#f8fafc\\],
.vercel-ui:not(.dark) .bg-\\[\\#0a0a0a\\] {
  background-color: #fafafa !important;
}

/* Typography (High Contrast / Black) */
.vercel-ui:not(.dark) .text-slate-900,
.vercel-ui:not(.dark) .text-gray-900,
.vercel-ui:not(.dark) .text-slate-800,
.vercel-ui:not(.dark) .text-gray-800,
.vercel-ui:not(.dark) .text-white,
.vercel-ui:not(.dark) .text-zinc-900 {
  color: #000000 !important;
}

/* Typography (Muted) */
.vercel-ui:not(.dark) .text-slate-700,
.vercel-ui:not(.dark) .text-gray-700,
.vercel-ui:not(.dark) .text-slate-600,
.vercel-ui:not(.dark) .text-gray-600,
.vercel-ui:not(.dark) .text-slate-500,
.vercel-ui:not(.dark) .text-gray-500,
.vercel-ui:not(.dark) .text-zinc-500,
.vercel-ui:not(.dark) .text-slate-400 {
  color: #666666 !important;
}

/* Eliminate all other text colors (orange, green, red, cyan, etc) */
.vercel-ui:not(.dark) [class*="text-orange-"],
.vercel-ui:not(.dark) [class*="text-green-"],
.vercel-ui:not(.dark) [class*="text-emerald-"],
.vercel-ui:not(.dark) [class*="text-red-"],
.vercel-ui:not(.dark) [class*="text-blue-"],
.vercel-ui:not(.dark) [class*="text-indigo-"],
.vercel-ui:not(.dark) [class*="text-cyan-"],
.vercel-ui:not(.dark) [class*="text-amber-"],
.vercel-ui:not(.dark) [class*="text-yellow-"],
.vercel-ui:not(.dark) [class*="text-teal-"],
.vercel-ui:not(.dark) [class*="text-[#ff9a00]"],
.vercel-ui:not(.dark) [class*="text-brand-"] {
  color: #000000 !important;
}

/* Eliminate all other background colors (make them monochrome) */
.vercel-ui:not(.dark) [class*="bg-orange-"],
.vercel-ui:not(.dark) [class*="bg-green-"],
.vercel-ui:not(.dark) [class*="bg-emerald-"],
.vercel-ui:not(.dark) [class*="bg-red-"],
.vercel-ui:not(.dark) [class*="bg-blue-"],
.vercel-ui:not(.dark) [class*="bg-indigo-"],
.vercel-ui:not(.dark) [class*="bg-cyan-"],
.vercel-ui:not(.dark) [class*="bg-amber-"],
.vercel-ui:not(.dark) [class*="bg-yellow-"],
.vercel-ui:not(.dark) [class*="bg-teal-"],
.vercel-ui:not(.dark) [class*="bg-[#ff9a00]"],
.vercel-ui:not(.dark) [class*="bg-brand-"] {
  background-color: #f0f0f0 !important;
  color: #000000 !important;
}

/* Specifically for primary action buttons that were colored, make them solid black */
.vercel-ui:not(.dark) button[class*="bg-orange-"],
.vercel-ui:not(.dark) button[class*="bg-blue-"],
.vercel-ui:not(.dark) button[class*="bg-emerald-"],
.vercel-ui:not(.dark) button[class*="bg-brand-"] {
  background-color: #000000 !important;
  color: #ffffff !important;
  border-color: #000000 !important;
}

/* Borders */
.vercel-ui:not(.dark) .border-slate-200,
.vercel-ui:not(.dark) .border-gray-200,
.vercel-ui:not(.dark) .border-slate-100,
.vercel-ui:not(.dark) .border-gray-100,
.vercel-ui:not(.dark) .border-slate-300,
.vercel-ui:not(.dark) .border-gray-300 {
  border-color: #eaeaea !important;
}

/* Eliminate colored borders */
.vercel-ui:not(.dark) [class*="border-orange-"],
.vercel-ui:not(.dark) [class*="border-green-"],
.vercel-ui:not(.dark) [class*="border-emerald-"],
.vercel-ui:not(.dark) [class*="border-red-"],
.vercel-ui:not(.dark) [class*="border-blue-"],
.vercel-ui:not(.dark) [class*="border-indigo-"],
.vercel-ui:not(.dark) [class*="border-cyan-"],
.vercel-ui:not(.dark) [class*="border-amber-"],
.vercel-ui:not(.dark) [class*="border-yellow-"],
.vercel-ui:not(.dark) [class*="border-teal-"],
.vercel-ui:not(.dark) [class*="border-[#ff9a00]"],
.vercel-ui:not(.dark) [class*="border-brand-"] {
  border-color: #eaeaea !important;
}

/* Specific elements like dividers */
.vercel-ui:not(.dark) hr,
.vercel-ui:not(.dark) .divide-slate-200 > :not([hidden]) ~ :not([hidden]),
.vercel-ui:not(.dark) .divide-gray-200 > :not([hidden]) ~ :not([hidden]) {
  border-color: #eaeaea !important;
}

/* Neutral Hover states */
.vercel-ui:not(.dark) .hover\\:bg-slate-50:hover,
.vercel-ui:not(.dark) .hover\\:bg-slate-100:hover,
.vercel-ui:not(.dark) .hover\\:bg-gray-50:hover,
.vercel-ui:not(.dark) [class*="hover:bg-orange-"]:hover,
.vercel-ui:not(.dark) [class*="hover:bg-blue-"]:hover {
  background-color: #f0f0f0 !important;
}

.vercel-ui:not(.dark) button[class*="bg-orange-"]:hover,
.vercel-ui:not(.dark) button[class*="bg-blue-"]:hover {
  background-color: #333333 !important;
}

/* Shadows removal for that flat vercel look */
.vercel-ui:not(.dark) .shadow-sm,
.vercel-ui:not(.dark) .shadow,
.vercel-ui:not(.dark) .shadow-md,
.vercel-ui:not(.dark) .shadow-lg,
.vercel-ui:not(.dark) .shadow-xl {
  box-shadow: none !important;
  border: 1px solid #eaeaea !important;
}
`;

  fs.writeFileSync('src/index.css', newBaseCss + newVercelTheme, 'utf8');
  console.log('Fixed CSS');
} else {
  console.log('Marker not found');
}
