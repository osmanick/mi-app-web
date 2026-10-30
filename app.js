// ==========================================
// 1. SUPABASE CLIENT
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
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.setAttribute("hidden", "");
  });
}

// ==========================================
// 3. ESTADOS Y VARIABLES GLOBALES
// ==========================================
let matches = [];
let receipts = [];
let venuesList = [];
let currentProfile = null;
let currentSportFilter = "Todos";
let currentSearchQuery = "";
let selectedMatch = null;
let currentReceiptBase64 = null;

// ==========================================
// 4. REFERENCIAS DEL DOM
// ==========================================
const viewRegister = document.getElementById("view-register");
const viewList = document.getElementById("view-list");
const viewDetail = document.getElementById("view-detail");
const viewMessages = document.getElementById("view-messages");
const viewProfile = document.getElementById("view-profile");
const viewAdmin = document.getElementById("view-admin");
const bottomBar = document.getElementById("bottom-bar");

// Pestañas Auth
const tabAuthLogin = document.getElementById("tab-auth-login");
const tabAuthRegister = document.getElementById("tab-auth-register");
const formLoginUser = document.getElementById("form-login-user");
const formRegisterUser = document.getElementById("form-register-user");
const authTitle = document.getElementById("auth-title");

// Vista Partidos
const matchesContainer = document.getElementById("matches-list-container");
const searchInput = document.getElementById("search-input");
const chipButtons = document.querySelectorAll(".chip-item");
const btnBack = document.getElementById("btn-back");
const btnAdminBack = document.getElementById("btn-admin-back");
const btnShare = document.getElementById("btn-share");
const btnInvite = document.getElementById("btn-invite");
const btnSubscribe = document.getElementById("btn-subscribe");

// Pestañas inferiores
const tabMatches = document.getElementById("tab-matches");
const tabClubs = document.getElementById("tab-clubs");
const tabMessages = document.getElementById("tab-messages");
const tabAlerts = document.getElementById("tab-alerts");
const tabProfile = document.getElementById("tab-profile");
const badgePending = document.getElementById("badge-pending");

// Detalle Cancha & Opciones Organizador
const detailImg = document.getElementById("detail-img");
const detailBadgeQuota = document.getElementById("detail-badge-quota");
const detailVenueName = document.getElementById("detail-venue-name");
const detailSportTag = document.getElementById("detail-sport-tag");
const detailDateLong = document.getElementById("detail-date-long");
const detailTime = document.getElementById("detail-time");
const detailVenueSub = document.getElementById("detail-venue-sub");
const detailAddress = document.getElementById("detail-address");
const detailMap = document.getElementById("btn-map");
const detailPlayersList = document.getElementById("detail-players-list");
const detailPlayersRatio = document.getElementById("detail-players-ratio");
const organizerConfirmBox = document.getElementById("organizer-confirm-box");
const toggleMatchConfirmed = document.getElementById("toggle-match-confirmed");
const organizerFinishBox = document.getElementById("organizer-finish-box");
const btnFinishMatch = document.getElementById("btn-finish-match");

// Modal QR y Comprobante
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
const btnAdminLogout = document.getElementById("btn-admin-logout");
const btnAdminLogoutTop = document.getElementById("btn-admin-logout-top");

// Modal Canjear Promo
const modalRedeem = document.getElementById("modal-redeem");
const btnOpenRedeem = document.getElementById("btn-open-redeem");
const btnCancelRedeem = document.getElementById("btn-cancel-redeem");
const btnConfirmRedeem = document.getElementById("btn-confirm-redeem");
const inputPromoCode = document.getElementById("input-promo-code");

// Modal Crear Partido con Select de Sedes
const btnCreateMatchFab = document.getElementById("btn-create-match-fab");
const modalCreateMatch = document.getElementById("modal-create-match");
const btnCloseCreateModal = document.getElementById("btn-close-create-modal");
const formNewMatch = document.getElementById("form-new-match");
const selectVenue = document.getElementById("select-venue");
const inputMatchAddress = document.getElementById("input-match-address");
const inputMatchSport = document.getElementById("input-match-sport");

