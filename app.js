// ==========================================
// 1. CONFIGURACIÓN Y CLIENTE DE SUPABASE
// ==========================================
const SUPABASE_URL = "https://ygnuwxvtqnfrycewaqqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnV3eHZ0cW5mcnljZXdhcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjM2NzYsImV4cCI6MjEwODg5OTY3Nn0.ffmCdbClTToLHrK6a7RUQ_EKo6ZbBnKR1ZKZIwdVdZ0";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. REGISTRO DEL SERVICE WORKER (PWA)
// ==========================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("SW Activo en alcance:", reg.scope))
      .catch((err) => console.error("Error al registrar SW:", err));
  });
}

// Botón de instalación nativa PWA
let deferredPrompt = null;
const btnInstall = document.getElementById("btn-install");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall) btnInstall.removeAttribute("hidden");
});

if (btnInstall) {
  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Elección de instalación:", outcome);
    deferredPrompt = null;
    btnInstall.setAttribute("hidden", "");
  });
}

// ==========================================
// 3. ESTADOS Y VARIABLES GLOBALES
// ==========================================
let matches = [];
let receipts = [];
let currentSportFilter = "Todos";
let currentSearchQuery = "";
let selectedMatch = null;
let currentReceiptBase64 = null;

// ==========================================
// 4. REFERENCIAS DEL DOM
// ==========================================
const viewList = document.getElementById("view-list");
const viewDetail = document.getElementById("view-detail");
const viewAdmin = document.getElementById("view-admin");
const matchesContainer = document.getElementById("matches-list-container");
const searchInput = document.getElementById("search-input");
const chipButtons = document.querySelectorAll(".chip-item");
const btnBack = document.getElementById("btn-back");
const btnAdminBack = document.getElementById("btn-admin-back");
const btnShare = document.getElementById("btn-share");
const btnInvite = document.getElementById("btn-invite");
const btnSubscribe = document.getElementById("btn-subscribe");

// Pestañas
const tabMatches = document.getElementById("tab-matches");
const tabProfile = document.getElementById("tab-profile");
const badgePending = document.getElementById("badge-pending");

// Pases
const myTicketsSection = document.getElementById("my-tickets-section");
const myTicketsList = document.getElementById("my-tickets-list");

// Detalle
const detailImg = document.getElementById("detail-img");
const detailBadgeQuota = document.getElementById("detail-badge-quota");
const detailVenueName = document.getElementById("detail-venue-name");
const detailSportTag = document.getElementById("detail-sport-tag");
const detailDateLong = document.getElementById("detail-date-long");
const detailTime = document.getElementById("detail-time");
const detailVenueSub = document.getElementById("detail-venue-sub");
const detailAddress = document.getElementById("detail-address");
const detailMap = document.getElementById("btn-map");
const detailOrganizer = document.getElementById("detail-organizer-name");

// Modal QR & Comprobante
const modalQr = document.getElementById("modal-qr");
const qrImage = document.getElementById("qr-image");
const modalConcept = document.getElementById("modal-concept");
const modalPrice = document.getElementById("modal-price");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelPayment = document.getElementById("btn-cancel-payment");
const btnConfirmPayment = document.getElementById("btn-confirm-payment");
const receiptInput = document.getElementById("receipt-input");
const previewWrapper = document.getElementById("preview-wrapper");
const receiptPreview = document.getElementById("receipt-preview");
const btnRemoveReceipt = document.getElementById("btn-remove-receipt");
const uploadLabelText = document.getElementById("upload-label-text");

// Panel Admin
const adminReceiptsList = document.getElementById("admin-receipts-list");
const adminPendingCount = document.getElementById("admin-pending-count");
const btnClearReceipts = document.getElementById("btn-clear-receipts");
const modalImageViewer = document.getElementById("modal-image-viewer");
const viewerFullImage = document.getElementById("viewer-full-image");
const btnCloseViewer = document.getElementById("btn-close-viewer");

// ==========================================
// 5. CARGA DE DATOS DESDE SUPABASE
// ==========================================
async function fetchMatches() {
  const { data, error } = await db.from("matches").select("*").order("id", { ascending: true });
  if (error) {
    console.error("Error al obtener partidos:", error);
    return;
  }
  matches = data.map((m) => ({
    id: m.id,
    title: m.title,
    dateGroup: m.date_group,
    dateLong: m.date_long,
    sport: m.sport,
    time: m.time,
    timeFull: m.time_full,
    address: m.address,
    price: Number(m.price),
    currentPlayers: m.current_players,
    maxPlayers: m.max_players,
    image: m.image,
    organizer: m.organizer
  }));
  renderMatches();
}

