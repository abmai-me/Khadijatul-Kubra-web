let formMeta = { templates: [], categories: { Marriage: [], Student: [] } };
let formDraft = null;
let formPdfDoc = null;
let formPendingPdf = null;
let formPageWidth = 1;
let formFitScale = 1;
let formUserZoom = 1;
let formScale = 1;
let formPageHeight = 0;
let formPageIndex = 0;
let formSelectedId = null;
let formPointer = null;
let formEyedrop = false;
let formFontFamily = "Helvetica";
let formSpace = false;
let formPan = null;

function formError(message) {
  const box = document.getElementById("formBuilderError");
  if (!box) return;
  box.textContent = message || "";
  box.classList.toggle("hidden", !message);
}

function formCategoryKey(value) {
  return String(value || "").trim().toLowerCase();
}

function formCatalog(category) {
  const key = formCategoryKey(category);
  if (key === "marriage" || key === "marriages") return formMeta.categories.Marriage || [];
  if (key === "student" || key === "students") return formMeta.categories.Student || [];
  return [];
}

function attributeGroup(key) {
  if (key === "qr") return "Marks";
  if (String(key).startsWith("sign")) return "Signatures";
  if (key.startsWith("certificate") || key === "status") return "Certificate";
  if (key.startsWith("groom")) return "Groom";
  if (key.startsWith("bride")) return "Bride";
  if (key.startsWith("marriage") || key.startsWith("dowry") || key.startsWith("place")) return "Marriage";
  if (key.startsWith("witness")) return "Witnesses";
  if (key.startsWith("certif")) return "Certifier";
  if (key.startsWith("applicant") || key.startsWith("proposer")) return "Contact";
  return "Details";
}

function paletteItems() {
  const category = document.getElementById("formTemplateCategory")?.value || "";
  const items = [{ key: "qr", label: "QR code", kind: "qr", group: "Marks" }];
  if (formCategoryKey(category) === "marriage" || formCategoryKey(category) === "marriages" || !category) {
    items.push(
      { key: "signGroom", label: "Groom signature", kind: "sign", group: "Signatures" },
      { key: "signBride", label: "Bride signature", kind: "sign", group: "Signatures" },
      { key: "signWitness1", label: "Witness 1 signature", kind: "sign", group: "Signatures" },
      { key: "signWitness2", label: "Witness 2 signature", kind: "sign", group: "Signatures" },
      { key: "signCertifier", label: "Certifier signature", kind: "sign", group: "Signatures" }
    );
  }
  const catalog = formCatalog(category);
  if (!catalog.length) items.push({ key: "customText", label: "Custom text", kind: "text", group: "Text" });
  catalog.forEach((item) => {
    items.push({ key: item.key, label: item.label, kind: "text", group: attributeGroup(item.key) });
  });
  return items;
}

function splitFont(name) {
  const font = name || "Helvetica";
  const family = font
    .replace(/-BoldItalic$/, "")
    .replace(/-BoldOblique$/, "")
    .replace(/-Italic$/, "")
    .replace(/-Oblique$/, "")
    .replace(/-Bold$/, "")
    .replace(/-Roman$/, "");
  return {
    family: family || "Helvetica",
    bold: /-Bold/.test(font),
    italic: /Italic|Oblique/.test(font),
  };
}

function joinFont(family, bold, italic) {
  if (family === "Times") {
    if (bold && italic) return "Times-BoldItalic";
    if (bold) return "Times-Bold";
    if (italic) return "Times-Italic";
    return "Times-Roman";
  }
  if (family === "Courier") {
    if (bold && italic) return "Courier-BoldOblique";
    if (bold) return "Courier-Bold";
    if (italic) return "Courier-Oblique";
    return "Courier";
  }
  if (family === "Helvetica") {
    if (bold && italic) return "Helvetica-BoldOblique";
    if (bold) return "Helvetica-Bold";
    if (italic) return "Helvetica-Oblique";
    return "Helvetica";
  }
  if (bold && italic) return `${family}-BoldItalic`;
  if (bold) return `${family}-Bold`;
  if (italic) return `${family}-Italic`;
  return family;
}

