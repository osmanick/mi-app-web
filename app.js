// ==========================================
// 1. SUPABASE CLIENT
// ==========================================
const SUPABASE_URL = "https://ygnuwxvtqnfrycewaqqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnV3eHZ0cW5mcnljZXdhcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjM2NzYsImV4cCI6MjEwODg5OTY3Nn0.ffmCdbClTToLHrK6a7RUQ_EKo6ZbBnKR1ZKZIwdVdZ0";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. ESTADOS GLOBALES
// ==========================================
let matches = [];
let receipts = [];
let venuesList = [];
let myRegistrations = [];
let myInvitations = [];
let currentProfile = null;
let currentSportFilter = "Todos";
let currentSearchQuery = "";
let selectedMatch = null;
let currentReceiptBase64 = null;

// ==========================================
// 3. REFERENCIAS DEL DOM
// ==========================================
const viewRegister = document.getElementById("view-register");
const viewList = document.getElementById("view-list");
const viewDetail = document.getElementById("view-detail");
const viewMessages = document.getElementById("view-messages");
const viewProfile = document.getElementById("view-profile");
const viewAdmin = document.getElementById("view-admin");
const bottomBar = document.getElementById("bottom-bar");

const matchesContainer = document.getElementById("matches-list-container");
const searchInput = document.getElementById("search-input");
const chipButtons = document.querySelectorAll(".chip-item");
const btnBack = document.getElementById("btn-back");
const btnAdminBack = document.getElementById("btn-admin-back");
const btnSubscribe = document.getElementById("btn-subscribe");

const tabMatches = document.getElementById("tab-matches");
const tabMessages = document.getElementById("tab-messages");
const tabProfile = document.getElementById("tab-profile");
const badgePending = document.getElementById("badge-pending");
const badgeMessages = document.getElementById("badge-messages");

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
const organizerActionsBar = document.getElementById("organizer-actions-bar");
const btnEditMatch = document.getElementById("btn-edit-match");
const btnFinishMatch = document.getElementById("btn-finish-match");
const btnInvitePlayer = document.getElementById("btn-invite-player");

const modalQr = document.getElementById("modal-qr");
const qrImage = document.getElementById("qr-image");
const inputTopupAmount = document.getElementById("input-topup-amount");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelPayment = document.getElementById("btn-cancel-payment");
const btnConfirmPayment = document.getElementById("btn-confirm-payment");
const receiptInput = document.getElementById("receipt-input");
const previewWrapper = document.getElementById("preview-wrapper");
const receiptPreview = document.getElementById("receipt-preview");
const btnRemoveReceipt = document.getElementById("btn-remove-receipt");
const chipAddBalance = document.getElementById("chip-add-balance");

const modalInvite = document.getElementById("modal-invite");
const inputInviteUsername = document.getElementById("input-invite-username");
const btnCloseInvite = document.getElementById("btn-close-invite");
const btnSendInvitation = document.getElementById("btn-send-invitation");

const modalEditMatch = document.getElementById("modal-edit-match");
const formEditMatch = document.getElementById("form-edit-match");
const btnCloseEditModal = document.getElementById("btn-close-edit-modal");
const editMatchDate = document.getElementById("edit-match-date");
const editMatchTime = document.getElementById("edit-match-time");
const editMatchPrice = document.getElementById("edit-match-price");
const editMatchMax = document.getElementById("edit-match-max");

const adminReceiptsList = document.getElementById("admin-receipts-list");
const adminPendingCount = document.getElementById("admin-pending-count");
const btnClearReceipts = document.getElementById("btn-clear-receipts");

const btnCreateMatchFab = document.getElementById("btn-create-match-fab");
const modalCreateMatch = document.getElementById("modal-create-match");
const btnCloseCreateModal = document.getElementById("btn-close-create-modal");
const formNewMatch = document.getElementById("form-new-match");
const selectVenue = document.getElementById("select-venue");

const btnTabAbout = document.getElementById("btn-tab-about");
const btnTabEvents = document.getElementById("btn-tab-events");
const tabAboutContent = document.getElementById("profile-tab-about");
const tabEventsContent = document.getElementById("profile-tab-events");
const listUpcomingMatches = document.getElementById("list-upcoming-matches");
const messagesListContainer = document.getElementById("messages-list-container");

