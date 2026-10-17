const BOARD_KINDS = ["notice", "vacancy"];

const BOARD_ICONS = [
  "fa-file-lines",
  "fa-file-pdf",
  "fa-bullhorn",
  "fa-bell",
  "fa-calendar-days",
  "fa-mosque",
  "fa-book-open",
  "fa-graduation-cap",
  "fa-users",
  "fa-briefcase",
  "fa-user-tie",
  "fa-handshake",
  "fa-envelope",
  "fa-location-dot",
  "fa-clock",
  "fa-star",
  "fa-heart",
  "fa-hand-holding-heart",
  "fa-comments",
  "fa-circle-info",
  "fa-clipboard-list",
  "fa-building-columns",
  "fa-scale-balanced",
  "fa-child-reaching",
  "fa-chalkboard-user",
  "fa-scroll",
  "fa-landmark",
  "fa-globe",
];

const FILE_EXTS = ["pdf", "doc", "docx", "png", "jpg", "jpeg"];

function cleanText(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanIcon(value) {
  const icon = cleanText(value, 40);
  return BOARD_ICONS.includes(icon) ? icon : "fa-file-lines";
}

const DETAIL_FONTS = {
  lexend: "Lexend, sans-serif",
  inter: "Inter, sans-serif",
  georgia: "Georgia, serif",
  arial: "Arial, sans-serif",
  times: '"Times New Roman", serif',
};

function cleanStyle(attrs) {
  const match = String(attrs || "").match(/style\s*=\s*(['"])([\s\S]*?)\1/i);
  if (!match) return "";
  const raw = match[2];
  const parts = [];
  const color = raw.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))/i);
  if (color) parts.push(`color: ${color[1]}`);
  const size = raw.match(/(?:^|;)\s*font-size\s*:\s*(\d{1,2})px/i);
  if (size) {
    const px = Math.min(48, Math.max(12, Number(size[1])));
    parts.push(`font-size: ${px}px`);
  }
  const family = raw.match(/(?:^|;)\s*font-family\s*:\s*([^;]+)/i);
  if (family) {
    const key = family[1].toLowerCase();
    const found = Object.keys(DETAIL_FONTS).find((name) => key.includes(name));
    if (found) parts.push(`font-family: ${DETAIL_FONTS[found]}`);
  }
  if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(raw)) parts.push("font-weight: 700");
  if (/font-style\s*:\s*italic/i.test(raw)) parts.push("font-style: italic");
  const align = raw.match(/(?:^|;)\s*text-align\s*:\s*(left|center|right|justify)/i);
  const alignAttr = String(attrs || "").match(/\salign\s*=\s*(['"]?)(left|center|right|justify)\1/i);
  if (align) parts.push(`text-align: ${align[1].toLowerCase()}`);
  else if (alignAttr) parts.push(`text-align: ${alignAttr[2].toLowerCase()}`);
  const background = raw.match(/(?:^|;)\s*background-color\s*:\s*(#[0-9a-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))/i);
  if (background) parts.push(`background-color: ${background[1]}`);
  return parts.join("; ");
}

function cleanDetailsHtml(value) {
  let html = String(value || "").slice(0, 20000);
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?\s*>/gi, "");
  html = html.replace(/\son\w+\s*=\s*(['"])[\s\S]*?\1/gi, "");
  html = html.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  html = html.replace(/javascript:/gi, "");
  const allowed = new Set(["p", "br", "div", "span", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3"]);
  const styled = new Set(["p", "div", "span", "li", "h2", "h3"]);
  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag, attrs) => {
    const name = tag.toLowerCase();
    if (!allowed.has(name)) return "";
    if (name === "br") return "<br>";
    if (full.startsWith("</")) return `</${name}>`;
    if (!styled.has(name)) return `<${name}>`;
    const style = cleanStyle(attrs);
    return style ? `<${name} style="${style}">` : `<${name}>`;
  });
  return html.trim();
}

function seedBoards(store) {
  let changed = false;
  if (!Array.isArray(store.notices)) {
    store.notices = [
      {
        id: "notice-admission",
        title: "Student Admission Form-Khadija (Ra) Academy",
        note: "",
        publishedAt: "2024-06-29",
        time: "8.00pm",
        icon: "fa-file-lines",
        link: "/doc/Admission_form.pdf",
        file: "",
        pinned: false,
        createdAt: "2024-06-29T12:00:00.000Z",
      },
      {
        id: "notice-open-day",
        title: "We are annouced about our Khadija (Ra) Academy Open Day",
        note: "",
        publishedAt: "2024-06-25",
        time: "10.00am",
        icon: "fa-bullhorn",
        link: "/doc/Khadija_(Ra)_Academy_Open_Day_Announcement.pdf",
        file: "",
        pinned: false,
        createdAt: "2024-06-25T04:00:00.000Z",
      },
    ];
    changed = true;
  }
  if (!Array.isArray(store.vacancies)) {
    store.vacancies = [];
    changed = true;
  }
  return changed;
}

function listFor(store, kind) {
  return kind === "vacancy" ? store.vacancies : store.notices;
}

function publicItem(kind, item) {
  const uploaded = item.file ? `/api/public/boards/${kind}/${item.id}/file` : "";
  return {
    id: item.id,
    title: item.title,
    note: item.note || "",
    publishedAt: item.publishedAt || "",
    time: item.time || "",
    icon: cleanIcon(item.icon),
    pinned: Boolean(item.pinned),
    fileUrl: item.link || uploaded,
    details: item.details || "",
  };
}

module.exports = {
  BOARD_KINDS,
  BOARD_ICONS,
  FILE_EXTS,
  cleanText,
  cleanIcon,
  cleanDetailsHtml,
  seedBoards,
  listFor,
  publicItem,
};
