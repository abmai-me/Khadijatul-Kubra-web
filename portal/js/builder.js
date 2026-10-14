let cmsState = null;
let selectedPage = "index";
let menuDraft = [];

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

async function loadBuilder() {
  cmsState = await api("/api/cms");
  menuDraft = clone(cmsState.menu || []);
  fillHeaderForm();
  fillFooterForm();
  renderMenuEditor();
  renderPageList();
  selectedPage = Object.keys(cmsState.pages || {})[0] || "index";
  renderPageEditor();
  document.getElementById("cmsUpdatedAt").textContent = cmsState.updatedAt
    ? `Last published: ${new Date(cmsState.updatedAt).toLocaleString()}`
    : "Not published yet — save to go live";
}

function fillHeaderForm() {
  const h = cmsState.header || {};
  document.getElementById("cmsEmail").value = h.email || "";
  document.getElementById("cmsAddress").value = h.address || "";
  document.getElementById("cmsPhone").value = h.phone || "";
  document.getElementById("cmsCharity").value = h.charityNo || "";
}

function fillFooterForm() {
  const f = cmsState.footer || {};
  document.getElementById("ftAddress").value = f.address || "";
  document.getElementById("ftPhone").value = f.phone || "";
  document.getElementById("ftAbout").value = f.aboutText || "";
  document.getElementById("ftFacebook").value = f.facebook || "";
  document.getElementById("ftTwitter").value = f.twitter || "";
  document.getElementById("ftYoutube").value = f.youtube || "";
  document.getElementById("ftInstagram").value = f.instagram || "";
  document.getElementById("ftLinksTitle").value = f.linksTitle || "";
  document.getElementById("ftOtherTitle").value = f.otherTitle || "";
  document.getElementById("ftNewsTitle").value = f.newsletterTitle || "";
  document.getElementById("ftNewsText").value = f.newsletterText || "";
  document.getElementById("ftCopyright").value = f.copyright || "";
  document.getElementById("ftLinksJson").value = JSON.stringify(f.links || [], null, 2);
  document.getElementById("ftOtherJson").value = JSON.stringify(f.otherLinks || [], null, 2);
  document.getElementById("ftBottomJson").value = JSON.stringify(f.bottomLinks || [], null, 2);
}

function renderMenuItem(item, depth = 0) {
  const pad = depth * 18;
  const kids = item.children || [];
  return `
    <div class="menu-item" data-id="${item.id}" style="margin-left:${pad}px">
      <div class="menu-row">
        <input class="menu-label" value="${esc(item.label)}" placeholder="Label">
        <input class="menu-url" value="${esc(item.url || "")}" placeholder="URL e.g. about.html">
        <button type="button" class="btn btn-secondary btn-sm" onclick="addChildMenu('${item.id}')">+ Sub</button>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeMenu('${item.id}')">✕</button>
      </div>
      ${kids.map((c) => renderMenuItem(c, depth + 1)).join("")}
    </div>`;
}

function renderMenuEditor() {
  document.getElementById("menuEditor").innerHTML = menuDraft.length
    ? menuDraft.map((m) => renderMenuItem(m)).join("")
    : `<p class="muted">No menu items yet</p>`;
}

function collectMenuFromDom(container = document.getElementById("menuEditor")) {
  function walk(nodes) {
    const items = [];
    nodes.forEach((node) => {
      if (!node.classList?.contains("menu-item")) return;
      // only direct menu-item children of this level's wrapper - structure is nested inside parent menu-item
    });
    return items;
  }
  // Rebuild from flat tree using recursive DOM structure
  function parseItem(el) {
    const label = el.querySelector(":scope > .menu-row .menu-label")?.value?.trim() || "Item";
    const url = el.querySelector(":scope > .menu-row .menu-url")?.value?.trim() || "#";
    const id = el.getAttribute("data-id") || uid("m");
    const childItems = [...el.children].filter((c) => c.classList.contains("menu-item")).map(parseItem);
    return { id, label, url, children: childItems };
  }
  return [...container.children].filter((c) => c.classList.contains("menu-item")).map(parseItem);
}

