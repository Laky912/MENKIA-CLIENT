# MENKIA Desktop Launcher

## Product direction

MENKIA is now a native Windows desktop launcher for **Minecraft Java Edition**. The previous Eaglercraft/browser client is no longer the active product direction. Existing web files and the compiled Eaglercraft runtime are retained as legacy material until the desktop launcher is established; they are not part of the new launch flow.

## Base project

- Upstream: https://github.com/MultiMC/Launcher
- Upstream branch reviewed: `develop`
- Upstream README states the launcher source is licensed under Apache License 2.0.
- The upstream project explicitly says forks must use their own branding and register their own Azure application for Microsoft account login.
- MENKIA must not use MultiMC names, logos, API tokens, or branding. The About screen must acknowledge MultiMC as the upstream origin and include required license notices.
- Apache 2.0 on the main project does not automatically relicense bundled dependencies. Audit each dependency and preserve its notices before redistribution.

## Accounts

### Local account
- User enters a display name and creates a local launcher profile.
- This is an offline/local identity, not a Microsoft-authenticated Minecraft license.
- It must only be used where the selected Minecraft server permits offline-mode identities.
- Do not bypass Microsoft authentication or present local profiles as premium accounts.

### Microsoft / Premium account
- Sign in through the official Microsoft identity flow using MENKIA's own registered application.
- Complete the Minecraft entitlement/profile checks required by the official authentication flow.
- Store refresh tokens using the operating system's secure credential storage where practical; never write credentials or tokens to logs or plain-text config.
- Provide sign-out and account removal.

## Initial desktop scope

1. Branded MENKIA window and instance list.
2. Add, rename, select, and remove local launcher profiles.
3. Microsoft account sign-in and account management.
4. Minecraft Java version selection and installation using official metadata/assets.
5. Per-instance game directory, Java runtime selection, memory settings, and JVM arguments.
6. Launch, process output/log view, and graceful game close.
7. Settings, About, license notices, and update channel.

## Engineering direction

- Start from the MultiMC C++/Qt codebase rather than wrapping the old browser game.
- Keep the native launcher lightweight; avoid adding an Electron runtime.
- Establish a clean upstream baseline build before branding or feature changes.
- Build and package Windows x64 first. Keep build output separate from source.
- Do not commit proprietary Microsoft credentials, client secrets, tokens, or private signing keys.
- Do not bundle Minecraft game binaries/assets. Download game files through the supported official metadata and asset flow.
- Keep third-party license inventory and notices in the release package.

## Build gates

- [ ] Import/review the upstream source and all submodule/dependency licenses.
- [ ] Build an unmodified Windows x64 baseline.
- [ ] Replace all MultiMC branding with MENKIA branding and add attribution/notices.
- [ ] Register MENKIA's own Microsoft/Azure application and validate sign-in.
- [ ] Implement and test local profiles with offline-mode server limitations clearly explained.
- [ ] Test version installation, Java selection, memory settings, launch, logs, and update behavior.
- [ ] Produce a signed or clearly identified unsigned Windows installer/portable package.

## Current status

This branch records the approved product pivot and implementation requirements. It is **not yet a compiled launcher**. The upstream source has been inspected through its public README and CMake configuration; the full source tree, submodules, dependency licenses, local Windows build, and Microsoft application registration still need to be brought into the build environment and verified.
