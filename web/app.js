const nameInput = document.querySelector("#playerName");
const displayName = document.querySelector("#displayName");
const skinInput = document.querySelector("#skinInput");
const saveStatus = document.querySelector("#saveStatus");
const skinLoading = document.querySelector("#skinLoading");
const DEFAULT_SKIN = "https://minotar.net/skin/Steve";
let selectedSkin = "";
let viewer = null;
let viewerModule = null;

async function setupSkinViewer() {
  try {
    viewerModule = await import("https://cdn.jsdelivr.net/npm/skinview3d@3.4.1/+esm");
    const canvas = document.querySelector("#skinCanvas");
    viewer = new viewerModule.SkinViewer({
      canvas,
      width: 340,
      height: 390,
      skin: DEFAULT_SKIN
    });
    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = false;
    viewer.animation = new viewerModule.IdleAnimation();
    viewer.camera.position.set(28, 18, 48);
    skinLoading.hidden = true;
    if (selectedSkin) await viewer.loadSkin(selectedSkin);
  } catch (error) {
    skinLoading.textContent = "NO SE PUDO CARGAR EL VISOR 3D. REVISA TU CONEXIÓN.";
    console.error("MENKIA skin viewer:", error);
  }
}

function loadProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("menkia-profile") || "{}");
    if (profile.name) nameInput.value = profile.name;
    if (profile.skin) selectedSkin = profile.skin;
  } catch { /* Ignore invalid local profile data. */ }
  displayName.textContent = nameInput.value || "MENKIA Player";
}

nameInput.addEventListener("input", () => {
  displayName.textContent = nameInput.value.trim() || "MENKIA Player";
});

skinInput.addEventListener("change", async () => {
  const file = skinInput.files && skinInput.files[0];
  if (!file) return;
  if (file.type !== "image/png") {
    saveStatus.textContent = "La skin debe ser un archivo PNG.";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    saveStatus.textContent = "La imagen supera el límite de 2 MB.";
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = async () => {
    if (!((image.width === 64 && (image.height === 64 || image.height === 32)) || (image.width === 128 && (image.height === 128 || image.height === 64)))) {
      URL.revokeObjectURL(objectUrl);
      saveStatus.textContent = "Formato no válido. Usa una skin Minecraft de 64×64 PNG.";
      return;
    }
    selectedSkin = objectUrl;
    try {
      if (viewer) await viewer.loadSkin(selectedSkin);
      saveStatus.textContent = "Skin aplicada al modelo 3D. Guarda el perfil para conservarla.";
    } catch {
      saveStatus.textContent = "No se pudo interpretar esta skin. Comprueba que sea una skin de Minecraft.";
    }
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    saveStatus.textContent = "No se pudo leer la imagen.";
  };
  image.src = objectUrl;
});

document.querySelector("#saveProfile").addEventListener("click", async () => {
  const profile = {
    name: nameInput.value.trim().slice(0, 16) || "MENKIA Player",
    skin: selectedSkin.startsWith("data:") ? selectedSkin : ""
  };
  try {
    if (selectedSkin.startsWith("blob:")) {
      const response = await fetch(selectedSkin);
      const blob = await response.blob();
      profile.skin = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    localStorage.setItem("menkia-profile", JSON.stringify(profile));
    displayName.textContent = profile.name;
    saveStatus.textContent = "Perfil guardado en este navegador.";
  } catch {
    saveStatus.textContent = "No se pudo guardar. Prueba una skin PNG más pequeña.";
  }
});

// Motor integrado mediante el acceso web oficial de Eaglercraft 1.12.2 WASM-GC.
// El juego se carga al pulsar JUGAR, sin importar archivos ni instalar nada.
const GAME_URL = "https://dev.eaglercraft.com/play?version=1.12.2-wasm";
let gameStarted = false;

function launchEngine() {
  const frame = document.querySelector("#gameFrame");
  const overlay = document.querySelector("#gameOverlay");
  if (!frame || !overlay) return;
  overlay.hidden = false;
  document.body.classList.add("game-open");
  if (!gameStarted) {
    frame.src = GAME_URL;
    gameStarted = true;
  }
}

function closeEngine() {
  const frame = document.querySelector("#gameFrame");
  const overlay = document.querySelector("#gameOverlay");
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("game-open");
  // Mantener el iframe activo conserva la sesión mientras se vuelve al launcher.
}

document.querySelector("#playButton").addEventListener("click", () => {
  launchEngine();
});

document.querySelector("#closeGameButton").addEventListener("click", closeEngine);


const SETTINGS_KEY = "menkia-settings";
const defaultSettings = {
  graphicsQuality: "balanced",
  particlesEnabled: true,
  showFps: true,
  showCps: false,
  showKeystrokes: true
};
const settingIds = Object.keys(defaultSettings);

function readSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { ...defaultSettings };
  }
}

function applySettings(settings) {
  for (const id of settingIds) {
    const control = document.getElementById(id);
    if (!control) continue;
    if (control.type === "checkbox") control.checked = Boolean(settings[id]);
    else control.value = settings[id];
  }
}

function saveSettings() {
  const settings = {};
  for (const id of settingIds) {
    const control = document.getElementById(id);
    if (!control) continue;
    settings[id] = control.type === "checkbox" ? control.checked : control.value;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  const status = document.querySelector("#settingsStatus");
  if (status) status.textContent = "Preferencias guardadas en este navegador.";
}

function setupSettings() {
  applySettings(readSettings());
  for (const id of settingIds) {
    const control = document.getElementById(id);
    if (control) control.addEventListener("change", saveSettings);
  }
  const reset = document.querySelector("#resetSettings");
  if (reset) reset.addEventListener("click", () => {
    applySettings(defaultSettings);
    saveSettings();
    const status = document.querySelector("#settingsStatus");
    if (status) status.textContent = "Ajustes restablecidos.";
  });
}

loadProfile();
setupSkinViewer();
setupSettings();


// Launcher navigation: switch views in-place instead of scrolling down.
function setupSidebarNavigation() {
  const main = document.querySelector("#home");
  const homeItems = [
    document.querySelector(".hero"),
    document.querySelector(".launcher-dashboard")
  ].filter(Boolean);
  const views = {
    home: homeItems,
    profile: [document.querySelector("#profile")],
    settings: [document.querySelector("#settings")]
  };
  const links = document.querySelectorAll("[data-view-link]");
  function showView(view) {
    for (const [key, elements] of Object.entries(views)) {
      for (const element of elements) {
        if (element) element.hidden = key !== view;
      }
    }
    links.forEach(link => {
      const active = link.dataset.viewLink === view;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (main) main.dataset.currentView = view;
  }
  links.forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    const view = link.dataset.viewLink;
    showView(view);
    history.replaceState(null, "", "#" + view);
  }));
  const initial = location.hash === "#profile" ? "profile" :
    location.hash === "#settings" ? "settings" : "home";
  showView(initial);
}
setupSidebarNavigation();
