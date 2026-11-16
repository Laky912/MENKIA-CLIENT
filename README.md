# MENKIA CLIENT

**MENKIA is a native Windows launcher for Minecraft Java Edition.** The active project is a desktop application, not an Eaglercraft browser client.

## Planned account types

- **Local profile:** a local display identity without Microsoft sign-in. It is not a premium license and can only join servers that allow offline-mode identities.
- **Microsoft account:** sign in through Microsoft's official authentication flow and verify the Minecraft Java entitlement.

## Launcher foundation

MENKIA uses the open-source [MultiMC Launcher](https://github.com/MultiMC/Launcher) source as its starting point, connected through the `launcher` Git submodule. MENKIA will have its own name, visual identity, application registration, and service configuration. The About screen will acknowledge the upstream project and preserve required license notices.

## Project status

The active `main` branch contains the native-launcher project structure and the pinned upstream source submodule. The upstream build instructions and CMake branding/configuration have received an initial review. A reproducible Windows x64 build, dependency/license audit, MENKIA branding patch, and authentication setup are still pending.

**No working MENKIA executable or installer has been produced yet.**

See [DESKTOP-LAUNCHER.md](DESKTOP-LAUNCHER.md) for scope, technical findings, account behavior, and release gates.

## Source checkout

Clone the repository and initialize the launcher submodule:

```bash
git clone --branch main --recurse-submodules https://github.com/Laky912/MENKIA-CLIENT.git
```

The `launcher` directory is a Git submodule; downloading only the repository ZIP will not include its source contents automatically.