function cssFontFamily(name) {
  if (name === "Helvetica") return "Helvetica, Arial, sans-serif";
  if (name === "Times") return "Times New Roman, Times, serif";
  if (name === "Courier") return "Courier New, Courier, monospace";
  return `'${String(name || "Helvetica").replace(/'/g, "")}', sans-serif`;
}

const previewFonts = new Set(["Helvetica", "Times", "Courier", "Source Sans 3"]);

function fontChoices() {
  return formMeta.fonts?.length
    ? formMeta.fonts
    : [{ family: "Helvetica" }, { family: "Times" }, { family: "Courier" }, { family: "Source Sans 3" }];
}

function renderFontOptions() {
  const list = document.getElementById("formFontList");
  if (!list) return;
  list.innerHTML = fontChoices()
    .map((font) => {
      const family = font.family || font;
      const active = family === formFontFamily ? " active" : "";
      return `<button type="button" class="font-pick${active}" data-font="${esc(family)}" style="font-family:${cssFontFamily(family)}" title="${esc(family)}">${esc(family)}</button>`;
    })
    .join("");
}

async function ensurePreviewFont(family) {
  if (!family || previewFonts.has(family)) return;
  const font = (formMeta.fonts || []).find((item) => item.family === family && item.id);
  if (!font) return;
  const face = new FontFace(family, `url(/api/form-fonts/${font.id}/file)`);
  await face.load();
  document.fonts.add(face);
  previewFonts.add(family);
}

function paintBox(box, field) {
  const style = splitFont(field.font);
  const top = (formPageHeight - field.y - field.boxH) * formScale;
  box.style.left = `${field.x * formScale}px`;
  box.style.top = `${top}px`;
  box.style.width = `${field.maxW * formScale}px`;
  box.style.height = `${field.boxH * formScale}px`;
  box.style.fontSize = `${Math.max(10, field.size * formScale)}px`;
  box.style.fontFamily = cssFontFamily(style.family);
  box.style.fontWeight = style.bold ? "700" : "400";
  box.style.fontStyle = style.italic ? "italic" : "normal";
  box.style.color = field.color || "#143826";
  box.style.justifyContent = field.align === "center" ? "center" : field.align === "right" ? "flex-end" : "flex-start";
  const vAlign = field.vAlign || "middle";
  box.style.alignItems = vAlign === "top" ? "flex-start" : vAlign === "bottom" ? "flex-end" : "center";
  box.style.whiteSpace = "pre-line";
  const gap = Number(field.lineGap) || field.size * 1.15;
  box.style.lineHeight = String(Math.max(0.9, gap / Math.max(field.size, 1)));
}

function selectedFormField() {
  return formDraft?.fields?.find((field) => field.id === formSelectedId) || null;
}

function defaultBox(kind, key = "") {
  if (kind === "qr") return { maxW: 72, boxH: 72, size: 11, lineGap: 12 };
  if (kind === "sign") return { maxW: 120, boxH: 42, size: 11, lineGap: 12 };
  const size = 11;
  if (/address|notes/i.test(key)) {
    return { maxW: 230, boxH: size * 3.4, size, lineGap: Math.round(size * 1.15 * 10) / 10 };
  }
  return { maxW: 150, boxH: 18, size, lineGap: Math.round(size * 1.15 * 10) / 10 };
}

async function loadFormBuilder() {
  try {
    formMeta = await api("/api/form-templates");
    const list = document.getElementById("formCategoryList");
    const names = new Set(["Marriage", "Student", ...(formMeta.templates || []).map((item) => item.category)]);
    list.innerHTML = [...names].map((name) => `<option value="${esc(name)}"></option>`).join("");
    renderFontOptions();
    renderFormTemplateList();
    renderAttributeList();
  } catch (err) {
    formError(err.message || "Could not load forms");
  }
}

