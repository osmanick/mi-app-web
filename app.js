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
      .then((reg) => console.log("SW Activo:", reg.scope))
      .catch((err) => console.error("Error SW:", err));
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
// 3. ESTADOS GLOBALES
// ==========================================
let matches = [];
let receipts = [];
let venuesList = [];
let currentProfile = null;
let currentSportFilter = "Todos";
let currentSearchQuery = "";
let selectedMatch = null;
let currentRechargeBase64 = null;

// ==========================================
// 4. REFERENCIAS DOM
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

// Modal Billetera / Recarga
const modalRecharge = document.getElementById("modal-recharge");
const rechargeAlertMsg = document.getElementById("recharge-alert-msg");
const inputRechargeAmount = document.getElementById("input-recharge-amount");
const rechargeQrImage = document.getElementById("recharge-qr-image");
const rechargeReceiptInput = document.getElementById("recharge-receipt-input");
const rechargePreviewWrapper = document.getElementById("recharge-preview-wrapper");
const rechargeReceiptPreview = document.getElementById("recharge-receipt-preview");
const btnRemoveRechargeReceipt = document.getElementById("btn-remove-recharge-receipt");
const rechargeUploadText = document.getElementById("recharge-upload-text");
const btnConfirmRecharge = document.getElementById("btn-confirm-recharge");
const btnCancelRecharge = document.getElementById("btn-cancel-recharge");
const btnCloseRechargeModal = document.getElementById("btn-close-recharge-modal");
const btnOpenDirectRecharge = document.getElementById("btn-open-direct-recharge");

// Panel Admin
const adminReceiptsList = document.getElementById("admin-receipts-list");
const adminPendingCount = document.getElementById("admin-pending-count");
const btnClearReceipts = document.getElementById("btn-clear-receipts");
const modalImageViewer = document.getElementById("modal-image-viewer");
const viewerFullImage = document.getElementById("viewer-full-image");
const btnCloseViewer = document.getElementById("btn-close-viewer");
const btnAdminLogout = document.getElementById("btn-admin-logout");
const btnAdminLogoutTop = document.getElementById("btn-admin-logout-top");

// Modal Crear Partido
const btnCreateMatchFab = document.getElementById("btn-create-match-fab");
const modalCreateMatch = document.getElementById("modal-create-match");
const btnCloseCreateModal = document.getElementById("btn-close-create-modal");
const formNewMatch = document.getElementById("form-new-match");
const selectVenue = document.getElementById("select-venue");

// Perfil
const btnLogout = document.getElementById("btn-logout");
const btnTabAbout = document.getElementById("btn-tab-about");
const btnTabEvents = document.getElementById("btn-tab-events");
const tabAboutContent = document.getElementById("profile-tab-about");
const tabEventsContent = document.getElementById("profile-tab-events");
//const pillMyMatches = document.getElementById("pill-my-matches");
//const pillMyBookings = document.getElementById("pill-my-bookings");
//const eventsMatchesSub = document.getElementById("events-matches-subview");
//const eventsBookingsSub = document.getElementById("events-bookings-subview");

// ==========================================
// 5. NAVEGACIÓN Y AISLAMIENTO DE PANTALLAS
// ==========================================
function switchScreen(targetScreen) {
  const allScreens = [
    viewRegister,
    viewList,
    viewDetail,
    viewMessages,
    viewProfile,
    viewAdmin
  ];

  allScreens.forEach((screen) => {
    if (screen) {
      screen.classList.remove("active");
      screen.style.display = "none";
    }
  });

  if (targetScreen) {
    targetScreen.classList.add("active");
    targetScreen.style.display = "flex";
  }
}