async function fetchReceipts() {
  const { data, error } = await db.from("receipts").select("*").order("id", { ascending: false });
  if (error) {
    console.error("Error al obtener comprobantes:", error);
    return;
  }
  receipts = data.map((r) => ({
    id: r.id,
    matchId: r.match_id,
    matchTitle: r.match_title,
    sport: r.sport,
    amount: Number(r.amount),
    date: r.date,
    status: r.status,
    receiptImage: r.receipt_image
  }));
  updatePendingBadge();
  renderMyTickets();
  if (viewAdmin && viewAdmin.classList.contains("active")) {
    renderAdminPanel();
  }
}

// ==========================================
// 6. TIEMPO REAL (SUPABASE REALTIME)
// ==========================================
db.channel("realtime-updates")
  .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
    fetchMatches();
  })
  .on("postgres_changes", { event: "*", schema: "public", table: "receipts" }, () => {
    fetchReceipts();
    playNotificationSound();
  })
  .subscribe();

// ==========================================
// 7. SONIDO Y NOTIFICACIÓN
// ==========================================
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (err) {
    console.log("Audio en espera de interacción");
  }
}

function updatePendingBadge() {
  if (!badgePending) return;
  const pendingCount = receipts.filter((r) => r.status === "Pendiente").length;

  if (pendingCount > 0) {
    badgePending.textContent = pendingCount > 99 ? "99+" : pendingCount;
    badgePending.removeAttribute("hidden");
  } else {
    badgePending.setAttribute("hidden", "");
  }

  if (adminPendingCount) {
    adminPendingCount.textContent = pendingCount;
  }
}

