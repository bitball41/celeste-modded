#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
: "${CELESTE_EMSDK:?Set Emscripten SDK root}"
mkdir -p .build-tools statics/singlethread
release=https://github.com/r58Playz/FNA-WASM-Build/releases/download/5ecb4294-8cbb-42f1-a73b-476bb46ddbb6
for name in SDL3.a FNA3D.a FAudio.a libmojoshader.a liba.o hot_reload_detour.o libcrypto.a; do
  if [ ! -s "statics/singlethread/$name" ]; then
    curl --fail --location --retry 3 "$release/ST-$name" -o "statics/singlethread/$name.tmp"
    mv "statics/singlethread/$name.tmp" "statics/singlethread/$name"
  fi
done
if [ ! -f statics/singlethread/runtime/runtimes/browser-wasm/native/libmonosgen-2.0.a ]; then
  curl --fail --location --retry 3 "$release/ST-dotnet-jspi.zip" -o .build-tools/runtime.zip
  unzip -qo .build-tools/runtime.zip -d statics/singlethread/runtime
fi
if [ ! -d .build-tools/lua-5.4.8 ]; then
  curl --fail --location --retry 3 https://www.lua.org/ftp/lua-5.4.8.tar.gz -o .build-tools/lua.tar.gz
  tar --no-same-owner -xzf .build-tools/lua.tar.gz -C .build-tools
fi
make -C .build-tools/lua-5.4.8/src liblua.a \
  CC="$CELESTE_EMSDK/upstream/emscripten/emcc" \
  AR="$CELESTE_EMSDK/upstream/emscripten/emar rcu" \
  RANLIB="$CELESTE_EMSDK/upstream/emscripten/emranlib" \
  MYCFLAGS='-O2 -fwasm-exceptions -sSUPPORT_LONGJMP=wasm'
cp .build-tools/lua-5.4.8/src/liblua.a statics/singlethread/lua54.a
