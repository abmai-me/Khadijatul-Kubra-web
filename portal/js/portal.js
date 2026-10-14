const money = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

let currentUser = null;
let accessCatalog = [];
let portalUsers = [];

const VIEW_ORDER = ["dashboard", "students", "donations", "collections", "prayer", "marriage", "content"];

function can(moduleKey, action = "view") {
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  return (currentUser.permissions?.[moduleKey] || []).includes(action);
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 401) {
    location.href = "/portal/login.html";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

function showView(name) {
  const allowed = name === "settings" ? can("users", "manage") : can(name, "view");
  if (!allowed) return;
  document.getElementById("noAccess")?.classList.add("hidden");
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll(".nav-link[data-view]").forEach((n) => n.classList.remove("active"));
  document.getElementById(`view-${name}`)?.classList.add("active");
  document.querySelector(`.nav-link[data-view="${name}"]`)?.classList.add("active");
  if (name === "dashboard") loadDashboard();
  if (name === "students") loadStudents();
  if (name === "donations") loadDonations();
  if (name === "collections") loadCollections();
  if (name === "prayer") loadPrayer();
  if (name === "marriage") loadMarriages();
  if (name === "content" && typeof loadBuilder === "function") loadBuilder();
  if (name === "settings") {
    showSettingsPanel("profile");
    renderMyProfile();
    loadUsers(false);
  }
}

async function loadDashboard() {
  if (!can("dashboard", "view")) return;
  const data = await api("/api/dashboard");
  document.getElementById("statStudents").textContent = data.students;
  document.getElementById("statDonations").textContent = money(data.donationTotal);
  document.getElementById("statCollections").textContent = money(data.collectionTotal);
  document.getElementById("statMarriages").textContent = data.marriages;
  const p = data.prayerTimes || {};
  document.getElementById("dashPrayer").innerHTML = [
    ["Fajr", p.fajr],
    ["Dhuhr", p.dhuhr],
    ["Asr", p.asr],
    ["Maghrib", p.maghrib],
    ["Isha", p.isha],
    ["Jumu'ah", p.jumuah],
  ]
    .map(
      ([label, time]) =>
        `<div class="card stat-card"><h3 style="font-size:1.25rem">${time || "--:--"}</h3><span>${label}</span></div>`
    )
    .join("");
}

async function loadStudents() {
  const rows = await api("/api/students");
  document.getElementById("studentsTable").innerHTML = rows.length
    ? rows
        .map(
          (s) => `<tr>
          <td><strong>${esc(s.name)}</strong><div class="muted">${esc(s.email || "")}</div></td>
          <td>${esc(s.course || "-")}</td>
          <td>${esc(s.phone || "-")}</td>
          <td><span class="badge badge-${esc(s.status)}">${esc(s.status)}</span></td>
          <td class="actions">
            ${can("students", "update") ? `<button class="btn btn-secondary" onclick='editStudent(${JSON.stringify(s).replace(/'/g, "&#39;")})'>Edit</button>` : ""}
            ${can("students", "delete") ? `<button class="btn btn-danger" onclick="deleteStudent('${s.id}')">Delete</button>` : ""}
          </td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="muted">No students yet</td></tr>`;
}

function resetStudentForm() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
  document.getElementById("studentForm").classList.add("hidden");
}

window.editStudent = function (s) {
  document.getElementById("studentForm").classList.remove("hidden");
  document.getElementById("studentId").value = s.id;
  document.getElementById("studentName").value = s.name || "";
  document.getElementById("studentPhone").value = s.phone || "";
  document.getElementById("studentEmail").value = s.email || "";
  document.getElementById("studentCourse").value = s.course || "";
  document.getElementById("studentGender").value = s.gender || "";
  document.getElementById("studentStatus").value = s.status || "active";
  document.getElementById("studentNotes").value = s.notes || "";
};

window.deleteStudent = async function (id) {
  if (!confirm("Delete this student?")) return;
  await api(`/api/students/${id}`, { method: "DELETE" });
  loadStudents();
  loadDashboard();
};

async function loadDonations() {
  const rows = await api("/api/donations");
  document.getElementById("donationsTable").innerHTML = rows.length
    ? rows
        .map(
          (d) => `<tr>
          <td>${esc(d.date)}</td>
          <td><strong>${esc(d.donorName)}</strong>${d.source === "website" ? ` <span class="badge" title="Submitted from donation page">web</span>` : ""}</td>
          <td>${money(d.amount)}</td>
          <td>${esc(d.method)}</td>
          <td>${esc(d.purpose)}</td>
          <td>${esc(d.receiptNo)}</td>
          <td>${can("donations", "delete") ? `<button class="btn btn-danger" onclick="deleteDonation('${d.id}')">Delete</button>` : ""}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="7" class="muted">No donations yet</td></tr>`;
}

window.deleteDonation = async function (id) {
  if (!confirm("Delete this donation?")) return;
  await api(`/api/donations/${id}`, { method: "DELETE" });
  loadDonations();
  loadDashboard();
};

async function loadCollections() {
  const rows = await api("/api/collections");
  let income = 0;
  let expense = 0;
  rows.forEach((r) => {
    if (r.type === "expense") expense += Number(r.amount || 0);
    else income += Number(r.amount || 0);
  });
  document.getElementById("collectionSummary").textContent =
    `Income: ${money(income)} · Expense: ${money(expense)} · Balance: ${money(income - expense)}`;
  document.getElementById("collectionsTable").innerHTML = rows.length
    ? rows
        .map(
          (c) => `<tr>
          <td>${esc(c.date)}</td>
          <td>${esc(c.title)}</td>
          <td><span class="badge badge-${c.type === "expense" ? "inactive" : "active"}">${esc(c.type)}</span></td>
          <td>${esc(c.category)}</td>
          <td>${money(c.amount)}</td>
          <td>${can("collections", "delete") ? `<button class="btn btn-danger" onclick="deleteCollection('${c.id}')">Delete</button>` : ""}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="muted">No ledger entries yet</td></tr>`;
}

window.deleteCollection = async function (id) {
  if (!confirm("Delete this entry?")) return;
  await api(`/api/collections/${id}`, { method: "DELETE" });
  loadCollections();
  loadDashboard();
};

async function loadPrayer() {
  const p = await api("/api/prayer-times");
  ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"].forEach((k) => {
    document.getElementById(k).value = p[k] || "";
  });
  document.getElementById("prayerUpdated").textContent = p.updatedAt
    ? `Last updated: ${new Date(p.updatedAt).toLocaleString()}`
    : "Not updated yet";
  const locked = !can("prayer", "update");
  document.querySelectorAll("#prayerForm input, #prayerForm button").forEach((el) => {
    el.disabled = locked;
  });
}

const MARRIAGE_FIELDS = [
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
];

function marriageDisplayName(m, who) {
  if (who === "groom") {
    return (
      [m.groomFirstName, m.groomLastName].filter(Boolean).join(" ") ||
      m.groomName ||
      "-"
    );
  }
  return (
    [m.brideFirstName, m.brideLastName].filter(Boolean).join(" ") ||
    m.brideName ||
    "-"
  );
}

function marriageDateLabel(m) {
  if (m.marriageDay || m.marriageMonth || m.marriageYear) {
    return [m.marriageDay, m.marriageMonth, m.marriageYear].filter(Boolean).join("/");
  }
  return m.weddingDate || "-";
}

function collectMarriageBody() {
  const body = {};
  MARRIAGE_FIELDS.forEach((k) => {
    const el = document.getElementById(k);
    body[k] = el ? el.value.trim() : "";
  });
  body.status = document.getElementById("marriageStatus").value;
  body.notes = document.getElementById("marriageNotes").value.trim();
  return body;
}

function detailItem(label, value) {
  return `<div class="detail-item"><span>${esc(label)}</span><strong>${esc(
    value || "—"
  )}</strong></div>`;
}

function marriageSectionsHtml(m) {
  const statusLabel = m.status === "pending" ? "waiting" : m.status;
  const groomDob = [m.groomDobDay, m.groomDobMonth, m.groomDobYear]
    .filter(Boolean)
    .join("/") || "—";
  const brideDob = [m.brideDobDay, m.brideDobMonth, m.brideDobYear]
    .filter(Boolean)
    .join("/") || "—";
  const certifyDate = [m.certifyDay, m.certifyMonth, m.certifyYear]
    .filter(Boolean)
    .join("/") || "—";
  return `
    <div class="detail-section">
      <h4>1. Certificate &amp; Status</h4>
      <div class="detail-grid">
        ${detailItem("Certificate No", m.certificateNo)}
        ${detailItem("Status", statusLabel)}
        ${detailItem("Source", m.source || "admin")}
        ${detailItem("Submitted", m.createdAt ? new Date(m.createdAt).toLocaleString() : "—")}
        ${detailItem("Applicant Name", m.applicantName)}
        ${detailItem("Applicant Mobile", m.applicantMobile)}
        ${detailItem("Applicant Email", m.applicantEmail)}
        ${detailItem("Download PIN", m.downloadPin)}
      </div>
    </div>
    <div class="detail-section">
      <h4>2. Bride Groom Details</h4>
      <div class="detail-grid">
        ${detailItem("First Name", m.groomFirstName)}
        ${detailItem("Last Name", m.groomLastName)}
        ${detailItem("Date of Birth", groomDob)}
        ${detailItem("Nationality", m.groomNationality)}
        ${detailItem("Place of Birth", m.groomPlaceOfBirth)}
        ${detailItem("Father's Name", m.groomFather)}
        ${detailItem("Mother's Name", m.groomMother)}
        ${detailItem("Mobile", m.groomMobile)}
        ${detailItem("Phone", m.groomPhone)}
        <div class="detail-item" style="grid-column:1/-1"><span>Present Address</span><strong>${esc(m.groomAddress || "—")}</strong></div>
      </div>
    </div>
    <div class="detail-section">
      <h4>3. Bride Details</h4>
      <div class="detail-grid">
        ${detailItem("First Name", m.brideFirstName)}
        ${detailItem("Last Name", m.brideLastName)}
        ${detailItem("Date of Birth", brideDob)}
        ${detailItem("Nationality", m.brideNationality)}
        ${detailItem("Place of Birth", m.bridePlaceOfBirth)}
        ${detailItem("Father's Name", m.brideFather)}
        ${detailItem("Mother's Name", m.brideMother)}
        ${detailItem("Mobile", m.brideMobile)}
        ${detailItem("Phone", m.bridePhone)}
        <div class="detail-item" style="grid-column:1/-1"><span>Present Address</span><strong>${esc(m.brideAddress || "—")}</strong></div>
      </div>
    </div>
    <div class="detail-section">
      <h4>4. Marriage Details</h4>
      <div class="detail-grid">
        ${detailItem("Marriage Date", marriageDateLabel(m))}
        ${detailItem("Place of Marriage", m.placeOfMarriage || m.venue)}
        ${detailItem("Dowry Amount", m.dowryAmount || m.mahr)}
        ${detailItem("Dowry Cash", m.dowryCash)}
        ${detailItem("Dowry Jewellery", m.dowryJewellery)}
        ${detailItem("Dowry Land & Property", m.dowryLand)}
      </div>
    </div>
    <div class="detail-section">
      <h4>5. Proposer</h4>
      <div class="detail-grid">
        ${detailItem("Name", m.proposerName)}
        ${detailItem("Mobile", m.proposerMobile)}
        <div class="detail-item" style="grid-column:1/-1"><span>Address</span><strong>${esc(m.proposerAddress || "—")}</strong></div>
      </div>
    </div>
    <div class="detail-section">
      <h4>6. Witnesses</h4>
      <div class="detail-grid">
        ${detailItem("Witness 1 Name", m.witness1Name)}
        ${detailItem("Witness 2 Name", m.witness2Name)}
        <div class="detail-item"><span>Witness 1 Address</span><strong>${esc(m.witness1Address || "—")}</strong></div>
        <div class="detail-item"><span>Witness 2 Address</span><strong>${esc(m.witness2Address || "—")}</strong></div>
      </div>
    </div>
    <div class="detail-section">
      <h4>7. Certifier</h4>
      <div class="detail-grid">
        ${detailItem("Certifier Name", m.certifierName)}
        ${detailItem("Certify Date", certifyDate)}
      </div>
    </div>
    <div class="detail-section">
      <h4>8. Admin Notes</h4>
      <div class="detail-grid">
        <div class="detail-item" style="grid-column:1/-1"><span>Notes</span><strong>${esc(m.notes || "—")}</strong></div>
      </div>
    </div>
  `;
}

window.viewMarriage = function (m) {
  document.getElementById("marriageViewTitle").textContent =
    `View · ${m.certificateNo || "Application"}`;
  document.getElementById("marriageViewBody").innerHTML = marriageSectionsHtml(m);
  document.getElementById("marriageViewModal").classList.remove("hidden");
};

function pickMarriageMobile(m) {
  return (
    m.pinSmsMobile ||
    m.applicantMobile ||
    m.groomMobile ||
    m.brideMobile ||
    m.proposerMobile ||
    m.groomPhone ||
    m.bridePhone ||
    ""
  );
}

function pickMarriageEmail(m) {
  return m.pinEmailTo || m.applicantEmail || "";
}

function pickMarriageContactName(m) {
  return (
    m.applicantName ||
    [m.groomFirstName, m.groomLastName].filter(Boolean).join(" ") ||
    m.groomName ||
    ""
  );
}

function randomDownloadPin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function openApproveModal(id, existingPin) {
  document.getElementById("approveMarriageId").value = id || "";
  document.getElementById("approveDownloadPin").value = existingPin || randomDownloadPin();
  document.getElementById("marriageApproveModal").classList.remove("hidden");
}

function openSmsModal(m) {
  if (m.status !== "approved") {
    alert("Approve the application first.");
    return;
  }
  if (!m.downloadPin) {
    alert("No download PIN set. Approve again with a PIN.");
    return;
  }
  document.getElementById("smsMarriageId").value = m.id || "";
  document.getElementById("smsName").value = pickMarriageContactName(m);
  document.getElementById("smsMobile").value = pickMarriageMobile(m);
  document.getElementById("smsEmail").value = pickMarriageEmail(m);
  document.getElementById("smsPinPreview").textContent =
    `Certificate ${m.certificateNo || ""} · PIN: ${m.downloadPin}`;
  const parts = [];
  if (m.pinSmsSentAt) parts.push(`SMS: ${new Date(m.pinSmsSentAt).toLocaleString()}`);
  if (m.pinEmailSentAt) parts.push(`Email: ${new Date(m.pinEmailSentAt).toLocaleString()}`);
  document.getElementById("smsStatus").textContent = parts.length
    ? `Last sent — ${parts.join(" · ")}`
    : "";
  document.getElementById("marriageSmsModal").classList.remove("hidden");
}

async function sendPinChannel(channel) {
  const id = document.getElementById("smsMarriageId").value;
  const name = document.getElementById("smsName").value.trim();
  const mobile = document.getElementById("smsMobile").value.trim();
  const email = document.getElementById("smsEmail").value.trim();
  const statusEl = document.getElementById("smsStatus");
  if (!id) return;
  if (channel === "sms" && !mobile) {
    alert("Enter a mobile number.");
    return;
  }
  if (channel === "email" && !email) {
    alert("Enter an email address.");
    return;
  }
  statusEl.textContent = channel === "email" ? "Sending email…" : "Sending SMS…";
  try {
    const data = await api(`/api/marriages/${encodeURIComponent(id)}/send-pin`, {
      method: "POST",
      body: JSON.stringify({ channel, name, mobile, email }),
    });
    statusEl.textContent = data.message || "Sent";
    loadMarriages();
  } catch (err) {
    statusEl.textContent = err.message || "Send failed";
  }
}

async function loadMarriages() {
  const rows = await api("/api/marriages");
  document.getElementById("marriagesTable").innerHTML = rows.length
    ? rows
        .map((m) => {
          const payload = encodeURIComponent(JSON.stringify(m));
          const isApproved = m.status === "approved";
          const isPending = m.status === "pending";
          const pdfUrl = `/api/marriages/${encodeURIComponent(m.id)}/pdf`;
          const statusLabel = isPending ? "waiting" : m.status;
          const pinHint = isApproved && m.downloadPin ? `PIN ${m.downloadPin}` : "";
          return `<tr>
          <td>${esc(m.certificateNo)}${pinHint ? `<div class="muted" style="font-size:.75rem">${esc(pinHint)}</div>` : ""}</td>
          <td>${esc(marriageDisplayName(m, "groom"))}</td>
          <td>${esc(marriageDisplayName(m, "bride"))}</td>
          <td>${esc(marriageDateLabel(m))}</td>
          <td>${esc(m.source || "admin")}</td>
          <td><span class="badge badge-${esc(m.status)}">${esc(statusLabel)}</span></td>
          <td class="actions marriage-actions">
            ${can("marriage", "update") ? `<button class="btn btn-secondary btn-sm" data-edit="${payload}">Edit</button>` : ""}
            <button class="btn btn-secondary btn-sm" data-view="${payload}">View</button>
            ${
              isPending && can("marriage", "approve")
                ? `<button class="btn btn-primary btn-sm" data-approve="${esc(m.id)}">Approve</button>`
                : ""
            }
            ${
              isApproved && !m.downloadPin && can("marriage", "approve")
                ? `<button class="btn btn-primary btn-sm" data-approve="${esc(m.id)}">Set PIN</button>`
                : ""
            }
            ${
              isApproved && m.downloadPin
                ? `${can("marriage", "approve") ? `<button class="btn btn-primary btn-sm" data-sms="${payload}">Send PIN</button>` : ""}
                   <a class="btn btn-gold btn-sm" href="${pdfUrl}" target="_blank">Download PDF</a>`
                : ""
            }
            ${can("marriage", "delete") ? `<button class="btn btn-danger btn-sm" onclick="deleteMarriage('${m.id}')">Delete</button>` : ""}
          </td>
        </tr>`;
        })
        .join("")
    : `<tr><td colspan="7" class="muted">No marriage registrations yet. Public form: /nikah-nama.html</td></tr>`;

  document.querySelectorAll("#marriagesTable [data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      editMarriage(JSON.parse(decodeURIComponent(btn.getAttribute("data-edit"))));
    });
  });
  document.querySelectorAll("#marriagesTable [data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      viewMarriage(JSON.parse(decodeURIComponent(btn.getAttribute("data-view"))));
    });
  });
  document.querySelectorAll("#marriagesTable [data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => openApproveModal(btn.getAttribute("data-approve")));
  });
  document.querySelectorAll("#marriagesTable [data-sms]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openSmsModal(JSON.parse(decodeURIComponent(btn.getAttribute("data-sms"))));
    });
  });
}

function resetMarriageForm() {
  document.getElementById("marriageForm").reset();
  document.getElementById("marriageId").value = "";
  document.getElementById("placeOfMarriage").value =
    "Khadijatul Kubra Trust Mosque, Leicester";
  document.getElementById("marriageForm").classList.add("hidden");
}

window.editMarriage = function (m) {
  document.getElementById("marriageForm").classList.remove("hidden");
  document.getElementById("marriageId").value = m.id || "";
  MARRIAGE_FIELDS.forEach((k) => {
    const el = document.getElementById(k);
    if (el) el.value = m[k] || "";
  });
  if (!m.groomFirstName && m.groomName) {
    const parts = String(m.groomName).trim().split(/\s+/);
    document.getElementById("groomFirstName").value = parts.shift() || "";
    document.getElementById("groomLastName").value = parts.join(" ");
  }
  if (!m.brideFirstName && m.brideName) {
    const parts = String(m.brideName).trim().split(/\s+/);
    document.getElementById("brideFirstName").value = parts.shift() || "";
    document.getElementById("brideLastName").value = parts.join(" ");
  }
  if (!m.placeOfMarriage && m.venue) {
    document.getElementById("placeOfMarriage").value = m.venue;
  }
  if (!m.dowryAmount && m.mahr) {
    document.getElementById("dowryAmount").value = m.mahr;
  }
  document.getElementById("marriageStatus").value = m.status || "pending";
  document.getElementById("marriageNotes").value = m.notes || "";
  setCertifierDefaultsIfEmpty();
  document.getElementById("marriageForm").scrollIntoView({ behavior: "smooth" });
};

window.approveMarriage = async function (id, downloadPin) {
  const pin = String(downloadPin || "").trim();
  if (!pin) {
    openApproveModal(id);
    return;
  }
  const current = await api(`/api/marriages/${id}`);
  const updated = await api(`/api/marriages/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...current, status: "approved", downloadPin: pin }),
  });
  document.getElementById("marriageApproveModal").classList.add("hidden");
  resetMarriageForm();
  loadMarriages();
  loadDashboard();
  if (confirm("Approved. Send PIN by SMS now?")) {
    openSmsModal(updated);
  }
};