// ==========================================
// 6. CARGA DE CANCHAS
// ==========================================
async function fetchVenues() {
  try {
    const { data, error } = await db.from("venues").select("*").order("name", { ascending: true });
    if (error) throw error;

    venuesList = data || [];
    if (!selectVenue) return;

    selectVenue.innerHTML = '<option value="">-- Selecciona una cancha --</option>';
    venuesList.forEach((venue) => {
      const opt = document.createElement("option");
      opt.value = venue.id;
      opt.textContent = `${venue.name} (${venue.sport})`;
      selectVenue.appendChild(opt);
    });
  } catch (err) {
    console.error("Error sedes:", err);
  }
}

// ==========================================
// 7. SESIÓN Y AUTENTICACIÓN
// ==========================================
async function checkUserSession() {
  const activeUserId = localStorage.getItem("app_active_user");

  fetchVenues();
  fetchMatches();
  fetchReceipts();

  if (!activeUserId) {
    if (bottomBar) bottomBar.style.display = "none";
    switchScreen(viewRegister);
    return;
  }

  if (bottomBar) bottomBar.style.display = "flex";

  try {
    let { data: user, error } = await db
      .from("profiles")
      .select("*")
      .or(`id.eq.${activeUserId},username.eq.${activeUserId}`)
      .maybeSingle();

    if (user) {
      currentProfile = user;
      localStorage.setItem("app_active_user", user.id);
      applyRolePermissions();
      renderProfileView();

      if (currentProfile.role === "ORGANIZADOR") {
        renderAdminPanel();
      }
    }

    switchScreen(viewList);

  } catch (err) {
    console.error("Error al restaurar perfil:", err);
    switchScreen(viewList);
  }
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
      alert("Error al conectar: " + error.message);
      return;
    }

    if (!user) {
      alert("Usuario o contraseña incorrectos.");
      return;
    }

    localStorage.setItem("app_active_user", user.id);
    currentProfile = user;

    if (bottomBar) bottomBar.style.display = "flex";
    applyRolePermissions();
    renderProfileView();
    switchScreen(viewList);
    fetchMatches();
    fetchReceipts();
    fetchVenues();

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
    fetchMatches();
    fetchReceipts();
    fetchVenues();

    alert(`¡Bienvenido ${firstName}! Tu billetera ha sido activada.`);
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
// 8. CONTROL DE ROLES & PERMISOS
// ==========================================
function applyRolePermissions() {
  const isOrganizer = currentProfile && currentProfile.role === "ORGANIZADOR";

  if (btnCreateMatchFab) {
    if (isOrganizer) {
      btnCreateMatchFab.removeAttribute("hidden");
      btnCreateMatchFab.style.display = "flex";
    } else {
      btnCreateMatchFab.setAttribute("hidden", "");
      btnCreateMatchFab.style.display = "none";
    }
  }

  const tabProfileLabel = tabProfile ? tabProfile.querySelector("span") : null;
  if (tabProfileLabel) {
    tabProfileLabel.textContent = isOrganizer ? "Organizador" : "Perfil";
  }

  updatePendingBadge();
}

async function fetchMatches() {
  const { data, error } = await db
    .from("matches")
    .select("*")
    .or("is_finished.eq.false,is_finished.is.null");

  if (error) {
    console.error("Error matches:", error);
    return;
  }

  const sortedData = (data || []).sort((a, b) => {
    const timeA = (a.time || "00:00").split("-")[0].trim();
    const timeB = (b.time || "00:00").split("-")[0].trim();
    if (a.date_group === b.date_group) {
      return timeA.localeCompare(timeB);
    }
    return (a.id || 0) - (b.id || 0);
  });

  matches = sortedData.map((m) => ({
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
    isConfirmed: m.is_confirmed || false,
    isFinished: m.is_finished || false
  }));

  renderMatches();
}

