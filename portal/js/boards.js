const BOARD_COPY = {
  notice: {
    heading: "Notice",
    lead: "Add a notice and it appears on the Notice Board page.",
    page: "/notice.html",
    empty: "No notices yet.",
  },
  vacancy: {
    heading: "Vacancy",
    lead: "Add a vacancy and it appears on the Vacancies page.",
    page: "/vacancy.html",
    empty: "No vacancies yet.",
  },
};

const boardState = { notice: "list", vacancy: "list", editing: "" };

function boardIcons() {
  return [
    "fa-file-lines", "fa-file-pdf", "fa-bullhorn", "fa-bell", "fa-calendar-days", "fa-mosque",
    "fa-book-open", "fa-graduation-cap", "fa-users", "fa-briefcase", "fa-user-tie", "fa-handshake",
    "fa-envelope", "fa-location-dot", "fa-clock", "fa-star", "fa-heart", "fa-hand-holding-heart",
    "fa-comments", "fa-circle-info", "fa-clipboard-list", "fa-building-columns", "fa-scale-balanced",
    "fa-child-reaching", "fa-chalkboard-user", "fa-scroll", "fa-landmark", "fa-globe",
  ];
}

function boardShell(kind) {
  const copy = BOARD_COPY[kind];
  const root = document.getElementById(`view-${kind}`);
  if (!root || root.dataset.ready) return root;
  root.dataset.ready = "1";
  root.innerHTML = `
    <div class="topbar">
      <div>
        <h2>${copy.heading}</h2>
        <p>${copy.lead}</p>
      </div>
    </div>
    <div class="card">
      <div class="panel-head">
        <div>
          <h3>${copy.heading}s</h3>
          <p class="muted">Choose an icon, then save. List and box use the same items.</p>
        </div>
        <div class="actions">
          <div class="mk-view-toggle" role="group">
            <button type="button" class="mk-view-btn is-active" data-board-view="list">List</button>
            <button type="button" class="mk-view-btn" data-board-view="box">Box</button>
          </div>
          <button class="btn btn-primary" type="button" data-board-add>Add</button>
          <a class="btn btn-gold" href="${copy.page}" target="_blank"><i class="fa-solid fa-eye"></i> View page</a>
        </div>
      </div>
      <form class="form-grid hidden" data-board-form>
        <div class="form-group full"><h3 data-board-form-title>New ${copy.heading.toLowerCase()}</h3></div>
        <div class="form-group"><label>Title</label><input data-field="title" maxlength="120" required></div>
        <div class="form-group"><label>Published date</label><input data-field="date" type="date"></div>
        <div class="form-group"><label>Time</label><input data-field="time" maxlength="20" placeholder="8.00pm"></div>
        <div class="form-group">
          <label>Pin</label>
          <label class="mk-pin-toggle"><input data-field="pin" type="checkbox"> Pin to the top</label>
        </div>
        <div class="form-group full"><label>Short note</label><input data-field="note" maxlength="180" placeholder="Optional"></div>
        <div class="form-group full">
          <label>Details</label>
          <div class="rich-sheet">
            <div class="rich-toolbar" data-rich-tools>
              <span class="rich-group">
                <button type="button" data-cmd="undo" title="Undo"><i class="fa-solid fa-rotate-left"></i></button>
                <button type="button" data-cmd="redo" title="Redo"><i class="fa-solid fa-rotate-right"></i></button>
              </span>
              <span class="rich-group">
                <select data-block aria-label="Style">
                  <option value="p">Normal</option>
                  <option value="h2">Heading</option>
                  <option value="h3">Subheading</option>
                </select>
                <select data-font aria-label="Font">
                  <option value="Lexend">Lexend</option>
                  <option value="Inter">Inter</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                </select>
                <select data-size-pick aria-label="Size">
                  <option>12</option><option>14</option><option selected>16</option><option>18</option>
                  <option>20</option><option>24</option><option>28</option><option>32</option><option>36</option><option>48</option>
                </select>
              </span>
              <span class="rich-group">
                <button type="button" data-cmd="bold" title="Bold"><i class="fa-solid fa-bold"></i></button>
                <button type="button" data-cmd="italic" title="Italic"><i class="fa-solid fa-italic"></i></button>
                <button type="button" data-cmd="underline" title="Underline"><i class="fa-solid fa-underline"></i></button>
                <button type="button" data-cmd="removeFormat" title="Clear formatting"><i class="fa-solid fa-eraser"></i></button>
              </span>
              <span class="rich-group">
                <label class="rich-color" title="Text color">A <input type="color" data-color value="#143826"></label>
                <label class="rich-color" title="Highlight">H <input type="color" data-hilite value="#f3b815"></label>
              </span>
              <span class="rich-group">
                <button type="button" data-cmd="justifyLeft" title="Align left"><i class="fa-solid fa-align-left"></i></button>
                <button type="button" data-cmd="justifyCenter" title="Align center"><i class="fa-solid fa-align-center"></i></button>
                <button type="button" data-cmd="justifyRight" title="Align right"><i class="fa-solid fa-align-right"></i></button>
                <button type="button" data-cmd="justifyFull" title="Justify"><i class="fa-solid fa-align-justify"></i></button>
              </span>
              <span class="rich-group">
                <button type="button" data-cmd="insertUnorderedList" title="Bullet list"><i class="fa-solid fa-list-ul"></i></button>
                <button type="button" data-cmd="insertOrderedList" title="Numbered list"><i class="fa-solid fa-list-ol"></i></button>
              </span>
            </div>
            <div class="rich-box" data-field="details" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Write the ${copy.heading.toLowerCase()} here"></div>
          </div>
        </div>
        <div class="form-group full">
          <label>Icon</label>
          <div class="icon-pack" data-icon-pack></div>
          <input type="hidden" data-field="icon" value="fa-file-lines">
        </div>
        <div class="form-group full">
          <label>Document</label>
          <input data-field="file" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf">
          <p class="muted" data-file-note></p>
        </div>
        <div class="form-group full actions">
          <button class="btn btn-primary" type="submit">Save</button>
          <button class="btn btn-secondary" type="button" data-board-close>Close</button>
        </div>
      </form>
      <div class="mk-admin-list" data-board-list></div>
    </div>`;
  const pack = root.querySelector("[data-icon-pack]");
  pack.innerHTML = boardIcons().map((icon) =>
    `<button type="button" class="icon-pick" data-icon="${icon}" title="${icon.replace("fa-", "")}"><i class="fa-solid ${icon}"></i></button>`
  ).join("");
  root.querySelector("[data-board-add]").addEventListener("click", () => openBoardForm(kind));
  root.querySelector("[data-board-close]").addEventListener("click", () => closeBoardForm(kind));
  root.querySelector("[data-board-form]").addEventListener("submit", (event) => saveBoard(kind, event));
  root.querySelectorAll("[data-board-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      boardState[kind] = btn.dataset.boardView;
      root.querySelectorAll("[data-board-view]").forEach((item) => item.classList.toggle("is-active", item === btn));
      root.querySelector("[data-board-list]").classList.toggle("is-box", boardState[kind] === "box");
    });
  });
  pack.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-icon]");
    if (!btn) return;
    root.querySelector("[data-field='icon']").value = btn.dataset.icon;
    paintIconPick(root);
  });
  wireRichEditor(root);
  return root;
}