window.deleteMarriage = async function (id) {
  if (!confirm("Delete this registration?")) return;
  await api(`/api/marriages/${id}`, { method: "DELETE" });
  loadMarriages();
  loadDashboard();
};


function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

document.querySelectorAll(".nav-link[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

document.getElementById("logoutMenuBtn").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  location.href = "/portal/login.html";
});

document.getElementById("addStudentBtn").addEventListener("click", () => {
  resetStudentForm();
  document.getElementById("studentForm").classList.remove("hidden");
});
document.getElementById("cancelStudent").addEventListener("click", resetStudentForm);
document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("studentId").value;
  const body = {
    name: document.getElementById("studentName").value.trim(),
    phone: document.getElementById("studentPhone").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    course: document.getElementById("studentCourse").value.trim(),
    gender: document.getElementById("studentGender").value,
    status: document.getElementById("studentStatus").value,
    notes: document.getElementById("studentNotes").value.trim(),
  };
  if (id) await api(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(body) });
  else await api("/api/students", { method: "POST", body: JSON.stringify(body) });
  resetStudentForm();
  loadStudents();
  loadDashboard();
});

document.getElementById("addDonationBtn").addEventListener("click", () => {
  document.getElementById("donationForm").reset();
  document.getElementById("donationDate").value = todayInput();
  document.getElementById("donationForm").classList.remove("hidden");
});
document.getElementById("cancelDonation").addEventListener("click", () => {
  document.getElementById("donationForm").classList.add("hidden");
});
document.getElementById("donationForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    donorName: document.getElementById("donorName").value.trim(),
    amount: document.getElementById("donationAmount").value,
    phone: document.getElementById("donorPhone").value.trim(),
    email: document.getElementById("donorEmail").value.trim(),
    method: document.getElementById("donationMethod").value,
    purpose: document.getElementById("donationPurpose").value.trim(),
    date: document.getElementById("donationDate").value || todayInput(),
    receiptNo: document.getElementById("donationReceipt").value.trim(),
    notes: document.getElementById("donationNotes").value.trim(),
  };
  await api("/api/donations", { method: "POST", body: JSON.stringify(body) });
  document.getElementById("donationForm").classList.add("hidden");
  loadDonations();
  loadDashboard();
});

