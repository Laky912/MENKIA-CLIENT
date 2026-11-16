# MENKIA CLIENT

Cliente de Minecraft para navegador, con objetivo de compatibilidad con **Minecraft 1.12.2** y una interfaz propia inspirada en clientes modernos.

> Proyecto independiente y no oficial de Mojang/Microsoft. Minecraft y sus marcas pertenecen a sus respectivos titulares.

## Estado actual

- [x] Estructura inicial del proyecto.
- [x] Primera interfaz web MENKIA.
- [x] Perfil local con nombre editable.
- [x] Carga y vista previa básica de skin PNG.
- [ ] Vista previa 3D del personaje.
- [x] Importador local del motor Eaglercraft 1.12 WASM-GC con verificación SHA-256.
- [x] Conexión del botón JUGAR y pantalla de juego integrada al launcher.
- [ ] Sincronización del nick del perfil con el motor (requiere verificar su API de opciones).
- [ ] HUD: FPS, CPS, Keystrokes y ArmorHUD.
- [ ] Ajustes gráficos y opciones de rendimiento.
- [ ] Free Look.

## Probar la interfaz

Abre `web/index.html` en un navegador moderno. El perfil se guarda en el almacenamiento local de ese navegador.

También se puede publicar la carpeta `web` con GitHub Pages cuando esté habilitado para el repositorio.

## Estructura

```
web/
  index.html
  styles.css
  app.js
README.md
```

## Importante sobre el motor

El repositorio no redistribuye el motor. El usuario importa localmente el HTML WASM-GC que obtuvo desde la página de descargas de Eaglercraft; MENKIA comprueba su SHA-256 y lo guarda en IndexedDB en ese navegador. El botón JUGAR abre el archivo importado dentro de una vista de juego. La sincronización automática del nick y los HUD internos siguen pendientes.

## Desarrollo

Primero se construye la experiencia MENKIA; después se integra el motor web compatible y finalmente se conectan los módulos HUD y ajustes.