function renderFormTemplateList() {
  const host = document.getElementById("formTemplateList");
  const templates = formMeta.templates || [];
  if (!templates.length) {
    host.innerHTML = `<p class="muted">No forms yet. Upload a PDF and drag the attributes onto it.</p>`;
    return;
  }
  const groups = new Map();
  templates.forEach((template) => {
    const name = template.category || "Other";
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(template);
  });
  host.innerHTML = [...groups.entries()]
    .map(
      ([category, items]) => `<div class="form-template-group">
        <h4>${esc(category)}</h4>
        ${items
          .map(
            (template) => `<div class="form-template-row">
              <div>
                <strong>${esc(template.name)}</strong>
                <div class="muted">${template.fields.length} fields · used for every ${esc(category)} download${template.hasPdf ? "" : " · PDF missing"}</div>
              </div>
              <div class="actions">
                <button type="button" class="btn btn-secondary btn-sm" data-edit-form="${esc(template.id)}">Edit</button>
                <button type="button" class="btn btn-danger btn-sm" data-delete-form="${esc(template.id)}">Delete</button>
              </div>
            </div>`
          )
          .join("")}
      </div>`
    )
    .join("");
}

function renderAttributeList() {
  const host = document.getElementById("formAttrList");
  if (!host) return;
  const query = document.getElementById("formAttrSearch")?.value.trim().toLowerCase() || "";
  const groups = new Map();
  paletteItems()
    .filter((item) => !query || item.label.toLowerCase().includes(query) || item.key.toLowerCase().includes(query))
    .forEach((item) => {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group).push(item);
    });
  const order = ["Marks", "Signatures", "Certificate", "Groom", "Bride", "Marriage", "Witnesses", "Certifier", "Contact", "Details", "Text"];
  const names = [...groups.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  host.innerHTML = names
    .map(
      (name) => `<section class="attr-group"><h5>${esc(name)}</h5>${groups
        .get(name)
        .map(
          (item) => `<button type="button" class="attr-item" draggable="true" data-place-key="${esc(item.key)}" data-place-kind="${esc(item.kind)}" data-place-label="${esc(item.label)}">${esc(item.label)}</button>`
        )
        .join("")}</section>`
    )
    .join("");
}

function syncSelectionBar() {
  const bar = document.getElementById("formSelectionBar");
  const field = selectedFormField();
  bar.classList.toggle("hidden", !field);
  document.querySelectorAll(".text-tool").forEach((el) => el.classList.toggle("hidden", !field || field.kind !== "text"));
  document.querySelectorAll(".align-tool").forEach((el) => el.classList.toggle("hidden", !field || (field.kind !== "text" && field.kind !== "sign")));
  if (field?.kind === "text") formFontFamily = splitFont(field.font).family;
  renderFontOptions();
  if (field && (field.kind === "text" || field.kind === "sign")) {
    document.getElementById("formAlign").value = field.align || "left";
  }
  if (!field || field.kind !== "text") return;
  const style = splitFont(field.font);
  document.getElementById("formStyleBold").classList.toggle("active", style.bold);
  document.getElementById("formStyleItalic").classList.toggle("active", style.italic);
  document.getElementById("formStyleRegular").classList.toggle("active", !style.bold && !style.italic);
  document.getElementById("formSize").value = String(Math.round(field.size));
  const gap = Number(field.lineGap) || field.size * 1.15;
  document.getElementById("formLineGap").value = String(Math.round(gap * 10) / 10);
  document.getElementById("formVAlign").value = field.vAlign || "middle";
  document.getElementById("formColor").value = field.color || "#143826";
}

