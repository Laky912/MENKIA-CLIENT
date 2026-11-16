# MENKIA Desktop Launcher

## Product direction

MENKIA is a native Windows desktop launcher for **Minecraft Java Edition**. The former Eaglercraft/browser client is no longer the active product. Its old web files have been removed from the active repository tree.

## Source base

- Upstream project: https://github.com/MultiMC/Launcher
- Upstream branch tracked by the submodule: `develop`
- MENKIA pins a specific upstream source commit through the `launcher` Git submodule. Update that pin deliberately; do not silently track moving upstream code in releases.
- Upstream README declares Apache License 2.0 for the main launcher source. This does not automatically relicense every bundled dependency or submodule; audit all notices before redistribution.
- MultiMC's README and build notes require forks to use their own branding and their own Azure application for Microsoft sign-in.
- MENKIA must not ship with MultiMC's name, logos, service endpoints, API credentials, or identity. The About screen must acknowledge the upstream origin and include required license notices.

## Technical findings from the first source review

- The upstream project is C++11 and uses CMake (the current upstream CMake file requests CMake 3.10).
- The launcher uses Qt 5 components including Core, Widgets, Concurrent, Network, Test, and Xml.
- The upstream Windows build guide is old: it describes Qt 5.6, 32-bit MinGW, legacy OpenSSL 1.0.2g and Java 8. It is not a verified modern Windows x64 build recipe.
- The upstream CMake configuration contains MultiMC branding values, MultiMC service URLs, and upstream API client identifiers. These must be replaced or disabled appropriately before any MENKIA distribution. Never copy upstream credentials into MENKIA's own service registrations.
- The first task is a reproducible Windows x64 baseline build using a supported toolchain, followed by a clean MENKIA branding/configuration patch. Do not claim a working executable until it has actually been built and tested.

## Accounts and authentication

### Local profile

- A local profile is a display name/local identity, not a Microsoft-authenticated Minecraft license.
- It can only join servers that permit offline-mode identities.
- Never bypass Microsoft authentication or present local profiles as premium accounts.

### Microsoft account

- Use the official Microsoft identity flow with MENKIA's own registered application.
- Complete the required Minecraft entitlement and profile checks before enabling authenticated play.
- Store refresh tokens in the operating system's secure credential store where practical. Never write credentials or tokens to logs or plain-text config.
- Provide sign-out and account removal.

## Initial desktop scope

1. MENKIA-branded native window, navigation, and instance list.
2. Add, rename, select, duplicate, and remove instances/profiles.
3. Microsoft account sign-in and account management.
4. Minecraft Java version selection and installation through official metadata/assets.
5. Per-instance game directory, Java runtime selection, memory settings, and JVM arguments.
6. Launch process, live output/log view, and graceful game close.
7. Settings, About, license notices, and a safe update channel.

## Implementation rules

- Keep the native launcher lightweight; do not add an Electron runtime.
- Keep build output separate from source.
- Do not commit proprietary Microsoft credentials, client secrets, tokens, or private signing keys.
- Do not bundle Minecraft game binaries/assets. Obtain game files through supported official metadata and asset flows.
- Preserve third-party license notices in the release package.
- Keep upstream changes isolated and documented so future source updates can be merged safely.

## Build and release gates

- [ ] Audit the complete source tree, every submodule, and third-party licenses.
- [ ] Establish a reproducible Windows x64 baseline build.
- [ ] Replace/disable every upstream brand, URL, API identifier, and service integration that is not explicitly approved for MENKIA.
- [ ] Add original MENKIA name, icon, artwork, and About attribution.
- [ ] Register MENKIA's own Microsoft/Azure application and validate the official sign-in flow.
- [ ] Test local profiles with clear offline-mode limitations.
- [ ] Test version installation, Java selection, memory settings, launch, logs, and update behavior.
- [ ] Produce a portable package or installer and clearly identify whether it is signed.

## Current status

- [x] Product direction changed from browser/Eaglercraft to native Java desktop launcher.
- [x] Legacy browser client files removed from the active branch tree.
- [x] MultiMC source connected as the `launcher` Git submodule.
- [x] Initial upstream README, build guide, and CMake configuration reviewed.
- [ ] Full dependency/submodule and license audit.
- [ ] Verified Windows x64 baseline build.
- [ ] MENKIA branding/configuration patch.
- [ ] MENKIA Microsoft application registration and authentication tests.
- [ ] Functional QA and Windows package.

**This repository is not yet a compiled or tested MENKIA executable.**