// Modal Credenciales
const modalSecurity = document.getElementById("modal-security");
const btnOpenSecurityModal = document.getElementById("btn-open-security-modal");
const btnCancelSecurity = document.getElementById("btn-cancel-security");
const btnSaveSecurity = document.getElementById("btn-save-security");
const inputEditUsername = document.getElementById("input-edit-username");
const inputEditPassword = document.getElementById("input-edit-password");

// Perfil y Avatar
const btnLogout = document.getElementById("btn-logout");
const btnTabAbout = document.getElementById("btn-tab-about");
const btnTabEvents = document.getElementById("btn-tab-events");
const tabAboutContent = document.getElementById("profile-tab-about");
const tabEventsContent = document.getElementById("profile-tab-events");
const pillMyMatches = document.getElementById("pill-my-matches");
const pillMyBookings = document.getElementById("pill-my-bookings");
const eventsMatchesSub = document.getElementById("events-matches-subview");
const eventsBookingsSub = document.getElementById("events-bookings-subview");
const btnChangeAvatar = document.getElementById("btn-change-avatar");
const inputAvatarFile = document.getElementById("input-avatar-file");
const profileAvatarImg = document.getElementById("profile-avatar-img");

// ==========================================
// 5. FORMATEO INTELIGENTE DE FECHAS (Hoy, Mañana, Posterior)
// ==========================================
function formatSmartDateGroup(dateString) {
  // Dividir año, mes, día (evita desfases por zona horaria)
  const [year, month, day] = dateString.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((targetDate - today) / oneDayMs);

  const weekday = targetDate.toLocaleDateString("es-ES", { weekday: "long" });
  const dayNum = targetDate.getDate();
  const monthName = targetDate.toLocaleDateString("es-ES", { month: "long" });

  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  if (diffDays === 0) {
    return `Hoy · ${capitalizedWeekday} ${dayNum} de ${monthName}`;
  } else if (diffDays === 1) {
    return `Mañana · ${capitalizedWeekday} ${dayNum} de ${monthName}`;
  } else {
    return `${capitalizedWeekday} ${dayNum} de ${monthName}`;
  }
}

// ==========================================
// 6. CARGA DE CANCHAS PREDEFINIDAS (VENUES)
// ==========================================
async function fetchVenues() {
  const { data, error } = await db.from("venues").select("*").order("name", { ascending: true });
  if (error) {
    console.error("Error al cargar sedes:", error);
    return;
  }

  venuesList = data;
  if (!selectVenue) return;

  selectVenue.innerHTML = '<option value="">-- Selecciona una cancha --</option>';
  venuesList.forEach((venue) => {
    const opt = document.createElement("option");
    opt.value = venue.id;
    opt.textContent = `${venue.name} (${venue.sport})`;
    selectVenue.appendChild(opt);
  });
}

if (selectVenue) {
  selectVenue.addEventListener("change", () => {
    const venueId = selectVenue.value;
    const selected = venuesList.find((v) => v.id == venueId);

    if (selected) {
      inputMatchAddress.value = selected.address;
      inputMatchSport.value = selected.sport;
    } else {
      inputMatchAddress.value = "";
      inputMatchSport.value = "";
    }
  });
}

// ==========================================
// 7. SESIÓN, LOGIN Y REGISTRO
// ==========================================
async function checkUserSession() {
  const activeUserId = localStorage.getItem("app_active_user");

  if (!activeUserId) {
    if (bottomBar) bottomBar.style.display = "none";
    switchScreen(viewRegister);
    return;
  }

  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", activeUserId)
    .single();

  if (error || !data) {
    localStorage.removeItem("app_active_user");
    if (bottomBar) bottomBar.style.display = "none";
    switchScreen(viewRegister);
    return;
  }

  currentProfile = data;
  if (bottomBar) bottomBar.style.display = "flex";
  applyRolePermissions();
  renderProfileView();
  switchScreen(viewList);
  fetchVenues();
  fetchMatches();
  fetchReceipts();
}

