(function () {
  const root = document.getElementById("boardMount");
  if (!root) return;
  const kind = root.dataset.board === "vacancy" ? "vacancy" : "notice";
  const storageKey = `kkt-${kind}-view`;
  let view = localStorage.getItem(storageKey) === "list" ? "list" : "box";

  function text(value) {
    return String(value || "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function showInside(item) {
    const panel = document.getElementById("vacancyDetail");
    root.querySelector(".board-tools")?.setAttribute("hidden", "");
    const grid = root.querySelector("[data-board-grid]");
    if (grid) grid.hidden = true;
    if (!panel) return;
    const when = item ? [formatDate(item.publishedAt), item.time].filter(Boolean).join(" · ") : "";
    panel.hidden = false;
    panel.querySelector("[data-detail-when]").textContent = when;
    panel.querySelector("[data-detail-title]").textContent = item?.title || "Vacancy not found";
    panel.querySelector("[data-detail-body]").innerHTML = item
      ? (item.details || "<p>No details yet.</p>")
      : "<p>This vacancy is not on the list.</p>";
    const banner = document.querySelector(".prayer-time_time .title");
    const pageTitle = document.querySelector(".page-title h2");
    const title = item?.title || "Vacancy";
    if (banner) banner.textContent = title;
    if (pageTitle) pageTitle.textContent = title;
    document.title = `${title} | Khadijatul Kubra Trust`;
  }

  function card(item) {
    const when = [formatDate(item.publishedAt), item.time].filter(Boolean).join(" · ");
    const file = item.fileUrl
      ? `<a class="board-file" href="${item.fileUrl}" target="_blank" rel="noopener">${kind === "vacancy" ? "Open vacancy" : "Open notice"}</a>`
      : `<span class="board-file is-off">No file yet</span>`;
    const details = `<button type="button" class="board-details" data-open-detail="${text(item.id)}" aria-expanded="false">Details</button>`;
    const article = `<article class="board-card" data-id="${text(item.id)}">
      <div class="board-mark"><i class="fa-solid ${item.icon || "fa-file-lines"}"></i></div>
      <div class="board-copy">
        <p class="board-date">${text(when || "Published")}</p>
        <h3>${text(item.title)}</h3>
        ${item.note ? `<p>${text(item.note)}</p>` : ""}
      </div>
      <div class="board-side">${details}${file}</div>
    </article>`;
    return `<div class="board-item" data-id="${text(item.id)}">${article}
      <div class="board-slide" data-for="${text(item.id)}">
        <div class="board-slide-inner">
          <div class="board-detail">
            <p class="board-date">${text(when)}</p>
            <h2>${text(item.title)}</h2>
            <div class="board-detail-body">${item.details || "<p>No details yet.</p>"}</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function paint(items) {
    root.querySelector("[data-board-grid]").className = `board-grid${view === "list" ? " is-list" : ""}`;
    root.querySelector("[data-board-grid]").innerHTML = items.length
      ? items.map(card).join("")
      : `<p class="board-empty">${kind === "vacancy" ? "No vacancies yet." : "No notices yet."}</p>`;
    root.querySelectorAll("[data-board-toggle]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.boardToggle === view);
    });
    root.querySelectorAll("[data-open-detail]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".board-item");
        const slide = item && root.querySelector(`.board-slide[data-for="${CSS.escape(item.dataset.id)}"]`);
        if (!slide) return;
        const willOpen = !slide.classList.contains("is-open");
        root.querySelectorAll(".board-slide.is-open").forEach((open) => closeSlide(open));
        if (willOpen) openSlide(item, slide, btn);
      });
    });
  }

  function closeSlide(slide) {
    slide.classList.remove("is-open");
    const owner = root.querySelector(`.board-item[data-id="${CSS.escape(slide.dataset.for)}"]`);
    owner?.querySelector("[data-open-detail]")?.setAttribute("aria-expanded", "false");
    const putBack = () => {
      if (!slide.classList.contains("is-open") && owner && slide.parentElement !== owner) owner.appendChild(slide);
    };
    slide.addEventListener("transitionend", putBack, { once: true });
    window.setTimeout(putBack, 400);
  }

  function openSlide(item, slide, btn) {
    const grid = root.querySelector("[data-board-grid]");
    if (!grid.classList.contains("is-list")) {
      const top = item.getBoundingClientRect().top;
      const row = [...grid.querySelectorAll(".board-item")].filter((card) => Math.abs(card.getBoundingClientRect().top - top) < 8);
      (row[row.length - 1] || item).after(slide);
    } else if (slide.parentElement !== item) {
      item.appendChild(slide);
    }
    slide.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
  }

  root.querySelectorAll("[data-board-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      view = btn.dataset.boardToggle;
      localStorage.setItem(storageKey, view);
      root.querySelectorAll(".board-slide.is-open").forEach((open) => closeSlide(open));
      const cards = root.querySelector("[data-board-grid]");
      cards.classList.toggle("is-list", view === "list");
      root.querySelectorAll("[data-board-toggle]").forEach((item) => {
        item.classList.toggle("is-active", item === btn);
      });
    });
  });

  const vacancyId = kind === "vacancy" ? new URLSearchParams(location.search).get("id") : "";

  fetch(`/api/public/boards/${kind}`)
    .then((res) => res.json())
    .then((items) => {
      const list = Array.isArray(items) ? items : [];
      if (vacancyId) {
        showInside(list.find((item) => item.id === vacancyId) || null);
        return;
      }
      paint(list);
    })
    .catch(() => {
      if (vacancyId) showInside(null);
      else paint([]);
    });
})();
