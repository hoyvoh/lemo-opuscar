// Delivery preset -> shell variables for a film's build.sh.
//   node core/render/preset.mjs                 list the presets
//   eval "$(node core/render/preset.mjs tiktok)" sets SIZE FPS VBR MAXRATE SAFE_TOP SAFE_BOTTOM SAFE_LEFT SAFE_RIGHT
import fs from 'fs';
const P = JSON.parse(fs.readFileSync(new URL('./presets.json', import.meta.url)));
delete P._doc;
const name = process.argv[2];
if (!name) {
  for (const [k, v] of Object.entries(P)) console.log(`${k.padEnd(16)} ${v.size.padEnd(10)} ${v.aspect.padEnd(5)} ${String(v.fps).padEnd(3)} fps  ${v.vbr} (max ${v.maxrate})  ${v.label}`);
  process.exit(0);
}
const v = P[name];
if (!v) { console.error(`unknown preset "${name}"; one of: ${Object.keys(P).join(', ')}`); process.exit(2); }
const s = v.safe;
console.log(`SIZE=${v.size} FPS=${v.fps} VBR=${v.vbr} MAXRATE=${v.maxrate} SAFE_TOP=${s.top} SAFE_BOTTOM=${s.bottom} SAFE_LEFT=${s.left} SAFE_RIGHT=${s.right}`);
