const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const TEMPLATE_PATH = path.join(
  __dirname,
  "..",
  "assets",
  "templates",
  "Nikah-Nama.pdf"
);

const INK = rgb(20 / 255, 56 / 255, 38 / 255);
const FONT_SIZE = 9;
const FONT_SIZE_SM = 8;
const BLANK = "----";

/**
 * Baselines measured inside the gold boxes of the official Nikah Nama.
 * `y` is the distance from the top of the page to the text baseline.
 */
function layout(pageWidth, pageHeight) {
  const y = (fromTop) => pageHeight - fromTop;
  const box = (x, fromTop, maxW, extra = {}) => ({
    x,
    y: y(fromTop),
    maxW,
    size: extra.size || FONT_SIZE,
    lines: extra.lines || 1,
  });

  return {
    certificateNo: box(452, 158, 108, { size: 7 }),
    groomFirstName: box(106, 215, 175),
    groomLastName: box(106, 238, 175),
    groomDobDay: box(105, 260, 24),
    groomDobMonth: box(136, 260, 24),
    groomDobYear: box(170, 260, 40),
    groomNationality: box(42, 295, 115),
    groomPlaceOfBirth: box(170, 295, 110),
    groomFather: box(42, 328, 230),
    groomMother: box(42, 362, 230),
    groomAddress: box(42, 397, 230, { lines: 3, lineGap: 11 }),
    groomMobile: box(43, 451, 115),
    groomPhone: box(171, 451, 110),
    brideFirstName: box(377, 216, 175),
    brideLastName: box(377, 239, 175),
    brideDobDay: box(377, 261, 24),
    brideDobMonth: box(408, 261, 24),
    brideDobYear: box(441, 261, 40),
    brideNationality: box(313, 296, 115),
    bridePlaceOfBirth: box(441, 296, 110),
    brideFather: box(313, 329, 230),
    brideMother: box(313, 363, 230),
    brideAddress: box(313, 397, 230, { lines: 3, lineGap: 11 }),
    brideMobile: box(314, 451, 115),
    bridePhone: box(442, 451, 110),
    marriageDay: box(43, 502, 24),
    marriageMonth: box(75, 502, 24),
    marriageYear: box(108, 502, 40),
    placeOfMarriage: box(41, 546, 110),
    dowryAmount: box(232, 528, 90),
    dowryCash: box(478, 504, 70),
    dowryJewellery: box(478, 525, 70),
    dowryLand: box(478, 547, 70),
    proposerName: box(78, 590, 150),
    proposerAddress: box(250, 590, 200),
    proposerMobile: box(470, 590, 80),
    witness1Name: box(78, 686, 190),
    witness1Address: box(90, 706, 180),
    witness2Name: box(346, 686, 190),
    witness2Address: box(358, 706, 180),
    certifierName: box(42, 748, 240),
    certifyDay: box(44, 789, 24),
    certifyMonth: box(75, 789, 24),
    certifyYear: box(108, 789, 40),
    qr: { x: pageWidth - 70, y: 58, size: 46 },
  };
}

/** Signature artwork sits on the printed signature lines. Only approved images are drawn. */
function signatureBoxes(pageHeight) {
  const y = (fromTop, height) => pageHeight - fromTop - height;
  return {
    groom: { x: 40, y: y(592, 34), w: 145, h: 34 },
    bride: { x: 385, y: y(592, 34), w: 145, h: 34 },
    witness1: { x: 155, y: y(688, 26), w: 95, h: 26 },
    witness2: { x: 423, y: y(688, 26), w: 95, h: 26 },
    certifier: { x: 430, y: y(756, 28), w: 92, h: 28 },
  };
}

function wrapText(text, font, size, maxWidth) {
  const paragraphs = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");
  const lines = [];
  for (const paragraph of paragraphs) {
    const cleaned = paragraph.replace(/[ \t]+/g, " ").trim();
    if (!cleaned) {
      lines.push("");
      continue;
    }
    const words = cleaned.split(" ");
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
      else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawValue(page, font, value, conf) {
  const size = conf.size || FONT_SIZE;
  const maxW = conf.maxW || 200;
  const lineGap = conf.lineGap || size + 2;
  const text = String(value || "").trim();
  const lines = text
    ? wrapText(text, font, size, maxW).slice(0, conf.lines || 1)
    : [BLANK];
  lines.forEach((line, i) => {
    if (!line && text) return;
    page.drawText(line || BLANK, {
      x: conf.x,
      y: conf.y - i * lineGap,
      size,
      font,
      color: INK,
    });
  });
}

async function fillNikahPdf(marriage, verifyUrl) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error("Nikah Nama template PDF missing at assets/templates/Nikah-Nama.pdf");
  }

  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const map = layout(width, height);

  const fields = Object.keys(map).filter((k) => k !== "qr");
  for (const key of fields) {
    drawValue(page, font, marriage[key], map[key]);
  }

  const signBoxes = signatureBoxes(height);
  const signatures = marriage.signatures || {};
  for (const role of Object.keys(signBoxes)) {
    const slot = signatures[role];
    if (!slot || slot.status !== "approved" || !slot.file) continue;
    if (!fs.existsSync(slot.file)) continue;
    const bytes = fs.readFileSync(slot.file);
    const image = await pdfDoc.embedPng(bytes);
    const box = signBoxes[role];
    page.drawImage(image, { x: box.x, y: box.y, width: box.w, height: box.h });
  }

  if (verifyUrl) {
    const qrPng = await QRCode.toBuffer(verifyUrl, {
      type: "png",
      width: 220,
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#048A45FF", light: "#00000000" },
    });
    const qrImage = await pdfDoc.embedPng(qrPng);
    const q = map.qr;
    page.drawImage(qrImage, {
      x: q.x,
      y: q.y,
      width: q.size,
      height: q.size,
    });
    page.drawText("Scan to verify", {
      x: q.x - 2,
      y: q.y - 10,
      size: FONT_SIZE_SM - 1,
      font,
      color: INK,
    });
  }

  return Buffer.from(await pdfDoc.save());
}

module.exports = { fillNikahPdf, TEMPLATE_PATH };
