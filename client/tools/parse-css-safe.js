const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
let safeParser;
try {
  safeParser = require('postcss-safe-parser');
} catch (e) {
  console.error('ERROR: postcss-safe-parser not installed. Run: npm install --no-save postcss-safe-parser');
  process.exit(2);
}

function findCssFiles(dir) {
  const results = [];
  function walk(d) {
    const items = fs.readdirSync(d, { withFileTypes: true });
    for (const it of items) {
      const p = path.join(d, it.name);
      if (it.isDirectory()) walk(p);
      else if (it.isFile() && p.endsWith('.css')) results.push(p);
    }
  }
  walk(dir);
  return results;
}

function showContext(file, line, col, radius = 6) {
  const raw = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const start = Math.max(0, line - radius - 1);
  const end = Math.min(raw.length, line + radius);
  console.error(`\n--- file: ${file} (line ${line}, col ${col}) ---`);
  for (let i = start; i < end; i++) {
    const num = String(i + 1).padStart(String(end).length, ' ');
    const marker = (i + 1 === line) ? '>>' : '  ';
    console.error(`${marker} ${num} | ${raw[i]}`);
  }
  console.error('--- end context ---\n');
}

(async () => {
  const cssRoot = path.join(process.cwd(), 'src');
  if (!fs.existsSync(cssRoot)) {
    console.error('ERROR: src/ directory not found in current working directory:', process.cwd());
    process.exit(3);
  }
  const files = findCssFiles(cssRoot);
  if (!files.length) {
    console.log('No .css files found under src/.');
    process.exit(0);
  }
  for (const f of files) {
    try {
      const css = fs.readFileSync(f, 'utf8');
      // We just parse, don't output result
      await postcss().process(css, { from: f, parser: safeParser });
    } catch (err) {
      // attempt to extract line/column
      let line = err.line || (err.name === 'CssSyntaxError' && err.line) || null;
      let col = err.column || (err.name === 'CssSyntaxError' && err.column) || null;
      console.error('\nPOSTCSS PARSE ERROR:');
      console.error(err && err.toString ? err.toString() : String(err));
      if (line) showContext(f, line, col || 0);
      else {
        // If no line info, show first ~12 lines for manual inspection
        const raw = fs.readFileSync(f, 'utf8').split(/\r?\n/).slice(0, 40);
        console.error(`\n--- file: ${f} (no line info from parser) ---`);
        raw.forEach((ln, i) => { console.error(`${String(i+1).padStart(3,' ')} | ${ln}`); });
        console.error('--- end file head ---\n');
      }
      process.exit(1);
    }
  }
  console.log('All CSS files parsed OK with postcss-safe-parser (no parse error found).');
  process.exit(0);
})();