function blankFormDraft() {
  formDraft = { id: null, name: "", category: "Marriage", fields: [] };
  formPendingPdf = null;
  formPdfDoc = null;
  formSelectedId = null;
  formPageIndex = 0;
  document.getElementById("formTemplateName").value = "";
  document.getElementById("formTemplateCategory").value = "Marriage";
  document.getElementById("formTemplateFile").value = "";
  document.getElementById("formFileName").textContent = "No PDF";
  document.getElementById("formBuilderEditor").classList.remove("hidden");
  document.getElementById("formBuilderEmpty").classList.remove("hidden");
  document.getElementById("formBuilderCanvas").width = 0;
  document.getElementById("formBuilderCanvas").height = 0;
  document.getElementById("formBuilderOverlay").innerHTML = "";
  document.getElementById("formBuilderPage").innerHTML = `<option value="0">1</option>`;
  renderAttributeList();
  syncSelectionBar();
}

async function openFormTemplate(id) {
  const template = (formMeta.templates || []).find((item) => item.id === id);
  if (!template) return;
  formDraft = {
    id: template.id,
    name: template.name,
    category: template.category,
    fields: (template.fields || []).map((field) => ({
      ...field,
      kind: field.kind || (field.key === "qr" ? "qr" : String(field.key).startsWith("sign") ? "sign" : "text"),
      boxH: field.boxH || (field.key === "qr" ? 72 : Math.max(14, Number(field.size) || 11) / 0.72),
    })),
  };
  formPendingPdf = null;
  formSelectedId = null;
  document.getElementById("formTemplateName").value = template.name;
  document.getElementById("formTemplateCategory").value = template.category;
  document.getElementById("formTemplateFile").value = "";
  document.getElementById("formFileName").textContent = template.hasPdf ? "PDF ready" : "No PDF";
  document.getElementById("formBuilderEditor").classList.remove("hidden");
  renderAttributeList();
  await Promise.all(
    [...new Set((formDraft.fields || []).map((field) => splitFont(field.font).family))].map((family) => ensurePreviewFont(family))
  );
  if (template.hasPdf && window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    formPdfDoc = await pdfjsLib.getDocument({ url: `/api/form-templates/${template.id}/file`, withCredentials: true }).promise;
    formPageIndex = 0;
    fillFormPageSelect();
    await renderFormPage();
  }
  syncSelectionBar();
}

function fillFormPageSelect() {
  const select = document.getElementById("formBuilderPage");
  const count = formPdfDoc?.numPages || 1;
  select.innerHTML = Array.from({ length: count }, (_, index) => `<option value="${index}">${index + 1}</option>`).join("");
  select.value = String(formPageIndex);
}