// ==========================================
// 4. CONTROL DE PANTALLAS
// ==========================================
function switchScreen(targetScreen) {
  [viewRegister, viewList, viewDetail, viewMessages, viewProfile, viewAdmin].forEach((s) => {
    if (s) {
      s.classList.remove("active");
      s.style.display = "none";
    }
  });
  if (targetScreen) {
    targetScreen.classList.add("active");
    targetScreen.style.display = "flex";
  }
}

// ==========================================
// 5. SESIÓN Y PERMISOS
// ==========================================
async function checkUserSession() {
  const activeUserId = localStorage.getItem("app_active_user");

  fetchVenues();
  fetchMatches();

  if (!activeUserId) {
    if (bottomBar) bottomBar.style.display = "none";
    switchScreen(viewRegister);
    return;
  }

  if (bottomBar) bottomBar.style.display = "flex";

  try {
    const { data: user } = await db
      .from("profiles")
      .select("*")
      .or(`id.eq.${activeUserId},username.eq.${activeUserId}`)
      .maybeSingle();

    if (user) {
      currentProfile = user;
      localStorage.setItem("app_active_user", user.id);
      applyRolePermissions();
      renderProfileView();
      fetchMyRegistrations();
      fetchMyInvitations();

      if (currentProfile.role === "ORGANIZADOR") {
        fetchReceipts();
      }
    }
    switchScreen(viewList);
  } catch (err) {
    console.error("Error sesión:", err);
    switchScreen(viewList);
  }
}

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
}

// ==========================================
// 6. CARGA DE DATOS Y BILLETERA
// ==========================================
async function fetchVenues() {
  const { data } = await db.from("venues").select("*").order("name");
  venuesList = data || [];
  if (selectVenue) {
    selectVenue.innerHTML = '<option value="">-- Selecciona una cancha --</option>';
    venuesList.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.id;
      opt.textContent = `${v.name} (${v.sport})`;
      selectVenue.appendChild(opt);
    });
  }
}

async function fetchMatches() {
  const { data } = await db
    .from("matches")
    .select("*")
    .or("is_finished.eq.false,is_finished.is.null")
    .order("id", { ascending: true });

  matches = (data || []).map((m) => ({
    id: m.id,
    title: m.title,
    dateGroup: m.date_group,
    dateLong: m.date_long,
    sport: m.sport,
    time: m.time,
    timeFull: m.time_full,
    address: m.address,
    price: Number(m.price),
    currentPlayers: m.current_players || 0,
    maxPlayers: m.max_players || 14,
    image: m.image,
    organizer: m.organizer,
    isConfirmed: m.is_confirmed || false,
    rawDate: m.date_long
  }));

  renderMatches();
  renderMyEvents();
}

async function fetchMyRegistrations() {
  if (!currentProfile) return;
  const { data } = await db
    .from("match_registrations")
    .select("match_id")
    .eq("user_id", currentProfile.id);

  myRegistrations = (data || []).map((r) => r.match_id);
  renderMyEvents();
}

async function fetchMyInvitations() {
  if (!currentProfile) return;
  const { data } = await db
    .from("invitations")
    .select("*, matches(*)")
    .eq("to_username", currentProfile.username)
    .eq("status", "Pendiente");

  myInvitations = data || [];
  if (badgeMessages) {
    if (myInvitations.length > 0) {
      badgeMessages.textContent = myInvitations.length;
      badgeMessages.removeAttribute("hidden");
    } else {
      badgeMessages.setAttribute("hidden", "");
    }
  }
  renderMessagesView();
}

async function fetchReceipts() {
  const { data } = await db.from("receipts").select("*").order("id", { ascending: false });
  receipts = data || [];
  if (adminPendingCount) {
    const count = receipts.filter((r) => r.status === "Pendiente").length;
    adminPendingCount.textContent = count;
    if (badgePending) {
      if (count > 0 && currentProfile?.role === "ORGANIZADOR") {
        badgePending.textContent = count;
        badgePending.removeAttribute("hidden");
      } else {
        badgePending.setAttribute("hidden", "");
      }
    }
  }
  renderAdminPanel();
}

