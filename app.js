// ==========================================
// 1. REGISTRO DEL SERVICE WORKER (PWA)
// ==========================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("SW Activo en alcance:", reg.scope))
      .catch((err) => console.error("Error al registrar SW:", err));
  });
}

// Control del evento de instalación nativo
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
    console.log(`Elección de instalación: ${outcome}`);
    deferredPrompt = null;
    btnInstall.setAttribute("hidden", "");
  });
}

window.addEventListener("appinstalled", () => {
  console.log("Aplicación instalada en el dispositivo.");
  if (btnInstall) btnInstall.setAttribute("hidden", "");
  deferredPrompt = null;
});

// ==========================================
// 2. BASE DE DATOS Y PERSISTENCIA (LOCALSTORAGE)
// ==========================================
const DEFAULT_MATCHES = [
  {
    id: 1,
    title: "Cañada Strongest",
    dateGroup: "Hoy · Jueves 29 de octubre",
    dateLong: "jueves 29 de octubre, 2026",
    sport: "Fútbol",
    time: "21:00 — 22:00",
    timeFull: "21:00 - 22:00",
    address: "Calle Francisco Monroy, entre avenida illimani y calle yungas",
    price: 29.00,
    currentPlayers: 18,
    maxPlayers: 22,
    image: "https://images.unsplash.com/photo-1529900241451-b939e447ff64?w=600&q=80",
    organizer: "BenjaminVidal"
  },
  {
    id: 2,
    title: "Cañada Strongest",
    dateGroup: "Mañana · Viernes 30 de octubre",
    dateLong: "viernes 30 de octubre, 2026",
    sport: "Fútbol",
    time: "20:00 — 21:00",
    timeFull: "20:00 - 21:00",
    address: "Calle Francisco Monroy, entre avenida illimani y calle yungas",
    price: 29.00,
    currentPlayers: 0,
    maxPlayers: 22,
    image: "https://images.unsplash.com/photo-1529900241451-b939e447ff64?w=600&q=80",
    organizer: "BenjaminVidal"
  },
  {
    id: 3,
    title: "Cancha Zapata",
    dateGroup: "Mañana · Viernes 30 de octubre",
    dateLong: "viernes 30 de octubre, 2026",
    sport: "Wally",
    time: "20:00 — 21:00",
    timeFull: "20:00 - 21:00",
    address: "Calle Zapata y avenida del poeta",
    price: 20.00,
    currentPlayers: 6,
    maxPlayers: 12,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    organizer: "CarlosReyes"
  }
];

let matches = JSON.parse(localStorage.getItem("app_matches")) || DEFAULT_MATCHES;

function saveMatches() {
  localStorage.setItem("app_matches", JSON.stringify(matches));
}

// ==========================================
// 3. REFERENCIAS DEL DOM Y VARIABLES DE ESTADO
// ==========================================
let currentSportFilter = "Todos";
let currentSearchQuery = "";
let selectedMatch = null;

const viewList = document.getElementById("view-list");
const viewDetail = document.getElementById("view-detail");
const matchesContainer = document.getElementById("matches-list-container");
const searchInput = document.getElementById("search-input");
const chipButtons = document.querySelectorAll(".chip-item");
const btnBack = document.getElementById("btn-back");
const btnShare = document.getElementById("btn-share");
const btnInvite = document.getElementById("btn-invite");
const btnSubscribe = document.getElementById("btn-subscribe");

// Elementos de la vista detalle
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

// Elementos del Modal QR Simple
const modalQr = document.getElementById("modal-qr");
const qrImage = document.getElementById("qr-image");
const modalConcept = document.getElementById("modal-concept");
const modalPrice = document.getElementById("modal-price");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelPayment = document.getElementById("btn-cancel-payment");
const btnConfirmPayment = document.getElementById("btn-confirm-payment");

// ==========================================
// 4. RENDERIZADO DE PARTIDOS EN LA VISTA LISTA
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
        No se encontraron partidos para tu búsqueda.
      </div>`;
    return;
  }

  // Agrupar por fecha/sección
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
// 5. NAVEGACIÓN Y DETALLE DE PARTIDO
// ==========================================
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

  viewList.classList.remove("active");
  viewDetail.classList.add("active");
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
  viewDetail.classList.remove("active");
  viewList.classList.add("active");
  renderMatches();
});

// ==========================================
// 6. GESTIÓN DEL MODAL QR SIMPLE
// ==========================================
function openQrModal() {
  if (!selectedMatch || !modalQr) return;

  modalConcept.textContent = `${selectedMatch.sport} - ${selectedMatch.title}`;
  modalPrice.textContent = `Bs. ${selectedMatch.price.toFixed(2)}`;

  // Generación dinámica de QR con los datos del partido
  const qrPayload = encodeURIComponent(
    `PAGO-QR-SIMPLE|PARTIDO:${selectedMatch.id}|MONTO:${selectedMatch.price}|CANCHA:${selectedMatch.title}`
  );
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrPayload}`;

  modalQr.removeAttribute("hidden");
}

function closeQrModal() {
  if (modalQr) modalQr.setAttribute("hidden", "");
}

btnSubscribe.addEventListener("click", () => {
  if (!selectedMatch || selectedMatch.currentPlayers >= selectedMatch.maxPlayers) return;
  openQrModal();
});

if (btnCloseModal) btnCloseModal.addEventListener("click", closeQrModal);
if (btnCancelPayment) btnCancelPayment.addEventListener("click", closeQrModal);

if (btnConfirmPayment) {
  btnConfirmPayment.addEventListener("click", () => {
    if (!selectedMatch) return;

    selectedMatch.currentPlayers += 1;
    saveMatches();

    detailBadgeQuota.textContent = `${selectedMatch.currentPlayers}/${selectedMatch.maxPlayers} jugadores`;
    updateSubscribeButton();
    closeQrModal();

    alert(
      `¡Pago verificado exitosamente!\nHas asegurado tu lugar en "${selectedMatch.title}" por Bs. ${selectedMatch.price.toFixed(2)}.`
    );
  });
}

// ==========================================
// 7. COMPARTIR E INVITAR AMIGOS
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
    navigator.clipboard.writeText(`${shareData.text} Entra aquí: ${shareData.url}`);
    alert("Enlace copiado al portapapeles para invitar a tus amigos.");
  }
}

btnShare.addEventListener("click", shareMatch);
btnInvite.addEventListener("click", shareMatch);

// ==========================================
// 8. EVENTOS DE FILTROS Y BÚSQUEDA
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

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
  renderMatches();
});