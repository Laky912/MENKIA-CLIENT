# MENKIA CLIENT

Cliente de Minecraft para navegador, con objetivo de compatibilidad con **Minecraft 1.12.2** y una interfaz propia inspirada en clientes modernos.

> Proyecto independiente y no oficial de Mojang/Microsoft. Minecraft y sus marcas pertenecen a sus respectivos titulares.

## Estado actual

- [x] Estructura inicial del proyecto.
- [x] Primera interfaz web MENKIA.
- [x] Perfil local con nombre editable.
- [x] Carga y vista previa básica de skin PNG.
- [ ] Vista previa 3D del personaje.
- [x] Botón JUGAR conectado al acceso web oficial de Eaglercraft 1.12 WASM-GC, sin importación manual.
- [x] Pantalla de juego integrada visualmente en MENKIA.
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

## Integración del juego

El botón JUGAR abre dentro de la pantalla de juego de MENKIA el acceso web oficial de Eaglercraft 1.12.2 WASM-GC (`https://dev.eaglercraft.com/play?version=1.12.2-wasm`). No requiere que cada jugador descargue o importe un HTML. La página oficial se carga desde sus propios servidores; por ello, su disponibilidad, compatibilidad con iframes y requisitos del navegador dependen de ese servicio. La sincronización automática del nick y los HUD internos siguen pendientes.

## Desarrollo

Primero se construye la experiencia MENKIA; después se integra el motor web compatible y finalmente se conectan los módulos HUD y ajustes.
