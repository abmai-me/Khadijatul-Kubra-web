(function (global) {
  const FIELD_KEYS = [
    "certificateNo",
    "applicantName",
    "applicantMobile",
    "applicantEmail",
    "groomFirstName",
    "groomLastName",
    "groomDobDay",
    "groomDobMonth",
    "groomDobYear",
    "groomNationality",
    "groomPlaceOfBirth",
    "groomFather",
    "groomMother",
    "groomAddress",
    "groomMobile",
    "groomPhone",
    "brideFirstName",
    "brideLastName",
    "brideDobDay",
    "brideDobMonth",
    "brideDobYear",
    "brideNationality",
    "bridePlaceOfBirth",
    "brideFather",
    "brideMother",
    "brideAddress",
    "brideMobile",
    "bridePhone",
    "marriageDay",
    "marriageMonth",
    "marriageYear",
    "placeOfMarriage",
    "dowryAmount",
    "dowryCash",
    "dowryJewellery",
    "dowryLand",
    "proposerName",
    "proposerAddress",
    "proposerMobile",
    "witness1Name",
    "witness1Address",
    "witness2Name",
    "witness2Address",
    "certifierName",
    "certifyDay",
    "certifyMonth",
    "certifyYear",
    "status",
    "notes",
  ];

  function blankNikah(overrides = {}) {
    const base = {};
    FIELD_KEYS.forEach((k) => {
      base[k] = "";
    });
    base.status = "pending";
    base.placeOfMarriage = "Khadijatul Kubra Trust Mosque, Leicester";
    return { ...base, ...overrides };
  }

  function fullName(first, last) {
    return [first, last].filter(Boolean).join(" ").trim();
  }

  function normalizeNikah(body = {}) {
    const data = blankNikah();
    FIELD_KEYS.forEach((k) => {
      if (body[k] != null) data[k] = String(body[k]).trim();
    });

    // Backward compatibility with older simple fields
    if (!data.groomFirstName && body.groomName) {
      const parts = String(body.groomName).trim().split(/\s+/);
      data.groomFirstName = parts.shift() || "";
      data.groomLastName = parts.join(" ");
    }
    if (!data.brideFirstName && body.brideName) {
      const parts = String(body.brideName).trim().split(/\s+/);
      data.brideFirstName = parts.shift() || "";
      data.brideLastName = parts.join(" ");
    }
    if (!data.groomFather && body.groomFather) data.groomFather = String(body.groomFather).trim();
    if (!data.brideFather && body.brideFather) data.brideFather = String(body.brideFather).trim();
    if (!data.placeOfMarriage && body.venue) data.placeOfMarriage = String(body.venue).trim();
    if (!data.dowryAmount && body.mahr) data.dowryAmount = String(body.mahr).trim();
    if (!data.witness1Name && body.witnesses) {
      const parts = String(body.witnesses).split(/,|\|/).map((s) => s.trim());
      data.witness1Name = parts[0] || "";
      data.witness2Name = parts[1] || "";
    }
    if (body.weddingDate) {
      const [y, m, d] = String(body.weddingDate).split("-");
      if (!data.marriageYear) data.marriageYear = y || "";
      if (!data.marriageMonth) data.marriageMonth = m || "";
      if (!data.marriageDay) data.marriageDay = d || "";
    }
    if (body.groomDob) {
      const [y, m, d] = String(body.groomDob).split("-");
      if (!data.groomDobYear) data.groomDobYear = y || "";
      if (!data.groomDobMonth) data.groomDobMonth = m || "";
      if (!data.groomDobDay) data.groomDobDay = d || "";
    }
    if (body.brideDob) {
      const [y, m, d] = String(body.brideDob).split("-");
      if (!data.brideDobYear) data.brideDobYear = y || "";
      if (!data.brideDobMonth) data.brideDobMonth = m || "";
      if (!data.brideDobDay) data.brideDobDay = d || "";
    }

    data.groomName = fullName(data.groomFirstName, data.groomLastName);
    data.brideName = fullName(data.brideFirstName, data.brideLastName);
    data.weddingDate = [data.marriageYear, data.marriageMonth, data.marriageDay]
      .filter(Boolean)
      .join("-");
    data.venue = data.placeOfMarriage;
    data.mahr = data.dowryAmount;
    data.witnesses = [data.witness1Name, data.witness2Name].filter(Boolean).join(", ");
    return data;
  }

  function readForm(form) {
    const body = {};
    FIELD_KEYS.forEach((k) => {
      const el = form.querySelector(`[name="${k}"]`);
      if (el) body[k] = el.value;
    });
    return normalizeNikah(body);
  }

  function fillForm(form, data) {
    const n = normalizeNikah(data);
    FIELD_KEYS.forEach((k) => {
      const el = form.querySelector(`[name="${k}"]`);
      if (el) el.value = n[k] || "";
    });
  }

  function fillReadonly(root, data) {
    const n = normalizeNikah(data);
    root.querySelectorAll("[data-field]").forEach((el) => {
      const key = el.getAttribute("data-field");
      el.textContent = n[key] || "—";
    });
  }

  global.NikahNama = {
    FIELD_KEYS,
    blankNikah,
    normalizeNikah,
    readForm,
    fillForm,
    fillReadonly,
    fullName,
  };
})(typeof window !== "undefined" ? window : global);
