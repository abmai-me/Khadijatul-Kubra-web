const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "prayer" || name === ".git" || name === "assets") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function getBalanced(html, startRe) {
  const m = html.match(startRe);
  if (!m) return null;
  const start = m.index;
  const openEnd = html.indexOf(">", start);
  const tag = m[0].match(/^<([a-zA-Z0-9-]+)/)[1].toLowerCase();
  let i = openEnd + 1;
  let depth = 1;
  const lower = html.toLowerCase();
  while (i < html.length && depth > 0) {
    const no = lower.indexOf(`<${tag}`, i);
    const nc = lower.indexOf(`</${tag}>`, i);
    if (nc < 0) return null;
    if (no >= 0 && no < nc) {
      depth += 1;
      i = no + tag.length + 1;
    } else {
      depth -= 1;
      if (depth === 0) return html.slice(start, nc + `</${tag}>`.length);
      i = nc + `</${tag}>`.length;
    }
  }
  return null;
}

function norm(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

const files = walk(ROOT);
const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const idxNav = getBalanced(indexHtml, /<ul\s+class="navigation[^"]*"[^>]*>/i);
const idxFoot = getBalanced(indexHtml, /<footer\s+class="main-footer"[^>]*>/i);
const idxHeader = getBalanced(indexHtml, /<header\s+class="main-header"[^>]*>/i);

const utility = new Set([
  "nikah-certificate.html",
  "portal/index.html",
  "portal/login.html",
  "sform/index.html",
]);

const mismatches = [];
const ok = [];

for (const full of files) {
  const rel = path.relative(ROOT, full).replace(/\\/g, "/");
  if (utility.has(rel)) continue;
  const html = fs.readFileSync(full, "utf8");
  const hasMainHeader = /class="main-header"/.test(html);
  const hasFoot = /main-footer/.test(html);
  if (!hasMainHeader && !hasFoot) continue;

  const nav = getBalanced(html, /<ul\s+class="navigation[^"]*"[^>]*>/i);
  const foot = getBalanced(html, /<footer\s+class="main-footer"[^>]*>/i);
  const header = getBalanced(html, /<header\s+class="main-header"[^>]*>/i);
  const hasCms = /site-cms\.js/.test(html);
  const hasNavOuter = /nav-outer/.test(html);
  const hasHeaderUpper = /header-upper/.test(html);

  const issues = [];
  if (hasMainHeader && !nav) issues.push("MISSING_NAV");
  if (hasMainHeader && !hasHeaderUpper) issues.push("MISSING_HEADER_UPPER");
  if (hasMainHeader && !hasNavOuter) issues.push("MISSING_NAV_OUTER");
  if (nav && norm(nav) !== norm(idxNav)) issues.push("NAV_DIFF");
  if (hasFoot && !foot) issues.push("MISSING_FOOTER");
  if (foot && norm(foot) !== norm(idxFoot)) issues.push("FOOT_DIFF");
  if ((hasMainHeader || hasFoot) && !hasCms) issues.push("NO_CMS");
  if (header && idxHeader && !hasHeaderUpper) issues.push("HEADER_INCOMPLETE");

  if (issues.length) mismatches.push({ rel, issues: issues.join(", ") });
  else ok.push(rel);
}

console.log("OK:", ok.length);
console.log("MISMATCH:", mismatches.length);
mismatches.forEach((m) => console.log(" ✗", m.rel, "->", m.issues));
if (!mismatches.length) console.log("All main site pages match.");