function findMenuNode(list, id) {
  for (const item of list) {
    if (item.id === id) return item;
    const found = findMenuNode(item.children || [], id);
    if (found) return found;
  }
  return null;
}

function removeMenuNode(list, id) {
  const idx = list.findIndex((i) => i.id === id);
  if (idx >= 0) {
    list.splice(idx, 1);
    return true;
  }
  for (const item of list) {
    if (removeMenuNode(item.children || [], id)) return true;
  }
  return false;
}

window.addTopMenu = function () {
  menuDraft = collectMenuFromDom();
  menuDraft.push({ id: uid("m"), label: "New Item", url: "#", children: [] });
  renderMenuEditor();
};

window.addChildMenu = function (parentId) {
  menuDraft = collectMenuFromDom();
  const parent = findMenuNode(menuDraft, parentId);
  if (!parent) return;
  parent.children = parent.children || [];
  parent.children.push({ id: uid("m"), label: "Sub Item", url: "#", children: [] });
  renderMenuEditor();
};

window.removeMenu = function (id) {
  menuDraft = collectMenuFromDom();
  removeMenuNode(menuDraft, id);
  renderMenuEditor();
};

function renderPageList() {
  const pages = cmsState.pages || {};
  const box = document.getElementById("pageList");
  box.innerHTML = Object.keys(pages)
    .map((slug) => {
      const active = slug === selectedPage ? "active" : "";
      return `<button type="button" class="page-pill ${active}" onclick="selectPage('${slug}')">${esc(pages[slug].title || slug)} <small>${esc(slug)}</small></button>`;
    })
    .join("");
}

window.selectPage = function (slug) {
  selectedPage = slug;
  renderPageList();
  renderPageEditor();
};

function renderPageEditor() {
  const page = cmsState.pages[selectedPage];
  if (!page) {
    document.getElementById("pageEditor").innerHTML = `<p class="muted">Select a page</p>`;
    return;
  }
  document.getElementById("pageEditorTitle").textContent = `Editing: ${page.title} (${selectedPage}.html)`;
  document.getElementById("pageEditor").innerHTML = `
    <div class="form-group">
      <label>Page Title (admin label)</label>
      <input id="pageMetaTitle" value="${esc(page.title || "")}">
    </div>
    ${(page.blocks || [])
      .map((b, i) => {
        const field =
          b.type === "textarea" || b.type === "html"
            ? `<textarea data-block-i="${i}" rows="${b.type === "html" ? 8 : 4}">${esc(b.value || "")}</textarea>`
            : `<input data-block-i="${i}" value="${esc(b.value || "")}">`;
        return `<div class="form-group">
          <label>${esc(b.label || b.key)} <span class="muted">(${esc(b.key)})</span></label>
          ${field}
        </div>`;
      })
      .join("")}
    <div class="actions" style="margin-top:8px">
      <button type="button" class="btn btn-secondary" onclick="addPageBlock()">+ Add Field</button>
    </div>`;
}

window.addPageBlock = function () {
  const page = cmsState.pages[selectedPage];
  if (!page) return;
  const key = prompt("Field key (e.g. section_title)", `field_${Date.now().toString().slice(-4)}`);
  if (!key) return;
  const label = prompt("Field label", key) || key;
  page.blocks = page.blocks || [];
  page.blocks.push({ key, label, type: "textarea", value: "" });
  renderPageEditor();
};

window.addCmsPage = async function () {
  const title = prompt("New page title", "New Page");
  if (!title) return;
  const slug = prompt("Page slug (filename without .html)", title.toLowerCase().replace(/\s+/g, "-"));
  if (!slug) return;
  await api("/api/cms/pages", {
    method: "POST",
    body: JSON.stringify({ title, slug }),
  });
  await loadBuilder();
  selectedPage = slug;
  renderPageList();
  renderPageEditor();
};

