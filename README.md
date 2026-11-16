# MENKIA CLIENT

**MENKIA is becoming a native Windows launcher for Minecraft Java Edition.** The active direction is a downloadable desktop application, not an Eaglercraft browser client.

## Planned account types

- **Local profile:** enter a player name without Microsoft sign-in. This is not a premium license and can only join servers that allow offline-mode identities.
- **Microsoft account:** sign in through Microsoft's official authentication flow and verify the Minecraft Java entitlement.

## Launcher foundation

MENKIA will be based on the open-source [MultiMC Launcher](https://github.com/MultiMC/Launcher), with its own name, visual identity, application registration, and configuration. MultiMC's upstream README identifies Apache License 2.0 and requires forks to use their own branding and Azure application for Microsoft login. Third-party dependencies will be audited separately and their notices preserved.

## Project status

The desktop pivot is recorded on the `desktop-launcher` branch. The first milestone is importing and building a clean upstream Windows x64 baseline. No MENKIA installer or executable has been produced yet.

See [DESKTOP-LAUNCHER.md](DESKTOP-LAUNCHER.md) for scope, account behavior, engineering requirements, and release gates.

## Legacy files

The previous browser/Eaglercraft prototype remains in the repository temporarily for reference. It is not the active product direction and will not be used as the desktop launch engine.
