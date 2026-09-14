#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${CELESTE_DOTNET:?Path to dotnet 10 executable}"
: "${CELESTE_RUNTIME_PACK:?Extracted ST-dotnet-jspi pack}"
: "${CELESTE_EMSDK:?Emscripten 4.0.23 SDK root}"
: "${CELESTE_NODE:?Node executable}"
export DOTNET_ROOT="$(dirname "$CELESTE_DOTNET")"
export DOTNET_ROLL_FORWARD=Major
"$CELESTE_DOTNET" publish loader -c Release -m:1 --nodereuse:false \
  -p:CelesteSingleThread=true \
  -p:CelesteRuntimePack="$CELESTE_RUNTIME_PACK" \
  -p:CelesteEmsdk="$CELESTE_EMSDK" -p:CelesteNode="$CELESTE_NODE" \
  -p:EmscriptenSdkToolsPath="$CELESTE_EMSDK/upstream/" \
  -p:EmscriptenUpstreamBinPath="$CELESTE_EMSDK/upstream/bin/" \
  -p:EmscriptenUpstreamEmscriptenPath="$CELESTE_EMSDK/upstream/emscripten/" \
  -p:EmscriptenNodeToolsPath="$CELESTE_NODE" \
  -p:WasmClang="$CELESTE_EMSDK/upstream/emscripten/emcc" \
  -p:WasmCachePath="$CELESTE_EMSDK/upstream/emscripten/cache/" "$@"