async function fetchReceipts() {
  const { data, error } = await db.from("receipts").select("*").order("id", { ascending: false });
  if (error) {
    console.error("Error comprobantes:", error);
    return;
  }
  receipts = (data || []).map((r) => ({
    id: r.id,
    type: r.type || "PARTIDO", // "RECARGA" o "PARTIDO"
    rechargeAmount: Number(r.recharge_amount || r.amount || 0),
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
// 9. REALTIME SIN RECARGAR PÁGINA
// ==========================================
const realtimeChannel = db
  .channel("sports-pwa-realtime")
  // 1. Escuchar comprobantes y solicitudes de recarga
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "receipts" },
    async (payload) => {
      console.log("Cambio detectado en receipts:", payload.eventType);
      await fetchReceipts(); // Recarga la lista en memoria y actualiza badges

      // Si el usuario está viendo el panel de organizador, actualizar vista
      if (viewAdmin && viewAdmin.classList.contains("active")) {
        renderAdminPanel();
      }

      // Si está en el detalle de un partido, refrescar la lista de inscritos
      if (selectedMatch) {
        renderConfirmedPlayers(selectedMatch.id);
        updateSubscribeButton();
      }

      // Reproducir sonido si entra una solicitud nueva
      if (payload.eventType === "INSERT") {
        playNotificationSound();
      }
    }
  )
  // 2. Escuchar cambios en partidos (cupos llenos, confirmaciones, etc.)
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "matches" },
    async (payload) => {
      console.log("Cambio detectado en matches:", payload.eventType);
      await fetchMatches(); // Refresca matches y vuelve a ejecutar renderMatches()
      if (selectedMatch) {
        // Mantener actualizado el objeto del partido seleccionado
        const updated = matches.find((m) => m.id === selectedMatch.id);
        if (updated) {
          selectedMatch = updated;
          detailBadgeQuota.textContent = `${selectedMatch.currentPlayers}/${selectedMatch.maxPlayers} jugadores`;
          updateSubscribeButton();
        }
      }
    }
  )
  // 3. Escuchar cambios en perfiles (cuando el admin aprueba saldo de recarga)
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "profiles" },
    (payload) => {
      if (currentProfile && payload.new && payload.new.id === currentProfile.id) {
        const saldoAnterior = currentProfile.balance;
        currentProfile = { ...currentProfile, ...payload.new };
        renderProfileView(); // Actualiza el saldo visible en pantalla al instante

        // Notificar al jugador si su saldo cambió
        if (payload.new.balance !== saldoAnterior) {
          playNotificationSound();
          alert(`¡Tu billetera se ha actualizado! Saldo actual: Bs. ${Number(payload.new.balance).toFixed(2)}`);
          if (viewDetail && viewDetail.classList.contains("active")) {
            updateSubscribeButton();
          }
        }
      }
    }
  )
  .subscribe((status, err) => {
    if (status === "SUBSCRIBED") {
      console.log("Conectado con éxito a Supabase Realtime");
    }
    if (status === "CHANNEL_ERROR") {
      console.error("Error en la conexión Realtime:", err);
    }
  });

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
    const matchesSport = currentSportFilter === "Todos" || item.sport.toLowerCase() === currentSportFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) || item.address.toLowerCase().includes(currentSearchQuery.toLowerCase());
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
// 11. DETALLE DEL PARTIDO & INSCRIPCIÓN CON BILLETERA
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

function updateSubscribeButton() {
  if (!selectedMatch) return;
  const isFull = selectedMatch.currentPlayers >= selectedMatch.maxPlayers;
  const userBalance = Number(currentProfile?.balance || 0);

  // Comprobar si ya está inscrito
  const alreadySubscribed = receipts.some(
    (r) => r.matchId === selectedMatch.id && r.userId === currentProfile?.id && r.status === "Aprobado"
  );

  if (alreadySubscribed) {
    btnSubscribe.textContent = "✓ Ya estás Inscrito";
    btnSubscribe.style.backgroundColor = "var(--success)";
    btnSubscribe.disabled = true;
    return;
  }

  if (isFull) {
    btnSubscribe.textContent = "Cupos Agotados";
    btnSubscribe.style.backgroundColor = "#43454d";
    btnSubscribe.disabled = true;
  } else {
    btnSubscribe.innerHTML = `Pagar con Saldo · Bs. ${selectedMatch.price.toFixed(2)} <span style="font-size:0.75rem; opacity:0.8;">(Tu saldo: Bs. ${userBalance.toFixed(2)})</span>`;
    btnSubscribe.style.backgroundColor = "var(--accent)";
    btnSubscribe.disabled = false;
  }
}

