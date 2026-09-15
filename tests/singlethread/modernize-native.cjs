// Compatibility for the pinned .NET glue when linked by Emscripten 4.0.23.
const fs = require('node:fs');
const file = process.argv[2];
let source = fs.readFileSync(file, 'utf8');
function beforePreInit(text) {
  const pattern = /^[ \t]*if \(Module\[['"]preInit['"]\]\) \{/m;
  if (!pattern.test(source)) throw new Error('Native preInit block missing');
  source = source.replace(pattern, match => text + '\n' + match);
}
const marker = 'var Module = moduleArg;';
if (!source.includes(marker)) throw new Error('Unsupported native glue format');
if (!source.includes('celesteLegacyReady')) {
  source = source.replace(marker, `${marker}
var _scriptDir, __dirname, createDotnetRuntime;
// .NET 10 expects Module.ready before it configures the Emscripten lifecycle.
// Emscripten 4 returns its ready promise from the factory instead.
var celesteLegacyResolve, celesteLegacyReject;
var celesteLegacyReady = new Promise((resolve, reject) => {
  celesteLegacyResolve = resolve;
  celesteLegacyReject = reject;
});
Module.ready = celesteLegacyReady;
var celestePriorPostRun = Module.postRun || [];
Module.postRun = [
  ...(Array.isArray(celestePriorPostRun) ? celestePriorPostRun : [celestePriorPostRun]),
  () => celesteLegacyResolve()
];
var celestePriorAbort = Module.onAbort;
Module.onAbort = reason => {
  celesteLegacyReject(reason);
  if (celestePriorAbort) celestePriorAbort(reason);
};
`);
}
if (!source.includes('// celeste early exports')) {
  const exports = source.match(/\/\/ Begin runtime exports[\s\S]*?\/\/ End runtime exports/);
  if (!exports) throw new Error('Runtime export block missing');
  beforePreInit('// celeste early exports\n' + exports[0]);
}
if (!source.includes('// celeste deferred native exports')) {
  const exports = [...source.matchAll(/Module\['([^']+)'\] = wasmExports\['([^']+)'\];/g)];
  const wrappers = exports.map(([, name, native]) =>
    `Module[${JSON.stringify(name)}] = (...args) => wasmExports[${JSON.stringify(native)}](...args);`
  ).join('\n');
  beforePreInit('// celeste deferred native exports\n' + wrappers);
}
source = source.replace(/^(\s*)(HEAP(?:U?8|U?16|U?32|F32|F64|64|U64)) = new /gm,
  (_, space, heap) => `${space}${heap} = Module[${JSON.stringify(heap)}] = new `);
source = source.replace("    Module['wasmExports'] = wasmExports;", "    Module['wasmExports'] = instance.exports;");
if (!source.includes('// celeste returned module lifecycle')) {
  source = source.replace('createDotnetRuntime = Module = moduleArg(Module);', `createDotnetRuntime = Module = moduleArg(Module);
// celeste returned module lifecycle
Module.ready = celesteLegacyReady;
var returnedPostRun = Module.postRun || [];
Module.postRun = [...(Array.isArray(returnedPostRun) ? returnedPostRun : [returnedPostRun]), () => celesteLegacyResolve()];
`);
}
fs.writeFileSync(file, source);