document.getElementById("addCollectionBtn").addEventListener("click", () => {
  document.getElementById("collectionForm").reset();
  document.getElementById("collectionDate").value = todayInput();
  document.getElementById("collectionForm").classList.remove("hidden");
});
document.getElementById("cancelCollection").addEventListener("click", () => {
  document.getElementById("collectionForm").classList.add("hidden");
});
document.getElementById("collectionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById("collectionTitle").value.trim(),
    amount: document.getElementById("collectionAmount").value,
    type: document.getElementById("collectionType").value,
    category: document.getElementById("collectionCategory").value.trim(),
    date: document.getElementById("collectionDate").value || todayInput(),
    notes: document.getElementById("collectionNotes").value.trim(),
  };
  await api("/api/collections", { method: "POST", body: JSON.stringify(body) });
  document.getElementById("collectionForm").classList.add("hidden");
  loadCollections();
  loadDashboard();
});

document.getElementById("prayerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {};
  ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "jumuah"].forEach((k) => {
    body[k] = document.getElementById(k).value;
  });
  await api("/api/prayer-times", { method: "PUT", body: JSON.stringify(body) });
  alert("Prayer times saved");
  loadPrayer();
  loadDashboard();
});

function setCertifierDefaultsIfEmpty() {
  const day = document.getElementById("certifyDay");
  const month = document.getElementById("certifyMonth");
  const year = document.getElementById("certifyYear");
  if (!day || (day.value && month.value && year.value)) return;
  const d = new Date();
  day.value = String(d.getDate()).padStart(2, "0");
  month.value = String(d.getMonth() + 1).padStart(2, "0");
  year.value = String(d.getFullYear());
}

