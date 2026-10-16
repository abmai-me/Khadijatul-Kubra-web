/** Online Nikah form fields. Certificate placement stays in lib/nikah-pdf.js. */

const SIGN_ROLES = [
  { key: "groom", label: "Bridegroom" },
  { key: "bride", label: "Bride" },
  { key: "witness1", label: "Witness 1" },
  { key: "witness2", label: "Witness 2" },
  { key: "certifier", label: "Certifier" },
];

const DEFAULT_FIELDS = [
  { key: "applicantName", label: "Your full name", group: "Contact", input: "text", required: true },
  { key: "applicantMobile", label: "Mobile No", group: "Contact", input: "text", required: true },
  { key: "applicantEmail", label: "Email", group: "Contact", input: "email", required: true },
  { key: "groomFirstName", label: "Groom first name", group: "Groom", input: "text", required: true },
  { key: "groomLastName", label: "Groom last name", group: "Groom", input: "text", required: true },
  { key: "groomDobDay", label: "Groom DOB day", group: "Groom", input: "text", required: false },
  { key: "groomDobMonth", label: "Groom DOB month", group: "Groom", input: "text", required: false },
  { key: "groomDobYear", label: "Groom DOB year", group: "Groom", input: "text", required: false },
  { key: "groomNationality", label: "Groom nationality", group: "Groom", input: "text", required: false },
  { key: "groomPlaceOfBirth", label: "Groom place of birth", group: "Groom", input: "text", required: false },
  { key: "groomFather", label: "Groom father's name", group: "Groom", input: "text", required: false },
  { key: "groomMother", label: "Groom mother's name", group: "Groom", input: "text", required: false },
  { key: "groomAddress", label: "Groom present address", group: "Groom", input: "textarea", required: false },
  { key: "groomMobile", label: "Groom mobile", group: "Groom", input: "text", required: false },
  { key: "groomPhone", label: "Groom phone", group: "Groom", input: "text", required: false },
  { key: "brideFirstName", label: "Bride first name", group: "Bride", input: "text", required: true },
  { key: "brideLastName", label: "Bride last name", group: "Bride", input: "text", required: true },
  { key: "brideDobDay", label: "Bride DOB day", group: "Bride", input: "text", required: false },
  { key: "brideDobMonth", label: "Bride DOB month", group: "Bride", input: "text", required: false },
  { key: "brideDobYear", label: "Bride DOB year", group: "Bride", input: "text", required: false },
  { key: "brideNationality", label: "Bride nationality", group: "Bride", input: "text", required: false },
  { key: "bridePlaceOfBirth", label: "Bride place of birth", group: "Bride", input: "text", required: false },
  { key: "brideFather", label: "Bride father's name", group: "Bride", input: "text", required: false },
  { key: "brideMother", label: "Bride mother's name", group: "Bride", input: "text", required: false },
  { key: "brideAddress", label: "Bride present address", group: "Bride", input: "textarea", required: false },
  { key: "brideMobile", label: "Bride mobile", group: "Bride", input: "text", required: false },
  { key: "bridePhone", label: "Bride phone", group: "Bride", input: "text", required: false },
  { key: "marriageDay", label: "Marriage day", group: "Marriage", input: "text", required: false },
  { key: "marriageMonth", label: "Marriage month", group: "Marriage", input: "text", required: false },
  { key: "marriageYear", label: "Marriage year", group: "Marriage", input: "text", required: false },
  { key: "placeOfMarriage", label: "Place of marriage", group: "Marriage", input: "text", required: false },
  { key: "dowryAmount", label: "Dowry amount", group: "Marriage", input: "text", required: false },
  { key: "dowryCash", label: "Dowry cash", group: "Marriage", input: "text", required: false },
  { key: "dowryJewellery", label: "Dowry jewellery", group: "Marriage", input: "text", required: false },
  { key: "dowryLand", label: "Dowry land & property", group: "Marriage", input: "text", required: false },
  { key: "proposerName", label: "Proposer name", group: "Proposer", input: "text", required: false },
  { key: "proposerAddress", label: "Proposer address", group: "Proposer", input: "text", required: false },
  { key: "proposerMobile", label: "Proposer mobile", group: "Proposer", input: "text", required: false },
  { key: "witness1Name", label: "Witness 1 name", group: "Witnesses", input: "text", required: false },
  { key: "witness1Address", label: "Witness 1 address", group: "Witnesses", input: "textarea", required: false },
  { key: "witness2Name", label: "Witness 2 name", group: "Witnesses", input: "text", required: false },
  { key: "witness2Address", label: "Witness 2 address", group: "Witnesses", input: "textarea", required: false },
  { key: "certifierName", label: "Certifier name", group: "Certifier", input: "text", required: false },
  { key: "certifyDay", label: "Certify day", group: "Certifier", input: "text", required: false },
  { key: "certifyMonth", label: "Certify month", group: "Certifier", input: "text", required: false },
  { key: "certifyYear", label: "Certify year", group: "Certifier", input: "text", required: false },
];

function cleanLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function mergeNikahForm(saved) {
  const incoming = Array.isArray(saved?.fields) ? saved.fields : [];
  const byKey = new Map(incoming.map((field) => [field.key, field]));
  const fields = DEFAULT_FIELDS.map((field) => {
    const over = byKey.get(field.key);
    return {
      key: field.key,
      label: cleanLabel(over?.label) || field.label,
      group: field.group,
      input: field.input,
      kind: "builtin",
      required: over ? !!over.required : field.required,
    };
  });
  incoming
    .filter((field) => field && field.kind === "custom")
    .slice(0, 12)
    .forEach((field) => {
      const key = String(field.key || "").trim();
      if (!/^c[a-z0-9]{6,12}$/.test(key)) return;
      const label = cleanLabel(field.label);
      if (!label) return;
      fields.push({
        key,
        label,
        group: "Extra",
        input: field.input === "textarea" ? "textarea" : "text",
        kind: "custom",
        required: !!field.required,
      });
    });
  return {
    fields,
    certificatePrefix: cleanCertificatePrefix(saved?.certificatePrefix),
    certificateCode: cleanCertificateCode(saved?.certificateCode),
    certificateYear: cleanCertificateYear(saved?.certificateYear),
    certificateNext: Math.max(1, Number(saved?.certificateNext) || 1),
  };
}

function cleanCertificatePrefix(value) {
  const prefix = String(value || "")
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return prefix || "NN";
}

function cleanCertificateCode(value) {
  return String(value || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
}

function cleanCertificateNo(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function cleanCertificateYear(value) {
  const year = String(value || "").replace(/\D/g, "").slice(0, 4);
  if (/^\d{4}$/.test(year)) return year;
  return String(new Date().getFullYear());
}

function formatCertificateNo(settings, next = settings?.certificateNext) {
  const auto = String(Math.max(1, Number(next) || 1)).padStart(4, "0");
  const middle = cleanCertificateCode(settings?.certificateCode);
  const parts = [cleanCertificatePrefix(settings?.certificatePrefix)];
  if (middle && middle !== auto) parts.push(middle);
  parts.push(auto, cleanCertificateYear(settings?.certificateYear));
  return parts.filter(Boolean).join("-");
}

function certificateExample(settings) {
  return formatCertificateNo(settings, settings?.certificateNext);
}

function publicNikahForm(saved) {
  const form = mergeNikahForm(saved);
  return {
    fields: form.fields.map((field) => ({
      key: field.key,
      label: field.label,
      group: field.group,
      input: field.input,
      kind: field.kind,
      required: field.required,
    })),
    signRoles: SIGN_ROLES,
    certificatePrefix: form.certificatePrefix,
    certificateCode: form.certificateCode,
    certificateYear: form.certificateYear,
    certificateNext: form.certificateNext,
    certificateExample: certificateExample(form),
  };
}

module.exports = {
  SIGN_ROLES,
  DEFAULT_FIELDS,
  mergeNikahForm,
  publicNikahForm,
  cleanLabel,
  cleanCertificatePrefix,
  cleanCertificateCode,
  cleanCertificateYear,
  cleanCertificateNo,
  formatCertificateNo,
  certificateExample,
};
