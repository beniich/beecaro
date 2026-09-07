const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const replaceRules = [
  { regex: /dark:text-black dark:text-white/g, replacement: 'dark:text-white' },
  { regex: /dark:text-slate-500 dark:text-slate-500 dark:text-slate-400/g, replacement: 'dark:text-slate-400' },
  { regex: /dark:text-slate-500 dark:text-slate-400/g, replacement: 'dark:text-slate-400' },
  { regex: /dark:bg-white dark:bg-slate-950/g, replacement: 'dark:bg-slate-950' },
  { regex: /dark:border-slate-200 dark:border-slate-800/g, replacement: 'dark:border-slate-800' },
  { regex: /dark:text-black dark:text-slate-300/g, replacement: 'dark:text-slate-300' },
  { regex: /dark:text-slate-700 dark:text-slate-300/g, replacement: 'dark:text-slate-300' },
  { regex: /text-gray-900 dark:text-black/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /text-gray-800 dark:text-white/g, replacement: 'text-slate-800 dark:text-white' },
  { regex: /text-gray-500/g, replacement: 'text-slate-500' },
  { regex: /text-gray-600/g, replacement: 'text-slate-600' },
  { regex: /bg-gray-100/g, replacement: 'bg-slate-100' },
  { regex: /bg-gray-50/g, replacement: 'bg-slate-50' },
  { regex: /bg-gray-200/g, replacement: 'bg-slate-200' },
  { regex: /border-gray-200/g, replacement: 'border-slate-200' },
  { regex: /border-gray-100/g, replacement: 'border-slate-100' },
  { regex: /dark:border-slate-200/g, replacement: 'dark:border-slate-700' }, // fix for generic borders in dark mode
];

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replaceRules.forEach(rule => {
      content = content.replace(rule.regex, rule.replacement);
    });
    
    // Some manual fixing of duplicate dark classes
    content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
    content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
    content = content.replace(/dark:border-slate-800 dark:border-slate-800/g, 'dark:border-slate-800');
    content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
    content = content.replace(/dark:border-slate-700 dark:border-slate-800/g, 'dark:border-slate-800');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Harmonized: ${filePath}`);
    }
  }
});
