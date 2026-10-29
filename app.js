// ==========================================
// 1. REGISTRO DEL SERVICE WORKER (PWA)
// ==========================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("Service Worker activo en el scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Fallo al registrar el Service Worker:", error);
      });
  });
}

// ==========================================
// 2. BOTÓN DE INSTALACIÓN (beforeinstallprompt)
// ==========================================
let deferredPrompt = null;
const btnInstall = document.getElementById("btn-install");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (btnInstall) {
    btnInstall.removeAttribute("hidden");
  }
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
  console.log("Aplicación instalada con éxito.");
  if (btnInstall) {
    btnInstall.setAttribute("hidden", "");
  }
  deferredPrompt = null;
});

// ==========================================
// 3. GESTIÓN DE DATOS Y LOCALSTORAGE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-data");
  const itemInput = document.getElementById("item-input");
  const amountInput = document.getElementById("amount-input");
  const itemsList = document.getElementById("items-list");

  let records = JSON.parse(localStorage.getItem("app_records")) || [];

  function renderRecords() {
    itemsList.innerHTML = "";

    if (records.length === 0) {
      itemsList.innerHTML = `
        <li style="color: var(--text-muted); justify-content: center;">
          Sin registros aún.
        </li>`;
      return;
    }

    records.forEach((record) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${record.title}</span>
        <strong>${Number(record.amount).toFixed(2)}</strong>
      `;
      itemsList.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = itemInput.value.trim();
    const amount = amountInput.value.trim();

    if (!title || !amount) return;

    records.unshift({ title, amount });
    localStorage.setItem("app_records", JSON.stringify(records));

    form.reset();
    itemInput.focus();
    renderRecords();
  });

  renderRecords();
});