// ==========================================
// 12. FLUJO: INSCRIPCIÓN CON SALDO / ENVIAR A RECARGA
// ==========================================
if (btnSubscribe) {
  btnSubscribe.onclick = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    if (!currentProfile) {
      alert("Por favor inicia sesión para inscribirte.");
      switchScreen(viewRegister);
      return;
    }

    if (selectedMatch.currentPlayers >= selectedMatch.maxPlayers) {
      alert("Lo sentimos, este partido ya no tiene cupos disponibles.");
      return;
    }

    const price = Number(selectedMatch.price);
    const balance = Number(currentProfile.balance || 0);

    // 1. COMPROBAR SALDO SUFICIENTE
    if (balance < price) {
      const falta = (price - balance).toFixed(2);
      // Enviar automáticamente al modal de recarga
      openRechargeModal(`Saldo insuficiente para este partido (Te faltan Bs. ${falta}). Recarga saldo aquí para completar tu inscripción:`, Math.ceil(price - balance));
      return;
    }

    // 2. SALDO SUFICIENTE: DESCONTAR DE LA BILLETERA
    const confirmPay = confirm(`¿Deseas pagar Bs. ${price.toFixed(2)} con tu saldo disponible (Bs. ${balance.toFixed(2)}) para unirte al partido?`);
    if (!confirmPay) return;

    btnSubscribe.disabled = true;
    btnSubscribe.textContent = "Procesando inscripción...";

    try {
      const nuevoSaldo = balance - price;

      // Descontar saldo en profiles
      const { error: balanceErr } = await db
        .from("profiles")
        .update({ balance: nuevoSaldo })
        .eq("id", currentProfile.id);

      if (balanceErr) throw balanceErr;

      // Incrementar cupo en matches
      const { error: matchErr } = await db
        .from("matches")
        .update({ current_players: selectedMatch.currentPlayers + 1 })
        .eq("id", selectedMatch.id);

      if (matchErr) throw matchErr;

      // Guardar registro de inscripción aprobada
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      await db.from("receipts").insert([
        {
          type: "PARTIDO",
          match_id: selectedMatch.id,
          match_title: selectedMatch.title,
          sport: selectedMatch.sport,
          amount: price,
          date: timeStr,
          status: "Aprobado",
          user_id: currentProfile.id,
          username: currentProfile.username,
          avatar_url: currentProfile.avatar_url,
          receipt_image: "BILLETERA_SALDO"
        }
      ]);

      // Actualizar estado local
      currentProfile.balance = nuevoSaldo;
      selectedMatch.currentPlayers += 1;

      renderProfileView();
      renderMatches();
      renderConfirmedPlayers(selectedMatch.id);
      updateSubscribeButton();

      alert(`¡Inscripción exitosa!\nSe debitaron Bs. ${price.toFixed(2)} de tu billetera.\nNuevo saldo: Bs. ${nuevoSaldo.toFixed(2)}`);

    } catch (err) {
      console.error("Error en inscripción:", err);
      alert("Hubo un problema al procesar el pago: " + err.message);
      updateSubscribeButton();
    }
  };
}

// ==========================================
// 13. MODAL DE RECARGA DE SALDO (BILLETERA)
// ==========================================
function resetRechargeInputs() {
  currentRechargeBase64 = null;
  if (rechargeReceiptInput) rechargeReceiptInput.value = "";
  if (rechargeReceiptPreview) rechargeReceiptPreview.src = "";
  if (rechargePreviewWrapper) rechargePreviewWrapper.setAttribute("hidden", "");
  if (rechargeUploadText) rechargeUploadText.textContent = "Adjuntar captura de la recarga";
}

