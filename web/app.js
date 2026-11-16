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

// Motor propio alojado dentro del repositorio MENKIA.
// La ruta apunta al HTML del juego publicado junto al launcher, no a una web externa.
const GAME_URL = "./game/eaglercraft1-12-wasm.html";
let gameStarted = false;

function setGameLoading(title, message, isError = false) {
  const loading = document.querySelector("#gameLoading");
  const heading = document.querySelector("#gameLoadingTitle");
  const detail = document.querySelector("#gameLoadingText");
  if (!loading) return;
  loading.hidden = false;
  loading.classList.toggle("loading-error", isError);
  if (heading) heading.textContent = title;
  if (detail) detail.textContent = message;
}

function launchEngine() {
  const frame = document.querySelector("#gameFrame");
  const overlay = document.querySelector("#gameOverlay");
  if (!frame || !overlay) return;
  overlay.hidden = false;
  document.body.classList.add("game-open");
  document.querySelector("#menkiaMainMenu").hidden = gameStarted ? false : true;
  if (!gameStarted) {
    setGameLoading("INICIANDO CLIENTE", "Cargando el motor local de MENKIA...");
    frame.src = GAME_URL;
    gameStarted = true;
  }
}

function closeEngine() {
  const overlay = document.querySelector("#gameOverlay");
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("game-open");
}

const gameFrame = document.querySelector("#gameFrame");
if (gameFrame) {
  gameFrame.addEventListener("load", () => {
    try {
      const doc = gameFrame.contentDocument;
      const pageText = (doc?.body?.innerText || "").toLowerCase();
      if (pageText.includes("404") || pageText.includes("not found") || pageText.includes("file not found")) {
        setGameLoading("MOTOR NO ENCONTRADO", "Falta publicar el archivo del motor en /game/eaglercraft1-12-wasm.html.", true);
        return;
      }
      const loading = document.querySelector("#gameLoading");
      if (loading) loading.hidden = true;
      const mainMenu = document.querySelector("#menkiaMainMenu");
      if (mainMenu) mainMenu.hidden = false;
    } catch {
      setGameLoading("NO SE PUDO ABRIR", "El motor debe estar alojado en el mismo sitio que MENKIA.", true);
    }
  });
}

document.querySelector("#playButton").addEventListener("click", launchEngine);
document.querySelector("#closeGameButton").addEventListener("click", closeEngine);
document.querySelector("#menuSingleplayer")?.addEventListener("click", () => {
  document.querySelector("#menkiaMainMenu").hidden = true;
});
document.querySelector("#menuMods")?.addEventListener("click", () => toggleGamePanel(true));
document.querySelector("#menuOptions")?.addEventListener("click", () => toggleGamePanel(true));
document.querySelector("#menuMultiplayer")?.addEventListener("click", () => {
  const address = document.querySelector("#hudServerAddress");
  toggleGamePanel(true);
  address?.focus();
});
document.querySelector("#menuBackClassic")?.addEventListener("click", () => {
  document.querySelector("#menkiaMainMenu").hidden = true;
  setGameMode("classic");
});


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


// MENKIA in-game interface layer (wrapper UI; the compiled Minecraft menus remain unchanged).
const GAME_MODE_KEY = "menkia-game-mode";
const gameModeButton = document.querySelector("#gameModeButton");
const gamePanelButton = document.querySelector("#gamePanelButton");
const gamePanel = document.querySelector("#menkiaGamePanel");
const gameHud = document.querySelector("#menkiaGameHud");
const gameModeLabel = document.querySelector("#gameModeLabel");
let gameMode = localStorage.getItem(GAME_MODE_KEY) === "classic" ? "classic" : "menkia";

function setGameMode(mode) {
  gameMode = mode === "classic" ? "classic" : "menkia";
  localStorage.setItem(GAME_MODE_KEY, gameMode);
  const isMenkia = gameMode === "menkia";
  document.querySelector("#gameOverlay")?.classList.toggle("classic-mode", !isMenkia);
  if (gameModeButton) {
    gameModeButton.textContent = isMenkia ? "MENKIA UI" : "MODO CLÁSICO";
    gameModeButton.setAttribute("aria-pressed", String(isMenkia));
  }
  if (gameModeLabel) gameModeLabel.textContent = isMenkia ? "MENKIA" : "CLÁSICO";
  const panelModeButton = document.querySelector("#panelModeButton");
  if (panelModeButton) panelModeButton.textContent = isMenkia ? "CAMBIAR A CLÁSICO" : "CAMBIAR A MENKIA";
  if (gameHud) gameHud.setAttribute("aria-hidden", String(!isMenkia));
}