// ==========================================
// 7. RENDERIZADO DE PARTIDOS
// ==========================================
function renderMatches() {
  if (!matchesContainer) return;
  matchesContainer.innerHTML = "";

  const filtered = matches.filter((item) => {
    const matchesSport = currentSportFilter === "Todos" || item.sport.toLowerCase() === currentSportFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  if (filtered.length === 0) {
    matchesContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:3rem 1rem;">No hay partidos activos.</div>`;
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

      const isRegistered = myRegistrations.includes(match.id);

      card.innerHTML = `
        <div class="match-thumb-wrapper">
          <img class="match-thumb" src="${match.image}" alt="${match.title}">
          ${match.isConfirmed ? `<div class="badge-confirmed-tag">✓ Confirmado</div>` : ""}
          ${isRegistered ? `<div class="badge-confirmed-tag" style="background:#34c759; top:auto; bottom:5px;">Inscrito</div>` : ""}
        </div>
        <div class="match-details">
          <div>
            <h4 class="match-title">${match.title}</h4>
            <div class="match-location">📍 ${match.address}</div>
            <div class="match-sport">⚽ ${match.sport} · 🕐 ${match.time} hs</div>
          </div>
          <div class="match-footer">
            <span class="match-price">Bs ${match.price.toFixed(2)}</span>
            <div class="quota-indicator">
              <div class="progress-track"><div class="progress-fill" style="width:${percentage}%"></div></div>
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
// 8. DETALLE, INSCRIPCIÓN Y EDICIÓN
// ==========================================
async function showDetail(id) {
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
    organizerConfirmBox.style.display = isOrganizer ? "flex" : "none";
    toggleMatchConfirmed.checked = !!selectedMatch.isConfirmed;
  }

  if (organizerActionsBar) {
    organizerActionsBar.style.display = isOrganizer ? "flex" : "none";
  }

  const isRegistered = myRegistrations.includes(selectedMatch.id);
  const isFull = selectedMatch.currentPlayers >= selectedMatch.maxPlayers;

  if (isRegistered) {
    btnSubscribe.textContent = "Ya estás inscrito ✓";
    btnSubscribe.style.backgroundColor = "#34c759";
    btnSubscribe.disabled = true;
  } else if (isFull) {
    btnSubscribe.textContent = "Cupos Agotados";
    btnSubscribe.style.backgroundColor = "#43454d";
    btnSubscribe.disabled = true;
  } else {
    btnSubscribe.textContent = `Inscribirme con Saldo (Bs. ${selectedMatch.price.toFixed(0)})`;
    btnSubscribe.style.backgroundColor = "var(--accent)";
    btnSubscribe.disabled = false;
  }

  renderConfirmedPlayers(selectedMatch.id);
  switchScreen(viewDetail);
}

// Inscripción con descuento de saldo
btnSubscribe.onclick = async () => {
  if (!currentProfile) {
    alert("Inicia sesión para unirte.");
    return;
  }
  if (!selectedMatch) return;

  const userBalance = Number(currentProfile.balance || 0);
  if (userBalance < selectedMatch.price) {
    if (confirm(`Saldo insuficiente (Tienes Bs. ${userBalance.toFixed(2)} y el partido cuesta Bs. ${selectedMatch.price.toFixed(2)}).\n\n¿Deseas recargar saldo ahora?`)) {
      openTopupModal();
    }
    return;
  }

  if (confirm(`¿Confirmas tu inscripción por Bs. ${selectedMatch.price.toFixed(2)}? Se descontará de tu saldo.`)) {
    btnSubscribe.disabled = true;
    btnSubscribe.textContent = "Procesando...";

    const newBalance = userBalance - selectedMatch.price;

    await db.from("profiles").update({
      balance: newBalance,
      matches_played: (currentProfile.matches_played || 0) + 1
    }).eq("id", currentProfile.id);

    await db.from("matches").update({
      current_players: selectedMatch.currentPlayers + 1
    }).eq("id", selectedMatch.id);

    await db.from("match_registrations").insert([{
      match_id: selectedMatch.id,
      user_id: currentProfile.id
    }]);

    currentProfile.balance = newBalance;
    currentProfile.matches_played = (currentProfile.matches_played || 0) + 1;
    renderProfileView();
    fetchMyRegistrations();
    fetchMatches();

    alert("¡Inscripción exitosa! El partido ha sido añadido a 'Mis eventos'.");
    showDetail(selectedMatch.id);
  }
};

async function renderConfirmedPlayers(matchId) {
  if (!detailPlayersList) return;
  detailPlayersList.innerHTML = "";

  const { data: regs } = await db
    .from("match_registrations")
    .select("user_id")
    .eq("match_id", matchId);

  const uids = (regs || []).map((r) => r.user_id);
  detailPlayersRatio.textContent = `${uids.length}-${selectedMatch?.maxPlayers || 14}`;

  if (uids.length === 0) {
    detailPlayersList.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0;">Aún no hay inscritos. ¡Sé el primero!</div>`;
    return;
  }

  const { data: players } = await db.from("profiles").select("username, avatar_url").in("id", uids);

  (players || []).forEach((p) => {
    const card = document.createElement("div");
    card.className = "player-card-item";
    card.innerHTML = `
      <div class="player-meta-wrap">
        <img class="player-thumb-avatar" src="${p.avatar_url}" alt="${p.username}">
        <span class="player-name-val">@${p.username}</span>
      </div>
      <span class="player-role-tag">Jugador</span>
    `;
    detailPlayersList.appendChild(card);
  });
}

// Finalizar partido
if (btnFinishMatch) {
  btnFinishMatch.addEventListener("click", async () => {
    if (!selectedMatch || currentProfile?.role !== "ORGANIZADOR") return;
    if (confirm(`¿Finalizar el partido en "${selectedMatch.title}"? Se quitará de la cartelera y de los eventos activos.`)) {
      await db.from("matches").update({ is_finished: true }).eq("id", selectedMatch.id);
      alert("Partido concluido.");
      switchScreen(viewList);
      fetchMatches();
      fetchMyRegistrations();
    }
  });
}

// Editar partido (Organizador)
if (btnEditMatch) {
  btnEditMatch.addEventListener("click", () => {
    if (!selectedMatch) return;
    editMatchTime.value = selectedMatch.timeFull;
    editMatchPrice.value = selectedMatch.price;
    editMatchMax.value = selectedMatch.maxPlayers;
    modalEditMatch.removeAttribute("hidden");
    modalEditMatch.style.display = "flex";
  });
}

if (btnCloseEditModal) {
  btnCloseEditModal.addEventListener("click", () => {
    modalEditMatch.setAttribute("hidden", "");
    modalEditMatch.style.display = "none";
  });
}

if (formEditMatch) {
  formEditMatch.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const rawDate = editMatchDate.value;
    let dateGroup = selectedMatch.dateGroup;
    let dateLong = selectedMatch.dateLong;

    if (rawDate) {
      const [year, month, day] = rawDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      dateLong = dateObj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      dateGroup = `Fecha · ${dateLong.charAt(0).toUpperCase() + dateLong.slice(1)}`;
    }

    const updates = {
      date_group: dateGroup,
      date_long: dateLong,
      time: editMatchTime.value.split("—")[0].trim(),
      time_full: editMatchTime.value.trim(),
      price: parseFloat(editMatchPrice.value),
      max_players: parseInt(editMatchMax.value)
    };

    await db.from("matches").update(updates).eq("id", selectedMatch.id);
    modalEditMatch.setAttribute("hidden", "");
    modalEditMatch.style.display = "none";
    alert("Partido actualizado.");
    fetchMatches();
    switchScreen(viewList);
  });
}