if (tabAuthLogin && tabAuthRegister) {
  tabAuthLogin.addEventListener("click", () => {
    tabAuthRegister.classList.remove("active");
    tabAuthLogin.classList.add("active");
    formRegisterUser.classList.remove("active");
    formLoginUser.classList.add("active");
    if (authTitle) authTitle.textContent = "Iniciar Sesión";
  });

  tabAuthRegister.addEventListener("click", () => {
    tabAuthLogin.classList.remove("active");
    tabAuthRegister.classList.add("active");
    formLoginUser.classList.remove("active");
    formRegisterUser.classList.add("active");
    if (authTitle) authTitle.textContent = "Crear Cuenta";
  });
}

if (formLoginUser) {
  formLoginUser.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();
    const btnSubmit = document.getElementById("btn-submit-login");

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Verificando...";

    const { data: user, error } = await db
      .from("profiles")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();

    btnSubmit.disabled = false;
    btnSubmit.textContent = "Entrar";

    if (error) {
      alert("Error al conectar con la base de datos: " + error.message);
      return;
    }

    if (!user) {
      alert("Usuario o contraseña incorrectos. Verifica tus credenciales.");
      return;
    }

    localStorage.setItem("app_active_user", user.id);
    currentProfile = user;

    if (bottomBar) bottomBar.style.display = "flex";
    applyRolePermissions();
    renderProfileView();
    switchScreen(viewList);
    fetchVenues();
    fetchMatches();
    fetchReceipts();

    formLoginUser.reset();
  });
}

if (formRegisterUser) {
  formRegisterUser.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("reg-firstname").value.trim();
    const lastName = document.getElementById("reg-lastname").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const birthDate = document.getElementById("reg-birth").value;
    const skill = document.getElementById("reg-skill").value;
    const city = document.getElementById("reg-city").value.trim();
    const nationality = document.getElementById("reg-nationality").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const username = document.getElementById("reg-username").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value.trim();

    const newUserId = "user_" + Date.now();

    const newProfile = {
      id: newUserId,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      birth_date: birthDate,
      skill_level: skill,
      city: city,
      nationality: nationality,
      email: email,
      username: username,
      password: password,
      role: "JUGADOR",
      matches_played: 0,
      balance: 0.00,
      promo_balance: 0.00,
      plan: "FREE",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
    };

    const { error } = await db.from("profiles").insert([newProfile]);

    if (error) {
      alert("Error al registrarse: " + error.message);
      return;
    }

    localStorage.setItem("app_active_user", newUserId);
    currentProfile = newProfile;

    if (bottomBar) bottomBar.style.display = "flex";
    applyRolePermissions();
    renderProfileView();
    switchScreen(viewList);
    fetchVenues();
    fetchMatches();
    fetchReceipts();

    alert(`¡Bienvenido ${firstName}! Tu cuenta ha sido creada.`);
  });
}

function logoutUser() {
  if (confirm("¿Seguro que deseas cerrar sesión?")) {
    localStorage.removeItem("app_active_user");
    currentProfile = null;

    if (bottomBar) bottomBar.style.display = "none";
    if (formRegisterUser) formRegisterUser.reset();
    if (formLoginUser) formLoginUser.reset();

    if (tabAuthLogin) tabAuthLogin.click();
    switchScreen(viewRegister);
  }
}

if (btnLogout) btnLogout.addEventListener("click", logoutUser);
if (btnAdminLogout) btnAdminLogout.addEventListener("click", logoutUser);
if (btnAdminLogoutTop) btnAdminLogoutTop.addEventListener("click", logoutUser);

// ==========================================
// 8. PERMISOS & CARGA DE PARTIDOS
// ==========================================
function applyRolePermissions() {
  if (!currentProfile) return;

  const isOrganizer = currentProfile.role === "ORGANIZADOR";

  if (btnCreateMatchFab) {
    if (isOrganizer) {
      btnCreateMatchFab.removeAttribute("hidden");
    } else {
      btnCreateMatchFab.setAttribute("hidden", "");
    }
  }

  const tabProfileLabel = tabProfile.querySelector("span");
  if (tabProfileLabel) {
    tabProfileLabel.textContent = isOrganizer ? "Organizador" : "Perfil";
  }

  updatePendingBadge();
}