function wireRichEditor(root) {
  const editor = root.querySelector("[data-field='details']");
  const tools = root.querySelector("[data-rich-tools]");
  if (!editor || !tools) return;
  let savedRange = null;
  const keepRange = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || !editor.contains(sel.anchorNode)) return;
    savedRange = sel.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    editor.focus();
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  };
  editor.addEventListener("mouseup", keepRange);
  editor.addEventListener("keyup", keepRange);
  tools.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) event.preventDefault();
  });
  tools.addEventListener("click", (event) => {
    const cmd = event.target.closest("[data-cmd]");
    if (!cmd) return;
    restoreRange();
    document.execCommand(cmd.dataset.cmd, false, null);
    keepRange();
  });
  tools.querySelector("[data-font]").addEventListener("change", (event) => {
    restoreRange();
    document.execCommand("fontName", false, event.target.value);
    keepRange();
  });
  tools.querySelector("[data-size-pick]").addEventListener("change", (event) => {
    restoreRange();
    setRichSize(editor, Number(event.target.value));
    keepRange();
  });
  tools.querySelector("[data-block]").addEventListener("change", (event) => {
    restoreRange();
    document.execCommand("formatBlock", false, event.target.value);
    keepRange();
  });
  tools.querySelector("[data-color]").addEventListener("input", (event) => {
    restoreRange();
    document.execCommand("foreColor", false, event.target.value);
    keepRange();
  });
  tools.querySelector("[data-hilite]").addEventListener("input", (event) => {
    restoreRange();
    document.execCommand("hiliteColor", false, event.target.value);
    keepRange();
  });
}