// ==========================================
// 9. INVITACIONES A JUGADORES
// ==========================================
if (btnInvitePlayer) {
  btnInvitePlayer.addEventListener("click", () => {
    modalInvite.removeAttribute("hidden");
    modalInvite.style.display = "flex";
  });
}

if (btnCloseInvite) {
  btnCloseInvite.addEventListener("click", () => {
    modalInvite.setAttribute("hidden", "");
    modalInvite.style.display = "none";
  });
}

if (btnSendInvitation) {
  btnSendInvitation.addEventListener("click", async () => {
    const targetUser = inputInviteUsername.value.trim().toLowerCase();
    if (!targetUser) return;

    const { data: userExists } = await db.from("profiles").select("id").eq("username", targetUser).maybeSingle();
    if (!userExists) {
      alert("El username ingresado no existe.");
      return;
    }

    await db.from("invitations").insert([{
      match_id: selectedMatch.id,
      from_username: currentProfile.username,
      to_username: targetUser,
      status: "Pendiente"
    }]);

    modalInvite.setAttribute("hidden", "");
    modalInvite.style.display = "none";
    inputInviteUsername.value = "";
    alert(`¡Invitación enviada a @${targetUser}! Le llegará en su pestaña Mensajes.`);
  });
}

function renderMessagesView() {
  if (!messagesListContainer) return;
  messagesListContainer.innerHTML = "";

  if (myInvitations.length === 0) {
    messagesListContainer.innerHTML = `
      <div class="empty-state-container">
        <h3 class="empty-title">Sin invitaciones pendientes</h3>
        <p class="empty-subtitle">Cuando te inviten a un partido, aparecerán las solicitudes aquí.</p>
      </div>`;
    return;
  }

  myInvitations.forEach((inv) => {
    const m = inv.matches;
    const card = document.createElement("div");
    card.className = "receipt-card";
    card.innerHTML = `
      <div class="receipt-header">
        <span class="receipt-match-title">⚽ Invitación de @${inv.from_username}</span>
        <span class="receipt-status-tag status-pending">Invitación</span>
      </div>
      <div class="receipt-info-text">
        <span><strong>Cancha:</strong> ${m ? m.title : "Partido"}</span>
        <span><strong>Horario:</strong> ${m ? m.time_full : ""}</span>
        <span><strong>Precio:</strong> Bs. ${m ? Number(m.price).toFixed(2) : ""}</span>
      </div>
      <div class="receipt-actions">
        <button class="btn-approve" onclick="acceptInvitation(${inv.id}, ${inv.match_id}, ${m ? m.price : 0})">Aceptar</button>
        <button class="btn-reject" onclick="rejectInvitation(${inv.id})">Rechazar</button>
      </div>
    `;
    messagesListContainer.appendChild(card);
  });
}

