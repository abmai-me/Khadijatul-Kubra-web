(function () {
  const grid = document.getElementById("mediaKitGrid");
  if (!grid) return;
  const buttons = document.querySelectorAll("[data-mk-view]");
  let kits = [];
  let view = localStorage.getItem("kkt-media-view") === "list" ? "list" : "box";

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function publishedLabel(value) {
    const date = new Date(`${value || ""}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value || "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }

  function fileLink(kit, kind, label) {
    if (!kit.files?.[kind]) return `<span class="mk-missing">${label}</span>`;
    const pin = kit.pinRequired ? ' data-pin="1"' : "";
    return `<a${pin} href="/api/public/media-kits/${encodeURIComponent(kit.id)}/file/${kind}">${label}</a>`;
  }

  function card(kit) {
    const preview = kit.previewUrl || "assets/images/logo.png";
    const zip = kit.hasZip
      ? `<a class="mk-zip"${kit.pinRequired ? ' data-pin="1"' : ""} href="/api/public/media-kits/${encodeURIComponent(kit.id)}/zip">Full Zip</a>`
      : `<span class="mk-zip mk-missing">Full Zip</span>`;
    return `<article class="mk-card">
      <div class="mk-preview">
        ${kit.pinned ? `<span class="mk-pin">Pinned</span>` : ""}
        <img src="${esc(preview)}" alt="${esc(kit.title)}">
      </div>
      <div class="mk-body">
        <div class="mk-copy">
          <p class="mk-date"><span class="icon fa-solid fa-clock fa-fw"></span>${esc(publishedLabel(kit.publishedAt))}</p>
          <h3 class="mk-title">${esc(kit.title)}${kit.pinRequired ? `<span class="mk-lock">PIN</span>` : ""}</h3>
          <p class="mk-note">Choose your file variant</p>
          <ul class="mk-facts">
            <li>Style : ${esc(kit.style || "—")}</li>
            <li>Version ${esc(kit.version || "1.0")}</li>
          </ul>
        </div>
        <div class="mk-actions">
          <div class="mk-files">
            ${fileLink(kit, "ai", "Ai")}
            ${fileLink(kit, "eps", "EPS")}
            ${fileLink(kit, "pdf", "PDF")}
            ${fileLink(kit, "png", "PNG")}
            ${fileLink(kit, "jpg", "JPG")}
          </div>
          ${zip}
        </div>
      </div>
    </article>`;
  }

  function paint() {
    buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.mkView === view));
    grid.classList.toggle("is-list", view === "list");
    if (!kits.length) {
      grid.innerHTML = `<p class="mk-empty">No media kits have been published yet.</p>`;
      return;
    }
    grid.innerHTML = kits.map(card).join("");
  }

  let pendingDownload = "";
  const pinModal = document.getElementById("mkPinModal");
  const pinInput = document.getElementById("mkPinInput");
  const pinError = document.getElementById("mkPinError");

  function filenameFrom(response, fallback) {
    const header = response.headers.get("Content-Disposition") || "";
    const match = header.match(/filename="([^"]+)"/);
    return match ? match[1] : fallback;
  }

  async function saveDownload(url, fallbackName) {
    const response = await fetch(url);
    if (response.status === 403) return false;
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filenameFrom(response, fallbackName);
    link.click();
    URL.revokeObjectURL(link.href);
    return true;
  }

  grid.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-pin='1']");
    if (!link) return;
    event.preventDefault();
    pendingDownload = link.getAttribute("href");
    pinInput.value = "";
    pinError.hidden = true;
    pinModal.hidden = false;
    pinInput.focus();
  });

  document.getElementById("mkPinClose")?.addEventListener("click", () => {
    pinModal.hidden = true;
  });

  document.getElementById("mkPinForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const url = `${pendingDownload}${pendingDownload.includes("?") ? "&" : "?"}pin=${encodeURIComponent(pinInput.value.trim())}`;
    const ok = await saveDownload(url, "media-kit");
    pinError.hidden = ok;
    if (ok) pinModal.hidden = true;
  });

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.mkView === "list" ? "list" : "box";
      localStorage.setItem("kkt-media-view", view);
      paint();
    });
  });

  fetch("/api/public/media-kits")
    .then((res) => res.json())
    .then((data) => {
      kits = Array.isArray(data) ? data : [];
      paint();
    })
    .catch(() => {
      grid.innerHTML = `<p class="mk-empty">Media kits could not be loaded.</p>`;
    });
})();
