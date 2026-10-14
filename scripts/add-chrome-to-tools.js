const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

function sliceTag(html, startRe) {
  const m = html.match(startRe);
  if (!m) throw new Error("Missing " + startRe);
  const start = m.index;
  const tag = m[0].match(/^<([a-zA-Z0-9-]+)/)[1].toLowerCase();
  let i = html.indexOf(">", start) + 1;
  let depth = 1;
  const lower = html.toLowerCase();
  while (i < html.length && depth > 0) {
    const no = lower.indexOf(`<${tag}`, i);
    const nc = lower.indexOf(`</${tag}>`, i);
    if (nc < 0) throw new Error("Unclosed " + tag);
    if (no >= 0 && no < nc) {
      depth++;
      i = no + tag.length + 1;
    } else {
      depth--;
      if (depth === 0) return html.slice(start, nc + `</${tag}>`.length);
      i = nc + `</${tag}>`.length;
    }
  }
  throw new Error("Failed " + tag);
}

const header = sliceTag(index, /<header\s+class="main-header"[^>]*>/i);
const footer = sliceTag(index, /<footer\s+class="main-footer"[^>]*>/i);

const HEAD_LINKS = `<!-- Site chrome -->
<link href="assets/css/bootstrap.css" rel="stylesheet">
<link href="assets/css/style.css" rel="stylesheet">
<link href="assets/css/responsive.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
<style>
  body.tool-page { background: #eef5f1 !important; }
  body.tool-page .page-wrapper { overflow: visible; }
  body.tool-page .tool-main { padding-bottom: 20px; }
  body.tool-page .main-footer { margin-top: 20px; }
</style>
`;

const SCRIPTS = `
<script src="assets/js/jquery.js"></script>
<script src="assets/js/bootstrap.min.js"></script>
<script src="assets/js/appear.js"></script>
<script src="assets/js/wow.js"></script>
<script src="assets/js/nav-tool.js"></script>
<script src="assets/js/script.js"></script>
<script src="assets/js/site-cms.js"></script>
`;

const files = [
  "nikah-nama.html",
  "track-nikah.html",
  "verify-portal.html",
  "verify-nikah.html",
];

for (const name of files) {
  const file = path.join(ROOT, name);
  let html = fs.readFileSync(file, "utf8");
  if (/class="main-header"/.test(html) && /main-footer/.test(html)) {
    console.log("skip (has chrome):", name);
    continue;
  }

  if (!/assets\/css\/style\.css/.test(html)) {
    html = html.replace(/<\/head>/i, `${HEAD_LINKS}\n</head>`);
  }

  html = html.replace(/<body([^>]*) class="([^"]*)"/i, '<body$1 class="$2 tool-page"');
  if (!/class="[^"]*tool-page/.test(html)) {
    html = html.replace(/<body([^>]*)>/i, '<body$1 class="tool-page">');
  }

  const bodyMatch = html.match(/<body[^>]*>/i);
  const bodyClose = html.toLowerCase().lastIndexOf("</body>");
  const open = bodyMatch[0];
  const openAt = bodyMatch.index;
  const openEnd = openAt + open.length;
  const inner = html.slice(openEnd, bodyClose);

  const pageScripts = [];
  const content = inner.replace(/<script[\s\S]*?<\/script>/gi, (s) => {
    // keep page logic + nikah-nama.js
    if (/nikah-nama\.js/.test(s) || !/\ssrc=/.test(s)) pageScripts.push(s);
    return "";
  });

  const next = `${html.slice(0, openEnd)}
<div class="page-wrapper">
${header}
<div class="tool-main">
${content.trim()}
</div>
${footer}
</div>
${SCRIPTS}
${pageScripts.join("\n")}
</body>
</html>`;

  fs.writeFileSync(file, next, "utf8");
  console.log("added chrome:", name);
}

// Normalize all chrome pages from cms
execSync("node \"" + path.join(ROOT, "scripts/sync-layout.js") + "\"", {
  cwd: ROOT,
  stdio: "inherit",
});
