const fs = require("fs");
const path = require("path");

const BUILTIN_DIR = path.join(__dirname, "..", "assets", "fonts", "source-sans-3");

const BUILTIN = {
  "Source Sans 3": {
    regular: "SourceSans3-Regular.ttf",
    bold: "SourceSans3-Bold.ttf",
    italic: "SourceSans3-It.ttf",
    boldItalic: "SourceSans3-BoldIt.ttf",
  },
};

const RESERVED = new Set(["helvetica", "times", "courier", "source sans 3"]);

function familyOf(fontName) {
  return String(fontName || "Helvetica")
    .replace(/-BoldItalic$/, "")
    .replace(/-BoldOblique$/, "")
    .replace(/-Italic$/, "")
    .replace(/-Oblique$/, "")
    .replace(/-Bold$/, "")
    .replace(/-Roman$/, "");
}

function styleOf(fontName) {
  if (/-BoldItalic$|-BoldOblique$/.test(fontName)) return "boldItalic";
  if (/-Bold$/.test(fontName)) return "bold";
  if (/-Italic$|-Oblique$/.test(fontName)) return "italic";
  return "regular";
}

function cleanFontFamily(name) {
  const family = String(name || "")
    .replace(/\.(ttf|otf)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^A-Za-z0-9 .]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  if (!/^[A-Za-z]/.test(family)) return "";
  return family;
}

function isReservedFamily(family) {
  return RESERVED.has(String(family || "").toLowerCase());
}

function customFamilies(store) {
  return ["Source Sans 3", ...(store?.formFonts || []).map((font) => font.family)];
}

function isAllowedFontName(fontName, families) {
  const font = String(fontName || "");
  const family = familyOf(font);
  if (!families.includes(family)) return false;
  return font === family || font === `${family}-Bold` || font === `${family}-Italic` || font === `${family}-BoldItalic`;
}

function publicFontList(store) {
  return [
    { family: "Helvetica" },
    { family: "Times" },
    { family: "Courier" },
    { family: "Source Sans 3", builtin: true },
    ...(store?.formFonts || []).map((font) => ({
      family: font.family,
      id: font.id,
      uploaded: true,
    })),
  ];
}

function isFontBytes(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;
  const tag = buffer.slice(0, 4).toString("latin1");
  if (tag === "OTTO" || tag === "true" || tag === "typ1") return true;
  return buffer[0] === 0x00 && buffer[1] === 0x01 && buffer[2] === 0x00 && buffer[3] === 0x00;
}

function readFormFontBytes(store, fontName, fontDir) {
  const family = familyOf(fontName);
  const style = styleOf(fontName);
  const builtin = BUILTIN[family];
  if (builtin) {
    const file = path.join(BUILTIN_DIR, builtin[style] || builtin.regular);
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file);
  }
  const uploaded = (store?.formFonts || []).find((font) => font.family === family);
  if (!uploaded || !fontDir) return null;
  const file = path.join(fontDir, uploaded.file);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file);
}

module.exports = {
  familyOf,
  styleOf,
  cleanFontFamily,
  isReservedFamily,
  customFamilies,
  isAllowedFontName,
  publicFontList,
  isFontBytes,
  readFormFontBytes,
};
