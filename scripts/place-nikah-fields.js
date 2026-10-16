const fs = require("fs");
const path = require("path");

const PAGE_H = 841.89;

/** Same boxes as lib/nikah-pdf.js. y is distance from the top of the page. */
const FIELDS = {
  certificateNo: { x: 476, y: 158, size: 10 },
  groomFirstName: { x: 106, y: 215 },
  groomLastName: { x: 106, y: 238 },
  groomDobDay: { x: 105, y: 260 },
  groomDobMonth: { x: 136, y: 260 },
  groomDobYear: { x: 170, y: 260 },
  groomNationality: { x: 42, y: 295 },
  groomPlaceOfBirth: { x: 170, y: 295 },
  groomFather: { x: 42, y: 328 },
  groomMother: { x: 42, y: 362 },
  groomAddress: { x: 42, y: 397, lines: 2 },
  groomMobile: { x: 43, y: 451 },
  groomPhone: { x: 171, y: 451 },
  brideFirstName: { x: 377, y: 216 },
  brideLastName: { x: 377, y: 239 },
  brideDobDay: { x: 377, y: 261 },
  brideDobMonth: { x: 408, y: 261 },
  brideDobYear: { x: 441, y: 261 },
  brideNationality: { x: 313, y: 296 },
  bridePlaceOfBirth: { x: 441, y: 296 },
  brideFather: { x: 313, y: 329 },
  brideMother: { x: 313, y: 363 },
  brideAddress: { x: 313, y: 397, lines: 2 },
  brideMobile: { x: 314, y: 451 },
  bridePhone: { x: 442, y: 451 },
  marriageDay: { x: 43, y: 502 },
  marriageMonth: { x: 75, y: 502 },
  marriageYear: { x: 108, y: 502 },
  placeOfMarriage: { x: 41, y: 546 },
  dowryAmount: { x: 232, y: 528 },
  dowryCash: { x: 478, y: 504 },
  dowryJewellery: { x: 478, y: 525 },
  dowryLand: { x: 478, y: 547 },
  proposerName: { x: 78, y: 590 },
  proposerAddress: { x: 250, y: 590 },
  proposerMobile: { x: 470, y: 590 },
  witness1Name: { x: 78, y: 686 },
  witness1Address: { x: 90, y: 706 },
  witness2Name: { x: 346, y: 686 },
  witness2Address: { x: 358, y: 706 },
  certifierName: { x: 42, y: 748 },
  certifyDay: { x: 44, y: 789 },
  certifyMonth: { x: 75, y: 789 },
  certifyYear: { x: 108, y: 789 },
};

const SAMPLE = {
  certificateNo: "NN-1001",
  groomFirstName: "Ahmed",
  groomLastName: "Rahman",
  groomDobDay: "12",
  groomDobMonth: "03",
  groomDobYear: "1998",
  groomNationality: "British",
  groomPlaceOfBirth: "Leicester",
  groomFather: "Karim Rahman",
  groomMother: "Fatima Rahman",
  groomAddress: "3 Dore Road, Leicester, LE5 5HG",
  groomMobile: "07400000000",
  groomPhone: "01160000000",
  brideFirstName: "Ayesha",
  brideLastName: "Khan",
  brideDobDay: "04",
  brideDobMonth: "07",
  brideDobYear: "2000",
  brideNationality: "British",
  bridePlaceOfBirth: "Birmingham",
  brideFather: "Yusuf Khan",
  brideMother: "Maryam Khan",
  brideAddress: "10 Example Street, Leicester",
  brideMobile: "07400000001",
  bridePhone: "01160000001",
  marriageDay: "16",
  marriageMonth: "10",
  marriageYear: "2026",
  placeOfMarriage: "Leicester",
  dowryAmount: "500",
  dowryCash: "300",
  dowryJewellery: "150",
  dowryLand: "50",
  proposerName: "Imam Abdullah",
  proposerAddress: "Leicester",
  proposerMobile: "07400000002",
  witness1Name: "Omar Ali",
  witness1Address: "Leicester",
  witness2Name: "Hassan Ali",
  witness2Address: "Leicester",
  certifierName: "Khadijatul Kubra Trust",
  certifyDay: "16",
  certifyMonth: "10",
  certifyYear: "2026",
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fieldNodes(data) {
  const nodes = [];
  for (const [id, box] of Object.entries(FIELDS)) {
    const raw = String(data[id] || "").trim();
    if (!raw) continue;
    const size = box.size || 9;
    const lineH = size + 3;
    const parts = raw.split(/\n|,\s*/).filter(Boolean);
    const lines = box.lines ? parts.slice(0, box.lines) : [parts.join(", ")];
    if (lines.length < 2) {
      nodes.push(
        `<text id="${id}" x="${box.x}" y="${box.y}" font-size="${size}">${escapeXml(lines[0] || raw)}</text>`
      );
      continue;
    }
    const tspans = lines
      .map((line, index) => {
        const dy = index === 0 ? 0 : lineH;
        return `<tspan x="${box.x}" dy="${dy}">${escapeXml(line)}</tspan>`;
      })
      .join("");
    nodes.push(`<text id="${id}" x="${box.x}" y="${box.y}" font-size="${size}">${tspans}</text>`);
  }
  return nodes.join("\n    ");
}

function injectFields(svg, data) {
  const layer = `<g id="nikah-fields" font-family="Arial, Helvetica, sans-serif" fill="#143826">\n    ${fieldNodes(data)}\n  </g>`;
  const without = svg.replace(/<g id="nikah-fields"[\s\S]*?<\/g>\s*/, "");
  const close = without.lastIndexOf("</svg>");
  if (close < 0) throw new Error("SVG has no closing tag");
  return `${without.slice(0, close)}  ${layer}\n${without.slice(close)}`;
}

function main() {
  const src = path.join(process.env.USERPROFILE, "Downloads", "Nikah Nama.svg");
  const outDir = path.join(__dirname, "..", "assets", "preview");
  fs.mkdirSync(outDir, { recursive: true });
  const svg = injectFields(fs.readFileSync(src, "utf8"), SAMPLE);
  const svgPath = path.join(outDir, "nikah-filled.svg");
  const htmlPath = path.join(outDir, "nikah-filled.html");
  fs.writeFileSync(svgPath, svg);
  fs.writeFileSync(
    htmlPath,
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}svg{width:210mm;height:297mm;display:block}</style></head><body>\n${svg}\n</body></html>`
  );
  console.log(htmlPath);
  console.log("height-check", PAGE_H);
}

main();
