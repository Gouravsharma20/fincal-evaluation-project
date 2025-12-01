// tools/parse-css-safe.js
// Usage: node tools/parse-css-safe.js
// Requires: npm install --no-save postcss postcss-safe-parser

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');

function walk(dir, out = []) {
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (stat.isFile() && full.endsWith('.css')) out.push(full);
  }
  return out;
}

const cssFiles = walk(path.resolve('src'));
if (cssFiles.length === 0) {
  console.error('No .css files found under src/');
  process.exit(2);
}

console.log(`Checking ${cssFiles.length} CSS files with postcss-safe-parser...`);
for (const f of cssFiles) {
  try {
    const txt = fs.readFileSync(f, 'utf8');
    // use postcss.parse with safe parser to get good error details
    postcss.parse(txt, { from: f, parser: safeParser });
    // if parse ok, continue
  } catch (err) {
    console.error('\n⛔ Parse error detected:');
    console.error('File:', f);
    if (err.name) console.error('Error name:', err.name);
    if (err.message) console.error('Message:', err.message);
    if (err.reason) console.error('Reason:', err.reason);
    if (err.line || err.column) {
      console.error(`At line ${err.line}, column ${err.column}`);
      // show context
      const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
      const L = Math.max(1, (err.line||1) - 6);
      const R = Math.min(lines.length, (err.line||1) + 6);
      console.error('\n--- file context ---');
      for (let i = L; i <= R; i++) {
        const marker = i === (err.line||1) ? '>>' : '  ';
        console.error(`${marker} ${String(i).padStart(4)} | ${lines[i-1]}`);
      }
      console.error('--- end context ---\n');
    } else {
      console.error('No line/column info available. Full error:', err);
    }
    process.exit(1);
  }
}

console.log('All CSS files parsed OK with postcss-safe-parser (no parse error found).');
