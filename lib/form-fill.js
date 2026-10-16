const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const QRCode = require("qrcode");
const { isAllowedFontName } = require("./form-fonts");

const FONT_NAMES = {
  Helvetica: StandardFonts.Helvetica,
  "Helvetica-Bold": StandardFonts.HelveticaBold,
  "Helvetica-Oblique": StandardFonts.HelveticaOblique,
  "Helvetica-BoldOblique": StandardFonts.HelveticaBoldOblique,
  "Times-Roman": StandardFonts.TimesRoman,
  "Times-Bold": StandardFonts.TimesRomanBold,
  "Times-Italic": StandardFonts.TimesRomanItalic,
  "Times-BoldItalic": StandardFonts.TimesRomanBoldItalic,
  Courier: StandardFonts.Courier,
  "Courier-Bold": StandardFonts.CourierBold,
  "Courier-Oblique": StandardFonts.CourierOblique,
  "Courier-BoldOblique": StandardFonts.CourierBoldOblique,
};

const CATEGORY_FIELDS = {
  marriage: [
    ["certificateNo", "Certificate number"],
    ["groomName", "Groom full name"],
    ["brideName", "Bride full name"],
    ["groomDob", "Groom date of birth"],
    ["brideDob", "Bride date of birth"],
    ["marriageDate", "Marriage date"],
    ["applicantName", "Applicant name"],
    ["applicantMobile", "Applicant mobile"],
    ["applicantEmail", "Applicant email"],
    ["groomFirstName", "Groom first name"],
    ["groomLastName", "Groom last name"],
    ["groomFather", "Groom father"],
    ["groomMother", "Groom mother"],
    ["groomAddress", "Groom address"],
    ["groomMobile", "Groom mobile"],
    ["brideFirstName", "Bride first name"],
    ["brideLastName", "Bride last name"],
    ["brideFather", "Bride father"],
    ["brideMother", "Bride mother"],
    ["brideAddress", "Bride address"],
    ["brideMobile", "Bride mobile"],
    ["placeOfMarriage", "Place of marriage"],
    ["dowryAmount", "Dowry amount"],
    ["witness1Name", "Witness 1"],
    ["witness2Name", "Witness 2"],
    ["certifierName", "Certifier name"],
    ["status", "Status"],
  ],
  student: [
    ["name", "Name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["course", "Course"],
    ["gender", "Gender"],
    ["status", "Status"],
    ["notes", "Notes"],
  ],
};

function categoryKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function fieldsForCategory(category) {
  const key = categoryKey(category);
  if (key === "marriages") return CATEGORY_FIELDS.marriage;
  if (key === "students") return CATEGORY_FIELDS.student;
  return CATEGORY_FIELDS[key] || [];
}

function sourceList(store, category) {
  const key = categoryKey(category);
  if (key === "marriage" || key === "marriages") return store.marriages || [];
  if (key === "student" || key === "students") return store.students || [];
  if (key === "donation" || key === "donations") return store.donations || [];
  if (key === "collection" || key === "collections") return store.collections || [];
  return null;
}

function joinedDate(day, month, year) {
  return [day, month, year].filter(Boolean).join("/");
}

function valueOf(record, key, category) {
  if (!record) return "";
  const cat = categoryKey(category);
  if (cat === "marriage" || cat === "marriages") {
    if (key === "groomName") {
      return [record.groomFirstName, record.groomLastName].filter(Boolean).join(" ");
    }
    if (key === "brideName") {
      return [record.brideFirstName, record.brideLastName].filter(Boolean).join(" ");
    }
    if (key === "groomDob") return joinedDate(record.groomDobDay, record.groomDobMonth, record.groomDobYear);
    if (key === "brideDob") return joinedDate(record.brideDobDay, record.brideDobMonth, record.brideDobYear);
    if (key === "marriageDate") return joinedDate(record.marriageDay, record.marriageMonth, record.marriageYear);
  }
  const value = record[key];
  if (value == null || typeof value === "object") return "";
  return String(value);
}

function recordLabel(record, category) {
  const cat = categoryKey(category);
  if (cat === "marriage" || cat === "marriages") {
    const groom = valueOf(record, "groomName", category) || "Groom";
    const bride = valueOf(record, "brideName", category) || "Bride";
    return `${record.certificateNo || "No number"} · ${groom} & ${bride}`;
  }
  if (cat === "student" || cat === "students") return record.name || record.email || record.id;
  return record.name || record.title || record.email || record.id;
}

function hexToRgb(hex) {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(String(hex || ""));
  const raw = match ? match[1] : "143826";
  return rgb(
    parseInt(raw.slice(0, 2), 16) / 255,
    parseInt(raw.slice(2, 4), 16) / 255,
    parseInt(raw.slice(4, 6), 16) / 255
  );
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function cleanFields(list, families = []) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 80).map((field, index) => {
    const key = String(field?.key || "")
      .trim()
      .replace(/[^A-Za-z0-9_]/g, "")
      .slice(0, 40);
    return {
      id: String(field?.id || `f${index + 1}`).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24) || `f${index + 1}`,
      key: key || `field${index + 1}`,
      label: String(field?.label || "").trim().slice(0, 80),
      page: Math.round(clamp(field?.page, 0, 30, 0)),
      x: clamp(field?.x, 0, 2000, 40),
      y: clamp(field?.y, 0, 2000, 40),
      size: clamp(field?.size, 6, 48, 11),
      maxW: clamp(field?.maxW, 20, 800, 160),
      font: FONT_NAMES[field?.font] ? field.font : isAllowedFontName(field?.font, families) ? field.font : "Helvetica",
      color: /^#[0-9a-fA-F]{6}$/.test(field?.color || "") ? field.color : "#143826",
      align: ["left", "center", "right"].includes(field?.align) ? field.align : "left",
      kind: ["text", "qr", "sign"].includes(field?.kind)
        ? field.kind
        : field?.key === "qr"
        ? "qr"
        : String(field?.key || "").startsWith("sign")
        ? "sign"
        : "text",
      boxH: clamp(field?.boxH, 8, 500, String(field?.key || "") === "qr" ? 72 : 18),
    };
  });
}