async function renderFormPage() {
  if (!formPdfDoc) return;
  const page = await formPdfDoc.getPage(formPageIndex + 1);
  const base = page.getViewport({ scale: 1 });
  formPageHeight = base.height;
  formPageWidth = base.width;
  const stage = document.getElementById("formBuilderStage");
  formFitScale = Math.max(280, (stage.clientWidth || 680) - 28) / base.width;
  formScale = formFitScale * formUserZoom;
  const viewport = page.getViewport({ scale: formScale });
  const canvas = document.getElementById("formBuilderCanvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const overlay = document.getElementById("formBuilderOverlay");
  overlay.style.width = `${viewport.width}px`;
  overlay.style.height = `${viewport.height}px`;
  document.getElementById("formBuilderEmpty").classList.add("hidden");
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  drawFormBoxes();
}

function drawFormBoxes() {
  const overlay = document.getElementById("formBuilderOverlay");
  overlay.innerHTML = (formDraft?.fields || [])
    .filter((field) => Number(field.page) === formPageIndex)
    .map((field) => {
      const height = Number(field.boxH) || 18;
      const left = Number(field.x) * formScale;
      const top = (formPageHeight - Number(field.y) - height) * formScale;
      const style = splitFont(field.font);
      const justify = field.align === "center" ? "center" : field.align === "right" ? "flex-end" : "flex-start";
      const vAlign = field.vAlign || "middle";
      const alignItems = vAlign === "top" ? "flex-start" : vAlign === "bottom" ? "flex-end" : "center";
      const gap = Number(field.lineGap) || Number(field.size) * 1.15;
      const lineHeight = Math.max(0.9, gap / Math.max(Number(field.size) || 11, 1));
      return `<div class="pdf-box${field.id === formSelectedId ? " selected" : ""} kind-${esc(field.kind || "text")}" data-chip="${esc(field.id)}" style="left:${left}px;top:${top}px;width:${Number(field.maxW) * formScale}px;height:${height * formScale}px;justify-content:${justify};align-items:${alignItems};white-space:pre-line;line-height:${lineHeight};font-family:${cssFontFamily(style.family)};font-size:${Math.max(10, Number(field.size) * formScale)}px;font-weight:${style.bold ? 700 : 400};font-style:${style.italic ? "italic" : "normal"};color:${esc(field.color || "#143826")}">
        <span>${esc(field.label || field.key)}</span>
        <i class="pdf-handle" data-resize="${esc(field.id)}"></i>
      </div>`;
    })
    .join("");
}

function placeField(item, point) {
  if (!formDraft || !formPdfDoc) {
    formError("Upload a PDF first");
    return;
  }
  formError("");
  const box = defaultBox(item.kind, item.key);
  const id = `f${Date.now().toString(36)}`;
  const x = Math.max(0, point.x / formScale);
  const y = Math.max(0, formPageHeight - point.y / formScale - box.boxH);
  formDraft.fields.push({
    id,
    key: item.key,
    label: item.label,
    kind: item.kind,
    page: formPageIndex,
    x,
    y,
    size: box.size,
    maxW: box.maxW,
    boxH: box.boxH,
    lineGap: box.lineGap,
    font: item.kind === "text" ? joinFont(formFontFamily, false, false) : "Helvetica",
    color: "#143826",
    align: "left",
    vAlign: /address|notes/i.test(item.key) ? "top" : "middle",
  });
  formSelectedId = id;
  drawFormBoxes();
  syncSelectionBar();
}

function canvasPoint(event) {
  const rect = document.getElementById("formBuilderCanvas").getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function readFormDraftFromInputs() {
  formDraft.name = document.getElementById("formTemplateName").value.trim();
  formDraft.category = document.getElementById("formTemplateCategory").value.trim() || "Marriage";
}

async function saveFormTemplate() {
  readFormDraftFromInputs();
  if (!formDraft.name) throw new Error("Form name is required");
  const body = {
    name: formDraft.name,
    category: formDraft.category,
    active: true,
    fields: formDraft.fields,
  };
  const saved = formDraft.id
    ? await api(`/api/form-templates/${formDraft.id}`, { method: "PUT", body: JSON.stringify(body) })
    : await api("/api/form-templates", { method: "POST", body: JSON.stringify(body) });
  formDraft.id = saved.id;
  if (formPendingPdf) {
    const upload = await fetch(`/api/form-templates/${saved.id}/file`, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: formPendingPdf,
    });
    if (!upload.ok) {
      const err = await upload.json().catch(() => ({}));
      throw new Error(err.error || "PDF upload failed");
    }
    formPendingPdf = null;
  }
  await loadFormBuilder();
  return saved;
}

async function setFormZoom(next) {
  formUserZoom = Math.min(3, Math.max(0.4, next));
  document.getElementById("formZoomLabel").textContent = `${Math.round(formUserZoom * 100)}%`;
  if (formPdfDoc) await renderFormPage();
}

document.getElementById("formZoomIn")?.addEventListener("click", () => setFormZoom(formUserZoom + 0.15));
document.getElementById("formZoomOut")?.addEventListener("click", () => setFormZoom(formUserZoom - 0.15));
document.getElementById("formEyedropBtn")?.addEventListener("click", () => {
  formEyedrop = !formEyedrop;
  document.getElementById("formEyedropBtn").classList.toggle("active", formEyedrop);
  document.getElementById("formBuilderStage")?.classList.toggle("is-eyedrop", formEyedrop);
  formError(formEyedrop ? "Click the field whose size and text you want to copy" : "");
});

function typingInField(event) {
  const tag = event.target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target?.isContentEditable;
}

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || typingInField(event)) return;
  const editor = document.getElementById("formBuilderEditor");
  if (!editor || editor.classList.contains("hidden")) return;
  event.preventDefault();
  formSpace = true;
  document.getElementById("formBuilderStage")?.classList.add("is-space");
});
window.addEventListener("keyup", (event) => {
  if (event.code !== "Space") return;
  formSpace = false;
  formPan = null;
  document.getElementById("formBuilderStage")?.classList.remove("is-space", "is-panning");
});
document.getElementById("formBuilderStage")?.addEventListener("pointerdown", (event) => {
  if (!formSpace) return;
  const panStage = document.getElementById("formBuilderStage");
  event.preventDefault();
  formPan = { x: event.clientX, y: event.clientY, left: panStage.scrollLeft, top: panStage.scrollTop };
  panStage.classList.add("is-panning");
  panStage.setPointerCapture?.(event.pointerId);
});
document.getElementById("formBuilderStage")?.addEventListener("pointermove", (event) => {
  if (!formPan) return;
  const panStage = document.getElementById("formBuilderStage");
  panStage.scrollLeft = formPan.left - (event.clientX - formPan.x);
  panStage.scrollTop = formPan.top - (event.clientY - formPan.y);
});
document.getElementById("formBuilderStage")?.addEventListener("pointerup", () => {
  formPan = null;
  document.getElementById("formBuilderStage")?.classList.remove("is-panning");
});