document.getElementById("addMarriageBtn").addEventListener("click", () => {
  resetMarriageForm();
  document.getElementById("marriageStatus").value = "pending";
  setCertifierDefaultsIfEmpty();
  document.getElementById("marriageForm").classList.remove("hidden");
});
document.getElementById("cancelMarriage").addEventListener("click", resetMarriageForm);
document.getElementById("closeMarriageView").addEventListener("click", () => {
  document.getElementById("marriageViewModal").classList.add("hidden");
});
document.getElementById("marriageViewModal").addEventListener("click", (e) => {
  if (e.target.id === "marriageViewModal") {
    document.getElementById("marriageViewModal").classList.add("hidden");
  }
});
document.getElementById("closeApproveModal").addEventListener("click", () => {
  document.getElementById("marriageApproveModal").classList.add("hidden");
});
document.getElementById("marriageApproveModal").addEventListener("click", (e) => {
  if (e.target.id === "marriageApproveModal") {
    document.getElementById("marriageApproveModal").classList.add("hidden");
  }
});
document.getElementById("genApprovePinBtn").addEventListener("click", () => {
  document.getElementById("approveDownloadPin").value = randomDownloadPin();
});
document.getElementById("confirmApproveBtn").addEventListener("click", async () => {
  const id = document.getElementById("approveMarriageId").value;
  const pin = document.getElementById("approveDownloadPin").value.trim();
  if (!id) return;
  if (!pin || pin.length < 4) {
    alert("Enter a PIN with at least 4 digits.");
    return;
  }
  await approveMarriage(id, pin);
});
document.getElementById("closeSmsModal").addEventListener("click", () => {
  document.getElementById("marriageSmsModal").classList.add("hidden");
});
document.getElementById("marriageSmsModal").addEventListener("click", (e) => {
  if (e.target.id === "marriageSmsModal") {
    document.getElementById("marriageSmsModal").classList.add("hidden");
  }
});
document.getElementById("confirmSmsBtn").addEventListener("click", () => sendPinChannel("sms"));
document.getElementById("confirmEmailBtn").addEventListener("click", () => sendPinChannel("email"));
document.getElementById("approveMarriageBtn").addEventListener("click", async () => {
  const id = document.getElementById("marriageId").value;
  if (!id) {
    alert("Save the registration first, then approve.");
    return;
  }
  openApproveModal(id);
});
document.getElementById("marriageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("marriageId").value;
  const body = collectMarriageBody();
  // New admin entries stay waiting unless Approve is clicked
  if (!id) body.status = "pending";
  if (id) await api(`/api/marriages/${id}`, { method: "PUT", body: JSON.stringify(body) });
  else await api("/api/marriages", { method: "POST", body: JSON.stringify(body) });
  resetMarriageForm();
  loadMarriages();
  loadDashboard();
});

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function setAvatarEl(el, name, photo) {
  if (!el) return;
  if (photo) {
    el.textContent = "";
    el.classList.add("has-photo");
    el.style.backgroundImage = `url("${photo}")`;
  } else {
    el.classList.remove("has-photo");
    el.style.backgroundImage = "";
    el.textContent = initials(name);
  }
}