// ==========================================
// 8. RENDERIZADO DE PARTIDOS
// ==========================================
function renderMatches() {
  if (!matchesContainer) return;
  matchesContainer.innerHTML = "";

  const filtered = matches.filter((item) => {
    const matchesSport =
      currentSportFilter === "Todos" ||
      item.sport.toLowerCase() === currentSportFilter.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  if (filtered.length === 0) {
    matchesContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
        No se encontraron partidos.
      </div>`;
    return;
  }

  const groups = {};
  filtered.forEach((m) => {
    if (!groups[m.dateGroup]) groups[m.dateGroup] = [];
    groups[m.dateGroup].push(m);
  });

  for (const groupName in groups) {
    const section = document.createElement("div");
    section.innerHTML = `<h3 class="date-section-title">${groupName}</h3>`;

    const cardsGroup = document.createElement("div");
    cardsGroup.className = "cards-group";

    groups[groupName].forEach((match) => {
      const percentage = (match.currentPlayers / match.maxPlayers) * 100;
      const card = document.createElement("article");
      card.className = "match-card";
      card.addEventListener("click", () => showDetail(match.id));

      card.innerHTML = `
        <img class="match-thumb" src="${match.image}" alt="${match.title}">
        <div class="match-details">
          <div>
            <h4 class="match-title">${match.title}</h4>
            <div class="match-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff5a1f"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
              ${match.address.length > 34 ? match.address.substring(0, 34) + "..." : match.address}
            </div>
            <div class="match-sport">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff5a1f"><circle cx="12" cy="12" r="10"/></svg>
              ${match.sport}
            </div>
            <div class="match-time">
              🕐 ${match.time} hs
            </div>
          </div>
          <div class="match-footer">
            <span class="match-price">Bs ${match.price.toFixed(2)}</span>
            <div class="quota-indicator">
              <div class="progress-track">
                <div class="progress-fill" style="width: ${percentage}%"></div>
              </div>
              <span class="quota-text">${match.currentPlayers}-${match.maxPlayers}</span>
            </div>
          </div>
        </div>
      `;
      cardsGroup.appendChild(card);
    });

    section.appendChild(cardsGroup);
    matchesContainer.appendChild(section);
  }
}

// ==========================================
// 9. NAVEGACIÓN Y DETALLES
// ==========================================
function switchScreen(targetScreen) {
  [viewList, viewDetail, viewAdmin].forEach((screen) => {
    if (screen) screen.classList.remove("active");
  });
  if (targetScreen) targetScreen.classList.add("active");
}

function showDetail(id) {
  selectedMatch = matches.find((m) => m.id === id);
  if (!selectedMatch) return;

  detailImg.src = selectedMatch.image;
  detailBadgeQuota.textContent = `${selectedMatch.currentPlayers}/${selectedMatch.maxPlayers} jugadores`;
  detailVenueName.textContent = selectedMatch.title;
  detailSportTag.textContent = selectedMatch.sport.toUpperCase();
  detailDateLong.textContent = selectedMatch.dateLong;
  detailTime.textContent = selectedMatch.timeFull;
  detailVenueSub.textContent = selectedMatch.title.toUpperCase();
  detailAddress.textContent = selectedMatch.address;
  detailOrganizer.textContent = selectedMatch.organizer;
  detailMap.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMatch.address + ", La Paz")}`;

  updateSubscribeButton();
  switchScreen(viewDetail);
}

function updateSubscribeButton() {
  if (!selectedMatch) return;
  const isFull = selectedMatch.currentPlayers >= selectedMatch.maxPlayers;
  if (isFull) {
    btnSubscribe.textContent = "Cupos Agotados";
    btnSubscribe.style.backgroundColor = "#43454d";
    btnSubscribe.disabled = true;
  } else {
    btnSubscribe.textContent = `Inscribirme Bs. ${selectedMatch.price.toFixed(0)}`;
    btnSubscribe.style.backgroundColor = "var(--accent)";
    btnSubscribe.disabled = false;
  }
}

btnBack.addEventListener("click", () => {
  switchScreen(viewList);
  renderMatches();
});

btnAdminBack.addEventListener("click", () => {
  switchScreen(viewList);
  tabProfile.classList.remove("active");
  tabMatches.classList.add("active");
  renderMatches();
});

tabMatches.addEventListener("click", () => {
  tabProfile.classList.remove("active");
  tabMatches.classList.add("active");
  switchScreen(viewList);
  renderMatches();
});

tabProfile.addEventListener("click", () => {
  tabMatches.classList.remove("active");
  tabProfile.classList.add("active");
  renderAdminPanel();
  switchScreen(viewAdmin);
});

// ==========================================
// 10. GESTIÓN DEL MODAL, QR Y COMPROBANTE
// ==========================================
function resetReceiptInput() {
  currentReceiptBase64 = null;
  if (receiptInput) receiptInput.value = "";
  if (receiptPreview) receiptPreview.src = "";
  if (previewWrapper) previewWrapper.setAttribute("hidden", "");
  if (uploadLabelText) uploadLabelText.textContent = "Adjuntar captura del pago";
}

function openQrModal() {
  if (!selectedMatch || !modalQr) return;
  resetReceiptInput();

  modalConcept.textContent = `${selectedMatch.sport} - ${selectedMatch.title}`;
  modalPrice.textContent = `Bs. ${selectedMatch.price.toFixed(2)}`;

  const qrPayload = encodeURIComponent(
    `PAGO-QR-SIMPLE|PARTIDO:${selectedMatch.id}|MONTO:${selectedMatch.price}|CANCHA:${selectedMatch.title}`
  );
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrPayload}`;

  modalQr.removeAttribute("hidden");
  modalQr.style.display = "flex";
}

function closeQrModal() {
  if (modalQr) {
    modalQr.setAttribute("hidden", "");
    modalQr.style.display = "none";
  }
  resetReceiptInput();
}

if (receiptInput) {
  receiptInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("El comprobante debe pesar menos de 4 MB.");
      resetReceiptInput();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      currentReceiptBase64 = event.target.result;
      receiptPreview.src = currentReceiptBase64;
      previewWrapper.removeAttribute("hidden");
      uploadLabelText.textContent = "Cambiar imagen seleccionada";
    };
    reader.readAsDataURL(file);
  });
}

if (btnRemoveReceipt) btnRemoveReceipt.addEventListener("click", resetReceiptInput);

if (btnSubscribe) {
  btnSubscribe.onclick = (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    if (selectedMatch.currentPlayers >= selectedMatch.maxPlayers) {
      alert("Lo sentimos, este partido ya no tiene cupos disponibles.");
      return;
    }
    openQrModal();
  };
}

if (btnCloseModal) btnCloseModal.addEventListener("click", closeQrModal);
if (btnCancelPayment) btnCancelPayment.addEventListener("click", closeQrModal);

if (btnConfirmPayment) {
  btnConfirmPayment.addEventListener("click", async () => {
    if (!selectedMatch) return;

    if (!currentReceiptBase64) {
      alert("Por favor adjunta la captura de tu transferencia.");
      return;
    }

    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    btnConfirmPayment.disabled = true;
    btnConfirmPayment.textContent = "Enviando comprobante...";

    const { error } = await db.from("receipts").insert([
      {
        match_id: selectedMatch.id,
        match_title: selectedMatch.title,
        sport: selectedMatch.sport,
        amount: selectedMatch.price,
        date: formattedTime,
        status: "Pendiente",
        receipt_image: currentReceiptBase64
      }
    ]);

    btnConfirmPayment.disabled = false;
    btnConfirmPayment.textContent = "Confirmar Inscripción";

    if (error) {
      alert("Error al enviar comprobante: " + error.message);
      return;
    }

    closeQrModal();
    alert(`¡Comprobante enviado a la nube!\nEl organizador revisará tu transferencia de Bs. ${selectedMatch.price.toFixed(2)}.`);
  });
}

// ==========================================
// 11. PANEL DE ADMINISTRADOR
// ==========================================
function renderAdminPanel() {
  if (!adminReceiptsList) return;
  adminReceiptsList.innerHTML = "";

  const pendingCount = receipts.filter((r) => r.status === "Pendiente").length;
  adminPendingCount.textContent = pendingCount;

  if (receipts.length === 0) {
    adminReceiptsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
        No hay comprobantes registrados aún.
      </div>`;
    return;
  }

  receipts.forEach((item) => {
    const card = document.createElement("div");
    card.className = "receipt-card";

    let statusClass = "status-pending";
    if (item.status === "Aprobado") statusClass = "status-approved";
    if (item.status === "Rechazado") statusClass = "status-rejected";

    card.innerHTML = `
      <div class="receipt-header">
        <span class="receipt-match-title">${item.matchTitle}</span>
        <span class="receipt-status-tag ${statusClass}">${item.status}</span>
      </div>

      <div class="receipt-body-layout">
        <img class="receipt-thumb-admin" src="${item.receiptImage}" alt="Comprobante" title="Toca para agrandar">
        <div class="receipt-info-text">
          <span><strong>Deporte:</strong> ${item.sport}</span>
          <span><strong>Monto:</strong> Bs. ${Number(item.amount).toFixed(2)}</span>
          <span><strong>Hora:</strong> ${item.date}</span>
        </div>
      </div>

      ${item.status === "Pendiente" ? `
        <div class="receipt-actions">
          <button class="btn-approve" onclick="approveReceipt(${item.id})">✓ Aprobar</button>
          <button class="btn-reject" onclick="rejectReceipt(${item.id})">✕ Rechazar</button>
        </div>
      ` : ""}
    `;

    const thumb = card.querySelector(".receipt-thumb-admin");
    thumb.addEventListener("click", () => openImageViewer(item.receiptImage));

    adminReceiptsList.appendChild(card);
  });
}

window.approveReceipt = async function(receiptId) {
  const receipt = receipts.find((r) => r.id === receiptId);
  if (!receipt) return;

  const match = matches.find((m) => m.id === receipt.matchId);
  if (match) {
    if (match.currentPlayers >= match.maxPlayers) {
      alert("No se puede aprobar: la cancha ya llenó todos sus cupos.");
      return;
    }
    // Actualizar cupos en Supabase
    await db.from("matches").update({ current_players: match.currentPlayers + 1 }).eq("id", match.id);
  }

  // Actualizar estado en Supabase
  await db.from("receipts").update({ status: "Aprobado" }).eq("id", receiptId);
  alert("Inscripción aprobada en la nube. Se ha generado el pase digital.");
};

window.rejectReceipt = async function(receiptId) {
  const confirmReject = confirm("¿Estás seguro de rechazar este comprobante?");
  if (confirmReject) {
    await db.from("receipts").update({ status: "Rechazado" }).eq("id", receiptId);
  }
};

function openImageViewer(imageSrc) {
  viewerFullImage.src = imageSrc;
  modalImageViewer.removeAttribute("hidden");
  modalImageViewer.style.display = "flex";
}

if (btnCloseViewer) {
  btnCloseViewer.addEventListener("click", () => {
    modalImageViewer.setAttribute("hidden", "");
    modalImageViewer.style.display = "none";
  });
}

if (btnClearReceipts) {
  btnClearReceipts.addEventListener("click", async () => {
    if (confirm("¿Deseas vaciar todo el historial de comprobantes en la nube?")) {
      await db.from("receipts").delete().neq("id", 0);
      fetchReceipts();
    }
  });
}

// ==========================================
// 12. PASES DIGITALES & DESCARGA PDF
// ==========================================
function renderMyTickets() {
  if (!myTicketsSection || !myTicketsList) return;

  const approvedList = receipts.filter((r) => r.status === "Aprobado");

  if (approvedList.length === 0) {
    myTicketsSection.setAttribute("hidden", "");
    myTicketsList.innerHTML = "";
    return;
  }

  myTicketsSection.removeAttribute("hidden");
  myTicketsList.innerHTML = "";

  approvedList.forEach((ticket) => {
    const card = document.createElement("div");
    card.className = "ticket-card";
    card.innerHTML = `
      <div class="ticket-info">
        <span class="ticket-tag">✓ Pase Confirmado</span>
        <h4 class="ticket-title">${ticket.matchTitle}</h4>
        <span class="ticket-meta">Monto: Bs. ${Number(ticket.amount).toFixed(2)} | Hora: ${ticket.date}</span>
      </div>
      <button class="btn-download-pdf" onclick="downloadPassPDF(${ticket.id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        PDF
      </button>
    `;
    myTicketsList.appendChild(card);
  });
}

window.downloadPassPDF = function (ticketId) {
  const ticket = receipts.find((r) => r.id === ticketId);
  if (!ticket) return;

  const match = matches.find((m) => m.id === ticket.matchId) || {};
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [100, 150]
  });

  doc.setFillColor(18, 19, 22);
  doc.rect(0, 0, 100, 150, "F");

  doc.setFillColor(255, 90, 31);
  doc.rect(0, 0, 100, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("PASE DIGITAL DE ENTRADA", 50, 12, { align: "center" });

  doc.setDrawColor(39, 41, 48);
  doc.setFillColor(27, 28, 33);
  doc.roundedRect(6, 24, 88, 118, 3, 3, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 200, 83);
  doc.text("● PAGO APROBADO & CONFIRMADO", 12, 34);

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(ticket.matchTitle, 12, 43);

  doc.setFontSize(9);
  doc.setTextColor(255, 90, 31);
  doc.text(`DEPORTE: ${(ticket.sport || "Fútbol").toUpperCase()}`, 12, 51);

  doc.setDrawColor(50, 52, 60);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(12, 56, 88, 56);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(139, 144, 154);
  doc.text("HORARIO:", 12, 63);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(240, 241, 243);
  doc.text(match.timeFull || "21:00 - 22:00", 12, 68);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(139, 144, 154);
  doc.text("FECHA:", 12, 75);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(240, 241, 243);
  doc.text(match.dateLong || "Fecha confirmada", 12, 80);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(139, 144, 154);
  doc.text("DIRECCIÓN:", 12, 87);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(240, 241, 243);
  const splitAddress = doc.splitTextToSize(match.address || "La Paz, Bolivia", 76);
  doc.text(splitAddress, 12, 92);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(139, 144, 154);
  doc.text("MONTO PAGADO:", 12, 106);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 90, 31);
  doc.setFontSize(11);
  doc.text(`Bs. ${Number(ticket.amount).toFixed(2)}`, 12, 112);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(101, 105, 115);
  doc.text(`CÓDIGO PASE: #${ticket.id}`, 50, 128, { align: "center" });
  doc.text("Muestra este PDF o captura al ingresar a la cancha.", 50, 133, { align: "center" });

  doc.save(`Pase-${ticket.matchTitle.replace(/\s+/g, "_")}-${ticket.id}.pdf`);
};

// ==========================================
// 13. COMPARTIR E INVITAR
// ==========================================
async function shareMatch() {
  if (!selectedMatch) return;
  const shareData = {
    title: `Partido en ${selectedMatch.title}`,
    text: `¡Vamos a jugar! Partido de ${selectedMatch.sport} el ${selectedMatch.dateLong} a las ${selectedMatch.timeFull}. Cupos: ${selectedMatch.currentPlayers}/${selectedMatch.maxPlayers}.`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Compartir descartado");
    }
  } else {
    navigator.clipboard.writeText(`${shareData.text} Enlace: ${shareData.url}`);
    alert("Enlace copiado al portapapeles para invitar a tus amigos.");
  }
}

btnShare.addEventListener("click", shareMatch);
btnInvite.addEventListener("click", shareMatch);

// ==========================================
// 14. FILTROS Y BÚSQUEDA
// ==========================================
chipButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    chipButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentSportFilter = btn.dataset.sport;
    renderMatches();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim();
    renderMatches();
  });
}

// ==========================================
// 15. ARRANQUE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  fetchMatches();
  fetchReceipts();
});