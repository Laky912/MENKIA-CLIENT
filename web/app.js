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

document.querySelector("#playButton").addEventListener("click", () => {
  document.querySelector("#playMessage").textContent = "El launcher está preparado visualmente; falta integrar el motor Minecraft para jugar.";
});

loadProfile();
setupSkinViewer();
