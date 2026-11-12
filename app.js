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
  if (btnInstall) {
    btnInstall.removeAttribute("hidden");
    btnInstall.style.display = "flex";
  }
});

if (btnInstall) {
  btnInstall.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      deferredPrompt = null;
      btnInstall.setAttribute("hidden", "");
      btnInstall.style.display = "none";
    }
  });
}

// ==========================================
// 3. ESTADOS GLOBALES
// ==========================================
let matches = [];
let receipts = [];
let venuesList = [];
let myInvitations = [];
let currentProfile = null;
let currentSportFilter = "Todos";
let currentSearchQuery = "";
let selectedMatch = null;
let currentRechargeBase64 = null;
let viewedPlayerProfile = null;

// ==========================================
// 4. REFERENCIAS DOM
// ==========================================
const viewRegister = document.getElementById("view-register");
const viewList = document.getElementById("view-list");
const viewDetail = document.getElementById("view-detail");
const viewPlayerPublic = document.getElementById("view-player-public");
const viewMessages = document.getElementById("view-messages");
const viewRules = document.getElementById("view-rules");
const viewRanking = document.getElementById("view-ranking");
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
const btnAddPlayer = document.getElementById("btn-add-player");

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

// Modal Invitar Jugador (Organizador)
const modalInvitePlayer = document.getElementById("modal-invite-player");
const btnCloseInviteModal = document.getElementById("btn-close-invite-modal");
const inputSearchPlayer = document.getElementById("input-search-player");
const searchPlayersResults = document.getElementById("search-players-results");

// Mensajes e Invitaciones
const messagesContainer = document.getElementById("messages-container");
const messagesEmptyState = document.getElementById("messages-empty-state");

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

// Elementos de Soporte y Chat
const btnRequestSupport = document.getElementById("btn-request-support");
const btnOrgNewChat = document.getElementById("btn-org-new-chat");
const supportThreadsList = document.getElementById("support-threads-list");
const modalChatRoom = document.getElementById("modal-chat-room");
const btnCloseChat = document.getElementById("btn-close-chat");
const chatRoomTitle = document.getElementById("chat-room-title");
const chatRoleIndicator = document.getElementById("chat-role-indicator");
const chatMessagesBox = document.getElementById("chat-messages-box");
const formSendChat = document.getElementById("form-send-chat");
const inputChatText = document.getElementById("input-chat-text");

const modalOrgChat = document.getElementById("modal-org-chat");
const btnCloseOrgChat = document.getElementById("btn-close-org-chat");
const inputSearchChatPlayer = document.getElementById("input-search-chat-player");
const searchChatPlayersResults = document.getElementById("search-chat-players-results");

let activeChatId = null;
let currentChatData = null;