async function saveHeader() {
  await api("/api/cms/header", {
    method: "PUT",
    body: JSON.stringify({
      email: document.getElementById("cmsEmail").value.trim(),
      address: document.getElementById("cmsAddress").value.trim(),
      phone: document.getElementById("cmsPhone").value.trim(),
      charityNo: document.getElementById("cmsCharity").value.trim(),
    }),
  });
  toast("Header saved — live on website");
  loadBuilder();
}

async function saveMenu() {
  menuDraft = collectMenuFromDom();
  await api("/api/cms/menu", {
    method: "PUT",
    body: JSON.stringify({ menu: menuDraft }),
  });
  toast("Menu saved — live on website");
  loadBuilder();
}

async function saveFooter() {
  let links = [];
  let otherLinks = [];
  let bottomLinks = [];
  try {
    links = JSON.parse(document.getElementById("ftLinksJson").value || "[]");
    otherLinks = JSON.parse(document.getElementById("ftOtherJson").value || "[]");
    bottomLinks = JSON.parse(document.getElementById("ftBottomJson").value || "[]");
  } catch (e) {
    alert("Footer link JSON is invalid. Fix and try again.");
    return;
  }
  await api("/api/cms/footer", {
    method: "PUT",
    body: JSON.stringify({
      address: document.getElementById("ftAddress").value.trim(),
      phone: document.getElementById("ftPhone").value.trim(),
      aboutText: document.getElementById("ftAbout").value.trim(),
      facebook: document.getElementById("ftFacebook").value.trim(),
      twitter: document.getElementById("ftTwitter").value.trim(),
      youtube: document.getElementById("ftYoutube").value.trim(),
      instagram: document.getElementById("ftInstagram").value.trim(),
      linksTitle: document.getElementById("ftLinksTitle").value.trim(),
      otherTitle: document.getElementById("ftOtherTitle").value.trim(),
      newsletterTitle: document.getElementById("ftNewsTitle").value.trim(),
      newsletterText: document.getElementById("ftNewsText").value.trim(),
      copyright: document.getElementById("ftCopyright").value.trim(),
      links,
      otherLinks,
      bottomLinks,
    }),
  });
  toast("Footer saved — live on website");
  loadBuilder();
}

async function savePage() {
  const page = cmsState.pages[selectedPage];
  if (!page) return;
  page.title = document.getElementById("pageMetaTitle").value.trim() || page.title;
  document.querySelectorAll("#pageEditor [data-block-i]").forEach((el) => {
    const i = Number(el.getAttribute("data-block-i"));
    if (page.blocks[i]) page.blocks[i].value = el.value;
  });
  await api(`/api/cms/pages/${selectedPage}`, {
    method: "PUT",
    body: JSON.stringify(page),
  });
  toast(`Page "${selectedPage}" saved — live on website`);
  loadBuilder();
}

function toast(msg) {
  const el = document.getElementById("builderToast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2500);
}

function showBuilderTab(name) {
  document.querySelectorAll(".builder-tab").forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".builder-panel").forEach((p) => p.classList.remove("active"));
  document.querySelector(`.builder-tab[data-tab="${name}"]`)?.classList.add("active");
  document.getElementById(`builder-${name}`)?.classList.add("active");
}

// wire after DOM
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".builder-tab").forEach((tab) => {
    tab.addEventListener("click", () => showBuilderTab(tab.dataset.tab));
  });
  document.getElementById("saveHeaderBtn")?.addEventListener("click", saveHeader);
  document.getElementById("saveMenuBtn")?.addEventListener("click", saveMenu);
  document.getElementById("saveFooterBtn")?.addEventListener("click", saveFooter);
  document.getElementById("savePageBtn")?.addEventListener("click", savePage);
  document.getElementById("addTopMenuBtn")?.addEventListener("click", addTopMenu);
  document.getElementById("addCmsPageBtn")?.addEventListener("click", addCmsPage);
});
