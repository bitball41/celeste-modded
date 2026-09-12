<img src="frontend/public/app.webp" width=100 align="left">

<h1>Webleste</h1>

<br>

A mostly-complete port of Celeste (2018) to WebAssembly, with full support for Everest mods. Powered by [FNA-WASM-Build](https://github.com/r58playz/FNA-WASM-Build) and [MonoMod.WASM](https://github.com/r58Playz/MonoMod).

![Webleste demo image](assets/demo.png)
<sup><i>Strawberry Jam</i> running in Webleste</sup>

## Limitations

- Loading the game consumes 600M or so of memory, which is still around 3x lower than the original port, but it is still too much for low end devices.
- You may encounter issues on Firefox.

## Bundled maps

On `threads-v2`, enable Everest during setup (on by default), open **Mods**, and
install Tornado Valley, Path of Hope, Cat Isle, or all three. Then press **Play**
and choose the map in Everest's chapter select. Start Path of Hope with its
normal **A-side**; its B/C-sides and secret content remain optional and intact.

The built-in catalog contains pinned download URLs and SHA-256 hashes, not map
assets. The three original ZIPs and Cat Isle's nine required helpers total about
50.6 MiB. They download only when requested, through the existing Epoxy transport,
and persist in `Celeste/Mods` in browser storage. Nothing is added to the initial
WASM payload. Browsing external featured mods is also explicit rather than a
startup request. Everest still scans installed ZIPs when starting the game;
assets inside a ZIP are not individually streamed over the network.

Required dependencies are resolved recursively from the single-file
`frontend/public/bundled-mods.js`; optional dependencies and the larger
Mount Kimitany Saga are not pulled in. The pinned helper set requires Everest
1.6531.0 or newer (the stable build when this catalog was generated). Existing
older Everest installations need updating before using Cat Isle's helper set.

Downloads are verified before installation and staged outside `Mods`. Retry
reuses completed downloads, and **Check / repair** verifies cached files without
redownloading valid ZIPs. Installation disables Play until finished. Browser
storage can be cleared or evicted; reinstalling restores the bundle. Use the
existing Files manager to remove ZIPs you no longer want Everest to load.

Load the complete installer directly from jsDelivr:

`https://cdn.jsdelivr.net/gh/Bitball41/celeste-modded@threads-v2/frontend/public/bundled-mods.js`

Or use the single-file visual launcher, which offers Standard Webleste, each
individual map, or all three before opening the current hosted build:

`https://cdn.jsdelivr.net/gh/Bitball41/celeste-modded@threads-v2/celeste-modded.html`

It exposes `window.WeblesteModPack`, including `install`, `installAll`,
`installed`, the pinned catalog, dependency resolver, integrity hashes, and
progress callbacks. Pass Webleste's `epoxyFetch` as `fetcher` when direct CORS
downloads are unavailable. Upstream code and assets are never rewritten or
repackaged; each catalog entry links to its original mod page and credits. A
successful frontend build does not constitute an in-game compatibility test of
the helper DLLs.

## I want to build this

1. Ensure node and pnpm exist and `pnpm i`
2. Install dotnet 9.0.4
3. Install the mono-devel package on your distro
4. Run `sudo dotnet workload restore` in `loader/`
5. Run `make serve` for a dev server and `make publish` for a release build

## I want to figure out how this works

- The native dotnet WASM support is used to compile a loader program to WASM
  - `loader/Celeste.cs` loads a patched Celeste assembly and exports a function that polls its main loop
  - `loader/Patcher.cs` runs MonoMod on celeste assemblies provided by the user to patch it for WASM
  - `patcher/` has the source for the `MonoMod.Patcher` mod used for WASM patches
- A WASM port of MonoMod is used to provide detours/hooks to Everest and other runtime mods, it functions completely on the IL level and is mono specific
- FMOD pthread builds are used for audio, with slight patching of the bindings so that using FMOD 2 works
- The game canvas is transferred to dotnet's "deputy thread" and all rendering is done from there through FNA's OpenGL driver

For a deeper dive into how we made this and [the Terraria web port](https://github.com/MercuryWorkshop/terraria-wasm), check out the [writeup](https://velzie.rip/blog/celeste-wasm).

## I want to port this to a newer version of Celeste (once it exists)

1. Fix any issues with the hooks
2. Make a PR!