// ==========================================
// 5. NAVEGACIÓN Y AISLAMIENTO DE PANTALLAS
// ==========================================
function switchScreen(targetScreen) {
  const allScreens = [
    viewRegister,
    viewList,
    viewDetail,
    viewPlayerPublic,
    viewMessages,
    viewRules,
    viewRanking,
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
      fetchInvitations();

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

// ==========================================
// MÓDULO DE RANKING (TOP 5 PARTIDOS Y GOLES)
// ==========================================
let currentRankingTab = "matches";

const btnRankingMatches = document.getElementById("btn-ranking-matches");
const btnRankingGoals = document.getElementById("btn-ranking-goals");
const rankingListContainer = document.getElementById("ranking-list-container");

async function fetchAndRenderRanking() {
  if (!rankingListContainer) return;
  rankingListContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:2rem;">Cargando posiciones...</p>`;

  const orderColumn = currentRankingTab === "matches" ? "matches_played" : "goals";

  const { data: topPlayers, error } = await db
    .from("profiles")
    .select("id, username, first_name, last_name, avatar_url, matches_played, goals")
    .order(orderColumn, { ascending: false })
    .limit(5);

  if (error || !topPlayers || topPlayers.length === 0) {
    rankingListContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:2rem;">Aún no hay suficientes registros para el ranking.</p>`;
    return;
  }

  rankingListContainer.innerHTML = "";

  topPlayers.forEach((player, index) => {
    const position = index + 1;
    let medalClass = "rank-other";
    let medalText = `#${position}`;

    if (position === 1) { medalClass = "rank-1"; medalText = "🥇"; }
    else if (position === 2) { medalClass = "rank-2"; medalText = "🥈"; }
    else if (position === 3) { medalClass = "rank-3"; medalText = "🥉"; }

    const statValue = currentRankingTab === "matches" 
      ? `${player.matches_played || 0} pj` 
      : `${player.goals || 0} goles`;

    const card = document.createElement("div");
    card.className = "ranking-card-item";
    card.innerHTML = `
      <div class="ranking-left-wrap">
        <div class="ranking-medal-box ${medalClass}">${medalText}</div>
        <img class="player-thumb-avatar" src="${player.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}" alt="${player.username}">
        <div class="player-names-col">
          <span class="player-name-val">@${player.username}</span>
          <span class="player-role-tag">${player.first_name || ""} ${player.last_name || ""}</span>
        </div>
      </div>
      <div class="ranking-value-tag">${statValue}</div>
    `;

    rankingListContainer.appendChild(card);
  });
}

// Alternar entre Partidos Jugados y Goleadores
if (btnRankingMatches && btnRankingGoals) {
  btnRankingMatches.addEventListener("click", () => {
    currentRankingTab = "matches";
    btnRankingGoals.classList.remove("active");
    btnRankingMatches.classList.add("active");
    fetchAndRenderRanking();
  });

  btnRankingGoals.addEventListener("click", () => {
    currentRankingTab = "goals";
    btnRankingMatches.classList.remove("active");
    btnRankingGoals.classList.add("active");
    fetchAndRenderRanking();
  });
}

// Evento al presionar la pestaña Ranking en el menú inferior
tabClubs.addEventListener("click", () => {
  clearTabSelection();
  tabClubs.classList.add("active");
  switchScreen(viewRanking);
  fetchAndRenderRanking();
});

// ==========================================
// CONTROL DE CAMBIO DE CONTRASEÑA (JUGADOR)
// ==========================================
const modalSecurity = document.getElementById("modal-security");
const btnOpenSecurityModal = document.getElementById("btn-open-security-modal");
const btnCancelSecurity = document.getElementById("btn-cancel-security");
const btnSaveSecurity = document.getElementById("btn-save-security");
const inputEditPassword = document.getElementById("input-edit-password");
const inputConfirmEditPassword = document.getElementById("input-confirm-edit-password");

window.openSecurityModal = function () {
  if (modalSecurity) {
    if (inputEditPassword) inputEditPassword.value = "";
    if (inputConfirmEditPassword) inputConfirmEditPassword.value = "";
    modalSecurity.removeAttribute("hidden");
    modalSecurity.style.display = "flex";
  }
};

if (btnOpenSecurityModal) {
  btnOpenSecurityModal.addEventListener("click", window.openSecurityModal);
}

if (btnCancelSecurity) {
  btnCancelSecurity.addEventListener("click", () => {
    if (modalSecurity) {
      modalSecurity.setAttribute("hidden", "");
      modalSecurity.style.display = "none";
    }
  });
}

if (btnSaveSecurity) {
  btnSaveSecurity.addEventListener("click", async () => {
    if (!currentProfile) return;

    const newPass = inputEditPassword ? inputEditPassword.value.trim() : "";
    const confirmPass = inputConfirmEditPassword ? inputConfirmEditPassword.value.trim() : "";

    if (!newPass) {
      alert("Por favor ingresa la nueva contraseña.");
      return;
    }

    if (newPass.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }

    btnSaveSecurity.disabled = true;
    btnSaveSecurity.textContent = "Actualizando...";

    const { error } = await db
      .from("profiles")
      .update({ password: newPass })
      .eq("id", currentProfile.id);

    btnSaveSecurity.disabled = false;
    btnSaveSecurity.textContent = "Guardar";

    if (error) {
      alert("Error al actualizar la contraseña: " + error.message);
      return;
    }

    currentProfile.password = newPass;
    alert("¡Contraseña actualizada con éxito!");

    if (modalSecurity) {
      modalSecurity.setAttribute("hidden", "");
      modalSecurity.style.display = "none";
    }
  });
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
    fetchInvitations();
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
    const email = document.getElementById("reg-email").value.trim();
    const username = document.getElementById("reg-username").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value.trim();
    const confirmPassword = document.getElementById("reg-confirm-password").value.trim();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }

    if (password.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    const newUserId = "user_" + Date.now();

    const newProfile = {
      id: newUserId,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      birth_date: birthDate,
      skill_level: "Principiante",
      city: "La Paz",
      nationality: "Bolivia",
      email: email,
      username: username,
      password: password,
      role: "JUGADOR",
      matches_played: 0,
      goals: 0,
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
    fetchInvitations();
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

  if (btnRequestSupport) btnRequestSupport.style.display = isOrganizer ? "none" : "flex";
  if (btnOrgNewChat) btnOrgNewChat.style.display = isOrganizer ? "flex" : "none";

  updatePendingBadge();
}

// Función para convertir fechas en español a timestamp numérico
function getMatchTimestamp(match) {
  const timeStr = (match.time || "00:00").split("-")[0].trim();
  let hh = 0, mm = 0;
  if (timeStr.includes(":")) {
    const parts = timeStr.split(":");
    hh = parseInt(parts[0], 10) || 0;
    mm = parseInt(parts[1], 10) || 0;
  } else if (!isNaN(parseInt(timeStr, 10))) {
    hh = parseInt(timeStr, 10);
  }

  const monthsMap = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
  };

  const textToParse = (match.date_long || match.date_group || "").toLowerCase().replace(/[,·]/g, " ");
  const tokens = textToParse.split(/\s+/);
  let day = null, month = null, year = 2026;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (monthsMap[t] !== undefined) {
      month = monthsMap[t];
      if (i > 0 && /^\d+$/.test(tokens[i - 1])) {
        day = parseInt(tokens[i - 1], 10);
      } else if (i > 1 && tokens[i - 1] === "de" && /^\d+$/.test(tokens[i - 2])) {
        day = parseInt(tokens[i - 2], 10);
      }
    }
    if (/^20\d\d$/.test(t)) {
      year = parseInt(t, 10);
    }
  }

  if (day !== null && month !== null) {
    return new Date(year, month, day, hh, mm).getTime();
  }
  return match.id || 0;
}

// Carga y ordenamiento cronológico: del más próximo al más lejano
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
    return getMatchTimestamp(a) - getMatchTimestamp(b);
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
    type: r.type || "PARTIDO",
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
    avatarUrl: r.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    attended: Boolean(r.attended),
    goalsScored: Number(r.goals_scored || 0)
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
// 9. REALTIME TOTAL (RECEIPTS, MATCHES, CHATS, MESSAGES)
// ==========================================
const realtimeChannel = db
  .channel("sports-pwa-realtime")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "receipts" },
    async () => {
      await fetchReceipts();
      if (viewAdmin && viewAdmin.classList.contains("active")) {
        renderAdminPanel();
      }
      if (selectedMatch) {
        renderConfirmedPlayers(selectedMatch.id);
        updateSubscribeButton();
      }
    }
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "matches" },
    async () => {
      await fetchMatches();
      if (selectedMatch) {
        const updated = matches.find((m) => m.id === selectedMatch.id);
        if (updated) {
          selectedMatch = updated;
          detailBadgeQuota.textContent = `${selectedMatch.currentPlayers}/${selectedMatch.maxPlayers} jugadores`;
          updateSubscribeButton();
        }
      }
    }
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "invitations" },
    () => {
      fetchInvitations();
    }
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "profiles" },
    (payload) => {
      if (currentProfile && payload.new && payload.new.id === currentProfile.id) {
        const saldoAnterior = currentProfile.balance;
        currentProfile = { ...currentProfile, ...payload.new };
        renderProfileView();

        if (payload.new.balance !== saldoAnterior) {
          alert(`¡Tu billetera se ha actualizado! Saldo actual: Bs. ${Number(payload.new.balance).toFixed(2)}`);
          if (viewDetail && viewDetail.classList.contains("active")) {
            updateSubscribeButton();
          }
        }
      }
    }
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "support_chats" },
    () => {
      if (typeof fetchSupportThreads === "function") {
        fetchSupportThreads();
      }
    }
  )
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "support_messages" },
    (payload) => {
      const newMsg = payload.new;
      if (!newMsg) return;

      if (activeChatId && Number(activeChatId) === Number(newMsg.chat_id)) {
        appendChatBubble(newMsg);
      }
      if (typeof fetchSupportThreads === "function") {
        fetchSupportThreads();
      }
    }
  )
  .subscribe((status, err) => {
    if (status === "SUBSCRIBED") {
      console.log("Conectado con éxito a Supabase Realtime");
    }
    if (status === "CHANNEL_ERROR") {
      console.error("Error en conexión Realtime:", err);
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#111111"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
              ${match.address.length > 34 ? match.address.substring(0, 34) + "..." : match.address}
            </div>
            <div class="match-sport">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#111111"><circle cx="12" cy="12" r="10"/></svg>
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
// MÓDULO DE CÓDIGOS DE SALDO (ORGANIZADOR Y CANJE)
// ==========================================
const btnRechargeToRedeem = document.getElementById("btn-recharge-to-redeem");
const modalRedeem = document.getElementById("modal-redeem");
const btnOpenRedeem = document.getElementById("btn-open-redeem");
const btnCancelRedeem = document.getElementById("btn-cancel-redeem");
const btnConfirmRedeem = document.getElementById("btn-confirm-redeem");
const inputPromoCode = document.getElementById("input-promo-code");

const btnOpenCreatePromo = document.getElementById("btn-open-create-promo");
const modalGeneratePromo = document.getElementById("modal-generate-promo");
const btnCloseGeneratePromo = document.getElementById("btn-close-generate-promo");
const formCreatePromo = document.getElementById("form-create-promo");
const inputPromoAmount = document.getElementById("input-promo-amount");
const inputCustomPromoCode = document.getElementById("input-custom-promo-code");
const promoGeneratedResult = document.getElementById("promo-generated-result");
const displayPromoCode = document.getElementById("display-promo-code");
const btnCopyPromoCode = document.getElementById("btn-copy-promo-code");

if (btnRechargeToRedeem) {
  btnRechargeToRedeem.addEventListener("click", () => {
    closeRechargeModal();
    if (modalRedeem) {
      if (inputPromoCode) inputPromoCode.value = "";
      modalRedeem.removeAttribute("hidden");
      modalRedeem.style.display = "flex";
    }
  });
}

if (btnOpenRedeem) {
  btnOpenRedeem.addEventListener("click", () => {
    if (modalRedeem) {
      if (inputPromoCode) inputPromoCode.value = "";
      modalRedeem.removeAttribute("hidden");
      modalRedeem.style.display = "flex";
    }
  });
}

if (btnCancelRedeem) {
  btnCancelRedeem.addEventListener("click", () => {
    if (modalRedeem) {
      modalRedeem.setAttribute("hidden", "");
      modalRedeem.style.display = "none";
    }
  });
}

if (btnConfirmRedeem) {
  btnConfirmRedeem.addEventListener("click", async () => {
    if (!currentProfile) {
      alert("Debes iniciar sesión para canjear un código.");
      return;
    }

    const code = (inputPromoCode.value || "").trim().toUpperCase();
    if (!code) {
      alert("Por favor escribe el código a canjear.");
      return;
    }

    btnConfirmRedeem.disabled = true;
    btnConfirmRedeem.textContent = "Validando...";

    try {
      const { data: promo, error: fetchErr } = await db
        .from("promo_codes")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!promo) {
        alert("El código ingresado no existe. Verifica e intenta nuevamente.");
        btnConfirmRedeem.disabled = false;
        btnConfirmRedeem.textContent = "Canjear";
        return;
      }

      if (promo.is_redeemed) {
        alert("Este código ya fue utilizado anteriormente y no es válido.");
        btnConfirmRedeem.disabled = false;
        btnConfirmRedeem.textContent = "Canjear";
        return;
      }

      const creditAmount = Number(promo.amount);
      const balanceActual = Number(currentProfile.balance || 0);
      const nuevoBalance = balanceActual + creditAmount;

      const { error: promoUpdateErr } = await db
        .from("promo_codes")
        .update({
          is_redeemed: true,
          redeemed_by: currentProfile.id,
          redeemed_username: currentProfile.username,
          redeemed_at: new Date().toISOString()
        })
        .eq("id", promo.id);

      if (promoUpdateErr) throw promoUpdateErr;

      const { error: profUpdateErr } = await db
        .from("profiles")
        .update({ balance: nuevoBalance })
        .eq("id", currentProfile.id);

      if (profUpdateErr) throw profUpdateErr;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      await db.from("receipts").insert([{
        type: "RECARGA",
        recharge_amount: creditAmount,
        match_id: null,
        match_title: `Canje de Código: ${code}`,
        sport: "Billetera",
        amount: creditAmount,
        date: timeStr,
        status: "Aprobado",
        receipt_image: "CODIGO_PROMO",
        user_id: currentProfile.id,
        username: currentProfile.username,
        avatar_url: currentProfile.avatar_url
      }]);

      currentProfile.balance = nuevoBalance;
      renderProfileView();

      btnConfirmRedeem.disabled = false;
      btnConfirmRedeem.textContent = "Canjear";

      if (modalRedeem) {
        modalRedeem.setAttribute("hidden", "");
        modalRedeem.style.display = "none";
      }

      alert(`¡Canje exitoso! 🎉\nSe agregaron Bs. ${creditAmount.toFixed(2)} a tu saldo principal.\nNuevo saldo: Bs. ${nuevoBalance.toFixed(2)}`);

    } catch (err) {
      console.error("Error al canjear código:", err);
      alert("Hubo un error al procesar el código: " + err.message);
      btnConfirmRedeem.disabled = false;
      btnConfirmRedeem.textContent = "Canjear";
    }
  });
}

if (btnOpenCreatePromo) {
  btnOpenCreatePromo.addEventListener("click", () => {
    if (modalGeneratePromo) {
      if (promoGeneratedResult) promoGeneratedResult.style.display = "none";
      if (formCreatePromo) formCreatePromo.reset();
      modalGeneratePromo.removeAttribute("hidden");
      modalGeneratePromo.style.display = "flex";
    }
  });
}

if (btnCloseGeneratePromo) {
  btnCloseGeneratePromo.addEventListener("click", () => {
    if (modalGeneratePromo) {
      modalGeneratePromo.setAttribute("hidden", "");
      modalGeneratePromo.style.display = "none";
    }
  });
}

if (formCreatePromo) {
  formCreatePromo.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentProfile || currentProfile.role !== "ORGANIZADOR") {
      alert("Solo organizadores pueden generar códigos.");
      return;
    }

    const amount = parseFloat(inputPromoAmount.value);
    if (isNaN(amount) || amount <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }

    let code = (inputCustomPromoCode.value || "").trim().toUpperCase();
    if (!code) {
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      code = `GOL-${randomStr}`;
    }

    const submitBtn = formCreatePromo.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Generando...";

    const { error } = await db.from("promo_codes").insert([{
      code: code,
      amount: amount,
      is_redeemed: false,
      created_by: currentProfile.id
    }]);

    submitBtn.disabled = false;
    submitBtn.textContent = "Crear Código Único";

    if (error) {
      if (error.code === "23505") {
        alert("Ese código ya existe. Escribe uno diferente o déjalo vacío.");
      } else {
        alert("Error al crear código: " + error.message);
      }
      return;
    }

    if (displayPromoCode && promoGeneratedResult) {
      displayPromoCode.textContent = code;
      promoGeneratedResult.style.display = "flex";
    }
  });
}