window.acceptInvitation = async (invId, matchId, price) => {
  const userBalance = Number(currentProfile.balance || 0);
  if (userBalance < price) {
    if (confirm(`Saldo insuficiente para aceptar (Tienes Bs. ${userBalance.toFixed(2)} y cuesta Bs. ${price.toFixed(2)}).\n\n¿Recargar ahora?`)) {
      openTopupModal();
    }
    return;
  }

  await db.from("profiles").update({ balance: userBalance - price }).eq("id", currentProfile.id);
  await db.from("match_registrations").insert([{ match_id: matchId, user_id: currentProfile.id }]);
  await db.from("invitations").update({ status: "Aceptada" }).eq("id", invId);

  currentProfile.balance = userBalance - price;
  renderProfileView();
  fetchMyRegistrations();
  fetchMyInvitations();
  alert("¡Invitación aceptada! Se agregó el partido a 'Mis eventos'.");
};

window.rejectInvitation = async (invId) => {
  await db.from("invitations").delete().eq("id", invId);
  fetchMyInvitations();
};

// ==========================================
// 10. RECARGA DE SALDO CON QR
// ==========================================
function openTopupModal() {
  modalQr.removeAttribute("hidden");
  modalQr.style.display = "flex";
}

if (chipAddBalance) chipAddBalance.addEventListener("click", openTopupModal);
if (btnCloseModal) btnCloseModal.addEventListener("click", () => { modalQr.setAttribute("hidden", ""); modalQr.style.display = "none"; });
if (btnCancelPayment) btnCancelPayment.addEventListener("click", () => { modalQr.setAttribute("hidden", ""); modalQr.style.display = "none"; });

if (receiptInput) {
  receiptInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      currentReceiptBase64 = event.target.result;
      receiptPreview.src = currentReceiptBase64;
      previewWrapper.removeAttribute("hidden");
    };
    reader.readAsDataURL(file);
  });
}

if (btnRemoveReceipt) {
  btnRemoveReceipt.addEventListener("click", () => {
    currentReceiptBase64 = null;
    receiptInput.value = "";
    previewWrapper.setAttribute("hidden", "");
  });
}