function applyChrome() {
  const name = currentUser?.name || "Account";
  const role = currentUser?.role || "";
  const photo = currentUser?.photo || "";
  document.getElementById("profileLabel").textContent = name;
  document.getElementById("profileRole").textContent = role;
  setAvatarEl(document.getElementById("profileAvatar"), name, photo);
  document.getElementById("menuName").textContent = name;
  document.getElementById("menuUsername").textContent = currentUser?.username ? `@${currentUser.username}` : "";
  document.getElementById("menuRole").textContent = role;
  setAvatarEl(document.getElementById("menuAvatar"), name, photo);
  document.querySelectorAll(".nav-link[data-module]").forEach((btn) => {
    const action = btn.dataset.action || "view";
    btn.classList.toggle("hidden", !can(btn.dataset.module, action));
  });
  const gates = [
    ["addStudentBtn", "students", "create"],
    ["addDonationBtn", "donations", "create"],
    ["addCollectionBtn", "collections", "create"],
    ["addMarriageBtn", "marriage", "create"],
    ["approveMarriageBtn", "marriage", "approve"],
    ["saveHeaderBtn", "content", "update"],
    ["saveMenuBtn", "content", "update"],
    ["savePageBtn", "content", "update"],
    ["saveFooterBtn", "content", "update"],
    ["addTopMenuBtn", "content", "update"],
    ["addCmsPageBtn", "content", "update"],
  ];
  gates.forEach(([id, moduleKey, action]) => {
    document.getElementById(id)?.classList.toggle("hidden", !can(moduleKey, action));
  });
  renderMyProfile();
}

function displayOrDash(value) {
  const text = String(value || "").trim();
  return text || "—";
}