document.getElementById("formExpandBtn")?.addEventListener("click", async () => {
  const editor = document.getElementById("formBuilderEditor");
  const open = editor.classList.toggle("is-expanded");
  document.getElementById("formExpandBtn").innerHTML = open
    ? `<i class="fa-solid fa-compress"></i>`
    : `<i class="fa-solid fa-expand"></i>`;
  document.getElementById("formExpandBtn").title = open ? "Exit big screen" : "Big screen";
  if (formPdfDoc) await renderFormPage();
});

document.getElementById("newFormTemplateBtn")?.addEventListener("click", () => {
  formError("");
  blankFormDraft();
});
document.getElementById("closeFormBuilder")?.addEventListener("click", () => {
  document.getElementById("formBuilderEditor").classList.add("hidden");
  document.getElementById("formBuilderEditor").classList.remove("is-expanded");
});
document.getElementById("formBuilderPage")?.addEventListener("change", async (event) => {
  formPageIndex = Number(event.target.value) || 0;
  await renderFormPage();
});
document.getElementById("formTemplateCategory")?.addEventListener("input", renderAttributeList);
document.getElementById("formAttrSearch")?.addEventListener("input", renderAttributeList);
document.getElementById("formTemplateFile")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file || !window.pdfjsLib) return;
  formError("");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const bytes = await file.arrayBuffer();
  formPendingPdf = bytes.slice(0);
  formPdfDoc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
  formPageIndex = 0;
  formUserZoom = 1;
  document.getElementById("formZoomLabel").textContent = "100%";
  document.getElementById("formFileName").textContent = file.name;
  fillFormPageSelect();
  await renderFormPage();
});

document.getElementById("formAttrList")?.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-place-key]");
  if (!item) return;
  event.dataTransfer.setData(
    "application/x-kkt-field",
    JSON.stringify({ key: item.dataset.placeKey, kind: item.dataset.placeKind, label: item.dataset.placeLabel })
  );
  event.dataTransfer.effectAllowed = "copy";
});
document.getElementById("formAttrList")?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-place-key]");
  if (!item || !formPdfDoc) {
    if (item) formError("Upload a PDF first");
    return;
  }
  const canvas = document.getElementById("formBuilderCanvas");
  placeField(
    { key: item.dataset.placeKey, kind: item.dataset.placeKind, label: item.dataset.placeLabel },
    { x: canvas.width * 0.35, y: canvas.height * 0.2 + (formDraft.fields.length % 8) * 22 }
  );
});

