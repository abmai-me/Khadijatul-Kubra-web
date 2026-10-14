/**
 * Live CMS runtime – applies portal Site Content to the public theme.
 * Marks used: [data-cms="key"], .navigation, .main-footer, .header-top
 */
(function () {
  function pageSlug() {
    const file = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/i, "");
    return file === "" || file === "/" ? "index" : file;
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMenuItems(items) {
    return (items || [])
      .map((item) => {
        const kids = item.children || [];
        if (kids.length) {
          return `<li class="dropdown"><a href="${esc(item.url || "#")}">${esc(item.label)}</a><ul>${renderMenuItems(kids)}</ul></li>`;
        }
        return `<li><a href="${esc(item.url || "#")}">${esc(item.label)}</a></li>`;
      })
      .join("");
  }

  function applyHeader(header) {
    if (!header) return;
    const top = document.querySelector(".header-top");
    if (!top) return;
    const lists = top.querySelectorAll(".header-top_list, .header-top_list-two");
    if (lists[0]) {
      lists[0].innerHTML = `
        <li><span class="icon fa-solid fa-envelope fa-fw"></span>${esc(header.email || "")}</li>
        <li><span class="icon fa-solid fa-location-dot fa-fw"></span>${esc(header.address || "")}</li>`;
    }
    if (lists[1]) {
      lists[1].innerHTML = `
        <li><span class="icon fa-solid fa-phone fa-fw"></span>Let’s Talk: ${esc(header.phone || "")}</li>
        <li><span class="icon fa-regular fa-sun fa-fw"></span>Charity No: ${esc(header.charityNo || "")}</li>
        <li><span class="icon fa-solid fa-envelope fa-fw"></span><a href="mailto:${esc(header.email || "")}" style="color:white;">Mail</a></li>`;
    }
  }

  function styleTopMenuLinks() {
    // Match theme script.js letter animation used on index.html
    document
      .querySelectorAll(".main-header .main-menu .navigation > li > a")
      .forEach((button) => {
        const text = button.textContent || "";
        if (!text.trim() || button.querySelector(".menu-text")) return;
        button.innerHTML =
          '<div class="menu-text"><span>' +
          text.split("").join("</span><span>") +
          "</span></div>";
      });
  }

  function applyMenu(menu) {
    if (!menu) return;
    const html = renderMenuItems(menu);
    document.querySelectorAll(".main-header .main-menu ul.navigation").forEach((nav) => {
      nav.innerHTML = html;
    });
    styleTopMenuLinks();
    // Keep mobile menu clone in sync with styled desktop menu
    const mobileOuter = document.querySelector(".mobile-menu .menu-outer");
    const desktopMenu = document.querySelector(".main-header .nav-outer .main-menu");
    if (mobileOuter && desktopMenu) {
      mobileOuter.innerHTML = desktopMenu.innerHTML;
    }
  }

  function applyFooter(footer) {
    const el = document.querySelector("footer.main-footer");
    if (!el || !footer) return;

    const list = el.querySelector(".footer_list");
    if (list) {
      list.innerHTML = `<li>${esc(footer.address || "")}</li><li>${esc(footer.phone || "")}</li>`;
    }

    const social = el.querySelector(".footer_socials");
    if (social) {
      social.innerHTML = `
        <a href="${esc(footer.facebook || "#")}"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="${esc(footer.twitter || "#")}"><i class="fa-brands fa-twitter"></i></a>
        <a href="${esc(footer.youtube || "#")}"><i class="fa-brands fa-youtube"></i></a>
        <a href="${esc(footer.instagram || "#")}"><i class="fa-brands fa-instagram"></i></a>`;
    }

    const widgets = el.querySelectorAll(".links-widget");
    if (widgets[0]) {
      const title = widgets[0].querySelector(".footer-title");
      const ul = widgets[0].querySelector(".footer-list");
      if (title) title.textContent = footer.linksTitle || "Links";
      if (ul) {
        ul.innerHTML = (footer.links || [])
          .map((l) => `<li><a href="${esc(l.url || "#")}">${esc(l.label)}</a></li>`)
          .join("");
      }
    }
    if (widgets[1]) {
      const title = widgets[1].querySelector(".footer-title");
      const ul = widgets[1].querySelector(".footer-list");
      if (title) title.textContent = footer.otherTitle || "Other Link";
      if (ul) {
        ul.innerHTML = (footer.otherLinks || [])
          .map((l) => `<li><a href="${esc(l.url || "#")}">${esc(l.label)}</a></li>`)
          .join("");
      }
    }

    const newsTitle = el.querySelector(".newsletter-widget .footer-title");
    const newsText = el.querySelector(".newsletter-widget .footer-text");
    if (newsTitle) newsTitle.textContent = footer.newsletterTitle || "newsletter";
    if (newsText) newsText.textContent = footer.newsletterText || "";

    const copyright = el.querySelector(".copyright");
    if (copyright) copyright.innerHTML = footer.copyright || "";

    const bottom = el.querySelector(".footer-nav");
    if (bottom) {
      bottom.innerHTML = (footer.bottomLinks || [])
        .map((l) => `<li><a href="${esc(l.url || "#")}">${esc(l.label)}</a></li>`)
        .join("");
    }
  }

  function applyBlocks(page) {
    if (!page || !page.blocks) return;
    const map = {};
    page.blocks.forEach((b) => {
      map[b.key] = b.value;
    });

    document.querySelectorAll("[data-cms]").forEach((node) => {
      const key = node.getAttribute("data-cms");
      if (!(key in map)) return;
      const val = map[key];
      if (node.getAttribute("data-cms-html") === "true" || node.tagName === "DIV" && node.classList.contains("cms-html")) {
        node.innerHTML = val || "";
      } else {
        node.innerHTML = val || "";
      }
    });

    // Only inject CMS body into an explicit mount — never auto-insert under page titles
    const bodyHtml = String(map.body_html || "").trim();
    const mount = document.querySelector("[data-cms-body]");
    if (mount) {
      mount.innerHTML = bodyHtml;
    }
    const stray = document.getElementById("cms-live-body");
    if (stray) stray.remove();

    if (map.page_title) {
      const titleEl =
        document.querySelector(".page-title h2") ||
        document.querySelector(".page-title h1") ||
        document.querySelector(".sec-title_heading");
      if (titleEl && !titleEl.hasAttribute("data-cms")) titleEl.textContent = map.page_title;
      if (document.title && page.title) {
        document.title = `${map.page_title} | Khadijatul Kubra Trust`;
      }
    }
    if (map.page_subtitle) {
      const sub =
        document.querySelector(".page-title .page-breadcrumb") ||
        document.querySelector(".page-title p") ||
        document.querySelector(".sec-title_title");
      if (sub && !sub.hasAttribute("data-cms")) {
        if (sub.classList.contains("page-breadcrumb")) {
          // leave breadcrumb structure; set nearby text if any
        } else {
          sub.textContent = map.page_subtitle;
        }
      }
    }
  }

  async function boot() {
    try {
      const slug = pageSlug();
      const res = await fetch(`/api/public/cms?page=${encodeURIComponent(slug)}`);
      if (!res.ok) return;
      const data = await res.json();
      applyHeader(data.header);
      applyMenu(data.menu);
      applyFooter(data.footer);
      applyBlocks(data.page);
      document.documentElement.setAttribute("data-cms-ready", "1");
    } catch (err) {
      console.warn("CMS runtime:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
