/**
 * Link + asset checker — saare local href/src resolve ho rahe hain ya nahi.
 * Run: node tools/check-links.cjs
 */
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const files = fs.readdirSync(PUBLIC).filter((f) => f.endsWith(".html"));

const problems = [];

files.forEach((file) => {
  const html = fs.readFileSync(path.join(PUBLIC, file), "utf8");
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g)) refs.add(m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(ref)) continue;
    const target = path.join(PUBLIC, ref.replace(/^\//, ""));
    if (!fs.existsSync(target)) {
      problems.push(`${file} -> ${ref}`);
    }
  }
});

if (problems.length) {
  console.log("BROKEN REFERENCES:");
  problems.forEach((p) => console.log("  " + p));
  process.exitCode = 1;
} else {
  console.log("All local links + assets OK (" + files.length + " pages checked)");
}