const stage = document.getElementById("formBuilderStage");
stage?.addEventListener("dragover", (event) => {
  event.preventDefault();
});
stage?.addEventListener("drop", (event) => {
  event.preventDefault();
  const raw = event.dataTransfer.getData("application/x-kkt-field");
  if (!raw) return;
  placeField(JSON.parse(raw), canvasPoint(event));
});

document.getElementById("formBuilderOverlay")?.addEventListener("pointerdown", (event) => {
  if (formSpace) return;
  const resize = event.target.closest("[data-resize]");
  const box = event.target.closest("[data-chip]");
  if (!box || !formDraft) return;
  if (formEyedrop) {
    event.preventDefault();
    event.stopPropagation();
    const source = formDraft.fields.find((item) => item.id === box.dataset.chip);
    const target = formDraft.fields.find((item) => item.id === formSelectedId && item.id !== source?.id);
    if (source && target && target.kind === "text") {
      target.font = source.font || "Helvetica";
      target.size = source.kind === "text" ? source.size : Math.min(48, Math.max(6, source.boxH * 0.72));
      target.boxH = target.size / 0.72;
      target.color = source.color || "#143826";
      target.align = source.align || "left";
      target.vAlign = source.vAlign || "middle";
      if (source.lineGap) target.lineGap = source.lineGap;
      formSelectedId = target.id;
      drawFormBoxes();
      syncSelectionBar();
    } else if (source) {
      formSelectedId = source.id;
      syncSelectionBar();
    }
    formEyedrop = false;
    document.getElementById("formEyedropBtn")?.classList.remove("active");
    document.getElementById("formBuilderStage")?.classList.remove("is-eyedrop");
    formError("");
    return;
  }
  event.preventDefault();
  formSelectedId = box.dataset.chip;
  const field = selectedFormField();
  const point = canvasPoint(event);
  formPointer = resize
    ? { mode: "resize", id: field.id, x: point.x, y: point.y, maxW: field.maxW, boxH: field.boxH, size: field.size }
    : {
        mode: "move",
        id: field.id,
        dx: point.x - field.x * formScale,
        dy: point.y - (formPageHeight - field.y - field.boxH) * formScale,
      };
  box.setPointerCapture?.(event.pointerId);
  document.querySelectorAll(".pdf-box").forEach((el) => el.classList.toggle("selected", el.dataset.chip === formSelectedId));
  syncSelectionBar();
});
document.getElementById("formBuilderOverlay")?.addEventListener("pointermove", (event) => {
  if (!formPointer) return;
  const field = formDraft.fields.find((item) => item.id === formPointer.id);
  if (!field) return;
  const point = canvasPoint(event);
  if (formPointer.mode === "move") {
    field.x = Math.max(0, (point.x - formPointer.dx) / formScale);
    const top = (point.y - formPointer.dy) / formScale;
    field.y = Math.max(0, formPageHeight - top - field.boxH);
  } else {
    field.maxW = Math.max(24, formPointer.maxW + (point.x - formPointer.x) / formScale);
    field.boxH = Math.max(12, formPointer.boxH + (point.y - formPointer.y) / formScale);
    if (field.kind === "text") field.size = Math.min(48, Math.max(6, field.boxH * 0.72));
  }
  const box = document.querySelector(`[data-chip="${field.id}"]`);
  if (!box) return;
  paintBox(box, field);
  if (field.kind === "text") document.getElementById("formSize").value = String(Math.round(field.size));
});
document.getElementById("formBuilderOverlay")?.addEventListener("pointerup", () => {
  formPointer = null;
});

function currentFontChoice() {
  return joinFont(
    formFontFamily || "Helvetica",
    document.getElementById("formStyleBold").classList.contains("active"),
    document.getElementById("formStyleItalic").classList.contains("active")
  );
}

async function applyFontFamily(family) {
  if (!formDraft || !family) return;
  formFontFamily = family;
  try {
    await ensurePreviewFont(family);
  } catch (err) {
    formError(err.message || "Could not preview that font");
  }
  const selected = selectedFormField();
  const targets = selected?.kind === "text" ? [selected] : (formDraft.fields || []).filter((field) => field.kind === "text");
  targets.forEach((field) => {
    const style = splitFont(field.font);
    field.font = joinFont(family, style.bold, style.italic);
  });
  drawFormBoxes();
  syncSelectionBar();
}