async function embedImage(doc, bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return doc.embedJpg(bytes);
  return doc.embedPng(bytes);
}

async function embedNamedFont(doc, name, embedded, readFont) {
  if (embedded[name]) return embedded[name];
  if (FONT_NAMES[name]) {
    embedded[name] = await doc.embedFont(FONT_NAMES[name]);
    return embedded[name];
  }
  if (!doc.__fontkitReady) {
    doc.registerFontkit(fontkit);
    doc.__fontkitReady = true;
  }
  const bytes = readFont ? readFont(name) : null;
  if (!bytes) {
    const error = new Error(`Font ${name} is not installed`);
    error.status = 400;
    throw error;
  }
  embedded[name] = await doc.embedFont(bytes, { subset: true });
  return embedded[name];
}

async function fillTemplatePdf(pdfBytes, fields, values, images = {}, fontOptions = {}) {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  const embedded = {};
  const families = fontOptions.families || [];
  const readFont = fontOptions.readFont;
  for (const field of cleanFields(fields, families)) {
    const page = pages[field.page] || pages[0];
    if (!page) continue;
    if (field.kind === "qr") {
      const payload = String(values.qr || values.certificateNo || "").trim();
      if (!payload) continue;
      const png = await QRCode.toBuffer(payload, {
        type: "png",
        margin: 0,
        width: 280,
        errorCorrectionLevel: "M",
        color: { dark: "#048A45FF", light: "#00000000" },
      });
      const image = await doc.embedPng(png);
      page.drawImage(image, { x: field.x, y: field.y, width: field.maxW, height: field.boxH });
      continue;
    }
    if (field.kind === "sign") {
      const bytes = images[field.key];
      if (!bytes) continue;
      const image = await embedImage(doc, bytes);
      const ratio = image.width / image.height || 1;
      let width = field.maxW;
      let height = width / ratio;
      if (height > field.boxH) {
        height = field.boxH;
        width = height * ratio;
      }
      let x = field.x;
      if (field.align === "center") x += Math.max(0, (field.maxW - width) / 2);
      if (field.align === "right") x += Math.max(0, field.maxW - width);
      page.drawImage(image, {
        x,
        y: field.y + Math.max(0, (field.boxH - height) / 2),
        width,
        height,
      });
      continue;
    }
    const text = String(values[field.key] ?? "").trim();
    if (!text) continue;
    const font = await embedNamedFont(doc, field.font, embedded, readFont);
    let draw = text;
    while (font.widthOfTextAtSize(draw, field.size) > field.maxW && draw.length > 1) {
      draw = draw.slice(0, -2).trimEnd();
    }
    const width = font.widthOfTextAtSize(draw, field.size);
    let x = field.x;
    if (field.align === "center") x += Math.max(0, (field.maxW - width) / 2);
    if (field.align === "right") x += Math.max(0, field.maxW - width);
    page.drawText(draw, {
      x: Math.max(0, x),
      y: field.y + Math.min(field.boxH * 0.2, field.size * 0.25),
      size: field.size,
      font,
      color: hexToRgb(field.color),
    });
  }
  return Buffer.from(await doc.save());
}

module.exports = {
  FONT_NAMES,
  CATEGORY_FIELDS,
  categoryKey,
  fieldsForCategory,
  sourceList,
  valueOf,
  recordLabel,
  cleanFields,
  fillTemplatePdf,
};
