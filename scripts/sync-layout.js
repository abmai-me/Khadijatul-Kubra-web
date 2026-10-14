/**
 * Sync full main-header + footer from data/cms.json into every public site page.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const cms = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "cms.json"), "utf8"));

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMenuItems(items, indent = "\t\t\t\t\t\t\t\t\t\t") {
  return (items || [])
    .map((item) => {
      const kids = item.children || [];
      if (kids.length) {
        const childHtml = renderMenuItems(kids, indent + "\t");
        return `${indent}<li class="dropdown"><a href="${esc(item.url || "#")}">${esc(item.label)}</a>\n${indent}\t<ul>\n${childHtml}\n${indent}\t</ul>\n${indent}</li>`;
      }
      return `${indent}<li><a href="${esc(item.url || "#")}">${esc(item.label)}</a></li>`;
    })
    .join("\n");
}

function buildHeaderHtml() {
  const h = cms.header || {};
  return `	<header class="main-header">
		
		<!-- Header Top -->
		<div class="header-top">
			<div class="auto-container">
				<div class="inner-container">
					<div class="d-flex justify-content-between align-items-center flex-wrap">
						<div class="left-box d-flex align-items-center flex-wrap">
							<!-- Info List -->
							<ul class="header-top_list">
								<li><span class="icon fa-solid fa-envelope fa-fw"></span>${esc(h.email || "")}</li>
								<li><span class="icon fa-solid fa-location-dot fa-fw"></span>${esc(h.address || "")}</li>
							</ul>
							<div class="bismillah"><img src="assets/images/icons/bismillah.png" alt="" /> </div>
						</div>
						<ul class="header-top_list-two">

							<li><span class="icon fa-solid fa-phone fa-fw"></span>Let’s Talk: ${esc(h.phone || "")}</li>
							<li><span class="icon fa-regular fa-sun fa-fw"></span>Charity No: ${esc(h.charityNo || "")}</li>
							<li><span class="icon fa-solid fa-envelope fa-fw"></span><a href="mailto:${esc(h.email || "")}" style="color:white;">Mail</a></li>
						
							
							
						</ul>
					</div>
				</div>
			</div>
		</div>

		<!-- Header Upper -->
		<div class="header-upper">
			<div class="auto-container">
				<div class="inner-container">
					<div class="d-flex justify-content-between align-items-center flex-wrap">
						
						<div class="logo-box">
							<div class="logo"><a href="index.html"><img src="assets/images/logo.png" alt="" title=""></a></div>
						</div>
						
						<div class="nav-outer">
							<!-- Main Menu -->
							<nav class="main-menu navbar-expand-md">
								<div class="navbar-header">
									<!-- Toggle Button -->    	
									<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
										<span class="icon-bar"></span>
										<span class="icon-bar"></span>
										<span class="icon-bar"></span>
									</button>
								</div>
								
								<div class="navbar-collapse collapse clearfix" id="navbarSupportedContent">
									<ul class="navigation clearfix">
${renderMenuItems(cms.menu)}
									</ul>
								</div>
							</nav>
						</div>
						
						<!-- Main Menu End-->
						<div class="outer-box d-flex align-items-center flex-wrap">
							<!-- Mobile Navigation Toggler -->
							<div class="mobile-nav-toggler"><span class="icon flaticon-menu"></span></div>
						</div>

					</div>
				</div>
			</div>
		</div>
		<!--End Header Upper-->
		
		<!-- Mobile Menu  -->
		<div class="mobile-menu">
			<div class="menu-backdrop"></div>
			<div class="close-btn"><span class="icon flaticon-close-1"></span></div>
			
			<nav class="menu-box">
				<div class="nav-logo"><a href="index.html"><img src="assets/images/logo.png" alt="" title=""></a></div>
				<div class="menu-outer"><!--Here Menu Will Come Automatically Via Javascript / Same Menu as in Header--></div>
			</nav>
		</div>
		<!-- End Mobile Menu -->
	
	</header>`;
}

function buildFooterHtml() {
  const f = cms.footer || {};
  const links = (f.links || [])
    .map((l) => `\t\t\t\t\t\t\t\t\t\t\t<li><a href="${esc(l.url || "#")}">${esc(l.label)}</a></li>`)
    .join("\n");
  const other = (f.otherLinks || [])
    .map((l) => `\t\t\t\t\t\t\t\t\t\t\t<li><a href="${esc(l.url || "#")}">${esc(l.label)}</a></li>`)
    .join("\n");
  const bottom = (f.bottomLinks || [])
    .map((l) => `\t\t\t\t\t\t<li><a href="${esc(l.url || "#")}">${esc(l.label)}</a></li>`)
    .join("\n");

  return `	<footer class="main-footer">
		<div class="footer_bg-image" style="background-image: url(assets/images/background/footer-bg.jpg)"></div>
		<div class="auto-container">
			<div class="inner-container">
				<!-- Widgets Section -->
				<div class="widgets-section">
					<div class="row clearfix">
						
						<!-- Big Column -->
						<div class="big-column col-lg-6 col-md-12 col-sm-12">
							<div class="row clearfix">

								<!-- Footer Column -->
								<div class="footer-column col-lg-6 col-md-6 col-sm-12">
									<div class="footer-widget logo-widget">
										<div class="footer-logo"><a href="index.html"><img src="assets/images/logow.png" alt="" title=""></a></div>
										<!-- Footer List -->
										<div class="footer_list">
											<li>${esc(f.address || "")}</li>
											<li>${esc(f.phone || "")}</li>
										</div>
										
										<!-- Social Box -->
										<div class="footer_socials">
											<a href="${esc(f.facebook || "#")}"><i class="fa-brands fa-facebook-f"></i></a>
											<a href="${esc(f.twitter || "#")}"><i class="fa-brands fa-twitter"></i></a>
											<a href="${esc(f.youtube || "#")}"><i class="fa-brands fa-youtube"></i></a>
											<a href="${esc(f.instagram || "#")}"><i class="fa-brands fa-instagram"></i></a>
										</div>
									</div>
								</div>

								<!-- Footer Column -->
								<div class="footer-column col-lg-6 col-md-6 col-sm-12">
									<div class="footer-widget links-widget">
										<h4 class="footer-title">${esc(f.linksTitle || "Links")}</h4>
										<ul class="footer-list">
${links}
										</ul>
									</div>
								</div>

							</div>
						</div>

						<!-- Big Column -->
						<div class="big-column col-lg-6 col-md-12 col-sm-12">
							<div class="row clearfix">

								<!-- Footer Column -->
								<div class="footer-column col-lg-6 col-md-6 col-sm-12">
									<div class="footer-widget links-widget">
										<h4 class="footer-title">${esc(f.otherTitle || "Other Link")}</h4>
										<ul class="footer-list">
${other}
										</ul>
									</div>
								</div>

								<!-- Footer Column -->
								<div class="footer-column col-lg-6 col-md-6 col-sm-12">
									<div class="footer-widget newsletter-widget">
										<h4 class="footer-title">${esc(f.newsletterTitle || "newsletter")}</h4>
										<div class="footer-text">${esc(f.newsletterText || "")}</div>
										<div class="newsletter-box">
											<form method="post" action="contact.html">
												<div class="form-group">
													<input type="email" name="search-field" value="" placeholder="email address" required>
													<button type="submit" class="theme-btn fa-regular fa-paper-plane fa-fw"></button>
												</div>
											</form>
										</div>
									</div>
								</div>

							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<div class="footer_bottom-bg" style="background-image: url(assets/images/background/footer-bg_2.jpg)"></div>
			<div class="auto-container">
				<div class="d-flex justify-content-between align-items-center flex-wrap">
					<div class="copyright"> ${f.copyright || ""} </div>
					<ul class="footer-nav">
${bottom}
					</ul>
				</div>
			</div>
		</div>
		
	</footer>`;
}

function replaceBalancedBlock(html, startMarker) {
  const start = html.indexOf(startMarker);
  if (start < 0) return { ok: false };
  const openTagEnd = html.indexOf(">", start);
  if (openTagEnd < 0) return { ok: false };
  const tagMatch = html.slice(start).match(/^<([a-zA-Z0-9-]+)/);
  if (!tagMatch) return { ok: false };
  const tag = tagMatch[1].toLowerCase();
  let i = openTagEnd + 1;
  let depth = 1;
  const lower = html.toLowerCase();
  while (i < html.length && depth > 0) {
    const nextOpen = lower.indexOf(`<${tag}`, i);
    const nextClose = lower.indexOf(`</${tag}>`, i);
    if (nextClose < 0) return { ok: false };
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + tag.length + 1;
    } else {
      depth -= 1;
      if (depth === 0) {
        return { start, end: nextClose + `</${tag}>`.length, ok: true };
      }
      i = nextClose + `</${tag}>`.length;
    }
  }
  return { ok: false };
}

function ensureSiteCms(html) {
  if (/site-cms\.js/.test(html)) return html;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `<script src="assets/js/site-cms.js"></script>\n</body>`);
  }
  return html + `\n<script src="assets/js/site-cms.js"></script>\n`;
}

function syncFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  let changed = false;
  const name = path.basename(filePath);
  const hasChrome =
    /class="main-header"/.test(html) ||
    /main-footer/.test(html) ||
    /class="navigation/.test(html);

  if (!hasChrome) {
    return { name, changed: false, skipped: true };
  }

  const header = buildHeaderHtml();
  const headerStart = html.search(/<header\s+class="main-header"[^>]*>/i);
  if (headerStart >= 0) {
    const marker = html.slice(headerStart, html.indexOf(">", headerStart) + 1);
    const found = replaceBalancedBlock(html, marker);
    if (found.ok) {
      html = html.slice(0, found.start) + header + html.slice(found.end);
      changed = true;
    }
  }

  const footer = buildFooterHtml();
  const footStart = html.search(/<footer\s+class="main-footer"[^>]*>/i);
  if (footStart >= 0) {
    const marker = html.slice(footStart, html.indexOf(">", footStart) + 1);
    const found = replaceBalancedBlock(html, marker);
    if (found.ok) {
      html = html.slice(0, found.start) + footer + html.slice(found.end);
      changed = true;
    }
  }

  const withCms = ensureSiteCms(html);
  if (withCms !== html) {
    html = withCms;
    changed = true;
  }

  if (changed) fs.writeFileSync(filePath, html, "utf8");
  return { name, changed, skipped: false };
}

const skip = new Set([
  "nikah-certificate.html", // download/view helper only
]);

const files = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith(".html") && !skip.has(f))
  .map((f) => path.join(ROOT, f));

const results = files.map(syncFile);
const updated = results.filter((r) => r.changed).map((r) => r.name);
const skipped = results.filter((r) => r.skipped).map((r) => r.name);

console.log(`Updated ${updated.length} pages:`);
updated.forEach((n) => console.log(" -", n));
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`, skipped.join(", "));
}