async function applyToolbar() {
  const field = selectedFormField();
  if (!field) return;
  if (field.kind === "sign") {
    field.align = document.getElementById("formAlign").value;
    drawFormBoxes();
    syncSelectionBar();
    return;
  }
  if (field.kind !== "text") return;
  field.font = currentFontChoice();
  const nextSize = Math.min(48, Math.max(6, Number(document.getElementById("formSize").value) || 11));
  const nextGap = Math.min(40, Math.max(6, Number(document.getElementById("formLineGap").value) || nextSize * 1.15));
  field.size = nextSize;
  field.lineGap = nextGap;
  // Keep tall address boxes when only the font size changes.
  const minBox = nextSize / 0.72;
  if (!field.boxH || field.boxH < minBox * 1.35) field.boxH = minBox;
  field.color = document.getElementById("formColor").value;
  field.align = document.getElementById("formAlign").value;
  field.vAlign = document.getElementById("formVAlign").value || "middle";
  drawFormBoxes();
  syncSelectionBar();
}
["formSize", "formLineGap", "formColor", "formAlign", "formVAlign"].forEach((id) => {
  document.getElementById(id)?.addEventListener("input", applyToolbar);
});
document.getElementById("formFontList")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-font]");
  if (!button) return;
  applyFontFamily(button.dataset.font);
});
document.getElementById("formStyleRegular")?.addEventListener("click", () => {
  document.getElementById("formStyleBold").classList.remove("active");
  document.getElementById("formStyleItalic").classList.remove("active");
  applyToolbar();
});
document.getElementById("formStyleBold")?.addEventListener("click", () => {
  document.getElementById("formStyleBold").classList.toggle("active");
  applyToolbar();
});
document.getElementById("formStyleItalic")?.addEventListener("click", () => {
  document.getElementById("formStyleItalic").classList.toggle("active");
  applyToolbar();
});
document.getElementById("formFontFile")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!/\.(ttf|otf)$/i.test(file.name)) {
    formError("Upload a TTF or OTF font");
    return;
  }
  try {
    formError("");
    const added = await api("/api/form-fonts", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Font-Name": encodeURIComponent(file.name),
      },
      body: await file.arrayBuffer(),
    });
    formMeta = await api("/api/form-templates");
    await applyFontFamily(added.family);
  } catch (err) {
    formError(err.message || "Could not add that font");
  }
});
document.getElementById("formDeleteField")?.addEventListener("click", () => {
  if (!formDraft || !formSelectedId) return;
  formDraft.fields = formDraft.fields.filter((field) => field.id !== formSelectedId);
  formSelectedId = null;
  drawFormBoxes();
  syncSelectionBar();
});

document.getElementById("formTemplateList")?.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit-form]");
  const remove = event.target.closest("[data-delete-form]");
  try {
    formError("");
    if (edit) await openFormTemplate(edit.dataset.editForm);
    if (remove) {
      if (!confirm("Delete this form?")) return;
      await api(`/api/form-templates/${remove.dataset.deleteForm}`, { method: "DELETE" });
      if (formDraft?.id === remove.dataset.deleteForm) document.getElementById("formBuilderEditor").classList.add("hidden");
      await loadFormBuilder();
    }
  } catch (err) {
    formError(err.message || "Could not update the form");
  }
});

document.getElementById("saveFormTemplateBtn")?.addEventListener("click", async () => {
  try {
    formError("");
    await saveFormTemplate();
  } catch (err) {
    formError(err.message || "Could not save");
  }
});

window.downloadCategoryPdf = async function (category, recordId) {
  const res = await fetch(`/api/form-fill/${encodeURIComponent(category)}/${encodeURIComponent(recordId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error || "No form is set up for this category");
    return;
  }
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${category}-form.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};
