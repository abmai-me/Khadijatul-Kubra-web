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

const INK = rgb(0.08, 0.22, 0.16);
const FONT_SIZE = 9;
const FONT_SIZE_SM = 8;

/**
 * Coordinates calibrated from gold field-box detection on the official template.
 * Origin: bottom-left. `fromTop` helpers convert for readability.
 */
function layout(pageWidth, pageHeight) {
  const y = (fromTop) => pageHeight - fromTop;
  const LG = 110; // groom name fields (inside detected boxes)
  const RG = 382; // bride name fields
  const L = 52; // full-width left column fields
  const R = 320; // full-width right column fields
  const L2 = 178; // groom right-half (place/phone)
  const R2 = 448; // bride right-half

  return {
    certificateNo: { x: 482, y: y(156), size: 10, maxW: 78 },

    // Bride Groom
    groomFirstName: { x: LG, y: y(218), maxW: 170 },
    groomLastName: { x: LG, y: y(236), maxW: 170 },
    groomDobDay: { x: 58, y: y(270), maxW: 36 },
    groomDobMonth: { x: 118, y: y(270), maxW: 36 },
    groomDobYear: { x: 185, y: y(270), maxW: 52 },
    groomNationality: { x: L, y: y(298), maxW: 105 },
    groomPlaceOfBirth: { x: L2, y: y(298), maxW: 105 },
    groomFather: { x: L, y: y(332), maxW: 220 },
    groomMother: { x: L, y: y(358), maxW: 220 },
    groomAddress: { x: L, y: y(398), maxW: 220, lines: 2 },
    groomMobile: { x: L, y: y(452), maxW: 105 },
    groomPhone: { x: L2, y: y(452), maxW: 105 },

    // Bride
    brideFirstName: { x: RG, y: y(216), maxW: 170 },
    brideLastName: { x: RG, y: y(237), maxW: 170 },
    brideDobDay: { x: 328, y: y(270), maxW: 36 },
    brideDobMonth: { x: 388, y: y(270), maxW: 36 },
    brideDobYear: { x: 455, y: y(270), maxW: 52 },
    brideNationality: { x: R, y: y(299), maxW: 105 },
    bridePlaceOfBirth: { x: R2, y: y(299), maxW: 105 },
    brideFather: { x: R, y: y(333), maxW: 220 },
    brideMother: { x: R, y: y(359), maxW: 220 },
    brideAddress: { x: R, y: y(399), maxW: 220, lines: 2 },
    brideMobile: { x: R, y: y(453), maxW: 105 },
    bridePhone: { x: R2, y: y(453), maxW: 105 },

    // Marriage
    marriageDay: { x: 118, y: y(488), maxW: 28 },
    marriageMonth: { x: 162, y: y(488), maxW: 28 },
    marriageYear: { x: 208, y: y(488), maxW: 44 },
    placeOfMarriage: { x: 118, y: y(518), maxW: 200 },
    dowryAmount: { x: 250, y: y(538), maxW: 70 },
    dowryCash: { x: 488, y: y(505), maxW: 55 },
    dowryJewellery: { x: 488, y: y(526), maxW: 55 },
    dowryLand: { x: 488, y: y(547), maxW: 55 },

    // Proposer
    proposerName: { x: 70, y: y(588), maxW: 140 },
    proposerAddress: { x: 240, y: y(588), maxW: 170 },
    proposerMobile: { x: 455, y: y(588), maxW: 90 },

    // Witnesses
    witness1Name: { x: L + 8, y: y(668), maxW: 200 },
    witness1Address: { x: L + 8, y: y(692), maxW: 200, lines: 2 },
    witness2Name: { x: R + 8, y: y(668), maxW: 200 },
    witness2Address: { x: R + 8, y: y(692), maxW: 200, lines: 2 },

    // Certifier
    certifierName: { x: 48, y: y(725), maxW: 200 },
    certifyDay: { x: 70, y: y(758), maxW: 28 },
    certifyMonth: { x: 112, y: y(758), maxW: 28 },
    certifyYear: { x: 154, y: y(758), maxW: 44 },

    qr: { x: pageWidth - 70, y: 58, size: 46 },
  };
}

function wrapText(text, font, size, maxWidth) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  if (!words[0]) return [];
  const lines = [];
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
  return lines;
}

function drawValue(page, font, value, conf) {
  if (value == null || value === "") return;
  const size = conf.size || FONT_SIZE;
  const maxW = conf.maxW || 200;
  const lines = wrapText(value, font, size, maxW).slice(0, conf.lines || 1);
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: conf.x,
      y: conf.y - i * (size + 3),
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

  if (verifyUrl) {
    const qrPng = await QRCode.toBuffer(verifyUrl, {
      type: "png",
      width: 220,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#145c39", light: "#ffffff" },
    });
    const qrImage = await pdfDoc.embedPng(qrPng);
    const q = map.qr;
    page.drawRectangle({
      x: q.x - 3,
      y: q.y - 3,
      width: q.size + 6,
      height: q.size + 6,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.1, 0.45, 0.28),
      borderWidth: 0.8,
    });
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
