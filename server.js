const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
require("./assets/js/nikah-nama.js");
const { normalizeNikah } = global.NikahNama;
const { fillNikahPdf } = require("./lib/nikah-pdf");
const {
  categoryKey,
  fieldsForCategory,
  sourceList,
  valueOf,
  recordLabel,
  cleanFields,
  fillTemplatePdf,
} = require("./lib/form-fill");
const {
  cleanFontFamily,
  isReservedFamily,
  customFamilies,
  publicFontList,
  isFontBytes,
  readFormFontBytes,
} = require("./lib/form-fonts");
const {
  SIGN_ROLES,
  mergeNikahForm,
  publicNikahForm,
  cleanLabel,
  cleanCertificatePrefix,
  cleanCertificateCode,
  cleanCertificateNo,
  cleanCertificateYear,
  formatCertificateNo,
  cleanCertificateNo,
} = require("./lib/nikah-form");

const app = express();
const PORT = process.env.PORT || 4000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
const CMS_FILE = path.join(DATA_DIR, "cms.json");
const SMS_OUTBOX_FILE = path.join(DATA_DIR, "sms-outbox.json");
const EMAIL_OUTBOX_FILE = path.join(DATA_DIR, "email-outbox.json");
const AVATAR_DIR = path.join(DATA_DIR, "avatars");
const SIGNATURE_DIR = path.join(DATA_DIR, "signatures");
const FORM_DIR = path.join(DATA_DIR, "form-templates");
const FONT_DIR = path.join(DATA_DIR, "fonts");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });
if (!fs.existsSync(SIGNATURE_DIR)) fs.mkdirSync(SIGNATURE_DIR, { recursive: true });
if (!fs.existsSync(FORM_DIR)) fs.mkdirSync(FORM_DIR, { recursive: true });
if (!fs.existsSync(FONT_DIR)) fs.mkdirSync(FONT_DIR, { recursive: true });

// Seed JSON data from repo defaults when the data disk/volume is empty.
for (const [target, seedName] of [
  [DATA_FILE, "store.json"],
  [CMS_FILE, "cms.json"],
]) {
  if (!fs.existsSync(target)) {
    const seed = path.join(ROOT, "data", seedName);
    if (fs.existsSync(seed)) fs.copyFileSync(seed, target);
  }
}

function loadEnvFile() {
  let text;
  try {
    text = fs.readFileSync(path.join(ROOT, ".env"), "utf8");
  } catch (_) {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

function normalizePin(pin) {
  return String(pin || "").replace(/\s+/g, "").trim();
}

function generateDownloadPin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function pickSmsMobile(marriage) {
  return (
    marriage.pinSmsMobile ||
    marriage.applicantMobile ||
    marriage.groomMobile ||
    marriage.brideMobile ||
    marriage.proposerMobile ||
    marriage.groomPhone ||
    marriage.bridePhone ||
    ""
  );
}

function pickApplicantEmail(marriage) {
  return marriage.pinEmailTo || marriage.applicantEmail || "";
}

function pickApplicantName(marriage) {
  return marriage.applicantName || marriage.groomName || marriage.brideName || "";
}

async function sendEmail(to, subject, text) {
  const email = String(to || "").trim();
  if (!email) throw new Error("Email required");
  if (!text) throw new Error("Message required");
  const mailSubject = String(subject || "Khadijatul Kubra Trust").trim();

  const webhook = process.env.EMAIL_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, subject: mailSubject, text }),
    });
    if (!res.ok) throw new Error("Email webhook failed");
    return { ok: true, mode: "webhook" };
  }

  // Resend API (optional)
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "noreply@khadijatulkubratrust.org";
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: mailSubject,
        text,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Resend email failed");
    return { ok: true, mode: "resend", sid: data.id || null };
  }

  let outbox = [];
  try {
    outbox = JSON.parse(fs.readFileSync(EMAIL_OUTBOX_FILE, "utf8"));
  } catch (_) {
    outbox = [];
  }
  if (!Array.isArray(outbox)) outbox = [];
  const entry = {
    id: uuidv4(),
    to: email,
    subject: mailSubject,
    text,
    createdAt: new Date().toISOString(),
  };
  outbox.unshift(entry);
  fs.writeFileSync(EMAIL_OUTBOX_FILE, JSON.stringify(outbox.slice(0, 200), null, 2));
  console.log("[Email outbox]", email, mailSubject);
  return { ok: true, mode: "outbox", id: entry.id };
}

function toInternationalMobile(mobile) {
  const compact = String(mobile || "").replace(/[\s()-]/g, "");
  if (compact.startsWith("+")) return `+${compact.slice(1).replace(/\D/g, "")}`;
  const digits = compact.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("880")) return `+${digits}`;
  if (/^01[3-9]\d{8}$/.test(digits)) return `+880${digits.slice(1)}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (/^44\d{10}$/.test(digits)) return `+${digits}`;
  return `+${digits}`;
}

async function sendBulkSms(mobile, message) {
  const tokenId = process.env.BULKSMS_TOKEN_ID;
  const tokenSecret = process.env.BULKSMS_TOKEN_SECRET;
  const sender = process.env.BULKSMS_SENDER_ID;
  if (!tokenId || !tokenSecret || !sender) return null;

  const auth = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");
  const res = await fetch("https://api.bulksms.com/v1/messages?auto-unicode=true", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: toInternationalMobile(mobile),
      body: message,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.title || "BulkSMS failed");
  }
  const first = Array.isArray(data) ? data[0] : data;
  if (first?.status?.type === "FAILED") {
    throw new Error(first.status.subtype || "BulkSMS rejected the message");
  }
  return { ok: true, mode: "bulksms", sid: first?.id || null };
}

async function sendSms(to, message) {
  const mobile = String(to || "").trim();
  if (!mobile) throw new Error("Mobile number required");
  if (!message) throw new Error("Message required");

  const bulk = await sendBulkSms(mobile, message);
  if (bulk) return bulk;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (accountSid && authToken && from) {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const body = new URLSearchParams({ To: mobile, From: from, Body: message });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error_message || "Twilio SMS failed");
    }
    return { ok: true, mode: "twilio", sid: data.sid || null };
  }

  const webhook = process.env.SMS_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: mobile, message }),
    });
    if (!res.ok) throw new Error("SMS webhook failed");
    return { ok: true, mode: "webhook" };
  }

  // Dev / no-provider fallback: keep a local outbox so the workflow still works
  let outbox = [];
  try {
    outbox = JSON.parse(fs.readFileSync(SMS_OUTBOX_FILE, "utf8"));
  } catch (_) {
    outbox = [];
  }
  if (!Array.isArray(outbox)) outbox = [];
  const entry = {
    id: uuidv4(),
    to: mobile,
    message,
    createdAt: new Date().toISOString(),
  };
  outbox.unshift(entry);
  fs.writeFileSync(SMS_OUTBOX_FILE, JSON.stringify(outbox.slice(0, 200), null, 2));
  console.log("[SMS outbox]", mobile, message);
  return { ok: true, mode: "outbox", id: entry.id };
}

function publicBaseUrl(req) {
  const host = req.get("x-forwarded-host") || req.get("host");
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${host}`;
}

function verifyUrlFor(req, marriage) {
  return `${publicBaseUrl(req)}/verify-portal.html?c=${encodeURIComponent(
    marriage.certificateNo
  )}`;
}

function emptySignatureSlot() {
  return {
    status: "none",
    token: uuidv4().replace(/-/g, ""),
    file: "",
    allowEdit: true,
    submittedAt: null,
    approvedAt: null,
  };
}

function ensureSignatureSlots(marriage) {
  const signatures = { ...(marriage.signatures || {}) };
  for (const role of SIGN_ROLES) {
    const current = signatures[role.key] || {};
    signatures[role.key] = {
      ...emptySignatureSlot(),
      ...current,
      token: current.token || uuidv4().replace(/-/g, ""),
      status: ["none", "pending", "approved"].includes(current.status)
        ? current.status
        : "none",
      allowEdit: current.status === "none" ? true : current.allowEdit === true,
    };
  }
  marriage.signatures = signatures;
  if (!marriage.signBundleToken) {
    marriage.signBundleToken = uuidv4().replace(/-/g, "");
  }
  return marriage;
}