if (btnConfirmPayment) {
  btnConfirmPayment.addEventListener("click", async () => {
    if (!currentReceiptBase64) {
      alert("Por favor adjunta la captura del comprobante bancario.");
      return;
    }

    const amount = parseFloat(inputTopupAmount.value) || 0;
    if (amount <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }

    btnConfirmPayment.disabled = true;
    btnConfirmPayment.textContent = "Enviando...";

    await db.from("receipts").insert([{
      match_id: 0,
      match_title: "Recarga de Billetera",
      sport: "Billetera",
      amount: amount,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Pendiente",
      receipt_image: currentReceiptBase64,
      user_id: currentProfile.id,
      username: currentProfile.username,
      avatar_url: currentProfile.avatar_url
    }]);

    btnConfirmPayment.disabled = false;
    btnConfirmPayment.textContent = "Solicitar Acreditación";
    modalQr.setAttribute("hidden", "");
    modalQr.style.display = "none";
    alert("Comprobante enviado. El organizador acreditará el saldo a tu cuenta.");
  });
}

// Aprobación de recarga (Organizador)
function renderAdminPanel() {
  if (!adminReceiptsList) return;
  adminReceiptsList.innerHTML = "";

  if (receipts.length === 0) {
    adminReceiptsList.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:2rem;">Sin recargas registradas.</div>`;
    return;
  }

  receipts.forEach((r) => {
    const card = document.createElement("div");
    card.className = "receipt-card";
    card.innerHTML = `
      <div class="receipt-header">
        <span class="receipt-match-title">Recarga @${r.username}</span>
        <span class="receipt-status-tag ${r.status === "Aprobado" ? "status-approved" : "status-pending"}">${r.status}</span>
      </div>
      <div class="receipt-body-layout">
        <img class="receipt-thumb-admin" src="${r.receipt_image}" onclick="openViewer('${r.receipt_image}')">
        <div class="receipt-info-text">
          <span><strong>Monto:</strong> Bs. ${Number(r.amount).toFixed(2)}</span>
          <span><strong>Hora:</strong> ${r.date}</span>
        </div>
      </div>
      ${r.status === "Pendiente" ? `
        <div class="receipt-actions">
          <button class="btn-approve" onclick="approveTopup(${r.id}, '${r.user_id}', ${r.amount})">✓ Acreditar Saldo</button>
          <button class="btn-reject" onclick="rejectTopup(${r.id})">✕ Rechazar</button>
        </div>` : ""}
    `;
    adminReceiptsList.appendChild(card);
  });
}

window.approveTopup = async (receiptId, userId, amount) => {
  const { data: user } = await db.from("profiles").select("balance").eq("id", userId).single();
  if (user) {
    const newBal = Number(user.balance || 0) + Number(amount);
    await db.from("profiles").update({ balance: newBal }).eq("id", userId);
  }
  await db.from("receipts").update({ status: "Aprobado" }).eq("id", receiptId);
  alert(`Saldo acreditado con éxito (+Bs. ${amount}).`);
  fetchReceipts();
};

window.rejectTopup = async (receiptId) => {
  if (confirm("¿Rechazar recarga?")) {
    await db.from("receipts").update({ status: "Rechazado" }).eq("id", receiptId);
    fetchReceipts();
  }
};

window.openViewer = (src) => {
  const viewer = document.getElementById("modal-image-viewer");
  document.getElementById("viewer-full-image").src = src;
  viewer.removeAttribute("hidden");
  viewer.style.display = "flex";
};

document.getElementById("btn-close-viewer")?.addEventListener("click", () => {
  const viewer = document.getElementById("modal-image-viewer");
  viewer.setAttribute("hidden", "");
  viewer.style.display = "none";
});