function renderMyProfile() {
  if (!currentUser || !document.getElementById("myProfileName")) return;
  document.getElementById("myProfileName").textContent = displayOrDash(currentUser.name);
  document.getElementById("myProfileUsername").textContent = currentUser.username
    ? `@${currentUser.username}`
    : "—";
  document.getElementById("myProfileMobile").textContent = displayOrDash(currentUser.mobile);
  document.getElementById("myProfileEmail").textContent = displayOrDash(currentUser.email);
  document.getElementById("myProfileDob").textContent = formatDob(currentUser.dateOfBirth);
  document.getElementById("myProfilePhone").textContent = displayOrDash(currentUser.phone);
  document.getElementById("myProfileGender").textContent = displayOrDash(currentUser.gender);
  document.getElementById("myProfileAccess").textContent = displayOrDash(
    currentUser.accessLabel || currentUser.role
  );
  document.getElementById("myProfileAddress").textContent = displayOrDash(currentUser.address);
  document.getElementById("myProfileNotes").textContent = displayOrDash(currentUser.notes);
  document.getElementById("myProfileRole").textContent = currentUser.role || "—";
  const photo = currentUser.photo || "";
  const img = document.getElementById("myProfilePhoto");
  const placeholder = document.getElementById("myProfilePhotoPlaceholder");
  if (photo) {
    img.src = photo;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.removeAttribute("src");
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

function setAccountError(message) {
  const box = document.getElementById("accountError");
  box.textContent = message || "";
  box.classList.toggle("hidden", !message);
}

function setUserError(message) {
  const box = document.getElementById("userError");
  box.textContent = message || "";
  box.classList.toggle("hidden", !message);
}

function closeProfileMenu() {
  document.getElementById("profileMenu").classList.add("hidden");
  document.getElementById("profileBtn").setAttribute("aria-expanded", "false");
}

function setPhotoPreview(prefix, src) {
  const img = document.getElementById(`${prefix}PhotoPreview`);
  const placeholder = document.getElementById(`${prefix}PhotoPlaceholder`);
  if (!img || !placeholder) return;
  if (src) {
    img.src = src;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.removeAttribute("src");
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

function readPhotoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      return reject(new Error("Use a JPG, PNG or WebP photo"));
    }
    if (file.size > 2.5 * 1024 * 1024) {
      return reject(new Error("Photo file is too large. Choose a smaller image."));
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const max = 480;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.onerror = () => reject(new Error("Could not read photo"));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read photo"));
    reader.readAsDataURL(file);
  });
}

function bindPhotoInput(prefix) {
  const input = document.getElementById(`${prefix}PhotoInput`);
  const clearBtn = document.getElementById(`clear${prefix[0].toUpperCase()}${prefix.slice(1)}Photo`);
  input?.addEventListener("change", async () => {
    try {
      const data = await readPhotoFile(input.files?.[0]);
      document.getElementById(`${prefix}PhotoData`).value = data;
      document.getElementById(`${prefix}PhotoCleared`).value = "0";
      setPhotoPreview(prefix, data);
    } catch (err) {
      if (prefix === "user") setUserError(err.message);
      else setAccountError(err.message);
    }
    input.value = "";
  });
  clearBtn?.addEventListener("click", () => {
    document.getElementById(`${prefix}PhotoData`).value = "";
    document.getElementById(`${prefix}PhotoCleared`).value = "1";
    setPhotoPreview(prefix, "");
  });
}

function photoPayload(prefix) {
  if (document.getElementById(`${prefix}PhotoCleared`).value === "1") return "";
  const data = document.getElementById(`${prefix}PhotoData`).value;
  return data || undefined;
}

function openProfileEditor() {
  closeProfileMenu();
  setAccountError("");
  document.getElementById("accountModalTitle").textContent = "Edit profile";
  document.getElementById("accountModalHint").textContent = "Update your basic personal details.";
  document.getElementById("profileName").value = currentUser?.name || "";
  document.getElementById("profileMobile").value = currentUser?.mobile || "";
  document.getElementById("profileEmail").value = currentUser?.email || "";
  document.getElementById("profileDob").value = currentUser?.dateOfBirth || "";
  document.getElementById("profileUsername").value = currentUser?.username || "";
  document.getElementById("profileCurrentPassword").value = "";
  document.getElementById("profileNewPassword").value = "";
  document.getElementById("profilePhotoData").value = "";
  document.getElementById("profilePhotoCleared").value = "0";
  setPhotoPreview("profile", currentUser?.photo || "");
  document.getElementById("accountModal").classList.remove("hidden");
}

function setAccessError(message) {
  const box = document.getElementById("accessError");
  if (!box) return;
  box.textContent = message || "";
  box.classList.toggle("hidden", !message);
}

function renderAccessGrid(selected, locked) {
  const grid = document.getElementById("accessGrid");
  if (!grid) return;
  grid.innerHTML = accessCatalog
    .map((mod) => {
      const checks = mod.actions
        .map((action) => {
          const on = locked || (selected?.[mod.key] || []).includes(action.key);
          return `<label><input type="checkbox" data-module="${esc(mod.key)}" data-action="${esc(action.key)}" ${on ? "checked" : ""} ${locked ? "disabled" : ""}> ${esc(action.label)}</label>`;
        })
        .join("");
      return `<div class="access-module"><h4>${esc(mod.label)}</h4><div class="access-checks">${checks}</div></div>`;
    })
    .join("");
}

function readAccessGrid() {
  const permissions = {};
  accessCatalog.forEach((mod) => {
    permissions[mod.key] = [];
  });
  document.querySelectorAll("#accessGrid input[type=checkbox]").forEach((box) => {
    if (!box.checked || box.disabled) return;
    permissions[box.dataset.module].push(box.dataset.action);
  });
  return permissions;
}

function formatDob(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

function showSettingsPanel(name) {
  document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.settingsPanel === name);
  });
  document.querySelectorAll(".settings-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `settings-panel-${name}`);
  });
  if (name === "profile") renderMyProfile();
  if (name === "access") {
    renderAccessUserList();
    const selectedId = document.getElementById("accessUserId").value;
    const selected = portalUsers.find((user) => user.id === selectedId) || portalUsers[0];
    if (selected) fillAccessForm(selected);
    else clearAccessForm();
  }
}