if (btnCopyPromoCode) {
  btnCopyPromoCode.addEventListener("click", () => {
    const code = displayPromoCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
      btnCopyPromoCode.textContent = "¡Copiado!";
      setTimeout(() => {
        btnCopyPromoCode.textContent = "Copiar";
      }, 2000);
    });
  });
}

// ==========================================
// AÑADIR AMIGO CON DESCUENTO DE SALDO (JUGADOR)
// ==========================================
const btnAddFriend = document.getElementById("btn-add-friend");
const modalAddFriend = document.getElementById("modal-add-friend");
const btnCloseFriendModal = document.getElementById("btn-close-friend-modal");
const inputSearchFriend = document.getElementById("input-search-friend");
const searchFriendsResults = document.getElementById("search-friends-results");
const friendModalDesc = document.getElementById("friend-modal-desc");

if (btnAddFriend) {
  btnAddFriend.addEventListener("click", () => {
    if (!selectedMatch) return;
    if (!currentProfile) {
      alert("Por favor inicia sesión para inscribir a un amigo.");
      switchScreen(viewRegister);
      return;
    }

    if (selectedMatch.currentPlayers >= selectedMatch.maxPlayers) {
      alert("Este partido ya no tiene cupos disponibles.");
      return;
    }

    if (friendModalDesc) {
      friendModalDesc.innerHTML = `Busca a tu amigo por su username. Se debitarán <strong>Bs. ${selectedMatch.price.toFixed(2)}</strong> de tu saldo (Tu saldo: Bs. ${Number(currentProfile.balance || 0).toFixed(2)}).`;
    }

    if (inputSearchFriend) inputSearchFriend.value = "";
    if (searchFriendsResults) {
      searchFriendsResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">Escribe el username del jugador...</p>`;
    }

    if (modalAddFriend) {
      modalAddFriend.removeAttribute("hidden");
      modalAddFriend.style.display = "flex";
    }
  });
}

if (btnCloseFriendModal) {
  btnCloseFriendModal.addEventListener("click", () => {
    if (modalAddFriend) {
      modalAddFriend.setAttribute("hidden", "");
      modalAddFriend.style.display = "none";
    }
  });
}

if (inputSearchFriend) {
  inputSearchFriend.addEventListener("input", async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) {
      searchFriendsResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">Ingresa al menos 2 caracteres...</p>`;
      return;
    }

    const { data: users, error } = await db
      .from("profiles")
      .select("id, username, first_name, last_name, avatar_url")
      .ilike("username", `%${query}%`)
      .limit(8);

    if (error || !users || users.length === 0) {
      searchFriendsResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">No se encontraron jugadores.</p>`;
      return;
    }

    const enrolledUserIds = receipts
      .filter((r) => r.matchId === selectedMatch.id && r.status === "Aprobado")
      .map((r) => r.userId);

    const availableUsers = users.filter((u) => u.id !== currentProfile.id && !enrolledUserIds.includes(u.id));

    if (availableUsers.length === 0) {
      searchFriendsResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">El jugador ya está inscrito en este partido.</p>`;
      return;
    }

    searchFriendsResults.innerHTML = "";
    availableUsers.forEach((user) => {
      const card = document.createElement("div");
      card.className = "player-card-item";
      card.innerHTML = `
        <div class="player-meta-wrap">
          <img class="player-thumb-avatar" src="${user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}" alt="${user.username}">
          <div class="player-names-col">
            <span class="player-name-val">@${user.username}</span>
            <span class="player-role-tag">${user.first_name || ""} ${user.last_name || ""}</span>
          </div>
        </div>
        <button class="btn-send-invitation" style="background-color: var(--accent);">Pagar e Inscribir</button>
      `;

      card.querySelector("button").onclick = () => {
        registerFriendWithBalance(user);
      };

      searchFriendsResults.appendChild(card);
    });
  });
}

