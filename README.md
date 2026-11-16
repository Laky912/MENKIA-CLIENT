# MENKIA CLIENT

Cliente de Minecraft para navegador, con objetivo de compatibilidad con **Minecraft 1.12.2** y una interfaz propia inspirada en clientes modernos.

> Proyecto independiente y no oficial de Mojang/Microsoft. Minecraft y sus marcas pertenecen a sus respectivos titulares.

## Estado actual

- [x] Estructura inicial del proyecto.
- [x] Primera interfaz web MENKIA.
- [x] Perfil local con nombre editable.
- [x] Carga y vista previa básica de skin PNG.
- [ ] Vista previa 3D del personaje.
- [ ] Selección e integración de un motor 1.12.2 compatible y con procedencia/licencia verificadas.
- [ ] Conexión de la pantalla JUGAR con el motor.
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

La interfaz actual es una primera maqueta funcional, no contiene todavía Minecraft ni permite entrar a servidores. Antes de incorporar Eaglercraft u otro motor, se verificará el repositorio de origen, su licencia, las condiciones de redistribución y la compatibilidad real con 1.12.2. No se incluirá código de procedencia dudosa.

## Desarrollo

Primero se construye la experiencia MENKIA; después se integra el motor web compatible y finalmente se conectan los módulos HUD y ajustes.