// ==========================================
// 11. MIS EVENTOS (JUGADOR)
// ==========================================
function renderMyEvents() {
  if (!listUpcomingMatches) return;
  listUpcomingMatches.innerHTML = "";

  const myMatches = matches.filter((m) => myRegistrations.includes(m.id));

  if (myMatches.length === 0) {
    listUpcomingMatches.innerHTML = `
      <div class="empty-state-container" style="padding:1.5rem 0;">
        <p style="color:var(--text-muted); font-size:0.85rem;">No tienes partidos próximos activos.</p>
      </div>`;
    return;
  }

  myMatches.forEach((match) => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.onclick = () => showDetail(match.id);
    card.innerHTML = `
      <div class="match-thumb-wrapper">
        <img class="match-thumb" src="${match.image}" alt="${match.title}">
      </div>
      <div class="match-details">
        <h4 class="match-title">${match.title}</h4>
        <div class="match-location">📍 ${match.address}</div>
        <div class="match-sport">📅 ${match.dateLong} · 🕐 ${match.time} hs</div>
      </div>
    `;
    listUpcomingMatches.appendChild(card);
  });
}

// Inversión de pestañas de Perfil
if (btnTabEvents && btnTabAbout) {
  btnTabEvents.addEventListener("click", () => {
    btnTabAbout.classList.remove("active");
    btnTabEvents.classList.add("active");
    tabAboutContent.classList.remove("active");
    tabEventsContent.classList.add("active");
  });

  btnTabAbout.addEventListener("click", () => {
    btnTabEvents.classList.remove("active");
    btnTabAbout.classList.add("active");
    tabEventsContent.classList.remove("active");
    tabAboutContent.classList.add("active");
  });
}

function renderProfileView() {
  if (!currentProfile) return;
  document.getElementById("profile-name-display").textContent = `${currentProfile.first_name || ""} ${currentProfile.last_name || ""}`.trim() || currentProfile.username;
  document.getElementById("profile-matches-count").textContent = currentProfile.matches_played || 0;
  document.getElementById("profile-balance").textContent = Number(currentProfile.balance || 0).toFixed(2);
  document.getElementById("profile-promo").textContent = Number(currentProfile.promo_balance || 0).toFixed(2);
  document.getElementById("profile-avatar-img").src = currentProfile.avatar_url;

  document.getElementById("field-fullname").textContent = `${currentProfile.first_name || ""} ${currentProfile.last_name || ""}`;
  document.getElementById("field-username").textContent = `@${currentProfile.username}`;
  document.getElementById("field-phone").textContent = currentProfile.phone || "-";
  document.getElementById("field-skill").textContent = currentProfile.skill_level || "-";
}

// ==========================================
// 12. NAVEGACIÓN Y ARRANQUE
// ==========================================
tabMatches.onclick = () => {
  [tabMatches, tabMessages, tabProfile].forEach((t) => t?.classList.remove("active"));
  tabMatches.classList.add("active");
  switchScreen(viewList);
  renderMatches();
};

tabMessages.onclick = () => {
  [tabMatches, tabMessages, tabProfile].forEach((t) => t?.classList.remove("active"));
  tabMessages.classList.add("active");
  switchScreen(viewMessages);
  fetchMyInvitations();
};

tabProfile.onclick = () => {
  [tabMatches, tabMessages, tabProfile].forEach((t) => t?.classList.remove("active"));
  tabProfile.classList.add("active");
  if (currentProfile?.role === "ORGANIZADOR") {
    renderAdminPanel();
    switchScreen(viewAdmin);
  } else {
    renderProfileView();
    renderMyEvents();
    switchScreen(viewProfile);
  }
};

btnBack.onclick = () => { switchScreen(viewList); renderMatches(); };
btnAdminBack.onclick = () => { switchScreen(viewList); renderMatches(); };

// Auth submit & logout
document.getElementById("form-login-user")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const u = document.getElementById("login-username").value.trim().toLowerCase();
  const p = document.getElementById("login-password").value.trim();

  const { data: user } = await db.from("profiles").select("*").eq("username", u).eq("password", p).maybeSingle();
  if (!user) { alert("Credenciales incorrectas."); return; }

  localStorage.setItem("app_active_user", user.id);
  currentProfile = user;
  if (bottomBar) bottomBar.style.display = "flex";
  applyRolePermissions();
  renderProfileView();
  fetchMyRegistrations();
  fetchMyInvitations();
  switchScreen(viewList);
  fetchMatches();
});

document.getElementById("btn-logout")?.addEventListener("click", () => {
  if (confirm("¿Cerrar sesión?")) {
    localStorage.removeItem("app_active_user");
    currentProfile = null;
    bottomBar.style.display = "none";
    switchScreen(viewRegister);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
});