# MENKIA CLIENT — Development Plan

## Product target

MENKIA is a browser Minecraft client targeting **Eaglercraft 1.12.2**. The goal is a cohesive client experience with its own in-game interface and working client-side features, not a separate launcher panel pretending to be part of Minecraft.

## Current repository

- Repository: `Laky912/MENKIA-CLIENT`
- Existing game runtime: `game/eaglercraft1-12-wasm.html`
- Runtime format: compiled, self-contained WASM-GC HTML build.
- Existing launcher: `index.html`, `web/app.js`, `web/styles.css`.
- The current MENKIA game menu and HUD are wrapper UI outside the Minecraft runtime. They are not modifications to Minecraft's internal screens or renderer.

## Non-negotiable compatibility

- Keep Minecraft/Eaglercraft **1.12.2** as the target.
- Preserve the existing runtime until a replacement build passes smoke tests.
- Do not silently replace 1.12.2 with 1.8.x or another version.
- Do not claim a feature is integrated until it works inside the game runtime.
- Keep the existing GitHub repository and Pages deployment.

## Development phases

### Phase 0 — Preserve and audit
- [x] Record the current runtime and launcher structure.
- [x] Identify the existing HTML game file as a compiled artifact.
- [ ] Add reproducible browser smoke tests for startup, singleplayer menu, multiplayer screen, and reload.
- [ ] Record browser/runtime compatibility requirements for WASM-GC and JSPI.

### Phase 1 — Obtain a maintainable 1.12.2 source base
- [ ] Verify source provenance and redistribution/modification permissions.
- [ ] Verify that the source is actually the 1.12.2 port, not an 1.8.x workspace.
- [ ] Verify the build scripts and required JDK/Gradle/TeaVM toolchain.
- [ ] Build an unmodified baseline before making MENKIA changes.
- [ ] Keep source and generated build artifacts clearly separated.

**Gate:** no internal GUI or gameplay modifications begin until the source provenance and a clean baseline build are verified. A public binary or compiled HTML file is not a substitute for editable source.

### Phase 2 — MENKIA in-game foundation
Implement inside the client runtime:
1. MENKIA main menu and navigation.
2. A client settings screen with persistent configuration.
3. HUD framework with independently toggleable modules.
4. FPS, CPS, and Keystrokes modules.
5. Shared theme, scaling, positioning, and keybind handling.

### Phase 3 — Client features
- Armor HUD.
- Coordinates and direction.
- Ping/server information where the protocol exposes reliable values.
- Performance settings wired to actual renderer/game options.
- Free Look only if the 1.12.2 camera/input architecture supports it safely.

### Phase 4 — Release validation
- Build the browser target.
- Test in supported WASM-GC + JSPI browsers and test the JavaScript fallback if available.
- Verify multiplayer connection and saved settings.
- Replace the current runtime only after the new build passes.
- Keep a rollback copy of the last working runtime.

## Current blocker

The checked-in `game/eaglercraft1-12-wasm.html` is compiled output. Editing its surrounding launcher files cannot change Minecraft's internal GUI classes. A source workspace found during research could not be accessed because GitHub returned a DMCA repository block; it is not used as a dependency. Another workspace inspected in search results documents itself as EaglercraftX 1.8, so it is not an acceptable 1.12.2 base.

The official Eaglercraft download page currently identifies its 1.12.2 port as the PeytonPlayz585 port and describes it as still under development. A downloadable build is useful as a runtime reference, but does not by itself provide editable source.

## Feature status policy

A feature is **planned** until implemented, built, and tested inside the game. A launcher preference or HTML overlay does not count as an in-game client feature.