function openRechargeModal(customMessage = null, defaultAmount = 50) {
  if (!modalRecharge) return;
  resetRechargeInputs();

  if (rechargeAlertMsg) {
    rechargeAlertMsg.textContent = customMessage || "Transfiere desde tu banco mediante QR para abonar saldo a tu cuenta.";
  }

  if (inputRechargeAmount) {
    inputRechargeAmount.value = defaultAmount >= 10 ? defaultAmount : 20;
  }

  modalRecharge.removeAttribute("hidden");
  modalRecharge.style.display = "flex";
}

function closeRechargeModal() {
  if (modalRecharge) {
    modalRecharge.setAttribute("hidden", "");
    modalRecharge.style.display = "none";
  }
  resetRechargeInputs();
}

if (btnOpenDirectRecharge) {
  btnOpenDirectRecharge.addEventListener("click", () => {
    openRechargeModal("Recarga saldo a tu billetera para tener fondos listos para tus próximos partidos.", 50);
  });
}

if (btnCloseRechargeModal) btnCloseRechargeModal.addEventListener("click", closeRechargeModal);
if (btnCancelRecharge) btnCancelRecharge.addEventListener("click", closeRechargeModal);

if (rechargeReceiptInput) {
  rechargeReceiptInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("El comprobante debe pesar menos de 4 MB.");
      resetRechargeInputs();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      currentRechargeBase64 = event.target.result;
      rechargeReceiptPreview.src = currentRechargeBase64;
      rechargePreviewWrapper.removeAttribute("hidden");
      rechargeUploadText.textContent = "Comprobante cargado (Toca para cambiar)";
    };
    reader.readAsDataURL(file);
  });
}

if (btnRemoveRechargeReceipt) btnRemoveRechargeReceipt.addEventListener("click", resetRechargeInputs);

// Enviar solicitud de recarga al Organizador
if (btnConfirmRecharge) {
  btnConfirmRecharge.addEventListener("click", async () => {
    const rechargeAmount = parseFloat(inputRechargeAmount.value);

    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      alert("Por favor ingresa un monto válido a recargar.");
      return;
    }

    if (!currentRechargeBase64) {
      alert("Por favor adjunta la captura del pago de tu transferencia.");
      return;
    }

    btnConfirmRecharge.disabled = true;
    btnConfirmRecharge.textContent = "Enviando solicitud...";

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const { error } = await db.from("receipts").insert([
      {
        type: "RECARGA",
        recharge_amount: rechargeAmount,
        match_id: null,
        match_title: "Recarga de Billetera Móvil",
        sport: "Billetera",
        amount: rechargeAmount,
        date: timeStr,
        status: "Pendiente",
        receipt_image: currentRechargeBase64,
        user_id: currentProfile ? currentProfile.id : "user_anon",
        username: currentProfile ? currentProfile.username : "Jugador",
        avatar_url: currentProfile ? currentProfile.avatar_url : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
      }
    ]);

    btnConfirmRecharge.disabled = false;
    btnConfirmRecharge.textContent = "Solicitar Recarga de Saldo";

    if (error) {
      alert("Error al enviar la recarga: " + error.message);
      return;
    }

    closeRechargeModal();
    alert(`¡Solicitud de recarga enviada!\nEl organizador verificará tu comprobante de Bs. ${rechargeAmount.toFixed(2)} y acreditará los fondos a tu cuenta.`);
    fetchReceipts();
  });
}

