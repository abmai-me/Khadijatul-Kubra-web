/**
 * Live Site Loader – applies portal web-builder content to the public theme.
 */
(function () {
  function setText(el, value) {
    if (!el || value == null || value === "") return;
    el.textContent = value;
  }

  function setHtml(el, value) {
    if (!el || value == null) return;
    el.innerHTML = value;
  }

  function applyCms(site) {
    document.querySelectorAll("[data-cms]").forEach((el) => {
      const path = el.getAttribute("data-cms");
      const value = getPath(site, path);
      if (value == null) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.value = value;
      else if (el.hasAttribute("data-cms-html")) setHtml(el, value);
      else setText(el, value);
    });
  }

  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function applyHeader(site) {
    const h = site.header || {};
    const lists = document.querySelectorAll(".header-top_list");
    lists.forEach((ul) => {
      const items = ul.querySelectorAll("li");
      if (items[0] && h.email) items[0].innerHTML = `<span class="icon fa-solid fa-envelope fa-fw"></span>${escapeHtml(h.email)}`;
      if (items[1] && h.address) items[1].innerHTML = `<span class="icon fa-solid fa-location-dot fa-fw"></span>${escapeHtml(h.address)}`;
    });
    document.querySelectorAll(".header-top_list-two").forEach((ul) => {
      const items = ul.querySelectorAll("li");
      if (items[0] && h.phone) items[0].innerHTML = `<span class="icon fa-solid fa-phone fa-fw"></span>Let’s Talk: ${escapeHtml(h.phone)}`;
      if (items[1] && h.charityNo) items[1].innerHTML = `<span class="icon fa-regular fa-sun fa-fw"></span>Charity No: ${escapeHtml(h.charityNo)}`;
    });
  }

  function buildMenuItem(item) {
    const hasChildren = item.children && item.children.length;
    const li = document.createElement("li");
    if (hasChildren) li.className = "dropdown";
    const a = document.createElement("a");
    a.href = item.href || "#";
    a.textContent = item.label || "Item";
    li.appendChild(a);
    if (hasChildren) {
      const ul = document.createElement("ul");
      item.children.forEach((child) => {
        const cli = document.createElement("li");
        const ca = document.createElement("a");
        ca.href = child.href || "#";
        ca.textContent = child.label || "Item";
        cli.appendChild(ca);
        ul.appendChild(cli);
      });
      li.appendChild(ul);
    }
    return li;
  }

  function applyMenu(site) {
    const menu = site.menu || [];
    document.querySelectorAll("ul.navigation").forEach((nav) => {
      nav.innerHTML = "";
      menu.forEach((item) => nav.appendChild(buildMenuItem(item)));
    });
  }

  function applyFooter(site) {
    const f = site.footer || {};
    const list = document.querySelector(".footer_list");
    if (list) {
      list.innerHTML = "";
      if (f.address) {
        const li = document.createElement("li");
        li.innerHTML = escapeHtml(f.address).replace(/\n/g, "<br>");
        list.appendChild(li);
      }
      if (f.phone) {
        const li = document.createElement("li");
        li.textContent = f.phone;
        list.appendChild(li);
      }
    }

    const social = document.querySelector(".footer_socials");
    if (social) {
      const map = [
        [f.facebook, "fa-facebook-f"],
        [f.youtube, "fa-youtube"],
        [f.instagram, "fa-instagram"],
      ];
      social.innerHTML = map
        .filter(([url]) => url)
        .map(([url, icon]) => `<a href="${escapeAttr(url)}"><i class="fa-brands ${icon}"></i></a>`)
        .join("");
    }

    const widgets = document.querySelectorAll(".footer-widget.links-widget");
    if (widgets[0]) {
      const title = widgets[0].querySelector(".footer-title");
      const ul = widgets[0].querySelector(".footer-list");
      if (title && f.linksTitle) title.textContent = f.linksTitle;
      if (ul && f.links) {
        ul.innerHTML = f.links
          .map((l) => `<li><a href="${escapeAttr(l.href || "#")}">${escapeHtml(l.label || "")}</a></li>`)
          .join("");
      }
    }
    if (widgets[1]) {
      const title = widgets[1].querySelector(".footer-title");
      const ul = widgets[1].querySelector(".footer-list");
      if (title && f.otherTitle) title.textContent = f.otherTitle;
      if (ul && f.otherLinks) {
        ul.innerHTML = f.otherLinks
          .map((l) => `<li><a href="${escapeAttr(l.href || "#")}">${escapeHtml(l.label || "")}</a></li>`)
          .join("");
      }
    }

    const newsText = document.querySelector(".newsletter-widget .footer-text");
    if (newsText && f.newsletterText) newsText.textContent = f.newsletterText;

    const copy = document.querySelector(".copyright");
    if (copy && f.copyright) copy.innerHTML = ` ${escapeHtml(f.copyright)} `;
  }

  function applyHome(site) {
    const p = (site.pages && site.pages.home) || {};
    document.querySelectorAll(".slider-one_title").forEach((el) => setText(el, p.heroTitle));
    document.querySelectorAll(".slider-one_heading").forEach((el) => {
      if (p.heroHeading) el.innerHTML = escapeHtml(p.heroHeading).replace(/\n/g, "<br>");
    });
    document.querySelectorAll(".slider-one_text").forEach((el) => setText(el, p.heroText));
    document.querySelectorAll(".slider-one_button .text-one, .slider-one_button .text-two, .slider-one_button .donatio").forEach((el) => setText(el, p.heroButton));

    const features = document.querySelectorAll(".feature-block_one-inner");
    const featureTexts = [p.feature1, p.feature2, p.feature3];
    features.forEach((el, i) => {
      if (!featureTexts[i]) return;
      const icon = el.querySelector(".feature-block_one-icon");
      el.innerHTML = "";
      if (icon) el.appendChild(icon);
      el.appendChild(document.createTextNode(" "));
      const span = document.createElement("span");
      span.innerHTML = escapeHtml(featureTexts[i]).replace(/\n/g, "<br>");
      el.appendChild(span);
    });

    const welcome = document.querySelector(".welcome-one");
    if (welcome) {
      const eyebrow = welcome.querySelector(".sec-title_title");
      if (eyebrow && p.welcomeEyebrow) {
        const img = eyebrow.querySelector("span");
        eyebrow.innerHTML = `${escapeHtml(p.welcomeEyebrow)} `;
        if (img) eyebrow.appendChild(img);
      }
      setText(welcome.querySelector(".sec-title_heading"), p.welcomeHeading);
      setText(welcome.querySelector(".sec-title_text"), p.welcomeText);
      const years = welcome.querySelector(".welcome-one_years");
      if (years && p.welcomeBadge) {
        const icon = years.querySelector("span");
        years.innerHTML = "";
        if (icon) years.appendChild(icon);
        years.appendChild(document.createTextNode(" " + p.welcomeBadge));
      }
    }

    const offer = document.querySelector(".service-one .sec-title");
    if (offer) {
      setText(offer.querySelector(".sec-title_title"), p.offerEyebrow);
      if (p.offerHeading) {
        const h = offer.querySelector(".sec-title_heading");
        if (h) h.innerHTML = escapeHtml(p.offerHeading).replace(/\n/g, "<br>");
      }
    }
  }

  function applyPage(site) {
    const pageKey = document.body.getAttribute("data-page");
    if (!pageKey || !site.pages || !site.pages[pageKey]) return;
    const p = site.pages[pageKey];
    applyCms({ page: p });
    document.querySelectorAll("[data-page-field]").forEach((el) => {
      const key = el.getAttribute("data-page-field");
      if (p[key] != null) {
        if (el.hasAttribute("data-cms-html")) setHtml(el, p[key]);
        else setText(el, p[key]);
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  async function boot() {
    try {
      const res = await fetch("/api/public/site", { cache: "no-store" });
      if (!res.ok) return;
      const site = await res.json();
      applyHeader(site);
      applyMenu(site);
      applyFooter(site);
      applyHome(site);
      applyPage(site);
      applyCms(site);
      document.dispatchEvent(new CustomEvent("kkt:site-loaded", { detail: site }));
    } catch (err) {
      console.warn("Live site content not loaded", err);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