function blankUserForm() {
  setUserError("");
  document.getElementById("userForm").reset();
  document.getElementById("editUserId").value = "";
  document.getElementById("userPhotoData").value = "";
  document.getElementById("userPhotoCleared").value = "0";
  document.getElementById("deleteUserBtn").classList.add("hidden");
  document.getElementById("cancelUserEdit").classList.add("hidden");
  document.getElementById("userEditorTitle").textContent = "Add user";
  document.getElementById("userEditorHint").textContent = "Personal details, photo and login only";
  setPhotoPreview("user", "");
  document.querySelectorAll("#userRoster tr").forEach((row) => row.classList.remove("active-row"));
  document.getElementById("userEditorCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function syncRoleAccess() {
  const isAdmin = document.getElementById("accessRole").value === "admin";
  document.getElementById("adminAccessNote").textContent = isAdmin
    ? "Admin can do everything. Access ticks stay on."
    : "Tick what this user can do in each area.";
  if (isAdmin) renderAccessGrid(null, true);
}

function clearAccessForm() {
  document.getElementById("accessUserId").value = "";
  document.getElementById("accessUserName").textContent = "Select a user";
  document.getElementById("accessUserMeta").textContent = "—";
  document.getElementById("accessUserAvatar").textContent = "?";
  document.getElementById("accessUserAvatar").classList.remove("has-photo");
  document.getElementById("accessUserAvatar").style.backgroundImage = "";
  document.getElementById("accessRole").value = "staff";
  document.getElementById("saveAccessBtn").disabled = true;
  renderAccessGrid({ dashboard: ["view"] }, false);
  syncRoleAccess();
  document.querySelectorAll("#accessUserList .user-pill").forEach((btn) => btn.classList.remove("active"));
}

function fillAccessForm(user) {
  document.getElementById("accessUserId").value = user.id;
  document.getElementById("accessUserName").textContent = user.name || "User";
  document.getElementById("accessUserMeta").textContent = `@${user.username} · ${user.accessLabel || user.role}`;
  setAvatarEl(document.getElementById("accessUserAvatar"), user.name, user.photo || "");
  document.getElementById("accessRole").value = user.role === "admin" ? "admin" : "staff";
  document.getElementById("saveAccessBtn").disabled = false;
  renderAccessGrid(user.permissions, user.role === "admin");
  syncRoleAccess();
  document.querySelectorAll("#accessUserList .user-pill").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === user.id);
  });
}

function renderAccessUserList() {
  const list = document.getElementById("accessUserList");
  if (!list) return;
  list.innerHTML = portalUsers.length
    ? portalUsers
        .map((user) => {
          const avatar = user.photo
            ? `<img class="user-avatar-sm" src="${esc(user.photo)}" alt="">`
            : `<span class="user-avatar-sm">${esc(initials(user.name))}</span>`;
          return `<button type="button" class="user-pill" data-id="${esc(user.id)}">
            ${avatar}
            <span>
              <strong>${esc(user.name)}</strong>
              <small>@${esc(user.username)} · ${esc(user.role)} · ${esc(user.accessLabel || "No access")}</small>
            </span>
          </button>`;
        })
        .join("")
    : `<p class="muted">No users yet. Add a user first.</p>`;
  list.querySelectorAll(".user-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const user = portalUsers.find((item) => item.id === btn.dataset.id);
      if (user) fillAccessForm(user);
    });
  });
}

function fillUserForm(user) {
  document.getElementById("editUserId").value = user.id;
  document.getElementById("userName").value = user.name || "";
  document.getElementById("userMobile").value = user.mobile || "";
  document.getElementById("userEmail").value = user.email || "";
  document.getElementById("userPhone").value = user.phone || "";
  document.getElementById("userDob").value = user.dateOfBirth || "";
  document.getElementById("userGender").value = user.gender || "";
  document.getElementById("userAddress").value = user.address || "";
  document.getElementById("userNotes").value = user.notes || "";
  document.getElementById("userUsername").value = user.username || "";
  document.getElementById("userPassword").value = "";
  document.getElementById("userPhotoData").value = "";
  document.getElementById("userPhotoCleared").value = "0";
  setPhotoPreview("user", user.photo || "");
  document.getElementById("deleteUserBtn").classList.toggle("hidden", user.id === currentUser?.id);
  document.getElementById("cancelUserEdit").classList.remove("hidden");
  document.getElementById("userEditorTitle").textContent = "Edit user";
  document.getElementById("userEditorHint").textContent = `${user.name} · @${user.username}`;
  document.querySelectorAll("#userRoster tr").forEach((row) => {
    row.classList.toggle("active-row", row.dataset.id === user.id);
  });
}