function toggleGamePanel(force) {
  if (!gamePanel) return;
  const shouldOpen = typeof force === "boolean" ? force : gamePanel.hidden;
  gamePanel.hidden = !shouldOpen;
  if (gamePanelButton) gamePanelButton.setAttribute("aria-expanded", String(shouldOpen));
}

gameModeButton?.addEventListener("click", () => setGameMode(gameMode === "menkia" ? "classic" : "menkia"));
gamePanelButton?.addEventListener("click", () => toggleGamePanel());
document.querySelector("#closeGamePanel")?.addEventListener("click", () => toggleGamePanel(false));
document.querySelector("#panelModeButton")?.addEventListener("click", () => setGameMode(gameMode === "menkia" ? "classic" : "menkia"));
document.addEventListener("keydown", event => {
  if (event.code === "ShiftRight" && !event.repeat && !document.querySelector("#gameOverlay")?.hidden) {
    event.preventDefault();
    toggleGamePanel();
  }
  if (event.code === "Escape" && gamePanel && !gamePanel.hidden) toggleGamePanel(false);
});
setGameMode(gameMode);


// MENKIA HUD settings. Only browser-measurable FPS is live in this wrapper build.
const MODS_KEY = "menkia-mods-config";
const modDefaults = { fps: true, freelook: false, effects: false, tps: false, ping: false, address: false, scale: 100, x: 3, y: 4, addressText: "" };
function readModConfig() {
  try { return { ...modDefaults, ...JSON.parse(localStorage.getItem(MODS_KEY) || "{}") }; }
  catch { return { ...modDefaults }; }
}
let modConfig = readModConfig();
function saveModConfig() {
  localStorage.setItem(MODS_KEY, JSON.stringify(modConfig));
  applyHudConfig();
}
function applyHudConfig() {
  const hud = document.querySelector("#menkiaGameHud");
  if (!hud) return;
  hud.style.left = modConfig.x + "%";
  hud.style.top = (52 + modConfig.y) + "%";
  hud.style.transform = "scale(" + (modConfig.scale / 100) + ")";
  hud.style.transformOrigin = "top left";
  const mapping = { fps: "hudFps", ping: "hudPing", tps: "hudTps", address: "hudAddress" };
  for (const [key, id] of Object.entries(mapping)) {
    const node = document.getElementById(id);
    if (node) node.hidden = !modConfig[key];
  }
  const addressNode = document.querySelector("#hudAddress");
  if (addressNode) addressNode.textContent = "SERVER: " + (modConfig.addressText || "--");
  document.querySelectorAll("[data-mod]").forEach(input => { input.checked = Boolean(modConfig[input.dataset.mod]); });
  const scale = document.querySelector("#hudScale");
  const x = document.querySelector("#hudX");
  const y = document.querySelector("#hudY");
  const address = document.querySelector("#hudServerAddress");
  if (scale) scale.value = modConfig.scale;
  if (x) x.value = modConfig.x;
  if (y) y.value = modConfig.y;
  if (address) address.value = modConfig.addressText;
  const outputs = { hudScaleValue: modConfig.scale + "%", hudXValue: modConfig.x + "%", hudYValue: modConfig.y + "%" };
  for (const [id, value] of Object.entries(outputs)) {
    const output = document.getElementById(id);
    if (output) output.textContent = value;
  }
}
document.querySelectorAll("[data-mod]").forEach(input => input.addEventListener("change", () => {
  modConfig[input.dataset.mod] = input.checked;
  saveModConfig();
}));
for (const [id, key] of [["hudScale", "scale"], ["hudX", "x"], ["hudY", "y"]]) {
  document.querySelector("#" + id)?.addEventListener("input", event => {
    modConfig[key] = Number(event.target.value);
    saveModConfig();
    const out = document.querySelector("#" + id + "Value");
    if (out) out.textContent = event.target.value + "%";
  });
}
document.querySelector("#hudServerAddress")?.addEventListener("change", event => {
  modConfig.addressText = event.target.value.trim().slice(0, 120);
  saveModConfig();
});
applyHudConfig();

let fpsFrames = 0;
let fpsLast = performance.now();
function measureBrowserFps(now) {
  fpsFrames++;
  if (now - fpsLast >= 1000) {
    const fps = Math.round(fpsFrames * 1000 / (now - fpsLast));
    const node = document.querySelector("#hudFps");
    if (node) node.textContent = "FPS: " + fps;
    fpsFrames = 0;
    fpsLast = now;
  }
  requestAnimationFrame(measureBrowserFps);
}
requestAnimationFrame(measureBrowserFps);
