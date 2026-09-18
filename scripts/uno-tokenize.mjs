import fs from 'node:fs';

// One-shot codemod: replace literal Tailwind arbitrary hex utilities in
// src/App.jsx with semantic UnoCSS theme tokens (bg-wa-*, text-wa-*, ...).
// Run: node scripts/uno-tokenize.mjs [--check|--write]
// Visuals are identical: token hex values match the replaced literals.
const FILE = new URL('../src/App.jsx', import.meta.url);

const MAP = new Map([
  ['bg-[#003223]', 'bg-wa-container'],
  ['bg-[#00402E]', 'bg-wa-container2'],
  ['bg-[#005B3F]', 'bg-wa-menu'],
  ['bg-[#D65641]', 'bg-wa-button'],
  ['bg-[#F7F8F9]', 'bg-wa-panellight'],
  ['bg-[#c04b37]', 'bg-wa-buttonhover'],
  ['text-[#D5E0D5]', 'text-wa-text'],
  ['text-[#9DB09D]', 'text-wa-muted'],
  ['text-[#003223]', 'text-wa-ink'],
  ['text-[#D65641]', 'text-wa-button'],
  ['text-[#D0A023]', 'text-wa-warn'],
  ['text-[#252625]', 'text-wa-bg'],
  ['text-[#FFFFFF]', 'text-white'],
  ['border-[#2A5C4B]', 'border-wa-border'],
  ['border-[#EEF0F2]', 'border-wa-linelight'],
  ['border-[#C9CDD2]', 'border-wa-inputborder'],
  ['border-[#DDE2E6]', 'border-wa-line2'],
  ['border-[#E3B8B8]', 'border-wa-dangerline'],
  ['border-[#1F4A3C]', 'border-wa-borderdeep'],
  ['hover:bg-[#00402E]', 'hover:bg-wa-container2'],
  ['hover:text-[#D65641]', 'hover:text-wa-button'],
  // Opacity-modified arbitrary values need the token equivalent.
  ['bg-[#003223]/95', 'bg-wa-container/95'],
  ['bg-[#00402E]/60', 'bg-wa-container2/60'],
  ['hover:bg-[#00402E]/60', 'hover:bg-wa-container2/60'],
  ['border-[#2A5C4B]/60', 'border-wa-border/60'],
  ['text-[#D5E0D5]/70', 'text-wa-text/70'],
]);

const mode = process.argv.includes('--write') ? 'write' : 'check';
let src = fs.readFileSync(FILE, 'utf8');
let total = 0;
const missing = new Set();
for (const [from, to] of MAP) {
  const count = src.split(from).length - 1;
  if (count > 0) {
    total += count;
    if (mode === 'write') src = src.split(from).join(to);
  }
}
// Report any remaining arbitrary hex utilities not covered by MAP.
for (const m of src.matchAll(/(?:hover:)?(?:bg|text|border)-\[#[0-9a-fA-F]+\](?:\/\d+)?/g)) missing.add(m[0]);
console.log(`tokenize ${mode}: ${total} replacement(s) across ${MAP.size} mapping(s)`);
if (missing.size) {
  console.log(`remaining arbitrary hex utilities (${missing.size}): ${[...missing].join(', ')}`);
  if (mode === 'check') process.exitCode = 2;
} else {
  console.log('remaining arbitrary hex utilities (0)');
}
if (mode === 'write') {
  if (total > 0) {
    try {
      fs.writeFileSync(FILE, src);
      console.log('wrote src/App.jsx');
    } catch (err) {
      // Windows can briefly lock App.jsx (editor/AV/Vite). Print a diff-friendly
      // fallback instead of failing: rerun the command to retry the write.
      console.log(`write skipped (file locked): ${err.code || err.message}`);
      process.exitCode = 3;
    }
  } else {
    console.log('no changes to write');
  }
}
