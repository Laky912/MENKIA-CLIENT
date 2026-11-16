const nameInput = document.querySelector("#playerName");
const displayName = document.querySelector("#displayName");
const skinInput = document.querySelector("#skinInput");
const skinPreview = document.querySelector("#skinPreview");
const avatarPlaceholder = document.querySelector("#avatarPlaceholder");
const saveStatus = document.querySelector("#saveStatus");
let selectedSkin = "";

function loadProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("menkia-profile") || "{}");
    if (profile.name) nameInput.value = profile.name;
    if (profile.skin) {
      selectedSkin = profile.skin;
      showSkin(selectedSkin);
    }
  } catch { /* Ignore invalid local profile data. */ }
  displayName.textContent = nameInput.value || "MENKIA Player";
}
function showSkin(dataUrl) {
  skinPreview.src = dataUrl;
  skinPreview.hidden = false;
  avatarPlaceholder.hidden = true;
}
nameInput.addEventListener("input", () => {
  displayName.textContent = nameInput.value.trim() || "MENKIA Player";
});
skinInput.addEventListener("change", () => {
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
  const reader = new FileReader();
  reader.onload = () => {
    selectedSkin = String(reader.result);
    showSkin(selectedSkin);
    saveStatus.textContent = "Skin cargada en la vista previa. Guarda el perfil para conservarla.";
  };
  reader.readAsDataURL(file);
});
document.querySelector("#saveProfile").addEventListener("click", () => {
  const profile = { name: nameInput.value.trim().slice(0, 16) || "MENKIA Player", skin: selectedSkin };
  try {
    localStorage.setItem("menkia-profile", JSON.stringify(profile));
    displayName.textContent = profile.name;
    saveStatus.textContent = "Perfil guardado en este navegador.";
  } catch {
    saveStatus.textContent = "No se pudo guardar. Prueba una imagen PNG más pequeña.";
  }
});
document.querySelector("#playButton").addEventListener("click", () => {
  document.querySelector("#playMessage").textContent = "¡Pronto! Estamos preparando la integración del motor Minecraft 1.12.2.";
});
loadProfile();