function signaturePublicView(slot, role) {
  return {
    role: role.key,
    label: role.label,
    status: slot?.status || "none",
    submittedAt: slot?.submittedAt || null,
    approvedAt: slot?.approvedAt || null,
    allowEdit: slot?.status === "none" || slot?.allowEdit === true,
    locked: slot?.status !== "none" && slot?.allowEdit !== true && !!slot?.file,
  };
}

function decodeSignaturePng(value) {
  const match = String(value || "").match(/^data:image\/png;base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) return null;
  const bytes = Buffer.from(match[1].replace(/\s+/g, ""), "base64");
  if (bytes.length < 40 || bytes.length > 450000) return null;
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  return bytes;
}

function saveSignatureFile(marriageId, role, bytes) {
  const filename = `${marriageId}-${role}.png`;
  const file = path.join(SIGNATURE_DIR, filename);
  fs.writeFileSync(file, bytes);
  return file;
}

function canReplaceSignature(slot) {
  if (!slot || slot.status === "none" || !slot.file) return true;
  return slot.allowEdit === true;
}

function applySignatureUpload(marriage, role, dataUrl) {
  const known = SIGN_ROLES.some((item) => item.key === role);
  if (!known) return { error: "Unknown signature" };
  ensureSignatureSlots(marriage);
  const slot = marriage.signatures[role];
  if (!canReplaceSignature(slot)) {
    return { error: "This signature is already submitted and cannot be changed" };
  }
  const bytes = decodeSignaturePng(dataUrl);
  if (!bytes) return { error: "Signature image must be a PNG" };
  slot.file = saveSignatureFile(marriage.id, role, bytes);
  slot.status = "pending";
  slot.allowEdit = false;
  slot.submittedAt = new Date().toISOString();
  slot.approvedAt = null;
  return { ok: true };
}

function sanitizeExtraFields(body, form) {
  const custom = form.fields.filter((field) => field.kind === "custom");
  const source = body && typeof body === "object" ? body : {};
  const extra = {};
  custom.forEach((field) => {
    extra[field.key] = String(source[field.key] || "").trim().slice(0, 500);
  });
  return extra;
}

function missingRequiredFields(marriage, form) {
  const missing = [];
  form.fields.forEach((field) => {
    if (!field.required) return;
    const value =
      field.kind === "custom" ? marriage.extraFields?.[field.key] : marriage[field.key];
    if (!String(value || "").trim()) missing.push(field.label);
  });
  return missing;
}

function issueCertificateNo(store) {
  const current = mergeNikahForm(store.nikahForm);
  const next = Math.max(1, Number(current.certificateNext) || 1);
  const number = formatCertificateNo(current, next);
  store.nikahForm = {
    ...(store.nikahForm || {}),
    fields: current.fields,
    certificatePrefix: current.certificatePrefix,
    certificateCode: current.certificateCode,
    certificateYear: current.certificateYear,
    certificateNext: next + 1,
  };
  return number;
}

function findMarriageBySignToken(store, token) {
  const needle = String(token || "").trim();
  if (!needle) return null;
  for (const marriage of store.marriages) {
    if (marriage.signBundleToken === needle) {
      return { marriage, role: null };
    }
    const signatures = marriage.signatures || {};
    for (const role of SIGN_ROLES) {
      if (signatures[role.key]?.token === needle) {
        return { marriage, role: role.key };
      }
    }
  }
  return null;
}

function buildMarriage(body, existing = null, options = {}) {
  const fields = normalizeNikah(body || {});
  const now = new Date().toISOString();
  const source = existing?.source || body?.source || "admin";

  // Public applications always stay waiting until an admin changes status
  let status;
  if (options.forcePending || (source === "public" && !existing && !options.allowStatus)) {
    status = "pending";
  } else if (["pending", "approved", "rejected"].includes(fields.status)) {
    status = fields.status;
  } else {
    status = existing?.status || "pending";
  }

  let certificateNo = existing?.certificateNo || "";
  if (options.allowCertificateEdit) {
    const typed = cleanCertificateNo(body?.certificateNo);
    if (typed) certificateNo = typed;
  }

  const incomingPin = normalizePin(body?.downloadPin ?? fields.downloadPin);
  let downloadPin = existing?.downloadPin || "";
  if (incomingPin) downloadPin = incomingPin;
  if (status === "approved" && !downloadPin) {
    downloadPin = generateDownloadPin();
  }
  if (status !== "approved") {
    // Keep existing pin if re-pending? Clear on reject/pending for safety
    if (status === "rejected") downloadPin = existing?.downloadPin || downloadPin;
  }

  const record = {
    ...(existing || {}),
    ...fields,
    id: existing?.id || uuidv4(),
    certificateNo,
    status,
    source,
    notes: fields.notes || existing?.notes || "",
    downloadPin: status === "approved" ? downloadPin : existing?.downloadPin || downloadPin || "",
    applicantName: fields.applicantName || existing?.applicantName || "",
    applicantMobile: fields.applicantMobile || existing?.applicantMobile || "",
    applicantEmail: fields.applicantEmail || existing?.applicantEmail || "",
    pinSmsMobile: body?.pinSmsMobile || existing?.pinSmsMobile || "",
    pinSmsSentAt: existing?.pinSmsSentAt || null,
    pinEmailTo: body?.pinEmailTo || existing?.pinEmailTo || "",
    pinEmailSentAt: existing?.pinEmailSentAt || null,
    downloadToken: existing?.downloadToken || uuidv4(),
    verifyCode: existing?.verifyCode || uuidv4().replace(/-/g, "").slice(0, 12),
    extraFields: existing?.extraFields || {},
    signatures: existing?.signatures || {},
    signBundleToken: existing?.signBundleToken || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    approvedAt:
      status === "approved"
        ? existing?.approvedAt || now
        : status === "pending" || status === "rejected"
        ? null
        : existing?.approvedAt || null,
  };
  return ensureSignatureSlots(record);
}

async function sendFilledNikahPdf(req, res, marriage) {
  if (marriage.status !== "approved") {
    return res.status(403).json({ error: "PDF available only after admin approval" });
  }
  try {
    if (!marriage.verifyCode) {
      const store = readStore();
      const idx = store.marriages.findIndex((m) => m.id === marriage.id);
      if (idx >= 0) {
        store.marriages[idx].verifyCode = uuidv4().replace(/-/g, "").slice(0, 12);
        writeStore(store);
        marriage = store.marriages[idx];
      }
    }
    const verifyUrl = verifyUrlFor(req, marriage);
    const store = readStore();
    const template = (store.formTemplates || []).find(
      (item) =>
        item.active &&
        categoryKey(item.category) === "marriage" &&
        Array.isArray(item.fields) &&
        item.fields.length > 0 &&
        fs.existsSync(formPdfPath(item.id))
    );
    const pdf = template
      ? await buildFilledForm("Marriage", marriage.id, { qr: verifyUrl }, template.id)
      : await fillNikahPdf(marriage, verifyUrl);
    const filename = `${marriage.certificateNo || "Nikah-Nama"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${req.query.inline === "1" ? "inline" : "attachment"}; filename="${filename}"`
    );
    res.send(pdf);
  } catch (err) {
    console.error("Nikah PDF error:", err);
    res.status(500).json({ error: "Could not generate Nikah Nama PDF" });
  }
}

function readStore() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function readCms() {
  return JSON.parse(fs.readFileSync(CMS_FILE, "utf8"));
}

function writeCms(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(CMS_FILE, JSON.stringify(data, null, 2));
}

app.set("trust proxy", 1);
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "kkt-portal-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