// ==========================================
// 14. PANEL ORGANIZADOR (APROBAR RECARGAS Y PAGOS)
// ==========================================
function renderAdminPanel() {
  if (!adminReceiptsList) return;
  adminReceiptsList.innerHTML = "";

  const pendingCount = receipts.filter((r) => r.status === "Pendiente").length;
  adminPendingCount.textContent = pendingCount;

  if (receipts.length === 0) {
    adminReceiptsList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
        No hay solicitudes registradas aún.
      </div>`;
    return;
  }

  receipts.forEach((item) => {
    const card = document.createElement("div");
    card.className = "receipt-card";

    let statusClass = "status-pending";
    if (item.status === "Aprobado") statusClass = "status-approved";
    if (item.status === "Rechazado") statusClass = "status-rejected";

    const isRecharge = item.type === "RECARGA";

    card.innerHTML = `
      <div class="receipt-header">
        <div>
          <span class="receipt-match-title">${item.matchTitle}</span>
          ${isRecharge ? `<span style="background: rgba(52,199,89,0.15); color: var(--success); font-size: 0.65rem; font-weight:800; padding:2px 6px; border-radius:4px; margin-left:6px;">RECARGA SALDO</span>` : ""}
        </div>
        <span class="receipt-status-tag ${statusClass}">${item.status}</span>
      </div>

      <div class="receipt-body-layout">
        ${item.receiptImage === "BILLETERA_SALDO" ? `
          <div style="width:70px; height:70px; border-radius:10px; background:var(--bg-card-subtle); display:flex; align-items:center; justify-content:center; font-size:1.5rem;">💳</div>
        ` : `
          <img class="receipt-thumb-admin" src="${item.receiptImage}" alt="Comprobante" title="Toca para agrandar">
        `}
        <div class="receipt-info-text">
          <span><strong>Jugador:</strong> @${item.username}</span>
          <span><strong>Monto:</strong> Bs. ${Number(item.amount).toFixed(2)}</span>
          <span><strong>Hora:</strong> ${item.date}</span>
        </div>
      </div>

      ${item.status === "Pendiente" ? `
        <div class="receipt-actions">
          <button class="btn-approve" onclick="approveReceipt(${item.id})">✓ Aprobar Recarga</button>
          <button class="btn-reject" onclick="rejectReceipt(${item.id})">✕ Rechazar</button>
        </div>
      ` : ""}
    `;

    const thumb = card.querySelector(".receipt-thumb-admin");
    if (thumb) {
      thumb.addEventListener("click", () => openImageViewer(item.receiptImage));
    }

    adminReceiptsList.appendChild(card);
  });
}

window.approveReceipt = async function (receiptId) {
  const receipt = receipts.find((r) => r.id === receiptId);
  if (!receipt) return;

  // SI ES UNA RECARGA DE SALDO -> SUMAR AL BALANCE DEL JUGADOR
  if (receipt.type === "RECARGA") {
    const { data: prof, error: pErr } = await db
      .from("profiles")
      .select("balance")
      .eq("id", receipt.userId)
      .single();

    if (pErr) {
      alert("Error al cargar perfil del jugador: " + pErr.message);
      return;
    }

    const balanceActual = Number(prof.balance || 0);
    const nuevoBalance = balanceActual + Number(receipt.amount);

    const { error: upErr } = await db
      .from("profiles")
      .update({ balance: nuevoBalance })
      .eq("id", receipt.userId);

    if (upErr) {
      alert("Error al acreditar saldo: " + upErr.message);
      return;
    }

    await db.from("receipts").update({ status: "Aprobado" }).eq("id", receiptId);
    alert(`Recarga aprobada con éxito.\nSe abonaron Bs. ${Number(receipt.amount).toFixed(2)} al jugador @${receipt.username}.\nNuevo saldo del usuario: Bs. ${nuevoBalance.toFixed(2)}`);
    fetchReceipts();
    return;
  }

  // SI ES INSCRIPCIÓN DIRECTA (FALLBACK)
  await db.from("receipts").update({ status: "Aprobado" }).eq("id", receiptId);
  alert("Comprobante aprobado.");
  fetchReceipts();
};

window.rejectReceipt = async function (receiptId) {
  if (confirm("¿Estás seguro de rechazar este comprobante?")) {
    await db.from("receipts").update({ status: "Rechazado" }).eq("id", receiptId);
    fetchReceipts();
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

// ==========================================
// 15. DETALLE DE JUGADORES CONFIRMADOS
// ==========================================
function renderConfirmedPlayers(matchId) {
  if (!detailPlayersList || !selectedMatch) return;
  detailPlayersList.innerHTML = "";

  const approvedUsers = receipts.filter(
    (r) => r.matchId === matchId && r.status === "Aprobado" && r.type === "PARTIDO"
  );

  detailPlayersRatio.textContent = `${approvedUsers.length}-${selectedMatch.maxPlayers}`;

  if (approvedUsers.length === 0) {
    detailPlayersList.innerHTML = `
      <div style="color: var(--text-muted); font-size: 0.85rem; padding: 0.8rem 0;">
        Aún no hay jugadores confirmados. ¡Inscríbete con tu saldo disponible!
      </div>`;
    return;
  }

  approvedUsers.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card-item";
    card.innerHTML = `
      <div class="player-meta-wrap">
        <img class="player-thumb-avatar" src="${player.avatarUrl}" alt="${player.username}">
        <div class="player-names-col">
          <span class="player-name-val">${player.username}</span>
          <span class="player-role-tag">Jugador</span>
        </div>
      </div>
      <span class="player-chevron">›</span>
    `;
    detailPlayersList.appendChild(card);
  });
}

// ==========================================
// 16. PERFIL DEL JUGADOR
// ==========================================
function renderProfileView() {
  if (!currentProfile) return;

  const nameElem = document.getElementById("profile-name-display");
  if (nameElem) nameElem.textContent = `${currentProfile.first_name || ""} ${currentProfile.last_name || ""}`.trim() || currentProfile.username;

  const countElem = document.getElementById("profile-matches-count");
  if (countElem) countElem.textContent = currentProfile.matches_played || 0;

  const balanceElem = document.getElementById("profile-balance");
  if (balanceElem) balanceElem.textContent = Number(currentProfile.balance || 0).toFixed(2);

  const promoElem = document.getElementById("profile-promo");
  if (promoElem) promoElem.textContent = Number(currentProfile.promo_balance || 0).toFixed(2);

  const avatarElem = document.getElementById("profile-avatar-img");
  if (avatarElem && currentProfile.avatar_url) avatarElem.src = currentProfile.avatar_url;

  const fName = document.getElementById("field-firstname");
  if (fName) fName.textContent = currentProfile.first_name || "-";

  const fLast = document.getElementById("field-lastname");
  if (fLast) fLast.textContent = currentProfile.last_name || "-";

  const fPhone = document.getElementById("field-phone");
  if (fPhone) fPhone.textContent = currentProfile.phone || "-";

  const fBirth = document.getElementById("field-birth");
  if (fBirth) fBirth.textContent = currentProfile.birth_date || "-";

  const fSkill = document.getElementById("field-skill");
  if (fSkill) fSkill.textContent = currentProfile.skill_level || "-";

  const fNat = document.getElementById("field-nationality");
  if (fNat) fNat.textContent = currentProfile.nationality || "-";

  const fCity = document.getElementById("field-city");
  if (fCity) fCity.textContent = currentProfile.city || "-";

  const fEmail = document.getElementById("field-email");
  if (fEmail) fEmail.textContent = currentProfile.email || "-";

  const fPlan = document.getElementById("field-plan");
  if (fPlan) fPlan.textContent = currentProfile.plan || "FREE";

  const fUser = document.getElementById("field-username");
  if (fUser) fUser.textContent = currentProfile.username || "-";

  renderMyActiveMatches();
  
}

// ==========================================
// 17. CREAR PARTIDO (ORGANIZADOR)
// ==========================================
if (btnCreateMatchFab) {
  btnCreateMatchFab.addEventListener("click", () => {
    if (currentProfile?.role !== "ORGANIZADOR") {
      alert("Acceso denegado: solo el Organizador puede publicar canchas.");
      return;
    }
    fetchVenues();
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
    const selectedVenue = venuesList.find((v) => v.id == venueId);

    if (!selectedVenue) {
      alert("Por favor selecciona una cancha de la lista.");
      return;
    }

    const rawDate = document.getElementById("input-match-date").value;
    const timeFull = document.getElementById("input-match-time").value.trim();
    const price = parseFloat(document.getElementById("input-match-price").value);
    const maxPlayers = parseInt(document.getElementById("input-match-max").value);

    const [year, month, day] = rawDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateLong = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const dateGroup = `Fecha · ${dateLong.charAt(0).toUpperCase() + dateLong.slice(1)}`;

    const newMatchPayload = {
      title: selectedVenue.name,
      sport: selectedVenue.sport || "Fútbol",
      date_group: dateGroup,
      date_long: dateLong,
      time: timeFull.split("—")[0].split("-")[0].trim(),
      time_full: timeFull,
      price: price,
      current_players: 0,
      max_players: maxPlayers,
      address: selectedVenue.address,
      image: selectedVenue.image_url,
      organizer: currentProfile.username || "Organizador",
      is_confirmed: false,
      is_finished: false
    };

    const { error } = await db.from("matches").insert([newMatchPayload]);

    if (error) {
      alert("Error al publicar partido: " + error.message);
      return;
    }

    modalCreateMatch.setAttribute("hidden", "");
    modalCreateMatch.style.display = "none";
    formNewMatch.reset();
    alert("¡Partido habilitado con éxito!");
    fetchMatches();
  });
}

function renderMyActiveMatches() {
  const container = document.getElementById("list-upcoming-matches");
  if (!container || !currentProfile) return;

  // Filtrar los comprobantes/inscripciones aprobadas del usuario actual en partidos
  const myApprovedReceipts = receipts.filter(
    (r) => r.userId === currentProfile.id && r.status === "Aprobado" && r.type === "PARTIDO"
  );

  // Obtener los partidos activos que coincidan con esos comprobantes
  const myMatches = matches.filter((m) =>
    myApprovedReceipts.some((r) => r.matchId === m.id) && !m.isFinished
  );

  if (myMatches.length === 0) {
    container.innerHTML = `
      <div class="events-empty-box">
        <div class="empty-icon-sm">⚽</div>
        <p>No estás inscrito en ningún partido próximo</p>
      </div>`;
    return;
  }

  container.innerHTML = "";
  myMatches.forEach((match) => {
    const card = document.createElement("div");
    card.className = "user-event-card";
    card.onclick = () => showDetail(match.id); // Al tocar la tarjeta te lleva al detalle del partido

    card.innerHTML = `
      <img class="user-event-thumb" src="${match.image}" alt="${match.title}">
      <div class="user-event-info">
        <span class="user-event-title">${match.title}</span>
        <span class="user-event-meta">📅 ${match.dateLong}</span>
        <span class="user-event-meta">🕐 ${match.time} hs · ${match.sport}</span>
        <span class="user-event-status">✓ Inscrito</span>
      </div>
    `;
    container.appendChild(card);
  });
}



// ==========================================
// 18. NAVEGACIÓN ENTRE TABS
// ==========================================
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
  btnTabAbout.onclick = () => {
    btnTabEvents.classList.remove("active");
    btnTabAbout.classList.add("active");
    tabEventsContent.classList.remove("active");
    tabAboutContent.classList.add("active");
  };

  btnTabEvents.onclick = () => {
    btnTabAbout.classList.remove("active");
    btnTabEvents.classList.add("active");
    tabAboutContent.classList.remove("active");
    tabEventsContent.classList.add("active");
    if (typeof renderMyActiveMatches === "function") {
      renderMyActiveMatches();
    }
  };
}

// Filtros y Buscador
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