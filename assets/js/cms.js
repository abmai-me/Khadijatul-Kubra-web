(function () {
  const API = "/api/public/site";

  function setText(el, value) {
    if (!el || value == null || value === "") return;
    el.textContent = value;
  }

  function setHtml(el, value) {
    if (!el || value == null || value === "") return;
    el.innerHTML = value;
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function applyHeader(header) {
    if (!header) return;
    const left = qs(".header-top_list");
    if (left) {
      const items = left.querySelectorAll("li");
      if (items[0]) setHtml(items[0], `<span class="icon fa-solid fa-envelope fa-fw"></span>${header.email || ""}`);
      if (items[1]) setHtml(items[1], `<span class="icon fa-solid fa-location-dot fa-fw"></span>${header.address || ""}`);
    }
    const right = qs(".header-top_list-two");
    if (right) {
      const items = right.querySelectorAll("li");
      if (items[0]) setHtml(items[0], `<span class="icon fa-solid fa-phone fa-fw"></span>Let’s Talk: ${header.phone || ""}`);
      if (items[1]) setHtml(items[1], `<span class="icon fa-regular fa-sun fa-fw"></span>Charity No: ${header.charityNo || ""}`);
      if (items[2]) {
        setHtml(
          items[2],
          `<span class="icon fa-solid fa-envelope fa-fw"></span><a href="${header.mailUrl || "#"}" style="color:white;">${header.mailLabel || "Mail"}</a>`
        );
      }
    }
  }

  function menuItemHtml(item) {
    const children = Array.isArray(item.children) ? item.children : [];
    if (!children.length) {
      return `<li><a href="${item.href || "#"}">${item.label || ""}</a></li>`;
    }
    const nested = children.map(menuItemHtml).join("");
    return `<li class="dropdown"><a href="${item.href || "#"}">${item.label || ""}</a><ul>${nested}</ul></li>`;
  }

  function applyMenu(menu) {
    if (!Array.isArray(menu) || !menu.length) return;
    qsa("ul.navigation.clearfix").forEach((nav) => {
      nav.innerHTML = menu.map(menuItemHtml).join("");
    });
  }

  function applyHome(home) {
    if (!home || !document.body.classList.contains("cms-home")) return;

    qsa("[data-cms]").forEach((el) => {
      const key = el.getAttribute("data-cms");
      if (!key || home[key] == null) return;
      if (el.tagName === "A") {
        if (key.endsWith("Link")) el.setAttribute("href", home[key]);
        else setText(el, home[key]);
      } else if (el.hasAttribute("data-cms-html")) {
        setHtml(el, home[key]);
      } else {
        setText(el, home[key]);
      }
    });

    qsa("[data-cms-href]").forEach((el) => {
      const key = el.getAttribute("data-cms-href");
      if (key && home[key]) el.setAttribute("href", home[key]);
    });
  }

  function applyFooter(footer) {
    if (!footer) return;
    const addressLis = qsa(".footer-info_list li, .main-footer .footer-info_list li");
    // Theme footer address block varies; update common patterns
    qsa(".main-footer .footer-info_list li").forEach((li, i) => {
      if (i === 0 && footer.address) setText(li, footer.address);
      if (i === 1 && footer.phone) setText(li, footer.phone);
    });

    const linkWidgets = qsa(".main-footer .links-widget");
    if (linkWidgets[0]) {
      const title = qs(".footer-title", linkWidgets[0]);
      setText(title, footer.linksTitle);
      const links = qsa(".footer-list a", linkWidgets[0]);
      const map = [
        ["link1Label", "link1Href"],
        ["link2Label", "link2Href"],
        ["link3Label", "link3Href"],
        ["link4Label", "link4Href"],
        ["link5Label", "link5Href"],
      ];
      map.forEach(([lk, hk], i) => {
        if (!links[i]) return;
        if (footer[lk]) setText(links[i], footer[lk]);
        if (footer[hk]) links[i].setAttribute("href", footer[hk]);
      });
    }
    if (linkWidgets[1]) {
      const title = qs(".footer-title", linkWidgets[1]);
      setText(title, footer.otherTitle);
      const links = qsa(".footer-list a", linkWidgets[1]);
      const map = [
        ["other1Label", "other1Href"],
        ["other2Label", "other2Href"],
        ["other3Label", "other3Href"],
        ["other4Label", "other4Href"],
        ["other5Label", "other5Href"],
      ];
      map.forEach(([lk, hk], i) => {
        if (!links[i]) return;
        if (footer[lk]) setText(links[i], footer[lk]);
        if (footer[hk]) links[i].setAttribute("href", footer[hk]);
      });
    }

    const news = qs(".newsletter-widget");
    if (news) {
      setText(qs(".footer-title", news), footer.newsletterTitle);
      setText(qs(".footer-text", news), footer.newsletterText);
    }

    setText(qs(".footer-bottom .copyright"), footer.copyright);
    const navLinks = qsa(".footer-bottom .footer-nav a");
    if (navLinks[0]) {
      setText(navLinks[0], footer.developedBy);
      if (footer.developedByUrl) navLinks[0].setAttribute("href", footer.developedByUrl);
    }
    if (navLinks[1]) {
      setText(navLinks[1], footer.termsLabel);
      if (footer.termsHref) navLinks[1].setAttribute("href", footer.termsHref);
    }
    if (navLinks[2]) {
      setText(navLinks[2], footer.privacyLabel);
      if (footer.privacyHref) navLinks[2].setAttribute("href", footer.privacyHref);
    }
  }

  async function boot() {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) return;
      const site = await res.json();
      applyHeader(site.header);
      applyMenu(site.menu);
      applyFooter(site.footer);
      applyHome(site.home);
      document.dispatchEvent(new CustomEvent("cms:loaded", { detail: site }));
    } catch (err) {
      console.warn("CMS content not loaded", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