async function fetchMatches() {
  // Excluir partidos marcados como finalizados
  const { data, error } = await db
    .from("matches")
    .select("*")
    .eq("is_finished", false)
    .order("id", { ascending: true });

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
    organizer: m.organizer,
    isConfirmed: m.is_confirmed || false
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
    receiptImage: r.receipt_image,
    userId: r.user_id,
    username: r.username || "Jugador",
    avatarUrl: r.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
  }));

  updatePendingBadge();
  if (viewAdmin && viewAdmin.classList.contains("active")) {
    renderAdminPanel();
  }
  if (selectedMatch) {
    renderConfirmedPlayers(selectedMatch.id);
  }
}

// ==========================================
// 9. REALTIME & AUDIO
// ==========================================
db.channel("global-realtime")
  .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => fetchMatches())
  .on("postgres_changes", { event: "*", schema: "public", table: "receipts" }, () => {
    fetchReceipts();
    playNotificationSound();
  })
  .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
    if (currentProfile && payload.new && payload.new.id === currentProfile.id) {
      currentProfile = payload.new;
      renderProfileView();
      applyRolePermissions();
    }
  })
  .subscribe();

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
    console.log("Audio pausado");
  }
}

function updatePendingBadge() {
  if (!badgePending) return;
  const pendingCount = receipts.filter((r) => r.status === "Pendiente").length;

  if (currentProfile && currentProfile.role === "ORGANIZADOR" && pendingCount > 0) {
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
// 10. RENDERIZADO DE PARTIDOS
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
        No hay partidos activos en este momento.
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

      const confirmedBadgeHtml = match.isConfirmed
        ? `<div class="badge-confirmed-tag">
             <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
             Confirmado
           </div>`
        : "";

      card.innerHTML = `
        <div class="match-thumb-wrapper">
          <img class="match-thumb" src="${match.image}" alt="${match.title}">
          ${confirmedBadgeHtml}
        </div>
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
            <div class="match-footer-icons">
              <svg class="players-icon-svg" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
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
// 11. DETALLE DEL PARTIDO, JUGADORES Y FINALIZACIÓN
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
  detailMap.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMatch.address + ", La Paz")}`;

  const isOrganizer = currentProfile && currentProfile.role === "ORGANIZADOR";

  // Control estricto de visibilidad del switch
  if (organizerConfirmBox && toggleMatchConfirmed) {
    if (isOrganizer) {
      organizerConfirmBox.removeAttribute("hidden");
      organizerConfirmBox.style.display = "flex";
      toggleMatchConfirmed.disabled = false;
      toggleMatchConfirmed.checked = !!selectedMatch.isConfirmed;
    } else {
      organizerConfirmBox.setAttribute("hidden", "");
      organizerConfirmBox.style.display = "none";
      toggleMatchConfirmed.disabled = true;
    }
  }

  // Control estricto del botón Finalizar Partido
  if (organizerFinishBox) {
    if (isOrganizer) {
      organizerFinishBox.removeAttribute("hidden");
      organizerFinishBox.style.display = "block";
    } else {
      organizerFinishBox.setAttribute("hidden", "");
      organizerFinishBox.style.display = "none";
    }
  }

  renderConfirmedPlayers(selectedMatch.id);
  updateSubscribeButton();
  switchScreen(viewDetail);
}

// Evento switch estado confirmado
if (toggleMatchConfirmed) {
  toggleMatchConfirmed.addEventListener("change", async (e) => {
    if (!selectedMatch || !currentProfile || currentProfile.role !== "ORGANIZADOR") {
      alert("Acceso denegado: solo el Organizador puede modificar el estado del partido.");
      e.target.checked = !e.target.checked;
      return;
    }

    const newStatus = e.target.checked;
    selectedMatch.isConfirmed = newStatus;

    const { error } = await db
      .from("matches")
      .update({ is_confirmed: newStatus })
      .eq("id", selectedMatch.id);

    if (error) {
      alert("Error al actualizar estado en Supabase: " + error.message);
      toggleMatchConfirmed.checked = !newStatus;
      selectedMatch.isConfirmed = !newStatus;
      return;
    }

    renderMatches();
  });
}

// Evento: Finalizar y quitar partido de la lista
if (btnFinishMatch) {
  btnFinishMatch.addEventListener("click", async () => {
    if (!selectedMatch || currentProfile?.role !== "ORGANIZADOR") {
      alert("Acceso denegado: solo el Organizador puede finalizar partidos.");
      return;
    }

    if (confirm(`¿Deseas dar por finalizado el partido en "${selectedMatch.title}" y quitarlo de la lista?`)) {
      const { error } = await db
        .from("matches")
        .update({ is_finished: true })
        .eq("id", selectedMatch.id);

      if (error) {
        alert("Error al finalizar partido: " + error.message);
        return;
      }

      alert("El partido ha finalizado y ha sido retirado de la cartelera.");
      switchScreen(viewList);
      fetchMatches();
    }
  });
}

// Renderizado de jugadores con avatar real
async function renderConfirmedPlayers(matchId) {
  if (!detailPlayersList || !selectedMatch) return;
  detailPlayersList.innerHTML = "";

  const approvedReceipts = receipts.filter(
    (r) => r.matchId === matchId && r.status === "Aprobado"
  );

  detailPlayersRatio.textContent = `${approvedReceipts.length}-${selectedMatch.maxPlayers}`;

  if (approvedReceipts.length === 0) {
    detailPlayersList.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.8rem 0;">
        Aún no hay jugadores confirmados. ¡Sé el primero en unirte!
      </div>`;
    return;
  }

  // Obtener los perfiles en tiempo real para reflejar su avatar más reciente
  const userIds = approvedReceipts.map((r) => r.userId).filter(Boolean);
  let profilesMap = {};

  if (userIds.length > 0) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    if (profiles) {
      profiles.forEach((p) => {
        profilesMap[p.id] = p;
      });
    }
  }

  approvedReceipts.forEach((player) => {
    const profile = profilesMap[player.userId];
    const username = profile?.username || player.username || "Jugador";
    const avatarUrl = profile?.avatar_url || player.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";

    const card = document.createElement("div");
    card.className = "player-card-item";
    card.innerHTML = `
      <div class="player-meta-wrap">
        <img class="player-thumb-avatar" src="${avatarUrl}" alt="${username}">
        <div class="player-names-col">
          <span class="player-name-val">${username}</span>
          <span class="player-role-tag">Jugador</span>
        </div>
      </div>
      <span class="player-chevron">›</span>
    `;
    detailPlayersList.appendChild(card);
  });
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

// ==========================================
// 12. NAVEGACIÓN ENTRE VISTAS
// ==========================================
function switchScreen(targetScreen) {
  [viewRegister, viewList, viewDetail, viewMessages, viewProfile, viewAdmin].forEach((screen) => {
    if (screen) screen.classList.remove("active");
  });
  if (targetScreen) targetScreen.classList.add("active");
}

function clearTabSelection() {
  [tabMatches, tabClubs, tabMessages, tabAlerts, tabProfile].forEach((t) => {
    if (t) t.classList.remove("active");
  });
}

tabMatches.addEventListener("click", () => {
  clearTabSelection();
  tabMatches.classList.add("active");
  switchScreen(viewList);
  renderMatches();
});

tabMessages.addEventListener("click", () => {
  clearTabSelection();
  tabMessages.classList.add("active");
  switchScreen(viewMessages);
});

tabProfile.addEventListener("click", () => {
  clearTabSelection();
  tabProfile.classList.add("active");

  if (currentProfile && currentProfile.role === "ORGANIZADOR") {
    renderAdminPanel();
    switchScreen(viewAdmin);
  } else {
    renderProfileView();
    switchScreen(viewProfile);
  }
});

btnBack.addEventListener("click", () => {
  switchScreen(viewList);
  renderMatches();
});

btnAdminBack.addEventListener("click", () => {
  switchScreen(viewList);
  clearTabSelection();
  tabMatches.classList.add("active");
  renderMatches();
});

if (btnTabAbout && btnTabEvents) {
  btnTabAbout.addEventListener("click", () => {
    btnTabEvents.classList.remove("active");
    btnTabAbout.classList.add("active");
    tabEventsContent.classList.remove("active");
    tabAboutContent.classList.add("active");
  });

  btnTabEvents.addEventListener("click", () => {
    btnTabAbout.classList.remove("active");
    btnTabEvents.classList.add("active");
    tabAboutContent.classList.remove("active");
    tabEventsContent.classList.add("active");
  });
}

if (pillMyMatches && pillMyBookings) {
  pillMyMatches.addEventListener("click", () => {
    pillMyBookings.classList.remove("active");
    pillMyMatches.classList.add("active");
    eventsBookingsSub.style.display = "none";
    eventsMatchesSub.style.display = "block";
  });

  pillMyBookings.addEventListener("click", () => {
    pillMyMatches.classList.remove("active");
    pillMyBookings.classList.add("active");
    eventsMatchesSub.style.display = "none";
    eventsBookingsSub.style.display = "block";
  });
}

// ==========================================
// 13. MODAL: MODIFICAR CREDENCIALES
// ==========================================
function openSecurityModal() {
  if (!currentProfile) return;
  inputEditUsername.value = currentProfile.username || "";
  inputEditPassword.value = "";
  modalSecurity.removeAttribute("hidden");
  modalSecurity.style.display = "flex";
}

if (btnOpenSecurityModal) btnOpenSecurityModal.addEventListener("click", openSecurityModal);

if (btnCancelSecurity) {
  btnCancelSecurity.addEventListener("click", () => {
    modalSecurity.setAttribute("hidden", "");
    modalSecurity.style.display = "none";
  });
}

if (btnSaveSecurity) {
  btnSaveSecurity.addEventListener("click", async () => {
    if (!currentProfile) return;

    const newUsername = inputEditUsername.value.trim().toLowerCase();
    const newPassword = inputEditPassword.value.trim();

    if (!newUsername) {
      alert("El username no puede estar vacío.");
      return;
    }

    const updates = { username: newUsername };
    if (newPassword) updates.password = newPassword;

    const { error } = await db.from("profiles").update(updates).eq("id", currentProfile.id);

    if (error) {
      alert("Error al actualizar: " + error.message);
      return;
    }

    currentProfile.username = newUsername;
    if (newPassword) currentProfile.password = newPassword;

    modalSecurity.setAttribute("hidden", "");
    modalSecurity.style.display = "none";
    renderProfileView();
    alert("¡Credenciales actualizadas exitosamente!");
  });
}

function renderProfileView() {
  if (!currentProfile) return;

  document.getElementById("profile-name-display").textContent = `${currentProfile.first_name} ${currentProfile.last_name}`;
  document.getElementById("profile-matches-count").textContent = currentProfile.matches_played || 0;
  document.getElementById("profile-balance").textContent = Number(currentProfile.balance || 0).toFixed(2);
  document.getElementById("profile-promo").textContent = Number(currentProfile.promo_balance || 0).toFixed(2);
  document.getElementById("profile-avatar-img").src = currentProfile.avatar_url;

  document.getElementById("field-firstname").textContent = currentProfile.first_name;
  document.getElementById("field-lastname").textContent = currentProfile.last_name;
  document.getElementById("field-phone").textContent = currentProfile.phone;
  document.getElementById("field-birth").textContent = currentProfile.birth_date;
  document.getElementById("field-skill").textContent = currentProfile.skill_level;
  document.getElementById("field-nationality").textContent = currentProfile.nationality;
  document.getElementById("field-city").textContent = currentProfile.city;
  document.getElementById("field-email").textContent = currentProfile.email;
  document.getElementById("field-plan").textContent = currentProfile.plan;
  document.getElementById("field-username").textContent = currentProfile.username;
}

// ==========================================
// 14. REDIMENSIONAR AVATAR Y STORAGE
// ==========================================
function resizeAndCompressImage(file, maxSize = 300, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = maxSize;
        canvas.height = maxSize;

        const minDimension = Math.min(img.width, img.height);
        const startX = (img.width - minDimension) / 2;
        const startY = (img.height - minDimension) / 2;

        ctx.drawImage(
          img,
          startX,
          startY,
          minDimension,
          minDimension,
          0,
          0,
          maxSize,
          maxSize
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Error al procesar la imagen"));
            }
          },
          "image/webp",
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

if (btnChangeAvatar && inputAvatarFile) {
  btnChangeAvatar.addEventListener("click", () => {
    inputAvatarFile.click();
  });

  inputAvatarFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file || !currentProfile) return;

    btnChangeAvatar.textContent = "⏳";
    btnChangeAvatar.disabled = true;

    try {
      const compressedBlob = await resizeAndCompressImage(file, 300, 0.82);
      const fileName = `${currentProfile.id}_${Date.now()}.webp`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await db.storage
        .from("avatars")
        .upload(filePath, compressedBlob, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = db.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicAvatarUrl = urlData.publicUrl;

      const { error: dbError } = await db
        .from("profiles")
        .update({ avatar_url: publicAvatarUrl })
        .eq("id", currentProfile.id);

      if (dbError) throw dbError;

      currentProfile.avatar_url = publicAvatarUrl;
      if (profileAvatarImg) profileAvatarImg.src = publicAvatarUrl;

      alert("¡Foto de perfil actualizada con éxito!");
    } catch (err) {
      console.error("Error al subir avatar:", err);
      alert("Hubo un error al actualizar la foto: " + err.message);
    } finally {
      btnChangeAvatar.textContent = "+";
      btnChangeAvatar.disabled = false;
      inputAvatarFile.value = "";
    }
  });
}

// ==========================================
// 15. PUBLICAR CANCHA (ORGANIZADOR)
// ==========================================
if (btnCreateMatchFab) {
  btnCreateMatchFab.addEventListener("click", () => {
    if (currentProfile?.role !== "ORGANIZADOR") {
      alert("Acceso denegado: solo el Organizador puede publicar canchas.");
      return;
    }
    modalCreateMatch.removeAttribute("hidden");
    modalCreateMatch.style.display = "flex";
  });
}

if (btnCloseCreateModal) {
  btnCloseCreateModal.addEventListener("click", () => {
    modalCreateMatch.setAttribute("hidden", "");
    modalCreateMatch.style.display = "none";
  });
}

if (formNewMatch) {
  formNewMatch.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (currentProfile?.role !== "ORGANIZADOR") {
      alert("No tienes permisos de organizador.");
      return;
    }

    const venueId = selectVenue.value;
    const venue = venuesList.find((v) => v.id == venueId);

    if (!venue) {
      alert("Por favor selecciona una cancha de la lista.");
      return;
    }

    const rawDate = document.getElementById("input-match-date").value;
    const timeFull = document.getElementById("input-match-time").value.trim();
    const price = parseFloat(document.getElementById("input-match-price").value);
    const maxPlayers = parseInt(document.getElementById("input-match-max").value);

    // Formateo inteligente de fecha
    const dateGroup = formatSmartDateGroup(rawDate);

    const [year, month, day] = rawDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateLong = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const newMatchPayload = {
      title: venue.name,
      sport: venue.sport,
      date_group: dateGroup,
      date_long: dateLong,
      time: timeFull.split("—")[0].split("-")[0].trim(),
      time_full: timeFull,
      price,
      current_players: 0,
      max_players: maxPlayers,
      address: venue.address,
      image: venue.image_url,
      organizer: currentProfile.username || "Organizador",
      is_confirmed: false,
      is_finished: false
    };

    const { error } = await db.from("matches").insert([newMatchPayload]);

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    modalCreateMatch.setAttribute("hidden", "");
    modalCreateMatch.style.display = "none";
    formNewMatch.reset();
    inputMatchAddress.value = "";
    inputMatchSport.value = "";
    alert("¡Cancha habilitada con éxito en la lista de partidos!");
  });
}

// ==========================================
// 16. PAGO QR & COMPROBANTE
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
        receipt_image: currentReceiptBase64,
        user_id: currentProfile ? currentProfile.id : "user_anon",
        username: currentProfile ? currentProfile.username : "Jugador",
        avatar_url: currentProfile ? currentProfile.avatar_url : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
      }
    ]);

    btnConfirmPayment.disabled = false;
    btnConfirmPayment.textContent = "Confirmar Inscripción";

    if (error) {
      alert("Error al enviar comprobante: " + error.message);
      return;
    }

    closeQrModal();
    alert(`¡Comprobante enviado!\nEl organizador revisará tu transferencia de Bs. ${selectedMatch.price.toFixed(2)}.`);
  });
}

// ==========================================
// 17. PANEL ADMIN (APROBACIÓN ORGANIZADOR)
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
          <span><strong>Jugador:</strong> @${item.username}</span>
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

window.approveReceipt = async function (receiptId) {
  const receipt = receipts.find((r) => r.id === receiptId);
  if (!receipt) return;

  const match = matches.find((m) => m.id === receipt.matchId);
  if (match) {
    if (match.currentPlayers >= match.maxPlayers) {
      alert("No se puede aprobar: la cancha ya llenó todos sus cupos.");
      return;
    }
    await db.from("matches").update({ current_players: match.currentPlayers + 1 }).eq("id", match.id);
  }

  if (receipt.userId) {
    const { data: prof } = await db.from("profiles").select("matches_played").eq("id", receipt.userId).single();
    if (prof) {
      await db.from("profiles").update({ matches_played: (prof.matches_played || 0) + 1 }).eq("id", receipt.userId);
    }
  }

  await db.from("receipts").update({ status: "Aprobado" }).eq("id", receiptId);
  alert("Inscripción aprobada: se sumó al partido y aumentó el contador de partidos jugados.");
};

window.rejectReceipt = async function (receiptId) {
  if (confirm("¿Estás seguro de rechazar este comprobante?")) {
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
    if (confirm("¿Deseas vaciar el historial de comprobantes?")) {
      await db.from("receipts").delete().neq("id", 0);
      fetchReceipts();
    }
  });
}

// Canjear Promo
if (btnOpenRedeem) {
  btnOpenRedeem.addEventListener("click", () => {
    modalRedeem.removeAttribute("hidden");
    modalRedeem.style.display = "flex";
    inputPromoCode.value = "";
  });
}

if (btnCancelRedeem) {
  btnCancelRedeem.addEventListener("click", () => {
    modalRedeem.setAttribute("hidden", "");
    modalRedeem.style.display = "none";
  });
}

if (btnConfirmRedeem) {
  btnConfirmRedeem.addEventListener("click", async () => {
    const code = inputPromoCode.value.trim().toUpperCase();
    if (!code) {
      alert("Por favor ingresa un código.");
      return;
    }

    let bonus = 0;
    if (code === "PROMO20" || code === "FUTBOL20") bonus = 20.00;
    else if (code === "BIENVENIDO") bonus = 10.00;
    else {
      alert("Código no válido o expirado.");
      return;
    }

    currentProfile.promo_balance = Number(currentProfile.promo_balance || 0) + bonus;
    await db.from("profiles").update({ promo_balance: currentProfile.promo_balance }).eq("id", currentProfile.id);

    modalRedeem.setAttribute("hidden", "");
    modalRedeem.style.display = "none";
    renderProfileView();
    alert(`¡Felicidades! Se sumaron Bs. ${bonus.toFixed(2)} de saldo promocional.`);
  });
}

// ==========================================
// 18. FILTROS Y ARRANQUE
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

document.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
});