async function registerFriendWithBalance(friendUser) {
  if (!selectedMatch || !currentProfile) return;

  if (selectedMatch.currentPlayers >= selectedMatch.maxPlayers) {
    alert("Lo sentimos, este partido ya no tiene cupos disponibles.");
    return;
  }

  const price = Number(selectedMatch.price);
  const balance = Number(currentProfile.balance || 0);

  if (balance < price) {
    const falta = (price - balance).toFixed(2);
    if (modalAddFriend) {
      modalAddFriend.setAttribute("hidden", "");
      modalAddFriend.style.display = "none";
    }
    openRechargeModal(
      `Saldo insuficiente para inscribir a tu amigo (Te faltan Bs. ${falta}). Recarga aquí:`,
      Math.ceil(price - balance)
    );
    return;
  }

  const confirmPay = confirm(
    `¿Deseas pagar Bs. ${price.toFixed(2)} con tu saldo para inscribir a @${friendUser.username} en "${selectedMatch.title}"?\n\nTu saldo restante será: Bs. ${(balance - price).toFixed(2)}`
  );
  if (!confirmPay) return;

  try {
    const nuevoSaldo = balance - price;

    const { error: balErr } = await db
      .from("profiles")
      .update({ balance: nuevoSaldo })
      .eq("id", currentProfile.id);

    if (balErr) throw balErr;

    const { error: matchErr } = await db
      .from("matches")
      .update({ current_players: selectedMatch.currentPlayers + 1 })
      .eq("id", selectedMatch.id);

    if (matchErr) throw matchErr;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    await db.from("receipts").insert([{
      type: "PARTIDO",
      match_id: selectedMatch.id,
      match_title: selectedMatch.title,
      sport: selectedMatch.sport,
      amount: price,
      date: timeStr,
      status: "Aprobado",
      user_id: friendUser.id,
      username: friendUser.username,
      avatar_url: friendUser.avatar_url,
      receipt_image: `PAGADO_POR_@${currentProfile.username}`
    }]);

    await db.from("match_registrations").insert([{
      match_id: selectedMatch.id,
      user_id: friendUser.id
    }]);

    currentProfile.balance = nuevoSaldo;
    selectedMatch.currentPlayers += 1;

    if (modalAddFriend) {
      modalAddFriend.setAttribute("hidden", "");
      modalAddFriend.style.display = "none";
    }

    renderProfileView();
    renderMatches();
    renderConfirmedPlayers(selectedMatch.id);
    updateSubscribeButton();

    alert(`¡Inscripción exitosa!\nHas anotado a @${friendUser.username}. Se debitaron Bs. ${price.toFixed(2)} de tu billetera.\nTu nuevo saldo: Bs. ${nuevoSaldo.toFixed(2)}`);

  } catch (err) {
    console.error("Error al inscribir amigo:", err);
    alert("Hubo un problema al procesar la inscripción: " + err.message);
  }
}

// ==========================================
// 11. DETALLE DEL PARTIDO & ACCIONES
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

  const userRole = (currentProfile?.role || "").toUpperCase().trim();
  const isOrganizer = userRole === "ORGANIZADOR";

  // Cargar información del Organizador del partido
  const orgNameEl = document.getElementById("detail-org-name");
  const orgAvatarEl = document.getElementById("detail-org-avatar");
  if (orgNameEl) orgNameEl.textContent = selectedMatch.organizer || "Organizador";

  db.from("profiles")
    .select("username, first_name, last_name, avatar_url")
    .eq("username", selectedMatch.organizer)
    .maybeSingle()
    .then(({ data: orgProf }) => {
      if (orgProf && orgNameEl) {
        orgNameEl.textContent = `${orgProf.first_name || ""} ${orgProf.last_name || ""}`.trim() || orgProf.username;
      }
      if (orgProf && orgProf.avatar_url && orgAvatarEl) {
        orgAvatarEl.src = orgProf.avatar_url;
      }
    });

  // Mostrar barra de asistencia/goles solo al organizador
  const statsBar = document.getElementById("organizer-match-stats-bar");
  if (statsBar) {
    statsBar.style.display = isOrganizer ? "flex" : "none";
  }

  if (organizerConfirmBox && toggleMatchConfirmed) {
    if (isOrganizer) {
      organizerConfirmBox.removeAttribute("hidden");
      organizerConfirmBox.style.setProperty("display", "flex", "important");
      toggleMatchConfirmed.disabled = false;
      toggleMatchConfirmed.checked = Boolean(selectedMatch.isConfirmed);
    } else {
      organizerConfirmBox.setAttribute("hidden", "");
      organizerConfirmBox.style.setProperty("display", "none", "important");
      toggleMatchConfirmed.disabled = true;
    }
  }

  if (organizerFinishBox) {
    if (isOrganizer) {
      organizerFinishBox.removeAttribute("hidden");
      organizerFinishBox.style.setProperty("display", "block", "important");
    } else {
      organizerFinishBox.setAttribute("hidden", "");
      organizerFinishBox.style.setProperty("display", "none", "important");
    }
  }

  renderConfirmedPlayers(selectedMatch.id);
  updateSubscribeButton();
  switchScreen(viewDetail);
}

if (toggleMatchConfirmed) {
  toggleMatchConfirmed.onchange = async (e) => {
    const userRole = (currentProfile?.role || "").toUpperCase().trim();
    if (!selectedMatch || userRole !== "ORGANIZADOR") {
      alert("Acceso denegado: solo el Organizador puede modificar el estado.");
      e.target.checked = !e.target.checked;
      return;
    }

    const newConfirmedValue = e.target.checked;
    selectedMatch.isConfirmed = newConfirmedValue;

    const { error } = await db
      .from("matches")
      .update({ is_confirmed: newConfirmedValue })
      .eq("id", selectedMatch.id);

    if (error) {
      alert("Error al actualizar estado en Supabase: " + error.message);
      selectedMatch.isConfirmed = !newConfirmedValue;
      toggleMatchConfirmed.checked = !newConfirmedValue;
      return;
    }

    renderMatches();
  };
}

if (btnFinishMatch) {
  btnFinishMatch.onclick = async () => {
    const userRole = (currentProfile?.role || "").toUpperCase().trim();
    if (!selectedMatch || userRole !== "ORGANIZADOR") {
      alert("Acceso denegado: solo el Organizador puede finalizar partidos.");
      return;
    }

    const seguro = confirm(`¿Estás seguro de finalizar y retirar el partido en "${selectedMatch.title}"?`);
    if (!seguro) return;

    btnFinishMatch.disabled = true;
    btnFinishMatch.textContent = "Finalizando encuentro...";

    const { error } = await db
      .from("matches")
      .update({ is_finished: true })
      .eq("id", selectedMatch.id);

    btnFinishMatch.disabled = false;
    btnFinishMatch.innerHTML = "🏁 Finalizar y Quitar Partido";

    if (error) {
      alert("Error al dar de baja el partido: " + error.message);
      return;
    }

    alert("El partido ha finalizado y ha sido retirado de la cartelera.");
    switchScreen(viewList);
    fetchMatches();
  };
}

function updateSubscribeButton() {
  if (!selectedMatch) return;

  const btnSub = document.getElementById("btn-subscribe");
  const btnAddFriend = document.getElementById("btn-add-friend");
  const playerActionGroup = document.getElementById("player-action-group");
  const btnAdd = document.getElementById("btn-add-player");

  const userRole = (currentProfile?.role || "").toUpperCase().trim();
  const isOrganizer = userRole === "ORGANIZADOR";

  if (isOrganizer) {
    if (playerActionGroup) playerActionGroup.style.display = "none";
    if (btnAdd) {
      btnAdd.removeAttribute("hidden");
      btnAdd.style.setProperty("display", "block", "important");
      const isFull = selectedMatch.currentPlayers >= selectedMatch.maxPlayers;
      btnAdd.disabled = isFull;
      btnAdd.textContent = isFull ? "Cupos Agotados" : "+ Añadir Jugador";
    }
    return;
  }

  if (btnAdd) {
    btnAdd.setAttribute("hidden", "");
    btnAdd.style.setProperty("display", "none", "important");
  }

  if (playerActionGroup) playerActionGroup.style.display = "flex";

  const isFull = selectedMatch.currentPlayers >= selectedMatch.maxPlayers;

  if (btnAddFriend) {
    btnAddFriend.disabled = isFull;
    btnAddFriend.title = `Inscribir amigo (Bs. ${selectedMatch.price.toFixed(2)})`;
    btnAddFriend.innerHTML = `+ Amigo <span style="font-size:0.75rem; opacity:0.85;">(Bs. ${selectedMatch.price.toFixed(0)})</span>`;
  }

  if (btnSub) {
    const alreadySubscribed = receipts.some(
      (r) => r.matchId === selectedMatch.id && r.userId === currentProfile?.id && r.status === "Aprobado"
    );

    if (alreadySubscribed) {
      btnSub.textContent = "✓ Ya estás Inscrito";
      btnSub.style.backgroundColor = "var(--success)";
      btnSub.disabled = true;
    } else if (isFull) {
      btnSub.textContent = "Cupos Agotados";
      btnSub.style.backgroundColor = "#9ca3af";
      btnSub.disabled = true;
    } else {
      btnSub.innerHTML = `Inscribirme · Bs. ${selectedMatch.price.toFixed(2)}`;
      btnSub.style.backgroundColor = "var(--accent)";
      btnSub.disabled = false;
    }
  }
}