function renderUserRoster() {
  const body = document.getElementById("userRoster");
  body.innerHTML = portalUsers.length
    ? portalUsers
        .map((user) => {
          const avatar = user.photo
            ? `<img src="${esc(user.photo)}" alt="">`
            : `<span class="user-avatar-sm">${esc(initials(user.name))}</span>`;
          return `<tr data-id="${esc(user.id)}">
            <td>
              <div class="user-cell">
                ${avatar}
                <div>
                  <strong>${esc(user.name)}</strong>
                  <div class="muted">@${esc(user.username)}${user.email ? ` · ${esc(user.email)}` : ""}</div>
                </div>
              </div>
            </td>
            <td>${esc(user.mobile || "—")}</td>
            <td>${esc(formatDob(user.dateOfBirth))}</td>
            <td>${esc(user.gender || "—")}</td>
            <td><button type="button" class="btn btn-secondary btn-sm" data-edit-user="${esc(user.id)}">Edit</button></td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="5" class="muted">No users yet. Add the first user below.</td></tr>`;

  body.querySelectorAll("[data-edit-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const user = portalUsers.find((item) => item.id === btn.getAttribute("data-edit-user"));
      if (user) {
        fillUserForm(user);
        document.getElementById("userEditorCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

async function loadUsers(startBlank) {
  portalUsers = await api("/api/users");
  renderUserRoster();
  renderAccessUserList();
  if (startBlank || !portalUsers.length) blankUserForm();
  else {
    const selectedId = document.getElementById("editUserId").value;
    const selected = portalUsers.find((user) => user.id === selectedId) || portalUsers[0];
    fillUserForm(selected);
  }
  const accessId = document.getElementById("accessUserId")?.value;
  const accessUser = portalUsers.find((user) => user.id === accessId);
  if (accessUser) fillAccessForm(accessUser);
  else if (document.getElementById("settings-panel-access")?.classList.contains("active") && portalUsers[0]) {
    fillAccessForm(portalUsers[0]);
  }
}

document.getElementById("profileBtn").addEventListener("click", () => {
  const menu = document.getElementById("profileMenu");
  const open = menu.classList.toggle("hidden");
  document.getElementById("profileBtn").setAttribute("aria-expanded", open ? "false" : "true");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".profile-wrap")) closeProfileMenu();
});

document.getElementById("editProfileBtn").addEventListener("click", openProfileEditor);
document.getElementById("settingsEditProfileBtn").addEventListener("click", openProfileEditor);
document.getElementById("closeAccountModal").addEventListener("click", () => {
  document.getElementById("accountModal").classList.add("hidden");
});
document.getElementById("accountModal").addEventListener("click", (event) => {
  if (event.target.id === "accountModal") document.getElementById("accountModal").classList.add("hidden");
});
document.querySelectorAll(".settings-nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => showSettingsPanel(btn.dataset.settingsPanel));
});
document.getElementById("newUserBtn").addEventListener("click", blankUserForm);
document.getElementById("cancelUserEdit").addEventListener("click", blankUserForm);
document.getElementById("accessRole").addEventListener("change", () => {
  if (document.getElementById("accessRole").value === "staff") {
    const id = document.getElementById("accessUserId").value;
    const existing = portalUsers.find((user) => user.id === id);
    renderAccessGrid(existing?.role === "staff" ? existing.permissions : { dashboard: ["view"] }, false);
  }
  syncRoleAccess();
});
bindPhotoInput("user");
bindPhotoInput("profile");

document.getElementById("profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  setAccountError("");
  try {
    const body = {
      name: document.getElementById("profileName").value.trim(),
      mobile: document.getElementById("profileMobile").value.trim(),
      email: document.getElementById("profileEmail").value.trim(),
      dateOfBirth: document.getElementById("profileDob").value,
      username: document.getElementById("profileUsername").value.trim(),
      currentPassword: document.getElementById("profileCurrentPassword").value,
      newPassword: document.getElementById("profileNewPassword").value,
    };
    const photo = photoPayload("profile");
    if (photo !== undefined) body.photo = photo;
    const data = await api("/api/me", { method: "PUT", body: JSON.stringify(body) });
    currentUser = data.user;
    applyChrome();
    renderMyProfile();
    document.getElementById("accountModal").classList.add("hidden");
  } catch (err) {
    setAccountError(err.message);
  }
});

document.getElementById("userForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  setUserError("");
  const id = document.getElementById("editUserId").value;
  const body = {
    name: document.getElementById("userName").value.trim(),
    mobile: document.getElementById("userMobile").value.trim(),
    email: document.getElementById("userEmail").value.trim(),
    phone: document.getElementById("userPhone").value.trim(),
    dateOfBirth: document.getElementById("userDob").value,
    gender: document.getElementById("userGender").value,
    address: document.getElementById("userAddress").value.trim(),
    notes: document.getElementById("userNotes").value.trim(),
    username: document.getElementById("userUsername").value.trim(),
    password: document.getElementById("userPassword").value,
  };
  const photo = photoPayload("user");
  if (photo !== undefined) body.photo = photo;
  try {
    if (id) await api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
    else {
      body.role = "staff";
      body.permissions = { dashboard: ["view"] };
      await api("/api/users", { method: "POST", body: JSON.stringify(body) });
    }
    if (id && id === currentUser?.id) {
      const me = await api("/api/me");
      currentUser = me.user;
      accessCatalog = me.accessCatalog;
      applyChrome();
    }
    await loadUsers(false);
  } catch (err) {
    setUserError(err.message);
  }
});

document.getElementById("accessForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  setAccessError("");
  const id = document.getElementById("accessUserId").value;
  if (!id) return;
  const role = document.getElementById("accessRole").value;
  const body = {
    role,
    permissions: role === "admin" ? undefined : readAccessGrid(),
  };
  try {
    await api(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
    if (id === currentUser?.id) {
      const me = await api("/api/me");
      currentUser = me.user;
      accessCatalog = me.accessCatalog;
      applyChrome();
    }
    await loadUsers(false);
    const updated = portalUsers.find((user) => user.id === id);
    if (updated) fillAccessForm(updated);
  } catch (err) {
    setAccessError(err.message);
  }
});

document.getElementById("deleteUserBtn").addEventListener("click", async () => {
  const id = document.getElementById("editUserId").value;
  if (!id || !confirm("Delete this user?")) return;
  setUserError("");
  try {
    await api(`/api/users/${id}`, { method: "DELETE" });
    await loadUsers(true);
    clearAccessForm();
  } catch (err) {
    setUserError(err.message);
  }
});

(async function init() {
  try {
    const me = await api("/api/me");
    currentUser = me.user;
    accessCatalog = me.accessCatalog || [];
    applyChrome();
    document.getElementById("donationDate").value = todayInput();
    document.getElementById("collectionDate").value = todayInput();
    const first = VIEW_ORDER.find((name) => can(name, "view"));
    if (first) showView(first);
    else {
      document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
      document.getElementById("noAccess").classList.remove("hidden");
    }
  } catch (_) {}
})();