const ACCESS_MODULES = [
  { key: "dashboard", label: "Dashboard", actions: [{ key: "view", label: "View" }] },
  {
    key: "students",
    label: "Students",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add" },
      { key: "update", label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "donations",
    label: "Donations",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "collections",
    label: "Collection Hisab",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "prayer",
    label: "Prayer Times",
    actions: [
      { key: "view", label: "View" },
      { key: "update", label: "Edit" },
    ],
  },
  {
    key: "marriage",
    label: "Marriage",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Add" },
      { key: "update", label: "Edit" },
      { key: "approve", label: "Approve" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "content",
    label: "Website Builder",
    actions: [
      { key: "view", label: "View" },
      { key: "update", label: "Edit" },
    ],
  },
  {
    key: "users",
    label: "Users & Access",
    actions: [{ key: "manage", label: "Add users & set access" }],
  },
];

function fullPermissions() {
  const permissions = {};
  for (const mod of ACCESS_MODULES) {
    permissions[mod.key] = mod.actions.map((action) => action.key);
  }
  return permissions;
}

function normalizePermissions(input) {
  const permissions = {};
  for (const mod of ACCESS_MODULES) {
    const allowed = new Set(mod.actions.map((action) => action.key));
    const given = Array.isArray(input?.[mod.key]) ? input[mod.key] : [];
    permissions[mod.key] = [...new Set(given.map(String).filter((action) => allowed.has(action)))];
  }
  return permissions;
}

function permissionsFor(user) {
  if (user?.role === "admin") return fullPermissions();
  return normalizePermissions(user?.permissions);
}

function accessSummary(user) {
  const role = user.role === "admin" ? "admin" : "staff";
  if (role === "admin") return "Full access";
  const permissions = permissionsFor({ ...user, role });
  const parts = ACCESS_MODULES.filter((mod) => (permissions[mod.key] || []).length).map((mod) => {
    const actions = permissions[mod.key];
    return `${mod.label}: ${actions.join(", ")}`;
  });
  return parts.length ? parts.join(" · ") : "No access set";
}

function publicUser(user) {
  const role = user.role === "admin" ? "admin" : "staff";
  return {
    id: user.id,
    username: user.username,
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
    gender: user.gender || "",
    address: user.address || "",
    notes: user.notes || "",
    photo: user.photo || "",
    role,
    permissions: permissionsFor({ ...user, role }),
    accessLabel: accessSummary(user),
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

function cleanText(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function normalizePhotoInput(photo, userId, existing = "") {
  if (photo === "") return "";
  if (photo == null) return existing;
  const value = String(photo).trim();
  if (!value) return existing;
  if (value.startsWith("/uploads/avatars/") && !value.includes("..")) return value;
  const match = value.match(/^data:(image\/(jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) throw new Error("Photo must be a JPG, PNG or WebP image");
  const ext = match[2].toLowerCase() === "jpg" ? "jpeg" : match[2].toLowerCase();
  const buffer = Buffer.from(match[3].replace(/\s/g, ""), "base64");
  if (buffer.length > 900 * 1024) throw new Error("Photo must be under 900KB");
  const fileName = `${userId}.${ext === "jpeg" ? "jpg" : ext}`;
  fs.writeFileSync(path.join(AVATAR_DIR, fileName), buffer);
  if (existing && existing.startsWith("/uploads/avatars/")) {
    const oldName = path.basename(existing);
    if (oldName !== fileName) {
      try {
        fs.unlinkSync(path.join(AVATAR_DIR, oldName));
      } catch (_) {}
    }
  }
  return `/uploads/avatars/${fileName}`;
}

function personFieldsFromBody(body, userId, existing = {}) {
  let photo = existing.photo || "";
  try {
    photo = normalizePhotoInput(body.photo, userId, existing.photo || "");
  } catch (err) {
    const error = new Error(err.message || "Invalid photo");
    error.status = 400;
    throw error;
  }
  return {
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 160),
    mobile: cleanText(body.mobile, 40),
    phone: cleanText(body.phone, 40),
    dateOfBirth: cleanText(body.dateOfBirth, 20),
    gender: cleanText(body.gender, 20),
    address: cleanText(body.address, 400),
    notes: cleanText(body.notes, 500),
    photo,
  };
}

function canDo(user, moduleKey, action) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return (user.permissions?.[moduleKey] || []).includes(action);
}

function loadSessionUser(req) {
  if (!req.session?.user?.id) return null;
  const fresh = readStore().users.find((user) => user.id === req.session.user.id);
  if (!fresh) {
    req.session.user = null;
    return null;
  }
  req.session.user = publicUser(fresh);
  return req.session.user;
}

function requireAuth(req, res, next) {
  if (loadSessionUser(req)) return next();
  if (String(req.originalUrl || "").startsWith("/api/")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.redirect("/portal/login.html");
}

function requirePerm(moduleKey, action) {
  return (req, res, next) => {
    const user = loadSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!canDo(user, moduleKey, action)) {
      return res.status(403).json({ error: "You do not have permission for this action" });
    }
    next();
  };
}

function requireAny(checks) {
  return (req, res, next) => {
    const user = loadSessionUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (checks.some(([moduleKey, action]) => canDo(user, moduleKey, action))) return next();
    return res.status(403).json({ error: "You do not have permission for this action" });
  };
}

function cleanUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-z0-9._-]{3,32}$/.test(username);
}

app.post("/api/login", (req, res) => {
  const username = cleanUsername(req.body?.username);
  const password = String(req.body?.password || "");
  const store = readStore();
  const user = store.users.find(
    (u) => u.username.toLowerCase() === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  req.session.user = publicUser(user);
  res.json({ ok: true, user: req.session.user });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get("/api/me", (req, res) => {
  const user = loadSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user, accessCatalog: ACCESS_MODULES });
});

app.put("/api/me", requireAuth, (req, res) => {
  const store = readStore();
  const idx = store.users.findIndex((user) => user.id === req.session.user.id);
  if (idx < 0) return res.status(401).json({ error: "Unauthorized" });
  const current = store.users[idx];
  const username = cleanUsername(req.body.username);
  const newPassword = String(req.body.newPassword || "");
  const currentPassword = String(req.body.currentPassword || "");
  let person;
  try {
    person = personFieldsFromBody(req.body, current.id, current);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
  if (!person.name) return res.status(400).json({ error: "Name is required" });
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "Username must be 3–32 letters, numbers, . _ or -" });
  }
  if (store.users.some((user) => user.id !== current.id && user.username.toLowerCase() === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  if (newPassword) {
    if (newPassword.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters" });
    }
    if (currentPassword !== current.password) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
  }
  store.users[idx] = {
    ...current,
    ...person,
    username,
    password: newPassword || current.password,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  req.session.user = publicUser(store.users[idx]);
  res.json({ user: req.session.user });
});

function otherAdminCount(users, exceptId) {
  return users.filter((user) => user.role === "admin" && user.id !== exceptId).length;
}

app.get("/api/users", requirePerm("users", "manage"), (req, res) => {
  res.json(readStore().users.map(publicUser));
});

app.post("/api/users", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const id = uuidv4();
  const username = cleanUsername(req.body.username);
  const password = String(req.body.password || "");
  const role = req.body.role === "admin" ? "admin" : "staff";
  let person;
  try {
    person = personFieldsFromBody(req.body, id, {});
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
  if (!person.name) return res.status(400).json({ error: "Name is required" });
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "Username must be 3–32 letters, numbers, . _ or -" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }
  if (store.users.some((user) => user.username.toLowerCase() === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  const now = new Date().toISOString();
  const user = {
    id,
    username,
    password,
    role,
    ...person,
    permissions:
      role === "admin"
        ? fullPermissions()
        : normalizePermissions(req.body.permissions || { dashboard: ["view"] }),
    createdAt: now,
    updatedAt: now,
  };
  store.users.push(user);
  writeStore(store);
  res.json(publicUser(user));
});

app.put("/api/users/:id", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const idx = store.users.findIndex((user) => user.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "User not found" });
  const current = store.users[idx];
  const username = cleanUsername(req.body.username ?? current.username);
  const password = String(req.body.password || "");
  const roleChanging = Object.prototype.hasOwnProperty.call(req.body || {}, "role");
  const permsChanging = Object.prototype.hasOwnProperty.call(req.body || {}, "permissions");
  const role = roleChanging
    ? req.body.role === "admin"
      ? "admin"
      : "staff"
    : current.role === "admin"
      ? "admin"
      : "staff";
  let person;
  try {
    person = personFieldsFromBody(
      {
        ...current,
        ...req.body,
        photo: Object.prototype.hasOwnProperty.call(req.body || {}, "photo")
          ? req.body.photo
          : undefined,
      },
      current.id,
      current
    );
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }
  if (!person.name) return res.status(400).json({ error: "Name is required" });
  if (!isValidUsername(username)) {
    return res.status(400).json({ error: "Username must be 3–32 letters, numbers, . _ or -" });
  }
  if (password && password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }
  if (store.users.some((user) => user.id !== current.id && user.username.toLowerCase() === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  if (current.role === "admin" && role !== "admin" && otherAdminCount(store.users, current.id) === 0) {
    return res.status(400).json({ error: "Keep at least one admin" });
  }
  let permissions = current.permissions;
  if (role === "admin") permissions = fullPermissions();
  else if (roleChanging || permsChanging) {
    permissions = normalizePermissions(req.body.permissions ?? current.permissions);
  }
  store.users[idx] = {
    ...current,
    ...person,
    username,
    role,
    password: password || current.password,
    permissions,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  if (req.session.user.id === current.id) req.session.user = publicUser(store.users[idx]);
  res.json(publicUser(store.users[idx]));
});

app.delete("/api/users/:id", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const target = store.users.find((user) => user.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target.id === req.session.user.id) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }
  if (target.role === "admin" && otherAdminCount(store.users, target.id) === 0) {
    return res.status(400).json({ error: "Keep at least one admin" });
  }
  if (target.photo && target.photo.startsWith("/uploads/avatars/")) {
    try {
      fs.unlinkSync(path.join(AVATAR_DIR, path.basename(target.photo)));
    } catch (_) {}
  }
  store.users = store.users.filter((user) => user.id !== target.id);
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/dashboard", requirePerm("dashboard", "view"), (req, res) => {
  const store = readStore();
  const donationTotal = store.donations.reduce(
    (sum, d) => sum + Number(d.amount || 0),
    0
  );
  const collectionTotal = store.collections.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0
  );
  res.json({
    students: store.students.length,
    donations: store.donations.length,
    donationTotal,
    collectionTotal,
    marriages: store.marriages.length,
    pendingMarriages: store.marriages.filter((m) => m.status === "pending")
      .length,
    prayerTimes: store.prayerTimes,
  });
});

app.get("/api/students", requirePerm("students", "view"), (req, res) => {
  res.json(readStore().students);
});

app.post("/api/students", requirePerm("students", "create"), (req, res) => {
  const store = readStore();
  const student = {
    id: uuidv4(),
    name: req.body.name || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    course: req.body.course || "",
    gender: req.body.gender || "",
    status: req.body.status || "active",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };
  store.students.unshift(student);
  writeStore(store);
  res.json(student);
});

app.put("/api/students/:id", requirePerm("students", "update"), (req, res) => {
  const store = readStore();
  const idx = store.students.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  store.students[idx] = {
    ...store.students[idx],
    ...req.body,
    id: store.students[idx].id,
  };
  writeStore(store);
  res.json(store.students[idx]);
});

app.delete("/api/students/:id", requirePerm("students", "delete"), (req, res) => {
  const store = readStore();
  store.students = store.students.filter((s) => s.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/donations", requirePerm("donations", "view"), (req, res) => {
  res.json(readStore().donations);
});

function buildDonation(body, source) {
  const amount = Number(body.amount || 0);
  return {
    id: uuidv4(),
    donorName: String(body.donorName || "").trim(),
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    amount: Number.isFinite(amount) ? amount : 0,
    method: String(body.method || "cash").trim() || "cash",
    purpose: String(body.purpose || "General").trim() || "General",
    receiptNo: String(body.receiptNo || "").trim() || `DON-${Date.now()}`,
    date: String(body.date || "").trim() || new Date().toISOString().slice(0, 10),
    notes: String(body.notes || "").trim(),
    source: source || String(body.source || "portal").trim() || "portal",
    createdAt: new Date().toISOString(),
  };
}

function maskDonorName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "Anonymous";
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length <= 2) return word;
    return `${word.slice(0, 1)}${"*".repeat(Math.min(3, word.length - 1))}`;
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].slice(0, 1).toUpperCase();
  return `${first} ${lastInitial}.`;
}

function publicDonationView(donation) {
  return {
    id: donation.id,
    donorName: maskDonorName(donation.donorName),
    amount: Number(donation.amount || 0),
    method: donation.method || "",
    purpose: donation.purpose || "General",
    date: donation.date || "",
    source: donation.source || "portal",
  };
}

app.post("/api/donations", requirePerm("donations", "create"), (req, res) => {
  const store = readStore();
  const donation = buildDonation(req.body, req.body.source || "portal");
  store.donations.unshift(donation);
  writeStore(store);
  res.json(donation);
});

app.delete("/api/donations/:id", requirePerm("donations", "delete"), (req, res) => {
  const store = readStore();
  store.donations = store.donations.filter((d) => d.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/collections", requirePerm("collections", "view"), (req, res) => {
  res.json(readStore().collections);
});

app.post("/api/collections", requirePerm("collections", "create"), (req, res) => {
  const store = readStore();
  const entry = {
    id: uuidv4(),
    title: req.body.title || "",
    amount: Number(req.body.amount || 0),
    type: req.body.type || "income",
    category: req.body.category || "Donation collection",
    date: req.body.date || new Date().toISOString().slice(0, 10),
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };
  store.collections.unshift(entry);
  writeStore(store);
  res.json(entry);
});

app.delete("/api/collections/:id", requirePerm("collections", "delete"), (req, res) => {
  const store = readStore();
  store.collections = store.collections.filter((c) => c.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
});

/* Public donation feed + notify form (safe fields only; syncs into portal store) */
app.get("/api/public/donations", (req, res) => {
  const store = readStore();
  const donations = Array.isArray(store.donations) ? store.donations : [];
  const collections = Array.isArray(store.collections) ? store.collections : [];

  const donationTotal = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const collectionIncome = collections
    .filter((c) => String(c.type || "").toLowerCase() === "income")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const collectionExpense = collections
    .filter((c) => String(c.type || "").toLowerCase() === "expense")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const recent = donations.slice(0, limit).map(publicDonationView);

  res.json({
    summary: {
      donationTotal,
      donationCount: donations.length,
      collectionIncome,
      collectionExpense,
      collectionNet: collectionIncome - collectionExpense,
      combinedRaised: donationTotal + collectionIncome,
    },
    recent,
  });
});

app.post("/api/public/donations", (req, res) => {
  const donorName = String(req.body.donorName || "").trim();
  const amount = Number(req.body.amount || 0);
  if (!donorName) return res.status(400).json({ error: "Donor name is required" });
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "A valid donation amount is required" });
  }

  const allowedMethods = new Set(["cash", "bank", "card", "online", "paypal", "sumup", "stripe", "launchgood"]);
  const methodRaw = String(req.body.method || "bank").trim().toLowerCase();
  const method = allowedMethods.has(methodRaw) ? methodRaw : "bank";

  const store = readStore();
  const donation = buildDonation(
    {
      ...req.body,
      donorName,
      amount,
      method,
      purpose: req.body.purpose || "General",
    },
    "website"
  );
  store.donations.unshift(donation);
  writeStore(store);
  res.json({ ok: true, donation: publicDonationView(donation) });
});

app.get("/api/prayer-times", (req, res) => {
  res.json(readStore().prayerTimes);
});

app.put("/api/prayer-times", requirePerm("prayer", "update"), (req, res) => {
  const store = readStore();
  store.prayerTimes = {
    ...store.prayerTimes,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  res.json(store.prayerTimes);
});

app.get("/api/public/nikah-form", (req, res) => {
  res.json(publicNikahForm(readStore().nikahForm));
});

app.put("/api/nikah-form", requirePerm("marriage", "update"), (req, res) => {
  const store = readStore();
  const incoming = Array.isArray(req.body?.fields) ? req.body.fields : [];
  const custom = [];
  incoming
    .filter((field) => field && field.kind === "custom")
    .slice(0, 12)
    .forEach((field) => {
      const label = cleanLabel(field.label);
      if (!label) return;
      const key = /^c[a-z0-9]{6,12}$/.test(String(field.key || ""))
        ? String(field.key)
        : `c${uuidv4().replace(/-/g, "").slice(0, 8)}`;
      custom.push({
        key,
        kind: "custom",
        label,
        input: field.input === "textarea" ? "textarea" : "text",
        required: !!field.required,
      });
    });
  const merged = mergeNikahForm({
    fields: incoming.filter((field) => field && field.kind !== "custom").concat(custom),
    certificatePrefix: req.body?.certificatePrefix,
    certificateNext: store.nikahForm?.certificateNext,
  });
  store.nikahForm = {
    ...(store.nikahForm || {}),
    fields: merged.fields,
    certificatePrefix: cleanCertificatePrefix(
      req.body?.certificatePrefix ?? store.nikahForm?.certificatePrefix
    ),
    certificateCode: cleanCertificateCode(
      req.body?.certificateCode ?? store.nikahForm?.certificateCode
    ),
    certificateYear: cleanCertificateYear(
      req.body?.certificateYear ?? store.nikahForm?.certificateYear
    ),
    certificateNext: Math.max(1, Number(store.nikahForm?.certificateNext) || 1),
  };
  writeStore(store);
  res.json(publicNikahForm(store.nikahForm));
});

/* Public Nikah Nama application – waiting until admin approves */
app.post("/api/public/marriages", (req, res) => {
  const store = readStore();
  const form = mergeNikahForm(store.nikahForm);
  const marriage = buildMarriage(
    { ...req.body, source: "public" },
    null,
    { forcePending: true }
  );
  marriage.extraFields = sanitizeExtraFields(req.body?.extraFields, form);
  const missing = missingRequiredFields(marriage, form);
  if (missing.length) {
    return res.status(400).json({
      error: `Required: ${missing.join(", ")}`,
    });
  }
  const signatures = req.body?.signatures && typeof req.body.signatures === "object"
    ? req.body.signatures
    : {};
  for (const role of SIGN_ROLES) {
    if (role.key === "certifier") continue;
    const image = signatures[role.key];
    if (!image) continue;
    const saved = applySignatureUpload(marriage, role.key, image);
    if (saved.error) return res.status(400).json({ error: saved.error });
  }
  if (!marriage.certificateNo) marriage.certificateNo = issueCertificateNo(store);
  store.marriages.unshift(marriage);
  writeStore(store);
  res.json({
    ok: true,
    id: marriage.id,
    certificateNo: marriage.certificateNo,
    status: "pending",
    trackUrl: `/track-nikah.html?c=${encodeURIComponent(marriage.certificateNo)}`,
    message: "Submitted. Waiting for admin approval. Signatures appear on the certificate only after admin approval.",
  });
});

app.get("/api/public/sign/:token", (req, res) => {
  const found = findMarriageBySignToken(readStore(), req.params.token);
  if (!found) return res.status(404).json({ error: "Signature link not found" });
  const roles = SIGN_ROLES.filter((role) => {
    if (!found.role && role.key === "certifier") return false;
    return !found.role || role.key === found.role;
  }).map((role) => signaturePublicView(found.marriage.signatures?.[role.key], role));
  res.json({
    certificateNo: found.marriage.certificateNo,
    groomName: found.marriage.groomName,
    brideName: found.marriage.brideName,
    shared: !found.role,
    roles,
  });
});

app.post("/api/public/sign/:token", (req, res) => {
  const store = readStore();
  const found = findMarriageBySignToken(store, req.params.token);
  if (!found) return res.status(404).json({ error: "Signature link not found" });
  const role = found.role || String(req.body?.role || "");
  if (role === "certifier") {
    return res.status(403).json({ error: "Certifier signature is added by the office" });
  }
  if (found.role && role !== found.role) {
    return res.status(403).json({ error: "This link is for one signature only" });
  }
  const saved = applySignatureUpload(found.marriage, role, req.body?.image);
  if (saved.error) return res.status(400).json({ error: saved.error });
  const idx = store.marriages.findIndex((item) => item.id === found.marriage.id);
  store.marriages[idx] = found.marriage;
  writeStore(store);
  res.json({
    ok: true,
    message: "Signature submitted. It will be added to the certificate after admin approval.",
  });
});

app.get("/api/public/marriages/track", (req, res) => {
  const c = String(req.query.c || "").trim();
  if (!c) return res.status(400).json({ error: "Certificate No required" });
  const marriage = readStore().marriages.find((m) => m.certificateNo === c);
  if (!marriage) return res.status(404).json({ error: "Application not found" });
  const isApproved = marriage.status === "approved";
  res.json({
    certificateNo: marriage.certificateNo,
    status: marriage.status,
    createdAt: marriage.createdAt,
    approvedAt: marriage.approvedAt || null,
    canDownload: isApproved && !!normalizePin(marriage.downloadPin),
  });
});

/* Public PDF download – requires certificate no + admin PIN (no personal data) */
app.post("/api/public/marriages/download-pdf", async (req, res) => {
  const c = String(req.body?.certificateNo || req.query.c || "").trim();
  const pin = normalizePin(req.body?.pin || req.query.pin);
  if (!c) return res.status(400).json({ error: "Certificate No required" });
  if (!pin) return res.status(400).json({ error: "PIN required" });
  const marriage = readStore().marriages.find((m) => m.certificateNo === c);
  if (!marriage) return res.status(404).json({ error: "Application not found" });
  if (marriage.status !== "approved") {
    return res.status(403).json({ error: "PDF available only after approval" });
  }
  if (!marriage.downloadPin || normalizePin(marriage.downloadPin) !== pin) {
    return res.status(403).json({ error: "Invalid PIN" });
  }
  return sendFilledNikahPdf(req, res, marriage);
});

app.get("/api/public/marriages/verify", (req, res) => {
  const c = String(req.query.c || "").trim();
  if (!c) return res.status(400).json({ error: "Certificate No required" });
  const marriage = readStore().marriages.find((m) => m.certificateNo === c);
  if (!marriage) return res.status(404).json({ error: "Certificate not found" });
  const marriageDate = [marriage.marriageDay, marriage.marriageMonth, marriage.marriageYear]
    .filter(Boolean)
    .join("/") || marriage.weddingDate || "";
  if (marriage.status !== "approved") {
    return res.json({
      certificateNo: marriage.certificateNo,
      status: marriage.status,
      verified: false,
      message:
        marriage.status === "pending"
          ? "Certificate is waiting for approval"
          : "Certificate is not approved",
    });
  }
  res.json({
    verified: true,
    certificateNo: marriage.certificateNo,
    status: marriage.status,
    groomName: marriage.groomName,
    brideName: marriage.brideName,
    marriageDate,
    placeOfMarriage: marriage.placeOfMarriage || marriage.venue || "",
    approvedAt: marriage.approvedAt,
    message: "Valid approved Nikah Nama certificate",
  });
});

app.get("/api/public/marriages/:id/pdf", async (req, res) => {
  const marriage = readStore().marriages.find((m) => m.id === req.params.id);
  if (!marriage) return res.status(404).json({ error: "Not found" });
  const pin = normalizePin(req.query.pin);
  if (!pin || !marriage.downloadPin || normalizePin(marriage.downloadPin) !== pin) {
    return res.status(403).json({ error: "Invalid PIN" });
  }
  return sendFilledNikahPdf(req, res, marriage);
});

app.get("/api/public/marriages/:id/certificate", (req, res) => {
  return res.status(403).json({ error: "Use track page status + PIN download" });
});

app.post("/api/marriages/:id/signatures/:role/approve", requirePerm("marriage", "approve"), (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((item) => item.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const marriage = ensureSignatureSlots(store.marriages[idx]);
  const slot = marriage.signatures[req.params.role];
  if (!slot) return res.status(404).json({ error: "Unknown signature" });
  if (slot.status !== "pending" || !slot.file) {
    return res.status(400).json({ error: "No submitted signature to approve" });
  }
  slot.status = "approved";
  slot.allowEdit = false;
  slot.approvedAt = new Date().toISOString();
  store.marriages[idx] = marriage;
  writeStore(store);
  res.json({ ok: true, signature: signaturePublicView(slot, SIGN_ROLES.find((role) => role.key === req.params.role)) });
});

app.post("/api/marriages/:id/signatures/:role/upload", requirePerm("marriage", "update"), (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((item) => item.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  if (req.params.role === "certifier") {
    return res.status(400).json({ error: "Choose a saved certifier when you approve" });
  }
  const known = SIGN_ROLES.some((role) => role.key === req.params.role);
  if (!known) return res.status(404).json({ error: "Unknown signature" });
  const bytes = decodeSignaturePng(req.body?.image);
  if (!bytes) return res.status(400).json({ error: "Draw or upload a signature first" });
  const marriage = ensureSignatureSlots(store.marriages[idx]);
  const slot = marriage.signatures[req.params.role];
  slot.file = saveSignatureFile(marriage.id, req.params.role, bytes);
  slot.status = "pending";
  slot.allowEdit = false;
  slot.submittedAt = new Date().toISOString();
  slot.approvedAt = null;
  store.marriages[idx] = marriage;
  writeStore(store);
  res.json({ ok: true, message: "Signature uploaded. Approve it to place it on the certificate." });
});

app.post("/api/marriages/:id/signatures/:role/allow-edit", requirePerm("marriage", "update"), (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((item) => item.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const marriage = ensureSignatureSlots(store.marriages[idx]);
  const slot = marriage.signatures[req.params.role];
  if (!slot) return res.status(404).json({ error: "Unknown signature" });
  slot.allowEdit = true;
  store.marriages[idx] = marriage;
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/marriages/:id/signatures/:role/image", requirePerm("marriage", "view"), (req, res) => {
  const marriage = readStore().marriages.find((item) => item.id === req.params.id);
  const file = marriage?.signatures?.[req.params.role]?.file;
  if (!file || !fs.existsSync(file)) return res.status(404).json({ error: "No signature image" });
  res.sendFile(file);
});

app.post("/api/marriages/:id/send-signature-links", requirePerm("marriage", "update"), async (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((item) => item.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const marriage = ensureSignatureSlots(store.marriages[idx]);
  const mode = req.body?.mode === "one" ? "one" : "each";
  const channel = String(req.body?.channel || "sms").toLowerCase() === "email" ? "email" : "sms";
  const base = publicBaseUrl(req);
  const sent = [];

  try {
    if (mode === "one") {
      const to = channel === "email" ? String(req.body?.email || "").trim() : String(req.body?.mobile || "").trim();
      if (!to) return res.status(400).json({ error: channel === "email" ? "Email required" : "Mobile number required" });
      const link = `${base}/sign-nikah.html?t=${encodeURIComponent(marriage.signBundleToken)}`;
      const message =
        `Khadijatul Kubra Trust: sign Nikah Nama ${marriage.certificateNo}. ` +
        `Open this link and choose your signature: ${link}`;
      if (channel === "email") {
        await sendEmail(to, `Nikah signature · ${marriage.certificateNo}`, message);
      } else {
        await sendSms(to, message);
      }
      sent.push({ mode: "one", to });
    } else {
      const recipients = Array.isArray(req.body?.recipients) ? req.body.recipients : [];
      for (const role of SIGN_ROLES) {
        if (role.key === "certifier") continue;
        const row = recipients.find((item) => item.role === role.key) || {};
        const to = channel === "email" ? String(row.email || "").trim() : String(row.mobile || "").trim();
        if (!to) continue;
        const link = `${base}/sign-nikah.html?t=${encodeURIComponent(marriage.signatures[role.key].token)}`;
        const message =
          `Khadijatul Kubra Trust: ${role.label} signature for Nikah Nama ${marriage.certificateNo}. ${link}`;
        if (channel === "email") {
          await sendEmail(to, `${role.label} signature · ${marriage.certificateNo}`, message);
        } else {
          await sendSms(to, message);
        }
        sent.push({ role: role.key, to });
      }
      if (!sent.length) {
        return res.status(400).json({ error: "Enter at least one mobile or email" });
      }
    }
  } catch (err) {
    console.error("Signature link send error:", err);
    return res.status(502).json({ error: err.message || "Could not send signature link" });
  }

  marriage.signatureLinksSentAt = new Date().toISOString();
  store.marriages[idx] = marriage;
  writeStore(store);
  res.json({ ok: true, sent, message: "Signature link sent" });
});

app.post("/api/marriages/:id/send-pin", requirePerm("marriage", "approve"), async (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const marriage = store.marriages[idx];
  if (marriage.status !== "approved") {
    return res.status(400).json({ error: "Approve the application before sending PIN" });
  }
  if (!normalizePin(marriage.downloadPin)) {
    return res.status(400).json({ error: "Set a download PIN before sending" });
  }

  const channel = String(req.body?.channel || "sms").toLowerCase() === "email" ? "email" : "sms";
  const name = String(req.body?.name || pickApplicantName(marriage)).trim();
  const mobile = String(req.body?.mobile || pickSmsMobile(marriage)).trim();
  const email = String(req.body?.email || pickApplicantEmail(marriage)).trim();

  const trackUrl = `${publicBaseUrl(req)}/track-nikah.html?c=${encodeURIComponent(
    marriage.certificateNo
  )}`;
  const greeting = name ? `Dear ${name}, ` : "";
  const defaultMsg =
    `${greeting}Khadijatul Kubra Trust: Nikah Nama ${marriage.certificateNo} approved. ` +
    `Download PIN: ${marriage.downloadPin}. Track: ${trackUrl}`;
  const message = String(req.body?.message || "").trim() || defaultMsg;

  try {
    if (channel === "email") {
      if (!email) return res.status(400).json({ error: "Email required" });
      const result = await sendEmail(
        email,
        `Nikah Nama PIN · ${marriage.certificateNo}`,
        message
      );
      store.marriages[idx] = {
        ...marriage,
        applicantName: name || marriage.applicantName || "",
        applicantEmail: email,
        pinEmailTo: email,
        pinEmailSentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeStore(store);
      return res.json({
        ok: true,
        channel: "email",
        email,
        name,
        mode: result.mode,
        pin: marriage.downloadPin,
        message:
          result.mode === "outbox"
            ? "PIN email saved to local outbox (set RESEND_API_KEY or EMAIL_WEBHOOK_URL for live email)"
            : "PIN email sent",
      });
    }

    if (!mobile) return res.status(400).json({ error: "Mobile number required" });
    const result = await sendSms(mobile, message);
    store.marriages[idx] = {
      ...marriage,
      applicantName: name || marriage.applicantName || "",
      applicantMobile: mobile,
      pinSmsMobile: mobile,
      pinSmsSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    res.json({
      ok: true,
      channel: "sms",
      mobile,
      name,
      mode: result.mode,
      pin: marriage.downloadPin,
      message:
        result.mode === "outbox"
          ? "PIN SMS saved to local outbox (set BULKSMS_* in .env for live SMS)"
          : "PIN SMS sent",
    });
  } catch (err) {
    console.error("PIN send error:", err);
    res.status(502).json({ error: err.message || "Could not send PIN" });
  }
});

function applySavedCertifier(marriage, store, certifierId) {
  const saved = (store.certifierSigns || []).find((item) => item.id === certifierId);
  if (!saved || !saved.file || !fs.existsSync(saved.file)) {
    return { error: "Saved certifier signature not found" };
  }
  ensureSignatureSlots(marriage);
  const dest = path.join(SIGNATURE_DIR, `${marriage.id}-certifier.png`);
  fs.copyFileSync(saved.file, dest);
  const slot = marriage.signatures.certifier;
  slot.file = dest;
  slot.status = "approved";
  slot.allowEdit = false;
  slot.submittedAt = slot.submittedAt || new Date().toISOString();
  slot.approvedAt = new Date().toISOString();
  marriage.certifierName = saved.name;
  return { ok: true };
}

function certifierSignView(item) {
  return { id: item.id, name: item.name };
}

app.get("/api/certifier-signs", requirePerm("marriage", "view"), (req, res) => {
  res.json((readStore().certifierSigns || []).map(certifierSignView));
});

app.get("/api/certifier-signs/:id/image", requirePerm("marriage", "view"), (req, res) => {
  const item = (readStore().certifierSigns || []).find((sign) => sign.id === req.params.id);
  if (!item?.file || !fs.existsSync(item.file)) return res.status(404).json({ error: "No signature" });
  res.sendFile(item.file);
});

app.post("/api/certifier-signs", requirePerm("marriage", "update"), (req, res) => {
  const name = cleanLabel(req.body?.name);
  if (!name) return res.status(400).json({ error: "Name required" });
  const bytes = decodeSignaturePng(req.body?.image);
  if (!bytes) return res.status(400).json({ error: "Draw or upload a signature first" });
  const store = readStore();
  const id = uuidv4();
  const file = path.join(SIGNATURE_DIR, `certifier-${id}.png`);
  fs.writeFileSync(file, bytes);
  const item = { id, name, file, createdAt: new Date().toISOString() };
  store.certifierSigns = [...(store.certifierSigns || []), item];
  writeStore(store);
  res.json(certifierSignView(item));
});

app.delete("/api/certifier-signs/:id", requirePerm("marriage", "update"), (req, res) => {
  const store = readStore();
  const item = (store.certifierSigns || []).find((sign) => sign.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  if (item.file && fs.existsSync(item.file)) fs.unlinkSync(item.file);
  store.certifierSigns = store.certifierSigns.filter((sign) => sign.id !== item.id);
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/marriages", requirePerm("marriage", "view"), (req, res) => {
  res.json(readStore().marriages);
});

app.get("/api/marriages/:id", requirePerm("marriage", "view"), (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((item) => item.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const current = store.marriages[idx];
  const hadLinks =
    current.signBundleToken &&
    SIGN_ROLES.every((role) => current.signatures?.[role.key]?.token);
  const marriage = ensureSignatureSlots(current);
  if (!hadLinks) {
    store.marriages[idx] = marriage;
    writeStore(store);
  }
  res.json(marriage);
});

app.post("/api/marriages", requirePerm("marriage", "create"), (req, res) => {
  const store = readStore();
  const body = { ...req.body, source: "admin" };
  if (!canDo(req.session.user, "marriage", "approve")) {
    body.status = "pending";
    delete body.downloadPin;
  }
  const marriage = buildMarriage(body, null, { allowStatus: true });
  if (!marriage.certificateNo) marriage.certificateNo = issueCertificateNo(store);
  store.marriages.unshift(marriage);
  writeStore(store);
  res.json(marriage);
});

app.put("/api/marriages/:id", requireAny([["marriage", "update"], ["marriage", "approve"]]), (req, res) => {
  const store = readStore();
  const idx = store.marriages.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const existing = store.marriages[idx];
  const user = req.session.user;
  let body = { ...req.body };
  const nextStatus = ["pending", "approved", "rejected"].includes(body.status)
    ? body.status
    : existing.status;
  const nextPin = body.downloadPin != null ? String(body.downloadPin) : String(existing.downloadPin || "");
  const approvalChanged = nextStatus !== existing.status || nextPin !== String(existing.downloadPin || "");
  if (approvalChanged && !canDo(user, "marriage", "approve")) {
    return res.status(403).json({ error: "You cannot approve or change the download PIN" });
  }
  if (!canDo(user, "marriage", "update")) {
    body = {
      ...existing,
      status: nextStatus,
      downloadPin: body.downloadPin != null ? body.downloadPin : existing.downloadPin,
    };
  }
  const saved = buildMarriage(body, existing, { allowStatus: true });
  if (body.extraFields && canDo(user, "marriage", "update")) {
    saved.extraFields = sanitizeExtraFields(
      body.extraFields,
      mergeNikahForm(store.nikahForm)
    );
  }
  const duplicate = store.marriages.some(
    (item) => item.id !== saved.id && item.certificateNo && item.certificateNo === saved.certificateNo
  );
  if (duplicate) return res.status(400).json({ error: "That certificate number is already used" });
  if (body.certifierSignId && canDo(user, "marriage", "approve")) {
    const applied = applySavedCertifier(saved, store, String(body.certifierSignId));
    if (applied.error) return res.status(400).json({ error: applied.error });
  }
  store.marriages[idx] = saved;
  writeStore(store);
  res.json(store.marriages[idx]);
});

app.get("/api/marriages/:id/pdf", requirePerm("marriage", "view"), async (req, res) => {
  const marriage = readStore().marriages.find((m) => m.id === req.params.id);
  if (!marriage) return res.status(404).json({ error: "Not found" });
  return sendFilledNikahPdf(req, res, marriage);
});

app.delete("/api/marriages/:id", requirePerm("marriage", "delete"), (req, res) => {
  const store = readStore();
  store.marriages = store.marriages.filter((m) => m.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
});

app.get("/api/content", requirePerm("content", "view"), (req, res) => {
  res.json(readStore().content);
});

app.put("/api/content", requirePerm("content", "update"), (req, res) => {
  const store = readStore();
  store.content = { ...store.content, ...req.body };
  writeStore(store);
  res.json(store.content);
});

/* Public CMS – live website reads this (no auth) */
app.get("/api/public/cms", (req, res) => {
  const cms = readCms();
  const slug = req.query.page;
  if (slug) {
    return res.json({
      header: cms.header,
      menu: cms.menu,
      footer: cms.footer,
      page: cms.pages[slug] || null,
      updatedAt: cms.updatedAt,
    });
  }
  res.json(cms);
});

app.get("/api/cms", requirePerm("content", "view"), (req, res) => {
  res.json(readCms());
});

app.put("/api/cms", requirePerm("content", "update"), (req, res) => {
  const current = readCms();
  const next = {
    ...current,
    ...req.body,
    header: req.body.header || current.header,
    menu: req.body.menu || current.menu,
    footer: req.body.footer || current.footer,
    pages: req.body.pages || current.pages,
  };
  writeCms(next);
  res.json(next);
});

app.put("/api/cms/header", requirePerm("content", "update"), (req, res) => {
  const cms = readCms();
  cms.header = { ...cms.header, ...req.body };
  writeCms(cms);
  res.json(cms.header);
});

app.put("/api/cms/menu", requirePerm("content", "update"), (req, res) => {
  const cms = readCms();
  cms.menu = Array.isArray(req.body.menu) ? req.body.menu : cms.menu;
  writeCms(cms);
  res.json(cms.menu);
});

app.put("/api/cms/footer", requirePerm("content", "update"), (req, res) => {
  const cms = readCms();
  cms.footer = { ...cms.footer, ...req.body };
  writeCms(cms);
  res.json(cms.footer);
});

app.put("/api/cms/pages/:slug", requirePerm("content", "update"), (req, res) => {
  const cms = readCms();
  const slug = req.params.slug;
  if (!cms.pages[slug]) {
    cms.pages[slug] = { title: slug, blocks: [] };
  }
  cms.pages[slug] = {
    ...cms.pages[slug],
    ...req.body,
    title: req.body.title || cms.pages[slug].title,
    blocks: Array.isArray(req.body.blocks) ? req.body.blocks : cms.pages[slug].blocks,
  };
  writeCms(cms);
  res.json(cms.pages[slug]);
});

app.post("/api/cms/pages", requirePerm("content", "update"), (req, res) => {
  const cms = readCms();
  const slug = String(req.body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  if (!slug) return res.status(400).json({ error: "Slug required" });
  if (cms.pages[slug]) return res.status(400).json({ error: "Page already exists" });
  cms.pages[slug] = {
    title: req.body.title || slug,
    blocks: [
      { key: "page_title", label: "Page Title", type: "text", value: req.body.title || slug },
      { key: "page_subtitle", label: "Page Subtitle", type: "text", value: "" },
      { key: "body_html", label: "Page Body Content", type: "html", value: "<p>New page content</p>" },
    ],
  };
  writeCms(cms);
  res.json({ slug, page: cms.pages[slug] });
});

app.use("/uploads/avatars", express.static(AVATAR_DIR));
app.use("/portal", express.static(path.join(ROOT, "portal")));
app.get("/portal", (req, res) => {
  if (req.session.user) return res.redirect("/portal/index.html");
  return res.redirect("/portal/login.html");
});

function cleanCategoryName(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (!/^[A-Za-z][A-Za-z0-9 _-]{0,39}$/.test(text)) return "";
  return text;
}

function formPdfPath(id) {
  return path.join(FORM_DIR, `${id}.pdf`);
}

function publicFormTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    active: Boolean(template.active),
    fields: template.fields || [],
    hasPdf: fs.existsSync(formPdfPath(template.id)),
    updatedAt: template.updatedAt || null,
  };
}

function assertFormFill(req, res, category) {
  const user = loadSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  const key = categoryKey(category);
  const moduleKey = key === "student" || key === "students" ? "students" : key === "marriage" || key === "marriages" ? "marriage" : "users";
  const action = moduleKey === "users" ? "manage" : "view";
  if (!canDo(user, moduleKey, action) && !canDo(user, "users", "manage")) {
    res.status(403).json({ error: "You do not have permission for this action" });
    return false;
  }
  return true;
}

app.get("/api/form-templates", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const templates = store.formTemplates || [];
  res.json({
    templates: templates.map(publicFormTemplate),
    fonts: publicFontList(store),
    categories: {
      Marriage: [
        { key: "certificateNo", label: "Certificate number" },
        { key: "groomName", label: "Groom full name" },
        { key: "brideName", label: "Bride full name" },
        { key: "groomDob", label: "Groom date of birth" },
        { key: "brideDob", label: "Bride date of birth" },
        { key: "marriageDate", label: "Marriage date" },
        ...mergeNikahForm(store.nikahForm).fields.map((field) => ({ key: field.key, label: field.label })),
      ],
      Student: fieldsForCategory("student").map(([key, label]) => ({ key, label })),
    },
  });
});

app.post("/api/form-templates", requirePerm("users", "manage"), (req, res) => {
  const name = String(req.body.name || "").trim().slice(0, 80);
  const category = cleanCategoryName(req.body.category);
  if (!name) return res.status(400).json({ error: "Form name is required" });
  if (!category) return res.status(400).json({ error: "Category must start with a letter" });
  const store = readStore();
  store.formTemplates = store.formTemplates || [];
  const template = {
    id: uuidv4(),
    name,
    category,
    active: req.body.active !== false,
    fields: cleanFields(req.body.fields, customFamilies(store)),
    updatedAt: new Date().toISOString(),
  };
  if (template.active) {
    const key = categoryKey(category);
    for (const item of store.formTemplates) {
      if (categoryKey(item.category) === key) item.active = false;
    }
  }
  store.formTemplates.unshift(template);
  writeStore(store);
  res.json(publicFormTemplate(template));
});

app.put("/api/form-templates/:id", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const templates = store.formTemplates || [];
  const template = templates.find((item) => item.id === req.params.id);
  if (!template) return res.status(404).json({ error: "Form not found" });
  const name = String(req.body.name || template.name || "").trim().slice(0, 80);
  const category = cleanCategoryName(req.body.category || template.category);
  if (!name || !category) return res.status(400).json({ error: "Name and category are required" });
  template.name = name;
  template.category = category;
  template.fields = cleanFields(req.body.fields, customFamilies(store));
  template.active = Boolean(req.body.active);
  template.updatedAt = new Date().toISOString();
  if (template.active) {
    const key = categoryKey(category);
    for (const item of templates) {
      if (item.id !== template.id && categoryKey(item.category) === key) item.active = false;
    }
  }
  writeStore(store);
  res.json(publicFormTemplate(template));
});

app.put(
  "/api/form-templates/:id/file",
  requirePerm("users", "manage"),
  express.raw({ type: "application/pdf", limit: "30mb" }),
  (req, res) => {
    const store = readStore();
    const template = (store.formTemplates || []).find((item) => item.id === req.params.id);
    if (!template) return res.status(404).json({ error: "Form not found" });
    if (!Buffer.isBuffer(req.body) || req.body.length < 5 || req.body.slice(0, 4).toString() !== "%PDF") {
      return res.status(400).json({ error: "Upload a PDF file" });
    }
    fs.writeFileSync(formPdfPath(template.id), req.body);
    template.updatedAt = new Date().toISOString();
    writeStore(store);
    res.json({ ok: true, hasPdf: true });
  }
);

app.get("/api/form-templates/:id/file", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const template = (store.formTemplates || []).find((item) => item.id === req.params.id);
  const file = formPdfPath(req.params.id);
  if (!template || !fs.existsSync(file)) return res.status(404).json({ error: "PDF not found" });
  res.setHeader("Content-Type", "application/pdf");
  res.send(fs.readFileSync(file));
});

app.delete("/api/form-templates/:id", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  store.formTemplates = (store.formTemplates || []).filter((item) => item.id !== req.params.id);
  writeStore(store);
  const file = formPdfPath(req.params.id);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ ok: true });
});

app.get("/api/form-templates/records", (req, res) => {
  const category = cleanCategoryName(req.query.category);
  if (!category) return res.status(400).json({ error: "Category is required" });
  if (!assertFormFill(req, res, category)) return;
  const records = sourceList(readStore(), category);
  if (!records) return res.json([]);
  res.json(records.slice(0, 100).map((record) => ({ id: record.id, label: recordLabel(record, category) })));
});

app.get("/api/form-fill/:category/:recordId", async (req, res) => {
  const category = cleanCategoryName(req.params.category);
  if (!category) return res.status(400).json({ error: "Category is required" });
  if (!assertFormFill(req, res, category)) return;
  try {
    const pdf = await buildFilledForm(category, req.params.recordId, {});
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${categoryKey(category)}-form.pdf"`);
    res.send(pdf);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Could not fill the PDF" });
  }
});

app.post("/api/form-templates/:id/fill", async (req, res) => {
  const store = readStore();
  const template = (store.formTemplates || []).find((item) => item.id === req.params.id);
  if (!template) return res.status(404).json({ error: "Form not found" });
  if (!assertFormFill(req, res, template.category)) return;
  try {
    const pdf = await buildFilledForm(template.category, req.body.recordId, req.body.data || {}, template.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${categoryKey(template.category)}-form.pdf"`);
    res.send(pdf);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || "Could not fill the PDF" });
  }
});

async function buildFilledForm(category, recordId, overrides, templateId) {
  const store = readStore();
  const templates = store.formTemplates || [];
  const template = templateId
    ? templates.find((item) => item.id === templateId)
    : templates.find((item) => item.active && categoryKey(item.category) === categoryKey(category));
  if (!template) {
    const error = new Error("No active form for this category. Set one in Settings → Form Builder.");
    error.status = 404;
    throw error;
  }
  const file = formPdfPath(template.id);
  if (!fs.existsSync(file)) {
    const error = new Error("This form has no PDF yet");
    error.status = 400;
    throw error;
  }
  const records = sourceList(store, template.category) || [];
  const record = records.find((item) => item.id === recordId) || null;
  if (records.length && recordId && !record) {
    const error = new Error("Record not found");
    error.status = 404;
    throw error;
  }
  const values = {};
  for (const field of template.fields || []) {
    values[field.key] = record ? valueOf(record, field.key, template.category) : "";
  }
  if (overrides && typeof overrides === "object") {
    for (const [key, value] of Object.entries(overrides)) {
      const cleanKey = String(key).replace(/[^A-Za-z0-9_]/g, "").slice(0, 40);
      if (!cleanKey || !String(value ?? "").trim()) continue;
      values[cleanKey] = String(value).slice(0, 500);
    }
  }
  const images = {};
  if (record && (categoryKey(template.category) === "marriage" || categoryKey(template.category) === "marriages")) {
    const roles = {
      signGroom: "groom",
      signBride: "bride",
      signWitness1: "witness1",
      signWitness2: "witness2",
      signCertifier: "certifier",
    };
    for (const [key, role] of Object.entries(roles)) {
      const slot = record.signatures?.[role];
      const file = path.join(SIGNATURE_DIR, `${record.id}-${role}.png`);
      if (slot?.status === "approved" && fs.existsSync(file)) images[key] = fs.readFileSync(file);
    }
  }
  return fillTemplatePdf(fs.readFileSync(file), template.fields || [], values, images, {
    families: customFamilies(store),
    readFont: (fontName) => readFormFontBytes(store, fontName, FONT_DIR),
  });
}

app.post(
  "/api/form-fonts",
  requirePerm("users", "manage"),
  express.raw({ type: () => true, limit: "8mb" }),
  (req, res) => {
    let rawName = "";
    try {
      rawName = decodeURIComponent(String(req.get("x-font-name") || ""));
    } catch (_) {
      rawName = "";
    }
    const family = cleanFontFamily(rawName);
    if (!family) return res.status(400).json({ error: "Font name must start with a letter" });
    if (isReservedFamily(family)) return res.status(400).json({ error: "That font name is already built in" });
    if (!isFontBytes(req.body)) return res.status(400).json({ error: "Upload a TTF or OTF font" });
    const ext = /\.otf$/i.test(String(req.get("x-font-name") || "")) ? "otf" : "ttf";
    const store = readStore();
    store.formFonts = store.formFonts || [];
    let font = store.formFonts.find((item) => item.family.toLowerCase() === family.toLowerCase());
    if (!font) {
      font = { id: uuidv4(), family, file: "", ext };
      store.formFonts.push(font);
    } else if (font.file && font.file !== `${font.id}.${ext}`) {
      const previous = path.join(FONT_DIR, font.file);
      if (fs.existsSync(previous)) fs.unlinkSync(previous);
    }
    font.family = family;
    font.ext = ext;
    font.file = `${font.id}.${ext}`;
    fs.writeFileSync(path.join(FONT_DIR, font.file), req.body);
    writeStore(store);
    res.json({ id: font.id, family: font.family, uploaded: true });
  }
);

app.get("/api/form-fonts/:id/file", requirePerm("users", "manage"), (req, res) => {
  const store = readStore();
  const font = (store.formFonts || []).find((item) => item.id === req.params.id);
  if (!font) return res.status(404).json({ error: "Font not found" });
  const file = path.join(FONT_DIR, font.file);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Font file not found" });
  res.setHeader("Content-Type", font.ext === "otf" ? "font/otf" : "font/ttf");
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.send(fs.readFileSync(file));
});

app.use(express.static(ROOT, { index: "index.html" }));

app.listen(PORT, () => {
  console.log(`KKT site + portal running at http://localhost:${PORT}`);
  console.log(`Portal login: http://localhost:${PORT}/portal`);
  console.log(`Default login → admin / admin123`);
});