function setRichSize(editor, px) {
  const next = Math.min(48, Math.max(12, Number(px) || 16));
  document.execCommand("fontSize", false, "7");
  editor.querySelectorAll('font[size="7"]').forEach((font) => {
    const span = document.createElement("span");
    span.style.fontSize = `${next}px`;
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
}

function richHtml(root) {
  const editor = root.querySelector("[data-field='details']");
  if (!editor) return "";
  editor.querySelectorAll("font").forEach((font) => {
    const span = document.createElement("span");
    if (font.color) span.style.color = font.color;
    if (font.face) span.style.fontFamily = font.face;
    const sizes = { 1: "12px", 2: "14px", 3: "16px", 4: "18px", 5: "22px", 6: "28px", 7: "36px" };
    if (font.size && sizes[font.size]) span.style.fontSize = sizes[font.size];
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
  return editor.innerHTML.trim();
}

function paintIconPick(root) {
  const current = root.querySelector("[data-field='icon']").value;
  root.querySelectorAll("[data-icon]").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.icon === current));
}

function closeBoardForm(kind) {
  const root = boardShell(kind);
  const form = root.querySelector("[data-board-form]");
  form.reset();
  form.classList.add("hidden");
  root.querySelector("[data-field='icon']").value = "fa-file-lines";
  root.querySelector("[data-file-note]").textContent = "";
  const editor = root.querySelector("[data-field='details']");
  if (editor) editor.innerHTML = "";
  boardState.editing = "";
  paintIconPick(root);
}

function openBoardForm(kind, item) {
  const root = boardShell(kind);
  const form = root.querySelector("[data-board-form]");
  form.classList.remove("hidden");
  form.querySelector("[data-field='title']").value = item?.title || "";
  form.querySelector("[data-field='date']").value = item?.publishedAt || new Date().toISOString().slice(0, 10);
  form.querySelector("[data-field='time']").value = item?.time || "";
  form.querySelector("[data-field='note']").value = item?.note || "";
  form.querySelector("[data-field='pin']").checked = Boolean(item?.pinned);
  form.querySelector("[data-field='icon']").value = item?.icon || "fa-file-lines";
  const editor = root.querySelector("[data-field='details']");
  if (editor) editor.innerHTML = item?.details || "";
  form.querySelector("[data-field='file']").value = "";
  root.querySelector("[data-file-note]").textContent = item?.fileUrl ? "A document is already attached. Upload only if you want to replace it." : "";
  root.querySelector("[data-board-form-title]").textContent = item ? `Edit ${BOARD_COPY[kind].heading.toLowerCase()}` : `New ${BOARD_COPY[kind].heading.toLowerCase()}`;
  boardState.editing = item?.id || "";
  paintIconPick(root);
}

async function loadBoard(kind) {
  const root = boardShell(kind);
  const items = await api(`/api/boards/${kind}`);
  const list = root.querySelector("[data-board-list]");
  list.classList.toggle("is-box", boardState[kind] === "box");
  if (!items.length) {
    list.innerHTML = `<p class="muted">${BOARD_COPY[kind].empty}</p>`;
    return;
  }
  list.innerHTML = items.map((item) => `
    <article class="mk-admin-card board-admin-card">
      <span class="board-icon"><i class="fa-solid ${item.icon}"></i></span>
      <div>
        <strong>${esc(item.title)}</strong>
        ${item.pinned ? '<span class="mk-badge">Pinned</span>' : ""}
        <p class="muted">${esc(item.publishedAt || "No date")}${item.time ? ` · ${esc(item.time)}` : ""}</p>
        <p class="muted">${item.fileUrl ? "Document attached" : "No document yet"}</p>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" type="button" data-edit="${item.id}">Edit</button>
        <button class="btn btn-secondary" type="button" data-pin="${item.id}">${item.pinned ? "Unpin" : "Pin"}</button>
        <button class="btn btn-danger" type="button" data-delete="${item.id}">Delete</button>
      </div>
    </article>`).join("");
  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openBoardForm(kind, items.find((item) => item.id === btn.dataset.edit)));
  });
  list.querySelectorAll("[data-pin]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = items.find((row) => row.id === btn.dataset.pin);
      await api(`/api/boards/${kind}/${item.id}`, { method: "PUT", body: JSON.stringify({ pinned: !item.pinned }) });
      loadBoard(kind);
    });
  });
  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this item?")) return;
      await api(`/api/boards/${kind}/${btn.dataset.delete}`, { method: "DELETE" });
      loadBoard(kind);
    });
  });
}

async function saveBoard(kind, event) {
  event.preventDefault();
  const root = boardShell(kind);
  try {
  const form = root.querySelector("[data-board-form]");
  const body = {
    title: form.querySelector("[data-field='title']").value.trim(),
    publishedAt: form.querySelector("[data-field='date']").value,
    time: form.querySelector("[data-field='time']").value.trim(),
    note: form.querySelector("[data-field='note']").value.trim(),
    icon: form.querySelector("[data-field='icon']").value,
    pinned: form.querySelector("[data-field='pin']").checked,
  };
  body.details = richHtml(root);
  const saved = boardState.editing
    ? await api(`/api/boards/${kind}/${boardState.editing}`, { method: "PUT", body: JSON.stringify(body) })
    : await api(`/api/boards/${kind}`, { method: "POST", body: JSON.stringify(body) });
  const file = form.querySelector("[data-field='file']").files[0];
  if (file) {
    const res = await fetch(`/api/boards/${kind}/${saved.id}/file`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "X-File-Name": encodeURIComponent(file.name) },
      body: file,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Could not upload the document");
    }
  }
  closeBoardForm(kind);
  boardState[kind] = "list";
  root.querySelectorAll("[data-board-view]").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.boardView === "list"));
  await loadBoard(kind);
  } catch (err) {
    alert(err.message || "Could not save");
  }
}

window.loadBoard = loadBoard;
