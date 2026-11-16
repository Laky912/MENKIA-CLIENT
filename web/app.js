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

// Motor externo: se importa una vez desde el HTML oficial descargado por el usuario.
// No publicamos ni redistribuimos el binario del juego dentro de este repositorio.
const ENGINE_DB_NAME = "menkia-engine-storage";
const ENGINE_DB_VERSION = 1;
const ENGINE_STORE_NAME = "engines";
const ENGINE_STORE_KEY = "eaglercraft-1.12-wasm-gc";
const ENGINE_HTML_SHA256 = "5898e022ad0deedfc20cded4f1e64b40e8db8e4d12a030cdae5488464ba1e88c";
let activeEngineUrl = "";

function openEngineDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB no está disponible."));
    const request = indexedDB.open(ENGINE_DB_NAME, ENGINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ENGINE_STORE_NAME)) db.createObjectStore(ENGINE_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir el almacenamiento."));
  });
}

async function storeEngineFile(file) {
  const db = await openEngineDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENGINE_STORE_NAME, "readwrite");
    transaction.objectStore(ENGINE_STORE_NAME).put(file, ENGINE_STORE_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error("No se pudo guardar el motor.")); };
    transaction.onabort = () => { db.close(); reject(transaction.error || new Error("Se canceló el guardado del motor.")); };
  });
}

async function readStoredEngine() {
  const db = await openEngineDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ENGINE_STORE_NAME, "readonly");
    const request = transaction.objectStore(ENGINE_STORE_NAME).get(ENGINE_STORE_KEY);
    request.onsuccess = () => { const value = request.result || null; db.close(); resolve(value); };
    request.onerror = () => { db.close(); reject(request.error || new Error("No se pudo leer el motor guardado.")); };
  });
}

async function sha256(file) {
  if (!crypto.subtle) throw new Error("La verificación requiere un navegador moderno con HTTPS.");
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function showEngineMessage(message) {
  const status = document.querySelector("#playMessage");
  if (status) status.textContent = message;
}

function launchEngine(fileBlob) {
  const frame = document.querySelector("#gameFrame");
  const overlay = document.querySelector("#gameOverlay");
  if (!frame || !overlay || !fileBlob) return;
  if (activeEngineUrl) URL.revokeObjectURL(activeEngineUrl);
  activeEngineUrl = URL.createObjectURL(fileBlob);
  frame.src = activeEngineUrl;
  overlay.hidden = false;
  document.body.classList.add("game-open");
}

function closeEngine() {
  const frame = document.querySelector("#gameFrame");
  const overlay = document.querySelector("#gameOverlay");
  if (frame) frame.src = "about:blank";
  if (overlay) overlay.hidden = true;
  document.body.classList.remove("game-open");
  if (activeEngineUrl) {
    const oldUrl = activeEngineUrl;
    activeEngineUrl = "";
    setTimeout(() => URL.revokeObjectURL(oldUrl), 1000);
  }
}

async function importEngineFile(file) {
  if (!file) return;
  if (file.size > 35 * 1024 * 1024) {
    showEngineMessage("El archivo es demasiado grande. Selecciona el HTML extraído del ZIP.");
    return;
  }
  showEngineMessage("Verificando el motor…");
  try {
    const digest = await sha256(file);
    if (digest !== ENGINE_HTML_SHA256) {
      showEngineMessage("Este HTML no coincide con el motor esperado. Extrae el archivo original Eaglercraft 1.12 WASM-GC y vuelve a intentarlo.");
      return;
    }
    try {
      await storeEngineFile(file);
      showEngineMessage("Motor verificado y guardado en este navegador. Iniciando…");
    } catch (storageError) {
      console.warn("MENKIA: no se pudo guardar el motor de forma persistente:", storageError);
      showEngineMessage("Motor verificado. Se iniciará esta vez; quizá debas importarlo de nuevo después.");
    }
    launchEngine(file);
  } catch (error) {
    console.error("MENKIA engine import:", error);
    showEngineMessage(error.message || "No se pudo verificar el motor.");
  }
}

document.querySelector("#importEngineButton").addEventListener("click", () => {
  document.querySelector("#engineFileInput").click();
});

document.querySelector("#engineFileInput").addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  importEngineFile(file);
  event.target.value = "";
});

document.querySelector("#playButton").addEventListener("click", async () => {
  const button = document.querySelector("#playButton");
  button.disabled = true;
  try {
    const engine = await readStoredEngine();
    if (engine) {
      showEngineMessage("Cargando MENKIA Game…");
      launchEngine(engine);
    } else {
      showEngineMessage("Primero importa el HTML del motor. Solo tendrás que hacerlo una vez en este navegador.");
      document.querySelector("#engineFileInput").click();
    }
  } catch (error) {
    console.warn("MENKIA engine storage:", error);
    showEngineMessage("Importa el HTML del motor para comenzar. Si el navegador no permite guardarlo, tendrás que importarlo cada vez.");
    document.querySelector("#engineFileInput").click();
  } finally {
    button.disabled = false;
  }
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