// ==========================================
// 12. INSCRIPCIÓN CON SALDO (JUGADOR)
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

    if (balance < price) {
      const falta = (price - balance).toFixed(2);
      openRechargeModal(`Saldo insuficiente para este partido (Te faltan Bs. ${falta}). Recarga saldo aquí para completar tu inscripción:`, Math.ceil(price - balance));
      return;
    }

    const confirmPay = confirm(`¿Deseas pagar Bs. ${price.toFixed(2)} con tu saldo disponible (Bs. ${balance.toFixed(2)}) para unirte al partido?`);
    if (!confirmPay) return;

    btnSubscribe.disabled = true;
    btnSubscribe.textContent = "Procesando inscripción...";

    try {
      const nuevoSaldo = balance - price;

      const { error: balanceErr } = await db
        .from("profiles")
        .update({ balance: nuevoSaldo })
        .eq("id", currentProfile.id);

      if (balanceErr) throw balanceErr;

      const { error: matchErr } = await db
        .from("matches")
        .update({ current_players: selectedMatch.currentPlayers + 1 })
        .eq("id", selectedMatch.id);

      if (matchErr) throw matchErr;

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

      await db.from("match_registrations").insert([
        {
          match_id: selectedMatch.id,
          user_id: currentProfile.id
        }
      ]);

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
// 13. MODAL Y BÚSQUEDA: AÑADIR JUGADOR (ORGANIZADOR)
// ==========================================
if (btnAddPlayer) {
  btnAddPlayer.addEventListener("click", () => {
    if (!selectedMatch) return;
    if (inputSearchPlayer) inputSearchPlayer.value = "";
    if (searchPlayersResults) {
      searchPlayersResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">Escribe el username del jugador para invitarlo.</p>`;
    }
    if (modalInvitePlayer) {
      modalInvitePlayer.removeAttribute("hidden");
      modalInvitePlayer.style.display = "flex";
    }
  });
}

if (btnCloseInviteModal) {
  btnCloseInviteModal.addEventListener("click", () => {
    if (modalInvitePlayer) {
      modalInvitePlayer.setAttribute("hidden", "");
      modalInvitePlayer.style.display = "none";
    }
  });
}

if (inputSearchPlayer) {
  inputSearchPlayer.addEventListener("input", async (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (query.length < 2) {
      searchPlayersResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">Ingresa al menos 2 caracteres...</p>`;
      return;
    }

    const { data: users, error } = await db
      .from("profiles")
      .select("id, username, first_name, last_name, avatar_url, role")
      .ilike("username", `%${query}%`)
      .limit(8);

    if (error || !users || users.length === 0) {
      searchPlayersResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">No se encontraron jugadores.</p>`;
      return;
    }

    const enrolledUserIds = receipts
      .filter((r) => r.matchId === selectedMatch.id && r.status === "Aprobado")
      .map((r) => r.userId);

    const availableUsers = users.filter((u) => !enrolledUserIds.includes(u.id));

    if (availableUsers.length === 0) {
      searchPlayersResults.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:1.2rem;">Los jugadores encontrados ya están inscritos en este partido.</p>`;
      return;
    }

    searchPlayersResults.innerHTML = "";
    availableUsers.forEach((user) => {
      const card = document.createElement("div");
      card.className = "player-card-item";
      card.innerHTML = `
        <div class="player-meta-wrap">
          <img class="player-thumb-avatar" src="${user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}" alt="${user.username}">
          <div class="player-names-col">
            <span class="player-name-val">@${user.username}</span>
            <span class="player-role-tag">${user.first_name || ""} ${user.last_name || ""}</span>
          </div>
        </div>
        <button class="btn-send-invitation" data-id="${user.id}" data-user="${user.username}">Invitar</button>
      `;

      card.querySelector(".btn-send-invitation").onclick = function () {
        const uId = this.getAttribute("data-id");
        const uName = this.getAttribute("data-user");
        sendInvitation(uId, uName);
      };

      searchPlayersResults.appendChild(card);
    });
  });
}

window.sendInvitation = async function (playerId, playerUsername) {
  if (!selectedMatch) return;

  const targetUsername = String(playerUsername || "").trim();
  if (!targetUsername) {
    alert("Error: No se pudo identificar el nombre de usuario del jugador.");
    return;
  }

  const senderUsername = currentProfile?.username || "osman_m";

  const payload = {
    match_id: selectedMatch.id,
    match_title: selectedMatch.title,
    sport: selectedMatch.sport || "Fútbol",
    from_username: senderUsername,
    organizer_username: senderUsername,
    to_username: targetUsername,
    player_username: targetUsername,
    player_id: playerId,
    status: "Pendiente"
  };

  const { error } = await db.from("invitations").insert([payload]);

  if (error) {
    alert("Error al enviar invitación: " + error.message);
    return;
  }

  alert(`¡Invitación enviada con éxito a @${targetUsername}!\nLe aparecerá en su pestaña de Mensajes.`);
  if (modalInvitePlayer) {
    modalInvitePlayer.setAttribute("hidden", "");
    modalInvitePlayer.style.display = "none";
  }
};

// ==========================================
// 14. BANDEJA DE MENSAJES E INVITACIONES (JUGADOR)
// ==========================================
async function fetchInvitations() {
  if (!currentProfile) return;

  const { data, error } = await db
    .from("invitations")
    .select("*")
    .or(`to_username.eq.${currentProfile.username},player_username.eq.${currentProfile.username},player_id.eq.${currentProfile.id}`)
    .order("id", { ascending: false });

  if (!error) {
    myInvitations = data || [];
    renderInvitations();
  }
}

function renderInvitations() {
  if (!messagesContainer || !messagesEmptyState) return;

  const pending = myInvitations.filter((inv) => inv.status === "Pendiente");

  if (pending.length === 0) {
    messagesContainer.innerHTML = "";
    messagesEmptyState.removeAttribute("hidden");
    messagesEmptyState.style.display = "flex";
    return;
  }

  messagesEmptyState.setAttribute("hidden", "");
  messagesEmptyState.style.display = "none";
  messagesContainer.innerHTML = "";

  pending.forEach((inv) => {
    const sender = inv.from_username || inv.organizer_username || "Organizador";
    const title = inv.match_title || "Partido";
    const sport = inv.sport || "Deporte";

    const card = document.createElement("div");
    card.className = "invitation-card";
    card.innerHTML = `
      <div class="invitation-card-header">
        <span class="invitation-title">⚽ ${title}</span>
        <span class="invitation-badge-tag">INVITACIÓN</span>
      </div>
      <p class="invitation-desc">
        El organizador <strong>@${sender}</strong> te invitó a unirte a este partido de <strong>${sport}</strong> sin ningún costo de inscripción.
      </p>
      <div class="invitation-actions">
        <button class="btn-inv-accept" onclick="respondInvitation(${inv.id}, true)">✓ Aceptar</button>
        <button class="btn-inv-reject" onclick="respondInvitation(${inv.id}, false)">✕ Rechazar</button>
      </div>
    `;
    messagesContainer.appendChild(card);
  });
}

window.respondInvitation = async function (invitationId, accept) {
  const inv = myInvitations.find((i) => i.id === invitationId);
  if (!inv) return;

  if (!accept) {
    await db.from("invitations").update({ status: "Rechazada" }).eq("id", invitationId);
    await fetchInvitations();
    return;
  }

  const { data: match, error: mErr } = await db
    .from("matches")
    .select("*")
    .eq("id", inv.match_id)
    .single();

  if (mErr || !match) {
    alert("El partido ya no se encuentra disponible.");
    return;
  }

  if (match.current_players >= match.max_players) {
    alert("Lo sentimos, este partido ya completó sus cupos.");
    await db.from("invitations").update({ status: "Rechazada" }).eq("id", invitationId);
    fetchInvitations();
    return;
  }

  await db.from("invitations").update({ status: "Aceptada" }).eq("id", invitationId);

  await db
    .from("matches")
    .update({ current_players: match.current_players + 1 })
    .eq("id", match.id);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  await db.from("receipts").insert([
    {
      type: "PARTIDO",
      match_id: match.id,
      match_title: match.title,
      sport: match.sport,
      amount: 0,
      date: timeStr,
      status: "Aprobado",
      user_id: currentProfile.id,
      username: currentProfile.username,
      avatar_url: currentProfile.avatar_url,
      receipt_image: "INVITACION_ORGANIZADOR"
    }
  ]);

  await db.from("match_registrations").insert([
    {
      match_id: match.id,
      user_id: currentProfile.id
    }
  ]);

  alert(`¡Te has unido con éxito al partido en ${match.title}! Ya estás en la lista sin costo alguno.`);
  await fetchInvitations();
  await fetchMatches();
  renderProfileView();
};

// ==========================================
// 15. MODAL DE RECARGA DE SALDO (BILLETERA)
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
// 16. PANEL ORGANIZADOR (APROBAR RECARGAS Y PAGOS)
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
          ${isRecharge ? `<span style="background: rgba(22, 163, 74, 0.15); color: var(--success); font-size: 0.65rem; font-weight:800; padding:2px 6px; border-radius:4px; margin-left:6px;">RECARGA SALDO</span>` : ""}
        </div>
        <span class="receipt-status-tag ${statusClass}">${item.status}</span>
      </div>

      <div class="receipt-body-layout">
        ${item.receiptImage === "BILLETERA_SALDO" || item.receiptImage === "INVITACION_ORGANIZADOR" || item.receiptImage === "CODIGO_PROMO" ? `
          <div style="width:70px; height:70px; border-radius:10px; background:var(--bg-card-subtle); display:flex; align-items:center; justify-content:center; font-size:1.5rem;">
            ${item.receiptImage === "INVITACION_ORGANIZADOR" ? "🎟️" : item.receiptImage === "CODIGO_PROMO" ? "🎁" : "💳"}
          </div>
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
// 17. DETALLE DE JUGADORES, CHECKLIST Y GOLES
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

  const isOrganizer = (currentProfile?.role || "").toUpperCase().trim() === "ORGANIZADOR";

  approvedUsers.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card-item";
    card.style.cursor = isOrganizer ? "pointer" : "default";

    if (isOrganizer) {
      card.innerHTML = `
        <div class="player-meta-wrap" onclick="openPlayerPublicProfile('${player.userId}')" style="flex:1;">
          <img class="player-thumb-avatar" src="${player.avatarUrl}" alt="${player.username}">
          <div class="player-names-col">
            <span class="player-name-val">${player.username}</span>
            <span class="player-role-tag">Jugador · Toca para ficha</span>
          </div>
        </div>
        <div class="org-player-controls" onclick="event.stopPropagation()">
          <label class="attendance-check-label" title="Asistencia al partido">
            <input type="checkbox" class="chk-player-attended" data-receipt-id="${player.id}" data-user-id="${player.userId}" ${player.attended ? "checked" : ""}>
            <span>Asistió</span>
          </label>
          <div class="goals-counter-box" title="Goles anotados">
            <button type="button" class="btn-goal-step" onclick="stepPlayerGoal(${player.id}, -1)">-</button>
            <span class="goal-count-num" id="goal-val-${player.id}">${player.goalsScored || 0}</span>
            <button type="button" class="btn-goal-step" onclick="stepPlayerGoal(${player.id}, 1)">+</button>
            <span style="font-size:0.75rem;">⚽</span>
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="player-meta-wrap">
          <img class="player-thumb-avatar" src="${player.avatarUrl}" alt="${player.username}">
          <div class="player-names-col">
            <span class="player-name-val">${player.username}</span>
            <span class="player-role-tag">Jugador</span>
          </div>
        </div>
        <span style="color: var(--accent); font-size: 1.2rem; font-weight: 700;">›</span>
      `;
    }

    detailPlayersList.appendChild(card);
  });
}

// Sumar o restar goles localmente antes de guardar
window.stepPlayerGoal = function (receiptId, delta) {
  const rec = receipts.find((r) => r.id === receiptId);
  if (!rec) return;
  const currentGoals = Number(rec.goalsScored || 0);
  const nextGoals = Math.max(0, currentGoals + delta);
  rec.goalsScored = nextGoals;

  const span = document.getElementById(`goal-val-${receiptId}`);
  if (span) span.textContent = nextGoals;
};

// Guardar asistencia y goles en Supabase y actualizar el Ranking
const btnSaveMatchStats = document.getElementById("btn-save-match-stats");
if (btnSaveMatchStats) {
  btnSaveMatchStats.addEventListener("click", async () => {
    if (!selectedMatch || currentProfile?.role !== "ORGANIZADOR") return;

    btnSaveMatchStats.disabled = true;
    btnSaveMatchStats.textContent = "Guardando...";

    try {
      const checkboxes = document.querySelectorAll(".chk-player-attended");

      for (const chk of checkboxes) {
        const receiptId = Number(chk.getAttribute("data-receipt-id"));
        const userId = chk.getAttribute("data-user-id");
        const isChecked = chk.checked;
        const rec = receipts.find((r) => r.id === receiptId);
        if (!rec) continue;

        const newGoals = Number(rec.goalsScored || 0);

        await db
          .from("receipts")
          .update({ attended: isChecked, goals_scored: newGoals })
          .eq("id", receiptId);

        const { data: userReceipts } = await db
          .from("receipts")
          .select("attended, goals_scored")
          .eq("user_id", userId)
          .eq("type", "PARTIDO")
          .eq("status", "Aprobado");

        const totalPlayed = (userReceipts || []).filter((r) => r.attended).length;
        const totalGoals = (userReceipts || []).reduce((acc, r) => acc + Number(r.goals_scored || 0), 0);

        await db
          .from("profiles")
          .update({ matches_played: totalPlayed, goals: totalGoals })
          .eq("id", userId);
      }

      await fetchReceipts();
      alert("¡Asistencia y goles guardados con éxito! El Ranking Top 5 ha sido actualizado.");
    } catch (err) {
      console.error("Error guardando stats:", err);
      alert("Error al guardar estadísticas: " + err.message);
    } finally {
      btnSaveMatchStats.disabled = false;
      btnSaveMatchStats.textContent = "💾 Guardar Stats";
    }
  });
}

// ==========================================
// PERFIL RESUMIDO DEL JUGADOR Y CHAT DIRECTO
// ==========================================
window.openPlayerPublicProfile = async function (playerId) {
  if (!playerId) return;

  const { data: prof, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", playerId)
    .maybeSingle();

  if (error || !prof) {
    alert("No se pudo cargar la información del jugador.");
    return;
  }

  viewedPlayerProfile = prof;

  document.getElementById("pub-player-avatar").src = prof.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";
  document.getElementById("pub-player-username").textContent = prof.username;
  document.getElementById("pub-player-role-pill").textContent = `⚽ ${prof.role === "ORGANIZADOR" ? "Organizador" : "Jugador"}`;
  document.getElementById("pub-player-stats-line").textContent = `${prof.matches_played || 0} partidos jugados · ${prof.goals || 0} goles`;
  document.getElementById("pub-player-skill").textContent = prof.skill_level || "Principiante";
  document.getElementById("pub-player-fullname").textContent = `${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "-";
  document.getElementById("pub-player-phone").textContent = prof.phone || "-";

  const playerActiveReceipts = receipts.filter(
    (r) => r.userId === prof.id && r.status === "Aprobado" && r.type === "PARTIDO"
  );
  const upcoming = matches.filter((m) => playerActiveReceipts.some((r) => r.matchId === m.id) && !m.isFinished);

  document.getElementById("pub-player-matches-badge").textContent = upcoming.length;
  const listEl = document.getElementById("pub-player-upcoming-list");
  listEl.innerHTML = "";

  if (upcoming.length === 0) {
    listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.82rem;">Sin otros partidos próximos.</p>`;
  } else {
    upcoming.forEach((m) => {
      const item = document.createElement("div");
      item.className = "user-event-card";
      item.onclick = () => showDetail(m.id);
      item.innerHTML = `
        <img class="user-event-thumb" src="${m.image}" alt="${m.title}">
        <div class="user-event-info">
          <span class="user-event-title">${m.title}</span>
          <span class="user-event-meta">📅 ${m.dateLong}</span>
          <span class="user-event-meta">🕐 ${m.time} hs</span>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  switchScreen(viewPlayerPublic);
};

const btnBackPlayerPublic = document.getElementById("btn-back-player-public");
if (btnBackPlayerPublic) {
  btnBackPlayerPublic.addEventListener("click", () => {
    switchScreen(viewDetail);
  });
}

const btnPubPlayerMessage = document.getElementById("btn-pub-player-message");
if (btnPubPlayerMessage) {
  btnPubPlayerMessage.addEventListener("click", async () => {
    if (!viewedPlayerProfile || !currentProfile) return;

    const { data: existing } = await db
      .from("support_chats")
      .select("*")
      .eq("player_id", viewedPlayerProfile.id)
      .eq("organizer_id", currentProfile.id)
      .maybeSingle();

    if (existing) {
      openChatRoom(existing.id);
      return;
    }

    const { data: created, error } = await db
      .from("support_chats")
      .insert([{
        player_id: viewedPlayerProfile.id,
        player_username: viewedPlayerProfile.username,
        organizer_id: currentProfile.id,
        organizer_username: currentProfile.username,
        status: "EN_CURSO",
        subject: "Mensaje Directo",
        last_message: "Chat iniciado desde ficha de jugador"
      }])
      .select()
      .single();

    if (!error && created) {
      openChatRoom(created.id);
    }
  });
}

// ==========================================
// 18. PERFIL DEL JUGADOR
// ==========================================
function renderProfileView() {
  if (!currentProfile) return;

  const nameElem = document.getElementById("profile-name-display");
  if (nameElem) nameElem.textContent = `${currentProfile.first_name || ""} ${currentProfile.last_name || ""}`.trim() || currentProfile.username;

  const countElem = document.getElementById("profile-matches-count");
  if (countElem) countElem.textContent = currentProfile.matches_played || 0;

  const balanceElem = document.getElementById("profile-balance");
  if (balanceElem) balanceElem.textContent = Number(currentProfile.balance || 0).toFixed(2);

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

  const fEmail = document.getElementById("field-email");
  if (fEmail) fEmail.textContent = currentProfile.email || "-";

  const fUser = document.getElementById("field-username");
  if (fUser) fUser.textContent = currentProfile.username || "-";

  renderMyActiveMatches();
}

function renderMyActiveMatches() {
  const container = document.getElementById("list-upcoming-matches");
  if (!container || !currentProfile) return;

  const myApprovedReceipts = receipts.filter(
    (r) => r.userId === currentProfile.id && r.status === "Aprobado" && r.type === "PARTIDO"
  );

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
    card.onclick = () => showDetail(match.id);

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
// CAMBIO Y REDIMENSIÓN DE AVATAR (LIVIANO)
// ==========================================
const btnChangeAvatar = document.getElementById("btn-change-avatar");
const modalEditAvatar = document.getElementById("modal-edit-avatar");
const btnCloseAvatarModal = document.getElementById("btn-close-avatar-modal");
const inputAvatarFile = document.getElementById("input-avatar-file");
const avatarPresetsGrid = document.getElementById("avatar-presets-grid");

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=striker&backgroundColor=f2f3f5",
  "https://api.dicebear.com/7.x/bottts/svg?seed=captain&backgroundColor=f2f3f5",
  "https://api.dicebear.com/7.x/bottts/svg?seed=goalie&backgroundColor=f2f3f5",
  "https://api.dicebear.com/7.x/bottts/svg?seed=champion&backgroundColor=f2f3f5",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80"
];

function renderAvatarPresets() {
  if (!avatarPresetsGrid) return;
  avatarPresetsGrid.innerHTML = "";

  PRESET_AVATARS.forEach((url) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-preset-btn";
    btn.innerHTML = `<img src="${url}" alt="Avatar">`;
    btn.onclick = () => saveUserAvatar(url);
    avatarPresetsGrid.appendChild(btn);
  });
}

if (btnChangeAvatar) {
  btnChangeAvatar.addEventListener("click", () => {
    renderAvatarPresets();
    if (modalEditAvatar) {
      modalEditAvatar.removeAttribute("hidden");
      modalEditAvatar.style.display = "flex";
    }
  });
}

if (btnCloseAvatarModal) {
  btnCloseAvatarModal.addEventListener("click", () => {
    if (modalEditAvatar) {
      modalEditAvatar.setAttribute("hidden", "");
      modalEditAvatar.style.display = "none";
    }
  });
}

if (inputAvatarFile) {
  inputAvatarFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const TARGET_SIZE = 150;
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.82);
        saveUserAvatar(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function saveUserAvatar(newAvatarUrl) {
  if (!currentProfile) return;

  const prevAvatar = currentProfile.avatar_url;
  currentProfile.avatar_url = newAvatarUrl;

  const profileImg = document.getElementById("profile-avatar-img");
  if (profileImg) profileImg.src = newAvatarUrl;

  if (modalEditAvatar) {
    modalEditAvatar.setAttribute("hidden", "");
    modalEditAvatar.style.display = "none";
  }

  const { error } = await db
    .from("profiles")
    .update({ avatar_url: newAvatarUrl })
    .eq("id", currentProfile.id);

  if (error) {
    alert("Error al actualizar avatar: " + error.message);
    currentProfile.avatar_url = prevAvatar;
    if (profileImg) profileImg.src = prevAvatar;
  }
}

// ==========================================
// 19. CREAR PARTIDO (ORGANIZADOR)
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

// ==========================================
// 20. NAVEGACIÓN ENTRE TABS
// ==========================================
function clearTabSelection() {
  [tabMatches, tabClubs, tabMessages, tabAlerts, tabProfile].forEach((t) => {
    if (t) t.classList.remove("active");
  });
}

tabAlerts.addEventListener("click", () => {
  clearTabSelection();
  tabAlerts.classList.add("active");
  switchScreen(viewRules);
});

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
  fetchInvitations();
  fetchSupportThreads();
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
// MÓDULO DE SOPORTE Y CHAT EN VIVO
// ==========================================
if (btnRequestSupport) {
  btnRequestSupport.addEventListener("click", async () => {
    if (!currentProfile) return;

    const { data: existingChat } = await db
      .from("support_chats")
      .select("*")
      .eq("player_id", currentProfile.id)
      .in("status", ["PENDIENTE", "EN_CURSO"])
      .maybeSingle();

    if (existingChat) {
      openChatRoom(existingChat.id);
      return;
    }

    const { data: newChat, error } = await db
      .from("support_chats")
      .insert([{
        player_id: currentProfile.id,
        player_username: currentProfile.username,
        status: "PENDIENTE",
        subject: "Consulta de Jugador",
        last_message: "Chat iniciado"
      }])
      .select()
      .single();

    if (error) {
      alert("Error al solicitar soporte: " + error.message);
      return;
    }

    fetchSupportThreads();
    openChatRoom(newChat.id);
  });
}

async function fetchSupportThreads() {
  if (!currentProfile || !supportThreadsList) return;
  const isOrganizer = currentProfile.role === "ORGANIZADOR";

  let query = db.from("support_chats").select("*").order("updated_at", { ascending: false });

  if (!isOrganizer) {
    query = query.eq("player_id", currentProfile.id);
  } else {
    query = query.or(`status.eq.PENDIENTE,organizer_id.eq.${currentProfile.id}`);
  }

  const { data: chats, error } = await query;
  if (error || !chats) return;

  supportThreadsList.innerHTML = "";
  if (chats.length === 0) {
    supportThreadsList.innerHTML = `<p style="font-size:0.78rem; color:var(--text-muted);">No hay consultas de soporte activas.</p>`;
    return;
  }

  chats.forEach((chat) => {
    const card = document.createElement("div");
    card.className = "support-card-item";

    const isPending = chat.status === "PENDIENTE";
    let actionBtnHtml = "";

    if (isOrganizer) {
      if (isPending) {
        actionBtnHtml = `<button class="support-btn-action" onclick="takeSupportChat(${chat.id})">Aceptar Chat</button>`;
      } else {
        actionBtnHtml = `<button class="support-btn-action" onclick="openChatRoom(${chat.id})">Abrir</button>`;
      }
    } else {
      actionBtnHtml = `<button class="support-btn-action" onclick="openChatRoom(${chat.id})">${isPending ? "Esperando..." : "Abrir"}</button>`;
    }

    card.innerHTML = `
      <div class="support-card-info">
        <span class="support-card-title">${isOrganizer ? "@" + chat.player_username : (chat.organizer_username ? "Org. @" + chat.organizer_username : "Organizador (Pendiente)")}</span>
        <span class="support-card-msg">${chat.last_message || "Sin mensajes"}</span>
      </div>
      <div>${actionBtnHtml}</div>
    `;
    supportThreadsList.appendChild(card);
  });
}

window.takeSupportChat = async function (chatId) {
  if (!currentProfile) return;
  const { error } = await db
    .from("support_chats")
    .update({
      organizer_id: currentProfile.id,
      organizer_username: currentProfile.username,
      status: "EN_CURSO"
    })
    .eq("id", chatId);

  if (!error) {
    fetchSupportThreads();
    openChatRoom(chatId);
  }
};

window.openChatRoom = async function (chatId) {
  activeChatId = Number(chatId);
  const { data: chat } = await db.from("support_chats").select("*").eq("id", chatId).single();
  if (!chat) return;

  currentChatData = chat;
  const isOrganizer = currentProfile.role === "ORGANIZADOR";

  chatRoomTitle.textContent = isOrganizer ? `@${chat.player_username}` : (chat.organizer_username ? `Org. @${chat.organizer_username}` : "Esperando Organizador...");
  chatRoleIndicator.textContent = chat.status === "PENDIENTE" ? "SOLICITUD PENDIENTE" : "SOPORTE ACTIVO";

  if (modalChatRoom) {
    modalChatRoom.removeAttribute("hidden");
    modalChatRoom.style.display = "flex";
  }

  loadChatMessages(chatId);
};

async function loadChatMessages(chatId) {
  if (!chatMessagesBox) return;
  const { data: messages } = await db
    .from("support_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("id", { ascending: true });

  chatMessagesBox.innerHTML = "";
  (messages || []).forEach((m) => {
    appendChatBubble(m);
  });
  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
}

function appendChatBubble(m) {
  if (!chatMessagesBox) return;

  if (m.id) {
    const existing = chatMessagesBox.querySelector(`[data-msg-id="${m.id}"]`);
    if (existing) return;
  }

  const isMine = m.sender_id === currentProfile.id;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${isMine ? "mine" : "theirs"}`;
  if (m.id) bubble.setAttribute("data-msg-id", m.id);

  const dateObj = m.created_at ? new Date(m.created_at) : new Date();
  const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  bubble.innerHTML = `
    <span class="chat-bubble-sender">${isMine ? "Tú" : "@" + m.sender_username}</span>
    <span>${m.message}</span>
    <span class="chat-bubble-time">${timeStr}</span>
  `;
  chatMessagesBox.appendChild(bubble);
  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
}

if (formSendChat) {
  formSendChat.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeChatId || !currentProfile) return;

    const text = inputChatText.value.trim();
    if (!text) return;

    inputChatText.value = "";

    appendChatBubble({
      chat_id: activeChatId,
      sender_id: currentProfile.id,
      sender_username: currentProfile.username,
      sender_role: currentProfile.role,
      message: text,
      created_at: new Date().toISOString()
    });

    const { error: msgErr } = await db.from("support_messages").insert([{
      chat_id: activeChatId,
      sender_id: currentProfile.id,
      sender_username: currentProfile.username,
      sender_role: currentProfile.role,
      message: text
    }]);

    if (msgErr) {
      console.error("Error al enviar mensaje:", msgErr);
      return;
    }

    await db.from("support_chats").update({
      last_message: text,
      updated_at: new Date().toISOString()
    }).eq("id", activeChatId);
  });
}

if (btnCloseChat) {
  btnCloseChat.addEventListener("click", () => {
    activeChatId = null;
    modalChatRoom.setAttribute("hidden", "");
    modalChatRoom.style.display = "none";
    fetchSupportThreads();
  });
}

if (btnOrgNewChat) {
  btnOrgNewChat.addEventListener("click", () => {
    if (modalOrgChat) {
      if (inputSearchChatPlayer) inputSearchChatPlayer.value = "";
      if (searchChatPlayersResults) searchChatPlayersResults.innerHTML = `<p style="font-size:0.78rem; color:var(--text-muted); text-align:center; padding:1rem;">Ingresa el username del jugador...</p>`;
      modalOrgChat.removeAttribute("hidden");
      modalOrgChat.style.display = "flex";
    }
  });
}

if (btnCloseOrgChat) {
  btnCloseOrgChat.addEventListener("click", () => {
    modalOrgChat.setAttribute("hidden", "");
    modalOrgChat.style.display = "none";
  });
}

if (inputSearchChatPlayer) {
  inputSearchChatPlayer.addEventListener("input", async (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 2) return;

    const { data: users } = await db
      .from("profiles")
      .select("id, username, first_name, last_name, avatar_url")
      .eq("role", "JUGADOR")
      .ilike("username", `%${q}%`)
      .limit(6);

    if (!users || users.length === 0) {
      searchChatPlayersResults.innerHTML = `<p style="font-size:0.78rem; color:var(--text-muted); text-align:center; padding:1rem;">No se encontró al jugador.</p>`;
      return;
    }

    searchChatPlayersResults.innerHTML = "";
    users.forEach((u) => {
      const row = document.createElement("div");
      row.className = "player-card-item";
      row.innerHTML = `
        <div class="player-meta-wrap">
          <img class="player-thumb-avatar" src="${u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'}">
          <div class="player-names-col">
            <span class="player-name-val">@${u.username}</span>
            <span class="player-role-tag">${u.first_name || ""} ${u.last_name || ""}</span>
          </div>
        </div>
        <button class="btn-send-invitation" style="background-color: var(--accent);">Conversar</button>
      `;
      row.querySelector("button").onclick = async () => {
        const { data: existing } = await db
          .from("support_chats")
          .select("*")
          .eq("player_id", u.id)
          .eq("organizer_id", currentProfile.id)
          .maybeSingle();

        modalOrgChat.setAttribute("hidden", "");
        modalOrgChat.style.display = "none";

        if (existing) {
          openChatRoom(existing.id);
        } else {
          const { data: created } = await db.from("support_chats").insert([{
            player_id: u.id,
            player_username: u.username,
            organizer_id: currentProfile.id,
            organizer_username: currentProfile.username,
            status: "EN_CURSO",
            subject: "Aviso de Organizador",
            last_message: "Chat iniciado por organizador"
          }]).select().single();

          if (created) openChatRoom(created.id);
        }
      };
      searchChatPlayersResults.appendChild(row);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
});