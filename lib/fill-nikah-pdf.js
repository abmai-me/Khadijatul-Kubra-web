const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const TEMPLATE = path.join(__dirname, "..", "assets", "Nikah-Nama.pdf");

/**
 * Text positions in PDF points (origin: bottom-left), A4 595.28 x 841.89
 * Tuned to Khadijatul Kubra Trust Nikah Nama blank template.
 */
const POS = {
  certificateNo: { x: 438, y: 718, size: 9, maxW: 110 },

  groomFirstName: { x: 52, y: 628, size: 9, maxW: 220 },
  groomLastName: { x: 52, y: 592, size: 9, maxW: 220 },
  groomDobDay: { x: 52, y: 548, size: 9, maxW: 40 },
  groomDobMonth: { x: 108, y: 548, size: 9, maxW: 40 },
  groomDobYear: { x: 164, y: 548, size: 9, maxW: 70 },
  groomNationality: { x: 52, y: 508, size: 8, maxW: 105 },
  groomPlaceOfBirth: { x: 168, y: 508, size: 8, maxW: 105 },
  groomFather: { x: 52, y: 468, size: 9, maxW: 220 },
  groomMother: { x: 52, y: 428, size: 9, maxW: 220 },
  groomAddress: { x: 52, y: 370, size: 8, maxW: 220, lines: 3, lineH: 12 },

  brideFirstName: { x: 318, y: 628, size: 9, maxW: 220 },
  brideLastName: { x: 318, y: 592, size: 9, maxW: 220 },
  brideDobDay: { x: 318, y: 548, size: 9, maxW: 40 },
  brideDobMonth: { x: 374, y: 548, size: 9, maxW: 40 },
  brideDobYear: { x: 430, y: 548, size: 9, maxW: 70 },
  brideNationality: { x: 318, y: 508, size: 8, maxW: 105 },
  bridePlaceOfBirth: { x: 434, y: 508, size: 8, maxW: 105 },
  brideFather: { x: 318, y: 468, size: 9, maxW: 220 },
  brideMother: { x: 318, y: 428, size: 9, maxW: 220 },
  brideAddress: { x: 318, y: 370, size: 8, maxW: 220, lines: 3, lineH: 12 },

  marriageDay: { x: 52, y: 292, size: 9, maxW: 36 },
  marriageMonth: { x: 100, y: 292, size: 9, maxW: 36 },
  marriageYear: { x: 148, y: 292, size: 9, maxW: 60 },
  placeOfMarriage: { x: 230, y: 292, size: 8, maxW: 200 },
  dowryAmount: { x: 480, y: 290, size: 10, maxW: 70 },

  dowryCash: { x: 200, y: 248, size: 9, maxW: 120 },
  dowryJewellery: { x: 200, y: 226, size: 9, maxW: 120 },
  dowryLand: { x: 200, y: 204, size: 9, maxW: 120 },

  proposerName: { x: 70, y: 168, size: 8, maxW: 150 },
  proposerAddress: { x: 250, y: 168, size: 8, maxW: 180 },
  proposerMobile: { x: 460, y: 168, size: 8, maxW: 100 },

  witness1Name: { x: 70, y: 118, size: 8, maxW: 200 },
  witness1Address: { x: 70, y: 98, size: 7, maxW: 200, lines: 2, lineH: 10 },
  witness2Name: { x: 330, y: 118, size: 8, maxW: 200 },
  witness2Address: { x: 330, y: 98, size: 7, maxW: 200, lines: 2, lineH: 10 },

  certifierName: { x: 52, y: 58, size: 8, maxW: 220 },
  certifyDay: { x: 52, y: 32, size: 8, maxW: 30 },
  certifyMonth: { x: 95, y: 32, size: 8, maxW: 30 },
  certifyYear: { x: 138, y: 32, size: 8, maxW: 50 },
};

const COLOR = rgb(0.08, 0.22, 0.16);

function fitText(font, text, size, maxW) {
  let t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  while (t.length > 1 && font.widthOfTextAtSize(t, size) > maxW) {
    t = t.slice(0, -1);
  }
  if (font.widthOfTextAtSize(t, size) > maxW) return t;
  if (String(text || "").trim() !== t) return t.replace(/.$/, "…");
  return t;
}

function wrapText(font, text, size, maxW, maxLines) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxW) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines).map((l) => fitText(font, l, size, maxW));
}

async function fillNikahPdf(data = {}) {
  const bytes = fs.readFileSync(TEMPLATE);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const page = pdf.getPages()[0];
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  for (const [key, conf] of Object.entries(POS)) {
    const raw = data[key];
    if (raw == null || String(raw).trim() === "") continue;

    if (conf.lines) {
      const lines = wrapText(font, raw, conf.size, conf.maxW, conf.lines);
      lines.forEach((line, i) => {
        page.drawText(line, {
          x: conf.x,
          y: conf.y - i * (conf.lineH || 11),
          size: conf.size,
          font,
          color: COLOR,
        });
      });
    } else {
      const text = fitText(font, raw, conf.size, conf.maxW);
      if (!text) continue;
      page.drawText(text, {
        x: conf.x,
        y: conf.y,
        size: conf.size,
        font,
        color: COLOR,
      });
    }
  }

  return Buffer.from(await pdf.save());
}

module.exports = { fillNikahPdf, POS, TEMPLATE };
